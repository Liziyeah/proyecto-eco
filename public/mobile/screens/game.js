// game.js - Pantalla del juego (controles)
export default function renderGame(state, { navigateTo, hitNote, finishSong }) {
    const app = document.getElementById("app");
    
    app.innerHTML = `
      <div id="game-screen">
        <h2>Rock & Sync</h2>
        <div id="score-display">Puntuación: <span id="current-score">0</span></div>
        
        <div id="game-controls">
          <div class="lane-controls">
            <button id="lane1" class="lane-button">1</button>
            <button id="lane2" class="lane-button">2</button>
            <button id="lane3" class="lane-button">3</button>
            <button id="lane4" class="lane-button">4</button>
          </div>
        </div>
        
        <div id="feedback-area"></div>
      </div>
    `;
    
    const scoreDisplay = document.getElementById("current-score");
    const laneButtons = document.querySelectorAll(".lane-button");
    const feedbackArea = document.getElementById("feedback-area");
    
    // Mostrar la puntuación actual
    if (state.score) {
      scoreDisplay.textContent = state.score;
    }
    
    // Manejar clics en los botones de carril
    laneButtons.forEach(button => {
      button.addEventListener("click", () => {
        // Determinar la precisión (en un juego real, se calcularía según el timing)
        const accuracies = ["perfect", "good", "ok", "miss"];
        const randomAccuracy = accuracies[Math.floor(Math.random() * accuracies.length)];
        
        // Enviar el acierto al servidor
        hitNote(randomAccuracy);
        
        // Mostrar feedback
        feedbackArea.textContent = randomAccuracy;
        feedbackArea.className = randomAccuracy;
        
        // Limpiar feedback después de un momento
        setTimeout(() => {
          feedbackArea.textContent = "";
          feedbackArea.className = "";
        }, 1000);
      });
    });
    
    // Simular el final de la canción después de un tiempo (en un juego real, esto sería cuando la canción termina)
    const songDuration = 30000; // 30 segundos para la demo
    setTimeout(() => {
      finishSong();
    }, songDuration);
  }