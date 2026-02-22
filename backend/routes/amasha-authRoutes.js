import express from 'express';
import { login, refresh, logout } from '../controllers/amasha-authController.js';
import loginLimiter from '../middleware/amasha-loginLimiter.js';

const router = express.Router();

router.post('/login', loginLimiter, login);
router.get('/refresh', refresh);
router.post('/logout', logout);

export default router;