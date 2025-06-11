import {
    joinRoom,
    updatePlayerScore,
    canStartGame,
    getRoom,
    getRoomPlayers,
} from '../roomService.js';
import { getUser, setUserReady } from '../userService.js';

// Import game states
const GAME_STATES = {
    WAITING: 'waiting',
    SONG_SELECTION: 'song_selection',
    STARTING: 'starting',
    PLAYING: 'playing',
    FINISHED: 'finished',
    RESULTS: 'results',
};

// Helper function to end the game
function endGame(roomCode, io) {
    const room = getRoom(roomCode);
    if (!room) return;

    room.gameState = GAME_STATES.FINISHED;
    room.endTime = Date.now();

    const players = getRoomPlayers(roomCode);

    // Calculate final results
    const results = {
        roomCode,
        song: room.selectedSong,
        players: players.map((player) => ({
            ...player,
            finalScore: player.score || 0,
            ranking: 0,
        })),
    };

    // Sort players by score and assign rankings
    results.players.sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0));
    results.players.forEach((player, index) => {
        player.ranking = index + 1;
    });

    // Update room state
    room.gameState = GAME_STATES.RESULTS;
    room.results = results;

    // Notify all clients
    io.to(roomCode).emit('game:finished', results);

    console.log(`Game finished in room ${roomCode}`);
}

export const handlePlayerEvents = (socket, io) => {
    socket.on('player:join', (data) => {
        const { roomCode, username } = data;

        if (!roomCode || !username) {
            socket.emit('player:error', {
                message: 'Room code and username are required',
            });

            return;
        }

        const payload = joinRoom(roomCode, socket.id, username);

        if (payload.success === false) {
            socket.emit('player:error', {
                message: payload.message || 'Failed to join room',
            });
            return;
        }

        const user = payload.user;

        socket.join(roomCode);
        io.to(roomCode).emit('player:joined', {
            playerId: user.id,
            username: user.username,
            roomCode: user.roomCode,
        });

        console.log(`Player ${username} joined room ${roomCode}`);
    });

    socket.on('player:input', (data) => {
        const { roomCode, lane, timing } = data;

        if (!roomCode || lane === undefined) {
            socket.emit('player:error', {
                message: 'Room code and lane are required',
            });
            return;
        }

        const user = getUser(socket.id);

        if (!user) {
            socket.emit('player:error', {
                message: 'User not found',
            });
            return;
        }

        // Broadcast the lane input to the game screen and other players
        io.to(roomCode).emit('player:input', {
            playerId: socket.id,
            username: user.username,
            lane: lane,
            timing: timing || Date.now(),
        });

        console.log(
            `Player ${user.username} pressed lane ${lane} in room ${roomCode}`
        );
    });

    socket.on('player:score_update', (data) => {
        const { roomCode, playerId, score, points } = data;

        if (!roomCode || score === undefined) {
            socket.emit('player:error', {
                message: 'Room code and score are required',
            });
            return;
        }

        // Use the provided playerId or fallback to socket.id
        const targetPlayerId = playerId || socket.id;

        // Get user by the target player ID
        const user = getUser(targetPlayerId);

        if (!user) {
            console.log(`User not found for player ID: ${targetPlayerId}`);
            // Don't return error since this might be a legitimate update from GameScreen
            return;
        }

        console.log(`Updating score for ${user.username}: ${score}`);

        const result = updatePlayerScore(targetPlayerId, score);

        if (!result.success) {
            socket.emit('player:error', {
                message: result.message,
            });
            return;
        }

        // Broadcast score update to all players in the room
        io.to(roomCode).emit('player:score_updated', {
            playerId: targetPlayerId,
            username: user.username,
            score: score,
            points: points || 0,
        });

        console.log(
            `Player ${user.username} score updated to ${score} in room ${roomCode}`
        );
    });

    socket.on('player:set_ready', (data) => {
        const { roomCode, username } = data;

        if (!roomCode || !username) {
            socket.emit('player:error', {
                message: 'Room code and username are required',
            });

            return;
        }

        let user = getUser(socket.id);

        if (!user) {
            socket.emit('player:error', {
                message: 'User not found',
            });
            return;
        }

        user = setUserReady(socket.id, data.ready);

        // Also update ready state in room data
        const room = getRoom(roomCode);
        if (room) {
            const roomPlayer = room.players.find((p) => p.id === socket.id);
            if (roomPlayer) {
                roomPlayer.ready = data.ready;
            }
        }

        io.to(roomCode).emit('player:status', {
            playerId: socket.id,
            username: user.username,
            ready: data.ready,
        });

        console.log(
            `Player ${user.username} ready status: ${data.ready} in room ${roomCode}`
        );

        // Check if all players are ready and song is selected
        if (data.ready && room && room.selectedSong && canStartGame(roomCode)) {
            const allPlayersReady = room.players.every((p) => p.ready);

            if (allPlayersReady) {
                io.to(roomCode).emit('game:can_start', {
                    roomCode: roomCode,
                });

                // Auto-trigger game start after brief delay
                setTimeout(() => {
                    // Start countdown
                    let countdown = 3;

                    const countdownInterval = setInterval(() => {
                        io.to(roomCode).emit('game:countdown', {
                            count: countdown,
                            roomCode,
                        });

                        countdown--;

                        if (countdown < 0) {
                            clearInterval(countdownInterval);

                            // Start the actual game
                            room.gameState = GAME_STATES.PLAYING;
                            room.startTime = Date.now();
                            room.endTime =
                                room.startTime + room.selectedSong.duration;

                            io.to(roomCode).emit('game:started', {
                                roomCode,
                                gameState: GAME_STATES.PLAYING,
                                selectedSong: room.selectedSong,
                                startTime: room.startTime,
                                endTime: room.endTime,
                            });

                            // Set game end timer
                            setTimeout(() => {
                                endGame(roomCode, io);
                            }, room.selectedSong.duration);

                            console.log(
                                `Game started after all players ready in room ${roomCode}`
                            );
                        }
                    }, 1000);
                }, 2000);
            }
        }
    });

    socket.on('player:status', (data) => {
        const { roomCode, username } = data;

        if (!roomCode || !username) {
            socket.emit('player:error', {
                message: 'Room code and username are required',
            });

            return;
        }

        const user = getUser(socket.id);

        if (!user) {
            socket.emit('player:error', {
                message: 'User not found',
            });
            return;
        }

        io.to(roomCode).emit('player:status', {
            playerId: user.id,
            username: user.username,
            ready: user.ready,
        });
    });
};
