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
