const users = new Map();

export const createUser = (socketId, username, roomCode) => {
    const user = {
        id: socketId,
        username: username,
        roomCode: roomCode,
        score: 0,
        ready: false,
    };

    users.set(socketId, user);

    return user;
};

export const getUser = (socketId) => {
    return users.get(socketId);
};

export const getUserByUsername = (username, roomCode) => {
    for (const user of users.values()) {
        if (user.username === username && user.roomCode === roomCode) {
            return user;
        }
    }

    return null;
};

export const updateUserScore = (socketId, score) => {
    const user = users.get(socketId);

    if (user) {
        user.score = score;
        users.set(socketId, user);
        console.log(`Updated score for user ${user.username}: ${score}`);
        return user;
    }

    return null;
};

export const setUserReady = (socketId, ready = true) => {
    const user = users.get(socketId);

    if (user) {
        user.ready = ready;

        users.set(socketId, user);

        return user;
    }

    return null;
};

export const removeUser = (socketId) => {
    return users.delete(socketId);
};

export const getUsersByRoom = (roomCode) => {
    const roomUsers = [];

    for (const user of users.values()) {
        if (user.roomCode === roomCode) {
            roomUsers.push(user);
        }
    }

    return roomUsers;
};

export const isUsernameAvailable = (username, roomCode) => {
    return !getUserByUsername(username, roomCode);
};

export const getUserCount = () => {
    return users.size;
};

export const getRoomUserCount = (roomCode) => {
    return getUsersByRoom(roomCode).length;
};
