import { navigateTo, socket } from '../main.js';

export function renderControllerScreen(container, data) {
    const { roomCode, username, playerId } = data;

    let selectedSong = null;
    let isReady = false;
    let gameState = 'waiting';

    // Initial loading state
    container.innerHTML = `
        <div class="controller-screen">
            <div class="controller-header">
                <h1>Rock and Sync</h1>
                <div class="player-info">
                    <span class="username">${username}</span>
                    <span class="room-code">Sala: ${roomCode}</span>
                </div>
            </div>
            
            <div class="controller-content" id="controller-content">
                <div class="waiting-state">
                    <div class="loading-spinner"></div>
                    <h2>Esperando selección de canción...</h2>
                    <p>El host está seleccionando una canción para jugar</p>
                </div>
            </div>
        </div>
    `;

    // Function to render song information and controls
    function renderSongInfo() {
        const controllerContent = document.getElementById('controller-content');

        controllerContent.innerHTML = `
            <div class="song-info-state">
                <div class="song-details">
                    <h2>Canción Seleccionada</h2>
                    <div class="song-card">
                        <h3 class="song-title">${selectedSong.title}</h3>
                        <div class="song-meta">
                            <span class="bpm">${selectedSong.bpm} BPM</span>
                            <span class="lanes">${
                                selectedSong.lanes
                            } Líneas</span>
                        </div>
                    </div>
                </div>

                <div class="controls-preview">
                    <h3>Tus Controles</h3>
                    <div class="controls-grid" id="controls-grid">
                        ${generateControlsPreview(selectedSong.lanes)}
                    </div>
                    <p class="controls-hint">Presiona los botones cuando aparezcan las notas</p>
                </div>

                <div class="ready-section">
                    <button id="ready-btn" class="btn ready-btn ${
                        isReady ? 'ready' : ''
                    }" 
                            ${isReady ? 'disabled' : ''}>
                        ${isReady ? '✓ Listo!' : 'Marcar como Listo'}
                    </button>
                    
                    <div class="status-message" id="status-message">
                        ${
                            isReady
                                ? 'Esperando a otros jugadores...'
                                : 'Presiona cuando estés listo para jugar'
                        }
                    </div>
                </div>
            </div>
        `;

        // Add ready button functionality
        const readyBtn = document.getElementById('ready-btn');
        readyBtn.addEventListener('click', handleReadyClick);
    }

    // Function to generate controls preview based on lanes
    function generateControlsPreview(lanes) {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f7b731', '#5f27cd'];
        let controlsHTML = '';

        for (let i = 0; i < lanes; i++) {
            controlsHTML += `
                <div class="control-button preview" style="background-color: ${
                    colors[i % colors.length]
                }">
                    Línea ${i + 1}
                </div>
            `;
        }

        return controlsHTML;
    }

    // Function to render countdown state
    function renderCountdown(count) {
        const controllerContent = document.getElementById('controller-content');

        controllerContent.innerHTML = `
            <div class="countdown-state">
                <div class="countdown-circle">
                    <span class="countdown-number">${count}</span>
                </div>
                <h2>¡El juego está comenzando!</h2>
                <p>Prepárate para tocar</p>
            </div>
        `;
    }

    // Function to render game controls
    function renderGameControls() {
        const controllerContent = document.getElementById('controller-content');
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f7b731', '#5f27cd'];

        controllerContent.innerHTML = `
            <div class="game-controls-state">
                <div class="game-info">
                    <div class="song-playing">
                        <span class="now-playing">♪ ${selectedSong.title}</span>
                    </div>
                </div>
                
                <div class="controls-grid active" id="active-controls">
                    ${Array.from(
                        { length: selectedSong.lanes },
                        (_, i) => `
                        <button class="control-button active" 
                                data-lane="${i}"
                                style="background-color: ${
                                    colors[i % colors.length]
                                }">
                            <span class="lane-number">${i + 1}</span>
                        </button>
                    `
                    ).join('')}
                </div>
                
                <div class="game-feedback" id="game-feedback">
                    <div class="score-display">Puntuación: <span id="score">0</span></div>
                    <div class="combo-display">Combo: <span id="combo">0</span></div>
                </div>
            </div>
        `;

        // Add touch controls for game
        addGameControlListeners();
    }

    // Function to add game control event listeners
    function addGameControlListeners() {
        const controlButtons = document.querySelectorAll(
            '.control-button.active'
        );

        controlButtons.forEach((button) => {
            const lane = parseInt(button.dataset.lane);

            // Touch events for mobile
            button.addEventListener('touchstart', (e) => {
                e.preventDefault();
                handleLanePress(lane, button);
            });

            button.addEventListener('touchend', (e) => {
                e.preventDefault();
                handleLaneRelease(button);
            });

            // Mouse events for testing
            button.addEventListener('mousedown', (e) => {
                e.preventDefault();
                handleLanePress(lane, button);
            });

            button.addEventListener('mouseup', (e) => {
                e.preventDefault();
                handleLaneRelease(button);
            });
        });
    }

    // Function to handle lane press
    function handleLanePress(lane, buttonElement) {
        buttonElement.classList.add('pressed');

        // Send input to server
        socket.emit('player:input', {
            roomCode,
            lane,
            timing: Date.now(),
        });

        // Visual feedback
        buttonElement.style.transform = 'scale(0.95)';
    }

    // Function to handle lane release
    function handleLaneRelease(buttonElement) {
        buttonElement.classList.remove('pressed');
        buttonElement.style.transform = 'scale(1)';
    }

    // Function to handle ready button click
    function handleReadyClick() {
        if (isReady) return;

        isReady = true;

        // Update UI
        const readyBtn = document.getElementById('ready-btn');
        const statusMessage = document.getElementById('status-message');

        readyBtn.textContent = '✓ Listo!';
        readyBtn.classList.add('ready');
        readyBtn.disabled = true;
        statusMessage.textContent = 'Esperando a otros jugadores...';

        // Send ready status to server using existing event
        socket.emit('player:set_ready', {
            roomCode,
            username,
            ready: true,
        });
    }

    // Socket event listeners using existing events
    socket.on('game:song_selected', (data) => {
        if (data.roomCode === roomCode) {
            selectedSong = data.song;
            gameState = data.gameState;
            renderSongInfo();
        }
    });

    socket.on('game:countdown', (data) => {
        if (data.roomCode === roomCode) {
            renderCountdown(data.count);
        }
    });

    socket.on('game:started', (data) => {
        if (data.roomCode === roomCode) {
            gameState = 'playing';
            renderGameControls();
        }
    });

    // Add a new socket listener for when the game processes a hit
    socket.on('player:hit_result', (data) => {
        if (data.playerId === playerId) {
            // Update local score display
            const newScore = data.score;

            // Update score display
            const scoreElement = document.getElementById('score');
            if (scoreElement) scoreElement.textContent = newScore;

            // Show hit feedback (no need to send score_update since GameScreen already did)
            showHitFeedback(data.hitType || 'hit', data.points);
        }
    });

    socket.on('player:score_updated', (data) => {
        if (data.playerId === playerId) {
            // Update score display from server confirmation
            const scoreElement = document.getElementById('score');
            if (scoreElement) scoreElement.textContent = data.score;

            // Show hit feedback
            showHitFeedback('hit', data.points);
        }
    });

    socket.on('game:finished', (data) => {
        if (data.roomCode === roomCode) {
            // Simply navigate to results with basic data
            navigateTo('/results', {
                roomCode,
                username,
                playerId,
            });
        }
    });

    socket.on('game:can_start', (data) => {
        if (data.roomCode === roomCode) {
            // Game can start, show waiting message
            const statusMessage = document.getElementById('status-message');
            if (statusMessage) {
                statusMessage.textContent =
                    'Todos listos! El juego comenzará pronto...';
            }
        }
    });

    // Function to show hit feedback
    function showHitFeedback(hitType, points) {
        const feedback = document.getElementById('game-feedback');
        if (!feedback) return;

        const feedbackElement = document.createElement('div');
        feedbackElement.className = `hit-feedback ${hitType}`;
        feedbackElement.textContent = `${hitType.toUpperCase()} +${points}`;

        feedback.appendChild(feedbackElement);

        // Remove after animation
        setTimeout(() => {
            if (feedbackElement.parentNode) {
                feedbackElement.parentNode.removeChild(feedbackElement);
            }
        }, 1000);
    }

    // Cleanup function
    const cleanup = () => {
        socket.off('game:song_selected');
        socket.off('game:countdown');
        socket.off('game:started');
        socket.off('player:score_updated');
        socket.off('player:hit_result');
        socket.off('game:finished');
        socket.off('game:can_start');
    };

    // Store cleanup function
    container.cleanup = cleanup;
}
