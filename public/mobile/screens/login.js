import { navigateTo, socket } from "../app.js";
import {supabase} from "../../../server/services/supabase.service.js";

export default function renderLogin() {
    const appLogin = document.getElementById("app");
    appLogin.innerHTML = `
        <div class="container">
            <img src="https://raw.githubusercontent.com/SergioRP18/LOGO-Rock-Sync/8d5db4b18f637a0e113689fc5e10dff9166546d6/logo.svg" alt="Logo" class="logo" />
            <input type="text" id="username" placeholder="Introduce aquí tu username" />
            <button id="login-button">Unirme</button>
        </div>
    `;

    const loginButton = document.getElementById("login-button");
    loginButton.addEventListener("click", async () => {
        const username = document.getElementById("username").value;

        if (username.length < 3) {
            alert("El nombre de usuario debe tener al menos 3 caracteres.");
            return;
        }

        try {
            const { data: existingUser, error: fetchError } = await supabase
                .from("users")
                .select("*")
                .eq("username", username)
                .single();

            if (fetchError && fetchError.code !== "PGRST116") {
                alert("Error al verificar el usuario.");
                console.error(fetchError);
                return;
            }

            if (existingUser) {
                alert("El nombre de usuario ya está en uso. Por favor, elige otro.");
                return;
            }

            const { data, error } = await supabase
                .from("users")
                .insert([{ username }]);

            if (error) {
                alert("Error al crear el usuario.");
                console.error(error);
                return;
            }

            alert("Usuario creado exitosamente.");
            socket.emit("user-created", { username });
            navigateTo("/songs-selection", { username });
        } catch (err) {
            console.error("Error al conectar con Supabase:", err);
            alert("Ocurrió un error inesperado.");
        }
    });
};