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
      createdBy: createdBy || undefined // Only set if found
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
    // DYNAMICALLY check and award badges to all students
    const StudentProgress = (await import('../models/dushani-StudentProgress.js')).default;
    const GameScore = (await import('../models/dilshara-GameScore.js')).default;
    const UserPoints = (await import('../models/amasha-userPoints.js')).default;
    const DailyLogin = (await import('../models/dushani-points.js')).default;
    const BadgeNotification = (await import('../models/dushani-BadgeNotification.js')).default;
    const User = (await import('../models/dushani-User.js')).default;
    
    console.log('\n🔄 STARTING FRESH BADGE RECALCULATION...\n');
    
    // STEP 1: Clear ALL existing badges from all students
    const allStudents = await StudentProgress.find();
    console.log(`📊 Found ${allStudents.length} students in database`);
    
    let clearedCount = 0;
    for (const student of allStudents) {
      if (student.badgesEarned.length > 0) {
        student.badgesEarned = [];
        await student.save();
        clearedCount++;
      }
    }
    
    if (clearedCount > 0) {
      console.log(`🗑️  Cleared badges from ${clearedCount} students`);
    }
    
    // STEP 2: Reset all badge earnedCount to 0
    await Badge.updateMany({}, { earnedCount: 0 });
    console.log(`🔄 Reset all badge earned counts to 0\n`);
    
    // STEP 3: Get active badges and recalculate for each student
    const activeMilestoneBadges = await Badge.find({
      badgeType: 'Milestone',
      status: 'Active'
    }).sort({ pointsRequired: 1 });
    
    console.log(`🏆 Checking ${activeMilestoneBadges.length} active badges for all students...\n`);
    
    let totalBadgesAwarded = 0;
    let studentsWithBadges = 0;
    
    for (const student of allStudents) {
      // Dynamically calculate total points from all sources
      const user = await User.findById(student.userId);
      if (!user) {
        console.log(`⚠️  Skipping student with missing user record: ${student.userId}`);
        continue;
      }
      
      const gameScores = await GameScore.find({ userId: user.username });
      const totalGamePoints = gameScores.reduce((sum, result) => sum + result.score, 0);
      
      const userPointsRecord = await UserPoints.findOne({ userId: student.userId });
      const userPoints = userPointsRecord ? userPointsRecord.totalPoints : 0;
      
      const dailyLoginRecords = await DailyLogin.find({ userId: student.userId });
      const totalDailyLoginPoints = dailyLoginRecords.reduce((sum, record) => sum + (record.pointsAwarded || 10), 0);
      
      const dynamicTotalPoints = totalGamePoints + userPoints + totalDailyLoginPoints;
      
      // Update student's total points
      student.totalPoints = dynamicTotalPoints;
      
      // Recalculate level
      const newLevel = await student.calculateLevel();
      student.currentLevel = newLevel;
      
      // Check and award eligible badges
      let badgesAwarded = 0;
      for (const badge of activeMilestoneBadges) {
        if (dynamicTotalPoints >= badge.pointsRequired && !student.hasBadge(badge._id)) {
          student.addBadge(badge);
          await Badge.findByIdAndUpdate(badge._id, { $inc: { earnedCount: 1 } });
          
          // CREATE notification for newly earned badge
          await BadgeNotification.createNotification(student.userId, badge);
          
          badgesAwarded++;
          totalBadgesAwarded++;
          console.log(`  🏅 ${user.username}: Earned "${badge.badgeName}" (${dynamicTotalPoints} pts >= ${badge.pointsRequired} pts)`);
        }
      }
      
      if (badgesAwarded > 0) {
        studentsWithBadges++;
      }
      
      // Save student progress
      await student.save();
      
      if (dynamicTotalPoints > 0 || badgesAwarded > 0) {
        console.log(`  ✅ ${user.username}: ${dynamicTotalPoints} pts, Level ${newLevel}, ${student.badgesEarned.length} badges`);
      }
    }
    
    console.log(`\n📊 BADGE RECALCULATION COMPLETE:`);
    console.log(`   Total students checked: ${allStudents.length}`);
    console.log(`   Students with badges: ${studentsWithBadges}`);
    console.log(`   Total badges awarded: ${totalBadgesAwarded}\n`);
    
    // STEP 4: Get final badge statistics
    const badges = await Badge.find({ status: 'Active' }).sort({ createdAt: -1 });
    
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
      badges: badgesWithStats,
      badgesAwarded: totalBadgesAwarded,
      studentsWithBadges,
      message: `Recalculated badges: ${totalBadgesAwarded} badges awarded to ${studentsWithBadges} students`
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

    // 🔄 RECALCULATE ALL STUDENTS' BADGES after badge requirements changed
    const StudentProgress = (await import('../models/dushani-StudentProgress.js')).default;
    const GameScore = (await import('../models/dilshara-GameScore.js')).default;
    const UserPoints = (await import('../models/amasha-userPoints.js')).default;
    const DailyLogin = (await import('../models/dushani-points.js')).default;
    
    const allStudents = await StudentProgress.find();
    console.log(`🔄 Recalculating badges for ${allStudents.length} students after badge update...`);
    
    let updatedCount = 0;
    for (const student of allStudents) {
      // Dynamically calculate total points from all sources
      const user = await (await import('../models/dushani-User.js')).default.findById(student.userId);
      if (!user) continue;
      
      const gameScores = await GameScore.find({ userId: user.username });
      const totalGamePoints = gameScores.reduce((sum, result) => sum + result.score, 0);
      
      const userPointsRecord = await UserPoints.findOne({ userId: student.userId });
      const userPoints = userPointsRecord ? userPointsRecord.totalPoints : 0;
      
      const dailyLoginRecords = await DailyLogin.find({ userId: student.userId });
      const totalDailyLoginPoints = dailyLoginRecords.reduce((sum, record) => sum + (record.pointsAwarded || 10), 0);
      
      const dynamicTotalPoints = totalGamePoints + userPoints + totalDailyLoginPoints;
      
      // Update student's total points
      const pointsChanged = student.totalPoints !== dynamicTotalPoints;
      student.totalPoints = dynamicTotalPoints;
      
      // Recalculate level
      const newLevel = await student.calculateLevel();
      const levelChanged = student.currentLevel !== newLevel;
      student.currentLevel = newLevel;
      
      // Get all active milestone badges
      const activeMilestoneBadges = await Badge.find({
        badgeType: 'Milestone',
        status: 'Active'
      }).sort({ pointsRequired: 1 });
      
      // Award eligible badges that student doesn't have
      let badgesAwarded = 0;
      for (const b of activeMilestoneBadges) {
        if (dynamicTotalPoints >= b.pointsRequired && !student.hasBadge(b._id)) {
          student.addBadge(b);
          await Badge.findByIdAndUpdate(b._id, { $inc: { earnedCount: 1 } });
          
          // DO NOT create notification during badge update - only during real-time point earning
          badgesAwarded++;
        }
      }
      
      // Remove badges that are now inactive or student no longer qualifies
      const badgesRemoved = student.badgesEarned.length;
      student.badgesEarned = student.badgesEarned.filter(badgeEntry => {
        const b = activeMilestoneBadges.find(bd => bd._id.toString() === badgeEntry.badgeId.toString());
        return b && dynamicTotalPoints >= b.pointsRequired;
      });
      const actualBadgesRemoved = badgesRemoved - student.badgesEarned.length;
      
      // Save if anything changed
      if (pointsChanged || levelChanged || badgesAwarded > 0 || actualBadgesRemoved > 0) {
        await student.save();
        updatedCount++;
        console.log(`✅ Updated ${user.username}: Points=${dynamicTotalPoints}, Level=${newLevel}, Awarded=${badgesAwarded}, Removed=${actualBadgesRemoved}`);
      }
    }
    
    console.log(`✅ Total students updated: ${updatedCount}`);

    res.status(200).json({
      success: true,
      message: 'Badge updated successfully',
      badge,
      studentsUpdated: updatedCount,
      totalStudentsProcessed: allStudents.length
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

// Diagnostic: Manually check and award all badges to all students - POST /api/badges/diagnostic-and-award
export const diagnosticAndAwardBadges = async (req, res) => {
  try {
    console.log('🔍 Starting diagnostic badge check for all students...');
    
    const StudentProgress = (await import('../models/dushani-StudentProgress.js')).default;
    const TrueFalseResult = (await import('../models/dilshara-TrueFalseResult.js')).default;
    const QuizResult = (await import('../models/dilshara-QuizResult.js')).default;
    const UserPoints = (await import('../models/amasha-userPoints.js')).default;
    const DailyLogin = (await import('../models/dushani-points.js')).default;
    const BadgeNotification = (await import('../models/dushani-BadgeNotification.js')).default;
    const User = (await import('../models/dushani-User.js')).default;
    
    const allStudents = await StudentProgress.find();
    const activeMilestoneBadges = await Badge.find({
      badgeType: 'Milestone',
      status: 'Active'
    }).sort({ pointsRequired: 1 });
    
    console.log(`📊 Found ${allStudents.length} students and ${activeMilestoneBadges.length} active badges`);
    
    // Show current state BEFORE changes
    console.log('\n📋 CURRENT STATE:');
    for (const student of allStudents) {
      const user = await User.findById(student.userId);
      if (!user) continue;
      console.log(`   ${user.username}: ${student.badgesEarned.length} badges, ${student.totalPoints} points`);
    }
    console.log('');
    
    let totalBadgesAwarded = 0;
    let totalStudentsUpdated = 0;
    const details = [];
    
    for (const student of allStudents) {
      const user = await User.findById(student.userId);
      if (!user) continue;
      
      // Calculate points from all sources
      const gameScores = await GameScore.find({ userId: user.username });
      const totalGamePoints = gameScores.reduce((sum, result) => sum + result.score, 0);
      
      const userPointsRecord = await UserPoints.findOne({ userId: student.userId });
      const userPoints = userPointsRecord ? userPointsRecord.totalPoints : 0;
      
      const dailyLoginRecords = await DailyLogin.find({ userId: student.userId });
      const totalDailyLoginPoints = dailyLoginRecords.reduce((sum, record) => sum + (record.pointsAwarded || 10), 0);
      
      const dynamicTotalPoints = totalGamePoints + userPoints + totalDailyLoginPoints;
      
      // Update points
      const pointsChanged = student.totalPoints !== dynamicTotalPoints;
      student.totalPoints = dynamicTotalPoints;
      
      // Update level
      const newLevel = await student.calculateLevel();
      const levelChanged = student.currentLevel !== newLevel;
      student.currentLevel = newLevel;
      
      // Check badges
      let badgesAwarded = 0;
      const awardedBadges = [];
      for (const badge of activeMilestoneBadges) {
        if (dynamicTotalPoints >= badge.pointsRequired && !student.hasBadge(badge._id)) {
          student.addBadge(badge);
          await Badge.findByIdAndUpdate(badge._id, { $inc: { earnedCount: 1 } });
          // DO NOT create notification during diagnostic - only during real-time point earning
          badgesAwarded++;
          totalBadgesAwarded++;
          awardedBadges.push(badge.badgeName);
        }
      }
      
      // Remove invalid badges
      const oldBadgeCount = student.badgesEarned.length;
      student.badgesEarned = student.badgesEarned.filter(badgeEntry => {
        const b = activeMilestoneBadges.find(bd => bd._id.toString() === badgeEntry.badgeId.toString());
        return b && dynamicTotalPoints >= b.pointsRequired;
      });
      const badgesRemoved = oldBadgeCount - student.badgesEarned.length;
      
      if (pointsChanged || levelChanged || badgesAwarded > 0 || badgesRemoved > 0) {
        await student.save();
        totalStudentsUpdated++;
        details.push({
          username: user.username,
          points: dynamicTotalPoints,
          level: newLevel,
          badgesAwarded,
          awardedBadges,
          badgesRemoved,
          totalBadges: student.badgesEarned.length
        });
        console.log(`✅ ${user.username}: ${dynamicTotalPoints} pts, Level ${newLevel}, Badges: ${oldBadgeCount} → ${student.badgesEarned.length}`);
      }
    }
    
    console.log(`\n🎉 Diagnostic Complete:`);
    console.log(`   Students updated: ${totalStudentsUpdated}/${allStudents.length}`);
    console.log(`   Total badges awarded: ${totalBadgesAwarded}`);
    
    res.status(200).json({
      success: true,
      message: `Diagnostic complete. Awarded ${totalBadgesAwarded} badges to ${totalStudentsUpdated} students`,
      totalStudentsProcessed: allStudents.length,
      totalStudentsUpdated,
      totalBadgesAwarded,
      details
    });
    
  } catch (error) {
    console.error('Diagnostic badge award error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during diagnostic',
      error: error.message
    });
  }
};

// Clear ALL badges from all students - POST /api/badges/clear-all-badges
export const clearAllBadges = async (req, res) => {
  try {
    console.log('🗑️ Clearing ALL badges from all students...');
    
    const StudentProgress = (await import('../models/dushani-StudentProgress.js')).default;
    const Badge = (await import('../models/dushani-Badge.js')).default;
    
    const allStudents = await StudentProgress.find();
    let clearedCount = 0;
    
    for (const student of allStudents) {
      if (student.badgesEarned.length > 0) {
        student.badgesEarned = [];
        await student.save();
        clearedCount++;
      }
    }
    
    // Reset all badge earnedCount to 0
    await Badge.updateMany({}, { earnedCount: 0 });
    
    console.log(`✅ Cleared badges from ${clearedCount} students`);
    
    res.status(200).json({
      success: true,
      message: `Cleared all badges from ${clearedCount} students`,
      studentsCleared: clearedCount
    });
    
  } catch (error) {
    console.error('Clear all badges error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// RECALCULATE ALL BADGES for all students - POST /api/badges/recalculate-all
export const recalculateAllBadges = async (req, res) => {
  try {
    console.log('\n🔄 STARTING COMPLETE BADGE RECALCULATION...\n');
    
    const StudentProgress = (await import('../models/dushani-StudentProgress.js')).default;
    const GameScore = (await import('../models/dilshara-GameScore.js')).default;
    const UserPoints = (await import('../models/amasha-userPoints.js')).default;
    const DailyLogin = (await import('../models/dushani-points.js')).default;
    const BadgeNotification = (await import('../models/dushani-BadgeNotification.js')).default;
    const User = (await import('../models/dushani-User.js')).default;
    
    // Get all students
    const allStudents = await StudentProgress.find();
    console.log(`📊 Found ${allStudents.length} students\n`);
    
    // Get all active milestone badges
    const activeMilestoneBadges = await Badge.find({
      badgeType: 'Milestone',
      status: 'Active'
    }).sort({ pointsRequired: 1 });
    
    console.log(`🏆 Found ${activeMilestoneBadges.length} active milestone badges\n`);
    
    let totalBadgesAwarded = 0;
    let totalBadgesRemoved = 0;
    let totalDuplicatesRemoved = 0;
    let studentsUpdated = 0;
    const details = [];
    
    for (const student of allStudents) {
      const user = await User.findById(student.userId);
      if (!user) {
        console.log(`⚠️  Skipping student with missing user: ${student.userId}`);
        continue;
      }
      
      // CLEANUP: Remove duplicate badges FIRST
      const uniqueBadgeIds = new Set();
      const badgesBeforeCleanup = student.badgesEarned.length;
      student.badgesEarned = student.badgesEarned.filter(badgeEntry => {
        const badgeIdStr = badgeEntry.badgeId.toString();
        if (uniqueBadgeIds.has(badgeIdStr)) {
          console.log(`  🗑️  ${user.username}: Removing DUPLICATE badge ${badgeEntry.badgeDetails?.badgeName || badgeIdStr}`);
          return false; // Remove duplicate
        }
        uniqueBadgeIds.add(badgeIdStr);
        return true; // Keep first occurrence
      });
      const duplicatesRemoved = badgesBeforeCleanup - student.badgesEarned.length;
      totalDuplicatesRemoved += duplicatesRemoved;
      
      if (duplicatesRemoved > 0) {
        await student.save();
        console.log(`  ✅ ${user.username}: Removed ${duplicatesRemoved} duplicate badge(s)`);
      }
      
      // Calculate total points from ALL sources
      const gameScores = await GameScore.find({ userId: user.username });
      const totalGamePoints = gameScores.reduce((sum, result) => sum + result.score, 0);
      
      const userPointsRecord = await UserPoints.findOne({ userId: student.userId });
      const userPoints = userPointsRecord ? userPointsRecord.totalPoints : 0;
      
      const dailyLoginRecords = await DailyLogin.find({ userId: student.userId });
      const totalDailyLoginPoints = dailyLoginRecords.reduce((sum, record) => sum + (record.pointsAwarded || 10), 0);
      
      const dynamicTotalPoints = totalGamePoints + userPoints + totalDailyLoginPoints;
      
      // Update student's points
      const pointsChanged = student.totalPoints !== dynamicTotalPoints;
      student.totalPoints = dynamicTotalPoints;
      
      // Recalculate level
      const newLevel = await student.calculateLevel();
      const levelChanged = student.currentLevel !== newLevel;
      student.currentLevel = newLevel;
      
      // STEP 1: Award eligible badges (NO DUPLICATES)
      let badgesAwarded = 0;
      const newBadges = [];
      for (const badge of activeMilestoneBadges) {
        const qualifies = dynamicTotalPoints >= badge.pointsRequired;
        const alreadyHas = student.hasBadge(badge._id);
        
        console.log(`🔍 ${user.username}: Checking "${badge.badgeName}" (${badge.pointsRequired} pts): qualifies=${qualifies}, alreadyHas=${alreadyHas}`);
        
        // ONLY award if qualifies AND doesn't have it yet
        if (qualifies && !alreadyHas) {
          student.addBadge(badge);
          await Badge.findByIdAndUpdate(badge._id, { $inc: { earnedCount: 1 } });
          
          // CREATE notification for newly earned badge during recalculation
          await BadgeNotification.createNotification(student.userId, badge);
          
          badgesAwarded++;
          totalBadgesAwarded++;
          newBadges.push(badge.badgeName);
          console.log(`  🏅 ${user.username}: NEW BADGE "${badge.badgeName}" (${dynamicTotalPoints} pts >= ${badge.pointsRequired} pts)`);
        } else if (qualifies && alreadyHas) {
          console.log(`  ✅ ${user.username}: Already has "${badge.badgeName}" - skipping (NO DUPLICATE)`);
        }
      }
      
      // STEP 2: Remove invalid badges
      const badgesBefore = student.badgesEarned.length;
      student.badgesEarned = student.badgesEarned.filter(badgeEntry => {
        const badge = activeMilestoneBadges.find(b => b._id.toString() === badgeEntry.badgeId.toString());
        return badge && badge.status === 'Active' && dynamicTotalPoints >= badge.pointsRequired;
      });
      const badgesRemoved = badgesBefore - student.badgesEarned.length;
      totalBadgesRemoved += badgesRemoved;
      
      if (badgesRemoved > 0) {
        console.log(`  ⚠️ ${user.username}: Removed ${badgesRemoved} badge(s) - no longer qualified`);
      }
      
      // Save if anything changed
      if (pointsChanged || levelChanged || badgesAwarded > 0 || badgesRemoved > 0 || duplicatesRemoved > 0) {
        await student.save();
        studentsUpdated++;
        details.push({
          username: user.username,
          points: dynamicTotalPoints,
          level: newLevel,
          badgesAwarded,
          newBadges,
          badgesRemoved,
          duplicatesRemoved,
          totalBadges: student.badgesEarned.length
        });
        console.log(`  ✅ ${user.username}: ${dynamicTotalPoints} pts, Level ${newLevel}, ${student.badgesEarned.length} badges\n`);
      }
    }
    
    console.log(`\n📊 RECALCULATION COMPLETE:`);
    console.log(`   Students processed: ${allStudents.length}`);
    console.log(`   Students updated: ${studentsUpdated}`);
    console.log(`   Badges awarded: ${totalBadgesAwarded}`);
    console.log(`   Badges removed: ${totalBadgesRemoved}`);
    console.log(`   Duplicates removed: ${totalDuplicatesRemoved}\n`);
    
    res.status(200).json({
      success: true,
      message: `Recalculated badges for ${allStudents.length} students`,
      studentsProcessed: allStudents.length,
      studentsUpdated,
      badgesAwarded: totalBadgesAwarded,
      badgesRemoved: totalBadgesRemoved,
      duplicatesRemoved: totalDuplicatesRemoved,
      details
    });
    
  } catch (error) {
    console.error('Recalculate all badges error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};