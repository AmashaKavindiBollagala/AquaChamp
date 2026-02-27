import WaterLog from "../models/amasha-waterLog.js";
import UserPoints from "../models/amasha-userPoints.js";
import User from "../models/dushani-User.js";
import { todayString, getAgeGroup, getDailyWaterGoal, buildWaterEncouragement } from "../utils/amasha-helpers.js";

//  Helper: get full user document from token username 
const getUser = async (req) => {
  return await User.findOne({ username: req.user }); // req.user = username string
};

//  Create Today's Water Log 
export const createWaterLog = async (req, res) => {
  try {
    const dbUser = await getUser(req);
    if (!dbUser) return res.status(404).json({ success: false, message: "User not found" });

    const { cupsConsumed, date } = req.body;
    const logDate = date || todayString();

    const ageGroup = getAgeGroup(dbUser.age);
    const dailyGoalCups = getDailyWaterGoal(ageGroup);

    const existing = await WaterLog.findOne({ userId: dbUser._id, date: logDate });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Water log for this date already exists. Use PUT to update it.",
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

//  Update Cups Consumed 
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
    const prevCups = log.cupsConsumed;

    log.cupsConsumed = Math.max(0, cupsConsumed);
    await log.save();

    const isGoalNowMet = log.cupsConsumed >= log.dailyGoalCups;
    let pointsAwarded = 0;

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

// Add One Cup 
export const addCup = async (req, res) => {
  try {
    const dbUser = await getUser(req);
    if (!dbUser) return res.status(404).json({ success: false, message: "User not found" });

    const today = todayString();
    const ageGroup = getAgeGroup(dbUser.age);
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

    const wasGoalMet = log.cupsConsumed >= log.dailyGoalCups;
    log.cupsConsumed += 1;
    await log.save();

    const isGoalNowMet = log.cupsConsumed >= log.dailyGoalCups;
    let pointsAwarded = 0;

    if (!wasGoalMet && isGoalNowMet) {
      await awardWaterPoints(dbUser._id, 5, "💧 Daily water goal reached!", today);
      pointsAwarded = 5;
    }

    const encouragement = buildWaterEncouragement(log.cupsConsumed, log.dailyGoalCups);

    return res.status(200).json({
      success: true,
      message: `Cup added! ${log.cupsConsumed}/${log.dailyGoalCups} today 💧`,
      data: { cupsConsumed: log.cupsConsumed, dailyGoalCups: log.dailyGoalCups },
      encouragement,
      pointsAwarded,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

//  Get Today's Water Status 
export const getTodayWater = async (req, res) => {
  try {
    const dbUser = await getUser(req);
    if (!dbUser) return res.status(404).json({ success: false, message: "User not found" });

    const today = todayString();
    const ageGroup = getAgeGroup(dbUser.age);
    const dailyGoalCups = getDailyWaterGoal(ageGroup);

    const log = await WaterLog.findOne({ userId: dbUser._id, date: today });
    const cupsConsumed = log?.cupsConsumed || 0;

    const encouragement = buildWaterEncouragement(cupsConsumed, dailyGoalCups);

    return res.status(200).json({
      success: true,
      data: {
        date: today,
        cupsConsumed,
        dailyGoalCups,
        ageGroup,
        percentComplete: Math.min(100, Math.round((cupsConsumed / dailyGoalCups) * 100)),
        goalMet: cupsConsumed >= dailyGoalCups,
        logId: log?._id || null,
      },
      encouragement,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

//  Get Water History 
export const getWaterHistory = async (req, res) => {
  try {
    const dbUser = await getUser(req);
    if (!dbUser) return res.status(404).json({ success: false, message: "User not found" });

    const days = parseInt(req.query.days) || 7;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - (days - 1));
    const startDate = cutoff.toISOString().slice(0, 10);
    const endDate = todayString();

    const logs = await WaterLog.find({
      userId: dbUser._id,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: 1 });

    const summary = logs.map((l) => ({
      date: l.date,
      cupsConsumed: l.cupsConsumed,
      dailyGoalCups: l.dailyGoalCups,
      percentComplete: Math.min(100, Math.round((l.cupsConsumed / l.dailyGoalCups) * 100)),
      goalMet: l.cupsConsumed >= l.dailyGoalCups,
    }));

    const daysGoalMet = summary.filter((d) => d.goalMet).length;

    return res.status(200).json({
      success: true,
      data: {
        period: { startDate, endDate, days },
        logs: summary,
        daysGoalMet,
        consistency: `${daysGoalMet}/${days} days`,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

//  Delete Water Log 
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

//  Internal Helper 
const awardWaterPoints = async (userId, points, reason, date) => {
  let profile = await UserPoints.findOne({ userId });
  if (!profile) {
    profile = await UserPoints.create({ userId, totalPoints: 0, history: [] });
  }
  profile.totalPoints += points;
  profile.history.push({ points, reason, date });
  await profile.save();
};