import express from 'express';
import {
    registerUser,
    getUserProfile,
    updateUserProfile,
    deleteUser,
    getAllUsers
} from '../controllers/dushani-userController.js';
import {
    registerValidation,
    profileUpdateValidation,
    handleValidationErrors
} from '../middleware/dushani-validation.js';
import verifyJWT from '../middleware/amasha-verifyJWT.js';

const router = express.Router();




// User registration
router.post('/register', registerValidation, handleValidationErrors, registerUser);

router.use(verifyJWT)

// Get user profile by ID
router.get('/profile/:id', getUserProfile);

// Update user profile by ID
router.put('/profile/:id', profileUpdateValidation, handleValidationErrors, updateUserProfile);

// Delete user account by ID
router.delete('/profile/:id', deleteUser);

// Get all users (admin route)
router.get('/all', getAllUsers);

export default router;