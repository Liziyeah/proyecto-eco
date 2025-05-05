const os = require('node:os');

function getLocalIP() {
    const interfaces = os.networkInterfaces();

    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            // Evita direcciones internas (127.0.0.1) y que no sean IPv4
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

function generarGameId() {
    return Math.floor(Math.random() * 1000000).toString();
}

module.exports = {
    getLocalIP,
    generarGameId,
};
