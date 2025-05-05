export default function renderLoginScreen(roomId) {
    const html = `
        <div class="room-info">
            <h2>Rock & Sync</h2>
            <p>Room ID: <span id="roomId">${roomId}</span></p>
            <div id="connectionStatus" class="status-badge status-disconnected">Connecting...</div>
        </div>
        <div id="errorMessage" class="error-message" style="display: none">
            Room is full! Please try another room.
        </div>
    `;
    document.getElementById('app').innerHTML = html;
}
