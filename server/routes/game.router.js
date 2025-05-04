// Initialize socket connection
const socket = io({
    path: '/real-time',
});

// Clear the app container
function clearApp() {
    document.getElementById('app').innerHTML = '';
}

// Current route object
let route = { path: '/', data: {} };

// Render the appropriate component based on the current route
function renderRoute(currentRoute) {
    switch (currentRoute?.path) {
        case '/':
            clearApp();
            import('../screens/welcome.js').then((module) => {
                module.default(currentRoute?.data);
            });
            break;

        case '/waiting':
            clearApp();
            import('../screens/waiting.js').then((module) => {
                module.default(currentRoute?.data);
            });
            break;

        case '/game':
            clearApp();
            import('../screens/game.js').then((module) => {
                module.default(currentRoute?.data);
            });
            break;

        case '/results':
            clearApp();
            import('../screens/results.js').then((module) => {
                module.default(currentRoute?.data);
            });
            break;

        default:
            const app = document.getElementById('app');
            app.innerHTML = `<h1>404 - Not Found</h1><p>The page you are looking for does not exist.</p>`;
    }
}

// Navigate to a new route
function navigateTo(path, data = {}) {
    route = { path, data };
    history.pushState(data, '', path);
    renderRoute(route);
}

// Handle browser back/forward navigation
window.addEventListener('popstate', (event) => {
    route = { path: window.location.pathname, data: event.state || {} };
    renderRoute(route);
});

// Initial route rendering
renderRoute(route);

export { socket, navigateTo };
