// Updates to WaitingScreen.js
export default class WaitingScreen {
    constructor(socket, roomId, onAllPlayersConnected) {
        this.socket = socket;
        this.roomId = roomId;
        this.onAllPlayersConnected = onAllPlayersConnected;
        this.element = document.createElement('div');
        this.element.className = 'waiting-screen';
        this.connectedClients = 0;
        this.maxClients = 2;
        this.playerStatus = {}; // Track player ready status
        this.selectedSong = null;
        this.selectedDifficulty = null;
    }

    render() {
        this.element.innerHTML = `
            <h1>Rock & Sync</h1>

            <div class="room-info">
                <h2>Room ID: <span id="roomId">${this.roomId}</span></h2>
                <div class="connection-status">
                    Connected clients: <span id="connectedClients">0</span>/<span id="maxClients">2</span>
                    <div id="roomStatus" class="status-badge status-available">Available</div>
                </div>
            </div>

            <div class="qr-container">
                <h3>Scan this QR code to join with your mobile</h3>
                <div id="qrcode"></div>
                <p class="mobile-url" id="mobileUrl"></p>
            </div>

            <div id="gameArea">
                <p>Waiting for mobile devices to connect...</p>
                <div id="playerStatusArea" class="player-status-area" style="display: none;">
                    <div class="player-status" id="player0Status">
                        <span class="player-name">Player 1</span>
                        <span class="status-dot not-ready"></span>
                    </div>
                    <div class="player-status" id="player1Status">
                        <span class="player-name">Player 2</span>
                        <span class="status-dot not-ready"></span>
                    </div>
                </div>
                <div id="songSelection" style="display: none;">
                    <h3>Song Selection</h3>
                    <div class="selected-song">
                        <p>Waiting for players to select a song...</p>
                    </div>
                </div>
                <button id="startGameBtn" style="display: none">Start Game</button>
            </div>
        `;

        // Set up event listeners
        this.setupEventListeners();
        this.createQRCode();

        return this.element;
    }

    setupEventListeners() {
        // Setup socket listeners
        this.socket.on('room-status', this.handleRoomStatus.bind(this));

        // Listen for player ready events
        this.socket.on('player-ready', this.handlePlayerReady.bind(this));

        // Listen for all players ready
        this.socket.on(
            'all-players-ready',
            this.handleAllPlayersReady.bind(this)
        );

        // Add button event listener (will be hidden until all players connect)
        const startGameBtn = this.element.querySelector('#startGameBtn');
        startGameBtn.addEventListener('click', () => {
            // Start the game
            this.socket.emit('game-start');
            this.onAllPlayersConnected();
        });
    }

    handleRoomStatus(data) {
        console.log('Room status update:', data);

        this.connectedClients = data.connectedClients;
        this.maxClients = data.maxClients;

        const connectedClientsEl =
            this.element.querySelector('#connectedClients');
        const maxClientsEl = this.element.querySelector('#maxClients');
        const roomStatusEl = this.element.querySelector('#roomStatus');
        const gameAreaMsgEl = this.element.querySelector('#gameArea p');
        const playerStatusArea =
            this.element.querySelector('#playerStatusArea');

        // Update connection counts
        connectedClientsEl.textContent = data.connectedClients;
        maxClientsEl.textContent = data.maxClients;

        // Update status badge
        if (data.connectedClients >= data.maxClients) {
            roomStatusEl.textContent = 'Full';
            roomStatusEl.className = 'status-badge status-full';
        } else {
            roomStatusEl.textContent = 'Available';
            roomStatusEl.className = 'status-badge status-available';
        }

        // Update game area message
        if (data.connectedClients === 0) {
            gameAreaMsgEl.textContent =
                'Waiting for mobile devices to connect...';
            playerStatusArea.style.display = 'none';
        } else if (data.connectedClients < data.maxClients) {
            gameAreaMsgEl.textContent = `Waiting for more players... ${data.connectedClients} of ${data.maxClients} connected.`;

            // Show player status area if at least one player is connected
            if (data.connectedClients > 0) {
                playerStatusArea.style.display = 'flex';
            }
        } else {
            // All players connected
            gameAreaMsgEl.textContent =
                'All players connected! Waiting for song selection...';
            playerStatusArea.style.display = 'flex';
            document.querySelector('#songSelection').style.display = 'block';
        }
    }

    handlePlayerReady(data) {
        const playerId = data.playerId;
        this.playerStatus[playerId] = 'ready';

        // Update the player status indicator
        const playerStatusEl = this.element.querySelector(
            `#player${playerId}Status .status-dot`
        );
        if (playerStatusEl) {
            playerStatusEl.classList.remove('not-ready');
            playerStatusEl.classList.add('ready');
        }

        // Update song selection info if this is the first player to select
        if (data.songId && !this.selectedSong) {
            this.selectedSong = data.songId;
            this.selectedDifficulty = data.difficulty;

            // Update the song display
            const songSelectionEl =
                this.element.querySelector('.selected-song');
            songSelectionEl.innerHTML = `
                <h4>${data.songTitle || 'Selected Song'}</h4>
                <p>Difficulty: ${data.difficulty}</p>
            `;
        }
    }

    handleAllPlayersReady(data) {
        // All players are ready, show the start button
        const startGameBtn = this.element.querySelector('#startGameBtn');
        startGameBtn.style.display = 'block';

        // Update message
        const gameAreaMsgEl = this.element.querySelector('#gameArea p');
        gameAreaMsgEl.textContent =
            'All players ready! Click to start the game.';

        // Store song selection
        this.selectedSong = data.songId;
        this.selectedDifficulty = data.difficulty;
    }

    createQRCode() {
        // Create QR code
        const serverUrl = window.location.origin;
        const mobileUrl = `${serverUrl}/mobile?roomId=${this.roomId}`;

        // Generate QR code
        new QRCode(this.element.querySelector('#qrcode'), {
            text: mobileUrl,
            width: 200,
            height: 200,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H,
        });

        // Display mobile URL
        this.element.querySelector('#mobileUrl').textContent = mobileUrl;
    }

    destroy() {
        // Remove event listeners
        this.socket.off('room-status', this.handleRoomStatus);
        this.socket.off('player-ready', this.handlePlayerReady);
        this.socket.off('all-players-ready', this.handleAllPlayersReady);
    }
}

// Add CSS styles for the new player status indicators
// Add to your desktop CSS file
/*
.player-status-area {
    display: flex;
    justify-content: center;
    gap: 40px;
    margin: 20px 0;
}

.player-status {
    display: flex;
    align-items: center;
    gap: 10px;
}

.status-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
}

.status-dot.not-ready {
    background-color: #ff4d4d;
}

.status-dot.ready {
    background-color: #4CAF50;
}

.selected-song {
    margin: 20px 0;
    padding: 10px;
    background-color: #f0f0f0;
    border-radius: 5px;
}
*/
