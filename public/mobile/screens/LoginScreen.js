export class LoginScreen {
    constructor(container, socket, roomId, onLoginSuccess) {
        this.container = container;
        this.socket = socket;
        this.roomId = roomId;
        this.onLoginSuccess = onLoginSuccess;
    }

    render() {
        this.container.innerHTML = `
            <div class="login-screen">
                <img src="https://raw.githubusercontent.com/SergioRP18/LOGO-Rock-Sync/8d5db4b18f637a0e113689fc5e10dff9166546d6/logo.svg" alt="Logo" class="logo" />
                <h2>¡Bienvenido a Rock & Sync!</h2>
                <div class="room-info">
                    <p>Sala ID: <span id="roomIdDisplay">${this.roomId}</span></p>
                </div>
                <div class="login-form">
                    <input type="text" id="username" placeholder="Introduce tu nombre de usuario" />
                    <button id="login-button">Unirme</button>
                </div>
            </div>
        `;

        // Set up button handler
        const loginButton = this.container.querySelector('#login-button');
        loginButton.addEventListener('click', this.handleLogin.bind(this));

        // Also allow pressing Enter
        const usernameInput = this.container.querySelector('#username');
        usernameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleLogin();
            }
        });
    }

    handleLogin() {
        const username = this.container.querySelector('#username').value;

        if (username.length < 3) {
            alert('El nombre de usuario debe tener al menos 3 caracteres.');
            return;
        }

        // Store username for later
        localStorage.setItem('username', username);

        // Proceed to song selection
        this.onLoginSuccess();
    }

    updateConnectionStatus(status) {
        // Could add connection status indicator if needed
    }
}
