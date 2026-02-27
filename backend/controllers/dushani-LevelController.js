import Level from '../models/dushani-Level.js';
import StudentProgress from '../models/dushani-StudentProgress.js';
import User from '../models/dushani-User.js';

   // Get current admin user id from JWT username

const getCurrentUserId = async (req) => {
  const username = req.user;
  if (!username) return null;

  const user = await User.findOne({ username });
  return user ? user._id : null;
};



   //Admin: Create Level

export const createLevel = async (req, res) => {
  try {
    const { levelName, minPoints, maxPoints, description } = req.body;

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
      maxPoints: maxPoints ?? null, // allow unlimited
      description: description || '',
      createdBy
    });

    await level.save();

    // Validate overlap AFTER saving
    await Level.validateLevelRanges(level._id);

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



   //Admin: Get All Levels

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



   //Admin: Get Level By ID

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



   //Admin: Update Level

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

    if (levelName !== undefined) level.levelName = levelName;
    if (minPoints !== undefined) level.minPoints = minPoints;
    if (maxPoints !== undefined) level.maxPoints = maxPoints ?? null;
    if (description !== undefined) level.description = description;
    if (isActive !== undefined) level.isActive = isActive;

    await level.save();

    // Validate overlap AFTER updating
    await Level.validateLevelRanges(id);

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



  // Admin: Soft Delete Level

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



   //Admin: Student Progress Monitoring (Optimized)

export const getStudentProgressMonitoring = async (req, res) => {
  try {
    const { limit = 100 } = req.query;

    const allProgress = await StudentProgress.find()
      .populate('userId', 'firstName lastName username email')
      .sort({ totalPoints: -1 })
      .limit(parseInt(limit));

    const levels = await Level.getActiveLevels();

    const studentsProgress = allProgress.map((progress) => {

      let currentLevelDoc = null;

      if (progress.totalPoints > 0) {
        currentLevelDoc = levels.find(level => {
          const max = level.maxPoints ?? Infinity;
          return progress.totalPoints >= level.minPoints &&
                 progress.totalPoints <= max;
        });
      }

      return {
        studentId: progress.userId._id,
        studentName: `${progress.userId.firstName} ${progress.userId.lastName}`,
        username: progress.userId.username,
        email: progress.userId.email,
        totalPoints: progress.totalPoints,
        currentLevel: currentLevelDoc ? currentLevelDoc.levelName : null,
        levelNumber: currentLevelDoc
          ? levels.findIndex(l => l._id.equals(currentLevelDoc._id)) + 1
          : 0,
        badgesEarned: progress.badgesEarned.length,
        completedSections: progress.sectionProgress.filter(sec => sec.completed).length,
        lastActivity: progress.lastActivity,
        createdAt: progress.createdAt
      };
    });

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



   //Admin: Get Specific Student Details

export const getStudentDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const studentProgress = await StudentProgress.findOne({ userId });

    if (!studentProgress) {
      return res.status(200).json({
        success: true,
        studentDetails: {
          studentId: user._id,
          studentName: `${user.firstName} ${user.lastName}`,
          username: user.username,
          email: user.email,
          totalPoints: 0,
          currentLevel: null,
          badgesEarned: [],
          completedSections: [],
          lastActivity: null
        }
      });
    }

    const levels = await Level.getActiveLevels();

    let currentLevelDoc = null;

    if (studentProgress.totalPoints > 0) {
      currentLevelDoc = levels.find(level => {
        const max = level.maxPoints ?? Infinity;
        return studentProgress.totalPoints >= level.minPoints &&
               studentProgress.totalPoints <= max;
      });
    }

    res.status(200).json({
      success: true,
      studentDetails: {
        studentId: user._id,
        studentName: `${user.firstName} ${user.lastName}`,
        username: user.username,
        email: user.email,
        totalPoints: studentProgress.totalPoints,
        currentLevel: currentLevelDoc ? currentLevelDoc.levelName : null,
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