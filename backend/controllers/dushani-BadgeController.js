import Badge from '../models/dushani-Badge.js';
import StudentProgress from '../models/dushani-StudentProgress.js';
import User from '../models/dushani-User.js';
import { GameScore } from '../models/dilshara-GameScore.js';
import UserPoints from '../models/amasha-userPoints.js';
import DailyLogin from '../models/dushani-points.js';
import BadgeNotification from '../models/dushani-BadgeNotification.js';

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
      createdBy: createdBy || undefined
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
      return res.status(400).json({ success: false, message: 'Validation failed', errors });
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Admin: Get all badges with statistics
export const getAllBadges = async (req, res) => {
  try {
    console.log('\n🔄 STARTING BADGE STATUS CHECK...\n');

    const allStudents = await StudentProgress.find();
    console.log(`📊 Found ${allStudents.length} students in database`);

    const activeMilestoneBadges = await Badge.find({
      badgeType: 'Milestone',
      status: 'Active'
    }).sort({ pointsRequired: 1 });

    console.log(`🏆 Checking ${activeMilestoneBadges.length} active badges for all students...\n`);

    let totalBadgesAwarded = 0;
    let studentsWithBadges = 0;

    for (const student of allStudents) {
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

      student.totalPoints = dynamicTotalPoints;

      const newLevel = await student.calculateLevel();
      student.currentLevel = newLevel;

      let badgesAwarded = 0;
      for (const badge of activeMilestoneBadges) {
        if (dynamicTotalPoints >= badge.pointsRequired && !student.hasBadge(badge._id)) {
          student.addBadge(badge);
          await Badge.findByIdAndUpdate(badge._id, { $inc: { earnedCount: 1 } });

          const existingNotification = await BadgeNotification.findOne({
            userId: student.userId,
            badgeId: badge._id
          });

          if (!existingNotification) {
            await BadgeNotification.createNotification(student.userId, badge);
            console.log(`  🎬 Created notification for "${badge.badgeName}"`);
          } else {
            console.log(`  ⏭️  Notification already exists for "${badge.badgeName}" - skipping duplicate`);
          }

          badgesAwarded++;
          totalBadgesAwarded++;
          console.log(`  🏅 ${user.username}: Earned "${badge.badgeName}" (${dynamicTotalPoints} pts >= ${badge.pointsRequired} pts)`);
        }
      }

      if (badgesAwarded > 0) studentsWithBadges++;

      await student.save();

      if (dynamicTotalPoints > 0 || badgesAwarded > 0) {
        console.log(`  ✅ ${user.username}: ${dynamicTotalPoints} pts, Level ${newLevel}, ${student.badgesEarned.length} badges`);
      }
    }

    console.log(`\n📊 BADGE RECALCULATION COMPLETE:`);
    console.log(`   Total students checked: ${allStudents.length}`);
    console.log(`   Students with badges: ${studentsWithBadges}`);
    console.log(`   Total badges awarded: ${totalBadgesAwarded}\n`);

    const badges = await Badge.find({ status: 'Active' }).sort({ createdAt: -1 });

    const badgesWithStats = await Promise.all(badges.map(async (badge) => {
      const earnedCount = await StudentProgress.countDocuments({
        'badgesEarned.badgeId': badge._id
      });
      return { ...badge.toObject(), earnedCount };
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
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Admin: Get badge by ID with earned students list
export const getBadgeById = async (req, res) => {
  try {
    const { id } = req.params;

    const badge = await Badge.findById(id);
    if (!badge) {
      return res.status(404).json({ success: false, message: 'Badge not found' });
    }

    const studentProgressRecords = await StudentProgress.find({
      'badgesEarned.badgeId': badge._id
    }).populate('userId', 'firstName lastName username email');

    const studentsWithBadge = studentProgressRecords.map(record => {
      const badgeInfo = record.badgesEarned.find(b => b.badgeId.toString() === id);
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
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Admin: Update badge
export const updateBadge = async (req, res) => {
  try {
    const { id } = req.params;
    const { badgeName, badgeType, pointsRequired, sectionName, badgeIcon, description, status } = req.body;

    const badge = await Badge.findById(id);
    if (!badge) {
      return res.status(404).json({ success: false, message: 'Badge not found' });
    }

    if (badgeName && badgeName !== badge.badgeName) {
      const existingBadge = await Badge.findOne({ badgeName, _id: { $ne: id } });
      if (existingBadge) {
        return res.status(400).json({ success: false, message: 'Badge with this name already exists' });
      }
    }

    if (badgeName) badge.badgeName = badgeName;
    if (badgeType) badge.badgeType = badgeType;
    badge.pointsRequired = badgeType === 'Milestone' ? (pointsRequired || 0) : 0;
    badge.sectionName = badgeType === 'Section Completion' ? (sectionName || null) : null;
    if (badgeIcon) badge.badgeIcon = badgeIcon;
    if (description) badge.description = description;
    if (status) badge.status = status;

    await badge.save();

    // Recalculate all students after badge update
    const allStudents = await StudentProgress.find();
    console.log(`🔄 Recalculating badges for ${allStudents.length} students after badge update...`);

    let updatedCount = 0;
    for (const student of allStudents) {
      const user = await User.findById(student.userId);
      if (!user) continue;

      const gameScores = await GameScore.find({ userId: user.username });
      const totalGamePoints = gameScores.reduce((sum, result) => sum + result.score, 0);

      const userPointsRecord = await UserPoints.findOne({ userId: student.userId });
      const userPoints = userPointsRecord ? userPointsRecord.totalPoints : 0;

      const dailyLoginRecords = await DailyLogin.find({ userId: student.userId });
      const totalDailyLoginPoints = dailyLoginRecords.reduce((sum, record) => sum + (record.pointsAwarded || 10), 0);

      const dynamicTotalPoints = totalGamePoints + userPoints + totalDailyLoginPoints;

      const pointsChanged = student.totalPoints !== dynamicTotalPoints;
      student.totalPoints = dynamicTotalPoints;

      const newLevel = await student.calculateLevel();
      const levelChanged = student.currentLevel !== newLevel;
      student.currentLevel = newLevel;

      const activeMilestoneBadges = await Badge.find({
        badgeType: 'Milestone',
        status: 'Active'
      }).sort({ pointsRequired: 1 });

      let badgesAwarded = 0;
      for (const b of activeMilestoneBadges) {
        if (dynamicTotalPoints >= b.pointsRequired && !student.hasBadge(b._id)) {
          student.addBadge(b);
          await Badge.findByIdAndUpdate(b._id, { $inc: { earnedCount: 1 } });
          badgesAwarded++;
        }
      }

      const badgesRemoved = student.badgesEarned.length;
      student.badgesEarned = student.badgesEarned.filter(badgeEntry => {
        const b = activeMilestoneBadges.find(bd => bd._id.toString() === badgeEntry.badgeId.toString());
        return b && dynamicTotalPoints >= b.pointsRequired;
      });
      const actualBadgesRemoved = badgesRemoved - student.badgesEarned.length;

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
      return res.status(400).json({ success: false, message: 'Validation failed', errors });
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Admin: Delete badge
export const deleteBadge = async (req, res) => {
  try {
    const { id } = req.params;

    const badge = await Badge.findById(id);
    if (!badge) {
      return res.status(404).json({ success: false, message: 'Badge not found' });
    }

    await Badge.findByIdAndDelete(id);

    const allStudents = await StudentProgress.find();
    for (const student of allStudents) {
      student.badgesEarned = student.badgesEarned.filter(b => b.badgeId.toString() !== id.toString());
      await student.save();
    }

    res.status(200).json({
      success: true,
      message: 'Badge deleted successfully',
      studentsUpdated: allStudents.length
    });
  } catch (error) {
    console.error('Delete badge error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get active badges for students
export const getActiveBadges = async (req, res) => {
  try {
    const badges = await Badge.find({ status: 'Active' }).sort({ pointsRequired: 1 });
    res.status(200).json({ success: true, count: badges.length, badges });
  } catch (error) {
    console.error('Get active badges error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Diagnostic: Manually check and award all badges
export const diagnosticAndAwardBadges = async (req, res) => {
  try {
    console.log('🔍 Starting diagnostic badge check for all students...');

    const allStudents = await StudentProgress.find();
    const activeMilestoneBadges = await Badge.find({
      badgeType: 'Milestone',
      status: 'Active'
    }).sort({ pointsRequired: 1 });

    console.log(`📊 Found ${allStudents.length} students and ${activeMilestoneBadges.length} active badges`);

    console.log('\n📋 CURRENT STATE:');
    for (const student of allStudents) {
      const user = await User.findById(student.userId);
      if (!user) continue;
      console.log(`   ${user.username}: ${student.badgesEarned.length} badges, ${student.totalPoints} points`);
    }

    let totalBadgesAwarded = 0;
    let totalStudentsUpdated = 0;
    const details = [];

    for (const student of allStudents) {
      const user = await User.findById(student.userId);
      if (!user) continue;

      const gameScores = await GameScore.find({ userId: user.username });
      const totalGamePoints = gameScores.reduce((sum, result) => sum + result.score, 0);

      const userPointsRecord = await UserPoints.findOne({ userId: student.userId });
      const userPoints = userPointsRecord ? userPointsRecord.totalPoints : 0;

      const dailyLoginRecords = await DailyLogin.find({ userId: student.userId });
      const totalDailyLoginPoints = dailyLoginRecords.reduce((sum, record) => sum + (record.pointsAwarded || 10), 0);

      const dynamicTotalPoints = totalGamePoints + userPoints + totalDailyLoginPoints;

      const pointsChanged = student.totalPoints !== dynamicTotalPoints;
      student.totalPoints = dynamicTotalPoints;

      const newLevel = await student.calculateLevel();
      const levelChanged = student.currentLevel !== newLevel;
      student.currentLevel = newLevel;

      let badgesAwarded = 0;
      const awardedBadges = [];
      for (const badge of activeMilestoneBadges) {
        if (dynamicTotalPoints >= badge.pointsRequired && !student.hasBadge(badge._id)) {
          student.addBadge(badge);
          await Badge.findByIdAndUpdate(badge._id, { $inc: { earnedCount: 1 } });
          badgesAwarded++;
          totalBadgesAwarded++;
          awardedBadges.push(badge.badgeName);
        }
      }

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

// Clear ALL badges from all students
export const clearAllBadges = async (req, res) => {
  try {
    console.log('🗑️ Clearing ALL badges from all students...');

    const allStudents = await StudentProgress.find();
    let clearedCount = 0;

    for (const student of allStudents) {
      if (student.badgesEarned.length > 0) {
        student.badgesEarned = [];
        await student.save();
        clearedCount++;
      }
    }

    await Badge.updateMany({}, { earnedCount: 0 });

    console.log(`✅ Cleared badges from ${clearedCount} students`);

    res.status(200).json({
      success: true,
      message: `Cleared all badges from ${clearedCount} students`,
      studentsCleared: clearedCount
    });
  } catch (error) {
    console.error('Clear all badges error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

// RECALCULATE ALL BADGES for all students
export const recalculateAllBadges = async (req, res) => {
  try {
    console.log('\n🔄 STARTING COMPLETE BADGE RECALCULATION...\n');

    const allStudents = await StudentProgress.find();
    console.log(`📊 Found ${allStudents.length} students\n`);

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
          return false;
        }
        uniqueBadgeIds.add(badgeIdStr);
        return true;
      });
      const duplicatesRemoved = badgesBeforeCleanup - student.badgesEarned.length;
      totalDuplicatesRemoved += duplicatesRemoved;

      if (duplicatesRemoved > 0) {
        await student.save();
        console.log(`  ✅ ${user.username}: Removed ${duplicatesRemoved} duplicate badge(s)`);
      }

      const gameScores = await GameScore.find({ userId: user.username });
      const totalGamePoints = gameScores.reduce((sum, result) => sum + result.score, 0);

      const userPointsRecord = await UserPoints.findOne({ userId: student.userId });
      const userPoints = userPointsRecord ? userPointsRecord.totalPoints : 0;

      const dailyLoginRecords = await DailyLogin.find({ userId: student.userId });
      const totalDailyLoginPoints = dailyLoginRecords.reduce((sum, record) => sum + (record.pointsAwarded || 10), 0);

      const dynamicTotalPoints = totalGamePoints + userPoints + totalDailyLoginPoints;

      const pointsChanged = student.totalPoints !== dynamicTotalPoints;
      student.totalPoints = dynamicTotalPoints;

      const newLevel = await student.calculateLevel();
      const levelChanged = student.currentLevel !== newLevel;
      student.currentLevel = newLevel;

      let badgesAwarded = 0;
      const newBadges = [];
      for (const badge of activeMilestoneBadges) {
        const qualifies = dynamicTotalPoints >= badge.pointsRequired;
        const alreadyHas = student.hasBadge(badge._id);

        console.log(`🔍 ${user.username}: Checking "${badge.badgeName}" (${badge.pointsRequired} pts): qualifies=${qualifies}, alreadyHas=${alreadyHas}`);

        if (qualifies && !alreadyHas) {
          student.addBadge(badge);
          await Badge.findByIdAndUpdate(badge._id, { $inc: { earnedCount: 1 } });

          const existingNotification = await BadgeNotification.findOne({
            userId: student.userId,
            badgeId: badge._id
          });

          if (!existingNotification) {
            await BadgeNotification.createNotification(student.userId, badge);
            console.log(`  🎬 Created notification for "${badge.badgeName}"`);
          } else {
            console.log(`  ⏭️  Notification already exists for "${badge.badgeName}" - skipping duplicate`);
          }

          badgesAwarded++;
          totalBadgesAwarded++;
          newBadges.push(badge.badgeName);
          console.log(`  🏅 ${user.username}: NEW BADGE "${badge.badgeName}" (${dynamicTotalPoints} pts >= ${badge.pointsRequired} pts)`);
        } else if (qualifies && alreadyHas) {
          console.log(`  ✅ ${user.username}: Already has "${badge.badgeName}" - skipping (NO DUPLICATE)`);
        }
      }

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
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};