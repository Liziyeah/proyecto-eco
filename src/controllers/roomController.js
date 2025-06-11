import { getRoom } from '../services/roomService.js';

export const getRoomInfo = (req, res) => {
    const { roomCode } = req.params;
    const room = getRoom(roomCode);

    if (!room) {
        return res.status(404).json({
            success: false,
            message: 'Room not found',
        });
    }

    res.json({
        success: true,
        room: {
            code: room.code,
            players: room.players,
            playerCount: room.players.length,
            maxPlayers: 2,
            status: room.status,
        },
    });
};
