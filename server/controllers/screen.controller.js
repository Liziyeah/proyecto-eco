const {emitEvent} = require("../services/socket.service");

const handleChangeScreenEvent = (req, res) => {
    emitEvent("next-screen");
    res.send({message: "Screen changed"});
};

module.exports = {
    handleChangeScreenEvent,
}