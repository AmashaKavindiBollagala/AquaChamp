import StudentProgress from '../models/dushani-StudentProgress.js';
import Badge from '../models/dushani-Badge.js';
import User from '../models/dushani-User.js';

// Helper: get current user and id from username in JWT
const getCurrentUserAndId = async (req) => {
  const username = req.user;
  if (!username) return { user: null, userId: null };

  const user = await User.findOne({ username });
  if (!user) return { user: null, userId: null };

  return { user, userId: user._id };
};

// Get student progress by user ID
export const getStudentProgress = async (req, res) => {
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

    // Get or create student progress
    let studentProgress = await StudentProgress.findOne({ userId })
      .populate('userId', 'firstName lastName username email');

    if (!studentProgress) {
      studentProgress = new StudentProgress({ userId });
      await studentProgress.save();
    }

    res.status(200).json({
      success: true,
      progress: studentProgress
    });
  } catch (error) {
    console.error('Get student progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Add points to student
export const addPoints = async (req, res) => {
  try {
    const { userId } = req.params;
    const { points, reason } = req.body;

    if (!points || points <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid points value is required'
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

    // Add points
    const pointsAdded = await studentProgress.addPoints(points);
    
    if (pointsAdded) {
      await studentProgress.save();
      
      // Check for milestone badges
      await checkAndAwardMilestoneBadges(studentProgress);
      
      res.status(200).json({
        success: true,
        message: `${points} points added successfully`,
        totalPoints: studentProgress.totalPoints,
        currentLevel: studentProgress.currentLevel,
        pointsAdded: points
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to add points'
      });
    }
  } catch (error) {
    console.error('Add points error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Complete section for student
export const completeSection = async (req, res) => {
  try {
    const { userId } = req.params;
    const { sectionName, points } = req.body;

    if (!sectionName) {
      return res.status(400).json({
        success: false,
        message: 'Section name is required'
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

    // TEMPORARY: Check if section is implemented before allowing completion
    // This is a placeholder - in the future, implement actual lesson tracking
    const implementedSections = []; // Add sections here as they become available with actual lessons
    if (!implementedSections.includes(sectionName)) {
      return res.status(400).json({
        success: false,
        message: `Section "${sectionName}" is not yet implemented or available`
      });
    }

    // Get or create student progress
    let studentProgress = await StudentProgress.findOne({ userId });
    if (!studentProgress) {
      studentProgress = new StudentProgress({ userId });
    }

    // Check if already completed
    if (studentProgress.isSectionCompleted(sectionName)) {
      return res.status(400).json({
        success: false,
        message: 'Section already completed'
      });
    }

    // Complete section
    const sectionPoints = points || 50;
    const completedSection = await studentProgress.completeSection(sectionName, sectionPoints);
    
    await studentProgress.save();
    
    // Check for section completion badges
    await checkAndAwardSectionBadges(studentProgress, sectionName);
    // Check for milestone badges
    await checkAndAwardMilestoneBadges(studentProgress);

    res.status(200).json({
      success: true,
      message: `Section "${sectionName}" completed successfully`,
      section: completedSection,
      totalPoints: studentProgress.totalPoints,
      currentLevel: studentProgress.currentLevel
    });
  } catch (error) {
    console.error('Complete section error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get public leaderboard (visible to all students)
export const getLeaderboard = async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    const topStudents = await StudentProgress.find()
      .populate('userId', 'firstName lastName username')
      .sort({ totalPoints: -1, lastActivity: -1 })
      .limit(parseInt(limit));

    const leaderboard = topStudents.map((progress, index) => ({
      rank: index + 1,
      name: `${progress.userId.firstName} ${progress.userId.lastName}`,
      totalPoints: progress.totalPoints,
      level: progress.currentLevel
      // Privacy: No studentId, username, or badge details
    }));

    res.status(200).json({
      success: true,
      count: leaderboard.length,
      leaderboard
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get student's earned badges
export const getStudentBadges = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const studentProgress = await StudentProgress.findOne({ userId })
      .populate('userId', 'firstName lastName username');

    if (!studentProgress) {
      return res.status(404).json({
        success: false,
        message: 'Student progress not found'
      });
    }

    res.status(200).json({
      success: true,
      studentName: `${studentProgress.userId.firstName} ${studentProgress.userId.lastName}`,
      badges: studentProgress.badgesEarned,
      badgesCount: studentProgress.badgesEarned.length
    });
  } catch (error) {
    console.error('Get student badges error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Check and award milestone badges
const checkAndAwardMilestoneBadges = async (studentProgress) => {
  try {
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
        
        // Create badge notification
        const BadgeNotification = (await import('../models/dushani-BadgeNotification.js')).default;
        await BadgeNotification.createNotification(studentProgress.userId, badge);
      }
    }
    
    // Only save if there were changes
    if (studentProgress.isModified()) {
      await studentProgress.save();
    }
  } catch (error) {
    console.error('Check milestone badges error:', error);
  }
};

// Check and award section completion badges
const checkAndAwardSectionBadges = async (studentProgress, sectionName) => {
  try {
    const sectionBadges = await Badge.find({
      badgeType: 'Section Completion',
      sectionName: sectionName,
      status: 'Active'
    });

    for (const badge of sectionBadges) {
      // Only award if student doesn't already have this badge
      if (!studentProgress.hasBadge(badge._id)) {
        studentProgress.addBadge(badge);
        
        // Update badge earned count
        await Badge.findByIdAndUpdate(badge._id, {
          $inc: { earnedCount: 1 }
        });
        
        // Create badge notification
        const BadgeNotification = (await import('../models/dushani-BadgeNotification.js')).default;
        await BadgeNotification.createNotification(studentProgress.userId, badge);
      }
    }
    
    // Only save if there were changes
    if (studentProgress.isModified()) {
      await studentProgress.save();
    }
  } catch (error) {
    console.error('Check section badges error:', error);
  }
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

// Get statistics for admin dashboard
export const getProgressStats = async (req, res) => {
  try {
    const totalStudents = await StudentProgress.countDocuments();
    const totalPoints = await StudentProgress.aggregate([
      { $group: { _id: null, total: { $sum: "$totalPoints" } } }
    ]);
    
    const averagePoints = totalStudents > 0 ? 
      Math.round(totalPoints[0]?.total / totalStudents) : 0;

    const levelDistribution = await StudentProgress.aggregate([
      { $group: { _id: "$currentLevel", count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const topBadges = await Badge.find({ status: 'Active' })
      .sort({ earnedCount: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      statistics: {
        totalStudents,
        totalPoints: totalPoints[0]?.total || 0,
        averagePoints,
        levelDistribution,
        topBadges
      }
    });
  } catch (error) {
    console.error('Get progress stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

// Get all students' progress for admin
export const getAllStudentsProgress = async (req, res) => {
  try {
    // Get all student progress records with user information
    const allProgress = await StudentProgress.find()
      .populate('userId', 'firstName lastName username email')
      .sort({ totalPoints: -1 }) // Sort by highest points first
      .lean(); // Use lean() for better performance

    // Format the response to include user details
    const studentsProgress = allProgress.map(progress => ({
      _id: progress._id,
      userId: progress.userId._id,
      studentInfo: {
        firstName: progress.userId.firstName,
        lastName: progress.userId.lastName,
        username: progress.userId.username,
        email: progress.userId.email
      },
      totalPoints: progress.totalPoints,
      currentLevel: progress.currentLevel,
      badgesCount: progress.badgesEarned.length,
      sectionsCompleted: progress.sectionProgress.filter(section => section.completed).length,
      lastActivity: progress.lastActivity,
      createdAt: progress.createdAt
    }));

    res.status(200).json({
      success: true,
      count: studentsProgress.length,
      students: studentsProgress
    });
  } catch (error) {
    console.error('Get all students progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};