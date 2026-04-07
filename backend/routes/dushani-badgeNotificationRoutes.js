import express from 'express';
import {
  getBadgeNotifications,
  getBadgeAnimations,
  markNotificationAsRead,
  markAnimationAsTriggered,
  getNotificationDetails,
  getNotificationCount,
  getCountForUser
} from '../controllers/dushani-BadgeNotificationController.js';
import verifyJWT from '../middleware/amasha-verifyJWT.js';

const router = express.Router();

// All routes require JWT authentication
router.use(verifyJWT);

// Get all badge notifications for user
router.get('/', getBadgeNotifications);

// Get untriggered animations (for LottieFiles)
router.get('/animations', getBadgeAnimations);

// Get notification count (for badges indicator)
router.get('/count', getNotificationCount);

// Admin: Get count for specific user (for testing)
router.get('/count/:userId', getCountForUser);

// Get specific notification details
router.get('/:notificationId', getNotificationDetails);

// Mark notification as read
router.put('/:notificationId/read', markNotificationAsRead);

// Mark animation as triggered (after Lottie animation)
router.put('/:notificationId/triggered', markAnimationAsTriggered);

export default router;
