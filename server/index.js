const express = require('express');
const cors = require('cors');
const path = require('path');
const { Server } = require('socket.io');
const { createServer } = require('http');
const { getSongs } = require('./db/songs.db.js');
const { getAllUsers } = require('./db/users.db.js');
const { createUser } = require('./db/users.db.js');


const app = express();

const httpServer = createServer(app);

const io = new Server(httpServer, {
    path: '/real-time',
    cors: {
        origin: '*',
    },
});

app.use(cors());
app.use(express.json());
app.use('/mobile', express.static(path.join(__dirname, '../public/mobile')));
app.use('/desktop', express.static(path.join(__dirname, '../public/desktop')));


app.post('/users', async (req, res) => {
    const { username } = req.body;

    if (!username) {
        return res.status(400).send({ error: 'Username es requerido' });
    }

    try {
        const newUser = await createUser({ username });
        res.status(201).send(newUser[0]);
    } catch (error) {
        console.error('Error al crear usuario:', error);
        res.status(500).send({ error: 'Error interno del servidor' });
    }
});

app.get("/songs", async (req, res) => {
    const songs = await getSongs();
    res.send(songs);
});

app.get("/users", async (req, res) => {
    const users = await getAllUsers();
    res.send(users);
});

io.on('connection', (socket) => {
    socket.on('coordenadas', (data) => {
        console.log(data);
        io.emit('coordenadas', data);
    });
});

httpServer.listen(5050);
