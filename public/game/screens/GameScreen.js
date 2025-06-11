import { navigateTo, socket } from '../main.js';

export function renderGameScreen(container, data) {
    const { selectedSong, players, roomCode, gameAudio } = data;

    let gameState = 'waiting';
    let gameStartTime = null;
    let gameEndTime = null;
    let currentTime = 0;
    let animationId = null;
    let songAudio = gameAudio || null;

    // Player data tracking
    let playerScores = {};
    let playerStats = {};

    // Canvas and game objects
    let canvases = {};
    let contexts = {};
    let notes = {};
    let hitLines = {};

    // Game constants
    const NOTE_SPEED = 300; // pixels per second
    const NOTE_HEIGHT = 40;
    const NOTE_WIDTH_RATIO = 0.8;
    const HIT_LINE_HEIGHT = 100; // from bottom
    const HIT_TOLERANCE = 50; // milliseconds

    // Color scheme
    const colors = {
        background: '#1a1a1a',
        lane: '#2d1b1b',
        laneBorder: '#6b3535',
        note: '#8b4a4a',
        noteBorder: '#a85555',
        hitLine: '#d49b9b',
        hitLineShadow: '#a85555',
    };

    container.innerHTML = `
        <main class="game-screen">
            <div class="game-header">
                <div class="game-info">
                    <h2 class="song-title">${selectedSong.title}</h2>
                    <div class="game-progress">
                        <span id="current-time">0:00</span> / <span id="total-time">${formatTime(
                            selectedSong.duration
                        )}</span>
                    </div>
                </div>
                <div class="game-stats">
                    <div class="stat-item">
                        <div class="stat-value" id="total-notes">${
                            selectedSong.notes.length
                        }</div>
                        <div class="stat-label">Notas</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value" id="game-bpm">${
                            selectedSong.bpm
                        }</div>
                        <div class="stat-label">BPM</div>
                    </div>
                </div>
            </div>
            
            <div class="game-content">
                <div class="game-area">
                    <div class="players-container">
                        ${players
                            .map(
                                (player, index) => `
                            <div class="player-game-area" data-player-id="${
                                player.playerId || player.id
                            }">
                                <div class="player-header">
                                    <h3 class="player-name">${
                                        player.username
                                    }</h3>
                                    <div class="player-info">
                                        <div class="player-stats">
                                            <span class="player-score" id="score-${
                                                player.playerId || player.id
                                            }">0</span>
                                            <span class="player-combo" id="combo-${
                                                player.playerId || player.id
                                            }">0x</span>
                                        </div>
                                    </div>
                                </div>
                                <canvas 
                                    id="game-canvas-${
                                        player.playerId || player.id
                                    }" 
                                    class="game-canvas"
                                    width="400" 
                                    height="600">
                                </canvas>
                            </div>
                        `
                            )
                            .join('')}
                    </div>
                </div>
            </div>
        </main>
    `;

    // Initialize game data
    function initializeGame() {
        players.forEach((player) => {
            const playerId = player.playerId || player.id;
            playerScores[playerId] = 0;
            playerStats[playerId] = {
                score: 0,
                combo: 0,
                hits: { perfect: 0, good: 0, miss: 0 },
            };

            // Initialize canvas
            const canvas = document.getElementById(`game-canvas-${playerId}`);
            if (!canvas) {
                console.error(`Canvas not found for player ${playerId}`);
                return;
            }

            const ctx = canvas.getContext('2d');
            canvases[playerId] = canvas;
            contexts[playerId] = ctx;
            notes[playerId] = [];

            // Set canvas size
            canvas.width = 400;
            canvas.height = 600;

            // Initialize hit line position
            hitLines[playerId] = canvas.height - HIT_LINE_HEIGHT;
        });
    }

    // Format time helper
    function formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    // Create note object
    function createNote(time, lane, playerId) {
        const canvas = canvases[playerId];
        const laneWidth = canvas.width / selectedSong.lanes;

        return {
            time: time,
            lane: lane,
            x: lane * laneWidth + (laneWidth * (1 - NOTE_WIDTH_RATIO)) / 2,
            y: -NOTE_HEIGHT,
            width: laneWidth * NOTE_WIDTH_RATIO,
            height: NOTE_HEIGHT,
            hit: false,
            missed: false,
            playerId: playerId,
        };
    }

    // Draw lane backgrounds
    function drawLanes(ctx, canvas) {
        const laneWidth = canvas.width / selectedSong.lanes;

        for (let i = 0; i < selectedSong.lanes; i++) {
            // Lane background
            ctx.fillStyle = colors.lane;
            ctx.fillRect(i * laneWidth, 0, laneWidth, canvas.height);

            // Lane border
            if (i > 0) {
                ctx.strokeStyle = colors.laneBorder;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(i * laneWidth, 0);
                ctx.lineTo(i * laneWidth, canvas.height);
                ctx.stroke();
            }
        }
    }

    // Draw hit line
    function drawHitLine(ctx, canvas, playerId) {
        const y = hitLines[playerId];

        // Hit line shadow/glow effect
        ctx.shadowColor = colors.hitLineShadow;
        ctx.shadowBlur = 10;
        ctx.strokeStyle = colors.hitLine;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
        ctx.shadowBlur = 0;
    }

    // Draw note
    function drawNote(ctx, note) {
        // Note shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetY = 2;

        // Note body
        ctx.fillStyle = note.hit
            ? '#5a8b5a'
            : note.missed
            ? '#8b5a5a'
            : colors.note;
        ctx.fillRect(note.x, note.y, note.width, note.height);

        // Note border
        ctx.strokeStyle = note.hit
            ? '#6b8b6b'
            : note.missed
            ? '#8b6b6b'
            : colors.noteBorder;
        ctx.lineWidth = 2;
        ctx.strokeRect(note.x, note.y, note.width, note.height);

        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;
    }

    // Update note positions
    function updateNotes(deltaTime) {
        players.forEach((player) => {
            const playerId = player.playerId || player.id;
            const canvas = canvases[playerId];

            if (!notes[playerId] || !canvas) {
                return;
            }

            notes[playerId].forEach((note) => {
                if (!note.hit && !note.missed) {
                    note.y += NOTE_SPEED * (deltaTime / 1000);

                    // Check if note passed hit line (miss)
                    if (note.y > hitLines[playerId] + HIT_TOLERANCE) {
                        note.missed = true;
                        playerStats[playerId].combo = 0;
                        playerStats[playerId].hits.miss++;
                        updatePlayerUI(playerId);
                    }
                }
            });

            // Remove notes that are off screen
            notes[playerId] = notes[playerId].filter(
                (note) => note.y < canvas.height + NOTE_HEIGHT
            );
        });
    }

    // Spawn notes based on song timing
    function spawnNotes() {
        if (!gameStartTime) return;

        const gameElapsed = Math.max(0, currentTime - gameStartTime);

        selectedSong.notes.forEach((noteData) => {
            const noteTime = noteData.time + (selectedSong.offset || 0);
            const shouldSpawn = gameElapsed >= noteTime - 2000; // Spawn 2 seconds ahead

            players.forEach((player) => {
                const playerId = player.playerId || player.id;

                if (!notes[playerId]) {
                    console.warn(
                        `Notes array not initialized for player ${playerId}`
                    );
                    return;
                }

                const alreadySpawned = notes[playerId].some(
                    (note) =>
                        Math.abs(note.time - noteData.time) < 50 &&
                        note.lane === noteData.lane
                );

                if (shouldSpawn && !alreadySpawned) {
                    notes[playerId].push(
                        createNote(noteData.time, noteData.lane, playerId)
                    );
                }
            });
        });
    }

    // Handle player input
    function handlePlayerInput(inputData) {
        const { playerId, lane, timing } = inputData;

        // Check if we have notes for this player
        if (!notes[playerId] || !canvases[playerId]) {
            console.warn(
                `No notes array or canvas found for player ${playerId}`
            );
            return;
        }

        const canvas = canvases[playerId];
        const hitLineY = hitLines[playerId];

        // Find notes in hit range for this lane
        const hitCandidates = notes[playerId].filter(
            (note) =>
                note.lane === lane &&
                !note.hit &&
                !note.missed &&
                Math.abs(note.y + note.height / 2 - hitLineY) < HIT_TOLERANCE
        );

        if (hitCandidates.length > 0) {
            // Hit the closest note
            const closestNote = hitCandidates.reduce((closest, note) =>
                Math.abs(note.y + note.height / 2 - hitLineY) <
                Math.abs(closest.y + closest.height / 2 - hitLineY)
                    ? note
                    : closest
            );

            closestNote.hit = true;

            // Calculate hit quality based on timing
            const timingDiff = Math.abs(
                closestNote.y + closestNote.height / 2 - hitLineY
            );
            let hitType, points;

            if (timingDiff < 20) {
                hitType = 'perfect';
                points = 100;
            } else if (timingDiff < 35) {
                hitType = 'good';
                points = 50;
            } else {
                hitType = 'ok';
                points = 25;
            }

            // Update player stats
            playerStats[playerId].combo++;
            playerStats[playerId].hits[hitType] =
                (playerStats[playerId].hits[hitType] || 0) + 1;
            playerStats[playerId].score +=
                points *
                Math.max(1, Math.floor(playerStats[playerId].combo / 10));

            console.log(
                `Player ${playerId} hit note! New score: ${playerStats[playerId].score}`
            );

            // Send score update directly to server from GameScreen
            socket.emit('player:score_update', {
                roomCode,
                playerId: playerId,
                score: playerStats[playerId].score,
                points: points,
            });

            // Also send hit result to the mobile device for feedback
            socket.emit('player:hit_result', {
                roomCode,
                playerId: playerId,
                score: playerStats[playerId].score,
                points: points,
                hitType: hitType,
            });

            updatePlayerUI(playerId);
        }
    }

    // Update player UI
    function updatePlayerUI(playerId) {
        const scoreElement = document.getElementById(`score-${playerId}`);
        const comboElement = document.getElementById(`combo-${playerId}`);

        if (scoreElement) {
            scoreElement.textContent = playerStats[playerId].score;
        }
        if (comboElement) {
            comboElement.textContent = `${playerStats[playerId].combo}x`;
        }
    }

    // Main game loop
    function gameLoop(timestamp) {
        if (!gameStartTime) return;

        currentTime = Date.now(); // Use actual time instead of requestAnimationFrame timestamp
        const deltaTime = 16; // Assume 60fps
        const gameElapsed = Math.max(0, currentTime - gameStartTime); // Ensure non-negative

        // Update time display
        document.getElementById('current-time').textContent =
            formatTime(gameElapsed);

        // Check if game should end
        if (gameEndTime && currentTime >= gameEndTime) {
            endGame();
            return;
        }

        // Spawn and update notes
        spawnNotes();
        updateNotes(deltaTime);

        // Render each player's canvas
        players.forEach((player) => {
            const playerId = player.playerId || player.id;
            const canvas = canvases[playerId];
            const ctx = contexts[playerId];

            if (!canvas || !ctx || !notes[playerId]) {
                return;
            }

            // Clear canvas
            ctx.fillStyle = colors.background;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw lanes
            drawLanes(ctx, canvas);

            // Draw hit line
            drawHitLine(ctx, canvas, playerId);

            // Draw notes
            notes[playerId].forEach((note) => drawNote(ctx, note));
        });

        animationId = requestAnimationFrame(gameLoop);
    }

    // Start game
    function startGame(startTime, endTime) {
        gameState = 'playing';
        gameStartTime = startTime;
        gameEndTime = endTime;

        console.log('Game started at:', new Date(startTime));
        console.log('Game will end at:', new Date(endTime));

        // Start playing the song audio
        if (songAudio) {
            songAudio.currentTime = 0;
            songAudio.play().catch((error) => {
                console.error('Error playing song audio:', error);
            });
        } else {
            // Fallback: create new audio if not passed
            songAudio = new Audio(selectedSong.audio);
            songAudio.currentTime = 0;
            songAudio.play().catch((error) => {
                console.error('Error playing song audio:', error);
            });
        }

        animationId = requestAnimationFrame(gameLoop);
    }

    // End game
    function endGame() {
        gameState = 'finished';

        // Stop the audio
        if (songAudio) {
            songAudio.pause();
            songAudio.currentTime = 0;
        }

        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }

        // Collect final scores from DOM and player stats
        const finalResults = {
            roomCode,
            song: selectedSong,
            players: players.map((player, index) => {
                const playerId = player.playerId || player.id;
                const scoreElement = document.getElementById(
                    `score-${playerId}`
                );
                const finalScore = scoreElement
                    ? parseInt(scoreElement.textContent) || 0
                    : playerStats[playerId]?.score || 0;

                return {
                    id: playerId,
                    username: player.username,
                    finalScore: finalScore,
                    ranking: 0, // Will be set after sorting
                };
            }),
        };

        // Sort players by score and assign rankings
        finalResults.players.sort(
            (a, b) => (b.finalScore || 0) - (a.finalScore || 0)
        );
        finalResults.players.forEach((player, index) => {
            player.ranking = index + 1;
        });

        console.log('Game ended, final results:', finalResults);

        // Send the results immediately to the game screen
        setTimeout(() => {
            navigateTo('/scoreboard', {
                roomCode,
                results: finalResults,
            });
        }, 2000);
    }

    // Socket event listeners
    socket.on('game:started', (data) => {
        if (data.roomCode === roomCode) {
            startGame(data.startTime, data.endTime);
        }
    });

    socket.on('player:input', (data) => {
        // Handle input from all players (including our own for single-screen mode)
        handlePlayerInput(data);
    });

    socket.on('player:status', (data) => {
        // Update ready status in real-time
        const readyElement = document.getElementById(`ready-${data.playerId}`);
        if (readyElement) {
            readyElement.className = `player-ready-status ${
                data.ready ? 'ready' : 'waiting'
            }`;
            readyElement.textContent = data.ready ? '✓ Listo' : 'Esperando';
        }
    });

    socket.on('player:score_updated', (data) => {
        if (playerStats[data.playerId]) {
            playerStats[data.playerId].score = data.score;
            updatePlayerUI(data.playerId);
        }
    });

    socket.on('game:finished', (data) => {
        if (data.roomCode === roomCode) {
            // Use server data if available, otherwise use local results
            const finalResults =
                data.players && data.players.length > 0
                    ? data
                    : {
                          roomCode,
                          song: selectedSong,
                          players: players.map((player) => {
                              const playerId = player.playerId || player.id;
                              const scoreElement = document.getElementById(
                                  `score-${playerId}`
                              );
                              const finalScore = scoreElement
                                  ? parseInt(scoreElement.textContent) || 0
                                  : playerStats[playerId]?.score || 0;

                              return {
                                  id: playerId,
                                  username: player.username,
                                  finalScore: finalScore,
                                  ranking: 0,
                              };
                          }),
                      };

            // Sort if needed
            if (finalResults.players) {
                finalResults.players.sort(
                    (a, b) => (b.finalScore || 0) - (a.finalScore || 0)
                );
                finalResults.players.forEach((player, index) => {
                    player.ranking = index + 1;
                });
            }

            endGame();
            setTimeout(() => {
                navigateTo('/scoreboard', {
                    roomCode,
                    results: finalResults,
                });
            }, 2000);
        }
    });

    // Cleanup function
    const cleanup = () => {
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
        if (songAudio) {
            songAudio.pause();
            songAudio.currentTime = 0;
        }
        socket.off('game:started');
        socket.off('player:input');
        socket.off('player:status');
        socket.off('player:score_updated');
        socket.off('game:finished');
    };

    // Initialize the game
    initializeGame();

    // Store cleanup function
    container.cleanup = cleanup;
}
