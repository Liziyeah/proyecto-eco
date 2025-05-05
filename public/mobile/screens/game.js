import { navigateTo, socket } from "../app.js";

export default function renderGame() {
    const appGame = document.getElementById("app");

    appGame.innerHTML = `
        <div class="room-info">
            <h2>Rock & Sync</h2>
            <p>Room ID: <span id="roomId"></span></p>
            <div id="connectionStatus" class="status-badge status-disconnected">
                Connecting...
            </div>
        </div>

        <div id="errorMessage" class="error-message" style="display: none">
            Room is full! Please try another room.
        </div>

        <div id="playerInfo" style="display: none">
            <h3>You are Player <span id="playerNumber">-</span></h3>
        </div>

        <div id="controlArea" style="display: none">
            <h3>Waiting for game to start...</h3>
            <div id="controlButtons">
                <button
                    id="leftButton"
                    style="width: 45%; height: 150px; margin: 10px; font-size: 24px"
                    data-column="0"
                >
                    LEFT LANE
                </button>
                <button
                    id="rightButton"
                    style="width: 45%; height: 150px; margin: 10px; font-size: 24px"
                    data-column="1"
                >
                    RIGHT LANE
                </button>
            </div>
        </div>
    `;

    const params = new URLSearchParams(window.location.search);
    const roomId = params.get('roomId');
    let playerId = -1;

    if (!roomId) {
        app.innerHTML = `<div class="error-message">Error: No room ID provided</div>`;
        return;
    };

    document.getElementById('roomId').textContent = roomId;

    socket.emit('join-room', {
        roomId: roomId,
        type: 'mobile',
    });

    socket.on('connect', () => {
        const status = document.getElementById('connectionStatus');
        status.textContent = 'Connected';
        status.className = 'status-badge status-connected';
    });

    socket.on('player-assigned', (data) => {
        playerId = data.playerId;
        document.getElementById('playerInfo').style.display = 'block';
        document.getElementById('playerNumber').textContent = playerId + 1;
        document.getElementById('controlArea').style.display = 'block';

        const color = playerId === 0 ? '#FF0000' : '#0000FF';
        document.getElementById('leftButton').style.backgroundColor = color;
        document.getElementById('rightButton').style.backgroundColor = color;
    });

    socket.on('game-start', () => {
        document.querySelector('#controlArea h3').textContent =
            'Game Running - Hit the buttons!';
    });

    socket.on('room-full', () => {
        document.getElementById('errorMessage').style.display = 'block';
        document.getElementById('controlArea').style.display = 'none';
    });

    socket.on('disconnect', () => {
        const status = document.getElementById('connectionStatus');
        status.textContent = 'Disconnected';
        status.className = 'status-badge status-disconnected';
    });

    document.addEventListener('click', (e) => {
        if (
            e.target &&
            e.target.matches('#controlButtons button')
        ) {
            const column = parseInt(e.target.dataset.column);
            socket.emit('button-press', {
                column: column,
                playerId: playerId,
            });

            e.target.style.opacity = '0.7';
            setTimeout(() => {
                e.target.style.opacity = '1';
            }, 100);
        }
    });
};