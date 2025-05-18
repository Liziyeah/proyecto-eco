export default class GameScreen {
    constructor(socket) {
        this.socket = socket;
        this.element = document.createElement('div');
        this.element.className = 'game-screen';
        this.gameRunning = false;
        this.gameCanvas = null;
        this.gameCtx = null;
        this.notes = [];
        this.playerScores = [0, 0]; // Scores for player 1 and 2
        this.lastFrame = 0;
        this.noteSpeed = 3; // How fast notes fall
        this.COLUMN_WIDTH = 200; // Width of each column
        this.spawnInterval = 1500; // Time between note spawns (ms)
        this.lastSpawnTime = 0;
    }

    render() {
        this.element.innerHTML = `
            <h1>Rock & Sync</h1>
            
            <div id="gameArea">
                <canvas id="gameCanvas" width="400" height="600"></canvas>
                <div id="scoreDisplay">
                    <div>Player 1: <span id="scoreP1">0</span></div>
                    <div>Player 2: <span id="scoreP2">0</span></div>
                </div>
            </div>
        `;

        // Initialize game
        this.initGame();
        this.setupEventListeners();

        return this.element;
    }

    setupEventListeners() {
        // Listen for player button presses
        this.socket.on('player-press', this.handlePlayerPress.bind(this));
    }

    initGame() {
        this.gameCanvas = this.element.querySelector('#gameCanvas');
        this.gameCtx = this.gameCanvas.getContext('2d');

        // Set up game loop
        this.lastFrame = performance.now();
        this.animationFrame = requestAnimationFrame(this.gameLoop.bind(this));

        // Start the game
        this.startGame();
    }

    startGame() {
        this.gameRunning = true;
        this.playerScores = [0, 0];
        this.notes = [];
        this.lastSpawnTime = performance.now();

        // Update UI
        this.element.querySelector('#scoreP1').textContent = '0';
        this.element.querySelector('#scoreP2').textContent = '0';

        // Notify mobile clients that game is starting
        this.socket.emit('game-start');
    }

    gameLoop(timestamp) {
        if (!this.lastFrame) this.lastFrame = timestamp;
        const deltaTime = timestamp - this.lastFrame;
        this.lastFrame = timestamp;

        if (this.gameRunning) {
            // Clear canvas
            this.gameCtx.clearRect(
                0,
                0,
                this.gameCanvas.width,
                this.gameCanvas.height
            );

            // Draw game board
            this.drawBoard();

            // Spawn new notes
            if (timestamp - this.lastSpawnTime > this.spawnInterval) {
                this.spawnNote();
                this.lastSpawnTime = timestamp;
            }

            // Update and draw notes
            this.updateNotes(deltaTime);

            // Check for missed notes
            this.checkMissedNotes();
        }

        // Continue the game loop
        this.animationFrame = requestAnimationFrame(this.gameLoop.bind(this));
    }

    drawBoard() {
        // Draw column divider
        this.gameCtx.fillStyle = '#333';
        this.gameCtx.fillRect(
            this.COLUMN_WIDTH - 1,
            0,
            2,
            this.gameCanvas.height
        );

        // Draw target zone
        this.gameCtx.fillStyle = 'rgba(0, 255, 0, 0.3)';
        this.gameCtx.fillRect(
            0,
            this.gameCanvas.height - 50,
            this.gameCanvas.width,
            10
        );
    }

    spawnNote() {
        const column = Math.floor(Math.random() * 2); // 0 or 1

        this.notes.push({
            x: column * this.COLUMN_WIDTH,
            y: 0,
            width: this.COLUMN_WIDTH,
            height: 30,
            column: column,
            hit: false,
            missed: false,
        });
    }

    updateNotes(deltaTime) {
        for (let note of this.notes) {
            if (!note.hit && !note.missed) {
                // Move note down
                note.y += this.noteSpeed * (deltaTime / 16);

                // Draw note
                this.gameCtx.fillStyle =
                    note.column === 0 ? '#FF0000' : '#0000FF';
                this.gameCtx.fillRect(note.x, note.y, note.width, note.height);
            }
        }
    }

    checkMissedNotes() {
        for (let note of this.notes) {
            if (!note.hit && !note.missed && note.y > this.gameCanvas.height) {
                note.missed = true;
            }
        }

        // Remove notes that are off screen
        this.notes = this.notes.filter(
            (note) => !(note.missed && note.y > this.gameCanvas.height + 50)
        );
    }

    handlePlayerPress(data) {
        if (!this.gameRunning) return;

        const playerId = data.playerId;
        const column = data.column;

        // Convert from 0-based to 1-based for logging
        const playerNum = playerId + 1;
        console.log(`Player ${playerNum} pressed column ${column}`);

        // Check for hits
        for (let note of this.notes) {
            if (note.column === column && !note.hit && !note.missed) {
                // Check if note is in hit zone
                if (
                    note.y >= this.gameCanvas.height - 70 &&
                    note.y <= this.gameCanvas.height - 30
                ) {
                    note.hit = true;

                    // Add score for the correct player
                    this.playerScores[playerId]++;
                    this.element.querySelector(
                        `#scoreP${playerNum}`
                    ).textContent = this.playerScores[playerId];

                    break;
                }
            }
        }
    }

    destroy() {
        // Stop game loop
        cancelAnimationFrame(this.animationFrame);

        // Remove event listeners
        this.socket.off('player-press', this.handlePlayerPress);

        // Reset game variables
        this.gameRunning = false;
    }
}
