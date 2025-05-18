<<<<<<< HEAD

import { navigateTo } from "../app.js";

export default async function renderSongSelection() {
    const appSongSelection = document.getElementById("app");

    const response = await fetch("http://localhost:5050/songs", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
=======
import { navigateTo, socket } from '../app.js';

export default async function renderSongSelection({ roomId, playerId }) {
    const appSongSelection = document.getElementById('app');

    const response = await fetch('http://localhost:5050/songs', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
>>>>>>> 6315dfd2696790f7925d1e83b1c5be77a22a0ca2
        },
    });

    const responseJson = await response.json();
<<<<<<< HEAD

    const username = localStorage.getItem("username");

    const songList = responseJson.map(song => `
=======
    const username = localStorage.getItem('username');

    const songList = responseJson
        .map(
            (song) => `
>>>>>>> 6315dfd2696790f7925d1e83b1c5be77a22a0ca2
        <div class="songs">
            <span>${song.title}</span>
            <img src="${song.image}" alt="image-song">
            <span>${song.difficulty}</span>
        </div>
<<<<<<< HEAD
    `).join('');
=======
    `
        )
        .join('');
>>>>>>> 6315dfd2696790f7925d1e83b1c5be77a22a0ca2

    appSongSelection.innerHTML = `
        <div class="container">
            <div class="user-card">
                <img src="https://earth-rider.com/wp-content/uploads/2013/02/icon-rock-n-roll-guitarist.png" alt="user-profile">
                <span>${username}</span>
            </div>
            <div class="selector-difficult">
                <ul>
                    <li><button>Fácil</button></li>
                    <li><button>Medio</button></li>
                    <li><button>Difícil</button></li>
                </ul>
            </div>
            <div class="song">
                <img src="#" alt="image-song">
                <h1>Title</h1>
                <button id="join-game">Listo</button>
            </div>
            <div class="selector-mode">
                <ul>
                    <li><button>Solo</button></li>
                    <li><button>1vs1</button></li>
                </ul>
            </div>
            <div class="list-songs">
                <h1>LISTA DE CANCIONES</h1>
                <div class="songs">
                    ${songList}
                </div>
            </div>
        </div>
    `;

<<<<<<< HEAD
    const goJoinGame = document.getElementById("join-game");

    goJoinGame.addEventListener("click", () => {
        navigateTo("/game");
    });
}
=======
    const goJoinGame = document.getElementById('join-game');

    goJoinGame.addEventListener('click', () => {
        socket.emit('player-ready', { roomId, playerId });

        goJoinGame.textContent = 'Esperando al otro jugador...';
        goJoinGame.disabled = true;
    });

    socket.on('all-players-ready', () => {
        navigateTo('game', { roomId, playerId });
    });
}
>>>>>>> 6315dfd2696790f7925d1e83b1c5be77a22a0ca2
