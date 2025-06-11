import { navigateTo, socket } from '../main.js';

export function renderLobbyScreen(container, data) {
    let players = [];
    const roomCode = data.roomCode;

    container.innerHTML = `
        <main class="lobby-screen">
            <div class="lobby-header">
                <div class="header-content">
                    <div class="logo-section">
                        <img src="/game/assets/images/logo.png" alt="Rock and Sync" class="logo" />
                    </div>
                    <div class="qr-section">
                        <div class="room-code">
                            <h2>${roomCode}</h2>
                            <div id="qr-code"></div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="lobby-players">
                <h2>Jugadores</h2>
                <ul id="player-list">
                    ${
                        players.length > 0
                            ? players
                                  .map(
                                      (player) => `
                    <li>
                        <span class="player-name">${player.username}</span>
                        <span class="player-status">${
                            player.ready ? 'Listo' : 'Esperando'
                        }</span>
                    </li>
                    `
                                  )
                                  .join('')
                            : `<li class="no-players">No hay jugadores en la sala</li>`
                    }
                </ul>
            </div>
            <button id="start-game" class="btn">Iniciar Juego</button>
        </main>
    `;

    socket.emit('screen:join', roomCode);

    const mobileUrl = `${window.location.origin}/mobile?rc=${roomCode}`;
    const qrCodeContainer = document.getElementById('qr-code');

    new QRCode(qrCodeContainer, {
        text: mobileUrl,
        width: 200,
        height: 200,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.M,
    });

    function updatePlayerList() {
        const playerList = document.getElementById('player-list');
        const startButton = document.getElementById('start-game');

        if (players.length > 0) {
            playerList.innerHTML = players
                .map(
                    (player) => `
                <li>
                    <span class="player-name">${player.username}</span>
                    <span class="player-status ${
                        player.ready ? 'ready' : 'waiting'
                    }">${player.ready ? '✓ Listo' : '⏳ Esperando'}</span>
                </li>
                `
                )
                .join('');
        } else {
            playerList.innerHTML = `<li class="no-players">No hay jugadores en la sala</li>`;
        }

        // Enable start button only if we have 2 players
        const canStart = players.length === 2;
        startButton.disabled = !canStart;
        startButton.style.opacity = canStart ? '1' : '0.5';

        // Auto-navigate to song selection when we have 2 players
        if (players.length === 2) {
            setTimeout(() => {
                navigateTo('/song-selection', { roomCode, players });
            }, 2000); // Reduced delay to 2 seconds
        }
    }

    socket.on('player:joined', (playerData) => {
        const existingPlayer = players.find(
            (p) => p.playerId === playerData.playerId
        );
        if (!existingPlayer) {
            players.push({
                playerId: playerData.playerId,
                username: playerData.username,
                ready: false,
            });
            updatePlayerList();
        }
    });

    socket.on('player:status', (statusData) => {
        const player = players.find((p) => p.playerId === statusData.playerId);
        if (player) {
            player.ready = statusData.ready;
            updatePlayerList();
        }
    });

    document.getElementById('start-game').addEventListener('click', () => {
        if (players.length === 2) {
            navigateTo('/song-selection', { roomCode, players });
        }
    });

    updatePlayerList();
}
