// App principal para el cliente móvil
import renderLogin from "./screens/login.js";
import renderSongSelection from "./screens/song-selection.js";
import renderGame from "./screens/game.js";
import renderResults from "./screens/results.js";

// Conexión a Socket.IO
const socket = io("/", { path: "/real-time" });

// Estado de la aplicación
let appState = {
  username: null,
  gameId: null,
  currentScreen: "/",
  songData: null,
  gameMode: null,
  difficulty: null,
  score: 0,
  results: null
};

// Elemento principal de la aplicación
const appElement = document.getElementById("app");

// Limpiar la pantalla actual
function clearScreen() {
  appElement.innerHTML = "";
}

// Renderizar la pantalla actual
function renderCurrentScreen() {
  clearScreen();
  
  switch (appState.currentScreen) {
    case "/":
      renderLogin(appState, { 
        navigateTo, 
        registerUser 
      });
      break;
    case "/song-selection":
      renderSongSelection(appState, { 
        navigateTo, 
        selectSong 
      });
      break;
    case "/game":
      renderGame(appState, { 
        navigateTo, 
        hitNote, 
        finishSong 
      });
      break;
    case "/results":
      renderResults(appState, { 
        navigateTo, 
        saveEmail 
      });
      break;
    default:
      appElement.innerHTML = `
        <div>
          <h1>Página no encontrada</h1>
          <button id="go-home">Volver al inicio</button>
        </div>
      `;
      document.getElementById("go-home").addEventListener("click", () => {
        navigateTo("/");
      });
  }
}

// Navegación entre pantallas
function navigateTo(path, data = {}) {
  appState = { ...appState, ...data, currentScreen: path };
  renderCurrentScreen();
}

// Registrar usuario
function registerUser(username) {
  if (!username || username.trim() === "") {
    alert("Por favor ingresa un nombre de usuario válido");
    return false;
  }
  
  appState.username = username;
  socket.emit("register-player", { username });
  navigateTo("/song-selection");
  return true;
}

// Seleccionar canción
function selectSong(songId, mode, difficulty) {
  appState.songData = songId;
  appState.gameMode = mode;
  appState.difficulty = difficulty;
  
  socket.emit("select-song", { 
    songId, 
    mode, 
    difficulty 
  });
  
  if (mode === "1vs1") {
    // Mostrar pantalla de espera
    appElement.innerHTML = `
      <div>
        <h2>Esperando a otro jugador...</h2>
        <p>Modo: ${mode}</p>
        <p>Dificultad: ${difficulty}</p>
      </div>
    `;
  }
}

// Registrar acierto de nota
function hitNote(accuracy) {
  socket.emit("note-hit", { accuracy });
}

// Finalizar canción
function finishSong() {
  socket.emit("song-finished");
}

// Guardar email para premio
function saveEmail(email) {
  if (!email || !email.includes("@")) {
    alert("Por favor ingresa un correo electrónico válido");
    return false;
  }
  
  socket.emit("save-email", { email });
  return true;
}

// Listeners de Socket.IO
socket.on("waiting-opponent", () => {
  appElement.innerHTML = `
    <div>
      <h2>Esperando oponente...</h2>
      <p>¡Pronto comenzará el juego!</p>
    </div>
  `;
});

socket.on("game-ready", (data) => {
  appState.gameId = data.gameId;
  
  appElement.innerHTML = `
    <div>
      <h2>¡Juego listo!</h2>
      <p>Preparándose para comenzar...</p>
      ${data.players ? `<p>Jugadores: ${data.players.join(", ")}</p>` : ""}
    </div>
  `;
});

socket.on("start-game", () => {
  navigateTo("/game");
});

socket.on("score-update", (data) => {
  if (data.playerId === socket.id) {
    appState.score = data.score;
  }
});

socket.on("game-results", (results) => {
  appState.results = results;
  navigateTo("/results");
});

socket.on("email-saved", (data) => {
  alert(data.message);
});

socket.on("player-disconnected", (data) => {
  alert(`¡El jugador ${data.username} se ha desconectado!`);
  // Redirigir al menú de selección de canción
  navigateTo("/song-selection");
});

// Iniciar la aplicación
renderCurrentScreen();

// Exportar funciones y objetos necesarios
export { 
  navigateTo, 
  socket, 
  appState,
  registerUser,
  selectSong,
  hitNote,
  finishSong,
  saveEmail
};