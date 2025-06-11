import express, { Router } from 'express';
import { dirname } from '../lib/utils.js';
import path from 'path';
import { mobileController } from '../controllers/mobileController.js';

const __dirname = dirname(import.meta);
const router = Router();

// Controller route
router.get('/', mobileController);
router.use('/', express.static(path.join(__dirname, '../../public/mobile')));

export default router;
