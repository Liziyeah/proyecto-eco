import { renderControllerScreen } from './screens/ControllerScreen.js';
import { renderMainPageScreen } from './screens/MainPageScreen.js';
import { renderResultsScreen } from './screens/ResultsScreen.js';

const socket = io();
const urlParams = new URLSearchParams(window.location.search);
const roomCode = urlParams.get('rc') || data.roomCode || '';
let appState = { path: '/main', data: { roomCode } };

function renderRoute(appState) {
    const container = document.getElementById('app');

    switch (appState.path) {
        case '/main':
            renderMainPageScreen(container, appState.data);
            break;
        case '/controller':
            renderControllerScreen(container, appState.data);
            break;
        case '/results':
            renderResultsScreen(container, appState.data);
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
