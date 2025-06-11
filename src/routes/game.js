import express, { Router } from 'express';
import { createRoom } from '../controllers/gameController.js';
import { dirname } from '../lib/utils.js';
import path from 'path';

const __dirname = dirname(import.meta);

const router = Router();

// Room routes
router.get('/', createRoom);
router.use('/', express.static(path.join(__dirname, '../../public/game')));

export default router;
