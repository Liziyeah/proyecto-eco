import {
    createUser,
    removeUser,
    getUsersByRoom,
    isUsernameAvailable,
    getUser,
    updateUserScore,
} from './userService.js';

const rooms = new Map();

const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const createGameRoom = () => {
    const roomCode = generateRoomCode();
    const room = {
        code: roomCode,
        players: [],
        maxPlayers: 2,
        status: 'waiting',
        timeout: null,
    };

    // Set room deletion timeout (1 minute)
    room.timeout = setTimeout(() => {
        deleteRoom(roomCode);
        console.log(`Room ${roomCode} deleted due to inactivity`);
    }, 60000 * 5); // 5 minutes

    rooms.set(roomCode, room);
    console.log(`Room created: ${roomCode}`);
    return room;
};

export const joinRoom = (roomCode, socketId, username) => {
    const room = getRoom(roomCode);

    console.log(room);

    if (!room) {
        return { success: false, message: 'Room not found' };
    }

    if (room.players.length >= 2) {
        return { success: false, message: 'Room is full' };
    }

    // Check if username is available using user service
    if (!isUsernameAvailable(username, roomCode)) {
        return { success: false, message: 'Username already taken' };
    }

    // Create user and add to room
    const user = createUser(socketId, username, roomCode);

    room.players.push({
        id: socketId,
        username: user.username,
        ready: false, // Add ready state to room players
    });

    // Clear timeout if room has players
    if (room.timeout) {
        clearTimeout(room.timeout);
        room.timeout = null;
    }

    // Update room status
    if (room.players.length === 2) {
        room.status = 'ready';
    }

    rooms.set(roomCode, room);

    console.log(`Player ${username} joined room ${roomCode}`);
    return { success: true, room, user };
};

export const canStartGame = (roomCode) => {
    const room = rooms.get(roomCode);

    if (!room) {
        return false;
    }

    const users = getUsersByRoom(roomCode);
    const allReady = users.every((player) => player.ready);

    if (allReady && users.length >= 2) {
        return true;
    }

    return false;
};

export const leaveRoom = (roomCode, socketId) => {
    const room = rooms.get(roomCode);

    if (!room) {
        return { success: false, message: 'Room not found' };
    }

    // Remove user from user service
    removeUser(socketId);

    // Remove player from room
    room.players = room.players.filter((player) => player.id !== socketId);

    // If room is empty, set deletion timeout
    if (room.players.length === 0) {
        room.timeout = setTimeout(() => {
            deleteRoom(roomCode);
            console.log(`Room ${roomCode} deleted due to emptiness`);
        }, 60000);
        room.status = 'waiting';
    } else {
        room.status = 'waiting';
    }

    rooms.set(roomCode, room);

    console.log(`Player left room ${roomCode}`);
    return { success: true, room };
};

export const updatePlayerScore = (socketId, score) => {
    const user = getUser(socketId);

    if (!user) {
        return { success: false, message: 'User not found' };
    }

    const room = rooms.get(user.roomCode);

    if (!room) {
        return { success: false, message: 'Room not found' };
    }

    // Update score in room
    updateUserScore(socketId, score);

    return { success: true, room, user };
};

export const getRoomPlayers = (roomCode) => {
    const users = getUsersByRoom(roomCode);
    const room = getRoom(roomCode);

    if (!room) return users;

    // Merge room player data with user data
    return users.map((user) => {
        const roomPlayer = room.players.find((p) => p.id === user.id);
        return {
            ...user,
            ready: roomPlayer ? roomPlayer.ready : user.ready,
        };
    });
};

export const getRoom = (roomCode) => {
    return rooms.get(roomCode);
};

export const deleteRoom = (roomCode) => {
    const room = rooms.get(roomCode);

    if (room && room.timeout) {
        clearTimeout(room.timeout);
    }

    return rooms.delete(roomCode);
};
