import Badge from '../models/dushani-Badge.js';
import StudentProgress from '../models/dushani-StudentProgress.js';
import User from '../models/dushani-User.js';

// Helper: get current admin user id from username in JWT
const getCurrentUserId = async (req) => {
  const username = req.user;
  if (!username) return null;

  const user = await User.findOne({ username });
  return user ? user._id : null;
};

// Admin: Create a new badge
export const createBadge = async (req, res) => {
  try {
    const { badgeName, badgeType, pointsRequired, sectionName, badgeIcon, description } = req.body;
    
    // Check if badge name already exists
    const existingBadge = await Badge.findOne({ badgeName });
    if (existingBadge) {
      return res.status(400).json({
        success: false,
        message: 'Badge with this name already exists'
      });
    }

    const createdBy = await getCurrentUserId(req);

    const badge = new Badge({
      badgeName,
      badgeType,
      pointsRequired: badgeType === 'Milestone' ? pointsRequired : 0,
      sectionName: badgeType === 'Section Completion' ? sectionName : null,
      badgeIcon: badgeIcon || '⭐',
      description,
      createdBy
    });

    await badge.save();

    res.status(201).json({
      success: true,
      message: 'Badge created successfully',
      badge
    });
  } catch (error) {
    console.error('Create badge error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Admin: Get all badges with statistics
export const getAllBadges = async (req, res) => {
  try {
    // Only get active badges
    const badges = await Badge.find({ status: 'Active' }).sort({ createdAt: -1 });
    
    // Add earned count statistics
    const badgesWithStats = await Promise.all(badges.map(async (badge) => {
      const earnedCount = await StudentProgress.countDocuments({
        'badgesEarned.badgeId': badge._id
      });
      
      return {
        ...badge.toObject(),
        earnedCount
      };
    }));

    res.status(200).json({
      success: true,
      count: badgesWithStats.length,
      badges: badgesWithStats
    });
  } catch (error) {
    console.error('Get all badges error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Admin: Get badge by ID with earned students list
export const getBadgeById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const badge = await Badge.findById(id);
    if (!badge) {
      return res.status(404).json({
        success: false,
        message: 'Badge not found'
      });
    }

    // Get students who earned this badge
    const studentProgressRecords = await StudentProgress.find({
      'badgesEarned.badgeId': badge._id
    }).populate('userId', 'firstName lastName username email');

    const studentsWithBadge = studentProgressRecords.map(record => {
      const badgeInfo = record.badgesEarned.find(b => 
        b.badgeId.toString() === id
      );
      
      return {
        studentId: record.userId._id,
        studentName: `${record.userId.firstName} ${record.userId.lastName}`,
        username: record.userId.username,
        earnedAt: badgeInfo.earnedAt,
        totalPoints: record.totalPoints,
        currentLevel: record.currentLevel
      };
    });

    res.status(200).json({
      success: true,
      badge: {
        ...badge.toObject(),
        earnedBy: studentsWithBadge,
        earnedCount: studentsWithBadge.length
      }
    });
  } catch (error) {
    console.error('Get badge by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Admin: Update badge
export const updateBadge = async (req, res) => {
  try {
    const { id } = req.params;
    const { badgeName, badgeType, pointsRequired, sectionName, badgeIcon, description, status } = req.body;
    
    const badge = await Badge.findById(id);
    if (!badge) {
      return res.status(404).json({
        success: false,
        message: 'Badge not found'
      });
    }

    // Check if new badge name already exists (excluding current badge)
    if (badgeName && badgeName !== badge.badgeName) {
      const existingBadge = await Badge.findOne({ 
        badgeName,
        _id: { $ne: id }
      });
      if (existingBadge) {
        return res.status(400).json({
          success: false,
          message: 'Badge with this name already exists'
        });
      }
    }

    // Update badge fields
    if (badgeName) badge.badgeName = badgeName;
    if (badgeType) badge.badgeType = badgeType;
    if (badgeType === 'Milestone') {
      badge.pointsRequired = pointsRequired || 0;
    } else {
      badge.pointsRequired = 0;
    }
    if (badgeType === 'Section Completion') {
      badge.sectionName = sectionName || null;
    } else {
      badge.sectionName = null;
    }
    if (badgeIcon) badge.badgeIcon = badgeIcon;
    if (description) badge.description = description;
    if (status) badge.status = status;

    await badge.save();

    res.status(200).json({
      success: true,
      message: 'Badge updated successfully',
      badge
    });
  } catch (error) {
    console.error('Update badge error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Admin: Delete badge (Permanent - removes from DB and updates all students)
export const deleteBadge = async (req, res) => {
  try {
    const { id } = req.params;
    
    const badge = await Badge.findById(id);
    if (!badge) {
      return res.status(404).json({
        success: false,
        message: 'Badge not found'
      });
    }

    // Permanently delete the badge from database
    await Badge.findByIdAndDelete(id);

    // Remove this badge from ALL student progress records
    const StudentProgress = (await import('../models/dushani-StudentProgress.js')).default;
    const allStudents = await StudentProgress.find();
    
    for (const student of allStudents) {
      // Filter out the deleted badge from badgesEarned array
      student.badgesEarned = student.badgesEarned.filter(
        b => b.badgeId.toString() !== id.toString()
      );
      await student.save();
    }

    res.status(200).json({
      success: true,
      message: 'Badge deleted successfully',
      studentsUpdated: allStudents.length
    });
  } catch (error) {
    console.error('Delete badge error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get active badges for students
export const getActiveBadges = async (req, res) => {
  try {
    const badges = await Badge.find({ status: 'Active' }).sort({ pointsRequired: 1 });
    
    res.status(200).json({
      success: true,
      count: badges.length,
      badges
    });
  } catch (error) {
    console.error('Get active badges error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};