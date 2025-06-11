import { getRoom, getRoomPlayers } from '../roomService.js';

// Game states
const GAME_STATES = {
    WAITING: 'waiting',
    SONG_SELECTION: 'song_selection',
    STARTING: 'starting',
    PLAYING: 'playing',
    FINISHED: 'finished',
    RESULTS: 'results',
};

export const handleGameEvents = (socket, io) => {
    // Song selection from client
    socket.on('game:select_song', (data) => {
        const { roomCode, selectedSong } = data;

        if (!roomCode || !selectedSong) {
            socket.emit('game:error', {
                message: 'Room code and selected song are required',
            });
            return;
        }

        const room = getRoom(roomCode);
        if (!room) {
            socket.emit('game:error', { message: 'Room not found' });
            return;
        }

        // Update room with selected song and state
        room.selectedSong = selectedSong;
        room.gameState = GAME_STATES.STARTING;

        // Notify all clients about song selection (but don't start automatically)
        io.to(roomCode).emit('game:song_selected', {
            song: selectedSong,
            roomCode,
            gameState: GAME_STATES.STARTING,
        });

        console.log(
            `Song "${selectedSong.title}" selected for room ${roomCode}`
        );
    });

    // Start game countdown
    socket.on('game:start', (data) => {
        const { roomCode } = data;

        if (!roomCode) {
            socket.emit('game:error', { message: 'Room code is required' });
            return;
        }

        const room = getRoom(roomCode);
        if (!room) {
            socket.emit('game:error', { message: 'Room not found' });
            return;
        }

        if (room.gameState !== GAME_STATES.STARTING) {
            socket.emit('game:error', {
                message: 'Game cannot be started in current state',
            });
            return;
        }

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
                room.endTime = room.startTime + room.selectedSong.duration;

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

                console.log(`Game started in room ${roomCode}`);
            }
        }, 1000);
    });

    // Auto-start game when all players are ready
    socket.on('game:auto_start', (data) => {
        const { roomCode } = data;

        if (!roomCode) {
            socket.emit('game:error', { message: 'Room code is required' });
            return;
        }

        const room = getRoom(roomCode);
        if (!room || !room.selectedSong) {
            socket.emit('game:error', {
                message: 'Room not found or no song selected',
            });
            return;
        }

        // Auto-start the countdown
        setTimeout(() => {
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
                    room.endTime = room.startTime + room.selectedSong.duration;

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

                    console.log(`Game auto-started in room ${roomCode}`);
                }
            }, 1000);
        }, 2000); // 2 second delay before countdown
    });

    // Get current game state
    socket.on('game:get_state', (data) => {
        const { roomCode } = data;

        if (!roomCode) {
            socket.emit('game:error', { message: 'Room code is required' });
            return;
        }

        const room = getRoom(roomCode);

        if (!room) {
            socket.emit('game:error', { message: 'Room not found' });
            return;
        }

        socket.emit('game:state', {
            roomCode,
            gameState: room.gameState || GAME_STATES.WAITING,
            selectedSong: room.selectedSong || null,
            players: getRoomPlayers(roomCode),
            room: {
                code: room.code,
                status: room.status,
                playerCount: room.players.length,
            },
        });
    });

    // Handle disconnection cleanup
    socket.on('disconnect', () => {
        console.log('Player disconnected from game');
    });
};

// Helper function to end the game
function endGame(roomCode, io) {
    const room = getRoom(roomCode);
    if (!room) return;

    room.gameState = GAME_STATES.FINISHED;
    room.endTime = Date.now();

    const players = getRoomPlayers(roomCode);

    console.log('Players data before results:', players);

    // Calculate final results using actual player scores from user service
    const results = {
        roomCode,
        song: room.selectedSong,
        players: players.map((player) => ({
            id: player.id,
            username: player.username,
            finalScore: player.score || 0, // Use the actual score from user service
            ranking: 0, // Will be set after sorting
        })),
    };

    console.log('Results before sorting:', results);

    // Sort players by score and assign rankings
    results.players.sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0));
    results.players.forEach((player, index) => {
        player.ranking = index + 1;
    });

    // Update room state
    room.gameState = GAME_STATES.RESULTS;
    room.results = results;

    console.log('Final results:', results);

    // Notify all clients
    io.to(roomCode).emit('game:finished', results);

    console.log(`Game finished in room ${roomCode}`, results);
}
