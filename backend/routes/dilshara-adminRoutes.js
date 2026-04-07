import express from 'express';
import { createAdmin, adminLogin, getAllAdmins, toggleAdminStatus } from '../controllers/dilshara-adminController.js';
import verifyJWT from '../middleware/amasha-verifyJWT.js';
import { verifyRoles } from '../middleware/dilshara-verifyRoles.js';

const router = express.Router();

// Parse JSON even if content-type is text/html
router.use(express.json({ type: ['application/json', 'text/html'] }));

// Admin login (any admin)
router.post('/login', adminLogin);

// Create new admins (SUPER_ADMIN only)
router.post('/create', verifyJWT, verifyRoles('SUPER_ADMIN'), createAdmin);

// Get all admins (SUPER_ADMIN only)
router.get('/all', verifyJWT, verifyRoles('SUPER_ADMIN'), getAllAdmins);

// Toggle admin active/inactive (SUPER_ADMIN only)
router.patch('/:id/toggle-active', verifyJWT, verifyRoles('SUPER_ADMIN'), toggleAdminStatus);

export default router;