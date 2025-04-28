const {Server} = require("socket.io");

let io;

const initSocketInstance = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });
};

const emitEvent = (eventName, data) => {
    if (!io) {
        throw new Error("Socket instance not initialized");
    }
    io.emit(eventName, data);
};

module.exports = {
    initSocketInstance,
    emitEvent,
}