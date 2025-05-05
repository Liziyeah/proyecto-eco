export default function renderResultsScreen(scores) {
    const html = `
        <div id="results">
            <h2>Game Over</h2>
            <p>Player 1 Score: ${scores[0]}</p>
            <p>Player 2 Score: ${scores[1]}</p>
        </div>
    `;
    document.getElementById('app').innerHTML = html;
}


// index.js - Navegación y control general
import renderWelcomeScreen from '../screens/welcome.js';
import renderWaitingScreen from '../screens/waiting.js';


const params = new URLSearchParams(window.location.search);
const roomId = params.get('roomId');

if (!roomId) {
    document.body.innerHTML = '<h1>Error: No room ID found</h1>';
} else {
    renderWelcomeScreen(roomId);

    const socket = io({ path: '/real-time' });

    socket.on('connect', () => {
        socket.emit('join-room', { roomId, type: 'desktop' });
    });

    socket.on('room-status', (data) => {
        if (data.connectedClients < data.maxClients) {
            renderWaitingScreen(data);
        } else {
            renderGameScreen();
            document.getElementById('startGameBtn').onclick = () => startGame(socket);
        }
    });

    socket.on('player-press', (data) => {
        handlePlayerPress(data.playerId, data.column);
    });

    socket.on('disconnect', () => console.log('Disconnected'));
} 
