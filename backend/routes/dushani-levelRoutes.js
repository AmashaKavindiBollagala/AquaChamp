import express from 'express';
import {
  createLevel,
  getAllLevels,
  getLevelById,
  updateLevel,
  deleteLevel,
  getStudentProgressMonitoring,
  getStudentDetails
} from '../controllers/dushani-LevelController.js';
import verifyJWT from '../middleware/amasha-verifyJWT.js';

const router = express.Router();

// All routes require JWT authentication
router.use(verifyJWT);

// Admin: Create level
router.post('/', createLevel);

// Admin: Get all levels
router.get('/', getAllLevels);

// Admin: Get level by ID
router.get('/:id', getLevelById);

// Admin: Update level
router.put('/:id', updateLevel);

// Admin: Delete level (soft delete)
router.delete('/:id', deleteLevel);

// Admin: Get student progress monitoring dashboard
router.get('/monitoring/students', getStudentProgressMonitoring);

// Admin: Get specific student details
router.get('/monitoring/student/:userId', getStudentDetails);

export default router;