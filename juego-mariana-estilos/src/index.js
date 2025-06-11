import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import apiRoutes from './routes/api.js';
import gameRoutes from './routes/game.js';
import mobileRoutes from './routes/mobile.js';
import { handleSocketConnection } from './controllers/socketController.js';
import { getLocalIP } from './lib/utils.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});

// Middleware
app.use(cors());
app.use(express.json());

// routes
app.get('/', (_, res) => {
    res.redirect('/game');
});
app.use('/game', gameRoutes);
app.use('/mobile', mobileRoutes);
app.use('/api', apiRoutes);

// Socket.IO setup
io.on('connection', (socket) => handleSocketConnection(socket, io));

// Start server
const PORT = process.env.PORT || 3000;
const localIP = getLocalIP();

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Local access: http://localhost:${PORT}`);
    console.log(`Network access: http://${localIP}:${PORT}/game`);
});
