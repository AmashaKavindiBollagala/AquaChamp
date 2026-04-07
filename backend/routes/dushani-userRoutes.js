import express from 'express';
import {
    registerUser,
    getUserProfile,
    getCurrentUserProfile,
    updateUserProfile,
    deleteUser,
    getAllUsers,
    checkUsernameAvailability,
    checkEmailAvailability
} from '../controllers/dushani-userController.js';
import {
    registerValidation,
    profileUpdateValidation,
    handleValidationErrors
} from '../middleware/dushani-validation.js';
import verifyJWT from '../middleware/amasha-verifyJWT.js';
import {
  verifyEmail,
  resendVerificationEmail
} from '../controllers/securityController.js';

const router = express.Router();

// Check username availability (public route)
router.get('/check-username/:username', checkUsernameAvailability);

// Check email availability (public route)
router.get('/check-email/:email', checkEmailAvailability);

// User registration
router.post('/register', registerValidation, handleValidationErrors, registerUser);


// Email verification (public route)
router.get('/verify-email/:token', verifyEmail);

// Resend verification email (public route)
router.post('/resend-verification', resendVerificationEmail);

router.use(verifyJWT)

// Get current user profile (from JWT token)
router.get('/profile/me', getCurrentUserProfile);

// Get user profile by ID
router.get('/profile/:id', getUserProfile);

// Update user profile by ID
router.put('/profile/:id', profileUpdateValidation, handleValidationErrors, updateUserProfile);

// Delete user account by ID
router.delete('/profile/:id', deleteUser);

// Get all users (admin route)
router.get('/all', getAllUsers);

export default router;