import { getRoom } from '../roomService.js';

export const handleScreenEvents = (socket, io) => {
    socket.on('screen:join', (roomCode) => {
        const room = getRoom(roomCode);

        if (!room) {
            return;
        }

        // Join the screen to the room
        socket.join(roomCode);
        console.log(`Screen joined room ${roomCode}`);

        socket.roomCode = roomCode;
        socket.isScreen = true;

        // Notify players that screen is connected
        io.to(roomCode).emit('screen:connected', {
            message: 'Screen connected to room',
        });
    });

    socket.on('disconnect', () => {
        if (socket.isScreen && socket.roomCode) {
            console.log(`Screen disconnected from room: ${socket.roomCode}`);

            io.to(socket.roomCode).emit('screen:disconnected', {
                message: 'Screen disconnected',
            });
        }
    });
};
