export default function renderWelcomeScreen(roomId) {
    const html = `
        <h1>Rock & Sync</h1>
        <div class="room-info">
            <h2>Room ID: <span id="roomId">${roomId}</span></h2>
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
    `;
    document.getElementById('app').innerHTML = html;

    const serverUrl = window.location.origin;
    const mobileUrl = `${serverUrl}/mobile?roomId=${roomId}`;
    new QRCode(document.getElementById('qrcode'), {
        text: mobileUrl,
        width: 200,
        height: 200,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H,
    });
    document.getElementById('mobileUrl').textContent = mobileUrl;
}