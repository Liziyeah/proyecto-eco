import renderLoginScreen from './screens/login.js';
import renderWaitingScreen from './screens/waiting.js';
import { updateGameStart } from './screens/game.js';
import { showRoomFullError } from './screens/results.js';

const params = new URLSearchParams(window.location.search);
const roomId = params.get('roomId');
let playerId = -1;

if (!roomId) {
    document.body.innerHTML = '<div class="error-message">Error: No room ID provided</div>';
} else {
    renderLoginScreen(roomId);

    const socket = io({ path: '/real-time' });

    socket.on('connect', () => {
        document.getElementById('connectionStatus').textContent = 'Connected';
        document.getElementById('connectionStatus').className = 'status-badge status-connected';
        socket.emit('join-room', { roomId, type: 'mobile' });
    });

    socket.on('player-assigned', (data) => {
        playerId = data.playerId;
        renderWaitingScreen();
        document.getElementById('playerInfo').style.display = 'block';
        document.getElementById('playerNumber').textContent = playerId + 1;
        document.getElementById('controlArea').style.display = 'block';

        const color = playerId === 0 ? '#FF0000' : '#0000FF';
        document.getElementById('leftButton').style.backgroundColor = color;
        document.getElementById('rightButton').style.backgroundColor = color;
    });

    socket.on('game-start', () => {
        updateGameStart();
    });

    socket.on('room-full', () => {
        showRoomFullError();
    });

    socket.on('disconnect', () => {
        document.getElementById('connectionStatus').textContent = 'Disconnected';
        document.getElementById('connectionStatus').className = 'status-badge status-disconnected';
    });

    document.addEventListener('click', (e) => {
        if (e.target && e.target.matches('#controlButtons button')) {
            const column = parseInt(e.target.dataset.column);
            socket.emit('button-press', { column, playerId });
            e.target.style.opacity = '0.7';
            setTimeout(() => { e.target.style.opacity = '1'; }, 100);
        }
    });
}
