<<<<<<< HEAD
// import renderWelcome from './screens/welcome.js';
// import renderWaiting from './screens/waiting.js';
import renderGame from './screens/game.js';
// import renderResults from './screens/results.js';

const socket = io('/', { path: '/real-time' });

let appState = {
    currentScreen: '/',
    gameId: null,
    players: [],
    songData: null,
    difficulty: null,
    mode: null,
    scores: {},
    results: null,
};

function clearScripts() {
    document.getElementById("app").innerHTML = "";
};

let route = { path: "/", data: {}};
renderRoute(route);

function renderRoute(currentRoute) {
    switch (currentRoute?.path) {
        // case "/":
        //     clearScripts();
        //     renderWelcome(currentRoute?.data);
        //     break;
        
        // case "/waiting":
        //     clearScripts();
        //     renderWaiting(currentRoute?.data);
        //     break;
        
        case "/":  
            clearScripts();
            renderGame(currentRoute?.data);
            break;
        
        // case "results":
        //     clearScripts();
        //     renderResults(currentRoute?.data);
        //     break;
        
            default:
                const app = document.getElementById("app");
                app.innerHTML = `<h1>404 - Not Found</h1><p>The page you are looking for does not exist.</p>`;
    }
};

// Navegación entre pantallas
function navigateTo(path, data = {}) {
    appState = { ...appState, ...data, currentScreen: path };
    renderCurrentScreen();
}

// Listeners de Socket.IO
socket.on('game-ready', (data) => {
    appState.gameId = data.gameId;
    appState.songData = data.songId;
    appState.difficulty = data.difficulty;

    if (data.players) {
        appState.players = data.players;
        appState.mode = '1vs1';
    } else {
        appState.mode = 'single';
=======
import SocketManager from './SocketManager.js';
import WaitingScreen from './screens/WaitingScreen.js';
import GameScreen from './screens/GameScreen.js';

class App {
    constructor() {
        this.appElement = document.getElementById('app');
        this.socketManager = new SocketManager();
        this.currentScreen = null;
        this.roomId = null;
>>>>>>> mariana
    }

    init() {
        // Get room ID from URL
        const params = new URLSearchParams(window.location.search);
        this.roomId = params.get('roomId');

        if (!this.roomId) {
            console.error('No room ID found in URL');
            this.appElement.innerHTML = '<h1>Error: No room ID found</h1>';
            return;
        }

        // Connect to socket.io server
        this.socket = this.socketManager.connect();

        // Join the room
        this.socketManager.joinRoom(this.roomId, 'desktop');

        // Show the waiting screen
        this.showWaitingScreen();
    }

    showWaitingScreen() {
        // Clean up previous screen if exists
        this.cleanupCurrentScreen();

        // Create and show waiting screen
        this.currentScreen = new WaitingScreen(
            this.socket,
            this.roomId,
            this.showGameScreen.bind(this)
        );

        this.appElement.appendChild(this.currentScreen.render());
    }

    showGameScreen() {
        // Clean up previous screen if exists
        this.cleanupCurrentScreen();

        // Create and show game screen
        this.currentScreen = new GameScreen(this.socket);
        this.appElement.appendChild(this.currentScreen.render());
    }

    cleanupCurrentScreen() {
        if (this.currentScreen) {
            // Call destroy method if it exists to clean up event handlers
            if (typeof this.currentScreen.destroy === 'function') {
                this.currentScreen.destroy();
            }

            // Remove from DOM
            if (
                this.currentScreen.element &&
                this.currentScreen.element.parentNode
            ) {
                this.currentScreen.element.parentNode.removeChild(
                    this.currentScreen.element
                );
            }

            this.currentScreen = null;
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});
