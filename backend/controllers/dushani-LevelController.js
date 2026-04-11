import Level from '../models/dushani-Level.js';
import StudentProgress from '../models/dushani-StudentProgress.js';
import User from '../models/dushani-User.js';
import { GameScore } from '../models/dilshara-GameScore.js';
import UserPoints from '../models/amasha-userPoints.js';
import DailyLogin from '../models/dushani-points.js';
import Badge from '../models/dushani-Badge.js';
import BadgeNotification from '../models/dushani-BadgeNotification.js';

// Helper: get current admin user id from JWT username
const getCurrentUserId = async (req) => {
  const username = req.user;
  if (!username) return null;
  const user = await User.findOne({ username });
  return user ? user._id : null;
};

// Admin: Create Level
export const createLevel = async (req, res) => {
  try {
    const { levelName, minPoints, maxPoints, description } = req.body;

    const existingLevel = await Level.findOne({ levelName });
    if (existingLevel) {
      return res.status(400).json({ success: false, message: 'Level with this name already exists' });
    }

    const createdBy = await getCurrentUserId(req);

    const level = new Level({
      levelName,
      minPoints,
      maxPoints: maxPoints ?? null,
      description: description || '',
      createdBy: createdBy || undefined
    });

    await level.save();
    await Level.validateLevelRanges(level._id);

    res.status(201).json({ success: true, message: 'Level created successfully', level });
  } catch (error) {
    console.error('Create level error:', error);
    if (error.message.includes('overlap')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ success: false, message: 'Validation failed', errors });
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Admin: Get All Levels
export const getAllLevels = async (req, res) => {
  try {
    const levels = await Level.find().sort({ minPoints: 1 });

    const allStudents = await StudentProgress.find();

    // Fetch all needed data once (avoid repeated DB calls per student)
    const allGameScores = await GameScore.find();
    const allUserPoints = await UserPoints.find();
    const allDailyLogins = await DailyLogin.find();
    const allUsers = await User.find({}, '_id username');

    const userMap = new Map(allUsers.map(u => [u._id.toString(), u]));

    const levelCounts = {};
    levels.forEach(level => { levelCounts[level._id.toString()] = 0; });
    let naCount = 0;

    for (const student of allStudents) {
      const user = userMap.get(student.userId.toString());
      if (!user) continue;

      const gameScores = allGameScores.filter(g => g.userId === user.username);
      const totalGamePoints = gameScores.reduce((sum, r) => sum + r.score, 0);

      const userPointsRecord = allUserPoints.find(u => u.userId.toString() === student.userId.toString());
      const userPoints = userPointsRecord ? userPointsRecord.totalPoints : 0;

      const dailyLoginRecords = allDailyLogins.filter(d => d.userId.toString() === student.userId.toString());
      const totalDailyLoginPoints = dailyLoginRecords.reduce((sum, r) => sum + (r.pointsAwarded || 10), 0);

      const dynamicTotalPoints = totalGamePoints + userPoints + totalDailyLoginPoints;

      if (student.totalPoints !== dynamicTotalPoints) {
        student.totalPoints = dynamicTotalPoints;
      }

      let studentLevel;
      if (dynamicTotalPoints === 0) {
        studentLevel = 'N/A';
        naCount++;
      } else {
        studentLevel = await student.calculateLevel();
        if (!studentLevel) { studentLevel = 'N/A'; naCount++; }
      }

      student.currentLevel = studentLevel;
      await student.save();

      const matchingLevel = levels.find(l => l.levelName === studentLevel);
      if (matchingLevel) levelCounts[matchingLevel._id.toString()]++;
    }

    console.log(`📊 Level distribution: ${levels.map(l => `${l.levelName}: ${levelCounts[l._id.toString()]}`).join(', ')}, N/A: ${naCount}`);

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
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Admin: Get Level By ID
export const getLevelById = async (req, res) => {
  try {
    const { id } = req.params;
    const level = await Level.findById(id);
    if (!level) {
      return res.status(404).json({ success: false, message: 'Level not found' });
    }
    res.status(200).json({ success: true, level });
  } catch (error) {
    console.error('Get level by ID error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Admin: Update Level
export const updateLevel = async (req, res) => {
  try {
    const { id } = req.params;
    const { levelName, minPoints, maxPoints, description, isActive } = req.body;

    const level = await Level.findById(id);
    if (!level) {
      return res.status(404).json({ success: false, message: 'Level not found' });
    }

    if (levelName && levelName !== level.levelName) {
      const existingLevel = await Level.findOne({ levelName, _id: { $ne: id } });
      if (existingLevel) {
        return res.status(400).json({ success: false, message: 'Level with this name already exists' });
      }
    }

    if (levelName !== undefined) level.levelName = levelName;
    if (minPoints !== undefined) level.minPoints = minPoints;
    if (maxPoints !== undefined) level.maxPoints = maxPoints ?? null;
    if (description !== undefined) level.description = description;
    if (isActive !== undefined) level.isActive = isActive;

    await level.save();
    await Level.validateLevelRanges(id);

    // Recalculate all students after level update
    const allStudents = await StudentProgress.find();
    console.log(`🔄 Recalculating levels for ${allStudents.length} students after level update...`);

    let updatedCount = 0;
    for (const student of allStudents) {
      const user = await User.findById(student.userId);
      if (!user) continue;

      const gameScores = await GameScore.find({ userId: user.username });
      const totalGamePoints = gameScores.reduce((sum, r) => sum + r.score, 0);

      const userPointsRecord = await UserPoints.findOne({ userId: student.userId });
      const userPoints = userPointsRecord ? userPointsRecord.totalPoints : 0;

      const dailyLoginRecords = await DailyLogin.find({ userId: student.userId });
      const totalDailyLoginPoints = dailyLoginRecords.reduce((sum, r) => sum + (r.pointsAwarded || 10), 0);

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
      for (const badge of activeMilestoneBadges) {
        if (dynamicTotalPoints >= badge.pointsRequired && !student.hasBadge(badge._id)) {
          student.addBadge(badge);
          await Badge.findByIdAndUpdate(badge._id, { $inc: { earnedCount: 1 } });
          badgesAwarded++;
        }
      }

      student.badgesEarned = student.badgesEarned.filter(badgeEntry => {
        const badge = activeMilestoneBadges.find(b => b._id.toString() === badgeEntry.badgeId.toString());
        return badge && dynamicTotalPoints >= badge.pointsRequired;
      });

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
      return res.status(400).json({ success: false, message: error.message });
    }
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ success: false, message: 'Validation failed', errors });
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Admin: Delete Level
export const deleteLevel = async (req, res) => {
  try {
    const { id } = req.params;

    const level = await Level.findById(id);
    if (!level) {
      return res.status(404).json({ success: false, message: 'Level not found' });
    }

    await Level.findByIdAndDelete(id);

    const allStudents = await StudentProgress.find();
    console.log(`Found ${allStudents.length} students to process`);

    let updatedCount = 0;
    for (const student of allStudents) {
      const originalLevel = student.currentLevel;
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
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Admin: Student Progress Monitoring
export const getStudentProgressMonitoring = async (req, res) => {
  try {
    const { limit = 100 } = req.query;

    // Ensure ALL users have StudentProgress records
    const allUsers = await User.find({}, '_id');
    console.log(`📊 Found ${allUsers.length} total users in database`);

    let createdCount = 0;
    for (const user of allUsers) {
      const existingProgress = await StudentProgress.findOne({ userId: user._id });
      if (!existingProgress) {
        const newProgress = new StudentProgress({ userId: user._id, totalPoints: 0, currentLevel: 'Level 1' });
        await newProgress.save();
        createdCount++;
        console.log(`✅ Created StudentProgress for user ${user._id}`);
      }
    }
    if (createdCount > 0) console.log(`✅ Created ${createdCount} new StudentProgress records`);

    const allProgress = await StudentProgress.find()
      .populate('userId', 'firstName lastName username email')
      .sort({ totalPoints: -1 })
      .limit(parseInt(limit));

    console.log(`📈 Returning ${allProgress.length} student progress records`);

    const levels = await Level.getActiveLevels();

    // Fetch ALL badges and scores ONCE — outside the map (avoids N+1 queries)
    const activeMilestoneBadges = await Badge.find({
      badgeType: 'Milestone',
      status: 'Active'
    }).sort({ pointsRequired: 1 });

    const activeBadgeMap = new Map(
      (await Badge.find({ status: 'Active' })).map(b => [b._id.toString(), b])
    );

    const allGameScores = await GameScore.find();
    const allUserPoints = await UserPoints.find();
    const allDailyLogins = await DailyLogin.find();

    const studentsProgress = await Promise.all(allProgress.map(async (progress) => {
      if (!progress.userId) {
        console.log('⚠️ Skipping progress record with missing user reference');
        return null;
      }

      // Calculate points using pre-fetched data
      const gameScores = allGameScores.filter(g => g.userId === progress.userId.username);
      const totalGamePoints = gameScores.reduce((sum, r) => sum + r.score, 0);

      const userPointsRecord = allUserPoints.find(u => u.userId.toString() === progress.userId._id.toString());
      const userPoints = userPointsRecord ? userPointsRecord.totalPoints : 0;

      const dailyLoginRecords = allDailyLogins.filter(d => d.userId.toString() === progress.userId._id.toString());
      const totalDailyLoginPoints = dailyLoginRecords.reduce((sum, r) => sum + (r.pointsAwarded || 10), 0);

      const dynamicTotalPoints = totalGamePoints + userPoints + totalDailyLoginPoints;

      if (progress.totalPoints !== dynamicTotalPoints) {
        progress.totalPoints = dynamicTotalPoints;
      }

      // Calculate level
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

      let currentLevelDoc = null;
      if (progress.totalPoints > 0) {
        currentLevelDoc = levels.find(level => {
          const max = level.maxPoints ?? Infinity;
          return progress.totalPoints >= level.minPoints && progress.totalPoints <= max;
        });
      }

      // Clean up untriggered notifications
      const allUntriggeredNotifications = await BadgeNotification.find({
        userId: progress.userId._id,
        animationTriggered: false
      });

      for (const notification of allUntriggeredNotifications) {
        const matchingBadge = activeMilestoneBadges.find(b => b._id.toString() === notification.badgeId.toString());
        const shouldDelete = !matchingBadge || progress.totalPoints < matchingBadge.pointsRequired;
        if (shouldDelete) {
          await BadgeNotification.findByIdAndDelete(notification._id);
          const reason = !matchingBadge ? 'badge no longer exists' : 'student no longer qualifies';
          console.log(`🗑️  Removed notification for ${notification.badgeDetails?.badgeName} (${reason})`);
        }
      }

      // Award eligible badges
      let awardedCount = 0;
      for (const badge of activeMilestoneBadges) {
        if (progress.totalPoints >= badge.pointsRequired && !progress.hasBadge(badge._id)) {
          progress.addBadge(badge);
          awardedCount++;
          await Badge.findByIdAndUpdate(badge._id, { $inc: { earnedCount: 1 } });
          await BadgeNotification.createNotification(progress.userId._id, badge);
          console.log(`🏅 NEW BADGE EARNED: "${badge.badgeName}" - Notification created for animation`);
        }
      }

      if (awardedCount > 0) await progress.save();

      // Build final valid badges list — no duplicate, active only, using pre-fetched map
      const seenBadgeIds = new Set();
      const finalValidBadges = [];

      for (const badgeEntry of progress.badgesEarned) {
        const badgeIdStr = badgeEntry.badgeId.toString();
        if (seenBadgeIds.has(badgeIdStr)) {
          console.log(`🗑️  Filtering duplicate badge for ${progress.userId.username}: ${badgeEntry.badgeDetails?.badgeName}`);
          continue;
        }
        seenBadgeIds.add(badgeIdStr);
        if (activeBadgeMap.has(badgeIdStr)) {
          finalValidBadges.push(badgeEntry);
        }
      }

      // Save if duplicates were removed
      if (finalValidBadges.length !== progress.badgesEarned.length) {
        progress.badgesEarned = finalValidBadges;
        await progress.save();
        console.log(`🧹 ${progress.userId.username}: Removed ${progress.badgesEarned.length - finalValidBadges.length} duplicate badge(s)`);
      }

      return {
        studentId: progress.userId._id,
        studentName: `${progress.userId.firstName} ${progress.userId.lastName}`,
        username: progress.userId.username,
        email: progress.userId.email,
        totalPoints: progress.totalPoints,
        currentLevel: currentLevelDoc ? currentLevelDoc.levelName : null,
        levelNumber: currentLevelDoc ? levels.findIndex(l => l._id.equals(currentLevelDoc._id)) + 1 : 0,
        badgesEarned: finalValidBadges,
        badgesCount: finalValidBadges.length,
        completedSections: progress.sectionProgress.filter(sec => sec.completed).length,
        lastActivity: progress.lastActivity,
        createdAt: progress.createdAt
      };
    }));

    const validStudentsProgress = studentsProgress.filter(s => s !== null);

    res.status(200).json({
      success: true,
      count: validStudentsProgress.length,
      students: validStudentsProgress,
      totalLevels: levels.length
    });
  } catch (error) {
    console.error('Get student progress monitoring error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Admin: Get Specific Student Details
export const getStudentDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const gameScores = await GameScore.find({ userId: user.username });
    const totalGamePoints = gameScores.reduce((sum, r) => sum + r.score, 0);

    const userPointsRecord = await UserPoints.findOne({ userId: user._id });
    const userPoints = userPointsRecord ? userPointsRecord.totalPoints : 0;

    const dailyLoginRecords = await DailyLogin.find({ userId: user._id });
    const totalDailyLoginPoints = dailyLoginRecords.reduce((sum, r) => sum + (r.pointsAwarded || 10), 0);

    const dynamicTotalPoints = totalGamePoints + userPoints + totalDailyLoginPoints;

    console.log(`Dynamic points for ${user.username}:`);
    console.log(`  Game: ${totalGamePoints}`);
    console.log(`  UserPoints: ${userPoints}`);
    console.log(`  DailyLogin: ${totalDailyLoginPoints}`);
    console.log(`  TOTAL: ${dynamicTotalPoints}`);

    let studentProgress = await StudentProgress.findOne({ userId });
    if (!studentProgress) {
      studentProgress = new StudentProgress({ userId, totalPoints: dynamicTotalPoints });
      await studentProgress.save();
    } else if (studentProgress.totalPoints !== dynamicTotalPoints) {
      studentProgress.totalPoints = dynamicTotalPoints;
      studentProgress.currentLevel = await studentProgress.calculateLevel();
      await studentProgress.save();
    }

    const levels = await Level.getActiveLevels();

    const activeMilestoneBadges = await Badge.find({
      badgeType: 'Milestone',
      status: 'Active'
    }).sort({ pointsRequired: 1 });

    console.log(`Found ${activeMilestoneBadges.length} active milestone badges`);
    activeMilestoneBadges.forEach(b => console.log(`  - ${b.badgeName}: ${b.pointsRequired} points`));

    // Clean up untriggered notifications
    const allUntriggeredNotifications = await BadgeNotification.find({
      userId: user._id,
      animationTriggered: false
    });

    console.log(`🔍 Found ${allUntriggeredNotifications.length} untriggered notifications to validate`);

    for (const notification of allUntriggeredNotifications) {
      const matchingBadge = activeMilestoneBadges.find(b => b._id.toString() === notification.badgeId.toString());
      const shouldDelete = !matchingBadge || studentProgress.totalPoints < matchingBadge.pointsRequired;
      if (shouldDelete) {
        await BadgeNotification.findByIdAndDelete(notification._id);
        const reason = !matchingBadge ? 'badge no longer exists' : 'student no longer qualifies';
        console.log(`🗑️  Removed notification for ${notification.badgeDetails?.badgeName} (${reason})`);
      }
    }

    let newBadgesAwarded = false;
    for (const badge of activeMilestoneBadges) {
      const hasBadge = studentProgress.hasBadge(badge._id);
      const qualifies = studentProgress.totalPoints >= badge.pointsRequired;
      console.log(`Checking badge ${badge.badgeName}: qualifies=${qualifies}, hasBadge=${hasBadge}`);
      if (qualifies && !hasBadge) {
        studentProgress.addBadge(badge);
        newBadgesAwarded = true;
        await Badge.findByIdAndUpdate(badge._id, { $inc: { earnedCount: 1 } });
        console.log(`✅ Auto-awarded badge ${badge.badgeName} to ${user.username}`);
      }
    }

    if (newBadgesAwarded) await studentProgress.save();

    // Build final valid badges using active badge map
    const activeBadgeMap = new Map(activeMilestoneBadges.map(b => [b._id.toString(), b]));
    const finalValidBadges = studentProgress.badgesEarned.filter(
      badgeEntry => activeBadgeMap.has(badgeEntry.badgeId.toString())
    );

    let currentLevelDoc = null;
    if (studentProgress.totalPoints > 0) {
      currentLevelDoc = levels.find(level => {
        const max = level.maxPoints ?? Infinity;
        return studentProgress.totalPoints >= level.minPoints && studentProgress.totalPoints <= max;
      });
    }

    const gameScoresWithDetails = await GameScore.find({ userId: user.username }).populate('gameId', 'title');
    const gameBreakdown = gameScoresWithDetails.map(score => ({
      gameName: score.gameId?.title || 'Unknown Game',
      gameId: score.gameId?._id || null,
      score: score.score,
      maxScore: score.maxScore,
      percentage: score.percentage,
      playedAt: score.playedAt
    }));

    res.status(200).json({
      success: true,
      studentDetails: {
        studentId: user._id,
        studentName: `${user.firstName} ${user.lastName}`,
        username: user.username,
        email: user.email,
        totalPoints: dynamicTotalPoints,
        currentLevel: currentLevelDoc ? currentLevelDoc.levelName : null,
        badgesEarned: finalValidBadges,
        completedSections: studentProgress.sectionProgress.filter(sec => sec.completed),
        lastActivity: studentProgress.lastActivity,
        createdAt: studentProgress.createdAt,
        pointsBreakdown: {
          gamePoints: totalGamePoints,
          games: gameBreakdown,
          userPoints,
          dailyLoginPoints: totalDailyLoginPoints
        }
      }
    });
  } catch (error) {
    console.error('Get student details error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Recalculate all student levels
export const recalculateAllStudentLevels = async (req, res) => {
  try {
    const allStudents = await StudentProgress.find();

    let updatedCount = 0;
    for (const student of allStudents) {
      const originalLevel = student.currentLevel;
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