// login.js - Pantalla de inicio de sesión
export default function renderLogin(state, { navigateTo, registerUser }) {
    const app = document.getElementById("app");
    
    app.innerHTML = `
      <div id="login">
        <h1>Rock & Sync</h1>
        <div>
          <input id="username-input" type="text" placeholder="Introduce tu username">
          <button id="join-btn">Unirme</button>
        </div>
        <p id="error-message" style="color: red; display: none;">El nombre de usuario es inválido</p>
      </div>
    `;
    
    const usernameInput = document.getElementById("username-input");
    const joinBtn = document.getElementById("join-btn");
    const errorMessage = document.getElementById("error-message");
    
    joinBtn.addEventListener("click", () => {
      const username = usernameInput.value.trim();
      if (!username) {
        errorMessage.style.display = "block";
        return;
      }
      
      const success = registerUser(username);
      if (!success) {
        errorMessage.style.display = "block";
      }
    });
    
    usernameInput.addEventListener("input", () => {
      errorMessage.style.display = "none";
    });
  }