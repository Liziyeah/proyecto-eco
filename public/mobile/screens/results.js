// results.js - Pantalla de resultados
export default function renderResults(state, { navigateTo, saveEmail }) {
    const app = document.getElementById("app");
    
    // Generar HTML para los resultados
    const resultsHTML = state.results 
      ? state.results.map((player, index) => `
          <div class="player-result ${index === 0 ? 'winner' : ''}">
            <div class="position">${index + 1}</div>
            <div class="player-name">${player.username}</div>
            <div class="player-score">${player.score}</div>
          </div>
        `).join("")
      : "<p>No hay resultados disponibles</p>";
    
    app.innerHTML = `
      <div id="results-screen">
        <h2>Resultados</h2>
        
        <div id="results-list">
          ${resultsHTML}
        </div>
        
        <div id="email-form">
          <h3>¡Participa por premios!</h3>
          <p>Ingresa tu correo electrónico para participar en sorteos de entradas, merchandising y más:</p>
          
          <input type="email" id="email-input" placeholder="tucorreo@ejemplo.com">
          <button id="submit-email-btn">Participar</button>
          
          <p id="email-message" style="display: none;"></p>
        </div>
        
        <button id="play-again-btn">Jugar de nuevo</button>
      </div>
    `;
    
    // Manejar envío de correo
    const emailInput = document.getElementById("email-input");
    const submitEmailBtn = document.getElementById("submit-email-btn");
    const emailMessage = document.getElementById("email-message");