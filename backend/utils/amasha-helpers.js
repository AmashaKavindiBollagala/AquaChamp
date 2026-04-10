// ── Sri Lanka timezone helper ─────────────────────────────────────────────────
// Uses Intl API with Asia/Colombo timezone — no manual offset math needed.

/**
 * Returns today's date string in YYYY-MM-DD format using Sri Lanka time.
 * en-CA locale natively produces YYYY-MM-DD format.
 * @returns {string} e.g. "2026-04-11"
 */
export const todayString = () => {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Colombo" });
};

/**
 * Returns a date string N days ago in YYYY-MM-DD format using Sri Lanka time.
 * @param {number} daysAgo
 * @returns {string} e.g. "2026-04-04"
 */
export const pastDateString = (daysAgo) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toLocaleDateString("en-CA", { timeZone: "Asia/Colombo" });
};

/**
 * Returns the age group label based on numeric age.
 * @param {number} age
 * @returns {"5-10" | "10-15"}
 */
export const getAgeGroup = (age) => {
  if (age >= 5 && age <= 10) return "5-10";
  if (age > 10 && age <= 15) return "10-15";
  throw new Error("Age must be between 5 and 15");
};

/**
 * Returns the recommended daily water cups for a given age group.
 * @param {"5-10"|"10-15"} ageGroup
 * @returns {number}
 */
export const getDailyWaterGoal = (ageGroup) => {
  const goals = { "5-10": 5, "10-15": 7 };
  return goals[ageGroup] ?? 6;
};

/**
 * Builds a motivational water message based on progress percentage.
 * @param {number} cupsConsumed
 * @param {number} dailyGoal
 * @returns {{ message: string, emoji: string, level: "low"|"medium"|"high"|"complete" }}
 */
export const buildWaterEncouragement = (cupsConsumed, dailyGoal) => {
  const pct = dailyGoal > 0 ? (cupsConsumed / dailyGoal) * 100 : 0;

  if (pct === 0) {
    return { message: "Start your day with a glass of water! 💧 Your body is waiting.", emoji: "💧", level: "low" };
  }
  if (pct < 30) {
    return { message: "Great start! Keep sipping — you've got this! 🌊", emoji: "🌊", level: "low" };
  }
  if (pct < 60) {
    return { message: "Halfway there! Water keeps your brain sharp and body strong. 🧠", emoji: "⚡", level: "medium" };
  }
  if (pct < 100) {
    return { message: "Almost there! Just a few more cups to reach your goal. 🏆", emoji: "🏆", level: "high" };
  }
  return { message: "🎉 Amazing! You hit your water goal today! Your body thanks you!", emoji: "🎉", level: "complete" };
};

/**
 * Checks if two YYYY-MM-DD date strings are consecutive days.
 * @param {string|null} prevDate
 * @param {string} today
 */
export const isConsecutiveDay = (prevDate, today) => {
  if (!prevDate) return false;
  const prev = new Date(prevDate);
  const curr = new Date(today);
  const diffMs   = curr - prev;
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays === 1;
};

/**
 * Builds a motivational streak message based on current streak count.
 * @param {number} currentStreak
 * @returns {{ message: string, emoji: string }}
 */
export const buildStreakMessage = (currentStreak) => {
  if (currentStreak === 0) {
    return { message: "Start today and build your streak! 💪", emoji: "💪" };
  }
  if (currentStreak === 1) {
    return { message: "Great start! Come back tomorrow to keep it going! 🌱", emoji: "🌱" };
  }
  if (currentStreak < 3) {
    return { message: `${currentStreak} days in a row! You're building a great habit! ⭐`, emoji: "⭐" };
  }
  if (currentStreak < 7) {
    return { message: `${currentStreak} day streak! You're on fire! 🔥`, emoji: "🔥" };
  }
  if (currentStreak < 14) {
    return { message: `${currentStreak} days! One week strong! Keep it up! 🏅`, emoji: "🏅" };
  }
  if (currentStreak < 30) {
    return { message: `${currentStreak} day streak! You're a hygiene superstar! 🌟`, emoji: "🌟" };
  }
  return { message: `${currentStreak} days! You're a true Hygiene Champion! 👑`, emoji: "👑" };
};