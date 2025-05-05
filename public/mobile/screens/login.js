import { navigateTo, socket } from '../app.js';

export default function renderLogin() {
    const appLogin = document.getElementById('app');
    appLogin.innerHTML = `
        <div class="container">
            <img src="https://raw.githubusercontent.com/SergioRP18/LOGO-Rock-Sync/8d5db4b18f637a0e113689fc5e10dff9166546d6/logo.svg" alt="Logo" class="logo" />
            <input type="text" id="username" placeholder="Introduce aquí tu username" />
            <button id="login-button">Unirme</button>
        </div>
    `;

    const loginButton = document.getElementById('login-button');
    loginButton.addEventListener('click', async () => {
        const username = document.getElementById('username').value;

        if (username.length < 3) {
            alert('El nombre de usuario debe tener al menos 3 caracteres.');
            return;
        }

        try {
            const response = await fetch('http://localhost:5050/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username }),
            });

            const data = await response.json();

            alert('Usuario creado exitosamente.');
            const userId = data.id;

            socket.emit('user-created', { username, userId });
            localStorage.setItem("username", username);
            navigateTo('/songs-selection', { username, userId });
            
        } catch (err) {
            console.error('Error al conectar con Supabase:', err);
            alert('Ocurrió un error inesperado.');
        }
    });
}
