import { navigateTo } from "../app.js";

export default function renderLoading() {
    const appLoading = document.getElementById("app");
    appLoading.innerHTML = `
        <div class="container">
            <img src="#" alt="Logo" class="logo" />
            <h1>Loading...</h1>
        </div>
    `;

    setTimeout(() => {
        navigateTo("/login");
    }, 2000);
}