const express = require('express');
const path = require('path');
const { Server } = require('socket.io');
const { createServer } = require('http');
const { getLocalIP, generarGameId } = require('./utils/functions');

const port = 5050;
const app = express();
const server = createServer(app);
const io = new Server(server, {
    path: '/real-time',
    cors: {
        origin: '*',
    },
});

// Room management
const rooms = {};

app.use(express.json());
app.get('/', (_, res) => {
    res.redirect('/desktop');
});
app.get('/mobile', (req, res) => {
    const roomId = req.query.roomId;

    if (!roomId) {
        return res.status(404).send('No room id provided');
    }

    if (!rooms[roomId]) {
        return res.status(404).send('Room not found');
    }

    res.sendFile(path.join(__dirname, '../public/mobile/index.html'));
});
app.use('/mobile', express.static(path.join(__dirname, '../public/mobile')));
app.get('/desktop', (req, res) => {
    const roomId = req.query.roomId;

    if (!roomId) {
        const newRoomId = generarGameId();

        // Initialize the room
        rooms[newRoomId] = {
            id: newRoomId,
            connectedClients: 0,
            maxClients: 2,
        };

        return res.redirect(`/desktop?roomId=${newRoomId}`);
    }

    // If the room doesn't exist, create it
    if (!rooms[roomId]) {
        rooms[roomId] = {
            id: roomId,
            connectedClients: 0,
            maxClients: 2,
        };
    }

    res.sendFile(path.join(__dirname, '../public/desktop/index.html'));
});
app.use('/desktop', express.static(path.join(__dirname, '../public/desktop')));

// Room status API endpoint
app.get('/api/room/:roomId', (req, res) => {
    const roomId = req.params.roomId;

    if (!rooms[roomId]) {
        return res.status(404).json({ error: 'Room not found' });
    }

    res.json(rooms[roomId]);
});

io.on('connection', (socket) => {
    // Track which room this socket is part of
    let currentRoom = null;

    socket.on('join-room', (roomId) => {
        // Check if room exists
        if (!rooms[roomId]) {
            rooms[roomId] = {
                id: roomId,
                connectedClients: 0,
                maxClients: 2,
            };
        }

        // Check if room is full
        if (rooms[roomId].connectedClients >= rooms[roomId].maxClients) {
            socket.emit('room-full');
            return;
        }

        // Join the room
        socket.join(roomId);
        currentRoom = roomId;
        rooms[roomId].connectedClients++;

        // Notify everyone in the room about the new count
        io.to(roomId).emit('room-status', {
            id: roomId,
            connectedClients: rooms[roomId].connectedClients,
            maxClients: rooms[roomId].maxClients,
        });

        console.log(
            `Client joined room ${roomId} - Connected: ${rooms[roomId].connectedClients}`
        );
    });

    socket.on('coordenadas', (data) => {
        if (currentRoom) {
            // Only emit to the specific room
            io.to(currentRoom).emit('coordenadas', data);
        }
    });

    socket.on('disconnect', () => {
        // Remove from room when user disconnects
        if (currentRoom && rooms[currentRoom]) {
            rooms[currentRoom].connectedClients--;

            // Notify remaining users
            io.to(currentRoom).emit('room-status', {
                id: currentRoom,
                connectedClients: rooms[currentRoom].connectedClients,
                maxClients: rooms[currentRoom].maxClients,
            });

            console.log(
                `Client left room ${currentRoom} - Connected: ${rooms[currentRoom].connectedClients}`
            );

            // Clean up empty rooms after some time
            if (rooms[currentRoom].connectedClients === 0) {
                setTimeout(() => {
                    if (
                        rooms[currentRoom] &&
                        rooms[currentRoom].connectedClients === 0
                    ) {
                        delete rooms[currentRoom];
                        console.log(
                            `Room ${currentRoom} removed due to inactivity`
                        );
                    }
                }, 60000); // Remove after 1 minute of inactivity
            }
        }
    });
});

server.listen(port, () => {
    const ip = getLocalIP();
    console.log(`Servidor inicado en http://${ip}:${port}`);
});
