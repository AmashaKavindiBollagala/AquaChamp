import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:4000";

const TOPIC_COLORS = [
  { bg: "#fff0f6", border: "#f9a8d4", icon: "#ec4899", badge: "#fce7f3", badgeText: "#9d174d", accent: "#db2777" },
  { bg: "#eff6ff", border: "#93c5fd", icon: "#3b82f6", badge: "#dbeafe", badgeText: "#1e40af", accent: "#2563eb" },
  { bg: "#f0fdf4", border: "#86efac", icon: "#22c55e", badge: "#dcfce7", badgeText: "#166534", accent: "#16a34a" },
  { bg: "#fffbeb", border: "#fcd34d", icon: "#f59e0b", badge: "#fef3c7", badgeText: "#92400e", accent: "#d97706" },
  { bg: "#faf5ff", border: "#c4b5fd", icon: "#8b5cf6", badge: "#ede9fe", badgeText: "#6b21a8", accent: "#7c3aed" },
  { bg: "#ecfeff", border: "#67e8f9", icon: "#06b6d4", badge: "#cffafe", badgeText: "#164e63", accent: "#0891b2" },
];

export default function KaveeshaTopicsManager({ onSelectTopic, compact }) {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [form, setForm] = useState({ title: "", description: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleting, setDeleting] = useState(null);
  const [deleteError, setDeleteError] = useState({ topicId: "", message: "" });
  const [search, setSearch] = useState("");
  const [imageBusyId, setImageBusyId] = useState(null);

  const getToken = () =>
    localStorage.getItem("aquachamp_token") || sessionStorage.getItem("aquachamp_token");

  const topicImageSrc = (topic) => {
    if (!topic?.imageUrl) return null;
    return topic.imageUrl;
  };

  const handleTopicImageUpload = async (topic, file) => {
    if (!file) return;
    setImageBusyId(topic._id);
    try {
      const token = getToken();
      const formData = new FormData();
      formData.append("image", file);
      await axios.put(`${API}/api/topics/${topic._id}/image`, formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      setSuccess("Topic image updated! 🖼️");
      fetchTopics();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload image");
      setTimeout(() => setError(""), 5000);
    } finally {
      setImageBusyId(null);
    }
  };

  const handleTopicImageDelete = async (topic) => {
    if (!topic.imageUrl || !window.confirm("Remove this topic image?")) return;
    setImageBusyId(topic._id);
    try {
      const token = getToken();
      await axios.delete(`${API}/api/topics/${topic._id}/image`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setSuccess("Topic image removed");
      fetchTopics();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove image");
      setTimeout(() => setError(""), 5000);
    } finally {
      setImageBusyId(null);
    }
  };

  const fetchTopics = async () => {
    try {
      const res = await axios.get(`${API}/api/topics`);
      const topicsData = res.data || [];
      const topicsWithCounts = await Promise.all(
        topicsData.map(async (topic) => {
          try {
            const subRes = await axios.get(`${API}/api/subtopics`, {
              params: { topicId: topic._id },
            });
            const subs = Array.isArray(subRes.data)
              ? subRes.data
              : subRes.data?.subtopics || [];
            return { ...topic, subtopicsCount: subs.length };
          } catch {
            return { ...topic, subtopicsCount: 0 };
          }
        })
      );
      setTopics(topicsWithCounts);
    } catch {
      setError("Failed to load topics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTopics(); }, []);

  const resetForm = () => {
    setForm({ title: "", description: "" });
    setEditingTopic(null);
    setShowForm(false);
    setError("");
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) return setError("Title is required");
    setError("");
    try {
      const token = localStorage.getItem("aquachamp_token") || sessionStorage.getItem("aquachamp_token");
      const headers = { Authorization: `Bearer ${token}` };
      if (editingTopic) {
        await axios.put(`${API}/api/topics/${editingTopic._id}`, form, { headers, withCredentials: true });
        setSuccess("Topic updated successfully! ✨");
      } else {
        await axios.post(`${API}/api/topics`, form, { headers, withCredentials: true });
        setSuccess("Topic created successfully! 🎉");
      }
      resetForm();
      fetchTopics();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Error saving topic";
      if (errorMsg.includes("already exists") || errorMsg.includes("duplicate")) {
        setError("⚠️ A topic with this title already exists! Please use a different title.");
      } else {
        setError(errorMsg);
      }
      setTimeout(() => setError(""), 5000);
    }
  };

  const handleDelete = async (topic) => {
    if (!window.confirm(`Delete "${topic.title}"? This cannot be undone.`)) return;
    setDeleting(topic._id);
    setDeleteError({ topicId: "", message: "" });
    try {
      const token = localStorage.getItem("aquachamp_token") || sessionStorage.getItem("aquachamp_token");
      await axios.delete(`${API}/api/topics/${topic._id}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setSuccess("Topic deleted successfully! 🗑️");
      fetchTopics();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Cannot delete topic";
      if (errorMsg.includes("subtopic")) {
        setDeleteError({
          topicId: topic._id,
          message: "⚠️ This topic has subtopics! Please delete all subtopics and their content first before deleting this topic."
        });
      } else {
        setDeleteError({ topicId: topic._id, message: errorMsg });
      }
      setTimeout(() => setDeleteError({ topicId: "", message: "" }), 5000);
    } finally {
      setDeleting(null);
    }
  };

  const startEdit = (topic) => {
    setEditingTopic(topic);
    setForm({ title: topic.title, description: topic.description || "" });
    setShowForm(true);
  };

  const filteredTopics = topics.filter(
    (t) => t.title.toLowerCase().includes(search.toLowerCase())
  );

  const topicsToShow = compact ? filteredTopics.slice(0, 5) : filteredTopics;

  return (
    <div className={compact ? "" : "space-y-6"}>
      {/* Header */}
      {!compact && (
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">📚 Topics</h2>
            <p className="text-slate-500 text-sm mt-1">Manage all swim lesson topics</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 text-white rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 4px 16px rgba(99,102,241,0.4)" }}
          >
            <span className="text-lg">+</span> New Topic
          </button>
        </div>
      )}

      {/* Search Bar */}
      {!compact && (
        <div className="relative">
          <div
            className="flex items-center gap-3 rounded-2xl px-4 py-3"
            style={{
              background: "linear-gradient(135deg, #f8faff, #f0f4ff)",
              border: "2px solid #e0e7ff",
              boxShadow: "0 2px 12px rgba(99,102,241,0.07)",
            }}
          >
            <span className="text-xl">🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search topics by name..."
              className="flex-1 bg-transparent text-slate-700 text-sm placeholder-slate-400 focus:outline-none font-medium"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg transition-colors"
              >
                ×
              </button>
            )}
          </div>
          {search && (
            <div
              className="mt-2 text-xs font-semibold px-2"
              style={{ color: "#6366f1" }}
            >
              Found {filteredTopics.length} topic{filteredTopics.length !== 1 ? "s" : ""} matching "{search}"
            </div>
          )}
        </div>
      )}

      {/* Alerts */}
      {error && (
        <div
          className="px-4 py-3 rounded-2xl text-sm font-semibold flex items-center gap-2"
          style={{ background: "#fff0f0", border: "2px solid #fca5a5", color: "#991b1b" }}
        >
          ⚠️ {error}
        </div>
      )}
      {success && (
        <div
          className="px-4 py-3 rounded-2xl text-sm font-semibold flex items-center gap-2"
          style={{ background: "#f0fdf4", border: "2px solid #86efac", color: "#166534" }}
        >
          ✅ {success}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div
          className="rounded-2xl p-6 space-y-4"
          style={{
            background: "linear-gradient(135deg, #faf5ff, #eff6ff)",
            border: "2px solid #c4b5fd",
            boxShadow: "0 8px 32px rgba(139,92,246,0.12)",
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl">✏️</span>
            <h3 className="text-lg font-bold text-slate-800">
              {editingTopic ? "Edit Topic" : "Create New Topic"}
            </h3>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest block mb-2" style={{ color: "#7c3aed" }}>
              Title *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Freestyle Swimming"
              className="w-full rounded-xl px-4 py-3 text-slate-800 text-sm placeholder-slate-400 focus:outline-none transition-all"
              style={{ background: "#fff", border: "2px solid #c4b5fd", boxShadow: "inset 0 2px 6px rgba(139,92,246,0.06)" }}
              onFocus={(e) => { e.target.style.borderColor = "#7c3aed"; e.target.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.12)"; }}
              onBlur={(e) => { e.target.style.borderColor = "#c4b5fd"; e.target.style.boxShadow = "inset 0 2px 6px rgba(139,92,246,0.06)"; }}
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest block mb-2" style={{ color: "#7c3aed" }}>
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Brief description of this topic..."
              rows={3}
              className="w-full rounded-xl px-4 py-3 text-slate-800 text-sm placeholder-slate-400 focus:outline-none transition-all resize-none"
              style={{ background: "#fff", border: "2px solid #c4b5fd" }}
              onFocus={(e) => { e.target.style.borderColor = "#7c3aed"; }}
              onBlur={(e) => { e.target.style.borderColor = "#c4b5fd"; }}
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              className="px-6 py-2.5 text-white rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg, #7c3aed, #6366f1)" }}
            >
              {editingTopic ? "Update Topic" : "Create Topic"}
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

      {/* Topics Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-80 rounded-2xl animate-pulse" style={{ background: "#f0f4ff" }} />
          ))}
        </div>
      ) : topicsToShow.length === 0 ? (
        <div
          className="text-center py-16 rounded-2xl"
          style={{ background: "linear-gradient(135deg, #f8faff, #f0f4ff)", border: "2px dashed #c7d2fe" }}
        >
          <div className="text-5xl mb-3">📚</div>
          <p className="font-bold text-slate-600 text-lg">
            {search ? `No topics found for "${search}"` : "No topics yet. Create your first!"}
          </p>
          {search && (
            <button
              onClick={() => setSearch("")}
              className="mt-3 text-sm font-semibold px-4 py-2 rounded-xl transition-all"
              style={{ background: "#ede9fe", color: "#7c3aed" }}
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className={compact ? "space-y-2" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"}>
          {topicsToShow.map((topic, idx) => {
            const pal = TOPIC_COLORS[idx % TOPIC_COLORS.length];
            const imgSrc = topicImageSrc(topic);
            const busy = imageBusyId === topic._id;
            return (
              <div
                key={topic._id}
                className={`${compact ? "flex items-center gap-3 px-3 py-2.5 rounded-xl" : "rounded-2xl overflow-hidden flex flex-col h-full transition-all duration-300"} group/topic`}
                style={
                  compact
                    ? {
                        background: "#f0f7ff",
                        border: "1.5px solid #93c5fd",
                      }
                    : {
                        background: "#fff",
                        border: `2px solid ${pal.border}`,
                        boxShadow: `0 8px 28px ${pal.icon}18`,
                      }
                }
                onClick={() => !compact && onSelectTopic && onSelectTopic(topic)}
                onMouseEnter={(e) => {
                  if (!compact) {
                    e.currentTarget.style.transform = "translateY(-6px)";
                    e.currentTarget.style.boxShadow = `0 20px 40px ${pal.icon}28`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!compact) {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = `0 8px 28px ${pal.icon}18`;
                  }
                }}
              >
                {compact ? (
                  <>
                    {imgSrc ? (
                      <img src={imgSrc} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0 border border-white shadow-sm" />
                    ) : (
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-sm shrink-0"
                        style={{ background: pal.badge, color: pal.icon }}
                      >
                        📚
                      </div>
                    )}
                    <span className="flex-1 text-sm text-slate-700 truncate font-semibold">
                      {topic.title}
                    </span>
                    <span className="text-xs font-bold" style={{ color: pal.accent }}>→</span>
                  </>
                ) : (
                  <>
                    {/* ── Cover image area ── */}
                    <div
                      className="relative h-44 w-full shrink-0 overflow-hidden cursor-pointer"
                      style={{ background: `linear-gradient(145deg, ${pal.bg}, ${pal.badge})` }}
                    >
                      {imgSrc ? (
                        <img src={imgSrc} alt="" className="absolute inset-0 w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                          {/* CHANGED: topic icon in cover larger */}
                          
                          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: pal.badgeText }}>
                            Add a cover
                          </span>
                        </div>
                      )}
                      <div
                        className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-black/20 opacity-0 group-hover/topic:opacity-100 transition-opacity duration-300 pointer-events-none"
                        aria-hidden
                      />

                      {/* ── Image action buttons (Update / Remove) ── */}
                      <div
                        className="absolute bottom-3 right-3 left-3 flex flex-wrap justify-end gap-2 z-10"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* CHANGED: Update button — larger, colored */}
                        <label
                          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer shadow-lg backdrop-blur-sm border transition-transform hover:scale-105 ${busy ? "opacity-60 pointer-events-none" : ""}`}
                          style={{
                            background: busy
                              ? "rgba(255,255,255,0.85)"
                              : "linear-gradient(135deg, rgba(99,102,241,0.92), rgba(139,92,246,0.92))",
                            borderColor: "rgba(255,255,255,0.4)",
                            color: "#fff",
                            boxShadow: "0 4px 14px rgba(99,102,241,0.45)",
                            minWidth: "90px",
                          }}
                        >
                          <span className="text-sm">{busy ? "⏳" : "📷"}</span>
                          <span>{busy ? "Uploading…" : "Update Photo"}</span>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/jpg"
                            className="hidden"
                            disabled={busy}
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              e.target.value = "";
                              if (f) handleTopicImageUpload(topic, f);
                            }}
                          />
                        </label>

                        {/* CHANGED: Remove button — larger */}
                        {topic.imageUrl && (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => handleTopicImageDelete(topic)}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold shadow-lg backdrop-blur-sm border transition-transform hover:scale-105 disabled:opacity-50"
                            style={{
                              background: "rgba(254,226,226,0.95)",
                              borderColor: "#fca5a5",
                              color: "#991b1b",
                              minWidth: "80px",
                            }}
                          >
                            <span className="text-sm">🗑️</span>
                            <span>Remove</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* ── Card body ── */}
                    <div className="p-5 flex flex-col flex-1" style={{ borderTop: `3px solid ${pal.accent}` }}>

                      {/* Top row: topic icon + edit/delete buttons */}
                      <div className="flex items-center justify-between gap-2 mb-4">
                        {/* CHANGED: topic icon badge — larger */}
                        <div
                          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-md"
                          style={{
                            background: pal.badge,
                            border: `2.5px solid ${pal.border}`,
                            color: pal.icon,
                          }}
                        >
                          📚
                        </div>

                        {/* CHANGED: Edit & Delete buttons — larger, with labels */}
                        <div className="flex gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); startEdit(topic); }}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105"
                            style={{
                              background: pal.badge,
                              border: `2px solid ${pal.border}`,
                              color: pal.badgeText,
                              boxShadow: `0 2px 8px ${pal.icon}20`,
                            }}
                            title="Edit topic"
                          >
                            <span className="text-sm">✏️</span>
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleDelete(topic); }}
                            disabled={deleting === topic._id}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105 disabled:opacity-50"
                            style={{
                              background: "#fee2e2",
                              border: "2px solid #fca5a5",
                              color: "#991b1b",
                              boxShadow: "0 2px 8px rgba(239,68,68,0.15)",
                            }}
                            title="Delete topic"
                          >
                            <span className="text-sm">{deleting === topic._id ? "⏳" : "🗑️"}</span>
                            <span>{deleting === topic._id ? "Deleting…" : "Delete"}</span>
                          </button>
                        </div>
                      </div>

                      {/* Delete error */}
                      {deleteError.topicId === topic._id && deleteError.message && (
                        <div
                          className="mb-3 px-3 py-2.5 rounded-xl text-xs font-semibold flex items-start gap-2"
                          style={{
                            background: "linear-gradient(135deg, #fef2f2, #fee2e2)",
                            border: "2px solid #fca5a5",
                            color: "#991b1b",
                            boxShadow: "0 2px 8px rgba(239,68,68,0.15)",
                          }}
                        >
                          <span className="text-sm shrink-0">⚠️</span>
                          <span className="leading-relaxed">{deleteError.message}</span>
                        </div>
                      )}

                      {/* Title & description */}
                      <h3 className="font-bold text-slate-800 text-lg leading-tight" style={{ color: "#0f172a" }}>
                        {topic.title}
                      </h3>
                      {topic.description && (
                        <p className="text-sm text-slate-500 mt-2 line-clamp-2 leading-relaxed flex-1">
                          {topic.description}
                        </p>
                      )}

                      {/* Footer: date + subtopics badge + open button */}
                      <div
                        className="mt-4 flex items-center justify-between pt-3 gap-2 flex-wrap"
                        style={{ borderTop: `1px solid ${pal.border}` }}
                      >
                        <div className="flex items-center gap-2 flex-wrap min-w-0">
                          <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
                            📅 {new Date(topic.createdAt).toLocaleDateString()}
                          </span>

                          {/* CHANGED: subtopics badge — bigger, bolder */}
                          {topic.subtopicsCount > 0 && (
                            <span
                              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap shadow-sm"
                              style={{
                                background: `linear-gradient(135deg, ${pal.badge}, ${pal.bg})`,
                                color: pal.badgeText,
                                border: `2px solid ${pal.border}`,
                                boxShadow: `0 2px 8px ${pal.icon}22`,
                              }}
                            >
                              <span className="text-sm">📂</span>
                              <span>{topic.subtopicsCount} Subtopic{topic.subtopicsCount !== 1 ? "s" : ""}</span>
                            </span>
                          )}
                        </div>

                        {/* CHANGED: Open button — larger, more prominent */}
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); onSelectTopic && onSelectTopic(topic); }}
                          className="flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-xl transition-all hover:scale-105 shrink-0"
                          style={{
                            background: `linear-gradient(135deg, ${pal.accent}, ${pal.icon})`,
                            color: "#fff",
                            boxShadow: `0 4px 14px ${pal.icon}50`,
                            letterSpacing: "0.01em",
                          }}
                        >
                          Open <span className="text-base">→</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add button for compact */}
      {compact && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full text-center text-xs py-2.5 rounded-xl transition-all mt-2 font-bold"
          style={{ border: "2px dashed #c7d2fe", color: "#6366f1", background: "#f8faff" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#ede9fe"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "#f8faff"; }}
        >
          + Add New Topic
        </button>
      )}
    </div>
  );
}