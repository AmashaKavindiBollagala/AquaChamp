import Level from '../models/dushani-Level.js';
import StudentProgress from '../models/dushani-StudentProgress.js';
import User from '../models/dushani-User.js';

// Helper: get current admin user id from username in JWT
const getCurrentUserId = async (req) => {
  const username = req.user;
  if (!username) return null;

  const user = await User.findOne({ username });
  return user ? user._id : null;
};

// Admin: Create a new level
export const createLevel = async (req, res) => {
  try {
    const { levelName, minPoints, maxPoints, description } = req.body;
    
    // Check if level name already exists
    const existingLevel = await Level.findOne({ levelName });
    if (existingLevel) {
      return res.status(400).json({
        success: false,
        message: 'Level with this name already exists'
      });
    }

    const createdBy = await getCurrentUserId(req);

    const level = new Level({
      levelName,
      minPoints,
      maxPoints,
      description: description || '',
      createdBy
    });

    // Validate level ranges
    await Level.validateLevelRanges();
    
    await level.save();

    res.status(201).json({
      success: true,
      message: 'Level created successfully',
      level
    });
  } catch (error) {
    console.error('Create level error:', error);
    
    if (error.message.includes('overlap')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
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

// Admin: Get all levels
export const getAllLevels = async (req, res) => {
  try {
    const levels = await Level.find().sort({ minPoints: 1 });
    
    res.status(200).json({
      success: true,
      count: levels.length,
      levels
    });
  } catch (error) {
    console.error('Get all levels error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Admin: Get level by ID
export const getLevelById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const level = await Level.findById(id);
    if (!level) {
      return res.status(404).json({
        success: false,
        message: 'Level not found'
      });
    }

    res.status(200).json({
      success: true,
      level
    });
  } catch (error) {
    console.error('Get level by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Admin: Update level
export const updateLevel = async (req, res) => {
  try {
    const { id } = req.params;
    const { levelName, minPoints, maxPoints, description, isActive } = req.body;
    
    const level = await Level.findById(id);
    if (!level) {
      return res.status(404).json({
        success: false,
        message: 'Level not found'
      });
    }

    // Check if new level name already exists (excluding current level)
    if (levelName && levelName !== level.levelName) {
      const existingLevel = await Level.findOne({ 
        levelName,
        _id: { $ne: id }
      });
      if (existingLevel) {
        return res.status(400).json({
          success: false,
          message: 'Level with this name already exists'
        });
      }
    }

    // Update level fields
    if (levelName) level.levelName = levelName;
    if (minPoints !== undefined) level.minPoints = minPoints;
    if (maxPoints !== undefined) level.maxPoints = maxPoints;
    if (description !== undefined) level.description = description;
    if (isActive !== undefined) level.isActive = isActive;

    // Validate level ranges
    await Level.validateLevelRanges(id);
    
    await level.save();

    res.status(200).json({
      success: true,
      message: 'Level updated successfully',
      level
    });
  } catch (error) {
    console.error('Update level error:', error);
    
    if (error.message.includes('overlap')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
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

// Admin: Delete level (soft delete by setting isActive to false)
export const deleteLevel = async (req, res) => {
  try {
    const { id } = req.params;
    
    const level = await Level.findById(id);
    if (!level) {
      return res.status(404).json({
        success: false,
        message: 'Level not found'
      });
    }

    // Soft delete - set isActive to false
    level.isActive = false;
    await level.save();

    res.status(200).json({
      success: true,
      message: 'Level deactivated successfully'
    });
  } catch (error) {
    console.error('Delete level error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Admin: Get student progress monitoring data
export const getStudentProgressMonitoring = async (req, res) => {
  try {
    const { limit = 100 } = req.query;
    
    // Get all student progress with user details
    const allProgress = await StudentProgress.find()
      .populate('userId', 'firstName lastName username email')
      .sort({ totalPoints: -1 })
      .limit(parseInt(limit));

    // Get current levels for each student
    const levels = await Level.getActiveLevels();
    const levelMap = {};
    levels.forEach(level => {
      levelMap[level._id] = level.levelName;
    });

    const studentsProgress = await Promise.all(allProgress.map(async (progress) => {
      // Get current level based on points
      const currentLevelDoc = await Level.getLevelByPoints(progress.totalPoints);
      const currentLevelName = currentLevelDoc ? currentLevelDoc.levelName : 'Unknown';
      
      return {
        studentId: progress.userId._id,
        studentName: `${progress.userId.firstName} ${progress.userId.lastName}`,
        username: progress.userId.username,
        email: progress.userId.email,
        totalPoints: progress.totalPoints,
        currentLevel: currentLevelName,
        levelNumber: currentLevelDoc ? levels.findIndex(l => l._id.equals(currentLevelDoc._id)) + 1 : 0,
        badgesEarned: progress.badgesEarned.length,
        badges: progress.badgesEarned.map(badge => ({
          badgeName: badge.badgeDetails.badgeName,
          badgeIcon: badge.badgeDetails.badgeIcon,
          earnedAt: badge.earnedAt
        })),
        completedSections: progress.sectionProgress.filter(sec => sec.completed).length,
        sections: progress.sectionProgress,
        lastActivity: progress.lastActivity,
        createdAt: progress.createdAt
      };
    }));

    res.status(200).json({
      success: true,
      count: studentsProgress.length,
      students: studentsProgress,
      totalLevels: levels.length
    });
  } catch (error) {
    console.error('Get student progress monitoring error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Admin: Get specific student details
export const getStudentDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get student progress
    const studentProgress = await StudentProgress.findOne({ userId })
      .populate('userId', 'firstName lastName username email');

    if (!studentProgress) {
      return res.status(200).json({
        success: true,
        studentName: `${user.firstName} ${user.lastName}`,
        totalPoints: 0,
        currentLevel: 'Level 1',
        badgesEarned: [],
        completedSections: [],
        lastActivity: null
      });
    }

    // Get current level
    const currentLevelDoc = await Level.getLevelByPoints(studentProgress.totalPoints);
    const currentLevelName = currentLevelDoc ? currentLevelDoc.levelName : 'Unknown';

    res.status(200).json({
      success: true,
      studentDetails: {
        studentId: user._id,
        studentName: `${user.firstName} ${user.lastName}`,
        username: user.username,
        email: user.email,
        totalPoints: studentProgress.totalPoints,
        currentLevel: currentLevelName,
        badgesEarned: studentProgress.badgesEarned,
        completedSections: studentProgress.sectionProgress.filter(sec => sec.completed),
        lastActivity: studentProgress.lastActivity,
        createdAt: studentProgress.createdAt
      }
    });
  } catch (error) {
    console.error('Get student details error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};