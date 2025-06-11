import {
    handleGameEvents,
    handlePlayerEvents,
    handleScreenEvents,
} from '../services/handlers/index.js';

export const handleSocketConnection = (socket, io) => {
    handleGameEvents(socket, io);
    handlePlayerEvents(socket, io);
    handleScreenEvents(socket, io);
};
