export let gameRunning = false;
export let gameCanvas, gameCtx;
export let notes = [];
export let playerScores = [0, 0];
let lastFrame = 0;
const noteSpeed = 3;
const COLUMN_WIDTH = 200;
const spawnInterval = 1500;
let lastSpawnTime = 0;

function renderGame(appState, { navigateTo }) {
    const html = `
        <div id="gameArea">
            <canvas id="gameCanvas" width="400" height="600"></canvas>
            <div id="scoreDisplay">
                <div>Player 1: <span id="scoreP1">0</span></div>
                <div>Player 2: <span id="scoreP2">0</span></div>
            </div>
            <button id="startGameBtn">Start Game</button>
        </div>
    `;
    document.getElementById('app').innerHTML = html;
    initGame();
}
export default renderGame;

export function initGame() {
    gameCanvas = document.getElementById('gameCanvas');
    gameCtx = gameCanvas.getContext('2d');
    requestAnimationFrame(gameLoop);
}

function gameLoop(timestamp) {
    if (!lastFrame) lastFrame = timestamp;
    const deltaTime = timestamp - lastFrame;
    lastFrame = timestamp;

    if (gameRunning) {
        gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
        drawBoard();
        if (timestamp - lastSpawnTime > spawnInterval) {
            spawnNote();
            lastSpawnTime = timestamp;
        }
        updateNotes(deltaTime);
        checkMissedNotes();
    }

    requestAnimationFrame(gameLoop);
}

function drawBoard() {
    gameCtx.fillStyle = '#333';
    gameCtx.fillRect(COLUMN_WIDTH - 1, 0, 2, gameCanvas.height);
    gameCtx.fillStyle = 'rgba(0, 255, 0, 0.3)';
    gameCtx.fillRect(0, gameCanvas.height - 50, gameCanvas.width, 10);
}

function spawnNote() {
    const column = Math.floor(Math.random() * 2);
    notes.push({ x: column * COLUMN_WIDTH, y: 0, width: COLUMN_WIDTH, height: 30, column, hit: false, missed: false });
}

function updateNotes(deltaTime) {
    for (let note of notes) {
        if (!note.hit && !note.missed) {
            note.y += noteSpeed * (deltaTime / 16);
            gameCtx.fillStyle = note.column === 0 ? '#FF0000' : '#0000FF';
            gameCtx.fillRect(note.x, note.y, note.width, note.height);
        }
    }
}

function checkMissedNotes() {
    for (let note of notes) {
        if (!note.hit && !note.missed && note.y > gameCanvas.height) {
            note.missed = true;
        }
    }
    notes = notes.filter(note => !(note.missed && note.y > gameCanvas.height + 50));
}

export function handlePlayerPress(playerId, column) {
    if (!gameRunning) return;
    const playerNum = playerId + 1;
    for (let note of notes) {
        if (note.column === column && !note.hit && !note.missed) {
            if (note.y >= gameCanvas.height - 70 && note.y <= gameCanvas.height - 30) {
                note.hit = true;
                playerScores[playerId]++;
                document.getElementById(`scoreP${playerNum}`).textContent = playerScores[playerId];
                break;
            }
        }
    }
}

export function startGame(socket) {
    gameRunning = true;
    playerScores = [0, 0];
    notes = [];
    lastSpawnTime = performance.now();
    document.getElementById('scoreP1').textContent = '0';
    document.getElementById('scoreP2').textContent = '0';
    socket.emit('game-start');
}
