import { getRoom } from '../services/roomService.js';
import path from 'path';
import { dirname } from '../lib/utils.js';

const __dirname = dirname(import.meta);

export const mobileController = (req, res) => {
    const roomCode = req.query.rc || null;
    const room = getRoom(roomCode);

    if (!roomCode || !room) {
        res.status(404).send('Room not found or invalid room code.');

        return;
    }

    res.sendFile(path.join(__dirname, '../../public/mobile/index.html'));
};
