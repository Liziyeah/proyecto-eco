import { createGameRoom, getRoom } from '../services/roomService.js';
import path from 'path';
import { dirname } from '../lib/utils.js';

const __dirname = dirname(import.meta);

export const createRoom = async (req, res) => {
    const roomCode = req.query.rc || null;
    let room = getRoom(roomCode);

    if (!roomCode || !room) {
        room = createGameRoom();

        res.redirect(`/game?rc=${room.code}`);

        return;
    }

    res.sendFile(path.join(__dirname, '../../public/game/index.html'));
};
