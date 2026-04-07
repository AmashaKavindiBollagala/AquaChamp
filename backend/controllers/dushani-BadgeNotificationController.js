import BadgeNotification from '../models/dushani-BadgeNotification.js';
import User from '../models/dushani-User.js';

// Helper: get current user id from username in JWT
const getCurrentUserId = async (req) => {
  const username = req.user; // set by verifyJWT
  if (!username) return null;

  const user = await User.findOne({ username });
  return user ? user._id : null;
};

// Admin: Get count for specific user (for testing)
export const getCountForUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log(`Getting badge notification count for specific userId: ${userId}`);

    const unreadCount = await BadgeNotification.countDocuments({
      userId,
      isRead: false
    });

    const untriggeredCount = await BadgeNotification.countDocuments({
      userId,
      animationTriggered: false
    });
    
    console.log(`Unread: ${unreadCount}, Untriggered: ${untriggeredCount}`);
    
    // Get all notifications for debugging
    const allNotifications = await BadgeNotification.find({ userId });
    console.log(`Total notifications in DB: ${allNotifications.length}`);
    allNotifications.forEach(n => {
      console.log(`  - Badge: ${n.badgeDetails.badgeName}, isRead: ${n.isRead}, animationTriggered: ${n.animationTriggered}`);
    });

    res.status(200).json({
      success: true,
      counts: {
        unread: unreadCount,
        untriggered: untriggeredCount
      }
    });
  } catch (error) {
    console.error('Get count for user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get badge notifications for current user
export const getBadgeNotifications = async (req, res) => {
  try {
    const userId = await getCurrentUserId(req);

    // Get unread notifications
    const notifications = await BadgeNotification.getUnreadNotifications(userId);
    
    res.status(200).json({
      success: true,
      count: notifications.length,
      notifications
    });
  } catch (error) {
    console.error('Get badge notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get untriggered animations for current user (for Lottie animation)
export const getBadgeAnimations = async (req, res) => {
  try {
    const userId = await getCurrentUserId(req);

    // Get untriggered animations
    const animations = await BadgeNotification.getUntriggeredAnimations(userId);
    
    res.status(200).json({
      success: true,
      count: animations.length,
      animations
    });
  } catch (error) {
    console.error('Get badge animations error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Mark notification as read
export const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = await getCurrentUserId(req);

    const notification = await BadgeNotification.findOne({
      _id: notificationId,
      userId
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await notification.markAsRead();

    res.status(200).json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Mark animation as triggered (after Lottie animation plays)
export const markAnimationAsTriggered = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = await getCurrentUserId(req);

    const notification = await BadgeNotification.findOne({
      _id: notificationId,
      userId
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await notification.markAnimationTriggered();

    res.status(200).json({
      success: true,
      message: 'Animation marked as triggered'
    });
  } catch (error) {
    console.error('Mark animation as triggered error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get specific notification details
export const getNotificationDetails = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = await getCurrentUserId(req);

    const notification = await BadgeNotification.findOne({
      _id: notificationId,
      userId
    }).populate('badgeId');

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      notification
    });
  } catch (error) {
    console.error('Get notification details error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get notification count for user (for badges indicator)
export const getNotificationCount = async (req, res) => {
  try {
    const userId = await getCurrentUserId(req);
    
    console.log(`Getting badge notification count for userId: ${userId}`);

    const unreadCount = await BadgeNotification.countDocuments({
      userId,
      isRead: false
    });

    const untriggeredCount = await BadgeNotification.countDocuments({
      userId,
      animationTriggered: false
    });
    
    console.log(`Unread: ${unreadCount}, Untriggered: ${untriggeredCount}`);
    
    // Get all notifications for debugging
    const allNotifications = await BadgeNotification.find({ userId });
    console.log(`Total notifications in DB: ${allNotifications.length}`);
    allNotifications.forEach(n => {
      console.log(`  - Badge: ${n.badgeDetails.badgeName}, isRead: ${n.isRead}, animationTriggered: ${n.animationTriggered}`);
    });

    res.status(200).json({
      success: true,
      counts: {
        unread: unreadCount,
        untriggered: untriggeredCount
      }
    });
  } catch (error) {
    console.error('Get notification count error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};