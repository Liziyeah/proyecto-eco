import { renderLobbyScreen } from './screens/LobbyScreen.js';
import { renderGameScreen } from './screens/GameScreen.js';
import { renderScoreboardScreen } from './screens/ScoreboardScreen.js';
import { renderSongSelectionScreen } from './screens/SongSelectionScreen.js';

const socket = io();
const urlParams = new URLSearchParams(window.location.search);
const roomCode = urlParams.get('rc') || data.roomCode || '';
let appState = { path: '/lobby', data: { roomCode } };

function renderRoute(appState) {
    const container = document.getElementById('app');

    switch (appState.path) {
        case '/lobby':
            renderLobbyScreen(container, appState.data);
            break;
        case '/game':
            renderGameScreen(container, appState.data);
            break;
        case '/scoreboard':
            renderScoreboardScreen(container, appState.data);
            break;
        case '/song-selection':
            renderSongSelectionScreen(container, appState.data);
            break;
        default:
            container.innerHTML = `
                <h1>404 - Página no encontrada</h1>
                <p>Lo sentimos, la página que buscas no existe.</p>
            `;
            break;
    }
}

function navigateTo(path, data = {}) {
    appState = { path, data };

    renderRoute(appState);
}

document.addEventListener('DOMContentLoaded', () => {
    renderRoute(appState);
});

export { navigateTo, socket };
