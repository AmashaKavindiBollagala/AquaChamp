import mongoose from 'mongoose';

const badgeNotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  badgeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Badge',
    required: [true, 'Badge ID is required']
  },
  badgeDetails: {
    badgeName: {
      type: String,
      required: true
    },
    badgeIcon: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    badgeType: {
      type: String,
      required: true,
      enum: ['Milestone', 'Section Completion', 'Special']
    }
  },
  earnedAt: {
    type: Date,
    default: Date.now
  },
  isRead: {
    type: Boolean,
    default: false
  },
  animationTriggered: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying
badgeNotificationSchema.index({ userId: 1, isRead: 1 });
badgeNotificationSchema.index({ userId: 1, animationTriggered: 1 });
badgeNotificationSchema.index({ earnedAt: -1 });

// Method to mark notification as read
badgeNotificationSchema.methods.markAsRead = async function() {
  this.isRead = true;
  await this.save();
};

// Method to mark animation as triggered
badgeNotificationSchema.methods.markAnimationTriggered = async function() {
  this.animationTriggered = true;
  await this.save();
};

// Static method to get unread notifications for user
badgeNotificationSchema.statics.getUnreadNotifications = async function(userId) {
  return await this.find({
    userId,
    isRead: false
  }).sort({ earnedAt: -1 });
};

// Static method to get untriggered animations for user
badgeNotificationSchema.statics.getUntriggeredAnimations = async function(userId) {
  return await this.find({
    userId,
    animationTriggered: false
  }).sort({ earnedAt: -1 });
};

// Static method to create badge notification
badgeNotificationSchema.statics.createNotification = async function(userId, badge) {
  const notification = new this({
    userId,
    badgeId: badge._id,
    badgeDetails: {
      badgeName: badge.badgeName,
      badgeIcon: badge.badgeIcon,
      description: badge.description,
      badgeType: badge.badgeType
    }
  });
  
  await notification.save();
  return notification;
};

export default mongoose.model('BadgeNotification', badgeNotificationSchema);