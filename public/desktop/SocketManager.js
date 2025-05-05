//administra conexiones de socket

export default class SocketManager {
    constructor() {
        this.socket = null;
        this.eventHandlers = {};
    }

    connect() {
        // Connect to Socket.IO
        this.socket = io({
            path: '/real-time',
        });

        this.socket.on('connect', () => {
            console.log('Connected to server');

            // Trigger any connect handlers
            if (this.eventHandlers['connect']) {
                this.eventHandlers['connect'].forEach((handler) => handler());
            }
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');

            // Trigger any disconnect handlers
            if (this.eventHandlers['disconnect']) {
                this.eventHandlers['disconnect'].forEach((handler) =>
                    handler()
                );
            }
        });

        return this.socket;
    }

    joinRoom(roomId, type = 'desktop') {
        if (!this.socket) {
            console.error('Socket not connected');
            return;
        }

        this.socket.emit('join-room', {
            roomId: roomId,
            type: type,
        });
    }

    on(event, callback) {
        // Register a socket event handler
        if (!this.socket) {
            console.error('Socket not connected');
            return;
        }

        // Store event handler for potential cleanup
        if (!this.eventHandlers[event]) {
            this.eventHandlers[event] = [];
        }
        this.eventHandlers[event].push(callback);

        // Register with socket.io
        this.socket.on(event, callback);
    }

    off(event, callback) {
        // Remove a socket event handler
        if (!this.socket) return;

        if (callback) {
            // Remove specific callback
            this.socket.off(event, callback);

            // Also remove from our tracking
            if (this.eventHandlers[event]) {
                this.eventHandlers[event] = this.eventHandlers[event].filter(
                    (handler) => handler !== callback
                );
            }
        } else {
            // Remove all callbacks for this event
            this.socket.off(event);
            delete this.eventHandlers[event];
        }
    }

    emit(event, data) {
        if (!this.socket) {
            console.error('Socket not connected');
            return;
        }

        this.socket.emit(event, data);
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }
}
