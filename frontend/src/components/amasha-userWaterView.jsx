import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

const WEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_KEY;

const getToken = () =>
  localStorage.getItem("aquachamp_token") ||
  sessionStorage.getItem("aquachamp_token");

// 
//  Auth Guard Hook — redirects to /login if no token found
// 
function useAuthGuard(redirectTo = "/login") {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      window.location.replace(redirectTo);
    } else {
      setChecking(false);
    }
  }, [redirectTo]);

  return checking;
}

const api = axios.create({ baseURL: API });
api.interceptors.request.use((cfg) => {
  const t = getToken();
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});


const todayStr = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Colombo" });

// 
//  Weather Hook
// 
function useWeather() {
  const [weather, setWeather] = useState(null);
  const [error,   setError]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (WEATHER_API_KEY === "YOUR_OPENWEATHER_API_KEY") {
      setLoading(false);
      return;
    }

    const fetchWeather = async (lat, lon) => {
      try {
        const res  = await fetch(
          `https://api.openweathermap.org/data/2.5/weather` +
          `?lat=${lat}&lon=${lon}&units=metric&appid=${WEATHER_API_KEY}`
        );
        const data = await res.json();
        if (data.cod !== 200) throw new Error(data.message);
        setWeather(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => fetchWeather(coords.latitude, coords.longitude),
        ()           => fetchWeather(6.9271, 79.8612)
      );
    } else {
      fetchWeather(6.9271, 79.8612);
    }
  }, []);

  const temp        = weather ? Math.round(weather.main?.temp)        : null;
  const feelsLike   = weather ? Math.round(weather.main?.feels_like)  : null;
  const humidity    = weather ? weather.main?.humidity                 : null;
  const windSpeed   = weather ? Math.round(weather.wind?.speed * 3.6) : null;
  const description = weather ? weather.weather?.[0]?.description      : null;
  const icon        = weather ? weather.weather?.[0]?.icon             : null;
  const cityName    = weather ? weather.name                           : null;
  const condition   = weather ? weather.weather?.[0]?.main            : null;

  const isHot     = temp     !== null && temp     >= 30;
  const isVeryHot = temp     !== null && temp     >= 35;
  const isHumid   = humidity !== null && humidity >= 70;
  const isWindy   = windSpeed !== null && windSpeed >= 30;
  const isRaining = condition === "Rain" || condition === "Drizzle" || condition === "Thunderstorm";
  const isSunny   = condition === "Clear";
  const isFoggy   = condition === "Fog"  || condition === "Mist" || condition === "Haze";
  const isSandy   = condition === "Dust" || condition === "Sand" || condition === "Ash";

  const waterAdvice = (() => {
    if (!weather) return null;
    let extra = 0;
    const reasons = [];
    if (isVeryHot)         { extra += 3; reasons.push("extreme heat"); }
    else if (isHot)        { extra += 2; reasons.push("hot weather"); }
    if (isHumid)           { extra += 1; reasons.push("high humidity"); }
    if (isWindy)           { extra += 1; reasons.push("strong winds (dehydrating)"); }
    return { extraCups: extra, reason: reasons.length ? reasons.join(" + ") : null };
  })();

  const hygieneReminders = (() => {
    if (!weather) return [];
    const tips = [];
    if (isVeryHot || isHot) {
      tips.push({ emoji: "🚿", tip: "Shower after outdoor activity — heat makes you sweat more." });
      tips.push({ emoji: "🧴", tip: "Apply sunscreen — UV index is high in hot, clear conditions." });
    }
    if (isHumid) {
      tips.push({ emoji: "👕", tip: "Change clothes more often — humidity promotes bacterial growth." });
      tips.push({ emoji: "🦶", tip: "Keep feet dry; humidity increases fungal infection risk." });
    }
    if (isRaining) {
      tips.push({ emoji: "👟", tip: "Dry wet shoes completely before next use to prevent mold." });
      tips.push({ emoji: "🤧", tip: "Wash hands frequently — rain splashes can carry contaminants." });
    }
    if (isSunny && isHot) {
      tips.push({ emoji: "🕶️", tip: "Protect your eyes — UV is intense on clear sunny days." });
    }
    if (isFoggy) {
      tips.push({ emoji: "😷", tip: "Consider a mask outdoors — fog can carry pollutants." });
    }
    if (isSandy) {
      tips.push({ emoji: "🌬️", tip: "Rinse eyes and nose after going outside — dust is in the air." });
    }
    if (isWindy) {
      tips.push({ emoji: "💧", tip: "Lips dry out fast in wind — drink water and use lip balm." });
    }
    return tips;
  })();

  return {
    weather, loading, error,
    temp, feelsLike, humidity, windSpeed, description, icon, cityName, condition,
    isHot, isVeryHot, isHumid, isWindy, isRaining, isSunny, isFoggy, isSandy,
    waterAdvice, hygieneReminders,
  };
}

// 
//  Weather Card
// 
function WeatherCard({ wx }) {
  if (wx.loading) {
    return (
      <div className="bg-white rounded-2xl border border-sky-100 shadow-sm p-4 flex items-center gap-3 text-slate-400 text-sm">
        <div className="w-5 h-5 rounded-full border-2 border-sky-300 border-t-sky-600 animate-spin" />
        Fetching weather…
      </div>
    );
  }

  if (!wx.weather) {
    return (
      <div className="bg-amber-50 rounded-2xl border border-amber-200 shadow-sm p-3 text-xs text-amber-700 font-semibold flex items-center gap-2">
        ⚠️ Add your OpenWeather API key to enable weather features.
      </div>
    );
  }

  const bgClass = wx.isVeryHot
    ? "from-orange-500 to-red-500"
    : wx.isHot
      ? "from-amber-400 to-orange-400"
      : wx.isRaining
        ? "from-slate-500 to-blue-600"
        : wx.isSunny
          ? "from-sky-400 to-blue-500"
          : "from-sky-500 to-indigo-500";

  return (
    <div className={`bg-gradient-to-br ${bgClass} rounded-2xl shadow-sm p-4 text-white`}>
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="font-black text-2xl leading-none">{wx.temp}°C</div>
          <div className="text-white/80 text-[10px] font-semibold capitalize mt-0.5">
            {wx.description} · {wx.cityName}
          </div>
        </div>
        {wx.icon && (
          <img
            src={`https://openweathermap.org/img/wn/${wx.icon}@2x.png`}
            alt={wx.description}
            className="w-14 h-14 -mt-2 -mr-2"
          />
        )}
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {[
          { icon: "🌡️", label: `Feels ${wx.feelsLike}°C` },
          { icon: "💧", label: `${wx.humidity}% humidity` },
          { icon: "💨", label: `${wx.windSpeed} km/h` },
        ].map((s) => (
          <span key={s.label} className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold">
            {s.icon} {s.label}
          </span>
        ))}
      </div>
      {wx.waterAdvice?.extraCups > 0 && (
        <div className="mt-2.5 bg-white/20 rounded-xl p-2.5 flex items-start gap-2">
          <span className="text-base shrink-0">🚰</span>
          <div>
            <div className="font-extrabold text-xs">Drink +{wx.waterAdvice.extraCups} extra cups today</div>
            <div className="text-[10px] text-white/80 mt-0.5 leading-snug">Due to {wx.waterAdvice.reason}</div>
          </div>
        </div>
      )}
    </div>
  );
}

// 
//  Hygiene Panel
// 
function HygienePanel({ reminders }) {
  if (!reminders || reminders.length === 0) return null;
  return (
    <div className="bg-white rounded-2xl border border-sky-100 shadow-sm p-4">
      <div className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-slate-400 mb-2">
        🧼 Hygiene Tips for Today's Weather
      </div>
      <div className="flex flex-col gap-2">
        {reminders.map((r, i) => (
          <div key={i} className="flex items-start gap-2 p-2.5 rounded-xl bg-sky-50 border border-sky-100">
            <span className="text-base shrink-0">{r.emoji}</span>
            <span className="text-[11px] text-sky-800 font-semibold leading-snug">{r.tip}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// 
//  Weather Badge
// 
function WeatherBadge({ wx }) {
  if (wx.loading || !wx.weather) return null;
  const badgeClass = wx.isVeryHot
    ? "bg-red-50 border-red-200 text-red-700"
    : wx.isHot
      ? "bg-amber-50 border-amber-200 text-amber-700"
      : "bg-sky-50 border-sky-200 text-sky-700";
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold ${badgeClass}`}>
      {wx.icon && (
        <img src={`https://openweathermap.org/img/wn/${wx.icon}.png`} alt="" className="w-5 h-5 shrink-0" />
      )}
      <span>{wx.temp}°C · {wx.cityName}</span>
      {wx.isVeryHot && <span>🔥 Very hot!</span>}
      {wx.isHot && !wx.isVeryHot && <span>🌡️ Drink more!</span>}
      {wx.isRaining && <span>🌧️ Rainy</span>}
    </div>
  );
}

// 
// Ring Progress
// 
function RingProgress({ pct, cups, goal, isHot }) {
  const r    = 56;
  const circ = 2 * Math.PI * r;
  const dash = circ * Math.min(pct / 100, 1);
  const color =
    pct >= 100 ? "#10b981" : pct >= 60 ? "#0ea5e9" : pct >= 30 ? "#38bdf8" : "#cbd5e1";

  return (
    <div className="relative flex items-center justify-center w-36 h-36 mx-auto">
      <svg width="144" height="144" className="-rotate-90">
        <circle cx="72" cy="72" r={r} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="9" />
        <circle
          cx="72" cy="72" r={r} fill="none"
          stroke={color} strokeWidth="9"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.8s cubic-bezier(0.4,0,0.2,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <div className="text-4xl font-black text-white leading-none">{cups}</div>
        <div className="text-white/60 font-semibold text-xs mt-0.5">of {goal} cups</div>
        <div className={`text-sm font-black mt-0.5 ${pct >= 100 ? "text-emerald-300" : "text-sky-200"}`}>
          {pct}%
        </div>
        {isHot && <div className="text-[9px] text-amber-300 font-bold mt-0.5">🌡️ Hot day!</div>}
      </div>
    </div>
  );
}

// 
// Cup Button
// 
function CupButton({ index, cups, goal, onSet }) {
  const [hover, setHover] = useState(false);
  const isFilled    = index < cups;
  const isNextEmpty = index === cups;

  return (
    <button
      onClick={() => onSet(isFilled ? index : index + 1)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title={isFilled ? `Remove to ${index} cups` : `Set to ${index + 1} cups`}
      className={`relative w-12 h-14 rounded-xl border-2 flex items-center justify-center text-2xl cursor-pointer transition-all duration-300
        ${isFilled
          ? hover
            ? "bg-red-50 border-red-300 scale-105 shadow-md"
            : "bg-sky-100 border-sky-400 scale-105 shadow-md"
          : isNextEmpty
            ? "bg-sky-50 border-sky-300 animate-pulse"
            : "bg-white border-slate-200 hover:border-sky-300 hover:scale-105"}`}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {isFilled ? (hover ? "🗑️" : "💧") : (isNextEmpty ? "➕" : "🫙")}
      {isFilled && !hover && (
        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-sky-500 text-white text-[9px] font-black flex items-center justify-center">✓</span>
      )}
      {isFilled && hover && (
        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-400 text-white text-[9px] font-black flex items-center justify-center">−</span>
      )}
    </button>
  );
}

// 
// Edit Cups Modal
// 
function EditCupsModal({ current, goal, onSave, onClose, loading }) {
  const [value, setValue] = useState(current);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#042C53]/50 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-3xl p-7 w-full max-w-xs shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="m-0 text-[#042C53] font-black text-lg">Edit Today's Cups</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-sky-50 border-none text-sky-600 cursor-pointer flex items-center justify-center hover:bg-sky-100 transition font-bold">✕</button>
        </div>
        <div className="flex flex-col gap-4">
          <div className="text-center">
            <div className="text-5xl font-black text-[#042C53] leading-none">{value}</div>
            <div className="text-slate-400 text-xs font-semibold mt-1">of {goal} cups goal</div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setValue((v) => Math.max(0, v - 1))}
              disabled={value === 0}
              className="w-12 h-12 rounded-2xl border-2 border-sky-200 bg-sky-50 text-sky-700 font-black text-xl cursor-pointer hover:bg-sky-700 hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
            >−</button>
            <input
              type="range" min={0} max={goal + 3} step={1} value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              className="flex-1"
            />
            <button
              onClick={() => setValue((v) => Math.min(goal + 3, v + 1))}
              className="w-12 h-12 rounded-2xl border-2 border-emerald-200 bg-emerald-50 text-emerald-700 font-black text-xl cursor-pointer hover:bg-emerald-600 hover:text-white transition flex items-center justify-center"
            >+</button>
          </div>
          <div className="flex gap-2 flex-wrap justify-center">
            {[0,1,2,3,4,5,6,7,8].filter((n) => n <= goal + 2).map((n) => (
              <button
                key={n}
                onClick={() => setValue(n)}
                className={`w-9 h-9 rounded-xl border-2 text-sm font-extrabold cursor-pointer transition
                  ${value === n ? "border-sky-700 bg-sky-700 text-white" : "border-sky-100 bg-white text-sky-700 hover:border-sky-400"}`}
              >{n}</button>
            ))}
          </div>
          <div className="flex gap-3 mt-1">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-2xl border-2 border-sky-100 bg-white text-sky-700 font-extrabold text-sm cursor-pointer hover:bg-sky-50 transition">Cancel</button>
            <button
              onClick={() => onSave(value)}
              disabled={loading}
              className="flex-1 py-2.5 rounded-2xl border-none bg-gradient-to-r from-sky-700 to-emerald-500 text-white font-extrabold text-sm cursor-pointer shadow-lg hover:-translate-y-0.5 transition disabled:opacity-50"
            >{loading ? "Saving…" : "💾 Save"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 
// Encouragement Banner
// 
function EncouragementBanner({ msg, emoji, level }) {
  const styles = {
    complete: "bg-emerald-50 border-emerald-200 text-emerald-700",
    high:     "bg-sky-50 border-sky-200 text-sky-700",
    medium:   "bg-blue-50 border-blue-200 text-blue-700",
    low:      "bg-slate-50 border-slate-200 text-slate-600",
  };
  return (
    <div className={`flex items-center gap-3 p-4 rounded-2xl border font-semibold text-sm ${styles[level] || styles.low}`}>
      <span className="text-2xl shrink-0">{emoji}</span>
      <span>{msg}</span>
    </div>
  );
}

// 
// History Row
// 
function HistoryRow({ day }) {
  const progress = Math.min(100, Math.round((day.cupsConsumed / day.dailyGoalCups) * 100));
  const color    = day.goalMet
    ? "from-emerald-400 to-teal-400"
    : progress >= 60
      ? "from-sky-400 to-cyan-400"
      : "from-slate-200 to-slate-300";

  return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-24 text-xs font-semibold text-slate-400 shrink-0">{day.date}</div>
      <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-700`} style={{ width: `${progress}%` }} />
      </div>
      <div className="w-20 text-right text-xs font-bold text-slate-500 shrink-0">
        {day.cupsConsumed}/{day.dailyGoalCups} {day.goalMet ? "✅" : ""}
      </div>
    </div>
  );
}

// 
//   Auth Loading Screen
// 
function AuthCheckScreen() {
  return (
    <div className="h-screen bg-[#EAF5FF] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-slate-400">
        <div className="w-8 h-8 rounded-full border-4 border-sky-200 border-t-sky-600 animate-spin" />
        <span className="text-sm font-semibold">Checking session…</span>
      </div>
    </div>
  );
}

// 
//   Main User View
// 
export default function UserWaterView() {
  // 🔒 Auth guard — redirects to /login if no token
  const authChecking = useAuthGuard("/login");

  const [today,    setToday]    = useState(null);
  const [history,  setHistory]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [adding,   setAdding]   = useState(false);
  const [removing, setRemoving] = useState(false);
  const [setting,  setSetting]  = useState(false);
  const [toast,    setToast]    = useState(null);
  const [tab,      setTab]      = useState("today");
  const [showEdit, setShowEdit] = useState(false);

  const wx = useWeather();

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadToday = useCallback(async () => {
    try {
      const { data } = await api.get("/api/water/today");
      setToday(data);
    } catch (e) {
      // If 401 Unauthorized, redirect to login
      if (e.response?.status === 401) {
        localStorage.removeItem("aquachamp_token");
        sessionStorage.removeItem("aquachamp_token");
        window.location.replace("/login");
        return;
      }
      showToast(e.response?.data?.message || "Could not load water data", "error");
    }
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      const { data } = await api.get("/api/water/history?days=7");
      setHistory(data.data);
    } catch { /* silent */ }
  }, []);

  const init = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadToday(), loadHistory()]);
    setLoading(false);
  }, [loadToday, loadHistory]);

  useEffect(() => {
    // Only fetch data once auth check passes
    if (!authChecking) init();
  }, [authChecking, init]);

  //  Auto-refresh when Sri Lanka date changes (midnight rollover)
  useEffect(() => {
    let lastDate = todayStr();
    const interval = setInterval(() => {
      const newDate = todayStr();
      if (newDate !== lastDate) {
        lastDate = newDate;
        init();
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [init]);

  const handleAddCup = async () => {
    if (adding) return;
    setAdding(true);
    try {
      const { data } = await api.patch("/api/water/log/add-cup");
      showToast(data.message || "Cup added! 💧");
      await loadToday(); await loadHistory();
    } catch (e) {
      if (e.response?.status === 401) { window.location.replace("/login"); return; }
      showToast(e.response?.data?.message || "Error adding cup", "error");
    } finally { setAdding(false); }
  };

  const handleRemoveCup = async () => {
    if (removing) return;
    setRemoving(true);
    try {
      const { data } = await api.patch("/api/water/log/remove-cup");
      showToast(data.message || "Cup removed");
      await loadToday(); await loadHistory();
    } catch (e) {
      if (e.response?.status === 401) { window.location.replace("/login"); return; }
      showToast(e.response?.data?.message || "Error removing cup", "error");
    } finally { setRemoving(false); }
  };

  const handleSetCups = async (cups) => {
    if (setting) return;
    setSetting(true);
    try {
      let logId = today?.data?.logId;
      if (!logId) {
        const { data: created } = await api.post("/api/water/log", { cupsConsumed: 0 });
        logId = created.data._id;
      }
      if (!logId) { showToast("Could not find or create today's log", "error"); return; }
      const { data } = await api.patch(`/api/water/log/${logId}/set`, { cupsConsumed: cups });
      showToast(data.message || `Set to ${cups} cups! 💧`);
      await loadToday(); await loadHistory();
    } catch (e) {
      if (e.response?.status === 401) { window.location.replace("/login"); return; }
      showToast(e.response?.data?.message || "Error setting cups", "error");
    } finally { setSetting(false); setShowEdit(false); }
  };

  const handleDeleteLog = async () => {
    const logId = today?.data?.logId;
    if (!logId) return;
    if (!window.confirm("Reset today's water log to 0? This cannot be undone.")) return;
    try {
      await api.delete(`/api/water/log/${logId}`);
      showToast("Today's log deleted");
      await loadToday(); await loadHistory();
    } catch (e) {
      if (e.response?.status === 401) { window.location.replace("/login"); return; }
      showToast(e.response?.data?.message || "Error deleting log", "error");
    }
  };

  // Show auth-checking spinner while verifying token (prevents flash of content)
  if (authChecking) return <AuthCheckScreen />;

  const data      = today?.data;
  const enc       = today?.encouragement;
  const cups      = data?.cupsConsumed  ?? 0;
  const goal      = data?.dailyGoalCups ?? 5;
  const progress  = data?.percentComplete ?? 0;
  const ageGroup  = data?.ageGroup ?? "5-10";
  const gridCount = Math.max(goal, cups) + 1;

  const extraCups    = wx.waterAdvice?.extraCups ?? 0;
  const adjustedGoal = goal + extraCups;

  //  Human-readable date using Intl — correct Sri Lanka time
  const displayDate = new Date().toLocaleDateString("en-US", {
    timeZone: "Asia/Colombo",
    weekday: "long",
    month:   "long",
    day:     "numeric",
  });

  return (
    <div className="h-screen bg-[#EAF5FF] flex flex-col overflow-hidden">

      {showEdit && (
        <EditCupsModal
          current={cups} goal={goal}
          onSave={handleSetCups} onClose={() => setShowEdit(false)} loading={setting}
        />
      )}

      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl font-bold text-sm shadow-2xl border
          ${toast.type === "error" ? "bg-red-50 border-red-200 text-red-600" : "bg-emerald-50 border-emerald-200 text-emerald-700"}`}>
          {toast.type === "error" ? "❌" : "✅"} {toast.msg}
        </div>
      )}

      {/* ── Top bar ── */}
      <div className="shrink-0 flex items-center justify-between px-6 py-3 bg-white border-b border-sky-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#042C53] to-[#1D9E75] flex items-center justify-center text-white font-black text-base">
            💧
          </div>
          <div>
            <div className="font-black text-[#042C53] text-base leading-tight">Water Tracker</div>
            <div className="text-slate-400 text-[10px] font-semibold">{displayDate}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <WeatherBadge wx={wx} />
          <span className="px-3 py-1.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 text-xs font-bold">
            🧒 Age {ageGroup}
          </span>
        </div>
      </div>

      {/* ── Main grid ── */}
      <div className="flex-1 grid grid-cols-2 gap-4 p-4 min-h-0">

        {/* ── LEFT COLUMN ── */}
        <div className="flex flex-col gap-3 min-h-0">

          <div className="bg-gradient-to-b from-[#042C53] via-[#185FA5] to-[#1D9E75] rounded-2xl p-4 flex flex-col items-center justify-center flex-1">
            {loading ? (
              <div className="w-10 h-10 rounded-full border-4 border-white/30 border-t-white animate-spin my-8" />
            ) : (
              <>
                <RingProgress pct={progress} cups={cups} goal={goal} isHot={wx.isHot} />
                {extraCups > 0 && (
                  <div className="mt-1 px-3 py-1 rounded-full bg-amber-400/30 border border-amber-300/40 text-amber-200 text-[10px] font-extrabold text-center">
                    🌡️ Aim for {adjustedGoal} cups today (weather-adjusted)
                  </div>
                )}
              </>
            )}

            <div className="mt-3 w-full flex gap-2">
              <button
                onClick={handleRemoveCup}
                disabled={removing || loading || cups === 0}
                className="flex-1 py-2.5 rounded-2xl bg-white/10 border border-white/20 text-white font-extrabold text-sm cursor-pointer hover:bg-white/20 transition active:scale-95 disabled:opacity-30 backdrop-blur-sm"
              >{removing ? "…" : "− Remove"}</button>
              <button
                onClick={handleAddCup}
                disabled={adding || loading}
                className="flex-1 py-2.5 rounded-2xl bg-white/20 border border-white/30 text-white font-extrabold text-sm cursor-pointer hover:bg-white/30 transition active:scale-95 disabled:opacity-50 backdrop-blur-sm"
              >{adding ? "Adding…" : "+ Add Cup"}</button>
            </div>

            <div className="mt-2 w-full flex gap-2">
              <button
                onClick={() => setShowEdit(true)}
                disabled={loading}
                className="flex-1 py-2 rounded-2xl bg-white/10 border border-white/20 text-white/80 font-bold text-xs cursor-pointer hover:bg-white/20 transition active:scale-95 disabled:opacity-30 backdrop-blur-sm"
              >✏️ Edit</button>
              <button
                onClick={handleDeleteLog}
                disabled={loading || !data?.logId}
                className="flex-1 py-2 rounded-2xl bg-red-400/20 border border-red-300/30 text-red-200 font-bold text-xs cursor-pointer hover:bg-red-400/40 transition active:scale-95 disabled:opacity-30 backdrop-blur-sm"
              >🗑️ Reset</button>
            </div>
          </div>

          {enc ? (
            <EncouragementBanner msg={enc.message} emoji={enc.emoji} level={enc.level} />
          ) : (
            <div className="bg-sky-50 border border-sky-100 rounded-2xl p-3 flex items-center gap-2 text-sky-600 text-xs font-semibold">
              <span className="text-lg">💧</span> Stay hydrated — every cup counts!
            </div>
          )}

          {!loading && data && (
            <div className="grid grid-cols-3 gap-2 shrink-0">
              {[
                { icon: "💧", label: "Drunk",    value: `${cups}` },
                { icon: "🎯", label: "Goal",     value: `${goal}` },
                { icon: "📈", label: "Progress", value: `${progress}%` },
              ].map((item) => (
                <div key={item.label} className="bg-white rounded-xl border border-sky-100 p-2 text-center shadow-sm">
                  <div className="text-base">{item.icon}</div>
                  <div className="font-black text-[#042C53] text-sm leading-tight">{item.value}</div>
                  <div className="text-[9px] text-slate-400 font-semibold mt-0.5 uppercase tracking-wide">{item.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/*  RIGHT COLUMN  */}
        <div className="flex flex-col gap-3 min-h-0">

          <WeatherCard wx={wx} />

          {!loading && (
            <div className="bg-white rounded-2xl border border-sky-100 shadow-sm p-4 shrink-0">
              <div className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-slate-400 mb-1">
                Tap 💧 to remove · tap 🫙 to add
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {Array.from({ length: gridCount }, (_, i) => (
                  <CupButton key={i} index={i} cups={cups} goal={goal} onSet={handleSetCups} />
                ))}
              </div>
              <p className="text-[10px] text-slate-400 text-center mt-2 font-semibold">
                Each cup ≈ 250 ml · Goal: {goal} cups/day
                {extraCups > 0 && ` · +${extraCups} for heat`}
              </p>
            </div>
          )}

          <div className="flex gap-2 shrink-0">
            {[["today", "📊 Today"], ["history", "📅 History"], ["hygiene", "🧼 Hygiene"]].map(([t, label]) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 rounded-xl border-2 font-extrabold text-xs cursor-pointer transition
                  ${tab === t ? "border-sky-700 bg-sky-700 text-white" : "border-sky-100 bg-white text-sky-700 hover:border-sky-400"}`}
              >{label}</button>
            ))}
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto">

            {tab === "today" && !loading && data && (
              <div className="bg-white rounded-2xl border border-sky-100 shadow-sm p-4 flex flex-col gap-3 h-full">
                <div className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-slate-400">Today's Summary</div>
                {data.goalMet && (
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                    <span className="text-2xl">🏆</span>
                    <div>
                      <div className="font-extrabold text-emerald-700 text-xs">Daily goal achieved!</div>
                    </div>
                  </div>
                )}
                <div className="text-[11px] text-slate-400 font-semibold text-center mt-auto">
                  💡 Staying hydrated keeps your brain sharp and body strong!
                </div>
              </div>
            )}

            {tab === "history" && (
              <div className="bg-white rounded-2xl border border-sky-100 shadow-sm p-4">
                <div className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-slate-400 mb-3">Last 7 Days</div>
                {history?.logs?.length > 0 ? (
                  <>
                    <div className="flex flex-col divide-y divide-slate-50">
                      {history.logs.map((day) => <HistoryRow key={day.date} day={day} />)}
                    </div>
                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100">
                      <span className="text-xs text-slate-500 font-semibold">Consistency</span>
                      <span className="font-black text-sky-700 text-sm">
                        {history.daysGoalMet}/{history.period?.days || 7} days 🏅
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-6 text-slate-400">
                    <div className="text-3xl mb-2">📅</div>
                    <p className="font-semibold text-xs">No history yet — start tracking!</p>
                  </div>
                )}
              </div>
            )}

            {tab === "hygiene" && (
              <div className="flex flex-col gap-3">
                {wx.hygieneReminders.length > 0 ? (
                  <HygienePanel reminders={wx.hygieneReminders} />
                ) : (
                  <div className="bg-white rounded-2xl border border-sky-100 shadow-sm p-6 text-center text-slate-400">
                    <div className="text-3xl mb-2">🧼</div>
                    <p className="font-semibold text-xs">
                      {wx.weather
                        ? "Weather looks comfortable — keep up your regular hygiene routine!"
                        : "Add your OpenWeather API key to get personalized hygiene tips."}
                    </p>
                  </div>
                )}
                <div className="bg-white rounded-2xl border border-sky-100 shadow-sm p-4">
                  <div className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-slate-400 mb-2">
                    Daily Essentials
                  </div>
                  {[
                    { emoji: "🤲", tip: "Wash hands before meals and after the toilet." },
                    { emoji: "🦷", tip: "Brush teeth twice a day for 2 minutes each." },
                    { emoji: "💧", tip: "Drink water regularly, not just when thirsty." },
                    { emoji: "😴", tip: "Aim for 8-10 hours of sleep to support immunity." },
                  ].map((r, i) => (
                    <div key={i} className="flex items-start gap-2 py-2 border-b border-slate-50 last:border-0">
                      <span className="text-base shrink-0">{r.emoji}</span>
                      <span className="text-[11px] text-slate-600 font-semibold leading-snug">{r.tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}