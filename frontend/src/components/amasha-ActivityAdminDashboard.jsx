import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

const API = "http://localhost:4000";

// ✅ Uses Intl API — matches backend todayString() exactly
const todayStr = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Colombo" });

const getToken = () =>
  localStorage.getItem("superAdminToken") ||
  localStorage.getItem("aquachamp_token") ||
  sessionStorage.getItem("aquachamp_token");

const api = axios.create({ baseURL: API });
api.interceptors.request.use((cfg) => {
  const t = getToken();
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

// 
//  VALIDATION HELPERS
// 
const NAME_MIN   = 3;
const NAME_MAX   = 60;
const DESC_MAX   = 300;
const POINTS_MIN = 1;
const POINTS_MAX = 100;

const hasAlphanumeric = (str) => /[\p{L}\p{N}]/u.test(str);

const isEmojiChar = (cp) => {
  if (cp <= 0x007E) return false;
  if (cp === 0x200D) return true;
  if (cp === 0xFE0F) return true;
  if (cp >= 0x1F3FB && cp <= 0x1F3FF) return true;
  if (cp >= 0x1F1E0 && cp <= 0x1F1FF) return true;
  if (cp >= 0x2194 && cp <= 0x2199) return true;
  if (cp >= 0x2300 && cp <= 0x23FF) return true;
  if (cp >= 0x2600 && cp <= 0x26FF) return true;
  if (cp >= 0x2700 && cp <= 0x27BF) return true;
  if (cp >= 0x2B00 && cp <= 0x2BFF) return true;
  if (cp >= 0xFE00 && cp <= 0xFE0F) return true;
  if (cp >= 0x1F000 && cp <= 0x1F02F) return true;
  if (cp >= 0x1F0A0 && cp <= 0x1F0FF) return true;
  if (cp >= 0x1F100 && cp <= 0x1F1FF) return true;
  if (cp >= 0x1F200 && cp <= 0x1F2FF) return true;
  if (cp >= 0x1F300 && cp <= 0x1F5FF) return true;
  if (cp >= 0x1F600 && cp <= 0x1F64F) return true;
  if (cp >= 0x1F680 && cp <= 0x1F6FF) return true;
  if (cp >= 0x1F700 && cp <= 0x1F77F) return true;
  if (cp >= 0x1F780 && cp <= 0x1F7FF) return true;
  if (cp >= 0x1F800 && cp <= 0x1F8FF) return true;
  if (cp >= 0x1F900 && cp <= 0x1F9FF) return true;
  if (cp >= 0x1FA00 && cp <= 0x1FA6F) return true;
  if (cp >= 0x1FA70 && cp <= 0x1FAFF) return true;
  if (cp >= 0x231A && cp <= 0x231B)   return true;
  if (cp >= 0x23E9 && cp <= 0x23F3)   return true;
  if (cp >= 0x25AA && cp <= 0x25AB)   return true;
  if (cp >= 0x25FB && cp <= 0x25FE)   return true;
  if (cp >= 0x2614 && cp <= 0x2615)   return true;
  if (cp >= 0x2648 && cp <= 0x2653)   return true;
  return false;
};

const isSingleEmoji = (str) => {
  const trimmed = str.trim();
  if (!trimmed) return false;
  const codePoints = [...trimmed].map((ch) => ch.codePointAt(0));
  if (!codePoints.every(isEmojiChar)) return false;
  if (typeof Intl !== "undefined" && Intl.Segmenter) {
    return [...new Intl.Segmenter().segment(trimmed)].length === 1;
  }
  return codePoints.length <= 8;
};

const extractEmoji = (raw, fallback = "") => {
  const trimmed = raw.trim();
  if (!trimmed) return fallback;
  if (typeof Intl !== "undefined" && Intl.Segmenter) {
    const clusters = [...new Intl.Segmenter().segment(trimmed)].map((s) => s.segment);
    const emojiOnly = clusters.filter((c) => isSingleEmoji(c));
    return emojiOnly.length > 0 ? emojiOnly[emojiOnly.length - 1] : fallback;
  }
  const cps = [...trimmed];
  const valid = cps.filter((ch) => isEmojiChar(ch.codePointAt(0)));
  return valid.length > 0 ? valid[valid.length - 1] : fallback;
};

function validateActivityForm(form) {
  const errors = {};

  const iconTrimmed = (form.icon || "").trim();
  if (!iconTrimmed) {
    errors.icon = "Please choose an icon.";
  } else if (!isSingleEmoji(iconTrimmed)) {
    errors.icon = "Only a single emoji is allowed — no letters, numbers, or symbols.";
  }

  const nameTrimmed = (form.name || "").trim();
  if (!nameTrimmed) {
    errors.name = "Activity name is required.";
  } else if (!hasAlphanumeric(nameTrimmed)) {
    errors.name = "Name must contain at least one letter or number.";
  } else if (nameTrimmed.length < NAME_MIN) {
    errors.name = `Name must be at least ${NAME_MIN} characters.`;
  } else if (nameTrimmed.length > NAME_MAX) {
    errors.name = `Name must not exceed ${NAME_MAX} characters.`;
  }

  const descTrimmed = (form.description || "").trim();
  if (descTrimmed.length > DESC_MAX) {
    errors.description = `Description must not exceed ${DESC_MAX} characters.`;
  }

  const pts = Number(form.points);
  if (form.points === "" || form.points === null || form.points === undefined) {
    errors.points = "Points are required.";
  } else if (!Number.isInteger(pts)) {
    errors.points = "Points must be a whole number.";
  } else if (pts < POINTS_MIN) {
    errors.points = `Points must be at least ${POINTS_MIN}.`;
  } else if (pts > POINTS_MAX) {
    errors.points = `Points must not exceed ${POINTS_MAX}.`;
  }

  return errors;
}

// Field-level error label
function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <p className="text-red-500 text-[11px] font-semibold mt-1 flex items-center gap-1">
      <span>⚠️</span> {msg}
    </p>
  );
}

// Sidebar
const NAV = [
  { id: "activities", icon: "🧼", label: "Activity Management" },
  { id: "water",      icon: "💧", label: "Water Intake" },
];

function Sidebar({ active, setActive, collapsed, setCollapsed, onLogout }) {
  return (
    <aside
      className={`relative flex flex-col min-h-screen z-10 shadow-2xl
        bg-linear-to-b from-[#042C53] via-[#185FA5] to-[#1D9E75]
        transition-all duration-300 ease-in-out
        ${collapsed ? "w-18" : "w-60"}`}
    >
      <div className="flex items-center gap-3 px-4 pt-6 pb-3">
        <div className="w-10 h-10 rounded-2xl bg-white/20 border-2 border-cyan-400/40 flex items-center justify-center text-2xl shrink-0 backdrop-blur-sm shadow-md">
          🏆
        </div>
        {!collapsed && (
          <div>
            <div className="text-white font-black text-base tracking-wide leading-tight">AquaChamp</div>
            <div className="text-white/50 text-[9px] font-bold tracking-[0.2em] uppercase">Admin Panel</div>
          </div>
        )}
      </div>

      <nav className="flex-1 px-2 py-4 flex flex-col gap-1">
        {NAV.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className={`flex items-center gap-3 rounded-2xl border-none cursor-pointer transition-all duration-200 outline-none w-full
                ${collapsed ? "justify-center px-0 py-2.5" : "px-3.5 py-2.5"}
                ${isActive ? "bg-white/20 shadow-md" : "bg-transparent hover:bg-white/10"}`}
            >
              <span className="text-xl shrink-0">{item.icon}</span>
              {!collapsed && (
                <span className={`text-[13px] whitespace-nowrap ${isActive ? "text-white font-extrabold" : "text-white/65 font-semibold"}`}>
                  {item.label}
                </span>
              )}
              {isActive && !collapsed && (
                <div className="ml-auto w-2 h-2 rounded-full bg-emerald-300" />
              )}
            </button>
          );
        })}
      </nav>

      <button
        onClick={() => setCollapsed((p) => !p)}
        className="mx-2 mb-2 py-2.5 rounded-xl border border-white/20 bg-white/10 text-white/70 text-sm font-bold cursor-pointer flex items-center justify-center hover:bg-white/20 transition-all"
      >
        {collapsed ? "→" : "← Collapse"}
      </button>

      {/* ── Logout Button ── */}
      <button
        onClick={onLogout}
        className={`mx-2 mb-4 py-2.5 rounded-xl border border-red-400/30 bg-red-500/10 text-red-300 text-sm font-bold cursor-pointer flex items-center justify-center gap-2 hover:bg-red-500/25 hover:text-red-200 transition-all
          ${collapsed ? "px-0" : "px-3"}`}
      >
        <span>🚪</span>
        {!collapsed && <span>Logout</span>}
      </button>
    </aside>
  );
}

//  Toast 
function Toast({ msg, type, onClose }) {
  useEffect(() => {
    if (msg) { const t = setTimeout(onClose, 3200); return () => clearTimeout(t); }
  }, [msg]);
  if (!msg) return null;
  return (
    <div className={`fixed top-6 right-6 z-9999 flex items-center gap-2.5 px-5 py-3.5 rounded-2xl font-bold text-sm shadow-2xl border
      ${type === "error" ? "bg-red-50 border-red-200 text-red-600" : "bg-emerald-50 border-emerald-200 text-emerald-700"}`}>
      <span>{type === "error" ? "❌" : "✅"}</span>
      {msg}
      <button onClick={onClose} className="ml-2 bg-transparent border-none cursor-pointer text-base opacity-50 hover:opacity-100">×</button>
    </div>
  );
}

// Modal
function Modal({ title, onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-500 bg-[#042C53]/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="m-0 text-[#042C53] font-black text-xl">{title}</h3>
          <button
            onClick={onClose}
            className="bg-sky-50 border-none rounded-xl w-8 h-8 cursor-pointer text-base hover:bg-sky-100 transition-colors flex items-center justify-center"
          >✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

//  Logout Confirmation Modal
function LogoutModal({ onConfirm, onCancel }) {
  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-[#042C53]/60 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-5xl bg-amber-50 border-2 border-amber-300 shadow-lg">
            👋
          </div>
        </div>
        <h3 className="text-xl font-black text-center text-[#042C53] mb-2">
          Logout Confirmation
        </h3>
        <p className="text-slate-500 text-sm text-center font-medium mb-6">
          Are you sure you want to logout? You will need to login again to access the admin panel.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-2xl border-2 border-sky-100 bg-white text-sky-700 font-extrabold text-sm cursor-pointer hover:bg-sky-50 transition"
          >
            ❌ No, Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-2xl border-none bg-gradient-to-r from-red-500 to-red-600 text-white font-extrabold text-sm cursor-pointer shadow-lg hover:-translate-y-0.5 transition"
          >
            ✅ Yes, Logout
          </button>
        </div>
      </div>
    </div>
  );
}

// Activity Form
const ICONS = ["🧼", "🪥", "🚿", "🌙", "✂️", "💇", "👕", "🚽", "💊", "🏃", "🥦", "😴"];

function ActivityForm({ initial, onSave, onCancel, loading }) {
  const [form, setForm] = useState({
    name:        initial?.name        || "",
    description: initial?.description || "",
    icon:        initial?.icon        || "🧼",
    points:      initial?.points      ?? 10,
  });
  const [errors,  setErrors]  = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (k) => (e) => {
    const val = e.target.value;
    setForm((p) => ({ ...p, [k]: val }));
    setErrors((prev) => {
      const next = validateActivityForm({ ...form, [k]: val });
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

  const handleIconInput = (e) => {
    const extracted = extractEmoji(e.target.value, form.icon);
    handleIconPick(extracted);
  };

  const handleSubmit = () => {
    setTouched({ icon: true, name: true, description: true, points: true });
    const errs = validateActivityForm(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    onSave({
      ...form,
      name:        form.name.trim(),
      description: form.description.trim(),
      icon:        form.icon.trim(),
      points:      Number(form.points),
    });
  };

  const isFormValid = Object.keys(validateActivityForm(form)).length === 0;

  const inputCls = (k) =>
    `w-full rounded-xl border-2 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition
    ${touched[k] && errors[k]
      ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
      : "border-sky-100 focus:border-sky-600 focus:ring-4 focus:ring-sky-100"}`;

  return (
    <div className="flex flex-col gap-4">

      {/*  Icon */}
      <div>
        <label className="block text-[10px] font-extrabold uppercase tracking-[0.12em] text-sky-700 mb-2">
          Icon <span className="text-red-400">*</span>
        </label>
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center text-2xl shrink-0 transition-all
            ${touched.icon && errors.icon ? "border-red-400 bg-red-50" : "border-sky-200 bg-sky-50"}`}>
            {form.icon}
          </div>
          <div className="flex-1">
            <input
              type="text"
              value={form.icon}
              onChange={handleIconInput}
              onBlur={() => markTouched("icon")}
              placeholder="Paste an emoji here…"
              className={inputCls("icon")}
            />
            <p className="text-[10px] text-slate-400 mt-1">Only emoji accepted — letters &amp; numbers are blocked</p>
          </div>
        </div>
        {touched.icon && <FieldError msg={errors.icon} />}
        <div className="flex flex-wrap gap-2 mt-1">
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

      {/*  Name */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label className="block text-[10px] font-extrabold uppercase tracking-[0.12em] text-sky-700">
            Activity Name <span className="text-red-400">*</span>
          </label>
          <span className={`text-[10px] font-semibold ${(form.name.trim().length > NAME_MAX) ? "text-red-500" : "text-slate-400"}`}>
            {form.name.trim().length}/{NAME_MAX}
          </span>
        </div>
        <input
          value={form.name}
          onChange={handleChange("name")}
          onBlur={() => markTouched("name")}
          placeholder="e.g. Brush Teeth (Morning)"
          className={inputCls("name")}
        />
        {touched.name && <FieldError msg={errors.name} />}
      </div>

      {/* Description */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label className="block text-[10px] font-extrabold uppercase tracking-[0.12em] text-sky-700">
            Description <span className="text-slate-400 normal-case font-normal">(optional)</span>
          </label>
          <span className={`text-[10px] font-semibold ${(form.description.trim().length > DESC_MAX) ? "text-red-500" : "text-slate-400"}`}>
            {form.description.trim().length}/{DESC_MAX}
          </span>
        </div>
        <textarea
          value={form.description}
          onChange={handleChange("description")}
          onBlur={() => markTouched("description")}
          rows={3}
          placeholder="Brief description..."
          className={`${inputCls("description")} resize-y`}
        />
        {touched.description && <FieldError msg={errors.description} />}
      </div>

      {/*  Points */}
      <div>
        <label className="block text-[10px] font-extrabold uppercase tracking-[0.12em] text-sky-700 mb-1.5">
          Points <span className="text-red-400">*</span>
          <span className="text-slate-400 normal-case font-normal ml-1">(1–100)</span>
        </label>
        <input
            type="number"
            min={POINTS_MIN}
            max={POINTS_MAX}
            step={1}
            value={form.points}
            onKeyDown={(e) => {
         if (["e", "E", "+", "-", "."].includes(e.key)) {
        e.preventDefault();
      }
    }}
       onChange={(e) => {
       let val = e.target.value;

      if (val === "") {
      handleChange("points")(e);
      return;
      }

      val = Number(val);

      if (val < POINTS_MIN || val > POINTS_MAX) return;

      handleChange("points")({
      target: { value: val }
     });
    }}
     onBlur={() => markTouched("points")}
     placeholder="e.g. 10"
     className={inputCls("points")}
   />
        {touched.points && <FieldError msg={errors.points} />}
        <div className="flex justify-between mt-1.5 px-1">
          {[1, 10, 25, 50, 75, 100].map((v) => (
            <button
              key={v} type="button"
              onClick={() => {
                setForm((p) => ({ ...p, points: v }));
                setErrors((prev) => {
                  const next = validateActivityForm({ ...form, points: v });
                  return { ...prev, points: next.points };
                });
                setTouched((p) => ({ ...p, points: true }));
              }}
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-lg border transition cursor-pointer
                ${Number(form.points) === v
                  ? "border-sky-600 bg-sky-600 text-white"
                  : "border-sky-100 bg-sky-50 text-sky-600 hover:border-sky-400"}`}
            >{v}</button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-2">
        <button
          type="button" onClick={onCancel}
          className="flex-1 py-2.5 rounded-2xl border-2 border-sky-100 bg-white text-sky-700 font-extrabold text-sm cursor-pointer hover:bg-sky-50 transition"
        >Cancel</button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className={`flex-1 py-2.5 rounded-2xl border-none font-extrabold text-sm cursor-pointer shadow-lg transition
            ${!isFormValid
              ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
              : "bg-linear-to-r from-sky-700 to-emerald-500 text-white hover:-translate-y-0.5"}`}
        >{loading ? "Saving…" : "💾 Save Activity"}</button>
      </div>
    </div>
  );
}

//  User Detail Modal (Activities) 
function UserDetailModal({ activity, onClose }) {
  const user = activity.userId;
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  const ageGroup = user?.age
    ? user.age <= 10 ? "Age group: 5–10" : "Age group: 10–15"
    : null;

  return (
    <div
      className="fixed inset-0 z-600 bg-[#042C53]/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-3xl p-7 w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="m-0 text-[#042C53] font-black text-lg">Activity Details</h3>
          <button
            onClick={onClose}
            className="bg-sky-50 border-none rounded-xl w-8 h-8 cursor-pointer text-base hover:bg-sky-100 transition-colors flex items-center justify-center"
          >✕</button>
        </div>

        <div className="flex items-center gap-3 p-4 bg-sky-50 rounded-2xl border border-sky-100 mb-5">
          <div className="w-14 h-14 rounded-2xl bg-white border border-sky-200 flex items-center justify-center text-2xl shrink-0">
            {activity.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-extrabold text-[#042C53] text-sm truncate">{activity.name}</div>
            <div className="text-slate-400 text-xs mt-0.5 leading-relaxed">
              {activity.description || "No description"}
            </div>
            <div className="flex gap-2 mt-1.5 flex-wrap">
              <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-white text-sky-700 text-[10px] font-bold border border-sky-200">
                ⭐ {activity.points} pts
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-orange-50 text-orange-600 text-[10px] font-bold border border-orange-100">
                ⭐ Custom
              </span>
            </div>
          </div>
        </div>

        <div className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-slate-400 mb-3">
          Created By
        </div>

        {user ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-sky-600 to-emerald-500 flex items-center justify-center text-white font-extrabold text-base shrink-0">
                {initials}
              </div>
              <div>
                <div className="font-extrabold text-[#042C53] text-base">{user.name}</div>
                {ageGroup && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-violet-50 text-violet-600 text-[10px] font-bold border border-violet-100 mt-1">
                    🧒 {ageGroup}
                  </span>
                )}
              </div>
            </div>
            {user.email && (
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-base shrink-0">📧</span>
                <span className="text-sm text-slate-600 font-semibold truncate">{user.email}</span>
              </div>
            )}
            {user.age && (
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-base shrink-0">🎂</span>
                <span className="text-sm text-slate-600 font-semibold">Age {user.age}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6 text-slate-400">
            <div className="text-3xl mb-2">👤</div>
            <p className="text-sm font-semibold">User details not available</p>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-6 w-full py-2.5 rounded-2xl border-none bg-linear-to-r from-sky-700 to-emerald-500 text-white font-extrabold text-sm cursor-pointer shadow-lg hover:-translate-y-0.5 transition"
        >Close</button>
      </div>
    </div>
  );
}

//  Activity Card 
function ActivityCard({ activity, onEdit, onDelete }) {
  const [showDetail, setShowDetail] = useState(false);

  return (
    <>
      {showDetail && activity.source === "custom" && (
        <UserDetailModal activity={activity} onClose={() => setShowDetail(false)} />
      )}

      <div
        onClick={() => activity.source === "custom" && setShowDetail(true)}
        className={`bg-white rounded-2xl px-5 py-4 flex items-center gap-4 shadow-sm transition-all border
          ${activity.isActive ? "border-sky-100" : "border-red-100 opacity-70"}
          ${activity.source === "custom" ? "cursor-pointer hover:border-sky-300 hover:shadow-md" : ""}`}
      >
        <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-sky-50 to-blue-100 border border-sky-200 flex items-center justify-center text-2xl shrink-0">
          {activity.icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-extrabold text-[#042C53] text-[15px] truncate">{activity.name}</div>
          <div className="text-slate-400 text-xs mt-0.5 truncate">{activity.description || "No description"}</div>
          <div className="flex gap-2 mt-2 flex-wrap">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-sky-50 text-sky-700 text-[11px] font-bold border border-sky-100">
              ⭐ {activity.points} pts
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-bold border
              ${activity.source === "system"
                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                : "bg-orange-50 text-orange-600 border-orange-100"}`}>
              {activity.source === "system" ? "🌐 System" : "⭐ Custom"}
            </span>
            {activity.source === "custom" && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-slate-50 text-slate-400 text-[10px] font-semibold border border-slate-100">
                👤 tap to view user
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onEdit(activity)}
            className="w-9 h-9 rounded-xl border border-sky-200 bg-sky-50 text-sky-600 flex items-center justify-center text-base cursor-pointer hover:bg-sky-600 hover:text-white transition-all"
          >✏️</button>
          <button
            onClick={() => onDelete(activity)}
            className="w-9 h-9 rounded-xl border border-red-200 bg-red-50 text-red-500 flex items-center justify-center text-base cursor-pointer hover:bg-red-500 hover:text-white transition-all"
          >🗑️</button>
        </div>
      </div>
    </>
  );
}

//  Activities Panel 
function ActivitiesPanel({ toast }) {
  const [activities, setActivities] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [modal,      setModal]      = useState(null);
  const [saving,     setSaving]     = useState(false);
  const [search,     setSearch]     = useState("");
  const [filter,     setFilter]     = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/activities/");
      setActivities(data.data || []);
    } catch { toast("Failed to load activities", "error"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (form) => {
    setSaving(true);
    try {
      await api.post("/api/activities/system", form);
      toast("Activity created! 🎉");
      setModal(null); load();
    } catch (e) { toast(e.response?.data?.message || "Error creating activity", "error"); }
    finally { setSaving(false); }
  };

  const handleEdit = async (form) => {
    setSaving(true);
    try {
      await api.put(`/api/activities/${modal._id}`, form);
      toast("Activity updated ✅");
      setModal(null); load();
    } catch (e) { toast(e.response?.data?.message || "Error updating", "error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (act) => {
    if (!window.confirm(`Permanently delete "${act.name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/api/activities/${act._id}`);
      toast("Activity permanently deleted 🗑️");
      load();
    } catch { toast("Error deleting activity", "error"); }
  };

  const counts = {
    all:    activities.length,
    system: activities.filter((a) => a.source === "system").length,
    custom: activities.filter((a) => a.source === "custom").length,
  };

  const filtered = activities.filter((a) => {
    const match = a.name.toLowerCase().includes(search.toLowerCase());
    if (filter === "system") return match && a.source === "system";
    if (filter === "custom") return match && a.source === "custom";
    return match;
  });

  const STAT_CARDS = [
    { label: "Total",  count: counts.all,    icon: "📋", color: "text-sky-600",     bg: "bg-sky-50",     border: "border-sky-100" },
    { label: "System", count: counts.system, icon: "🌐", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
    { label: "Custom", count: counts.custom, icon: "⭐", color: "text-orange-500",  bg: "bg-orange-50",  border: "border-orange-100" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="m-0 text-[#042C53] font-black text-2xl">🧼 Activity Management</h2>
          <p className="mt-1 text-slate-500 text-sm">Create and manage system hygiene activities for all users</p>
        </div>
        <button
          onClick={() => setModal("create")}
          className="px-5 py-2.5 rounded-2xl border-none bg-linear-to-r from-sky-700 to-emerald-500 text-white font-extrabold text-sm cursor-pointer shadow-lg hover:-translate-y-0.5 transition-transform"
        >+ Create Activity</button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {STAT_CARDS.map((s) => (
          <div key={s.label} className={`${s.bg} border ${s.border} rounded-2xl p-4`}>
            <div className="text-2xl">{s.icon}</div>
            <div className={`text-3xl font-black ${s.color} leading-tight mt-1`}>{s.count}</div>
            <div className="text-xs text-slate-500 font-semibold mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 mb-5 flex-wrap">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Search activities…"
          className="flex-1 min-w-45 rounded-xl border-2 border-sky-100 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-sky-600 focus:ring-4 focus:ring-sky-100 transition"
        />
        <div className="flex gap-1.5 flex-wrap">
          {["all", "system", "custom"].map((f) => (
            <button
              key={f} onClick={() => setFilter(f)}
              className={`px-3.5 py-2 rounded-xl border-2 font-bold text-xs capitalize cursor-pointer transition
                ${filter === f
                  ? "border-sky-700 bg-sky-700 text-white"
                  : "border-sky-100 bg-white text-sky-700 hover:border-sky-400"}`}
            >{f} ({counts[f]})</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">
          <div className="text-4xl mb-2">⏳</div>
          <p className="font-semibold">Loading activities…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <div className="text-5xl mb-2">🔍</div>
          <p className="font-semibold">No activities found</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filtered.map((a) => (
            <ActivityCard
              key={a._id} activity={a}
              onEdit={setModal}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {modal === "create" && (
        <Modal title="✨ Create System Activity" onClose={() => setModal(null)}>
          <ActivityForm onSave={handleCreate} onCancel={() => setModal(null)} loading={saving} />
        </Modal>
      )}
      {modal && modal !== "create" && (
        <Modal title="✏️ Edit Activity" onClose={() => setModal(null)}>
          <ActivityForm initial={modal} onSave={handleEdit} onCancel={() => setModal(null)} loading={saving} />
        </Modal>
      )}
    </div>
  );
}

//  Water Panel Helpers
const waterPct = (cups, goal) => Math.min(100, Math.round((cups / goal) * 100));

const ageColor = (group) =>
  group === "5-10"
    ? { bg: "bg-sky-100", text: "text-sky-700", border: "border-sky-200", dot: "bg-sky-500" }
    : { bg: "bg-violet-100", text: "text-violet-700", border: "border-violet-200", dot: "bg-violet-500" };

const levelStyle = (p) => {
  if (p >= 100) return { bar: "from-emerald-400 to-teal-400", label: "Complete 🎉", text: "text-emerald-600" };
  if (p >= 60)  return { bar: "from-sky-400 to-cyan-400",     label: "Almost there 🏆", text: "text-sky-600" };
  if (p >= 30)  return { bar: "from-blue-400 to-sky-400",     label: "In progress ⚡", text: "text-blue-600" };
  return         { bar: "from-slate-300 to-slate-400",         label: "Just started 💧", text: "text-slate-500" };
};

//  Water User Detail Modal 
function WaterUserDetailModal({ user, onClose }) {
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await api.get(`/api/water/admin/history/${user.userId}?days=7`);
        setHistory(data.data);
      } catch {
        setHistory(null);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [user.userId]);

  const progress = waterPct(user.cupsConsumed, user.dailyGoalCups);
  const lvl      = levelStyle(progress);
  const age      = ageColor(user.ageGroup);
  const initials = (user.userName || "?")[0].toUpperCase();

  return (
    <div
      className="fixed inset-0 z-600 bg-[#042C53]/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#042C53] via-[#185FA5] to-[#1D9E75] px-7 py-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 border-2 border-white/30 flex items-center justify-center font-black text-2xl backdrop-blur-sm">
                {initials}
              </div>
              <div>
                <div className="font-black text-xl">{user.userName}</div>
                <div className="text-white/70 text-sm">{user.email || "No email"}</div>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold mt-1.5 ${age.bg} ${age.text} border ${age.border}`}>
                  🧒 Age group {user.ageGroup}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-white cursor-pointer hover:bg-white/30 transition"
            >✕</button>
          </div>
        </div>

        <div className="p-7 flex flex-col gap-5">
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-slate-400 mb-3">Today's Progress</div>
            <div className="bg-sky-50 rounded-2xl border border-sky-100 p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-extrabold text-[#042C53] text-lg">
                  {user.cupsConsumed} <span className="text-slate-400 font-semibold text-base">/ {user.dailyGoalCups} cups</span>
                </span>
                <span className={`font-black text-xl ${lvl.text}`}>{progress}%</span>
              </div>
              <div className="h-4 bg-white rounded-full overflow-hidden border border-sky-200">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${lvl.bar} transition-all duration-700`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className={`text-xs font-bold mt-2 ${lvl.text}`}>{lvl.label}</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: "🎂", label: "Age",       value: user.age ? `${user.age} yrs` : "N/A" },
              { icon: "🎯", label: "Daily Goal", value: `${user.dailyGoalCups} cups` },
              { icon: "📅", label: "Date",       value: user.date || todayStr() },
            ].map((item) => (
              <div key={item.label} className="bg-slate-50 rounded-xl border border-slate-100 p-3 text-center">
                <div className="text-xl mb-1">{item.icon}</div>
                <div className="font-black text-[#042C53] text-sm">{item.value}</div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mt-0.5">{item.label}</div>
              </div>
            ))}
          </div>

          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-slate-400 mb-3">7-Day History</div>
            {loading ? (
              <div className="text-slate-400 text-sm text-center py-4 animate-pulse">Loading history…</div>
            ) : history?.logs?.length > 0 ? (
              <div className="flex flex-col gap-2">
                {history.logs.slice(-7).map((day) => {
                  const dp   = waterPct(day.cupsConsumed, day.dailyGoalCups);
                  const dlvl = levelStyle(dp);
                  return (
                    <div key={day.date} className="flex items-center gap-3">
                      <div className="w-24 text-xs text-slate-500 font-semibold shrink-0">{day.date}</div>
                      <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${dlvl.bar}`}
                          style={{ width: `${dp}%` }}
                        />
                      </div>
                      <div className="w-20 text-right text-[11px] font-bold text-slate-500 shrink-0">
                        {day.cupsConsumed}/{day.dailyGoalCups}{day.goalMet ? " ✅" : ""}
                      </div>
                    </div>
                  );
                })}
                <div className="text-xs text-emerald-600 font-bold mt-1">
                  🏅 {history.daysGoalMet}/{history.period?.days || 7} days goal met
                </div>
              </div>
            ) : (
              <div className="text-slate-400 text-sm text-center py-4">No history available</div>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl border-none bg-gradient-to-r from-sky-700 to-teal-500 text-white font-extrabold text-sm cursor-pointer shadow-lg hover:-translate-y-0.5 transition-transform"
          >Close</button>
        </div>
      </div>
    </div>
  );
}

//  Water User Row 
function WaterUserRow({ user, onViewDetail }) {
  const progress = waterPct(user.cupsConsumed, user.dailyGoalCups);
  const lvl      = levelStyle(progress);
  const age      = ageColor(user.ageGroup);

  return (
    <div
      className="bg-white rounded-2xl border border-slate-100 px-5 py-4 flex items-center gap-4 shadow-sm hover:border-sky-200 hover:shadow-md transition-all cursor-pointer"
      onClick={() => onViewDetail(user)}
    >
      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-sky-600 to-teal-500 flex items-center justify-center text-white font-black text-base shrink-0">
        {(user.userName || "?")[0].toUpperCase()}
      </div>

      <div className="w-36 shrink-0">
        <div className="font-extrabold text-[#042C53] text-sm truncate">{user.userName}</div>
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border mt-1 ${age.bg} ${age.text} ${age.border}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${age.dot}`} />
          Age {user.ageGroup}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between mb-1.5">
          <span className="text-xs font-bold text-slate-500">{user.cupsConsumed} / {user.dailyGoalCups} cups</span>
          <span className={`text-xs font-bold ${lvl.text}`}>{progress}%</span>
        </div>
        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${lvl.bar} transition-all duration-700`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className={`text-[11px] font-semibold mt-1 ${lvl.text}`}>{lvl.label}</div>
      </div>

      <div className="shrink-0 w-24 text-right">
        {user.goalMet ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-600 text-[11px] font-bold border border-emerald-100">
            ✅ Goal met
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-600 text-[11px] font-bold border border-amber-100">
            ⏳ Pending
          </span>
        )}
      </div>

      <div className="text-slate-300 text-base shrink-0">›</div>
    </div>
  );
}

//  Water Panel 
function WaterPanel() {
  const [users,       setUsers]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [selected,    setSelected]    = useState(null);
  const [search,      setSearch]      = useState("");
  const [filter,      setFilter]      = useState("all");
  const [error,       setError]       = useState(null);
  const [currentDate, setCurrentDate] = useState(todayStr());

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get("/api/water/admin/overview");
      setUsers(data.data || []);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load water data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newDate = todayStr();
      if (newDate !== currentDate) {
        setCurrentDate(newDate);
        load();
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [currentDate, load]);

  const filtered = users.filter((u) => {
    const matchName = (u.userName || "").toLowerCase().includes(search.toLowerCase());
    if (filter === "met")   return matchName && u.goalMet;
    if (filter === "unmet") return matchName && !u.goalMet;
    if (filter === "5-10")  return matchName && u.ageGroup === "5-10";
    if (filter === "10-15") return matchName && u.ageGroup === "10-15";
    return matchName;
  });

  const totalUsers   = users.length;
  const goalMetCount = users.filter((u) => u.goalMet).length;
  const avgProgress  = totalUsers > 0
    ? Math.round(users.reduce((sum, u) => sum + waterPct(u.cupsConsumed, u.dailyGoalCups), 0) / totalUsers)
    : 0;
  const group510  = users.filter((u) => u.ageGroup === "5-10").length;
  const group1015 = users.filter((u) => u.ageGroup === "10-15").length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="m-0 text-[#042C53] font-black text-2xl">💧 Water Intake Management</h2>
          <p className="mt-1 text-slate-500 text-sm">
            Monitor all users' daily water tracking ·{" "}
            <span className="font-bold text-sky-600">{currentDate}</span>
          </p>
        </div>
        <button
          onClick={load}
          className="px-5 py-2.5 rounded-2xl border-2 border-sky-200 bg-white text-sky-700 font-extrabold text-sm cursor-pointer hover:bg-sky-50 transition"
        >🔄 Refresh</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { icon: "👥", label: "Total Users",   value: totalUsers,        bg: "bg-sky-50",     border: "border-sky-100",    text: "text-sky-600" },
          { icon: "✅", label: "Goal Met Today", value: goalMetCount,      bg: "bg-emerald-50", border: "border-emerald-100", text: "text-emerald-600",
            sub: `${totalUsers ? Math.round((goalMetCount / totalUsers) * 100) : 0}% of users` },
          { icon: "📊", label: "Avg Progress",  value: `${avgProgress}%`, bg: "bg-blue-50",    border: "border-blue-100",   text: "text-blue-600" },
          { icon: "🧒", label: "Age 5–10",       value: group510,          bg: "bg-sky-50",     border: "border-sky-100",    text: "text-sky-600",   sub: "5 cups/day goal" },
          { icon: "🧑", label: "Age 10–15",      value: group1015,         bg: "bg-violet-50",  border: "border-violet-100", text: "text-violet-600", sub: "7 cups/day goal" },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} border ${s.border} rounded-2xl p-5 flex flex-col gap-1`}>
            <div className="text-2xl">{s.icon}</div>
            <div className={`text-3xl font-black leading-tight ${s.text}`}>{s.value}</div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">{s.label}</div>
            {s.sub && <div className="text-[11px] text-slate-400 font-semibold">{s.sub}</div>}
          </div>
        ))}
      </div>

      <div className="bg-linear-to-br from-sky-50 to-blue-100 rounded-2xl p-5 border border-sky-200">
        <h3 className="m-0 mb-3 text-sky-800 font-extrabold text-sm">💡 Water Goal System</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            ["Age 5–10",  "5 cups/day", "🧒"],
            ["Age 10–15", "7 cups/day", "🧑"],
            ["Tracking",  "Active ✅",  "📡"],
          ].map(([title, val, ic]) => (
            <div key={title} className="bg-white/70 rounded-xl p-3 text-center">
              <div className="text-xl mb-1">{ic}</div>
              <div className="font-extrabold text-sky-800 text-xs">{title}</div>
              <div className="text-sky-600 font-bold text-xs mt-0.5">{val}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <input
          value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Search by name…"
          className="flex-1 min-w-48 rounded-xl border-2 border-sky-100 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-sky-600 focus:ring-4 focus:ring-sky-100 transition"
        />
        <div className="flex gap-1.5 flex-wrap">
          {[
            ["all",   "All",      users.length],
            ["met",   "✅ Met",   goalMetCount],
            ["unmet", "⏳ Unmet", totalUsers - goalMetCount],
            ["5-10",  "🧒 5-10",  group510],
            ["10-15", "🧑 10-15", group1015],
          ].map(([f, label, count]) => (
            <button
              key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-xl border-2 font-bold text-xs cursor-pointer transition whitespace-nowrap
                ${filter === f
                  ? "border-sky-700 bg-sky-700 text-white"
                  : "border-sky-100 bg-white text-sky-700 hover:border-sky-400"}`}
            >{label} ({count})</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400">
          <div className="text-5xl mb-3 animate-bounce">💧</div>
          <p className="font-semibold">Loading water data…</p>
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="text-red-500 font-bold text-sm">{error}</p>
          <p className="text-slate-400 text-xs mt-2">
            Make sure <code className="bg-slate-100 px-1 rounded">/api/water/admin/overview</code> exists in your backend.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <div className="text-5xl mb-3">🔍</div>
          <p className="font-semibold">No users found</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filtered.map((u) => (
            <WaterUserRow key={u.userId} user={u} onViewDetail={setSelected} />
          ))}
        </div>
      )}

      {selected && (
        <WaterUserDetailModal user={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

//  Main Dashboard 
export default function ActivityAdminDashboard() {
  const [active,      setActive]      = useState("activities");
  const [collapsed,   setCollapsed]   = useState(false);
  const [toast,       setToast]       = useState({ msg: "", type: "success" });
  const [showLogout,  setShowLogout]  = useState(false);

  const showToast = (msg, type = "success") => setToast({ msg, type });

  const handleLogout = () => {
    ["superAdminToken", "aquachamp_token", "adminRoles", "adminUsername"]
      .forEach((k) => {
        localStorage.removeItem(k);
        sessionStorage.removeItem(k);
      });
    window.location.href = "/";
  };

  return (
    <div className="flex min-h-screen bg-[#EAF5FF]">
      <Toast msg={toast.msg} type={toast.type} onClose={() => setToast({ msg: "" })} />

      <Sidebar
        active={active}
        setActive={setActive}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        onLogout={() => setShowLogout(true)}
      />

      <main className="flex-1 p-7 overflow-y-auto max-h-screen">
        <div className="flex items-center justify-between mb-7 px-5 py-3.5 bg-white rounded-2xl shadow-sm border border-sky-100">
          <div className="font-extrabold text-[#042C53] text-sm">👋 Admin Dashboard · AquaChamp</div>
          <div className="flex gap-2.5 items-center">
            <span className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-600 text-[11px] font-bold border border-sky-100">
              📅 {todayStr()}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-[11px] font-bold border border-emerald-100">
              🟢 System Active
            </span>
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-sky-700 to-emerald-500 flex items-center justify-center text-white font-black text-base">
              A
            </div>
          </div>
        </div>

        {active === "activities" && <ActivitiesPanel toast={showToast} />}
        {active === "water"      && <WaterPanel />}
      </main>

      {/* ── Logout Confirmation Modal ── */}
      {showLogout && (
        <LogoutModal
          onConfirm={handleLogout}
          onCancel={() => setShowLogout(false)}
        />
      )}
    </div>
  );
}