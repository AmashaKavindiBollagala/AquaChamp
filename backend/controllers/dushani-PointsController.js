import DailyLogin from '../models/dushani-points.js';
import StudentProgress from '../models/dushani-StudentProgress.js';
import User from '../models/dushani-User.js';
import UserPoints from '../models/amasha-userPoints.js';
import { GameScore } from '../models/dilshara-GameScore.js';
import Game from '../models/dilshara-Game.js';
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

// Helper function to remove duplicate badges
const removeDuplicateBadges = (studentProgress) => {
  const seen = new Set();
  const beforeCount = studentProgress.badgesEarned.length;
  
  studentProgress.badgesEarned = studentProgress.badgesEarned.filter(b => {
    const id = b.badgeId.toString();
    if (seen.has(id)) {
      console.log(`🗑️  Removing duplicate badge: ${b.badgeDetails?.badgeName || id}`);
      return false;
    }
    seen.add(id);
    return true;
  });
  
  const removed = beforeCount - studentProgress.badgesEarned.length;
  if (removed > 0) {
    console.log(`🧹 Removed ${removed} duplicate badge(s) from student`);
  }
};

// Check and award milestone badges
const checkAndAwardMilestoneBadges = async (studentProgress) => {
  try {
    const Badge = (await import('../models/dushani-Badge.js')).default;
    const BadgeNotification = (await import('../models/dushani-BadgeNotification.js')).default;
    
    // Get all active milestone badges
    const activeMilestoneBadges = await Badge.find({
      badgeType: 'Milestone',
      status: 'Active'
    }).sort({ pointsRequired: 1 });

    // STEP 1: Award eligible badges that student doesn't have
    let badgesAwarded = 0;
    const newlyAwardedBadges = [];
    
    for (const badge of activeMilestoneBadges) {
      const qualifies = studentProgress.totalPoints >= badge.pointsRequired;
      const alreadyHas = studentProgress.hasBadge(badge._id);
      
      console.log(`🔍 Checking badge "${badge.badgeName}" (${badge.pointsRequired} pts): qualifies=${qualifies}, alreadyHas=${alreadyHas}`);
      
      // ONLY award if qualifies AND doesn't have it yet
      if (qualifies && !alreadyHas) {
        studentProgress.addBadge(badge);
        
        // Update badge earned count
        await Badge.findByIdAndUpdate(badge._id, {
          $inc: { earnedCount: 1 }
        });
        
        // Create badge notification for animation (ONLY for newly earned badges)
        await BadgeNotification.createNotification(studentProgress.userId, badge);
        badgesAwarded++;
        newlyAwardedBadges.push(badge.badgeName);
        
        console.log(`🏅 NEW BADGE EARNED: "${badge.badgeName}" (Points: ${studentProgress.totalPoints} >= ${badge.pointsRequired})`);
      } else if (qualifies && alreadyHas) {
        console.log(`✅ Already has badge "${badge.badgeName}" - skipping (no duplicate)`);
      }
    }
    
    // STEP 2: Remove badges that student no longer qualifies for
    const badgesBefore = studentProgress.badgesEarned.length;
    studentProgress.badgesEarned = studentProgress.badgesEarned.filter(badgeEntry => {
      const badge = activeMilestoneBadges.find(b => b._id.toString() === badgeEntry.badgeId.toString());
      // Keep badge only if it exists, is active, and student still qualifies
      const shouldKeep = badge && badge.status === 'Active' && studentProgress.totalPoints >= badge.pointsRequired;
      if (!shouldKeep) {
        console.log(`⚠️  Removing badge "${badgeEntry.badgeDetails?.badgeName || 'Unknown'}" - no longer qualifies`);
      }
      return shouldKeep;
    });
    const badgesRemoved = badgesBefore - studentProgress.badgesEarned.length;
    
    // CRITICAL: Clean duplicates BEFORE saving
    removeDuplicateBadges(studentProgress);
    
    // Only save if there were changes
    if (studentProgress.isModified() || badgesAwarded > 0 || badgesRemoved > 0) {
      await studentProgress.save();
      console.log(`✅ Badge check complete: Awarded=${badgesAwarded}, Removed=${badgesRemoved}, Total=${studentProgress.badgesEarned.length}`);
      if (newlyAwardedBadges.length > 0) {
        console.log(`🎬 Notifications created for: ${newlyAwardedBadges.join(', ')}`);
      }
    }
  } catch (error) {
    console.error('Check milestone badges error:', error);
  }
};

// Clean up inactive badges from student progress
export const cleanupInactiveBadges = async (req, res) => {
  try {
    const StudentProgress = (await import('../models/dushani-StudentProgress.js')).default;
    const Badge = (await import('../models/dushani-Badge.js')).default;
    
    // Get all inactive badges
    const inactiveBadges = await Badge.find({ status: 'Inactive' });
    const inactiveBadgeIds = inactiveBadges.map(badge => badge._id);
    
    if (inactiveBadgeIds.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No inactive badges found',
        studentsUpdated: 0
      });
    }
    
    // Find all students with inactive badges
    const affectedStudents = await StudentProgress.find({
      'badgesEarned.badgeId': { $in: inactiveBadgeIds }
    });
    
    let updatedCount = 0;
    for (const student of affectedStudents) {
      const originalLength = student.badgesEarned.length;
      
      // Filter out inactive badges
      student.badgesEarned = student.badgesEarned.filter(
        b => !inactiveBadgeIds.some(id => id.equals(b.badgeId))
      );
      
      if (student.badgesEarned.length < originalLength) {
        await student.save();
        updatedCount++;
      }
    }
    
    res.status(200).json({
      success: true,
      message: `Cleaned up ${inactiveBadges.length} inactive badges from ${updatedCount} students`,
      inactiveBadgesRemoved: inactiveBadges.length,
      studentsUpdated: updatedCount
    });
  } catch (error) {
    console.error('Cleanup inactive badges error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during badge cleanup',
      error: error.message
    });
  }
};

// Helper function to get next login time
const getNextLoginTime = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow;
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

    // FILTER: Return only unique badges
    const uniqueBadges = [];
    const seenBadgeIds = new Set();
    
    for (const badge of studentProgress.badgesEarned) {
      const badgeIdStr = badge.badgeId.toString();
      if (!seenBadgeIds.has(badgeIdStr)) {
        seenBadgeIds.add(badgeIdStr);
        uniqueBadges.push(badge);
      }
    }

    res.status(200).json({
      success: true,
      studentName: `${user.firstName} ${user.lastName}`,
      totalPoints: studentProgress.totalPoints,
      currentLevel: studentProgress.currentLevel,
      badgesCount: uniqueBadges.length,
      badges: uniqueBadges,
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
    
    console.log('🏆 Fetching leaderboard...');
    
    // First, ensure ALL users have StudentProgress records
    const AllUsers = (await import('../models/dushani-User.js')).default;
    const allUsers = await AllUsers.find({}, '_id');
    
    console.log(`📊 Found ${allUsers.length} total users in database`);
    
    // Create StudentProgress records for users who don't have them
    let createdCount = 0;
    for (const user of allUsers) {
      const existingProgress = await StudentProgress.findOne({ userId: user._id });
      if (!existingProgress) {
        // Create new StudentProgress record
        const newProgress = new StudentProgress({
          userId: user._id,
          totalPoints: 0,
          currentLevel: 'Level 1'
        });
        await newProgress.save();
        createdCount++;
        console.log(`✅ Created StudentProgress for user ${user._id}`);
      }
    }
    
    if (createdCount > 0) {
      console.log(`✅ Created ${createdCount} new StudentProgress records for leaderboard`);
    }
    
    // Get all student progress with user details
    const allProgress = await StudentProgress.find()
      .populate('userId', 'firstName lastName username email')
      .sort({ totalPoints: -1 })
      .limit(parseInt(limit));

    console.log(`📈 Returning ${allProgress.length} students in leaderboard`);

    // DYNAMICALLY recalculate total points for each student from ALL sources
    const studentsPoints = [];
    const Level = (await import('../models/dushani-Level.js')).default;
    const levels = await Level.getActiveLevels();
    
    console.log(`📊 Found ${levels.length} active levels:`);
    levels.forEach(l => {
      console.log(`   - ${l.levelName}: ${l.minPoints} - ${l.maxPoints || '∞'} points`);
    });
    
    for (const progress of allProgress) {
      // Skip if userId population failed
      if (!progress.userId) {
        console.log('⚠️ Skipping progress record with missing user reference');
        continue;
      }
      
      const userId = progress.userId._id;
      const username = progress.userId.username;
      
      // Get points from GameScore
      const gameScores = await GameScore.find({ userId: username });
      const totalGamePoints = gameScores.reduce((sum, score) => sum + score.score, 0);
      
      // Get points from UserPoints
      const userPointsRecord = await UserPoints.findOne({ userId: userId });
      const userPoints = userPointsRecord ? userPointsRecord.totalPoints : 0;
      
      // Get points from DailyLogin
      const dailyLoginRecords = await DailyLogin.find({ userId: userId });
      const totalDailyLoginPoints = dailyLoginRecords.reduce((sum, record) => sum + (record.pointsAwarded || 10), 0);
      
      // Calculate total from ALL sources
      const calculatedTotalPoints = totalGamePoints + userPoints + totalDailyLoginPoints;
      
      // Track what changed
      const pointsChanged = progress.totalPoints !== calculatedTotalPoints;
      progress.totalPoints = calculatedTotalPoints;
      
      // DYNAMICALLY calculate level based on current level thresholds
      const oldLevel = progress.currentLevel;
      let newLevel;
      
      // Students with 0 points should be 'N/A', not Level 1
      if (calculatedTotalPoints === 0) {
        newLevel = 'N/A';
      } else {
        newLevel = await progress.calculateLevel();
        // If calculateLevel returns null or undefined, set to 'N/A'
        if (!newLevel) newLevel = 'N/A';
      }
      
      const levelChanged = oldLevel !== newLevel;
      progress.currentLevel = newLevel;
      
      if (pointsChanged || levelChanged) {
        console.log(`🔄 ${username}: Points=${calculatedTotalPoints}, Level: ${oldLevel || 'N/A'} → ${newLevel}`);
      }
      
      // Check and award eligible badges
      const Badge = (await import('../models/dushani-Badge.js')).default;
      const activeMilestoneBadges = await Badge.find({
        badgeType: 'Milestone',
        status: 'Active'
      }).sort({ pointsRequired: 1 });
      
      let badgesAwarded = 0;
      for (const badge of activeMilestoneBadges) {
        if (calculatedTotalPoints >= badge.pointsRequired && !progress.hasBadge(badge._id)) {
          progress.addBadge(badge);
          await Badge.findByIdAndUpdate(badge._id, { $inc: { earnedCount: 1 } });
          
          // Create notification
          const BadgeNotification = (await import('../models/dushani-BadgeNotification.js')).default;
          await BadgeNotification.createNotification(userId, badge);
          badgesAwarded++;
        }
      }
      
      // Remove inactive/invalid badges
      const oldBadgeCount = progress.badgesEarned.length;
      progress.badgesEarned = progress.badgesEarned.filter(badgeEntry => {
        const badge = activeMilestoneBadges.find(b => b._id.toString() === badgeEntry.badgeId.toString());
        return badge && calculatedTotalPoints >= badge.pointsRequired;
      });
      const badgesRemoved = oldBadgeCount - progress.badgesEarned.length;
      
      // Save if anything changed
      if (pointsChanged || levelChanged || badgesAwarded > 0 || badgesRemoved > 0) {
        await progress.save();
        console.log(`✅ Saved ${username}: Points=${calculatedTotalPoints}, Level=${newLevel}, Badges=${progress.badgesEarned.length}`);
      }
      
      studentsPoints.push({
        userId: userId,
        studentName: `${progress.userId.firstName} ${progress.userId.lastName}`,
        username: username,
        totalPoints: calculatedTotalPoints,
        currentLevel: progress.currentLevel,
        badgesCount: progress.badgesEarned.length,
        lastActivity: progress.lastActivity
      });
    }
    
    // Sort by totalPoints descending
    studentsPoints.sort((a, b) => b.totalPoints - a.totalPoints);
    
    console.log(`📈 Final leaderboard (${studentsPoints.length} students):`);
    studentsPoints.slice(0, 5).forEach((s, i) => {
      console.log(`   #${i+1} ${s.studentName}: ${s.totalPoints} pts - ${s.currentLevel}`);
    });

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

// Get current user's points, level, and rank - GET /api/points/my-status
export const getMyPointsStatus = async (req, res) => {
  try {
    const { user, userId } = await getCurrentUserAndId(req);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // DYNAMICALLY CALCULATE POINTS FROM ALL SOURCES
    const TrueFalseResult = (await import('../models/dilshara-TrueFalseResult.js')).default;
    const QuizResult = (await import('../models/dilshara-QuizResult.js')).default;
    const UserPoints = (await import('../models/amasha-userPoints.js')).default;
    const DailyLogin = (await import('../models/dushani-points.js')).default;
    const StudentProgress = (await import('../models/dushani-StudentProgress.js')).default;
    const Level = (await import('../models/dushani-Level.js')).default;

    // Get points from all sources
    const gameScores = await GameScore.find({ userId: user.username });
    const totalGamePoints = gameScores.reduce((sum, score) => sum + score.score, 0);

    const userPointsRecord = await UserPoints.findOne({ userId: userId });
    const userPoints = userPointsRecord ? userPointsRecord.totalPoints : 0;

    const dailyLoginRecords = await DailyLogin.find({ userId: userId });
    const totalDailyLoginPoints = dailyLoginRecords.reduce((sum, record) => sum + (record.pointsAwarded || 10), 0);

    // Calculate TOTAL dynamic points
    const dynamicTotalPoints = totalGamePoints + userPoints + totalDailyLoginPoints;

    // Get or create student progress
    let studentProgress = await StudentProgress.findOne({ userId });
    if (!studentProgress) {
      studentProgress = new StudentProgress({ 
        userId,
        totalPoints: dynamicTotalPoints
      });
      await studentProgress.save();
    } else {
      // Update with calculated total if different
      if (studentProgress.totalPoints !== dynamicTotalPoints) {
        studentProgress.totalPoints = dynamicTotalPoints;
        studentProgress.currentLevel = await studentProgress.calculateLevel();
        await studentProgress.save();
      }
    }

    // Get current level
    const levels = await Level.getActiveLevels();
    let currentLevelDoc = null;
    if (dynamicTotalPoints > 0) {
      currentLevelDoc = levels.find(level => {
        const max = level.maxPoints ?? Infinity;
        return dynamicTotalPoints >= level.minPoints && dynamicTotalPoints <= max;
      });
    }

    // Calculate rank by getting all students and sorting by points
    const allProgress = await StudentProgress.find().populate('userId', 'firstName lastName username');
    const studentsPoints = [];
    
    for (const progress of allProgress) {
      if (!progress.userId) continue;
      
      const stuUsername = progress.userId.username;
      
      // Calculate points for each student
      const gameScores = await GameScore.find({ userId: stuUsername });
      const gamePoints = gameScores.reduce((sum, r) => sum + r.score, 0);
      
      const uPointsRecord = await UserPoints.findOne({ userId: progress.userId._id });
      const uPoints = uPointsRecord ? uPointsRecord.totalPoints : 0;
      
      const dlRecords = await DailyLogin.find({ userId: progress.userId._id });
      const dlPoints = dlRecords.reduce((sum, r) => sum + (r.pointsAwarded || 10), 0);
      
      const totalPts = gamePoints + uPoints + dlPoints;
      
      studentsPoints.push({
        userId: progress.userId._id,
        username: stuUsername,
        totalPoints: totalPts
      });
    }
    
    // Sort by totalPoints descending
    studentsPoints.sort((a, b) => b.totalPoints - a.totalPoints);
    
    // Find current user's rank
    const userRankIndex = studentsPoints.findIndex(s => s.userId.toString() === userId.toString());
    const userRank = userRankIndex !== -1 ? userRankIndex + 1 : null;

    // FILTER: Return only unique badges
    const uniqueBadges = [];
    const seenBadgeIds = new Set();
    
    for (const badge of studentProgress.badgesEarned) {
      const badgeIdStr = badge.badgeId.toString();
      if (!seenBadgeIds.has(badgeIdStr)) {
        seenBadgeIds.add(badgeIdStr);
        uniqueBadges.push(badge);
      }
    }

    res.status(200).json({
      success: true,
      data: {
        totalPoints: dynamicTotalPoints,
        currentLevel: currentLevelDoc ? currentLevelDoc.levelName : 'N/A',
        rank: userRank ? `#${userRank}` : 'N/A',
        rankNumber: userRank,
        badgesCount: uniqueBadges.length,
        badges: uniqueBadges.map(badge => ({
          badgeId: badge.badgeId,
          badgeName: badge.badgeDetails?.badgeName || 'Unknown Badge',
          badgeIcon: badge.badgeDetails?.badgeIcon || '⭐',
          description: badge.badgeDetails?.description || '',
          earnedAt: badge.earnedAt
        })),
        pointsBreakdown: {
          gamePoints: totalGamePoints,
          userPoints: userPoints,
          dailyLoginPoints: totalDailyLoginPoints
        }
      }
    });
  } catch (error) {
    console.error('Get my points status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
