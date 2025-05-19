import { LoginScreen } from './screens/LoginScreen.js';
import { SongSelectionScreen } from './screens/SongSelectionScreen.js';
import { GameScreen } from './screens/GameScreen.js';
import renderLogin from "./screens/login.js";
import renderWaiting from "./screens/waiting.js";
import renderSongSelection from "./screens/songs-selection.js";

const socket = io("/", { path: "/real-time" });

function clearScripts() {
    document.getElementById("app").innerHTML = "";
};

let route = { path: "/", data: {}};
renderRoute(route);

function renderRoute(currentRoute) {
    switch (currentRoute?.path) {
        case '/':
            clearScripts();
            renderWaiting(currentRoute?.data);
            break;

        case '/login':
            clearScripts();
            renderLogin(currentRoute?.data);
            break;

        case '/songs-selection':
            clearScripts();
            renderSongSelection(currentRoute?.data);
            break;

        case '/game':
            clearScripts();
            import('./screens/GameScreen.js').then((module) => {
                const GameScreen = module.default;
                const gameScreen = new GameScreen(
                    document.getElementById('app'),
                    socket,
                    currentRoute?.data.roomId,
                    currentRoute?.data.playerId
                );
                gameScreen.render();
            });
            break;

        case '/results':
            clearScripts();
            import('./screens/results.js').then((module) => {
                module.default(currentRoute?.data);
            });
            break;

        default:
            const app = document.getElementById('app');
            app.innerHTML = `<h1>404 - Not Found</h1><p>The page you are looking for does not exist.</p>`;
    }
};

function navigateTo(path, data = {}) {
    route = { path, data };
    history.pushState(data, "", path);
    renderRoute(route);
};

class App {
    constructor() {
        this.appContainer = document.getElementById('app');
        this.params = new URLSearchParams(window.location.search);
        this.roomId = this.params.get('roomId');
        this.socket = null;
        this.currentScreen = null;
        this.playerId = null;

        this.init();
    }

    init() {
        if (!this.roomId) {
            this.showError('Error: No se ha proporcionado un ID de sala');
            return;
        }

        this.connectSocket();
        this.loadLoginScreen();
    }

    connectSocket() {
        this.socket = io({
            path: '/real-time',
        });

        this.socket.on('connect', () => {
            console.log('Conectado al servidor');
            // We don't join the room here anymore - we'll do it after login
        });

        this.socket.on('player-assigned', (data) => {
            console.log('Asignado como jugador:', data.playerId);
            this.playerId = data.playerId;
            // Store player ID for later screens
            localStorage.setItem('playerId', data.playerId);
        });

        this.socket.on('room-full', () => {
            console.log('La sala está llena');
            this.showError(
                '¡La sala está llena! Por favor, prueba con otra sala.'
            );
        });

        this.socket.on('disconnect', () => {
            console.log('Desconectado del servidor');
            if (this.currentScreen) {
                this.currentScreen.updateConnectionStatus('Desconectado');
            }
        });

        // Listen for game start event
        this.socket.on('game-start', () => {
            console.log('Game starting');
            this.loadGameScreen();
        });

        // Listen for all players ready
        this.socket.on('all-players-ready', () => {
            console.log('All players ready');
            // The desktop will send the game-start event
        });
    }

    loadLoginScreen() {
        this.appContainer.innerHTML = '';
        this.currentScreen = new LoginScreen(
            this.appContainer,
            this.socket,
            this.roomId,
            () => this.loadSongSelectionScreen()
        );
        this.currentScreen.render();
    }

    loadSongSelectionScreen() {
        // First join the room if not already joined
        if (!this.playerId) {
            this.socket.emit('join-room', {
                roomId: this.roomId,
                type: 'mobile',
            });
        }

        this.appContainer.innerHTML = '';
        this.currentScreen = new SongSelectionScreen(
            this.appContainer,
            this.socket,
            this.roomId,
            this.playerId
        );
        this.currentScreen.render();
    }

    loadGameScreen() {
        this.appContainer.innerHTML = '';
        this.currentScreen = new GameScreen(
            this.appContainer,
            this.socket,
            this.roomId,
            this.playerId || localStorage.getItem('playerId')
        );
        this.currentScreen.render();
    }

    showError(message) {
        this.appContainer.innerHTML = `
            <div class="error-container">
                <div class="error-message">${message}</div>
            </div>
        `;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new App();
});

export { socket, navigateTo, makeRequest };
