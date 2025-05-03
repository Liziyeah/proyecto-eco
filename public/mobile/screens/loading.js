import { navigateTo } from "../app.js";

export default function renderLoading() {
    const appLoading = document.getElementById("app");
    appLoading.innerHTML = `
        <div class="container">
            <img src="https://raw.githubusercontent.com/SergioRP18/LOGO-Rock-Sync/8d5db4b18f637a0e113689fc5e10dff9166546d6/logo.svg" alt="Logo" class="logo" />
            <h1>Loading...</h1>
        </div>
    `;

    setTimeout(() => {
        navigateTo("/login");
    }, 2000);
}