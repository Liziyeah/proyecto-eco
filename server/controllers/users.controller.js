const {getAllUsers, createUser, updateUser} = require("../db/users.db");

const getUsers = async (req, res) => {
    const users = await getAllUsers();
    res.send(users);
};

const createUser = async (req, res) => {
    const {id: userId, username} = req.body;
    const response = await createUser(userId, {username});
    res.send(response);
};

const updateUser = async (req, res) => {
    const {id: userId} = req.params;
    const {username} = req.body;
    const response = await updateUser(userId, {username});
    res.send(response);
};

module.exports = {
    getUsers,
    createUser,
    updateUser,
}