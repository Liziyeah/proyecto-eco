const {getAllUsers} = require("../db/users.db");

const getUsers = async (req, res) => {
    const users = await getAllUsers();
    res.send(users);
};

const createUser = async (req, res) => {
    const {id, username} = req.body;
    const response = await createUser({id, username});
    res.send(response);
};

const updateUser = async (req, res) => {
    const {id} = req.params;
    const {username} = req.body;
    const response = await updateUser(id, username);
    res.send(response);
};

module.exports = {
    getUsers,
    createUser,
    updateUser,
}