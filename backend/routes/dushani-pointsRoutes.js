import express from 'express';
import {
  dailyLoginReward,
  addGamePoints,
  getPointsStatus,
  addTestPoints,
  getStudentGamePoints,
  getAllStudentsPoints
} from '../controllers/dushani-PointsController.js';
import verifyJWT from '../middleware/amasha-verifyJWT.js';

const router = express.Router();

// All routes require JWT authentication
router.use(verifyJWT);

// Daily login reward - claim once per day
router.post('/daily-login', dailyLoginReward);

// Add points to student (for quiz/game integration)
router.post('/add', addGamePoints);

// Add test points (for testing before merge)
router.post('/add-test', addTestPoints);

// Get current points status
router.get('/status', getPointsStatus);

// Get specific student's game points (admin)
router.get('/student/:userId', getStudentGamePoints);

// Get all students' points leaderboard (admin)
router.get('/leaderboard', getAllStudentsPoints);

export default router;