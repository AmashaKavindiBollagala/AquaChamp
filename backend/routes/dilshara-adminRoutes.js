import express from 'express';
import { createAdmin, adminLogin } from '../controllers/dilshara-adminController.js';
import verifyJWT from '../middleware/amasha-verifyJWT.js';
import { verifyRoles } from '../middleware/dilshara-verifyRoles.js';

const router = express.Router();

// Parse JSON even if content-type is text/html
router.use(express.json({ type: ['application/json', 'text/html'] }));

// ----------------------------
// Admin login (any admin)
// ----------------------------
router.post('/login', adminLogin);

// ----------------------------
// Create new admins (SUPER_ADMIN only)
// ----------------------------
router.post('/create', verifyJWT, verifyRoles('SUPER_ADMIN'), createAdmin);

export default router;