// GameScreen.js - Pantalla principal de controles del juego

export class GameScreen {
    constructor(container, socket, roomId, playerId) {
        this.container = container;
        this.socket = socket;
        this.roomId = roomId;
        this.playerId = playerId;

        // Configurar manejadores de eventos
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Escuchar eventos del servidor
        this.socket.on('game-start', () => {
            this.updateGameStatus('Juego en curso - ¡Pulsa los botones!');
        });

        // Añadir más manejadores de eventos según sea necesario
    }

    render() {
        const playerColor = this.playerId === 0 ? '#FF0000' : '#0000FF';

        this.container.innerHTML = `
            <div class="game-screen">
                <div class="room-info">
                    <h2>Rock & Sync</h2>
                    <p>Sala ID: <span id="roomIdDisplay">${
                        this.roomId
                    }</span></p>
                    <div id="connectionStatus" class="status-badge status-connected">
                        Conectado
                    </div>
                </div>
                
                <div id="playerInfo">
                    <h3>Eres el Jugador ${this.playerId + 1}</h3>
                </div>
                
                <div id="controlArea">
                    <h3 id="gameStatus">Esperando a que comience el juego...</h3>
                    <div id="controlButtons" class="control-buttons">
                        <button 
                            id="leftButton" 
                            class="control-button" 
                            data-column="0" 
                            style="background-color: ${playerColor}">
                            CARRIL IZQUIERDO
                        </button>
                        <button 
                            id="rightButton" 
                            class="control-button" 
                            data-column="1" 
                            style="background-color: ${playerColor}">
                            CARRIL DERECHO
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Configurar manejadores de eventos para los botones
        this.setupButtonHandlers();
    }

    setupButtonHandlers() {
        const buttons = this.container.querySelectorAll(
            '#controlButtons button'
        );

        buttons.forEach((button) => {
            button.addEventListener('click', (e) => {
                const column = parseInt(e.target.dataset.column);

                // Enviar pulsación de botón al servidor
                this.socket.emit('button-press', {
                    column: column,
                    playerId: this.playerId,
                });

                // Retroalimentación visual
                button.style.opacity = '0.7';
                setTimeout(() => {
                    button.style.opacity = '1';
                }, 100);
            });
        });
    }

    updateConnectionStatus(status) {
        const connectionStatus =
            this.container.querySelector('#connectionStatus');
        if (connectionStatus) {
            connectionStatus.textContent = status;
            connectionStatus.className = `status-badge status-${status.toLowerCase()}`;
        }
    }

    updateGameStatus(status) {
        const gameStatus = this.container.querySelector('#gameStatus');
        if (gameStatus) {
            gameStatus.textContent = status;
        }
    }
}
