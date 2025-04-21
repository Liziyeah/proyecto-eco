
// song-selection.js - Pantalla de selección de canción
export default function renderSongSelection(state, { navigateTo, selectSong }) {
    const app = document.getElementById("app");
    
    // Lista de canciones disponibles
    const songs = [
      { id: "song1", title: "Welcome to the Black Parade", artist: "My Chemical Romance" },
      { id: "song2", title: "Helena", artist: "My Chemical Romance" },
      { id: "song3", title: "Teenagers", artist: "My Chemical Romance" },
      { id: "song4", title: "Famous Last Words", artist: "My Chemical Romance" }
    ];
    
    // Generar HTML para la lista de canciones
    const songListHTML = songs.map(song => `
      <div class="song-item" data-song-id="${song.id}">
        <h3>${song.title}</h3>
        <p>${song.artist}</p>
      </div>
    `).join("");
    
    app.innerHTML = `
      <div id="song-selection">
        <h2>Selecciona una canción</h2>
        <div id="song-list">
          ${songListHTML}
        </div>
        
        <div id="game-options" style="display: none;">
          <h3 id="selected-song"></h3>
          
          <div>
            <h4>Modo de juego:</h4>
            <label>
              <input type="radio" name="game-mode" value="single" checked> Un jugador
            </label>
            <label>
              <input type="radio" name="game-mode" value="1vs1"> 1 vs 1
            </label>
          </div>
          
          <div>
            <h4>Dificultad:</h4>
            <label>
              <input type="radio" name="difficulty" value="easy" checked> Fácil
            </label>
            <label>
              <input type="radio" name="difficulty" value="medium"> Medio
            </label>
            <label>
              <input type="radio" name="difficulty" value="hard"> Difícil
            </label>
          </div>
          
          <button id="start-game-btn">¡Jugar!</button>
        </div>
      </div>
    `;
    
    // Selección de canción
    const songItems = document.querySelectorAll(".song-item");
    const gameOptions = document.getElementById("game-options");
    const selectedSongElement = document.getElementById("selected-song");
    const startGameBtn = document.getElementById("start-game-btn");
    
    let selectedSong = null;
    
    songItems.forEach(item => {
      item.addEventListener("click", () => {
        // Deseleccionar todas las canciones
        songItems.forEach(s => s.classList.remove("selected"));
        
        // Seleccionar la canción actual
        item.classList.add("selected");
        selectedSong = item.dataset.songId;
        
        // Mostrar opciones de juego
        gameOptions.style.display = "block";
        
        // Mostrar canción seleccionada
        const songData = songs.find(s => s.id === selectedSong);
        selectedSongElement.textContent = `${songData.title} - ${songData.artist}`;
      });
    });
    
    // Iniciar juego
    startGameBtn.addEventListener("click", () => {
      if (!selectedSong) {
        alert("Selecciona una canción primero");
        return;
      }
      
      const mode = document.querySelector('input[name="game-mode"]:checked').value;
      const difficulty = document.querySelector('input[name="difficulty"]:checked').value;
      
      selectSong(selectedSong, mode, difficulty);
    });
  }
  