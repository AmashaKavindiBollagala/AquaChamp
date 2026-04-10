import WaterLog from "../models/amasha-waterLog.js";
import UserPoints from "../models/amasha-userPoints.js";
import User from "../models/dushani-User.js";
import {
  todayString,
  pastDateString,
  getAgeGroup,
  getDailyWaterGoal,
  buildWaterEncouragement,
} from "../utils/amasha-helpers.js";

const getUser = async (req) => {
  return await User.findOne({ username: req.user });
};

// ── Create Today's Water Log ──────────────────────────────────────────────────
export const createWaterLog = async (req, res) => {
  try {
    const dbUser = await getUser(req);
    if (!dbUser) return res.status(404).json({ success: false, message: "User not found" });

    const { cupsConsumed, date } = req.body;
    const logDate = date || todayString();

    const ageGroup      = getAgeGroup(dbUser.age);
    const dailyGoalCups = getDailyWaterGoal(ageGroup);

    const existing = await WaterLog.findOne({ userId: dbUser._id, date: logDate });
    if (existing) {
      const encouragement = buildWaterEncouragement(existing.cupsConsumed, existing.dailyGoalCups);
      return res.status(200).json({
        success: true,
        message: "Water log already exists for today.",
        data: existing,
        encouragement,
        dailyGoalCups: existing.dailyGoalCups,
      });
    }

    const log = await WaterLog.create({
      userId: dbUser._id,
      date: logDate,
      cupsConsumed: cupsConsumed || 0,
      dailyGoalCups,
      ageGroup,
    });

    const encouragement = buildWaterEncouragement(log.cupsConsumed, dailyGoalCups);

    return res.status(201).json({
      success: true,
      message: "Water log created!",
      data: log,
      encouragement,
      dailyGoalCups,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Update Cups Consumed (full replace) ──────────────────────────────────────
export const updateWaterLog = async (req, res) => {
  try {
    const dbUser = await getUser(req);
    if (!dbUser) return res.status(404).json({ success: false, message: "User not found" });

    const { id } = req.params;
    const { cupsConsumed } = req.body;

    if (cupsConsumed === undefined) {
      return res.status(400).json({ success: false, message: "cupsConsumed is required" });
    }

    const log = await WaterLog.findOne({ _id: id, userId: dbUser._id });
    if (!log) return res.status(404).json({ success: false, message: "Water log not found" });

    const wasGoalMet = log.cupsConsumed >= log.dailyGoalCups;
    const prevCups   = log.cupsConsumed;

    log.cupsConsumed = Math.max(0, cupsConsumed);
    await log.save();

    const isGoalNowMet = log.cupsConsumed >= log.dailyGoalCups;
    let pointsAwarded  = 0;

    if (!wasGoalMet && isGoalNowMet) {
      await awardWaterPoints(dbUser._id, 5, "💧 Daily water goal reached!", log.date);
      pointsAwarded = 5;
    }

    const encouragement = buildWaterEncouragement(log.cupsConsumed, log.dailyGoalCups);

    return res.status(200).json({
      success: true,
      message: `Updated from ${prevCups} → ${log.cupsConsumed} cups`,
      data: log,
      encouragement,
      pointsAwarded,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Add One Cup ───────────────────────────────────────────────────────────────
export const addCup = async (req, res) => {
  try {
    const dbUser = await getUser(req);
    if (!dbUser) return res.status(404).json({ success: false, message: "User not found" });

    const today         = todayString();
    const ageGroup      = getAgeGroup(dbUser.age);
    const dailyGoalCups = getDailyWaterGoal(ageGroup);

    let log = await WaterLog.findOne({ userId: dbUser._id, date: today });
    if (!log) {
      log = await WaterLog.create({
        userId: dbUser._id,
        date: today,
        cupsConsumed: 0,
        dailyGoalCups,
        ageGroup,
      });
    }

    const wasGoalMet  = log.cupsConsumed >= log.dailyGoalCups;
    log.cupsConsumed += 1;
    await log.save();

    const isGoalNowMet = log.cupsConsumed >= log.dailyGoalCups;
    let pointsAwarded  = 0;

    if (!wasGoalMet && isGoalNowMet) {
      await awardWaterPoints(dbUser._id, 5, "💧 Daily water goal reached!", today);
      pointsAwarded = 5;
    }

    const encouragement = buildWaterEncouragement(log.cupsConsumed, log.dailyGoalCups);

    return res.status(200).json({
      success: true,
      message: `Cup added! ${log.cupsConsumed}/${log.dailyGoalCups} today 💧`,
      data: {
        cupsConsumed:  log.cupsConsumed,
        dailyGoalCups: log.dailyGoalCups,
        logId:         log._id,
      },
      encouragement,
      pointsAwarded,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Remove One Cup ────────────────────────────────────────────────────────────
export const removeCup = async (req, res) => {
  try {
    const dbUser = await getUser(req);
    if (!dbUser) return res.status(404).json({ success: false, message: "User not found" });

    const today = todayString();

    const log = await WaterLog.findOne({ userId: dbUser._id, date: today });
    if (!log) {
      return res.status(404).json({ success: false, message: "No water log found for today" });
    }

    if (log.cupsConsumed === 0) {
      return res.status(400).json({ success: false, message: "Already at 0 cups" });
    }

    log.cupsConsumed = Math.max(0, log.cupsConsumed - 1);
    await log.save();

    const encouragement = buildWaterEncouragement(log.cupsConsumed, log.dailyGoalCups);

    return res.status(200).json({
      success: true,
      message: `Cup removed. ${log.cupsConsumed}/${log.dailyGoalCups} today`,
      data: {
        cupsConsumed:  log.cupsConsumed,
        dailyGoalCups: log.dailyGoalCups,
        logId:         log._id,
      },
      encouragement,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Set Cups Directly ─────────────────────────────────────────────────────────
export const setCups = async (req, res) => {
  try {
    const dbUser = await getUser(req);
    if (!dbUser) return res.status(404).json({ success: false, message: "User not found" });

    const { id } = req.params;
    const { cupsConsumed } = req.body;

    if (cupsConsumed === undefined || isNaN(Number(cupsConsumed))) {
      return res.status(400).json({ success: false, message: "cupsConsumed must be a number" });
    }

    if (!/^[a-f\d]{24}$/i.test(id)) {
      return res.status(400).json({ success: false, message: "Invalid log ID" });
    }

    const log = await WaterLog.findOne({ _id: id, userId: dbUser._id });
    if (!log) return res.status(404).json({ success: false, message: "Water log not found" });

    const wasGoalMet = log.cupsConsumed >= log.dailyGoalCups;
    const prevCups   = log.cupsConsumed;

    log.cupsConsumed = Math.max(0, Math.round(Number(cupsConsumed)));
    await log.save();

    const isGoalNowMet = log.cupsConsumed >= log.dailyGoalCups;
    let pointsAwarded  = 0;

    if (!wasGoalMet && isGoalNowMet) {
      await awardWaterPoints(dbUser._id, 5, "💧 Daily water goal reached!", log.date);
      pointsAwarded = 5;
    }

    const encouragement = buildWaterEncouragement(log.cupsConsumed, log.dailyGoalCups);

    return res.status(200).json({
      success: true,
      message: `Set from ${prevCups} → ${log.cupsConsumed} cups`,
      data: log,
      encouragement,
      pointsAwarded,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Get Today's Water Status ──────────────────────────────────────────────────
export const getTodayWater = async (req, res) => {
  try {
    const dbUser = await getUser(req);
    if (!dbUser) return res.status(404).json({ success: false, message: "User not found" });

    const today         = todayString();
    const ageGroup      = getAgeGroup(dbUser.age);
    const dailyGoalCups = getDailyWaterGoal(ageGroup);

    const log          = await WaterLog.findOne({ userId: dbUser._id, date: today });
    const cupsConsumed = log?.cupsConsumed || 0;

    const encouragement = buildWaterEncouragement(cupsConsumed, dailyGoalCups);

    return res.status(200).json({
      success: true,
      data: {
        date:            today,
        cupsConsumed,
        dailyGoalCups,
        ageGroup,
        percentComplete: Math.min(100, Math.round((cupsConsumed / dailyGoalCups) * 100)),
        goalMet:         cupsConsumed >= dailyGoalCups,
        logId:           log?._id || null,
      },
      encouragement,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Get Water History ─────────────────────────────────────────────────────────
export const getWaterHistory = async (req, res) => {
  try {
    const dbUser = await getUser(req);
    if (!dbUser) return res.status(404).json({ success: false, message: "User not found" });

    const days      = parseInt(req.query.days) || 7;
    const startDate = pastDateString(days - 1);
    const endDate   = todayString();

    const logs = await WaterLog.find({
      userId: dbUser._id,
      date:   { $gte: startDate, $lte: endDate },
    }).sort({ date: 1 });

    const summary = logs.map((l) => ({
      date:            l.date,
      cupsConsumed:    l.cupsConsumed,
      dailyGoalCups:   l.dailyGoalCups,
      percentComplete: Math.min(100, Math.round((l.cupsConsumed / l.dailyGoalCups) * 100)),
      goalMet:         l.cupsConsumed >= l.dailyGoalCups,
      logId:           l._id,
    }));

    const daysGoalMet = summary.filter((d) => d.goalMet).length;

    return res.status(200).json({
      success: true,
      data: {
        period: { startDate, endDate, days },
        logs:   summary,
        daysGoalMet,
        consistency: `${daysGoalMet}/${days} days`,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Delete Water Log ──────────────────────────────────────────────────────────
export const deleteWaterLog = async (req, res) => {
  try {
    const dbUser = await getUser(req);
    if (!dbUser) return res.status(404).json({ success: false, message: "User not found" });

    const { id } = req.params;
    const log = await WaterLog.findOneAndDelete({ _id: id, userId: dbUser._id });
    if (!log) return res.status(404).json({ success: false, message: "Water log not found" });

    return res.status(200).json({ success: true, message: "Water log deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Internal Helper ───────────────────────────────────────────────────────────
const awardWaterPoints = async (userId, points, reason, date) => {
  let profile = await UserPoints.findOne({ userId });
  if (!profile) {
    profile = await UserPoints.create({ userId, totalPoints: 0, history: [] });
  }
  profile.totalPoints += points;
  profile.history.push({ points, reason, date });
  await profile.save();
};

// ── ADMIN: GET /api/water/admin/overview ─────────────────────────────────────
export const adminGetWaterOverview = async (req, res) => {
  try {
    const today   = todayString();
    const users   = await User.find({ age: { $gte: 5, $lte: 15 } }).lean();
    const userIds = users.map((u) => u._id);
    const logs    = await WaterLog.find({ date: today, userId: { $in: userIds } }).lean();

    const logMap = {};
    logs.forEach((l) => { logMap[String(l.userId)] = l; });

    const data = users.map((user) => {
      const ageGroup     = getAgeGroup(user.age);
      const dailyGoal    = getDailyWaterGoal(ageGroup);
      const log          = logMap[String(user._id)];
      const cupsConsumed = log?.cupsConsumed || 0;
      const goalCups     = log?.dailyGoalCups || dailyGoal;

      return {
        userId:        String(user._id),
        userName:      user.name || user.username || "Unknown",
        email:         user.email || null,
        age:           user.age,
        ageGroup,
        dailyGoalCups: goalCups,
        cupsConsumed,
        goalMet:       cupsConsumed >= goalCups,
        date:          today,
        logId:         log?._id ? String(log._id) : null,
      };
    });

    return res.status(200).json({
      success: true,
      data,
      meta: {
        date:         today,
        totalUsers:   data.length,
        goalMetCount: data.filter((d) => d.goalMet).length,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── ADMIN: GET /api/water/admin/history/:userId?days=7 ───────────────────────
export const adminGetUserWaterHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const days       = parseInt(req.query.days) || 7;

    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const startDate = pastDateString(days - 1);
    const endDate   = todayString();

    const logs = await WaterLog.find({
      userId: user._id,
      date:   { $gte: startDate, $lte: endDate },
    }).sort({ date: 1 }).lean();

    const summary = logs.map((l) => ({
      date:            l.date,
      cupsConsumed:    l.cupsConsumed,
      dailyGoalCups:   l.dailyGoalCups,
      percentComplete: Math.min(100, Math.round((l.cupsConsumed / l.dailyGoalCups) * 100)),
      goalMet:         l.cupsConsumed >= l.dailyGoalCups,
      logId:           String(l._id),
    }));

    const daysGoalMet = summary.filter((d) => d.goalMet).length;

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id:    String(user._id),
          name:  user.name || user.username,
          email: user.email,
          age:   user.age,
        },
        period: { startDate, endDate, days },
        logs:   summary,
        daysGoalMet,
        consistency: `${daysGoalMet}/${days} days`,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── ADMIN: PATCH /api/water/admin/set/:logId ─────────────────────────────────
export const adminSetCups = async (req, res) => {
  try {
    const { logId }        = req.params;
    const { cupsConsumed } = req.body;

    if (cupsConsumed === undefined || isNaN(Number(cupsConsumed))) {
      return res.status(400).json({ success: false, message: "cupsConsumed must be a number" });
    }

    const log = await WaterLog.findById(logId);
    if (!log) return res.status(404).json({ success: false, message: "Water log not found" });

    const prev       = log.cupsConsumed;
    log.cupsConsumed = Math.max(0, Math.round(Number(cupsConsumed)));
    await log.save();

    return res.status(200).json({
      success: true,
      message: `Admin set cups: ${prev} → ${log.cupsConsumed}`,
      data: log,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};