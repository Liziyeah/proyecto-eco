// App principal para el cliente desktop
import renderWelcome from './screens/welcome.js';
import renderWaiting from './screens/waiting.js';
import renderGame from './screens/game.js';
import renderResults from './screens/results.js';

// Conexión a Socket.IO
const socket = io('/', { path: '/real-time' });

// Estado de la aplicación
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

// Elemento principal de la aplicación
const appElement = document.getElementById('app');

// Limpiar la pantalla actual
function clearScreen() {
    appElement.innerHTML = '';
}

// Renderizar la pantalla actual
function renderCurrentScreen() {
    clearScreen();

    switch (appState.currentScreen) {
        case '/':
            renderWelcome(appState, { navigateTo });
            break;
        case '/waiting':
            renderWaiting(appState, { navigateTo });
            break;
        case '/game':
            renderGame(appState, { navigateTo });
            break;
        case '/results':
            renderResults(appState, { navigateTo });
            break;
        default:
            appElement.innerHTML = `
        <div>
          <h1>Página no encontrada</h1>
          <button id="go-home">Volver al inicio</button>
        </div>
      `;
            document.getElementById('go-home').addEventListener('click', () => {
                navigateTo('/');
            });
    }
}

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
    }

    navigateTo('/waiting');
});

socket.on('start-game', () => {
    navigateTo('/game');
});

socket.on('score-update', (data) => {
    // Actualizar puntuación
    appState.scores[data.playerId] = {
        username: data.username,
        score: data.score,
        lastHit: data.noteHit,
    };

    // Si estamos en la pantalla del juego, actualizar la visualización
    if (appState.currentScreen === '/game') {
        const scoreElements = document.getElementsByClassName('player-score');
        for (const element of scoreElements) {
            const playerId = element.dataset.playerId;
            if (playerId && appState.scores[playerId]) {
                element.textContent = appState.scores[playerId].score;
            }
        }

        // Mostrar feedback para el último acierto
        if (data.noteHit) {
            const feedbackElement = document.getElementById(
                `feedback-${data.playerId}`
            );
            if (feedbackElement) {
                feedbackElement.textContent = data.noteHit;
                feedbackElement.className = `note-feedback ${data.noteHit}`;

                // Limpiar después de un momento
                setTimeout(() => {
                    feedbackElement.textContent = '';
                    feedbackElement.className = 'note-feedback';
                }, 1000);
            }
        }
    }
});

socket.on('game-results', (results) => {
    appState.results = results;
    navigateTo('/results');
});

socket.on('player-disconnected', (data) => {
    alert(`¡El jugador ${data.username} se ha desconectado!`);

    // Si estamos en una partida, volver a la pantalla de bienvenida
    if (
        appState.currentScreen === '/game' ||
        appState.currentScreen === '/waiting'
    ) {
        navigateTo('/');
    }
});
renderCurrentScreen();
export { navigateTo, socket, appState };
