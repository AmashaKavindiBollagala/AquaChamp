import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;

const getToken = () =>
  localStorage.getItem("aquachamp_token") ||
  localStorage.getItem("superAdminToken") ||
  sessionStorage.getItem("aquachamp_token");

const api = axios.create({ baseURL: API });
api.interceptors.request.use((cfg) => {
  const t = getToken();
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

const todayStr = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};


//  AUTH GUARD HOOK

function useAuthGuard() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  return !!getToken();
}


// SMART REMINDERS

const REMINDER_HOUR = 20;

function requestNotificationPermission() {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
}

function sendNotification(title, body) {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, { body });
  }
}

function useSmartReminders(activities, logs) {
  useEffect(() => {
    requestNotificationPermission();

    const interval = setInterval(() => {
      const now = new Date();
      const loggedIds = new Set(logs.map((l) => l.activityId?._id || l.activityId));
      const incomplete = activities.filter((a) => !loggedIds.has(a._id));

      if (now.getHours() === 13 && now.getMinutes() === 0) {
        if (incomplete.length > 0) {
          sendNotification(
            "🧼 Reminder",
            `You still have ${incomplete.length} activities left today!`
          );
        }
      }

      if (now.getHours() === REMINDER_HOUR && now.getMinutes() === 0) {
        if (incomplete.length > 0) {
          sendNotification(
            "🌙 End of Day Reminder",
            `You missed ${incomplete.length} activities today.`
          );
        } else {
          sendNotification("🎉 Great Job!", "You completed all activities today!");
        }
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [activities, logs]);
}

//  Streak helpers
const MILESTONES = [3, 7, 14, 30, 60, 100];

function getMotivationMessage(streak) {
  if (streak === 0)  return { msg: "Start today — your streak awaits! 💪", color: "text-white/65" };
  if (streak === 1)  return { msg: "Great start! Come back tomorrow! 🌱", color: "text-emerald-300" };
  if (streak < 3)    return { msg: "Building momentum — keep it up! 🚀", color: "text-emerald-300" };
  if (streak < 7)    return { msg: "You're on a roll! Don't break the chain! 🔗", color: "text-amber-300" };
  if (streak < 14)   return { msg: "One week strong! You're unstoppable! ⚡", color: "text-amber-300" };
  if (streak < 30)   return { msg: "Two weeks! Hygiene hero in the making! 🦸", color: "text-yellow-300" };
  if (streak < 60)   return { msg: "A whole month! You're a legend! 🏆", color: "text-yellow-300" };
  return               { msg: "Incredible dedication! Hall of fame material! 🌟", color: "text-yellow-300" };
}

function getStreakEmoji(streak) {
  if (streak >= 30) return "🏆";
  if (streak >= 14) return "⚡";
  if (streak >= 7)  return "🔥";
  if (streak >= 3)  return "⭐";
  return "💧";
}

function getNextMilestone(streak) {
  return MILESTONES.find((m) => m > streak) ?? null;
}

const MILESTONE_META = {
  3:   { label: "3-Day Spark",    icon: "⭐" },
  7:   { label: "Week Warrior",   icon: "🔥" },
  14:  { label: "Fortnight Hero", icon: "⚡" },
  30:  { label: "Month Master",   icon: "🏆" },
  60:  { label: "60-Day Legend",  icon: "💎" },
  100: { label: "Century Club",   icon: "🌟" },
};

// Toast
function Toast({ msg, type, onClose }) {
  useEffect(() => {
    if (msg) { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }
  }, [msg]);
  if (!msg) return null;
  return (
    <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-extrabold text-sm shadow-2xl
      ${type === "error"
        ? "bg-red-50 border border-red-200 text-red-600"
        : "bg-gradient-to-r from-sky-700 to-emerald-500 text-white"}`}
    >
      {type === "error" ? "❌" : "🎉"} {msg}
    </div>
  );
}

//  Streak Banner 
function StreakBanner({ streak }) {
  if (!streak) return null;
  const { currentStreak, longestStreak } = streak;
  const { msg, color } = getMotivationMessage(currentStreak);
  const nextMilestone  = getNextMilestone(currentStreak);
  const prevMilestone  = MILESTONES.filter((m) => m <= currentStreak).pop() ?? 0;
  const progressPct    = nextMilestone
    ? Math.round(((currentStreak - prevMilestone) / (nextMilestone - prevMilestone)) * 100)
    : 100;
  const earned = MILESTONES.filter((m) => currentStreak >= m);

  return (
    <div className="relative overflow-hidden rounded-3xl p-5 mb-5
      bg-gradient-to-br from-[#042C53] via-[#185FA5] to-[#1D9E75]
      shadow-[0_8px_32px_rgba(4,44,83,0.22)]">
      <div className="absolute -right-5 -top-5 w-24 h-24 rounded-full bg-white/5" />
      <div className="absolute right-10 -bottom-8 w-20 h-20 rounded-full bg-emerald-300/10" />

      <div className="relative flex items-center gap-4 flex-wrap">
        <div className="w-14 h-14 rounded-2xl bg-white/15 border-2 border-amber-300/30 flex items-center justify-center text-3xl shrink-0">
          {getStreakEmoji(currentStreak)}
        </div>
        <div className="flex-1">
          <div className="text-emerald-300 text-[10px] font-extrabold uppercase tracking-[0.2em] mb-1">Your Streak</div>
          <div className="text-white font-black text-2xl leading-tight">
            {currentStreak} Day{currentStreak !== 1 ? "s" : ""} 🔥
          </div>
          <div className={`text-xs mt-1 font-semibold ${color}`}>{msg}</div>
        </div>
        <div className="text-center shrink-0">
          <div className="text-white/50 text-[10px] font-bold uppercase tracking-wider">Best</div>
          <div className="text-amber-300 font-black text-2xl">{longestStreak}</div>
          <div className="text-white/50 text-[10px]">days</div>
        </div>
      </div>

      {nextMilestone && (
        <div className="relative mt-4">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-white/60 text-[10px] font-bold uppercase tracking-wider">
              Next: {MILESTONE_META[nextMilestone]?.icon} {MILESTONE_META[nextMilestone]?.label}
            </span>
            <span className="text-white/60 text-[10px] font-bold">
              {currentStreak}/{nextMilestone} days
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/15 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-300 to-emerald-300 transition-all duration-700"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="text-white/45 text-[10px] mt-1 text-right">
            {nextMilestone - currentStreak} day{nextMilestone - currentStreak !== 1 ? "s" : ""} to go
          </div>
        </div>
      )}

      {earned.length > 0 && (
        <div className="relative mt-4 pt-4 border-t border-white/15">
          <div className="text-white/50 text-[10px] font-extrabold uppercase tracking-[0.15em] mb-2">
            Milestones Earned
          </div>
          <div className="flex gap-2 flex-wrap">
            {earned.map((m) => (
              <div key={m} className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/15 border border-amber-300/30">
                <span className="text-base leading-none">{MILESTONE_META[m]?.icon}</span>
                <span className="text-white text-[10px] font-extrabold">{MILESTONE_META[m]?.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {currentStreak === 0 && (
        <div className="relative mt-4 pt-4 border-t border-white/15 flex items-center gap-2">
          <span className="text-2xl">💧</span>
          <span className="text-white/60 text-xs font-semibold">
            Complete today's activities to start your streak!
          </span>
        </div>
      )}
    </div>
  );
}

//  Points Card 
function PointsCard({ points }) {
  return (
    <div className="bg-gradient-to-br from-amber-50 to-yellow-100 border border-amber-200 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
      <div className="text-4xl">⭐</div>
      <div>
        <div className="text-amber-800 text-[10px] font-extrabold uppercase tracking-widest">Total Points</div>
        <div className="text-amber-600 font-black text-3xl leading-tight">{points?.totalPoints ?? 0}</div>
      </div>
    </div>
  );
}

//  Progress Ring
function ProgressRing({ done, total }) {
  const r = 38;
  const c = 2 * Math.PI * r;
  const pct = total > 0 ? done / total : 0;
  const offset = c - pct * c;

  return (
    <div className="relative w-24 h-24 shrink-0">
      <svg width="96" height="96" className="-rotate-90">
        <circle cx="48" cy="48" r={r} fill="none" stroke="#DBEAFE" strokeWidth="8" />
        <circle
          cx="48" cy="48" r={r} fill="none"
          stroke="url(#pg)" strokeWidth="8"
          strokeDasharray={c} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset .8s ease" }}
        />
        <defs>
          <linearGradient id="pg" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#185FA5" />
            <stop offset="100%" stopColor="#1D9E75" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-black text-lg text-[#042C53] leading-none">{done}</div>
        <div className="text-[10px] text-slate-500 font-semibold">/ {total}</div>
      </div>
    </div>
  );
}

//  User Activity Card 
function UserActivityCard({ activity, isLogged, onLog, logging, onEdit, onDelete }) {
  return (
    <div className={`bg-white rounded-2xl p-4 border-2 transition-all shadow-sm
      ${isLogged
        ? "border-emerald-300 shadow-emerald-100"
        : "border-sky-100 hover:border-sky-300"}`}
    >
      {isLogged && (
        <div className="flex justify-end mb-1">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-sky-600 text-white text-[10px] font-extrabold tracking-wide">
            ✓ DONE
          </span>
        </div>
      )}

      <div className="flex items-start gap-3">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 border transition-all
          ${isLogged
            ? "bg-gradient-to-br from-emerald-100 to-green-100 border-emerald-200"
            : "bg-gradient-to-br from-sky-50 to-blue-100 border-sky-200"}`}
        >{activity.icon}</div>

        <div className="flex-1 min-w-0">
          <div className="font-extrabold text-[#042C53] text-sm">{activity.name}</div>
          <div className="text-slate-400 text-xs mt-0.5 leading-relaxed">
            {activity.description || "Complete this activity to earn points!"}
          </div>
          <div className="flex gap-2 mt-2 flex-wrap">
            <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-sky-50 text-sky-700 text-[11px] font-bold border border-sky-100">
              ⭐ {activity.points} pts
            </span>
            {activity.source === "custom" && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-orange-50 text-orange-600 text-[11px] font-bold border border-orange-100">
                My Activity
              </span>
            )}
          </div>
        </div>

        {activity.source === "custom" && (
          <div className="flex gap-2 shrink-0 ml-2">
            <button
              onClick={() => onEdit(activity)}
              className="w-8 h-8 rounded-xl border border-sky-200 bg-sky-50 text-sky-600 flex items-center justify-center text-sm cursor-pointer hover:bg-sky-600 hover:text-white transition-all"
            >✏️</button>
            <button
              onClick={() => onDelete(activity)}
              className="w-8 h-8 rounded-xl border border-red-200 bg-red-50 text-red-500 flex items-center justify-center text-sm cursor-pointer hover:bg-red-500 hover:text-white transition-all"
            >🗑️</button>
          </div>
        )}
      </div>

      <button
        onClick={() => !isLogged && onLog(activity._id)}
        disabled={isLogged || logging === activity._id}
        className={`mt-3 w-full py-2.5 rounded-2xl border-none font-extrabold text-sm cursor-pointer transition-all
          ${isLogged
            ? "bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 cursor-default"
            : logging === activity._id
              ? "bg-sky-200 text-white cursor-not-allowed"
              : "bg-gradient-to-r from-sky-700 to-emerald-500 text-white shadow-md hover:-translate-y-0.5"}`}
      >
        {isLogged
          ? "✅ Completed Today!"
          : logging === activity._id
            ? "Logging…"
            : "✔ Mark as Done"}
      </button>
    </div>
  );
}

//  Validation helpers 
const NAME_MIN = 3;
const NAME_MAX = 50;
const DESC_MAX = 200;

// Returns true if the string contains at least one real Unicode letter or digit
const hasAlphanumeric = (str) => /[\p{L}\p{N}]/u.test(str);

// Returns true only if every code point in the string is an emoji-related character.
// Rejects plain letters (a-z, A-Z), digits (0-9), punctuation, whitespace, and symbols

const isEmojiChar = (cp) => {
  // Reject ASCII letters, digits, basic punctuation and whitespace outright
  if (cp <= 0x007E) return false;
  // Allow combining/modifier ranges used by emoji sequences
  if (cp === 0x200D) return true;  // ZWJ
  if (cp === 0xFE0F) return true;  // variation selector-16 (emoji presentation)
  if (cp >= 0x1F3FB && cp <= 0x1F3FF) return true; // skin tone modifiers
  if (cp >= 0x1F1E0 && cp <= 0x1F1FF) return true; // regional indicator letters (flags)
  // Core emoji blocks
  if (cp >= 0x2194 && cp <= 0x2199) return true;
  if (cp >= 0x2300 && cp <= 0x23FF) return true;
  if (cp >= 0x2600 && cp <= 0x26FF) return true;
  if (cp >= 0x2700 && cp <= 0x27BF) return true;
  if (cp >= 0x2B00 && cp <= 0x2BFF) return true;
  if (cp >= 0xFE00 && cp <= 0xFE0F) return true; // variation selectors
  if (cp >= 0x1F000 && cp <= 0x1F02F) return true; // Mahjong
  if (cp >= 0x1F0A0 && cp <= 0x1F0FF) return true; // Playing cards
  if (cp >= 0x1F100 && cp <= 0x1F1FF) return true; // Enclosed alphanumeric supplement
  if (cp >= 0x1F200 && cp <= 0x1F2FF) return true; // Enclosed ideographic supplement
  if (cp >= 0x1F300 && cp <= 0x1F5FF) return true; // Misc symbols & pictographs
  if (cp >= 0x1F600 && cp <= 0x1F64F) return true; // Emoticons
  if (cp >= 0x1F680 && cp <= 0x1F6FF) return true; // Transport & map
  if (cp >= 0x1F700 && cp <= 0x1F77F) return true; // Alchemical
  if (cp >= 0x1F780 && cp <= 0x1F7FF) return true; // Geometric shapes extended
  if (cp >= 0x1F800 && cp <= 0x1F8FF) return true; // Supplemental arrows
  if (cp >= 0x1F900 && cp <= 0x1F9FF) return true; // Supplemental symbols & pictographs
  if (cp >= 0x1FA00 && cp <= 0x1FA6F) return true; // Chess symbols
  if (cp >= 0x1FA70 && cp <= 0x1FAFF) return true; // Symbols & pictographs extended-A
  if (cp >= 0x231A && cp <= 0x231B) return true;   // Watch, hourglass
  if (cp >= 0x23E9 && cp <= 0x23F3) return true;   // Various clock/arrow emoji
  if (cp >= 0x25AA && cp <= 0x25AB) return true;
  if (cp >= 0x25FB && cp <= 0x25FE) return true;
  if (cp >= 0x2614 && cp <= 0x2615) return true;
  if (cp >= 0x2648 && cp <= 0x2653) return true;   // Zodiac signs
  return false;
};


const isSingleEmoji = (str) => {
  const trimmed = str.trim();
  if (!trimmed) return false;
  // All code points must be emoji-related
  const codePoints = [...trimmed].map((ch) => ch.codePointAt(0));
  if (!codePoints.every(isEmojiChar)) return false;
  // Must be exactly one grapheme cluster (one "visual" emoji)
  if (typeof Intl !== "undefined" && Intl.Segmenter) {
    const segments = [...new Intl.Segmenter().segment(trimmed)];
    return segments.length === 1;
  }
  return codePoints.length <= 8; // conservative fallback for ZWJ sequences
};


const extractEmoji = (raw, fallback = "") => {
  const trimmed = raw.trim();
  if (!trimmed) return fallback;
  // Split into grapheme clusters, keep only those that are pure emoji
  if (typeof Intl !== "undefined" && Intl.Segmenter) {
    const clusters = [...new Intl.Segmenter().segment(trimmed)].map((s) => s.segment);
    const emojiOnly = clusters.filter((c) => isSingleEmoji(c));
    // Return only the last emoji typed (so user can replace by typing a new one)
    return emojiOnly.length > 0 ? emojiOnly[emojiOnly.length - 1] : fallback;
  }
  // Fallback: check each code point
  const cps = [...trimmed];
  const valid = cps.filter((ch) => isEmojiChar(ch.codePointAt(0)));
  return valid.length > 0 ? valid[valid.length - 1] : fallback;
};

function validateActivityForm(form) {
  const errors = {};

  //  Icon 
  const iconTrimmed = form.icon.trim();
  if (!iconTrimmed) {
    errors.icon = "Please choose an icon.";
  } else if (!isSingleEmoji(iconTrimmed)) {
    errors.icon = "Only a single emoji is allowed — no letters, numbers, or symbols.";
  }

  //  Name 
  const nameTrimmed = form.name.trim();
  if (!nameTrimmed) {
    errors.name = "Activity name is required.";
  } else if (!hasAlphanumeric(nameTrimmed)) {
    errors.name = "Name must contain at least one letter or number.";
  } else if (nameTrimmed.length < NAME_MIN) {
    errors.name = `Name must be at least ${NAME_MIN} characters.`;
  } else if (nameTrimmed.length > NAME_MAX) {
    errors.name = `Name must not exceed ${NAME_MAX} characters.`;
  }

  //  Description (optional but bounded) 
  const descTrimmed = form.description.trim();
  if (descTrimmed.length > DESC_MAX) {
    errors.description = `Description must not exceed ${DESC_MAX} characters.`;
  }

  return errors; 
}

//  Field-level error label 
function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <p className="text-red-500 text-[11px] font-semibold mt-1 flex items-center gap-1">
      <span>⚠️</span> {msg}
    </p>
  );
}

//  Custom Activity Modal 
const ICONS = ["⭐", "🏃", "🥦", "😴", "📖", "🎵", "🧘", "🌳", "🎨", "🐾", "🧩", "💪"];

function CustomActivityModal({ onSave, onClose, loading, initial }) {
  const [form, setForm] = useState({
    name: initial?.name || "",
    description: initial?.description || "",
    icon: initial?.icon || "⭐",
  });
  const [errors, setErrors]   = useState({});
  const [touched, setTouched] = useState({});

  const f = (k) => (e) => {
    setForm((p) => ({ ...p, [k]: e.target.value }));
    // Re-validate the changed field on every keystroke so feedback is instant
    setErrors((prev) => {
      const next = validateActivityForm({ ...form, [k]: e.target.value });
      return { ...prev, [k]: next[k] };
    });
  };

  const markTouched = (k) => setTouched((p) => ({ ...p, [k]: true }));

  const handleIconPick = (ic) => {
    setForm((p) => ({ ...p, icon: ic }));
    setErrors((prev) => {
      const next = validateActivityForm({ ...form, icon: ic });
      return { ...prev, icon: next.icon };
    });
    setTouched((p) => ({ ...p, icon: true }));
  };

  const handleSubmit = () => {
    // Mark all fields touched so every error shows at once
    setTouched({ icon: true, name: true, description: true });
    const errs = validateActivityForm(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    onSave({
      ...form,
      name: form.name.trim(),
      description: form.description.trim(),
      icon: form.icon.trim(),
    });
  };

  const isFormValid = Object.keys(validateActivityForm(form)).length === 0;

  return (
    <div
      className="fixed inset-0 z-[500] bg-[#042C53]/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-3xl p-7 w-full max-w-sm shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-700 to-emerald-500 flex items-center justify-center text-xl text-white shadow-md">
            ✨
          </div>
          <div>
            <h3 className="m-0 text-[#042C53] font-black text-lg">Add My Own Activity</h3>
            <p className="m-0 text-slate-400 text-xs">Create a personal hygiene habit</p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto bg-sky-50 border-none rounded-xl w-8 h-8 cursor-pointer text-base hover:bg-sky-100 transition-colors flex items-center justify-center"
          >✕</button>
        </div>

        {/*  Icon field */}
        <div className="mb-4">
          <label className="block text-[10px] font-extrabold uppercase tracking-[0.12em] text-sky-700 mb-2">
            Pick an Icon <span className="text-red-400">*</span>
          </label>
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center text-2xl shrink-0 transition-all
              ${touched.icon && errors.icon ? "border-red-400 bg-red-50" : "border-sky-200 bg-sky-50"}`}>
              {form.icon}
            </div>
            <div className="flex-1">
              <input
                type="text"
                value={form.icon}
                onChange={(e) => {
                  // Only accept emoji characters — letters, digits, and punctuation are silently blocked
                  const extracted = extractEmoji(e.target.value, form.icon);
                  handleIconPick(extracted);
                }}
                onBlur={() => markTouched("icon")}
                placeholder="Paste an emoji here…"
                className={`w-full rounded-xl border-2 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition
                  ${touched.icon && errors.icon
                    ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                    : "border-sky-100 focus:border-sky-600 focus:ring-4 focus:ring-sky-100"}`}
              />
              <p className="text-[10px] text-slate-400 mt-1">Only emoji accepted — letters &amp; numbers are blocked</p>
            </div>
          </div>
          {touched.icon && <FieldError msg={errors.icon} />}
          <div className="flex flex-wrap gap-1.5">
            {ICONS.map((ic) => (
              <button
                key={ic} type="button"
                onClick={() => handleIconPick(ic)}
                className={`w-10 h-10 rounded-xl text-xl cursor-pointer transition-all border-2
                  ${form.icon === ic
                    ? "border-sky-600 bg-sky-50 scale-110 shadow-sm"
                    : "border-sky-100 bg-gray-50 hover:border-sky-300"}`}
              >{ic}</button>
            ))}
          </div>
        </div>

        {/*  Name field  */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-[10px] font-extrabold uppercase tracking-[0.12em] text-sky-700">
              Activity Name <span className="text-red-400">*</span>
            </label>
            <span className={`text-[10px] font-semibold ${form.name.trim().length > NAME_MAX ? "text-red-500" : "text-slate-400"}`}>
              {form.name.trim().length}/{NAME_MAX}
            </span>
          </div>
          <input
            value={form.name}
            onChange={f("name")}
            onBlur={() => markTouched("name")}
            placeholder="e.g. Evening Stretches"
            maxLength={NAME_MAX + 10} // allow typing over to show the error naturally
            className={`w-full rounded-xl border-2 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition
              ${touched.name && errors.name
                ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                : "border-sky-100 focus:border-sky-600 focus:ring-4 focus:ring-sky-100"}`}
          />
          {touched.name && <FieldError msg={errors.name} />}
        </div>

        {/*  Description field  */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-[10px] font-extrabold uppercase tracking-[0.12em] text-sky-700">
              Description <span className="text-slate-400 normal-case font-normal">(optional)</span>
            </label>
            <span className={`text-[10px] font-semibold ${form.description.trim().length > DESC_MAX ? "text-red-500" : "text-slate-400"}`}>
              {form.description.trim().length}/{DESC_MAX}
            </span>
          </div>
          <textarea
            value={form.description}
            onChange={f("description")}
            onBlur={() => markTouched("description")}
            rows={2}
            placeholder="What does this activity involve?"
            className={`w-full rounded-xl border-2 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition resize-none
              ${touched.description && errors.description
                ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                : "border-sky-100 focus:border-sky-600 focus:ring-4 focus:ring-sky-100"}`}
          />
          {touched.description && <FieldError msg={errors.description} />}
        </div>

        {/*  Actions  */}
        <div className="flex gap-3">
          <button
            type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-2xl border-2 border-sky-100 bg-white text-sky-700 font-extrabold text-sm cursor-pointer hover:bg-sky-50 transition"
          >Cancel</button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className={`flex-1 py-2.5 rounded-2xl border-none font-extrabold text-sm cursor-pointer shadow-lg transition
              ${!isFormValid
                ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                : "bg-gradient-to-r from-sky-700 to-emerald-500 text-white hover:-translate-y-0.5"}`}
          >{loading ? "Adding…" : "✨ Add Activity"}</button>
        </div>
      </div>
    </div>
  );
}


//  NOT LOGGED IN SCREEN

function NotLoggedIn() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#EAF5FF] flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl p-10 max-w-sm w-full text-center shadow-xl border border-sky-100">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-[#042C53] font-black text-2xl mb-2">Login Required</h2>
        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
          You need to be logged in to view and track your activities.
        </p>
        <button
          onClick={() => navigate("/login")}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-sky-700 to-emerald-500 text-white font-extrabold text-base shadow-lg hover:-translate-y-0.5 transition border-none cursor-pointer"
        >
          🚀 Go to Login
        </button>
        <button
          onClick={() => navigate("/")}
          className="mt-3 w-full py-3 rounded-2xl border-2 border-sky-100 bg-white text-sky-700 font-extrabold text-sm cursor-pointer hover:bg-sky-50 transition"
        >
          🏠 Back to Home
        </button>
      </div>
    </div>
  );
}

//  Main User View 
export default function UserActivityView() {
  //  AUTH GUARD — must be first 
  const isAuthenticated = useAuthGuard();

  const [activities,   setActivities]   = useState([]);
  const [logs,         setLogs]         = useState([]);
  const [streak,       setStreak]       = useState(null);
  const [points,       setPoints]       = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [logging,      setLogging]      = useState(null);
  const [showCustom,   setShowCustom]   = useState(false);
  const [savingCustom, setSavingCustom] = useState(false);
  const [toast,        setToast]        = useState({ msg: "", type: "success" });
  const [tab,          setTab]          = useState("today");
  const [editActivity, setEditActivity] = useState(null);
  const today = todayStr();

  const showToast = (msg, type = "success") => setToast({ msg, type });

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [actRes, logRes, streakRes, ptsRes] = await Promise.allSettled([
        api.get("/api/activities/"),
        api.get(`/api/activities/logs?date=${today}`),
        api.get("/api/activities/streak"),
        api.get("/api/amasha-points/me"),
      ]);
      if (actRes.status    === "fulfilled") setActivities(actRes.value.data.data || []);
      if (logRes.status    === "fulfilled") setLogs(logRes.value.data.data || []);
      if (streakRes.status === "fulfilled") setStreak(streakRes.value.data);
      if (ptsRes.status    === "fulfilled") setPoints(ptsRes.value.data.data);
    } catch {
      showToast("Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  }, [today]);

  useEffect(() => {
    // Only fetch data if authenticated
    if (isAuthenticated) loadAll();
  }, [loadAll, isAuthenticated]);

  useSmartReminders(activities, logs);

  // If not authenticated, show the lock screen 
  if (!isAuthenticated) return <NotLoggedIn />;

  const loggedIds = new Set(logs.map((l) => l.activityId?._id || l.activityId));

  const handleLog = async (activityId) => {
    setLogging(activityId);
    try {
      const { data } = await api.post("/api/activities/log", { activityId, date: today });
      showToast(`+${data.pointsEarned} points! ${data.bonusAwarded ? "🏆 Bonus earned!" : "Keep going!"}`);
      await loadAll();
    } catch (e) {
      const msg = e.response?.data?.message;
      if (msg?.includes("already logged")) showToast("Already logged today!", "error");
      else showToast(msg || "Error logging activity", "error");
    } finally {
      setLogging(null);
    }
  };

  const handleCreateCustom = async (form) => {
    setSavingCustom(true);
    try {
      await api.post("/api/activities/custom", form);
      showToast("Custom activity added! ✨");
      setShowCustom(false);
      await loadAll();
    } catch (e) {
      showToast(e.response?.data?.message || "Error", "error");
    } finally {
      setSavingCustom(false);
    }
  };

  const handleEditCustom = async (form) => {
    setSavingCustom(true);
    try {
      await api.put(`/api/activities/${editActivity._id}`, form);
      showToast("Activity updated ✅");
      setEditActivity(null);
      await loadAll();
    } catch (e) {
      showToast(e.response?.data?.message || "Error", "error");
    } finally {
      setSavingCustom(false);
    }
  };

  const handleDeleteCustom = async (activity) => {
    if (!window.confirm(`Delete "${activity.name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/api/activities/${activity._id}`);
      showToast("Activity deleted 🗑️");
      await loadAll();
    } catch {
      showToast("Error deleting activity", "error");
    }
  };

  const customActivities = activities.filter((a) => a.source === "custom");
  const doneToday = activities.filter((a) => loggedIds.has(a._id)).length;
  const allDone   = doneToday === activities.length && activities.length > 0;

  const tabActivities =
    tab === "custom"    ? customActivities :
    tab === "today"     ? activities.filter((a) => !loggedIds.has(a._id)) :
    tab === "completed" ? activities.filter((a) =>  loggedIds.has(a._id)) :
    activities;

  const TABS = [
    { id: "today",     label: `To Do (${activities.filter((a) => !loggedIds.has(a._id)).length})` },
    { id: "completed", label: `Done (${activities.filter((a) =>  loggedIds.has(a._id)).length})` },
    { id: "all",       label: `All (${activities.length})` },
    { id: "custom",    label: `My Own (${customActivities.length})` },
  ];

  return (
    <div className="min-h-screen bg-[#EAF5FF] pb-8">
      <Toast msg={toast.msg} type={toast.type} onClose={() => setToast({ msg: "" })} />

      {showCustom && (
        <CustomActivityModal
          onSave={handleCreateCustom}
          onClose={() => setShowCustom(false)}
          loading={savingCustom}
        />
      )}
      {editActivity && (
        <CustomActivityModal
          initial={editActivity}
          onSave={handleEditCustom}
          onClose={() => setEditActivity(null)}
          loading={savingCustom}
        />
      )}

      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#042C53] via-[#185FA5] to-[#1D9E75] px-5 pt-5 pb-20">
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/5" />
        <div className="absolute -left-5 bottom-0 w-24 h-24 rounded-full bg-emerald-300/10" />
        <div className="relative flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white/15 border-2 border-cyan-400/30 flex items-center justify-center text-2xl">
            🧼
          </div>
          <div>
            <div className="text-white font-black text-lg">My Activities</div>
            <div className="text-white/55 text-xs font-semibold">{today}</div>
          </div>
          <button
            onClick={() => setShowCustom(true)}
            className="ml-auto px-4 py-2 rounded-2xl border border-white/30 bg-white/12 text-white font-extrabold text-xs cursor-pointer backdrop-blur-sm hover:bg-white/20 transition"
          >+ My Activity</button>
        </div>
      </div>

      {/* Content — overlaps header */}
      <div className="mx-4 -mt-14 relative z-10 flex flex-col gap-4">

        {/* Progress + Points row */}
        <div className="flex gap-3">
          <div className="flex-1 bg-white rounded-3xl p-4 flex items-center gap-4 shadow-lg border border-sky-100">
            <ProgressRing done={doneToday} total={activities.length} />
            <div>
              <div className="text-slate-400 text-[10px] font-extrabold uppercase tracking-widest">Today</div>
              <div className="text-[#042C53] font-black text-xl leading-tight mt-0.5">
                {allDone ? "All Done! 🎉" : `${doneToday} Done`}
              </div>
              <div className="text-slate-400 text-xs mt-0.5">{activities.length - doneToday} remaining</div>
              {allDone && (
                <div className="text-emerald-600 text-[11px] font-bold mt-1">+20 bonus pts! 🏆</div>
              )}
            </div>
          </div>
          <PointsCard points={points} />
        </div>

        {/* Streak banner */}
        <StreakBanner streak={streak?.data} />

        {/* Tabs */}
        <div className="bg-white rounded-2xl p-1.5 flex gap-1 shadow-sm border border-sky-100">
          {TABS.map((t) => (
            <button
              key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 py-2.5 rounded-xl border-none font-extrabold text-xs cursor-pointer transition-all
                ${tab === t.id
                  ? "bg-gradient-to-r from-sky-700 to-emerald-500 text-white shadow-md"
                  : "bg-transparent text-slate-500 hover:text-sky-700"}`}
            >{t.label}</button>
          ))}
        </div>

        {/* Activity list */}
        {loading ? (
          <div className="text-center py-12 text-slate-400">
            <div className="text-4xl mb-2">⏳</div>
            <p className="font-semibold">Loading your activities…</p>
          </div>
        ) : tabActivities.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-sky-100">
            <div className="text-5xl mb-3">
              {tab === "today" ? "🎉" : tab === "custom" ? "✨" : "🧼"}
            </div>
            <div className="font-extrabold text-[#042C53] text-lg">
              {tab === "today"     ? "All done for today!"           :
               tab === "completed" ? "No completed activities yet"   :
               tab === "custom"    ? "No custom activities yet"      : "No activities found"}
            </div>
            <div className="text-slate-400 text-sm mt-2 leading-relaxed max-w-xs mx-auto">
              {tab === "today"
                ? "Amazing work! You completed all your hygiene activities! 🏆"
                : tab === "completed"
                  ? "Complete some activities to see them here!"
                  : tab === "custom"
                    ? "Add your own personal habits to track alongside the system activities."
                    : "No activities available right now."}
            </div>
            {tab === "custom" && (
              <button
                onClick={() => setShowCustom(true)}
                className="mt-5 px-6 py-2.5 rounded-2xl border-none bg-gradient-to-r from-sky-700 to-emerald-500 text-white font-extrabold text-sm cursor-pointer shadow-lg hover:-translate-y-0.5 transition"
              >✨ Add My First Activity</button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {tabActivities.map((a) => (
              <UserActivityCard
                key={a._id}
                activity={a}
                isLogged={loggedIds.has(a._id)}
                onLog={handleLog}
                logging={logging}
                onEdit={setEditActivity}
                onDelete={handleDeleteCustom}
              />
            ))}
          </div>
        )}

        {/* Daily tip */}
        <div className="bg-gradient-to-br from-sky-50 to-blue-100 rounded-2xl p-4 border border-sky-200 flex gap-3 items-start">
          <div className="text-3xl shrink-0">💡</div>
          <div>
            <div className="font-extrabold text-sky-800 text-sm">Daily Hygiene Tip</div>
            <div className="text-sky-600 text-xs mt-1 leading-relaxed">
              Wash your hands for at least <strong>20 seconds</strong> with soap — it removes 99% of germs! 🦠
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}