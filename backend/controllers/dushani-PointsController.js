import DailyLogin from '../models/dushani-points.js';
import StudentProgress from '../models/dushani-StudentProgress.js';
import User from '../models/dushani-User.js';
import UserPoints from '../models/amasha-userPoints.js';
import TrueFalseResult from '../models/dilshara-TrueFalseResult.js';
import QuizResult from '../models/dilshara-QuizResult.js';
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

// Reset points by recalculating from actual quiz and true/false results only (removes test points) - POST /api/points/reset-test-points
export const resetTestPoints = async (req, res) => {
  try {
    console.log('Starting reset of test points by recalculating from actual results...');

    // Get all unique users from TrueFalseResult
    const trueFalseResults = await TrueFalseResult.aggregate([
      {
        $group: {
          _id: '$userId',
          totalTrueFalsePoints: { $sum: '$pointsEarned' }
        }
      }
    ]);

    console.log(`Found ${trueFalseResults.length} users with TrueFalse results`);

    // Get all unique users from QuizResult
    const quizResults = await QuizResult.aggregate([
      {
        $group: {
          _id: '$userId',
          totalQuizPoints: { $sum: '$score' }
        }
      }
    ]);

    console.log(`Found ${quizResults.length} users with Quiz results`);

    // Combine the results by userId
    const combinedResults = {};
    
    // Add TrueFalse points
    trueFalseResults.forEach(result => {
      if (!combinedResults[result._id]) {
        combinedResults[result._id] = { totalTrueFalsePoints: 0, totalQuizPoints: 0 };
      }
      combinedResults[result._id].totalTrueFalsePoints = result.totalTrueFalsePoints;
    });

    // Add Quiz points
    quizResults.forEach(result => {
      if (!combinedResults[result._id]) {
        combinedResults[result._id] = { totalTrueFalsePoints: 0, totalQuizPoints: 0 };
      }
      combinedResults[result._id].totalQuizPoints = result.totalQuizPoints;
    });

    console.log(`Recalculating points for ${Object.keys(combinedResults).length} users...`);

    // Get all student progress records to reset
    const allStudentProgress = await StudentProgress.find();
    let resetCount = 0;

    for (const studentProgress of allStudentProgress) {
      const userIdStr = studentProgress.userId.toString();
      
      // Look for this user in the combined results
      const pointsData = combinedResults[userIdStr] || { totalTrueFalsePoints: 0, totalQuizPoints: 0 };
      
      // Calculate total points from actual results only (removing any test points)
      const totalActualPoints = pointsData.totalTrueFalsePoints + pointsData.totalQuizPoints;
      
      const originalTotal = studentProgress.totalPoints;
      
      // Set the total points to only what was earned from actual quizzes and true/false questions
      studentProgress.totalPoints = totalActualPoints;
      
      // Recalculate the level based on the new points
      studentProgress.currentLevel = await studentProgress.calculateLevel();
      
      await studentProgress.save();
      
      console.log(`Reset user ${userIdStr}: Original total: ${originalTotal}, New total (actual results only): ${studentProgress.totalPoints}`);
      resetCount++;
    }

    res.status(200).json({
      success: true,
      message: `Successfully reset test points for ${resetCount} students, keeping only actual quiz/true-false results`,
      studentsReset: resetCount
    });

  } catch (error) {
    console.error('Reset test points error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during test points reset',
      error: error.message
    });
  }
};

// Aggregate points from userPoints table and add them to each student's total points - POST /api/points/aggregate-user-points
export const aggregateUserPoints = async (req, res) => {
  try {
    console.log('Starting aggregation of points from userPoints table...');

    // Get all user points records
    const userPointsRecords = await UserPoints.find();

    console.log(`Found ${userPointsRecords.length} user points records to aggregate...`);

    let aggregatedCount = 0;
    
    for (const userPointRecord of userPointsRecords) {
      // Get the user ID from the userPoints record
      const userId = userPointRecord.userId;
      
      // Get or create student progress for this user
      let studentProgress = await StudentProgress.findOne({ userId });
      if (!studentProgress) {
        studentProgress = new StudentProgress({ 
          userId: userId,
          totalPoints: 0
        });
      }

      // Get the total points from the userPoints record
      const pointsFromUserPoints = userPointRecord.totalPoints;

      // Only add points if they haven't been added before or if there are additional points
      // We'll add the difference between userPoints total and current StudentProgress total
      const currentTotalPoints = studentProgress.totalPoints;
      const pointsToAdd = Math.max(0, pointsFromUserPoints); // Only add positive points
      
      if (pointsToAdd > 0) {
        await studentProgress.addPoints(pointsToAdd);
        await studentProgress.save();
        
        console.log(`Updated user ${userId}: Added ${pointsToAdd} points from userPoints table. Previous total: ${currentTotalPoints}, New total: ${studentProgress.totalPoints}`);
        aggregatedCount++;
      } else {
        console.log(`User ${userId} had ${pointsFromUserPoints} points in userPoints, current total: ${currentTotalPoints}. No points added.`);
      }
    }

    res.status(200).json({
      success: true,
      message: `Successfully aggregated points from userPoints table for ${aggregatedCount} students`,
      usersAggregated: aggregatedCount
    });

  } catch (error) {
    console.error('Aggregate user points error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during user points aggregation',
      error: error.message
    });
  }
};

// Consolidate all points from all sources (daily login, quizzes, userpoints, truefalse) - POST /api/points/consolidate-all-points
export const consolidateAllPoints = async (req, res) => {
  try {
    console.log('Starting consolidation of all points from all sources...');

    // Get all TrueFalseResult records
    const allTrueFalseResults = await TrueFalseResult.find();
    console.log(`Found ${allTrueFalseResults.length} TrueFalse result records`);

    // Get all QuizResult records
    const allQuizResults = await QuizResult.find();
    console.log(`Found ${allQuizResults.length} Quiz result records`);

    // Get all user points records
    const userPointsRecords = await UserPoints.find();
    console.log(`Found ${userPointsRecords.length} user points records`);

    // Get all daily login records
    const dailyLoginRecords = await DailyLogin.find();
    console.log(`Found ${dailyLoginRecords.length} daily login records`);

    // Create a map to consolidate points for each user
    const consolidatedPoints = {};

    // Group TrueFalse points by userId (stored as string in the model)
    for (const result of allTrueFalseResults) {
      const userIdStr = result.userId; // This is already a string
      
      if (!consolidatedPoints[userIdStr]) {
        consolidatedPoints[userIdStr] = {
          totalTrueFalsePoints: 0,
          totalQuizPoints: 0,
          totalUserPoints: 0,
          totalDailyLoginPoints: 0
        };
      }
      consolidatedPoints[userIdStr].totalTrueFalsePoints += result.pointsEarned;
    }

    // Group Quiz points by userId (stored as string in the model)
    for (const result of allQuizResults) {
      const userIdStr = result.userId; // This is already a string
      
      if (!consolidatedPoints[userIdStr]) {
        consolidatedPoints[userIdStr] = {
          totalTrueFalsePoints: 0,
          totalQuizPoints: 0,
          totalUserPoints: 0,
          totalDailyLoginPoints: 0
        };
      }
      consolidatedPoints[userIdStr].totalQuizPoints += result.score;
    }

    // Add UserPoints (userId is stored as ObjectId)
    for (const record of userPointsRecords) {
      const userIdStr = record.userId.toString(); // Convert ObjectId to string
      
      if (!consolidatedPoints[userIdStr]) {
        consolidatedPoints[userIdStr] = {
          totalTrueFalsePoints: 0,
          totalQuizPoints: 0,
          totalUserPoints: 0,
          totalDailyLoginPoints: 0
        };
      }
      consolidatedPoints[userIdStr].totalUserPoints = record.totalPoints;
    }

    // Add Daily Login points (userId is stored as ObjectId)
    for (const record of dailyLoginRecords) {
      const userIdStr = record.userId.toString(); // Convert ObjectId to string
      
      if (!consolidatedPoints[userIdStr]) {
        consolidatedPoints[userIdStr] = {
          totalTrueFalsePoints: 0,
          totalQuizPoints: 0,
          totalUserPoints: 0,
          totalDailyLoginPoints: 0
        };
      }
      if (record.pointsAwarded) {
        consolidatedPoints[userIdStr].totalDailyLoginPoints += record.pointsAwarded;
      } else {
        consolidatedPoints[userIdStr].totalDailyLoginPoints += 10; // default daily login points
      }
    }

    console.log(`Consolidating points for ${Object.keys(consolidatedPoints).length} users...`);

    let consolidatedCount = 0;

    // Process each user and update their total points
    for (const userIdStr in consolidatedPoints) {
      const pointsData = consolidatedPoints[userIdStr];

      // Look for user by username first (handles TrueFalseResult and QuizResult entries)
      let user = await User.findOne({ username: userIdStr });
      
      if (!user) {
        // If not found by username, try to find by ObjectId (handles UserPoints and DailyLogin entries)
        try {
          user = await User.findById(userIdStr);
        } catch (e) {
          // Invalid ObjectId format, try to find by username that might look like an ObjectId
          // Check if the userIdStr could be someone's username that happens to look like an ObjectId
          user = await User.findOne({ username: userIdStr });
        }
      }
      
      if (user) {
        // Get or create student progress for this user
        let studentProgress = await StudentProgress.findOne({ userId: user._id });
        if (!studentProgress) {
          studentProgress = new StudentProgress({ 
            userId: user._id,
            totalPoints: 0
          });
        }

        // Calculate total points from all sources
        const totalAllPoints = 
          pointsData.totalTrueFalsePoints +
          pointsData.totalQuizPoints +
          pointsData.totalUserPoints +
          pointsData.totalDailyLoginPoints;

        const originalTotal = studentProgress.totalPoints;

        // Set the total points to the sum of all sources
        studentProgress.totalPoints = totalAllPoints;

        // Recalculate the level based on the new points
        studentProgress.currentLevel = await studentProgress.calculateLevel();

        await studentProgress.save();

        console.log(`Consolidated points for user ${user.username}:`);
        console.log(`  TrueFalse: ${pointsData.totalTrueFalsePoints}`);
        console.log(`  Quiz: ${pointsData.totalQuizPoints}`);
        console.log(`  UserPoints: ${pointsData.totalUserPoints}`);
        console.log(`  Daily Login: ${pointsData.totalDailyLoginPoints}`);
        console.log(`  Total: ${totalAllPoints} (Previous: ${originalTotal})`);

        consolidatedCount++;
      } else {
        console.log(`User not found for userId/username: ${userIdStr}`);
      }
    }

    // Additionally, ensure all users in User collection have StudentProgress records
    const allUsers = await User.find();
    for (const user of allUsers) {
      // Check if user has any points in any of the source collections
      const hasTrueFalsePoints = allTrueFalseResults.some(result => result.userId === user.username);
      const hasQuizPoints = allQuizResults.some(result => result.userId === user.username);
      const hasUserPoints = userPointsRecords.some(record => record.userId.toString() === user._id.toString());
      const hasDailyLoginPoints = dailyLoginRecords.some(record => record.userId.toString() === user._id.toString());

      if (hasTrueFalsePoints || hasQuizPoints || hasUserPoints || hasDailyLoginPoints) {
        // This user has points but may not have been processed above due to mismatched IDs
        let studentProgress = await StudentProgress.findOne({ userId: user._id });
        if (!studentProgress) {
          // Create a new student progress record with calculated points
          const userTrueFalsePoints = allTrueFalseResults
            .filter(result => result.userId === user.username)
            .reduce((sum, result) => sum + result.pointsEarned, 0);
          
          const userQuizPoints = allQuizResults
            .filter(result => result.userId === user.username)
            .reduce((sum, result) => sum + result.score, 0);
          
          const userUserPointsRecord = userPointsRecords.find(record => record.userId.toString() === user._id.toString());
          const userUserPoints = userUserPointsRecord ? userUserPointsRecord.totalPoints : 0;
          
          const userDailyLoginPoints = dailyLoginRecords
            .filter(record => record.userId.toString() === user._id.toString())
            .reduce((sum, record) => sum + (record.pointsAwarded || 10), 0);

          const totalCalculatedPoints = userTrueFalsePoints + userQuizPoints + userUserPoints + userDailyLoginPoints;

          studentProgress = new StudentProgress({ 
            userId: user._id,
            totalPoints: totalCalculatedPoints
          });

          await studentProgress.save();
          console.log(`Created new StudentProgress for user ${user.username} with ${totalCalculatedPoints} points`);
          consolidatedCount++;
        }
      }
    }

    res.status(200).json({
      success: true,
      message: `Successfully consolidated all points from all sources for ${consolidatedCount} students`,
      usersConsolidated: consolidatedCount,
      summary: {
        trueFalseRecords: allTrueFalseResults.length,
        quizRecords: allQuizResults.length,
        userPointsRecords: userPointsRecords.length,
        dailyLoginRecords: dailyLoginRecords.length
      }
    });

  } catch (error) {
    console.error('Consolidate all points error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during points consolidation',
      error: error.message
    });
  }
};

// Aggregate points from TrueFalseResult and QuizResult collections - POST /api/points/aggregate-results-points
export const aggregateResultsPoints = async (req, res) => {
  try {
    console.log('Starting aggregation of points from TrueFalseResult and QuizResult collections...');
    
    // Get all unique users from TrueFalseResult
    const trueFalseResults = await TrueFalseResult.aggregate([
      {
        $group: {
          _id: '$userId',
          totalTrueFalsePoints: { $sum: '$pointsEarned' }
        }
      }
    ]);

    console.log(`Found ${trueFalseResults.length} users with TrueFalse results`);

    // Get all unique users from QuizResult
    const quizResults = await QuizResult.aggregate([
      {
        $group: {
          _id: '$userId',
          totalQuizPoints: { $sum: '$score' }
        }
      }
    ]);

    console.log(`Found ${quizResults.length} users with Quiz results`);

    // Combine the results by userId
    const combinedResults = {};
    
    // Add TrueFalse points
    trueFalseResults.forEach(result => {
      if (!combinedResults[result._id]) {
        combinedResults[result._id] = { totalTrueFalsePoints: 0, totalQuizPoints: 0 };
      }
      combinedResults[result._id].totalTrueFalsePoints = result.totalTrueFalsePoints;
    });

    // Add Quiz points
    quizResults.forEach(result => {
      if (!combinedResults[result._id]) {
        combinedResults[result._id] = { totalTrueFalsePoints: 0, totalQuizPoints: 0 };
      }
      combinedResults[result._id].totalQuizPoints = result.totalQuizPoints;
    });

    console.log(`Processing points for ${Object.keys(combinedResults).length} unique users...`);

    // Process each user
    for (const userIdStr in combinedResults) {
      const pointsData = combinedResults[userIdStr];
      
      // Convert userId string to ObjectId if needed
      // First check if this userId exists as an ObjectId in our User collection
      let user = await User.findOne({ _id: userIdStr });
      
      // If not found as ObjectId, try to find by username (since some collections use string userId)
      if (!user) {
        user = await User.findOne({ username: userIdStr });
      }
      
      if (user) {
        // Get or create student progress for this user
        let studentProgress = await StudentProgress.findOne({ userId: user._id });
        if (!studentProgress) {
          studentProgress = new StudentProgress({ 
            userId: user._id,
            totalPoints: 0
          });
        }

        // Calculate total points from results
        const totalPointsFromResults = pointsData.totalTrueFalsePoints + pointsData.totalQuizPoints;

        // Only add the points if they haven't been added before
        // We'll calculate the sum of points from results and compare with current total
        const currentTotalPoints = studentProgress.totalPoints;
        
        // We'll add the difference between calculated points and current points
        const pointsToAdd = totalPointsFromResults;
        
        if (pointsToAdd > 0) {
          await studentProgress.addPoints(pointsToAdd);
          await studentProgress.save();
          
          console.log(`Updated user ${user.username}: Added ${pointsToAdd} points (TrueFalse: ${pointsData.totalTrueFalsePoints}, Quiz: ${pointsData.totalQuizPoints}). New total: ${studentProgress.totalPoints}`);
        } else {
          console.log(`User ${user.username} already has equal or higher points. Current: ${currentTotalPoints}, Calculated from results: ${totalPointsFromResults}`);
        }
      } else {
        console.log(`User not found for userId: ${userIdStr}`);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Successfully aggregated points from TrueFalseResult and QuizResult collections',
      usersProcessed: Object.keys(combinedResults).length
    });

  } catch (error) {
    console.error('Aggregate results points error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during points aggregation',
      error: error.message
    });
  }
};

// Diagnostic function to check points distribution for a specific user - GET /api/points/diagnostic/:username
export const getPointsDiagnostic = async (req, res) => {
  try {
    const { username } = req.params;
    
    console.log(`Getting points diagnostic for user: ${username}`);

    // Find the user in the User collection
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User with username ${username} not found`
      });
    }

    // Get points from TrueFalseResult for this user
    const trueFalseResults = await TrueFalseResult.find({ userId: username });
    const totalTrueFalsePoints = trueFalseResults.reduce((sum, result) => sum + result.pointsEarned, 0);

    // Get points from QuizResult for this user
    const quizResults = await QuizResult.find({ userId: username });
    const totalQuizPoints = quizResults.reduce((sum, result) => sum + result.score, 0);

    // Get points from UserPoints for this user
    const userPoints = await UserPoints.findOne({ userId: user._id });
    
    // Get points from DailyLogin for this user
    const dailyLoginRecords = await DailyLogin.find({ userId: user._id });
    const totalDailyLoginPoints = dailyLoginRecords.reduce((sum, record) => sum + (record.pointsAwarded || 10), 0);

    // Calculate total points
    const totalAllPoints = totalTrueFalsePoints + totalQuizPoints + (userPoints?.totalPoints || 0) + totalDailyLoginPoints;

    // Get the user's progress from StudentProgress
    let studentProgress = await StudentProgress.findOne({ userId: user._id });

    if (!studentProgress) {
      // If student progress doesn't exist, create it with calculated points
      studentProgress = new StudentProgress({ 
        userId: user._id,
        totalPoints: totalAllPoints
      });
      
      await studentProgress.save();
      console.log(`Created new StudentProgress for user ${username} with ${totalAllPoints} points during diagnostic`);
    } else {
      // If student progress exists but doesn't match calculated total, update it
      if (studentProgress.totalPoints !== totalAllPoints) {
        console.log(`Updating student progress for ${username} during diagnostic: ${studentProgress.totalPoints} -> ${totalAllPoints}`);
        studentProgress.totalPoints = totalAllPoints;
        studentProgress.currentLevel = await studentProgress.calculateLevel();
        await studentProgress.save();
        
        // Check for milestone badges after updating points
        await checkAndAwardMilestoneBadges(studentProgress);
        
        // Refresh to ensure we have the updated data
        studentProgress = await StudentProgress.findOne({ userId: user._id });
      }
    }

    res.status(200).json({
      success: true,
      user: {
        userId: user._id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName
      },
      pointsBreakdown: {
        currentTotalInStudentProgress: studentProgress?.totalPoints || 0,
        trueFalsePoints: totalTrueFalsePoints,
        quizPoints: totalQuizPoints,
        userPoints: userPoints?.totalPoints || 0,
        dailyLoginPoints: totalDailyLoginPoints
      },
      potentialTotal: totalAllPoints,
      studentProgressExists: !!studentProgress,
      calculatedTotal: totalAllPoints
    });

  } catch (error) {
    console.error('Get points diagnostic error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during points diagnostic',
      error: error.message
    });
  }
};

// Specific diagnostic function to check student progress - GET /api/points/check-progress/:username
export const checkStudentProgress = async (req, res) => {
  try {
    const { username } = req.params;
    
    console.log(`Checking student progress for user: ${username}`);

    // Find the user in the User collection
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User with username ${username} not found`
      });
    }

    // Get points from TrueFalseResult for this user
    const trueFalseResults = await TrueFalseResult.find({ userId: username });
    const totalTrueFalsePoints = trueFalseResults.reduce((sum, result) => sum + result.pointsEarned, 0);

    // Get points from QuizResult for this user
    const quizResults = await QuizResult.find({ userId: username });
    const totalQuizPoints = quizResults.reduce((sum, result) => sum + result.score, 0);

    // Get points from UserPoints for this user
    const userPoints = await UserPoints.findOne({ userId: user._id });
    
    // Get points from DailyLogin for this user
    const dailyLoginRecords = await DailyLogin.find({ userId: user._id });
    const totalDailyLoginPoints = dailyLoginRecords.reduce((sum, record) => sum + (record.pointsAwarded || 10), 0);

    // Calculate total points
    const totalAllPoints = totalTrueFalsePoints + totalQuizPoints + (userPoints?.totalPoints || 0) + totalDailyLoginPoints;

    // Get the user's progress from StudentProgress
    let studentProgress = await StudentProgress.findOne({ userId: user._id });

    if (!studentProgress) {
      // If student progress doesn't exist, create it with calculated points
      studentProgress = new StudentProgress({ 
        userId: user._id,
        totalPoints: totalAllPoints
      });
      
      await studentProgress.save();
      console.log(`Created new StudentProgress for user ${username} with ${totalAllPoints} points`);
      
      // Check for milestone badges after creating the record
      await checkAndAwardMilestoneBadges(studentProgress);
    } else {
      // If student progress exists, update it with the calculated points to ensure accuracy
      // This ensures that the stored value matches the actual calculated total from all sources
      if (studentProgress.totalPoints !== totalAllPoints) {
        console.log(`Updating student progress for ${username}: ${studentProgress.totalPoints} -> ${totalAllPoints}`);
        studentProgress.totalPoints = totalAllPoints;
        studentProgress.currentLevel = await studentProgress.calculateLevel();
        
        // Save the updated student progress
        await studentProgress.save();
        
        // Check for milestone badges after updating points
        await checkAndAwardMilestoneBadges(studentProgress);
        
        // Verify the save was successful by fetching again
        studentProgress = await StudentProgress.findOne({ userId: user._id });
        console.log(`Verified saved StudentProgress for ${username} has ${studentProgress.totalPoints} points`);
      } else {
        console.log(`StudentProgress for ${username} already has correct points: ${studentProgress.totalPoints}`);
        // Even if points haven't changed, check for badges in case badge criteria have changed
        await checkAndAwardMilestoneBadges(studentProgress);
      }
    }

    res.status(200).json({
      success: true,
      user: {
        userId: user._id,
        username: user.username
      },
      studentProgress: studentProgress,
      hasStudentProgress: !!studentProgress,
      recalculatedTotal: totalAllPoints,
      pointsBreakdown: {
        trueFalsePoints: totalTrueFalsePoints,
        quizPoints: totalQuizPoints,
        userPoints: userPoints?.totalPoints || 0,
        dailyLoginPoints: totalDailyLoginPoints,
        calculatedTotal: totalAllPoints
      }
    });

  } catch (error) {
    console.error('Check student progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during student progress check',
      error: error.message
    });
  }
};

// Update points for a specific user - PUT /api/points/update-user-points/:username
export const updateUserPoints = async (req, res) => {
  try {
    const { username } = req.params;
    
    console.log(`Updating points for user: ${username}`);

    // Find the user in the User collection
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User with username ${username} not found`
      });
    }

    // Get points from TrueFalseResult for this user
    const trueFalseResults = await TrueFalseResult.find({ userId: username });
    const totalTrueFalsePoints = trueFalseResults.reduce((sum, result) => sum + result.pointsEarned, 0);

    // Get points from QuizResult for this user
    const quizResults = await QuizResult.find({ userId: username });
    const totalQuizPoints = quizResults.reduce((sum, result) => sum + result.score, 0);

    // Get points from UserPoints for this user
    const userPointsRecord = await UserPoints.findOne({ userId: user._id });
    const userPoints = userPointsRecord ? userPointsRecord.totalPoints : 0;
    
    // Get points from DailyLogin for this user
    const dailyLoginRecords = await DailyLogin.find({ userId: user._id });
    const totalDailyLoginPoints = dailyLoginRecords.reduce((sum, record) => sum + (record.pointsAwarded || 10), 0);

    // Calculate total points
    const totalAllPoints = totalTrueFalsePoints + totalQuizPoints + userPoints + totalDailyLoginPoints;

    // Get or create student progress for this user
    let studentProgress = await StudentProgress.findOne({ userId: user._id });
    if (!studentProgress) {
      studentProgress = new StudentProgress({ 
        userId: user._id,
        totalPoints: totalAllPoints
      });
    } else {
      // Update existing record
      studentProgress.totalPoints = totalAllPoints;
      studentProgress.currentLevel = await studentProgress.calculateLevel();
    }

    await studentProgress.save();

    res.status(200).json({
      success: true,
      message: `Successfully updated points for user ${username}`,
      user: {
        userId: user._id,
        username: user.username
      },
      pointsBreakdown: {
        trueFalsePoints: totalTrueFalsePoints,
        quizPoints: totalQuizPoints,
        userPoints: userPoints,
        dailyLoginPoints: totalDailyLoginPoints,
        totalAllPoints: totalAllPoints
      },
      updatedStudentProgress: studentProgress
    });

  } catch (error) {
    console.error('Update user points error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during user points update',
      error: error.message
    });
  }
};
