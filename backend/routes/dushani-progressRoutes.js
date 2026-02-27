import express from 'express';
import {
  getStudentProgress,
  addPoints,
  completeSection,
  getLeaderboard,
  getStudentBadges,
  getProgressStats,
  getAllStudentsProgress
} from '../controllers/dushani-ProgressController.js';
import verifyJWT from '../middleware/amasha-verifyJWT.js';
import { verifyRoles } from '../middleware/dilshara-verifyRoles.js';

const router = express.Router();

// Public route: leaderboard (students can view without admin role)
router.get('/leaderboard', getLeaderboard);

// Admin routes: require JWT + admin roles
// Accept only SUPER_ADMIN and custom Progress_ADMIN roles
router.use(verifyJWT, verifyRoles('SUPER_ADMIN', 'Progress_ADMIN'));

// Admin: Get student progress by user ID
router.get('/student/:userId', getStudentProgress);

// Admin: Add points to student
router.post('/student/:userId/points', addPoints);

// Admin: Complete section for student
router.post('/student/:userId/complete-section', completeSection);

// Admin: Get student's earned badges
router.get('/student/:userId/badges', getStudentBadges);

// Admin: Get progress statistics
router.get('/admin/stats', getProgressStats);

// Admin: Get all students' progress
router.get('/admin/all-students', getAllStudentsProgress);



export default router;