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
        case "/":
            clearScripts();
            renderWaiting(currentRoute?.data);
            break;
        
        case "/login":
            clearScripts();
            renderLogin(currentRoute?.data);
            break;
        
        case "/songs-selection":
            clearScripts();
            renderSongSelection(currentRoute?.data);
            break;
        
        // case "/game":  
        //     clearScripts();
        //     import("/game").then((module) => {
        //         module.default();
        //     });
        //     break;
        
        // case "results":
        //     clearScripts();
        //     import("/results").then((module) => {
        //         module.default();
        //     });
        //     break;
        
            default:
                const app = document.getElementById("app");
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

        this.init();
    }

    init() {
        if (!this.roomId) {
            this.showError('Error: No se ha proporcionado un ID de sala');
            return;
        }

        this.connectSocket();
    }

    //
    connectSocket() {
        this.socket = io({
            path: '/real-time',
        });

        this.socket.on('connect', () => {
            console.log('Conectado al servidor');
            this.socket.emit('join-room', {
                roomId: this.roomId,
                type: 'mobile',
            });
        });

        this.socket.on('player-assigned', (data) => {
            console.log('Asignado como jugador:', data.playerId);
            this.loadGameScreen(data.playerId);
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
    }

    loadGameScreen(playerId) {
        this.appContainer.innerHTML = '';
        this.currentScreen = new GameScreen(
            this.appContainer,
            this.socket,
            this.roomId,
            playerId
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
