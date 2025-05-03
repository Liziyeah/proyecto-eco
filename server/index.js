const express = require('express');
const path = require('path');
const { Server } = require('socket.io');
const { createServer } = require('http');
const { getLocalIP } = require('./utils/functions');

const port = 5050;
const app = express();
const server = createServer(app);
const io = new Server(server, {
    path: '/real-time',
    cors: {
        origin: '*',
    },
});

app.use(express.json());
app.use('/mobile', express.static(path.join(__dirname, '../public/mobile')));
app.use('/desktop', express.static(path.join(__dirname, '../public/desktop')));
app.get('*', (_, res) => {
    res.redirect('/desktop');
});

// let users = [];
// let nextUserId = 1;

// app.post('/users', (req, res) => {
//     const { userInput } = req.body;
//     const userId = nextUserId;
//     nextUserId++;

//     users.push({ id: userId, username: userInput });
//     res.status(201).send({ message: 'Registro completado', userId: userId });
// });

io.on('connection', (socket) => {
    socket.on('coordenadas', (data) => {
        console.log(data);
        io.emit('coordenadas', data);
    });
});

server.listen(port, () => {
    const ip = getLocalIP();
    console.log(`Servidor inicado en http://${ip}:${port}`);
});
