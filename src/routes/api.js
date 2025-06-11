import { Router } from 'express';
import { getRoomInfo } from '../controllers/roomController.js';
import {
    getPlayersByRoom,
    getPlayerById,
} from '../controllers/playersController.js';
import { submitUserData } from '../controllers/userDataController.js';

const router = Router();

// Room routes
router.get('/rooms/:roomCode', getRoomInfo);

// Players routes
router.get('/rooms/:roomCode/players', getPlayersByRoom);
router.get('/rooms/:roomCode/players/:playerId', getPlayerById);

// User data routes
router.post('/user-data', submitUserData);

export default router;
