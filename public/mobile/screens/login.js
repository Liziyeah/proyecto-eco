import { navigateTo, socket } from "../app.js";

export default function renderLogin() {
    const appLogin = document.getElementById("app");
    appLogin.innerHTML = `
        <div class="container">
            <img src="#" alt="Logo" class="logo" />
            <input type="text" id="username" placeholder="Introduce aquí tu username" />
            <button id="login-button">Unirme</button>
        </div>
    `;

    socket.on("next-screen", (data) => {
        navigateTo("/songs-selection", data);
    });
};