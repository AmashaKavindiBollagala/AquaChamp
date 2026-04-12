import { useEffect, useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;
const AGE_GROUPS = ["6-10", "11-15"];

const TOPIC_COLORS = [
  { bg: "#fff0f6", border: "#f9a8d4", icon: "#ec4899", badge: "#fce7f3", badgeText: "#9d174d", accent: "#db2777", light50: "#fff0f6", light100: "#fce7f3", light200: "#fbcfe8", dark600: "#db2777", dark700: "#be185d", dark800: "#9d174d", dark900: "#831843", heroFrom: "#500724", heroTo: "#9d174d" },
  { bg: "#eff6ff", border: "#93c5fd", icon: "#3b82f6", badge: "#dbeafe", badgeText: "#1e40af", accent: "#2563eb", light50: "#eff6ff", light100: "#dbeafe", light200: "#bfdbfe", dark600: "#2563eb", dark700: "#1d4ed8", dark800: "#1e40af", dark900: "#1e3a8a", heroFrom: "#172554", heroTo: "#1e40af" },
  { bg: "#f0fdf4", border: "#86efac", icon: "#22c55e", badge: "#dcfce7", badgeText: "#166534", accent: "#16a34a", light50: "#f0fdf4", light100: "#dcfce7", light200: "#bbf7d0", dark600: "#16a34a", dark700: "#15803d", dark800: "#166534", dark900: "#14532d", heroFrom: "#052e16", heroTo: "#166534" },
  { bg: "#fffbeb", border: "#fcd34d", icon: "#f59e0b", badge: "#fef3c7", badgeText: "#92400e", accent: "#d97706", light50: "#fffbeb", light100: "#fef3c7", light200: "#fde68a", dark600: "#d97706", dark700: "#b45309", dark800: "#92400e", dark900: "#78350f", heroFrom: "#3b1a00", heroTo: "#92400e" },
  { bg: "#faf5ff", border: "#c4b5fd", icon: "#8b5cf6", badge: "#ede9fe", badgeText: "#6b21a8", accent: "#7c3aed", light50: "#faf5ff", light100: "#ede9fe", light200: "#ddd6fe", dark600: "#7c3aed", dark700: "#6d28d9", dark800: "#6b21a8", dark900: "#581c87", heroFrom: "#2e1065", heroTo: "#6b21a8" },
  { bg: "#ecfeff", border: "#67e8f9", icon: "#06b6d4", badge: "#cffafe", badgeText: "#164e63", accent: "#0891b2", light50: "#ecfeff", light100: "#cffafe", light200: "#a5f3fc", dark600: "#0891b2", dark700: "#0e7490", dark800: "#155e75", dark900: "#164e63", heroFrom: "#042f2e", heroTo: "#164e63" },
];

function hexAlpha(hex, alpha) {
  if (!hex || typeof hex !== "string") return `rgba(99, 102, 241, ${alpha})`;
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  if (Number.isNaN(r)) return `rgba(99, 102, 241, ${alpha})`;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function KaveeshaSubtopicsManager({
  selectedTopic,
  onSelectSubtopic,
  onChangeTopic,
}) {
  const [topics, setTopics] = useState([]);
  const [subtopics, setSubtopics] = useState([]);
  const [activeTopic, setActiveTopic] = useState(selectedTopic || null);
  const [ageFilter, setAgeFilter] = useState("6-10");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingSub, setEditingSub] = useState(null);
  const [form, setForm] = useState({ title: "", ageGroup: "6-10", order: 1 });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    axios.get(`${API}/api/topics`).then((r) => setTopics(r.data || []));
  }, []);

  useEffect(() => {
    if (selectedTopic) setActiveTopic(selectedTopic);
  }, [selectedTopic]);

  useEffect(() => {
    if (!activeTopic) return;
    fetchSubtopics();
  }, [activeTopic, ageFilter]);

  const getTopicPalette = (topic) => {
    if (!topic) return TOPIC_COLORS[0];
    const idx = topics.findIndex((t) => t._id === topic._id);
    return TOPIC_COLORS[(idx >= 0 ? idx : 0) % TOPIC_COLORS.length];
  };

  const topicCoverSrc = (t) => {
    if (!t?.imageUrl) return null;
    const u = t.imageUrl;
    return u.startsWith("/") ? `${API}${u}` : u;
  };

  const fetchSubtopics = async () => {
    if (!activeTopic) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/subtopics`, {
        params: { topicId: activeTopic._id, ageGroup: ageFilter },
      });
      const data = Array.isArray(res.data) ? res.data : res.data?.subtopics || [];
      const enriched = await Promise.all(
        data.map(async (sub) => {
          try {
            const quizRes = await axios.get(`${API}/api/kaveesha-miniquiz`, {
              params: { subtopicId: sub._id, ageGroup: sub.ageGroup },
            });
            const hasMiniQuiz =
              Array.isArray(quizRes.data?.questions) && quizRes.data.questions.length > 0;
            return { ...sub, hasMiniQuiz };
          } catch {
            return { ...sub, hasMiniQuiz: false };
          }
        })
      );
      setSubtopics(enriched);
    } catch {
      setSubtopics([]);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ title: "", ageGroup: ageFilter, order: subtopics.length + 1 });
    setEditingSub(null);
    setShowForm(false);
    setError("");
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) return setError("Title is required");
    if (!activeTopic) return setError("Select a topic first");
    setError("");
    try {
      const token = localStorage.getItem("aquachamp_token") || sessionStorage.getItem("aquachamp_token");
      const headers = { Authorization: `Bearer ${token}` };

      if (!editingSub && form.order) {
        const existingSubs = subtopics.filter(s => s.order >= form.order);
        for (const sub of existingSubs) {
          await axios.put(
            `${API}/api/subtopics/${sub._id}`,
            { ...sub, order: sub.order + 1 },
            { headers, withCredentials: true }
          );
        }
      }

      const payload = { ...form, topicId: activeTopic._id };
      if (editingSub) {
        await axios.put(`${API}/api/subtopics/${editingSub._id}`, payload, { headers, withCredentials: true });
        setSuccess("Subtopic updated! ✨");
      } else {
        await axios.post(`${API}/api/subtopics`, payload, { headers, withCredentials: true });
        setSuccess("Subtopic created! 🎉");
      }
      resetForm();
      fetchSubtopics();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Error saving subtopic");
    }
  };

  const handleDelete = async (sub) => {
    if (!window.confirm(`Delete "${sub.title}"?`)) return;
    setDeleting(sub._id);
    try {
      const token = localStorage.getItem("aquachamp_token") || sessionStorage.getItem("aquachamp_token");
      await axios.delete(`${API}/api/subtopics/${sub._id}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      const remainingSubs = subtopics.filter(s => s.order > sub.order);
      const headers = { Authorization: `Bearer ${token}` };
      for (const remainingSub of remainingSubs) {
        await axios.put(
          `${API}/api/subtopics/${remainingSub._id}`,
          { ...remainingSub, order: remainingSub.order - 1 },
          { headers, withCredentials: true }
        );
      }

      setSuccess("Subtopic deleted! 🗑️");
      fetchSubtopics();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Cannot delete subtopic");
    } finally {
      setDeleting(null);
    }
  };

  const startEdit = (sub) => {
    setEditingSub(sub);
    setForm({ title: sub.title, ageGroup: sub.ageGroup, order: sub.order || 1 });
    setShowForm(true);
  };

  const handleToggleLock = async (sub) => {
    try {
      const token = localStorage.getItem("aquachamp_token") || sessionStorage.getItem("aquachamp_token");
      await axios.put(
        `${API}/api/subtopics/${sub._id}`,
        { ...sub, isLocked: !sub.isLocked },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      setSuccess(`Subtopic ${sub.isLocked ? "unlocked" : "locked"}! ${sub.isLocked ? "🔓" : "🔒"}`);
      fetchSubtopics();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Cannot update subtopic status");
    }
  };

  const contentStatus = (sub) => {
    const parts = [];
    if (sub.videoUrl) parts.push({ icon: "🎬", label: "Video" });
    if (sub.content) parts.push({ icon: "📝", label: "Content" });
    if (sub.images?.length > 0) parts.push({ icon: "🖼️", label: "Images" });
    if (sub.hasMiniQuiz) parts.push({ icon: "❓", label: "Quiz" });
    return parts;
  };

  const inputStyle = {
    background: "#f8faff",
    border: "2px solid #e0e7ff",
    borderRadius: 12,
    padding: "10px 16px",
    color: "#1e293b",
    fontSize: 14,
    width: "100%",
    outline: "none",
    transition: "border-color 0.2s",
  };

  const activePal = getTopicPalette(activeTopic);

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {onChangeTopic && (
            <button
              type="button"
              onClick={() => onChangeTopic()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5"
              style={{
                background: activeTopic ? activePal.light100 : "#eff6ff",
                border: `2px solid ${activeTopic ? activePal.border : "#93c5fd"}`,
                color: activeTopic ? activePal.dark800 : "#1e40af",
                boxShadow: `0 2px 10px ${hexAlpha(activeTopic ? activePal.dark600 : "#3b82f6", 0.12)}`,
              }}
            >
              ← All topics
            </button>
          )}
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">📂 Subtopics</h2>
            <p className="text-slate-500 text-sm mt-0.5">
              {activeTopic ? "Manage lessons under the topic below" : "Choose a topic to see its lessons"}
            </p>
          </div>
        </div>
      </div>

      {/* TOPIC SELECTOR — LIGHT VERSION */}
      <div
        className="rounded-3xl overflow-hidden"
        style={{
          background: "linear-gradient(145deg, #f8faff 0%, #ffffff 50%, #f0f4ff 100%)",
          border: "2px solid #e0e7ff",
          boxShadow: "0 8px 32px rgba(99,102,241,0.10)",
        }}
      >
        {/* Header strip */}
        <div
          className="px-7 pt-6 pb-4"
          style={{ borderBottom: "1px solid #e0e7ff" }}
        >
          <div className="flex items-center gap-3 mb-1">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-base shrink-0"
              style={{ background: "#eef2ff", border: "1.5px solid #c7d2fe" }}
            >
              📚
            </div>
            <p
              className="text-[11px] font-bold uppercase tracking-[0.22em]"
              style={{ color: "#6366f1" }}
            >
              Step 1 — Select a Topic
            </p>
          </div>
          <h3
            className="text-xl font-extrabold tracking-tight"
            style={{ color: "#1e293b" }}
          >
            Which swimming topic are you working on?
          </h3>
        </div>

        {/* Topic cards row */}
        <div className="px-7 py-5 flex flex-wrap gap-3">
          {topics.length === 0 ? (
            <p className="text-sm font-medium text-slate-400">Loading topics…</p>
          ) : (
            topics.map((t, idx) => {
              const pal = TOPIC_COLORS[idx % TOPIC_COLORS.length];
              const isActive = activeTopic?._id === t._id;
              const imgSrc = topicCoverSrc(t);
              return (
                <button
                  key={t._id}
                  type="button"
                  onClick={() => setActiveTopic(t)}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all duration-200 relative overflow-hidden"
                  style={
                    isActive
                      ? {
                          background: `linear-gradient(135deg, ${pal.dark700}, ${pal.dark600})`,
                          color: "#fff",
                          boxShadow: `0 8px 24px ${hexAlpha(pal.dark600, 0.40)}, 0 0 0 2px rgba(255,255,255,0.25)`,
                          transform: "translateY(-2px)",
                          border: `2px solid ${pal.dark700}`,
                        }
                      : {
                          background: pal.light50,
                          border: `1.5px solid ${pal.border}`,
                          color: pal.dark800,
                        }
                  }
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = pal.light100;
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = `0 6px 18px ${hexAlpha(pal.dark600, 0.18)}`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = pal.light50;
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }
                  }}
                >
                  {imgSrc ? (
                    <img
                      src={imgSrc}
                      alt=""
                      className="w-8 h-8 rounded-xl object-cover shrink-0"
                      style={{ border: `1.5px solid ${isActive ? "rgba(255,255,255,0.4)" : pal.border}` }}
                    />
                  ) : (
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-base shrink-0"
                      style={{
                        background: isActive ? "rgba(255,255,255,0.22)" : pal.badge,
                        border: `1.5px solid ${isActive ? "rgba(255,255,255,0.35)" : pal.border}`,
                      }}
                    >
                      📚
                    </div>
                  )}
                  <span className="text-base font-extrabold tracking-tight">{t.title}</span>
                  {isActive && (
                    <span
                      className="ml-1 w-2 h-2 rounded-full shrink-0"
                      style={{ background: "#fff", boxShadow: "0 0 6px rgba(255,255,255,0.9)" }}
                    />
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Selected topic confirmation strip */}
        {activeTopic && (
          <div
            className="px-7 py-3 flex items-center gap-3"
            style={{
              background: activePal.light50,
              borderTop: `1px solid ${activePal.border}`,
            }}
          >
            <span style={{ color: activePal.dark600, fontSize: 16 }}>✓</span>
            <p className="text-sm font-semibold" style={{ color: activePal.dark700 }}>
              Selected:{" "}
              <span className="font-extrabold" style={{ color: activePal.dark900 }}>
                {activeTopic.title}
              </span>
            </p>
          </div>
        )}
      </div>

      {/* AGE GROUP SELECTOR */}
      {activeTopic && (
        <div
          className="rounded-3xl overflow-hidden"
          style={{
            background: "linear-gradient(145deg, #fffbeb 0%, #fff 50%, #fef3c7 100%)",
            border: "2px solid #fde68a",
            boxShadow: "0 12px 40px rgba(245,158,11,0.12)",
          }}
        >
          {/* Header */}
          <div
            className="px-7 pt-6 pb-4"
            style={{ borderBottom: "1px solid #fde68a" }}
          >
            <div className="flex items-center gap-3 mb-1">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-base shrink-0"
                style={{ background: "#fef3c7", border: "1.5px solid #fcd34d" }}
              >
                🎯
              </div>
              <p
                className="text-[11px] font-bold uppercase tracking-[0.22em]"
                style={{ color: "#d97706" }}
              >
                Step 2 — Select Age Group
              </p>
            </div>
            <h3
              className="text-xl font-extrabold tracking-tight"
              style={{ color: "#92400e" }}
            >
              Which age band are you viewing?
            </h3>
          </div>

          {/* Age group buttons */}
          <div className="px-7 py-5 flex flex-wrap items-center gap-4">
            {AGE_GROUPS.map((ag) => {
              const isActive = ageFilter === ag;
              return (
                <button
                  key={ag}
                  type="button"
                  onClick={() => setAgeFilter(ag)}
                  className="flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all duration-200"
                  style={
                    isActive
                      ? {
                          background: "linear-gradient(135deg, #f59e0b, #ef4444)",
                          color: "#fff",
                          boxShadow: "0 8px 24px rgba(245,158,11,0.4), 0 0 0 2px rgba(255,255,255,0.4)",
                          transform: "translateY(-2px)",
                          border: "2px solid transparent",
                        }
                      : {
                          background: "#fff",
                          border: "2px solid #fcd34d",
                          color: "#92400e",
                        }
                  }
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "#fef3c7";
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 6px 16px rgba(245,158,11,0.2)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "#fff";
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }
                  }}
                >
                  <span style={{ fontSize: 32, lineHeight: 1 }}>
                    {ag === "6-10" ? "🧒" : "👦"}
                  </span>
                  <div className="text-left">
                    <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
                      Age {ag}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, opacity: isActive ? 0.85 : 0.6, marginTop: 2 }}>
                      {ag === "6-10" ? "Junior swimmers" : "Youth swimmers"}
                    </div>
                  </div>
                  {isActive && (
                    <div
                      className="ml-2 w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: "rgba(255,255,255,0.3)", fontSize: 13 }}
                    >
                      ✓
                    </div>
                  )}
                </button>
              );
            })}

            {/* Lesson count badge */}
            <div
              className="ml-auto flex items-center gap-3 px-5 py-3.5 rounded-2xl shrink-0"
              style={{
                background: "linear-gradient(135deg, #ecfdf5, #d1fae5)",
                border: "2px solid #6ee7b7",
              }}
            >
              <span style={{ fontSize: 22 }}>🎓</span>
              <div>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#065f46", lineHeight: 1 }}>
                  {subtopics.length}
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#059669", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  lesson{subtopics.length !== 1 ? "s" : ""}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Topic hero — uses active topic's dark color shades */}
      {activeTopic && (() => {
        const pal = activePal;
        return (
          <div
            className="relative rounded-3xl overflow-hidden min-h-50 md:min-h-60"
            style={{ boxShadow: `0 20px 50px ${hexAlpha(pal.dark800, 0.22)}` }}
          >
            {topicCoverSrc(activeTopic) ? (
              <>
                <img
                  src={topicCoverSrc(activeTopic)}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(105deg, ${hexAlpha(pal.heroFrom || pal.dark900, 0.92)} 0%, ${hexAlpha(pal.dark800, 0.55)} 45%, ${hexAlpha(pal.dark600, 0.40)} 100%)`,
                  }}
                />
              </>
            ) : (
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(135deg, ${pal.heroFrom || pal.dark900} 0%, ${pal.dark800} 40%, ${pal.dark600} 85%, ${pal.icon} 100%)`,
                }}
              />
            )}
            <div className="relative z-10 p-6 md:p-10 flex flex-col justify-end min-h-50 md:min-h-60">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/70 mb-2">Current topic</p>
              <h1 className="text-2xl md:text-4xl font-extrabold text-white leading-tight drop-shadow-sm">
                {activeTopic.title}
              </h1>
              {activeTopic.description ? (
                <p className="text-sm md:text-base text-white/85 mt-3 max-w-2xl leading-relaxed">
                  {activeTopic.description}
                </p>
              ) : (
                <p className="text-sm text-white/60 mt-2 italic">No description yet — edit this topic from Topics to add one.</p>
              )}
              <div className="flex flex-wrap gap-2 mt-5">
                <span
                  className="px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md"
                  style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.35)", color: "#fff" }}
                >
                  📚 Switch topic in the list above anytime
                </span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Alerts */}
      {error && (
        <div className="px-4 py-3 rounded-2xl text-sm font-semibold" style={{ background: "#fff0f0", border: "2px solid #fca5a5", color: "#991b1b" }}>
          ⚠️ {error}
        </div>
      )}
      {success && (
        <div className="px-4 py-3 rounded-2xl text-sm font-semibold" style={{ background: "#f0fdf4", border: "2px solid #86efac", color: "#166534" }}>
          ✅ {success}
        </div>
      )}

      {/* Form */}
      {showForm && activeTopic && (
        <div
          className="rounded-2xl p-6 space-y-4"
          style={{
            background: `linear-gradient(135deg, ${activePal.light50}, ${activePal.light100})`,
            border: `2px solid ${activePal.border}`,
            boxShadow: `0 8px 32px ${hexAlpha(activePal.dark600, 0.10)}`,
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl">{editingSub ? "✏️" : "➕"}</span>
            <h3 className="text-lg font-bold text-slate-800">
              {editingSub ? "Edit Subtopic" : "New Subtopic"} under{" "}
              <span style={{ color: activePal.dark700 }}>{activeTopic.title}</span>
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs font-bold uppercase tracking-widest block mb-2" style={{ color: activePal.dark700 }}>Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Arm Movements"
                style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = activePal.dark600; e.target.style.boxShadow = `0 0 0 3px ${hexAlpha(activePal.dark600, 0.12)}`; }}
                onBlur={(e) => { e.target.style.borderColor = "#e0e7ff"; e.target.style.boxShadow = "none"; }}
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest block mb-2" style={{ color: activePal.dark700 }}>Age Group *</label>
              <select
                value={form.ageGroup}
                onChange={(e) => setForm({ ...form, ageGroup: e.target.value })}
                style={inputStyle}
              >
                {AGE_GROUPS.map((ag) => (
                  <option key={ag} value={ag}>Age {ag}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest block mb-2" style={{ color: activePal.dark700 }}>Order</label>
              <input
                type="number"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) })}
                min={1}
                style={inputStyle}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              className="px-6 py-2.5 text-white rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5 shadow-md"
              style={{ background: `linear-gradient(135deg, ${activePal.dark700}, ${activePal.dark600})` }}
            >
              {editingSub ? "Update" : "Create"} Subtopic
            </button>
            <button
              onClick={resetForm}
              className="px-6 py-2.5 rounded-xl font-semibold text-sm transition-all"
              style={{ background: "#f1f5f9", border: "2px solid #e2e8f0", color: "#64748b" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Subtopics — card grid using active topic's dark shades */}
      {activeTopic && (() => {
        const pal = activePal;
        const ac = {
          border: pal.border,
          light50: pal.light50,
          light100: pal.light100,
          light200: pal.light200,
          glow: hexAlpha(pal.dark600, 0.11),
          glowHover: hexAlpha(pal.dark600, 0.22),
          chip: pal.badge,
          chipText: pal.badgeText,
          btnFrom: pal.dark800,
          btnTo: pal.dark600,
          iconColor: pal.icon,
          accentDark: pal.dark700,
        };
        return (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 px-1">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-lg shrink-0">🎓</span>
                <h3 className="text-sm font-bold uppercase tracking-widest truncate" style={{ color: "#64748b" }}>
                  Lessons · Age {ageFilter}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => { resetForm(); setShowForm(true); }}
                className="flex items-center gap-2 px-5 py-2.5 text-white rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5 shadow-lg shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${ac.btnFrom}, ${ac.btnTo})`,
                  boxShadow: `0 4px 20px ${ac.glow}`,
                }}
              >
                <span className="text-lg leading-none">+</span> New Subtopic
              </button>
            </div>

            {loading ? (
              <div
                className="rounded-3xl p-16 text-center"
                style={{ background: "#fff", border: `2px solid ${pal.border}`, boxShadow: `0 8px 30px ${ac.glow}` }}
              >
                <div className="text-4xl mb-3 animate-spin">⏳</div>
                <p className="text-slate-500 font-semibold">Loading lessons…</p>
              </div>
            ) : subtopics.length === 0 ? (
              <div
                className="rounded-3xl p-14 md:p-20 text-center"
                style={{
                  background: `linear-gradient(160deg, ${pal.light50} 0%, #fff 40%, ${pal.light100} 100%)`,
                  border: `2px dashed ${pal.border}`,
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8)",
                }}
              >
                <div className="text-6xl mb-4 opacity-90">🏊</div>
                <p className="font-extrabold text-slate-700 text-xl">No lessons for this age band yet</p>
                <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto">
                  Add a subtopic with <span className="font-bold" style={{ color: pal.dark600 }}>+ New Subtopic</span>, or switch age band above.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {subtopics.map((sub, i) => {
                  const contentItems = contentStatus(sub);
                  return (
                    <div
                      key={sub._id}
                      className="rounded-2xl overflow-hidden flex flex-col h-full transition-all duration-300 group/card"
                      style={{
                        background: "#fff",
                        border: `2px solid ${ac.border}`,
                        boxShadow: `0 10px 32px ${ac.glow}`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-6px)";
                        e.currentTarget.style.boxShadow = `0 20px 44px ${ac.glowHover}`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = `0 10px 32px ${ac.glow}`;
                      }}
                    >
                      {/* Top accent bar — dark shade of topic color */}
                      <div
                        className="h-2 w-full shrink-0"
                        style={{ background: `linear-gradient(90deg, ${ac.btnFrom}, ${ac.btnTo})` }}
                      />

                      <div className="p-5 flex flex-col flex-1">
                        {/* Order badge + Lock badge */}
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <div
                            className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-extrabold shrink-0 shadow-sm"
                            style={{
                              background: `linear-gradient(135deg, ${ac.light100}, #fff)`,
                              border: `2px solid ${ac.border}`,
                              color: ac.btnFrom,
                            }}
                          >
                            {sub.order || i + 1}
                          </div>

                          {/* Lock badge — bigger, more prominent */}
                          <span
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold shrink-0"
                            style={
                              sub.isLocked
                                ? {
                                    background: "#fef3c7",
                                    color: "#78350f",
                                    border: "1.5px solid #fbbf24",
                                    fontSize: 13,
                                  }
                                : {
                                    background: "#dcfce7",
                                    color: "#14532d",
                                    border: "1.5px solid #4ade80",
                                    fontSize: 13,
                                  }
                            }
                          >
                            <span style={{ fontSize: 15 }}>{sub.isLocked ? "🔒" : "🔓"}</span>
                            <span style={{ fontWeight: 800 }}>{sub.isLocked ? "Locked" : "Unlocked"}</span>
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className="font-bold text-slate-900 text-lg leading-snug">{sub.title}</h4>
                        <p className="text-xs font-semibold mt-1" style={{ color: "#94a3b8" }}>
                          Age {sub.ageGroup} · Order #{sub.order || i + 1}
                        </p>

                        {/* Content icons — large circular chips */}
                        <div className="mt-4 flex flex-wrap gap-2 min-h-12 items-center">
                          {contentItems.length > 0 ? (
                            contentItems.map((item, ci) => (
                              <span
                                key={ci}
                                className="flex flex-col items-center justify-center rounded-full shrink-0"
                                style={{
                                  width: 48,
                                  height: 48,
                                  background: ac.light100,
                                  border: `2px solid ${ac.border}`,
                                  fontSize: 22,
                                  lineHeight: 1,
                                  boxShadow: `0 2px 8px ${ac.glow}`,
                                }}
                                title={item.label}
                              >
                                {item.icon}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400 font-medium italic">No content yet</span>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="mt-auto pt-5 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => onSelectSubtopic && onSelectSubtopic(sub)}
                            className="flex-1 min-w-30 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.02] shadow-md"
                            style={{
                              background: `linear-gradient(135deg, ${ac.btnFrom}, ${ac.btnTo})`,
                              boxShadow: `0 4px 14px ${ac.glow}`,
                            }}
                          >
                            Open content →
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleLock(sub)}
                            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105"
                            style={
                              sub.isLocked
                                ? {
                                    background: "#dcfce7",
                                    border: "1.5px solid #4ade80",
                                    color: "#14532d",
                                  }
                                : {
                                    background: "#ffedd5",
                                    border: "1.5px solid #fb923c",
                                    color: "#7c2d12",
                                  }
                            }
                            title={sub.isLocked ? "Unlock" : "Lock"}
                          >
                            <span style={{ fontSize: 16 }}>{sub.isLocked ? "🔓" : "🔒"}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => startEdit(sub)}
                            className="w-11 h-11 rounded-xl text-base flex items-center justify-center transition-all hover:scale-110"
                            style={{ background: ac.light100, border: `1.5px solid ${ac.border}`, color: ac.btnFrom }}
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(sub)}
                            disabled={deleting === sub._id}
                            className="w-11 h-11 rounded-xl text-base flex items-center justify-center transition-all hover:scale-110 disabled:opacity-50"
                            style={{ background: "#fee2e2", border: "1.5px solid #fca5a5", color: "#991b1b" }}
                            title="Delete"
                          >
                            {deleting === sub._id ? "⏳" : "🗑️"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}