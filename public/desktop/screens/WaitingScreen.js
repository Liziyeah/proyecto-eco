export default class WaitingScreen {
    constructor(socket, roomId, onAllPlayersConnected) {
        this.socket = socket;
        this.roomId = roomId;
        this.onAllPlayersConnected = onAllPlayersConnected;
        this.element = document.createElement('div');
        this.element.className = 'waiting-screen';
        this.connectedClients = 0;
        this.maxClients = 2;
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

        // Add button event listener (will be hidden until all players connect)
        const startGameBtn = this.element.querySelector('#startGameBtn');
        startGameBtn.addEventListener('click', () => {
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
        const startGameBtn = this.element.querySelector('#startGameBtn');

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
            startGameBtn.style.display = 'none';
        } else if (data.connectedClients < data.maxClients) {
            gameAreaMsgEl.textContent = `Waiting for more players... ${data.connectedClients} of ${data.maxClients} connected.`;
            startGameBtn.style.display = 'none';
        } else {
            // All players connected
            gameAreaMsgEl.textContent =
                'All players connected! Game ready to start.';
            startGameBtn.style.display = 'block';
        }
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
    }
}
