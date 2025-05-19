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

const rooms = {};

app.use(express.json());
app.get('/', (_, res) => {
    res.redirect('/desktop');
});
app.get('/mobile', (req, res) => {
    const roomId = req.query.roomId;

    if (!roomId) {
        return res.status(400).send('No room ID provided');
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
            desktopConnected: false,
            mobileClients: [],
            playerAssignments: {},
        };

        return res.redirect(`/desktop?roomId=${newRoomId}`);
    }

    if (!rooms[roomId]) {
        rooms[roomId] = {
            id: roomId,
            connectedClients: 0,
            maxClients: 2,
            desktopConnected: false,
            mobileClients: [], // Track mobile client sockets
            playerAssignments: {}, // Map socket IDs to player IDs
            playerStatus: {}, // Track player ready status
            selectedSong: null, // Store the selected song
            selectedDifficulty: null, // Store the selected difficulty
        };

        // Add this handler to the io.on('connection') block
        socket.on('player-ready', (data) => {
            const roomId = data.roomId;
            const playerId = data.playerId;
            const songId = data.songId;
            const difficulty = data.difficulty;

            if (!rooms[roomId]) return;

            // Mark this player as ready
            rooms[roomId].playerStatus[playerId] = 'ready';

            // Store song selection (first player to ready up decides)
            if (!rooms[roomId].selectedSong) {
                rooms[roomId].selectedSong = songId;
                rooms[roomId].selectedDifficulty = difficulty;
            }

            console.log(
                `Player ${playerId} ready in room ${roomId} - Selected song ${songId} (${difficulty})`
            );

            // Check if all players are ready
            const allPlayersReady =
                Object.keys(rooms[roomId].playerAssignments).length ===
                Object.keys(rooms[roomId].playerStatus).filter(
                    (id) => rooms[roomId].playerStatus[id] === 'ready'
                ).length;

            if (allPlayersReady && rooms[roomId].connectedClients >= 2) {
                // Notify everyone that all players are ready
                io.to(roomId).emit('all-players-ready', {
                    songId: rooms[roomId].selectedSong,
                    difficulty: rooms[roomId].selectedDifficulty,
                });

                console.log(
                    `All players ready in room ${roomId} - Starting game`
                );
            }
        });

        // Add API endpoint for songs (referenced in song-selection.js)
        app.get('/songs', (req, res) => {
            // Mock song data - in a real app, you'd fetch this from a database
            const songs = [
                {
                    id: 1,
                    title: 'Welcome to the Black Parade',
                    difficulty: 'Medio',
                    image: 'https://upload.wikimedia.org/wikipedia/en/7/72/My_Chemical_Romance_-_Welcome_to_the_Black_Parade_single_cover.jpg',
                },
                {
                    id: 2,
                    title: 'Helena',
                    difficulty: 'Fácil',
                    image: 'https://upload.wikimedia.org/wikipedia/en/d/d4/My_Chemical_Romance_-_Helena.png',
                },
                {
                    id: 3,
                    title: 'Famous Last Words',
                    difficulty: 'Difícil',
                    image: 'https://upload.wikimedia.org/wikipedia/en/1/19/Famous_Last_Words_single_cover.jpg',
                },
                {
                    id: 4,
                    title: 'Teenagers',
                    difficulty: 'Fácil',
                    image: 'https://upload.wikimedia.org/wikipedia/en/2/29/Teenagers_my_chemical_romance.jpg',
                },
                {
                    id: 5,
                    title: 'I’m Not Okay (I Promise)',
                    difficulty: 'Medio',
                    image: 'https://upload.wikimedia.org/wikipedia/en/1/16/I%27m_Not_Okay_%28I_Promise%29.jpg',
                },
            ];

            res.json(songs);
        });

        // Add a simple user creation endpoint (referenced in login.js)
        app.post('/users', express.json(), (req, res) => {
            const { username } = req.body;

            if (!username || username.length < 3) {
                return res
                    .status(400)
                    .json({ error: 'Username must be at least 3 characters' });
            }

            // In a real app, you'd save this to a database
            // For now, just generate a simple ID
            const userId = Date.now().toString();

            res.status(201).json({ id: userId, username });
        });
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
    socket.on('join-room', (data) => {
        const roomId = data.roomId;
        const type = data.type;

        if (!rooms[roomId]) {
            rooms[roomId] = {
                id: roomId,
                connectedClients: 0,
                maxClients: 2,
                desktopConnected: false,
                mobileClients: [],
                playerAssignments: {},
            };
        }

        if (type === 'desktop') {
            rooms[roomId].desktopConnected = true;
        } else if (type === 'mobile') {
            rooms[roomId].connectedClients++;
            rooms[roomId].mobileClients.push(socket.id);
        }

        socket.join(roomId);
        io.to(roomId).emit('room-status', rooms[roomId]);
    });

    socket.on('disconnect', () => {
        // Handle disconnection logic
    });
});

server.listen(port, () => {
    const ip = getLocalIP();
    console.log(`Servidor inicado en http://${ip}:${port}`);
});
