import SocketManager from './SocketManager.js';
import WaitingScreen from './screens/WaitingScreen.js';
import GameScreen from './screens/GameScreen.js';

class App {
    constructor() {
        this.appElement = document.getElementById('app');
        this.socketManager = new SocketManager();
        this.currentScreen = null;
        this.roomId = null;
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
        this.cleanupCurrentScreen();

        this.currentScreen = new WaitingScreen(
            this.socket,
            this.roomId,
            this.showGameScreen.bind(this)
        );

        this.appElement.appendChild(this.currentScreen.render());
    }

    showGameScreen() {
        this.cleanupCurrentScreen();

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
