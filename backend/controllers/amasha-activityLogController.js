import ActivityLog from "../models/amasha-activityLog.js";
import Activity from "../models/amasha-activity.js";
import Streak from "../models/amasha-streak.js";
import UserPoints from "../models/amasha-userPoints.js";
import User from "../models/dushani-User.js";
import { todayString, isConsecutiveDay, buildStreakMessage } from "../utils/amasha-helpers.js";

// Helper: get full user document from token username 
const getUser = async (req) => {
  return await User.findOne({ username: req.user }); 
};

//  Log a Completed Activity 
export const logActivity = async (req, res) => {
  try {
    const dbUser = await getUser(req);
    if (!dbUser) return res.status(404).json({ success: false, message: "User not found" });

    const userId = dbUser._id;
    const { activityId, date, notes, status } = req.body;
    const logDate = date || todayString();

    if (!activityId) return res.status(400).json({ success: false, message: "activityId is required" });

    const activity = await Activity.findOne({
      _id: activityId,
      isActive: true,
      $or: [{ source: "system" }, { userId }],
    });
    if (!activity) return res.status(404).json({ success: false, message: "Activity not found or not accessible" });

    const existing = await ActivityLog.findOne({ userId, activityId, date: logDate });
    if (existing) {
      return res.status(409).json({ success: false, message: "Activity already logged for this date" });
    }

    const pointsEarned = status === "skipped" ? 0 : activity.points;

    const log = await ActivityLog.create({
      userId,
      activityId,
      date: logDate,
      status: status || "completed",
      pointsEarned,
      notes: notes || "",
    });

    let bonusAwarded = false;
    if (pointsEarned > 0) {
      await awardPoints(userId, pointsEarned, `Completed: ${activity.name}`, logDate, log._id);
      bonusAwarded = await checkAndAwardDailyBonus(userId, logDate);
    }

    return res.status(201).json({
      success: true,
      message: "Activity logged successfully! 🎉",
      data: log,
      pointsEarned,
      bonusAwarded,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

//  Get Logs For a User 
export const getUserLogs = async (req, res) => {
  try {
    const dbUser = await getUser(req);
    if (!dbUser) return res.status(404).json({ success: false, message: "User not found" });

    const userId = dbUser._id;
    const { date, startDate, endDate } = req.query;

    const filter = { userId };
    if (date) filter.date = date;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = startDate;
      if (endDate) filter.date.$lte = endDate;
    }

    const logs = await ActivityLog.find(filter)
      .populate("activityId", "name icon points source")
      .sort({ date: -1 });

    return res.status(200).json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

//  Update a Log
export const updateLog = async (req, res) => {
  try {
    const dbUser = await getUser(req);
    if (!dbUser) return res.status(404).json({ success: false, message: "User not found" });

    const { id } = req.params;
    const userId = dbUser._id;
    const { status, notes } = req.body;

    const log = await ActivityLog.findOne({ _id: id, userId });
    if (!log) return res.status(404).json({ success: false, message: "Log not found" });

    if (status !== undefined) log.status = status;
    if (notes !== undefined) log.notes = notes;

    await log.save();

    return res.status(200).json({ success: true, message: "Log updated", data: log });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a Log 
export const deleteLog = async (req, res) => {
  try {
    const dbUser = await getUser(req);
    if (!dbUser) return res.status(404).json({ success: false, message: "User not found" });

    const { id } = req.params;
    const userId = dbUser._id;

    const log = await ActivityLog.findOneAndDelete({ _id: id, userId });
    if (!log) return res.status(404).json({ success: false, message: "Log not found" });

    return res.status(200).json({ success: true, message: "Log deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

//  Weekly Summary Report 
export const getReport = async (req, res) => {
  try {
    const dbUser = await getUser(req);
    if (!dbUser) return res.status(404).json({ success: false, message: "User not found" });

    const userId = dbUser._id;

    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);

    const startDate = req.query.startDate || sevenDaysAgo.toISOString().slice(0, 10);
    const endDate = req.query.endDate || today.toISOString().slice(0, 10);

    const logs = await ActivityLog.find({
      userId,
      date: { $gte: startDate, $lte: endDate },
      status: "completed",
    }).populate("activityId", "name icon");

    const dailyMap = {};
    let totalPoints = 0;
    const activityCount = {};

    logs.forEach((log) => {
      if (!dailyMap[log.date]) dailyMap[log.date] = { date: log.date, completions: 0, points: 0 };
      dailyMap[log.date].completions++;
      dailyMap[log.date].points += log.pointsEarned;
      totalPoints += log.pointsEarned;

      const actName = log.activityId?.name || "Unknown";
      activityCount[actName] = (activityCount[actName] || 0) + 1;
    });

    const daily = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));

    const sorted = Object.entries(activityCount).sort((a, b) => b[1] - a[1]);
    const mostCompleted = sorted[0] ? { activity: sorted[0][0], count: sorted[0][1] } : null;
    const leastCompleted = sorted.at(-1) ? { activity: sorted.at(-1)[0], count: sorted.at(-1)[1] } : null;

    const streak = await Streak.findOne({ userId });

    return res.status(200).json({
      success: true,
      data: {
        period: { startDate, endDate },
        totalLogs: logs.length,
        totalPoints,
        daily,
        mostCompleted,
        leastCompleted,
        currentStreak: streak?.currentStreak || 0,
        longestStreak: streak?.longestStreak || 0,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Streak Info
export const getStreak = async (req, res) => {
  try {
    const dbUser = await getUser(req);
    if (!dbUser) return res.status(404).json({ success: false, message: "User not found" });

    const userId = dbUser._id;

    let streak = await Streak.findOne({ userId });
    if (!streak) {
      streak = { currentStreak: 0, longestStreak: 0, lastCompletedDate: null, totalDaysCompleted: 0 };
    }

    // Build motivational message based on streak count — no badges
    const motivation = buildStreakMessage(streak.currentStreak);

    return res.status(200).json({
      success: true,
      data: {
        currentStreak: streak.currentStreak,
        longestStreak: streak.longestStreak,
        lastCompletedDate: streak.lastCompletedDate,
        totalDaysCompleted: streak.totalDaysCompleted,
      },
      motivation,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

//  Internal Helpers 
const awardPoints = async (userId, points, reason, date, activityLogId = null) => {
  let profile = await UserPoints.findOne({ userId });
  if (!profile) {
    profile = await UserPoints.create({ userId, totalPoints: 0, history: [] });
  }
  profile.totalPoints += points;
  profile.history.push({ points, reason, date, activityLogId });
  await profile.save();
};

const checkAndAwardDailyBonus = async (userId, date) => {
  const totalActivities = await Activity.countDocuments({
    isActive: true,
    $or: [{ source: "system" }, { userId }],
  });

  const completedToday = await ActivityLog.countDocuments({
    userId,
    date,
    status: "completed",
  });

  if (completedToday >= totalActivities && totalActivities > 0) {
    await awardPoints(userId, 20, "🏆 Daily Completion Bonus — all activities done!", date);

    let streak = await Streak.findOne({ userId });
    if (!streak) {
      streak = await Streak.create({
        userId,
        currentStreak: 1,
        longestStreak: 1,
        lastCompletedDate: date,
        totalDaysCompleted: 1,
      });
    } else {
      if (streak.lastCompletedDate !== date) {
        streak.currentStreak = isConsecutiveDay(streak.lastCompletedDate, date)
          ? streak.currentStreak + 1
          : 1;
        streak.longestStreak = Math.max(streak.longestStreak, streak.currentStreak);
        streak.lastCompletedDate = date;
        streak.totalDaysCompleted += 1;
        await streak.save();
      }
    }
    return true;
  }
  return false;
};