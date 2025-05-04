import renderLoading from "./screens/loading.js";
import renderLogin from "./screens/login.js";
import renderSongSelection from "./screens/song-selection.js";

const socket = io("/", { path: "/real-time" });

function clearScripts() {
    document.getElementById("app").innerHTML = "";
};

let route = { path: "/", data: {}};
renderRoute(route);

function renderRoute(currentRoute) {
    switch (currentRoute?.path) {
        case "/":
            clearScripts();
            renderLoading(currentRoute?.data);
            break;
        
        case "/login":
            clearScripts();
            renderLogin(currentRoute?.data);
            break;
        
        case "/songs-selection":
            clearScripts();
            renderSongSelection(currentRoute?.data);
            break;
        
        case "/game":  
            clearScripts();
            import("/game").then((module) => {
                module.default();
            });
            break;
        
        case "results":
            clearScripts();
            import("/results").then((module) => {
                module.default();
            });
            break;
        
            default:
                const app = document.getElementById("app");
                app.innerHTML = `<h1>404 - Not Found</h1><p>The page you are looking for does not exist.</p>`;
    }
};

function navigateTo(path, data = {}) {
    route = { path, data };
    history.pushState(data, "", path);
    renderRoute(route);
};

async function makeRequest(url, method, body) {
    const BASE_URL = "htttp://localhost:5050";
    let response = await fetch(`${BASE_URL}${url}`, {
        method: method,
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    response = await response.json();

    return response;
}

export { socket, navigateTo, makeRequest };