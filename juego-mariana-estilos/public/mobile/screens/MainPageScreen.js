import { navigateTo, socket } from '../main.js';

export function renderMainPageScreen(container, data = {}) {
    const { roomCode } = data;

    container.innerHTML = `
        <div class="join-screen">
            <div class="join-header">
                <img src="/game/assets/images/logo.png" alt="Rock and Sync" class="logo" />
            </div>
            <div class="join-form">
                <input 
                    type="text" 
                    id="room-code-input" 
                    placeholder="Room Code" 
                    value="${roomCode || ''}"
                    ${roomCode ? 'readonly' : ''}
                />
                <input 
                    type="text" 
                    id="username-input" 
                    placeholder="Your Name" 
                    maxlength="20"
                />
                <button id="join-btn" class="btn primary">Join Game</button>
            </div>
            <div id="error-message" class="error-message" style="display: none;"></div>
            <div id="loading-message" class="loading-message" style="display: none;">Joining game...</div>
        </div>
    `;

    // Function to show error message
    function showError(message) {
        const errorDiv = document.getElementById('error-message');
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';

        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 3000);
    }

    // Function to show loading state
    function showLoading(show = true) {
        const loadingDiv = document.getElementById('loading-message');
        const joinBtn = document.getElementById('join-btn');

        loadingDiv.style.display = show ? 'block' : 'none';
        joinBtn.disabled = show;
        joinBtn.textContent = show ? 'Joining...' : 'Join Game';
    }

    // Join button click handler
    document.getElementById('join-btn').addEventListener('click', () => {
        const roomCodeInput = document.getElementById('room-code-input');
        const usernameInput = document.getElementById('username-input');

        const enteredRoomCode = roomCodeInput.value.trim().toUpperCase();
        const username = usernameInput.value.trim();

        // Validation
        if (!enteredRoomCode) {
            showError('Please enter a room code');
            return;
        }

        if (enteredRoomCode.length !== 6) {
            showError('Room code must be 6 characters');
            return;
        }

        if (!username) {
            showError('Please enter your name');
            return;
        }

        if (username.length < 2) {
            showError('Name must be at least 2 characters');
            return;
        }

        if (username.length > 20) {
            showError('Name must be less than 20 characters');
            return;
        }

        // Show loading state
        showLoading(true);

        // Emit join event
        socket.emit('player:join', {
            roomCode: enteredRoomCode,
            username: username,
        });
    });

    // Socket event listeners
    socket.on('player:joined', (playerData) => {
        if (playerData.playerId === socket.id) {
            // Successfully joined, navigate to controller
            showLoading(false);
            navigateTo('/controller', {
                roomCode: playerData.roomCode,
                username: playerData.username,
                playerId: playerData.playerId,
            });
        }
    });

    socket.on('player:error', (errorData) => {
        showLoading(false);
        showError(errorData.message || 'Failed to join game');
    });

    // Auto-focus username input if room code is provided
    if (roomCode) {
        setTimeout(() => {
            document.getElementById('username-input').focus();
        }, 100);
    } else {
        setTimeout(() => {
            document.getElementById('room-code-input').focus();
        }, 100);
    }

    // Handle Enter key press
    container.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('join-btn').click();
        }
    });

    // Input formatting for room code
    document
        .getElementById('room-code-input')
        .addEventListener('input', (e) => {
            e.target.value = e.target.value
                .toUpperCase()
                .replace(/[^A-Z0-9]/g, '');
            if (e.target.value.length > 6) {
                e.target.value = e.target.value.substring(0, 6);
            }
        });

    // Clean up socket listeners when component unmounts
    const cleanup = () => {
        socket.off('player:joined');
        socket.off('player:error');
    };

    // Store cleanup function for potential use
    container.cleanup = cleanup;
}
