import { navigateTo } from "../app.js";

export default function renderSongSelection() {
    const appSongSelection = document.getElementById("app");
    appSongSelection.innerHTML = `
        <div class="container">
            <div class="user-card">
                <img src="#" alt="user-profile">
                <span>username</span>
                <span>score</span>
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
                <button id="join-game">Juega Ahora</button>
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
                    <span>title</span>
                    <img src="#" alt="image-song">
                    <span>dificultad</span>
                </div>
            </div>
        </div>
    `;

    const goJoinGame = document.getElementById("join-game");

    goJoinGame.addEventListener("click", () => {
        navigateTo("/game");
    });
}