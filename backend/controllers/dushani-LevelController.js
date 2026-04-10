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
      createdBy: createdBy || undefined // Only set if found
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

    // DYNAMICALLY calculate student count for each level
    const StudentProgress = (await import('../models/dushani-StudentProgress.js')).default;
    const TrueFalseResult = (await import('../models/dilshara-TrueFalseResult.js')).default;
    const QuizResult = (await import('../models/dilshara-QuizResult.js')).default;
    const UserPoints = (await import('../models/amasha-userPoints.js')).default;
    const DailyLogin = (await import('../models/dushani-points.js')).default;
    
    const allStudents = await StudentProgress.find();
    
    // Calculate points for each student and assign to levels
    const levelCounts = {};
    levels.forEach(level => {
      levelCounts[level._id.toString()] = 0;
    });
    
    let naCount = 0;
    
    for (const student of allStudents) {
      // Dynamically calculate total points
      const user = await (await import('../models/dushani-User.js')).default.findById(student.userId);
      if (!user) continue;
      
      const trueFalseResults = await TrueFalseResult.find({ userId: user.username });
      const totalTrueFalsePoints = trueFalseResults.reduce((sum, result) => sum + result.pointsEarned, 0);
      
      const quizResults = await QuizResult.find({ userId: user.username });
      const totalQuizPoints = quizResults.reduce((sum, result) => sum + result.score, 0);
      
      const userPointsRecord = await UserPoints.findOne({ userId: student.userId });
      const userPoints = userPointsRecord ? userPointsRecord.totalPoints : 0;
      
      const dailyLoginRecords = await DailyLogin.find({ userId: student.userId });
      const totalDailyLoginPoints = dailyLoginRecords.reduce((sum, record) => sum + (record.pointsAwarded || 10), 0);
      
      const dynamicTotalPoints = totalTrueFalsePoints + totalQuizPoints + userPoints + totalDailyLoginPoints;
      
      // Update student progress if needed
      if (student.totalPoints !== dynamicTotalPoints) {
        student.totalPoints = dynamicTotalPoints;
      }
      
      // Calculate level
      let studentLevel;
      if (dynamicTotalPoints === 0) {
        studentLevel = 'N/A';
        naCount++;
      } else {
        studentLevel = await student.calculateLevel();
        if (!studentLevel) {
          studentLevel = 'N/A';
          naCount++;
        }
      }
      
      student.currentLevel = studentLevel;
      await student.save();
      
      // Count this student in their level
      const matchingLevel = levels.find(l => l.levelName === studentLevel);
      if (matchingLevel) {
        levelCounts[matchingLevel._id.toString()]++;
      }
    }
    
    console.log(`📊 Level distribution: ${levels.map(l => `${l.levelName}: ${levelCounts[l._id.toString()]}`).join(', ')}, N/A: ${naCount}`);

    // Add studentCount to each level
    const levelsWithCounts = levels.map(level => ({
      ...level.toObject(),
      studentCount: levelCounts[level._id.toString()] || 0
    }));

    res.status(200).json({
      success: true,
      count: levels.length,
      levels: levelsWithCounts,
      naLevelCount: naCount
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

    // 🔄 RECALCULATE ALL STUDENTS' LEVELS after level thresholds changed
    const StudentProgress = (await import('../models/dushani-StudentProgress.js')).default;
    const TrueFalseResult = (await import('../models/dilshara-TrueFalseResult.js')).default;
    const QuizResult = (await import('../models/dilshara-QuizResult.js')).default;
    const UserPoints = (await import('../models/amasha-userPoints.js')).default;
    const DailyLogin = (await import('../models/dushani-points.js')).default;
    const Badge = (await import('../models/dushani-Badge.js')).default;
    
    const allStudents = await StudentProgress.find();
    console.log(`🔄 Recalculating levels for ${allStudents.length} students after level update...`);
    
    let updatedCount = 0;
    for (const student of allStudents) {
      // Dynamically calculate total points from all sources
      const user = await (await import('../models/dushani-User.js')).default.findById(student.userId);
      if (!user) continue;
      
      const trueFalseResults = await TrueFalseResult.find({ userId: user.username });
      const totalTrueFalsePoints = trueFalseResults.reduce((sum, result) => sum + result.pointsEarned, 0);
      
      const quizResults = await QuizResult.find({ userId: user.username });
      const totalQuizPoints = quizResults.reduce((sum, result) => sum + result.score, 0);
      
      const userPointsRecord = await UserPoints.findOne({ userId: student.userId });
      const userPoints = userPointsRecord ? userPointsRecord.totalPoints : 0;
      
      const dailyLoginRecords = await DailyLogin.find({ userId: student.userId });
      const totalDailyLoginPoints = dailyLoginRecords.reduce((sum, record) => sum + (record.pointsAwarded || 10), 0);
      
      const dynamicTotalPoints = totalTrueFalsePoints + totalQuizPoints + userPoints + totalDailyLoginPoints;
      
      // Update student's total points
      const pointsChanged = student.totalPoints !== dynamicTotalPoints;
      student.totalPoints = dynamicTotalPoints;
      
      // Recalculate level
      const newLevel = await student.calculateLevel();
      const levelChanged = student.currentLevel !== newLevel;
      student.currentLevel = newLevel;
      
      // Check and award eligible badges
      const activeMilestoneBadges = await Badge.find({
        badgeType: 'Milestone',
        status: 'Active'
      }).sort({ pointsRequired: 1 });
      
      let badgesAwarded = 0;
      for (const badge of activeMilestoneBadges) {
        if (dynamicTotalPoints >= badge.pointsRequired && !student.hasBadge(badge._id)) {
          student.addBadge(badge);
          await Badge.findByIdAndUpdate(badge._id, { $inc: { earnedCount: 1 } });
          
          // Create notification
          const BadgeNotification = (await import('../models/dushani-BadgeNotification.js')).default;
          await BadgeNotification.createNotification(student.userId, badge);
          badgesAwarded++;
        }
      }
      
      // Remove inactive/invalid badges
      student.badgesEarned = student.badgesEarned.filter(badgeEntry => {
        const badge = activeMilestoneBadges.find(b => b._id.toString() === badgeEntry.badgeId.toString());
        return badge && dynamicTotalPoints >= badge.pointsRequired;
      });
      
      // Save if anything changed
      if (pointsChanged || levelChanged || badgesAwarded > 0) {
        await student.save();
        updatedCount++;
        console.log(`✅ Updated ${user.username}: Points=${dynamicTotalPoints}, Level=${newLevel}, Badges=${badgesAwarded}`);
      }
    }
    
    console.log(`✅ Total students updated: ${updatedCount}`);

    res.status(200).json({
      success: true,
      message: 'Level updated successfully',
      level,
      studentsUpdated: updatedCount,
      totalStudentsProcessed: allStudents.length
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



  // Admin: Delete Level (Permanent - removes from DB and updates all students)

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

    // Permanently delete the level from database
    await Level.findByIdAndDelete(id);

    // Recalculate ALL students' levels based on remaining active levels
    const StudentProgress = (await import('../models/dushani-StudentProgress.js')).default;
    const allStudents = await StudentProgress.find();
    
    console.log(`Found ${allStudents.length} students to process`);
    
    let updatedCount = 0;
    for (const student of allStudents) {
      const originalLevel = student.currentLevel;
      
      // Force recalculate level based on points and current active levels
      const newLevel = await student.calculateLevel();
      
      if (newLevel !== originalLevel) {
        student.currentLevel = newLevel;
        await student.save();
        updatedCount++;
        console.log(`Updated student ${student.userId}: ${originalLevel} → ${newLevel}`);
      }
    }
    
    console.log(`Total students updated: ${updatedCount}`);

    res.status(200).json({
      success: true,
      message: 'Level deleted successfully',
      studentsUpdated: updatedCount,
      totalStudentsProcessed: allStudents.length
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
      console.log(`✅ Created ${createdCount} new StudentProgress records`);
    }

    // Now fetch all progress records with user details
    const allProgress = await StudentProgress.find()
      .populate('userId', 'firstName lastName username email')
      .sort({ totalPoints: -1 })
      .limit(parseInt(limit));

    console.log(`📈 Returning ${allProgress.length} student progress records`);

    const levels = await Level.getActiveLevels();
    const Badge = (await import('../models/dushani-Badge.js')).default;
    const TrueFalseResult = (await import('../models/dilshara-TrueFalseResult.js')).default;
    const QuizResult = (await import('../models/dilshara-QuizResult.js')).default;
    const UserPoints = (await import('../models/amasha-userPoints.js')).default;
    const DailyLogin = (await import('../models/dushani-points.js')).default;

    const studentsProgress = await Promise.all(allProgress.map(async (progress) => {
      // Skip if userId population failed
      if (!progress.userId) {
        console.log('⚠️ Skipping progress record with missing user reference');
        return null;
      }

      let currentLevelDoc = null;

      // DYNAMICALLY CALCULATE POINTS FOR EACH STUDENT
      const trueFalseResults = await TrueFalseResult.find({ userId: progress.userId.username });
      const totalTrueFalsePoints = trueFalseResults.reduce((sum, result) => sum + result.pointsEarned, 0);
      
      const quizResults = await QuizResult.find({ userId: progress.userId.username });
      const totalQuizPoints = quizResults.reduce((sum, result) => sum + result.score, 0);
      
      const userPointsRecord = await UserPoints.findOne({ userId: progress.userId._id });
      const userPoints = userPointsRecord ? userPointsRecord.totalPoints : 0;
      
      const dailyLoginRecords = await DailyLogin.find({ userId: progress.userId._id });
      const totalDailyLoginPoints = dailyLoginRecords.reduce((sum, record) => sum + (record.pointsAwarded || 10), 0);
      
      const dynamicTotalPoints = totalTrueFalsePoints + totalQuizPoints + userPoints + totalDailyLoginPoints;
      
      // Update student progress with calculated points if different
      if (progress.totalPoints !== dynamicTotalPoints) {
        progress.totalPoints = dynamicTotalPoints;
      }
      
      // DYNAMICALLY calculate level - 0 points = N/A
      let calculatedLevel;
      if (dynamicTotalPoints === 0) {
        calculatedLevel = 'N/A';
      } else {
        calculatedLevel = await progress.calculateLevel();
        if (!calculatedLevel) calculatedLevel = 'N/A';
      }
      
      if (progress.currentLevel !== calculatedLevel) {
        progress.currentLevel = calculatedLevel;
        await progress.save();
      }

      if (progress.totalPoints > 0) {
        currentLevelDoc = levels.find(level => {
          const max = level.maxPoints ?? Infinity;
          return progress.totalPoints >= level.minPoints &&
                 progress.totalPoints <= max;
        });
      }

      // Filter out badges that no longer exist or are inactive
      const validBadges = [];
      for (const badgeEntry of progress.badgesEarned) {
        const badgeExists = await Badge.findById(badgeEntry.badgeId);
        if (badgeExists && badgeExists.status === 'Active') {
          validBadges.push(badgeEntry);
        }
      }
      
      // DYNAMICALLY CHECK AND AWARD ELIGIBLE BADGES
      const activeMilestoneBadgesForStudent = await Badge.find({
        badgeType: 'Milestone',
        status: 'Active'
      }).sort({ pointsRequired: 1 });
      
      // AGGRESSIVE CLEANUP: Remove ALL untriggered notifications first
      const BadgeNotification = (await import('../models/dushani-BadgeNotification.js')).default;
      const allUntriggeredNotifications = await BadgeNotification.find({ 
        userId: progress.userId,
        animationTriggered: false 
      });
      
      // Delete notifications for badges that don't exist OR student doesn't qualify for anymore
      // DO NOT delete if student has the badge - they might have just earned it!
      for (const notification of allUntriggeredNotifications) {
        const matchingBadge = activeMilestoneBadgesForStudent.find(
          b => b._id.toString() === notification.badgeId.toString()
        );
        
        const shouldDelete = !matchingBadge || 
                            progress.totalPoints < matchingBadge.pointsRequired;
        
        if (shouldDelete) {
          await BadgeNotification.findByIdAndDelete(notification._id);
          let reason = '';
          if (!matchingBadge) reason = 'badge no longer exists';
          else if (progress.totalPoints < matchingBadge.pointsRequired) reason = 'student no longer qualifies';
          
          console.log(`🗑️  Removed notification for ${notification.badgeDetails.badgeName} (${reason})`);
        }
      }
      
      let awardedCount = 0;
      for (const badge of activeMilestoneBadgesForStudent) {
        if (progress.totalPoints >= badge.pointsRequired && 
            !progress.hasBadge(badge._id)) {
          
          // ALSO CHECK IF NOTIFICATION ALREADY EXISTS (to prevent duplicates)
          const existingNotification = await BadgeNotification.findOne({
            userId: progress.userId,
            badgeId: badge._id,
            animationTriggered: false
          });
          
          if (!existingNotification) {
            progress.addBadge(badge);
            awardedCount++;
            
            await Badge.findByIdAndUpdate(badge._id, {
              $inc: { earnedCount: 1 }
            });
            
            // CREATE BADGE NOTIFICATION FOR LOTTIE ANIMATION
            await BadgeNotification.createNotification(progress.userId, badge);
          }
        }
      }
      
      if (awardedCount > 0) {
        await progress.save();
      }

      // RECALCULATE valid badges AFTER awarding new ones
      const finalValidBadges = [];
      for (const badgeEntry of progress.badgesEarned) {
        const badgeExists = await Badge.findById(badgeEntry.badgeId);
        if (badgeExists && badgeExists.status === 'Active') {
          finalValidBadges.push(badgeEntry);
        }
      }

      return {
        studentId: progress.userId._id,
        studentName: `${progress.userId.firstName} ${progress.userId.lastName}`,
        username: progress.userId.username,
        email: progress.userId.email,
        totalPoints: progress.totalPoints,  // ← DYNAMIC
        currentLevel: currentLevelDoc ? currentLevelDoc.levelName : null,
        levelNumber: currentLevelDoc
          ? levels.findIndex(l => l._id.equals(currentLevelDoc._id)) + 1
          : 0,
        badgesEarned: finalValidBadges.length,  // ← UPDATED count with newly awarded badges
        completedSections: progress.sectionProgress.filter(sec => sec.completed).length,
        lastActivity: progress.lastActivity,
        createdAt: progress.createdAt
      };
    }));

    // Filter out null entries (from skipped invalid records)
    const validStudentsProgress = studentsProgress.filter(s => s !== null);

    res.status(200).json({
      success: true,
      count: validStudentsProgress.length,
      students: validStudentsProgress,
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

    // DYNAMICALLY CALCULATE POINTS FROM ALL SOURCES
    const TrueFalseResult = (await import('../models/dilshara-TrueFalseResult.js')).default;
    const QuizResult = (await import('../models/dilshara-QuizResult.js')).default;
    const UserPoints = (await import('../models/amasha-userPoints.js')).default;
    const DailyLogin = (await import('../models/dushani-points.js')).default;
    
    // Get points from TrueFalseResult (stored as username string)
    const trueFalseResults = await TrueFalseResult.find({ userId: user.username });
    const totalTrueFalsePoints = trueFalseResults.reduce((sum, result) => sum + result.pointsEarned, 0);
    
    // Get points from QuizResult (stored as username string)
    const quizResults = await QuizResult.find({ userId: user.username });
    const totalQuizPoints = quizResults.reduce((sum, result) => sum + result.score, 0);
    
    // Get points from UserPoints (stored as ObjectId)
    const userPointsRecord = await UserPoints.findOne({ userId: user._id });
    const userPoints = userPointsRecord ? userPointsRecord.totalPoints : 0;
    
    // Get points from DailyLogin (stored as ObjectId)
    const dailyLoginRecords = await DailyLogin.find({ userId: user._id });
    const totalDailyLoginPoints = dailyLoginRecords.reduce((sum, record) => sum + (record.pointsAwarded || 10), 0);
    
    // Calculate TOTAL dynamic points from all sources
    const dynamicTotalPoints = totalTrueFalsePoints + totalQuizPoints + userPoints + totalDailyLoginPoints;
    
    console.log(`Dynamic points for ${user.username}:`);
    console.log(`  TrueFalse: ${totalTrueFalsePoints}`);
    console.log(`  Quiz: ${totalQuizPoints}`);
    console.log(`  UserPoints: ${userPoints}`);
    console.log(`  DailyLogin: ${totalDailyLoginPoints}`);
    console.log(`  TOTAL: ${dynamicTotalPoints}`);

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

    const levels = await Level.getActiveLevels();
    const Badge = (await import('../models/dushani-Badge.js')).default;

    // DYNAMICALLY CHECK AND AWARD ELIGIBLE BADGES
    const activeMilestoneBadges = await Badge.find({
      badgeType: 'Milestone',
      status: 'Active'
    }).sort({ pointsRequired: 1 });
    
    console.log(`Found ${activeMilestoneBadges.length} active milestone badges`);
    activeMilestoneBadges.forEach(b => {
      console.log(`  - ${b.badgeName}: ${b.pointsRequired} points`);
    });
    
    // AGGRESSIVE CLEANUP: Remove ALL untriggered notifications first
    const BadgeNotification = (await import('../models/dushani-BadgeNotification.js')).default;
    const allUntriggeredNotifications = await BadgeNotification.find({ 
      userId: user._id,
      animationTriggered: false 
    });
    
    console.log(`🔍 Found ${allUntriggeredNotifications.length} untriggered notifications to validate`);
    
    // Delete notifications for badges that don't exist OR student doesn't qualify for anymore
    // DO NOT delete if student has the badge - they might have just earned it and need the notification!
    for (const notification of allUntriggeredNotifications) {
      const matchingBadge = activeMilestoneBadges.find(
        b => b._id.toString() === notification.badgeId.toString()
      );
      
      const shouldDelete = !matchingBadge || 
                          studentProgress.totalPoints < matchingBadge.pointsRequired;
      
      if (shouldDelete) {
        await BadgeNotification.findByIdAndDelete(notification._id);
        let reason = '';
        if (!matchingBadge) reason = 'badge no longer exists';
        else if (studentProgress.totalPoints < matchingBadge.pointsRequired) reason = 'student no longer qualifies';
        
        console.log(`🗑️  Removed notification for ${notification.badgeDetails.badgeName} (${reason})`);
      }
    }
    
    let newBadgesAwarded = false;
    for (const badge of activeMilestoneBadges) {
      const hasBadge = studentProgress.hasBadge(badge._id);
      const qualifies = studentProgress.totalPoints >= badge.pointsRequired;
      
      console.log(`Checking badge ${badge.badgeName}: qualifies=${qualifies}, hasBadge=${hasBadge}`);
      
      // Check if student qualifies but doesn't have it yet
      if (qualifies && !hasBadge) {
        
        // ALSO CHECK IF NOTIFICATION ALREADY EXISTS (to prevent duplicates)
        const BadgeNotification = (await import('../models/dushani-BadgeNotification.js')).default;
        const existingNotification = await BadgeNotification.findOne({
          userId: user._id,
          badgeId: badge._id,
          animationTriggered: false
        });
        
        if (!existingNotification) {
          studentProgress.addBadge(badge);
          newBadgesAwarded = true;
          
          // Update badge earned count
          await Badge.findByIdAndUpdate(badge._id, {
            $inc: { earnedCount: 1 }
          });
          
          // CREATE BADGE NOTIFICATION FOR LOTTIE ANIMATION
          await BadgeNotification.createNotification(user._id, badge);
          
          console.log(`✅ Auto-awarded badge ${badge.badgeName} to ${user.username}`);
          console.log(`   🎬 Badge notification created for Lottie animation`);
        } else {
          console.log(`⚠️  Skipping ${badge.badgeName}: Notification already exists (badge was deleted/recreated)`);
        }
      }
    }
    
    if (newBadgesAwarded) {
      await studentProgress.save();
      console.log(`Saved student progress with new badges`);
    }

    // RECALCULATE valid badges AFTER awarding new ones
    const finalValidBadges = [];
    for (const badgeEntry of studentProgress.badgesEarned) {
      const badgeExists = await Badge.findById(badgeEntry.badgeId);
      if (badgeExists && badgeExists.status === 'Active') {
        finalValidBadges.push(badgeEntry);
      }
    }

    // Find current level document based on points
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
        totalPoints: dynamicTotalPoints,  // ← ALWAYS USES DYNAMIC CALCULATION
        currentLevel: currentLevelDoc ? currentLevelDoc.levelName : null,
        badgesEarned: finalValidBadges,  // ← UPDATED with newly awarded badges
        completedSections: studentProgress.sectionProgress.filter(sec => sec.completed),
        lastActivity: studentProgress.lastActivity,
        createdAt: studentProgress.createdAt,
        pointsBreakdown: {  // ← SHOW WHERE POINTS CAME FROM
          trueFalsePoints: totalTrueFalsePoints,
          quizPoints: totalQuizPoints,
          userPoints: userPoints,
          dailyLoginPoints: totalDailyLoginPoints
        }
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

// Recalculate all student levels based on current active levels
export const recalculateAllStudentLevels = async (req, res) => {
  try {
    const StudentProgress = (await import('../models/dushani-StudentProgress.js')).default;
    
    // Get all student progress records
    const allStudents = await StudentProgress.find();
    
    let updatedCount = 0;
    for (const student of allStudents) {
      const originalLevel = student.currentLevel;
      
      // Recalculate level based on points and current active levels
      student.currentLevel = await student.calculateLevel();
      
      if (student.currentLevel !== originalLevel) {
        await student.save();
        updatedCount++;
        console.log(`Updated student level: ${originalLevel} -> ${student.currentLevel}`);
      }
    }
    
    res.status(200).json({
      success: true,
      message: `Recalculated levels for ${updatedCount} students`,
      studentsUpdated: updatedCount
    });
  } catch (error) {
    console.error('Recalculate all levels error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during level recalculation',
      error: error.message
    });
  }
};