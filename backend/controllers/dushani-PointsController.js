import DailyLogin from '../models/dushani-points.js';
import StudentProgress from '../models/dushani-StudentProgress.js';
import User from '../models/dushani-User.js';
import mongoose from 'mongoose';

// Helper: get current user and id from username in JWT
const getCurrentUserAndId = async (req) => {
  const username = req.user; // set by verifyJWT
  if (!username) return { user: null, userId: null };

  const user = await User.findOne({ username });
  if (!user) return { user: null, userId: null };

  return { user, userId: user._id };
};

// Daily login reward - POST /api/points/daily-login
export const dailyLoginReward = async (req, res) => {
  try {
    const { user, userId } = await getCurrentUserAndId(req);

    // Check if user exists
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user already logged in today
    const hasLoggedIn = await DailyLogin.hasLoggedInToday(userId);
    if (hasLoggedIn) {
      return res.status(400).json({
        success: false,
        message: 'Daily login reward already claimed today'
      });
    }

    // Record the login
    const loginRecord = await DailyLogin.recordLogin(userId);

    // Get or create student progress
    let studentProgress = await StudentProgress.findOne({ userId });
    if (!studentProgress) {
      studentProgress = new StudentProgress({ userId });
    }

    // Add 10 points for daily login
    studentProgress.addPoints(10);
    await studentProgress.save();

    // Check for milestone badges
    await checkAndAwardMilestoneBadges(studentProgress);

    res.status(200).json({
      success: true,
      message: 'Daily login reward claimed successfully',
      pointsAwarded: 10,
      totalPoints: studentProgress.totalPoints,
      currentLevel: studentProgress.currentLevel,
      canClaimReward: false, // Can't claim again today
      rewardAvailableTomorrow: getNextLoginTime()
    });
  } catch (error) {
    console.error('Daily login reward error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Add game points to student - POST /api/points/add-game-points
export const addGamePoints = async (req, res) => {
  try {
    const body = req.body || {};
    let { userId, points, gameName, description } = body;

    // If userId is not provided in body, fall back to current logged-in user
    if (!userId) {
      const current = await getCurrentUserAndId(req);
      userId = current.userId;
    }

    // Validate input
    if (userId && !mongoose.isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid userId format'
      });
    }

    if (!userId || points === undefined) {
      return res.status(400).json({
        success: false,
        message: 'User ID and points are required'
      });
    }

    // Points can be 0 or positive (no negative points allowed)
    if (points < 0) {
      return res.status(400).json({
        success: false,
        message: 'Points cannot be negative'
      });
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get or create student progress
    let studentProgress = await StudentProgress.findOne({ userId });
    if (!studentProgress) {
      studentProgress = new StudentProgress({ userId });
    }

    // Add points (even 0 points)
    await studentProgress.addPoints(points);
    await studentProgress.save();
    
    // Check for milestone badges
    await checkAndAwardMilestoneBadges(studentProgress);
    
    // Create notifications for newly earned badges
    const BadgeNotification = (await import('../models/dushani-BadgeNotification.js')).default;
    const Badge = (await import('../models/dushani-Badge.js')).default;
    
    // Get active milestone badges that student just earned
    const activeMilestoneBadges = await Badge.find({
      badgeType: 'Milestone',
      status: 'Active',
      pointsRequired: { $lte: studentProgress.totalPoints }
    });
    
    for (const badge of activeMilestoneBadges) {
      if (studentProgress.hasBadge(badge._id)) {
        // Check if notification already exists
        const existingNotification = await BadgeNotification.findOne({
          userId: studentProgress.userId,
          badgeId: badge._id
        });
        
        if (!existingNotification) {
          await BadgeNotification.createNotification(studentProgress.userId, badge);
        }
      }
    }
    
    res.status(200).json({
      success: true,
      message: `${points} game points added successfully`,
      pointsAdded: points,
      totalPoints: studentProgress.totalPoints,
      currentLevel: studentProgress.currentLevel,
      gameName: gameName || 'Game',
      description: description || 'Points earned from game'
    });
  } catch (error) {
    console.error('Add game points error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get user's current points and level - GET /api/points/status
export const getPointsStatus = async (req, res) => {
  try {
    const { user, userId } = await getCurrentUserAndId(req);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get student progress
    const studentProgress = await StudentProgress.findOne({ userId });
    
    if (!studentProgress) {
      // Return default values for new user
      return res.status(200).json({
        success: true,
        points: 0,
        level: 1,
        badgesCount: 0,
        hasLoggedInToday: false
      });
    }

    // Check if logged in today
    const hasLoggedInToday = await DailyLogin.hasLoggedInToday(userId);

    res.status(200).json({
      success: true,
      points: studentProgress.totalPoints,
      level: studentProgress.currentLevel,
      badgesCount: studentProgress.badgesEarned.length,
      hasLoggedInToday,
      canClaimReward: !hasLoggedInToday, // True if reward available today
      rewardAvailableAt: hasLoggedInToday ? getNextLoginTime() : null
    });
  } catch (error) {
    console.error('Get points status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Check and award milestone badges
const checkAndAwardMilestoneBadges = async (studentProgress) => {
  try {
    const Badge = (await import('../models/dushani-Badge.js')).default;
    
    const activeMilestoneBadges = await Badge.find({
      badgeType: 'Milestone',
      status: 'Active'
    }).sort({ pointsRequired: 1 });

    for (const badge of activeMilestoneBadges) {
      // Check if student qualifies for this badge and hasn't earned it yet
      if (studentProgress.totalPoints >= badge.pointsRequired && 
          !studentProgress.hasBadge(badge._id)) {
        
        studentProgress.addBadge(badge);
        
        // Update badge earned count
        await Badge.findByIdAndUpdate(badge._id, {
          $inc: { earnedCount: 1 }
        });
      }
    }
    
    await studentProgress.save();
  } catch (error) {
    console.error('Check milestone badges error:', error);
  }
};

// Helper function to get next login time
const getNextLoginTime = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow;
};

// Test endpoint to add hardcoded points (for testing before merge)
export const addTestPoints = async (req, res) => {
  try {
    const { user, userId } = await getCurrentUserAndId(req);
    const { points = 50 } = req.body; // Default 50 points if not specified

    // Verify user exists
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get or create student progress
    let studentProgress = await StudentProgress.findOne({ userId });
    if (!studentProgress) {
      studentProgress = new StudentProgress({ userId });
    }

    // Add test points
    await studentProgress.addPoints(points);
    await studentProgress.save();
    
    // Check for milestone badges
    await checkAndAwardMilestoneBadges(studentProgress);

    res.status(200).json({
      success: true,
      message: `Test points (${points}) added successfully`,
      pointsAdded: points,
      totalPoints: studentProgress.totalPoints,
      currentLevel: studentProgress.currentLevel
    });
  } catch (error) {
    console.error('Add test points error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get all points earned by a specific student from games - GET /api/points/student/:userId
export const getStudentGamePoints = async (req, res) => {
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
    const studentProgress = await StudentProgress.findOne({ userId });
    
    if (!studentProgress) {
      return res.status(200).json({
        success: true,
        studentName: `${user.firstName} ${user.lastName}`,
        totalPoints: 0,
        level: 1,
        gamePointsHistory: [],
        badges: []
      });
    }

    res.status(200).json({
      success: true,
      studentName: `${user.firstName} ${user.lastName}`,
      totalPoints: studentProgress.totalPoints,
      currentLevel: studentProgress.currentLevel,
      badgesCount: studentProgress.badgesEarned.length,
      badges: studentProgress.badgesEarned,
      sectionProgress: studentProgress.sectionProgress
    });
  } catch (error) {
    console.error('Get student game points error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get leaderboard with all students' points - GET /api/points/leaderboard
export const getAllStudentsPoints = async (req, res) => {
  try {
    const { limit = 100 } = req.query;
    
    // Get all student progress with user details
    const allProgress = await StudentProgress.find()
      .populate('userId', 'firstName lastName username email')
      .sort({ totalPoints: -1 })
      .limit(parseInt(limit));

    const studentsPoints = allProgress.map(progress => ({
      userId: progress.userId._id,
      studentName: `${progress.userId.firstName} ${progress.userId.lastName}`,
      username: progress.userId.username,
      totalPoints: progress.totalPoints,
      currentLevel: progress.currentLevel,
      badgesCount: progress.badgesEarned.length,
      lastActivity: progress.lastActivity
    }));

    res.status(200).json({
      success: true,
      count: studentsPoints.length,
      students: studentsPoints
    });
  } catch (error) {
    console.error('Get all students points error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};