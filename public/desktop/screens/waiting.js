export default function renderWaitingScreen(data) {
    const html = `
        <div id="gameArea">
            <p>Waiting for mobile devices to connect...</p>
            <canvas id="gameCanvas" width="400" height="600" style="display: none"></canvas>
            <div id="scoreDisplay" style="display: none">
                <div>Player 1: <span id="scoreP1">0</span></div>
                <div>Player 2: <span id="scoreP2">0</span></div>
            </div>
            <button id="startGameBtn" style="display: none">Start Game</button>
        </div>
    `;
    document.getElementById('app').innerHTML = html;

    const roomStatusEl = document.getElementById('roomStatus');
    document.getElementById('connectedClients').textContent = data.connectedClients;
    document.getElementById('maxClients').textContent = data.maxClients;
    roomStatusEl.textContent = data.connectedClients >= data.maxClients ? 'Full' : 'Available';
    roomStatusEl.className = data.connectedClients >= data.maxClients ? 'status-badge status-full' : 'status-badge status-available';
}
