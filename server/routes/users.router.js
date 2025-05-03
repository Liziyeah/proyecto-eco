const express = require('express');
const { getUsers, createUser, updateUser } = require('../controllers/users.controller');
const router = express.Router();

router.get('/users', getUsers);
router.post('/users', createUser);
router.patch('/users/:id', updateUser);

module.exports = router;