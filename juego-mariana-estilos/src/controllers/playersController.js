import { getRoom, getRoomPlayers } from '../services/roomService.js';
import { getUsersByRoom } from '../services/userService.js';

export const getPlayersByRoom = (req, res) => {
    const { roomCode } = req.params;

    if (!roomCode) {
        return res.status(400).json({
            success: false,
            message: 'Room code is required',
        });
    }

    const room = getRoom(roomCode);

    if (!room) {
        return res.status(404).json({
            success: false,
            message: 'Room not found',
        });
    }

    // Get complete player information
    const players = getRoomPlayers(roomCode);

    res.json({
        success: true,
        roomCode: roomCode,
        playerCount: players.length,
        maxPlayers: room.maxPlayers || 2,
        players: players.map((player) => ({
            id: player.id,
            username: player.username,
            score: player.score || 0,
            ready: player.ready || false,
            roomCode: player.roomCode,
        })),
    });
};

export const getPlayerById = (req, res) => {
    const { roomCode, playerId } = req.params;

    if (!roomCode || !playerId) {
        return res.status(400).json({
            success: false,
            message: 'Room code and player ID are required',
        });
    }

    const room = getRoom(roomCode);

    if (!room) {
        return res.status(404).json({
            success: false,
            message: 'Room not found',
        });
    }

    const players = getRoomPlayers(roomCode);
    const player = players.find((p) => p.id === playerId);

    if (!player) {
        return res.status(404).json({
            success: false,
            message: 'Player not found in this room',
        });
    }

    res.json({
        success: true,
        player: {
            id: player.id,
            username: player.username,
            score: player.score || 0,
            ready: player.ready || false,
            roomCode: player.roomCode,
        },
    });
};
