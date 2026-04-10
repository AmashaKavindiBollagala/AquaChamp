import express from 'express';
import {
  createBadge,
  getAllBadges,
  getBadgeById,
  updateBadge,
  deleteBadge,
  getActiveBadges,
  diagnosticAndAwardBadges,
  clearAllBadges
} from '../controllers/dushani-BadgeController.js';
import verifyJWT from '../middleware/amasha-verifyJWT.js';

const router = express.Router();

// Admin routes (require JWT authentication)
router.use(verifyJWT);

// Admin: Create badge
router.post('/', createBadge);

// Admin: Get all badges with statistics
router.get('/', getAllBadges);

// Admin: Get badge by ID with earned students
router.get('/:id', getBadgeById);

// Admin: Update badge
router.put('/:id', updateBadge);

// Admin: Delete badge (soft delete)
router.delete('/:id', deleteBadge);

// Public route for students to get active badges
router.get('/public/active', getActiveBadges);

// Diagnostic: Manually check and award all badges
router.post('/diagnostic-and-award', diagnosticAndAwardBadges);

// Clear all badges from all students
router.post('/clear-all-badges', clearAllBadges);

export default router;