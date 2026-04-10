import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:4000";
const AGE_GROUPS = ["6-10", "11-15"];

/** Same order as topic cards in kaveesha-topicsManager — subtopic cards follow active topic’s color. */
const TOPIC_COLORS = [
  { bg: "#fff0f6", border: "#f9a8d4", icon: "#ec4899", badge: "#fce7f3", badgeText: "#9d174d", accent: "#db2777" },
  { bg: "#eff6ff", border: "#93c5fd", icon: "#3b82f6", badge: "#dbeafe", badgeText: "#1e40af", accent: "#2563eb" },
  { bg: "#f0fdf4", border: "#86efac", icon: "#22c55e", badge: "#dcfce7", badgeText: "#166534", accent: "#16a34a" },
  { bg: "#fffbeb", border: "#fcd34d", icon: "#f59e0b", badge: "#fef3c7", badgeText: "#92400e", accent: "#d97706" },
  { bg: "#faf5ff", border: "#c4b5fd", icon: "#8b5cf6", badge: "#ede9fe", badgeText: "#6b21a8", accent: "#7c3aed" },
  { bg: "#ecfeff", border: "#67e8f9", icon: "#06b6d4", badge: "#cffafe", badgeText: "#164e63", accent: "#0891b2" },
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
      
      // If creating new subtopic and order is specified, shift existing subtopics
      if (!editingSub && form.order) {
        // Get all subtopics for this topic and age group
        const existingSubs = subtopics.filter(s => s.order >= form.order);
        // Update each existing subtopic to increment their order
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
      
      // Decrement order for remaining subtopics
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
    if (sub.videoUrl) parts.push("🎬");
    if (sub.content) parts.push("📝");
    if (sub.images?.length > 0) parts.push("🖼️");
    if (sub.hasMiniQuiz) parts.push("❓");
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
                background: "#fff",
                border: "2px solid #e0e7ff",
                color: "#4338ca",
                boxShadow: "0 2px 10px rgba(99,102,241,0.08)",
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

      {/* Topic hero */}
      {activeTopic && (
        <div
          className="relative rounded-3xl overflow-hidden min-h-50 md:min-h-60"
          style={{ boxShadow: "0 20px 50px rgba(15,23,42,0.12)" }}
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
                  background: "linear-gradient(105deg, rgba(15,23,42,0.88) 0%, rgba(15,23,42,0.45) 45%, rgba(99,102,241,0.35) 100%)",
                }}
              />
            </>
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #6366f1 85%, #06b6d4 100%)",
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
                style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.35)", color: "#fff" }}
              >
                📚 Switch topic in the list below anytime
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Topic selector */}
      <div
        className="rounded-2xl p-5 md:p-6"
        style={{
          background: "linear-gradient(145deg, #f8faff 0%, #fff 50%, #f0f4ff 100%)",
          border: "2px solid #e0e7ff",
          boxShadow: "0 8px 30px rgba(99,102,241,0.08)",
        }}
      >
        <label className="text-xs font-bold uppercase tracking-widest block mb-3" style={{ color: "#6366f1" }}>
          Topics
        </label>
        <div className="flex flex-wrap gap-2">
          {topics.map((t) => (
            <button
              key={t._id}
              type="button"
              onClick={() => setActiveTopic(t)}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
              style={
                activeTopic?._id === t._id
                  ? {
                      background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                      color: "#fff",
                      boxShadow: "0 6px 20px rgba(99,102,241,0.45)",
                      border: "2px solid transparent",
                    }
                  : {
                      background: "#fff",
                      border: "2px solid #e0e7ff",
                      color: "#475569",
                    }
              }
              onMouseEnter={(e) => {
                if (activeTopic?._id !== t._id) {
                  e.currentTarget.style.borderColor = "#a5b4fc";
                  e.currentTarget.style.color = "#6366f1";
                }
              }}
              onMouseLeave={(e) => {
                if (activeTopic?._id !== t._id) {
                  e.currentTarget.style.borderColor = "#e0e7ff";
                  e.currentTarget.style.color = "#475569";
                }
              }}
            >
              {topicCoverSrc(t) ? (
                <img src={topicCoverSrc(t)} alt="" className="w-7 h-7 rounded-lg object-cover border border-white/30" />
              ) : (
                <span>📚</span>
              )}
              {t.title}
            </button>
          ))}
        </div>
      </div>

      {/* Age group + count */}
      {activeTopic && (
        <div
          className="flex flex-wrap items-center gap-3 p-2 rounded-2xl"
          style={{ background: "#fff", border: "2px solid #e0e7ff", boxShadow: "0 4px 16px rgba(99,102,241,0.06)" }}
        >
          <span className="text-xs font-bold uppercase tracking-widest pl-2" style={{ color: "#94a3b8" }}>
            Age band
          </span>
          <div className="flex flex-wrap gap-2 flex-1">
            {AGE_GROUPS.map((ag) => (
              <button
                key={ag}
                type="button"
                onClick={() => setAgeFilter(ag)}
                className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
                style={
                  ageFilter === ag
                    ? {
                        background: "linear-gradient(135deg, #f59e0b, #ef4444)",
                        color: "#fff",
                        boxShadow: "0 4px 14px rgba(245,158,11,0.4)",
                        border: "2px solid transparent",
                      }
                    : {
                        background: "#fffbeb",
                        border: "2px solid #fde68a",
                        color: "#92400e",
                      }
                }
              >
                {ag === "6-10" ? "🧒" : "👦"} Age {ag}
              </button>
            ))}
          </div>
          <div
            className="flex items-center px-4 py-2 rounded-xl text-sm font-bold shrink-0"
            style={{ background: "linear-gradient(135deg, #ecfdf5, #d1fae5)", border: "2px solid #6ee7b7", color: "#065f46" }}
          >
            {subtopics.length} lesson{subtopics.length !== 1 ? "s" : ""}
          </div>
        </div>
      )}

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
          style={{ background: "linear-gradient(135deg, #eff6ff, #faf5ff)", border: "2px solid #c4b5fd", boxShadow: "0 8px 32px rgba(139,92,246,0.1)" }}
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl">{editingSub ? "✏️" : "➕"}</span>
            <h3 className="text-lg font-bold text-slate-800">
              {editingSub ? "Edit Subtopic" : "New Subtopic"} under{" "}
              <span style={{ color: "#7c3aed" }}>{activeTopic.title}</span>
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs font-bold uppercase tracking-widest block mb-2" style={{ color: "#7c3aed" }}>Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Arm Movements"
                style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = "#7c3aed"; e.target.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.12)"; }}
                onBlur={(e) => { e.target.style.borderColor = "#e0e7ff"; e.target.style.boxShadow = "none"; }}
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest block mb-2" style={{ color: "#7c3aed" }}>Age Group *</label>
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
              <label className="text-xs font-bold uppercase tracking-widest block mb-2" style={{ color: "#7c3aed" }}>Order</label>
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
              style={{ background: "linear-gradient(135deg, #7c3aed, #6366f1)" }}
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

      {/* Subtopics — card grid */}
      {activeTopic && (() => {
        const topicIdx = topics.findIndex((t) => t._id === activeTopic._id);
        const pal = TOPIC_COLORS[(topicIdx >= 0 ? topicIdx : 0) % TOPIC_COLORS.length];
        const ac = {
          border: pal.border,
          glow: hexAlpha(pal.icon, 0.14),
          glowHover: hexAlpha(pal.icon, 0.26),
          chip: pal.badge,
          chipText: pal.badgeText,
          btnFrom: pal.accent,
          btnTo: pal.icon,
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
              style={{ background: "#fff", border: "2px solid #e0e7ff", boxShadow: "0 8px 30px rgba(99,102,241,0.06)" }}
            >
              <div className="text-4xl mb-3 animate-spin">⏳</div>
              <p className="text-slate-500 font-semibold">Loading lessons…</p>
            </div>
          ) : subtopics.length === 0 ? (
            <div
              className="rounded-3xl p-14 md:p-20 text-center"
              style={{
                background: "linear-gradient(160deg, #f8faff 0%, #fff 40%, #eff6ff 100%)",
                border: "2px dashed #c7d2fe",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8)",
              }}
            >
              <div className="text-6xl mb-4 opacity-90">🏊</div>
              <p className="font-extrabold text-slate-700 text-xl">No lessons for this age band yet</p>
              <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto">
                Add a subtopic with <span className="font-bold text-indigo-600">+ New Subtopic</span>, or switch age band above.
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
                    <div
                      className="h-2 w-full shrink-0"
                      style={{ background: `linear-gradient(90deg, ${ac.btnFrom}, ${ac.btnTo})` }}
                    />
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-extrabold shrink-0 shadow-sm"
                          style={{
                            background: `linear-gradient(135deg, ${ac.chip}, #fff)`,
                            border: `2px solid ${ac.border}`,
                            color: ac.chipText,
                          }}
                        >
                          {sub.order || i + 1}
                        </div>
                        <span
                          className="px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0"
                          style={
                            sub.isLocked
                              ? { background: "#fef3c7", color: "#92400e", border: "1px solid #fcd34d" }
                              : { background: "#dcfce7", color: "#166534", border: "1px solid #86efac" }
                          }
                        >
                          {sub.isLocked ? "🔒 Locked" : "🔓 Unlocked"}
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-900 text-lg leading-snug">{sub.title}</h4>
                      <p className="text-xs font-semibold mt-1" style={{ color: "#94a3b8" }}>
                        Age {sub.ageGroup} · Order #{sub.order || i + 1}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-1.5 min-h-8 items-center">
                        {contentItems.length > 0 ? (
                          contentItems.map((icon, ci) => (
                            <span
                              key={ci}
                              className="text-sm w-9 h-9 flex items-center justify-center rounded-xl"
                              style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}
                              title="Has content"
                            >
                              {icon}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 font-medium italic">No content yet</span>
                        )}
                      </div>

                      <div className="mt-auto pt-5 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => onSelectSubtopic && onSelectSubtopic(sub)}
                          className="flex-1 min-w-30 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:scale-[1.02] shadow-md"
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
                          className="px-3 py-2.5 rounded-xl text-xs font-bold transition-all hover:scale-105"
                          style={
                            sub.isLocked
                              ? {
                                  background: "#dcfce7",
                                  border: "1.5px solid #4ade80",
                                  color: "#166534",
                                }
                              : {
                                  background: "#ffedd5",
                                  border: "1.5px solid #fb923c",
                                  color: "#9a3412",
                                }
                          }
                          title={sub.isLocked ? "Unlock" : "Lock"}
                        >
                          {sub.isLocked ? "🔓" : "🔒"}
                        </button>
                        <button
                          type="button"
                          onClick={() => startEdit(sub)}
                          className="w-10 h-10 rounded-xl text-sm flex items-center justify-center transition-all hover:scale-110"
                          style={{ background: "#dbeafe", border: "1.5px solid #93c5fd", color: "#1e40af" }}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(sub)}
                          disabled={deleting === sub._id}
                          className="w-10 h-10 rounded-xl text-sm flex items-center justify-center transition-all hover:scale-110 disabled:opacity-50"
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