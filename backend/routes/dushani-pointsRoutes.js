import express from 'express';
import {
  dailyLoginReward,
  addGamePoints,
  getPointsStatus,
  addTestPoints,
  getStudentGamePoints,
  getAllStudentsPoints,
  aggregateResultsPoints,
  resetTestPoints,
  aggregateUserPoints,
  consolidateAllPoints,
  getPointsDiagnostic,
  checkStudentProgress,
  updateUserPoints
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

// Aggregate points from TrueFalseResult and QuizResult collections (admin)
router.post('/aggregate-results-points', aggregateResultsPoints);

// Reset all test points to original state (admin)
router.post('/reset-test-points', resetTestPoints);

// Aggregate points from userPoints table (admin)
router.post('/aggregate-user-points', aggregateUserPoints);

// Consolidate all points from all sources (daily login, quizzes, userpoints, truefalse) (admin)
router.post('/consolidate-all-points', consolidateAllPoints);

// Diagnostic endpoint to check points breakdown for a specific user (admin)
router.get('/diagnostic/:username', getPointsDiagnostic);

// Check student progress for a specific user (admin)
router.get('/check-progress/:username', checkStudentProgress);

// Update points for a specific user (admin)
router.put('/update-user-points/:username', updateUserPoints);

export default router;