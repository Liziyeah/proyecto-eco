import { navigateTo, socket } from '../main.js';

export function renderScoreboardScreen(container, data = {}) {
    const { roomCode, results } = data;
    console.log('Initial results:', results);

    const songInfo = results?.song || null;

    // Show loading state initially
    container.innerHTML = `
        <main class="scoreboard-screen">
            <div class="scoreboard-header">
                <h1>Resultados Finales</h1>
                ${
                    songInfo
                        ? `<p class="song-played">Canción: ${songInfo.title}</p>`
                        : ''
                }
            </div>
            
            <div class="final-results">
                <div class="loading-results">
                    <div class="loading-spinner"></div>
                    <h2>Calculando resultados finales...</h2>
                    <p>Obteniendo puntuaciones de los jugadores</p>
                </div>
            </div>
        </main>
    `;

    // Function to fetch player scores from API
    async function fetchPlayerScores() {
        try {
            const response = await fetch(`/api/rooms/${roomCode}/players`);
            const data = await response.json();

            if (data.success && data.players) {
                console.log('Fetched player scores from API:', data.players);
                return data.players;
            } else {
                console.error('Failed to fetch player scores:', data.message);
                return [];
            }
        } catch (error) {
            console.error('Error fetching player scores:', error);
            return [];
        }
    }

    // Function to render the actual scoreboard
    function renderScoreboard(playerScores) {
        // Sort players by score
        const sortedResults = [...playerScores].sort(
            (a, b) => (b.score || 0) - (a.score || 0)
        );

        const finalResultsContainer = document.querySelector('.final-results');

        finalResultsContainer.innerHTML = `
            ${
                sortedResults.length > 0
                    ? sortedResults
                          .map((player, index) => {
                              const isWinner = index === 0;
                              const isSecond = index === 1;

                              return `
                        <div class="result-card ${
                            isWinner ? 'winner-card' : ''
                        } ${isSecond ? 'second' : ''}">
                            <div class="position">${getPositionText(
                                index + 1
                            )}</div>
                            <div class="player-name">${player.username}</div>
                            <div class="final-score">${
                                player.score || 0
                            } puntos</div>
                        </div>
                    `;
                          })
                          .join('')
                    : `
                    <div class="no-results">
                        <h2>No hay resultados disponibles</h2>
                        <p>Parece que hubo un problema al obtener los resultados del juego.</p>
                    </div>
                `
            }
        `;

        // Add confetti effect for winner
        if (sortedResults.length > 0 && sortedResults[0].score > 0) {
            setTimeout(() => {
                createConfettiEffect();
            }, 500);
        }
    }

    // Helper function to get position text with emojis
    function getPositionText(position) {
        switch (position) {
            case 1:
                return '1er Lugar';
            case 2:
                return '2do Lugar';
            case 3:
                return '3er Lugar';
            default:
                return `${position}° Lugar`;
        }
    }

    // Confetti effect function
    function createConfettiEffect() {
        const colors = ['#d49b9b', '#8b4a4a', '#a85555', '#6b3535'];
        const confettiCount = 50;

        for (let i = 0; i < confettiCount; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.cssText = `
                    position: fixed;
                    width: 10px;
                    height: 10px;
                    background: ${
                        colors[Math.floor(Math.random() * colors.length)]
                    };
                    left: ${Math.random() * 100}%;
                    top: -10px;
                    border-radius: 50%;
                    animation: confetti-fall ${
                        2 + Math.random() * 3
                    }s linear forwards;
                    z-index: 1000;
                    pointer-events: none;
                `;

                document.body.appendChild(confetti);

                setTimeout(() => {
                    if (confetti.parentNode) {
                        confetti.parentNode.removeChild(confetti);
                    }
                }, 5000);
            }, i * 100);
        }
    }

    // Add confetti animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes confetti-fall {
            0% {
                transform: translateY(-10px) rotate(0deg);
                opacity: 1;
            }
            100% {
                transform: translateY(100vh) rotate(360deg);
                opacity: 0;
            }
        }
        
        .loading-results {
            text-align: center;
            padding: 60px 20px;
        }
        
        .loading-spinner {
            border: 4px solid rgba(212, 155, 155, 0.3);
            border-radius: 50%;
            border-top: 4px solid #d49b9b;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .loading-results h2 {
            color: #d49b9b;
            font-size: 1.5rem;
            margin-bottom: 12px;
        }
        
        .loading-results p {
            color: #b8a0a0;
            font-size: 1rem;
        }
    `;
    document.head.appendChild(style);

    // Fetch scores with a small delay to ensure the server has processed everything
    setTimeout(async () => {
        const playerScores = await fetchPlayerScores();
        renderScoreboard(playerScores);
    }, 1000);

    // Cleanup function (minimal, solo para los estilos)
    const cleanup = () => {
        // Remove confetti animation styles
        if (style.parentNode) {
            style.parentNode.removeChild(style);
        }
    };

    // Store cleanup function
    container.cleanup = cleanup;
}
