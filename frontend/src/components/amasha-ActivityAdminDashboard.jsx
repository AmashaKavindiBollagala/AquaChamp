import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

const API = "http://localhost:4000";

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

// ── Sidebar ───────────────────────────────────────────────────────────────────
const NAV = [
  { id: "activities", icon: "🧼", label: "Activity Management" },
  { id: "water",      icon: "💧", label: "Water Intake" },
  { id: "reports",    icon: "📊", label: "Reports" },
];

function Sidebar({ active, setActive, collapsed, setCollapsed }) {
  return (
    <aside
      className={`relative flex flex-col min-h-screen z-10 shadow-2xl
        bg-gradient-to-b from-[#042C53] via-[#185FA5] to-[#1D9E75]
        transition-all duration-300 ease-in-out
        ${collapsed ? "w-[72px]" : "w-60"}`}
    >
      {/* Logo */}
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

      {/* Nav items */}
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

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((p) => !p)}
        className="mx-2 mb-4 py-2.5 rounded-xl border border-white/20 bg-white/10 text-white/70 text-sm font-bold cursor-pointer flex items-center justify-center hover:bg-white/20 transition-all"
      >
        {collapsed ? "→" : "← Collapse"}
      </button>
    </aside>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }) {
  useEffect(() => {
    if (msg) { const t = setTimeout(onClose, 3200); return () => clearTimeout(t); }
  }, [msg]);
  if (!msg) return null;
  return (
    <div className={`fixed top-6 right-6 z-[9999] flex items-center gap-2.5 px-5 py-3.5 rounded-2xl font-bold text-sm shadow-2xl border
      ${type === "error" ? "bg-red-50 border-red-200 text-red-600" : "bg-emerald-50 border-emerald-200 text-emerald-700"}`}>
      <span>{type === "error" ? "❌" : "✅"}</span>
      {msg}
      <button onClick={onClose} className="ml-2 bg-transparent border-none cursor-pointer text-base opacity-50 hover:opacity-100">×</button>
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-[500] bg-[#042C53]/50 backdrop-blur-sm flex items-center justify-center p-4"
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

// ── Activity Form ─────────────────────────────────────────────────────────────
const ICONS = ["🧼", "🪥", "🚿", "🌙", "✂️", "💇", "👕", "🚽", "💊", "🏃", "🥦", "😴"];

function ActivityForm({ initial, onSave, onCancel, loading }) {
  const [form, setForm] = useState({
    name:        initial?.name        || "",
    description: initial?.description || "",
    icon:        initial?.icon        || "🧼",
    points:      initial?.points      || 10,
  });
  const f = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className="flex flex-col gap-4">
      {/* Icon picker */}
      <div>
        <label className="block text-[10px] font-extrabold uppercase tracking-[0.12em] text-sky-700 mb-2">Icon</label>

        {/* Custom emoji input */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-12 h-12 rounded-xl border-2 border-sky-200 bg-sky-50 flex items-center justify-center text-2xl shrink-0">
            {form.icon}
          </div>
          <div className="flex-1">
            <input
              type="text"
              value={form.icon}
              onChange={(e) => {
                const val = [...e.target.value].slice(-1).join("") || "🧼";
                setForm((p) => ({ ...p, icon: val }));
              }}
              placeholder="Type any emoji…"
              className="w-full rounded-xl border-2 border-sky-100 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-sky-600 focus:ring-4 focus:ring-sky-100 transition"
            />
            <p className="text-[10px] text-slate-400 mt-1">Type or paste any emoji, or pick below</p>
          </div>
        </div>

        {/* Preset grid */}
        <div className="flex flex-wrap gap-2">
          {ICONS.map((ic) => (
            <button
              key={ic} type="button"
              onClick={() => setForm((p) => ({ ...p, icon: ic }))}
              className={`w-10 h-10 rounded-xl text-xl cursor-pointer transition-all border-2
                ${form.icon === ic
                  ? "border-sky-600 bg-sky-50 scale-110 shadow-sm"
                  : "border-sky-100 bg-gray-50 hover:border-sky-300"}`}
            >{ic}</button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-extrabold uppercase tracking-[0.12em] text-sky-700 mb-1.5">Activity Name *</label>
        <input
          value={form.name} onChange={f("name")}
          placeholder="e.g. Brush Teeth (Morning)"
          className="w-full rounded-xl border-2 border-sky-100 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-sky-600 focus:ring-4 focus:ring-sky-100 transition"
        />
      </div>

      <div>
        <label className="block text-[10px] font-extrabold uppercase tracking-[0.12em] text-sky-700 mb-1.5">Description</label>
        <textarea
          value={form.description} onChange={f("description")} rows={3}
          placeholder="Brief description..."
          className="w-full rounded-xl border-2 border-sky-100 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-sky-600 focus:ring-4 focus:ring-sky-100 transition resize-y"
        />
      </div>

      <div>
        <label className="block text-[10px] font-extrabold uppercase tracking-[0.12em] text-sky-700 mb-1.5">Points (1–100)</label>
        <input
          type="number" min={1} max={100}
          value={form.points} onChange={f("points")}
          className="w-full rounded-xl border-2 border-sky-100 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-sky-600 focus:ring-4 focus:ring-sky-100 transition"
        />
      </div>

      <div className="flex gap-3 mt-2">
        <button
          type="button" onClick={onCancel}
          className="flex-1 py-2.5 rounded-2xl border-2 border-sky-100 bg-white text-sky-700 font-extrabold text-sm cursor-pointer hover:bg-sky-50 transition"
        >Cancel</button>
        <button
          type="button" onClick={() => onSave(form)}
          disabled={loading || !form.name.trim()}
          className="flex-1 py-2.5 rounded-2xl border-none bg-gradient-to-r from-sky-700 to-emerald-500 text-white font-extrabold text-sm cursor-pointer shadow-lg hover:-translate-y-0.5 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >{loading ? "Saving…" : "💾 Save Activity"}</button>
      </div>
    </div>
  );
}

// ── User Detail Modal ─────────────────────────────────────────────────────────
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
      className="fixed inset-0 z-[600] bg-[#042C53]/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-3xl p-7 w-full max-w-sm shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="m-0 text-[#042C53] font-black text-lg">Activity Details</h3>
          <button
            onClick={onClose}
            className="bg-sky-50 border-none rounded-xl w-8 h-8 cursor-pointer text-base hover:bg-sky-100 transition-colors flex items-center justify-center"
          >✕</button>
        </div>

        {/* Activity info */}
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

        {/* Divider label */}
        <div className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-slate-400 mb-3">
          Created By
        </div>

        {/* User info */}
        {user ? (
          <div className="flex flex-col gap-3">
            {/* Avatar + name row */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-600 to-emerald-500 flex items-center justify-center text-white font-extrabold text-base shrink-0">
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

            {/* Email row */}
            {user.email && (
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-base shrink-0">📧</span>
                <span className="text-sm text-slate-600 font-semibold truncate">{user.email}</span>
              </div>
            )}

            {/* Age row */}
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
          className="mt-6 w-full py-2.5 rounded-2xl border-none bg-gradient-to-r from-sky-700 to-emerald-500 text-white font-extrabold text-sm cursor-pointer shadow-lg hover:-translate-y-0.5 transition"
        >Close</button>
      </div>
    </div>
  );
}

// ── Activity Card ─────────────────────────────────────────────────────────────
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
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-50 to-blue-100 border border-sky-200 flex items-center justify-center text-2xl shrink-0">
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

// ── Activities Panel ──────────────────────────────────────────────────────────
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

  const handleToggle = async (act) => {
    try {
      await api.put(`/api/activities/${act._id}`, { isActive: !act.isActive });
      toast(act.isActive ? "Activity deactivated" : "Activity activated ✅");
      load();
    } catch { toast("Error toggling activity", "error"); }
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
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="m-0 text-[#042C53] font-black text-2xl">🧼 Activity Management</h2>
          <p className="mt-1 text-slate-500 text-sm">Create and manage system hygiene activities for all users</p>
        </div>
        <button
          onClick={() => setModal("create")}
          className="px-5 py-2.5 rounded-2xl border-none bg-gradient-to-r from-sky-700 to-emerald-500 text-white font-extrabold text-sm cursor-pointer shadow-lg hover:-translate-y-0.5 transition-transform"
        >+ Create Activity</button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {STAT_CARDS.map((s) => (
          <div key={s.label} className={`${s.bg} border ${s.border} rounded-2xl p-4`}>
            <div className="text-2xl">{s.icon}</div>
            <div className={`text-3xl font-black ${s.color} leading-tight mt-1`}>{s.count}</div>
            <div className="text-xs text-slate-500 font-semibold mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search + filter */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Search activities…"
          className="flex-1 min-w-[180px] rounded-xl border-2 border-sky-100 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-sky-600 focus:ring-4 focus:ring-sky-100 transition"
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

      {/* Activity list */}
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

      {/* Modals */}
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

// ── Water Panel ───────────────────────────────────────────────────────────────
function WaterPanel() {
  const INFO = [
    { label: "Age 5–10 Daily Goal",     value: "5 cups",    icon: "🧒", color: "text-sky-600",     bg: "bg-sky-50",     border: "border-sky-100" },
    { label: "Age 10–15 Daily Goal",    value: "7 cups",    icon: "🧑", color: "text-violet-600",  bg: "bg-violet-50",  border: "border-violet-100" },
    { label: "Bonus Points (all done)", value: "20 pts",    icon: "🏆", color: "text-amber-600",   bg: "bg-amber-50",   border: "border-amber-100" },
    { label: "Tracking Status",         value: "Active ✅", icon: "📡", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
  ];

  const DETAILS = [
    ["Age 5–10",        "5 cups/day", "🧒 Young children need 5 daily cups"],
    ["Age 10–15",       "7 cups/day", "🧑 Older kids need 7 daily cups"],
    ["Progress Levels", "4 stages",   "💧→🌊→⚡→🏆 motivation tiers"],
    ["Streak Bonus",    "20 points",  "🎉 Full completion earns bonus"],
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="m-0 text-[#042C53] font-black text-2xl">💧 Water Intake Management</h2>
        <p className="mt-1 text-slate-500 text-sm">Monitor system-wide water tracking configuration</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {INFO.map((item) => (
          <div key={item.label} className={`${item.bg} border ${item.border} rounded-2xl p-5 shadow-sm`}>
            <div className="text-3xl mb-2">{item.icon}</div>
            <div className={`text-2xl font-black ${item.color}`}>{item.value}</div>
            <div className="text-xs text-slate-500 font-semibold mt-1">{item.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-br from-sky-50 to-blue-100 rounded-2xl p-6 border border-sky-200">
        <h3 className="m-0 mb-4 text-sky-800 font-extrabold text-base">💡 Water Goal System</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {DETAILS.map(([title, val, desc]) => (
            <div key={title} className="bg-white/70 rounded-2xl p-4">
              <div className="font-extrabold text-sky-800 text-sm">
                {title}: <span className="text-sky-600">{val}</span>
              </div>
              <div className="text-slate-500 text-xs mt-1">{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Reports Panel ─────────────────────────────────────────────────────────────
function ReportsPanel({ toast }) {
  const [report,  setReport]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [range,   setRange]   = useState("7");

  const getStartDate = (days) => {
    const d = new Date();
    d.setDate(d.getDate() - parseInt(days) + 1);
    return d.toISOString().slice(0, 10);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/api/activities/report?startDate=${getStartDate(range)}`);
        setReport(data.data);
      } catch { toast("Could not load report", "error"); }
      finally { setLoading(false); }
    };
    load();
  }, [range]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="m-0 text-[#042C53] font-black text-2xl">📊 Activity Reports</h2>
          <p className="mt-1 text-slate-500 text-sm">Weekly performance and activity summaries</p>
        </div>
        <div className="flex gap-2">
          {[["7","7 Days"],["14","14 Days"],["30","30 Days"]].map(([v, l]) => (
            <button
              key={v} onClick={() => setRange(v)}
              className={`px-4 py-2 rounded-xl border-2 font-bold text-sm cursor-pointer transition
                ${range === v
                  ? "border-sky-700 bg-sky-700 text-white"
                  : "border-sky-100 bg-white text-sky-700 hover:border-sky-400"}`}
            >{l}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">⏳ Loading report…</div>
      ) : report ? (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {[
              { label: "Total Logs",     value: report.totalLogs,              icon: "📋", color: "text-sky-600",    bg: "bg-sky-50",    border: "border-sky-100" },
              { label: "Total Points",   value: report.totalPoints,            icon: "⭐", color: "text-amber-500",  bg: "bg-amber-50",  border: "border-amber-100" },
              { label: "Current Streak", value: `${report.currentStreak} 🔥`,  icon: "🔥", color: "text-orange-500", bg: "bg-orange-50", border: "border-orange-100" },
              { label: "Best Streak",    value: `${report.longestStreak} days`, icon: "🏆", color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-100" },
            ].map((s) => (
              <div key={s.label} className={`${s.bg} border ${s.border} rounded-2xl p-4`}>
                <div className="text-2xl">{s.icon}</div>
                <div className={`text-2xl font-black ${s.color} leading-tight mt-1`}>{s.value}</div>
                <div className="text-xs text-slate-500 font-semibold mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Daily bar chart */}
          {report.daily?.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-sky-100 shadow-sm mb-5">
              <h3 className="m-0 mb-4 text-[#042C53] font-extrabold text-base">📅 Daily Breakdown</h3>
              <div className="flex flex-col gap-2.5">
                {report.daily.slice(-7).map((day) => {
                  const maxPts = Math.max(...report.daily.map((d) => d.points), 1);
                  const pct = Math.round((day.points / maxPts) * 100);
                  return (
                    <div key={day.date} className="flex items-center gap-3">
                      <div className="w-24 text-xs text-slate-500 font-semibold shrink-0">{day.date}</div>
                      <div className="flex-1 bg-sky-50 rounded-lg h-5 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-sky-600 to-emerald-500 rounded-lg transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="w-28 text-xs text-sky-700 font-bold text-right shrink-0">
                        {day.completions}✓ · {day.points}pts
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Most / Least */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {report.mostCompleted && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                <div className="text-xs text-emerald-600 font-bold mb-1">🏆 Most Completed</div>
                <div className="font-extrabold text-[#042C53] text-sm">{report.mostCompleted.activity}</div>
                <div className="text-emerald-600 font-bold text-sm">{report.mostCompleted.count} times</div>
              </div>
            )}
            {report.leastCompleted && (
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
                <div className="text-xs text-orange-500 font-bold mb-1">📉 Needs Attention</div>
                <div className="font-extrabold text-[#042C53] text-sm">{report.leastCompleted.activity}</div>
                <div className="text-orange-500 font-bold text-sm">{report.leastCompleted.count} times</div>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-slate-400">
          <div className="text-5xl mb-2">📊</div>
          <p className="font-semibold">No report data available</p>
        </div>
      )}
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function ActivityAdminDashboard() {
  const [active,    setActive]    = useState("activities");
  const [collapsed, setCollapsed] = useState(false);
  const [toast,     setToast]     = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => setToast({ msg, type });

  return (
    <div className="flex min-h-screen bg-[#EAF5FF]">
      <Toast msg={toast.msg} type={toast.type} onClose={() => setToast({ msg: "" })} />

      <Sidebar active={active} setActive={setActive} collapsed={collapsed} setCollapsed={setCollapsed} />

      <main className="flex-1 p-7 overflow-y-auto max-h-screen">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-7 px-5 py-3.5 bg-white rounded-2xl shadow-sm border border-sky-100">
          <div className="font-extrabold text-[#042C53] text-sm">👋 Admin Dashboard · AquaChamp</div>
          <div className="flex gap-2.5 items-center">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-[11px] font-bold border border-emerald-100">
              🟢 System Active
            </span>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-700 to-emerald-500 flex items-center justify-center text-white font-black text-base">
              A
            </div>
          </div>
        </div>

        {active === "activities" && <ActivitiesPanel toast={showToast} />}
        {active === "water"      && <WaterPanel />}
        {active === "reports"    && <ReportsPanel toast={showToast} />}
      </main>
    </div>
  );
}