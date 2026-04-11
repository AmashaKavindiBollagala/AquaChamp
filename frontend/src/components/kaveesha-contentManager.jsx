import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_KEYS } from "../kaveesha-services/kaveesha-apiConfig";
import { geminiAPI } from "../kaveesha-services/kaveesha-lessonsService";

const API = "http://localhost:4000";

const TABS = [
  { id: "video", label: "Video", icon: "🎬", color: "#ef4444", light: "#fff0f0", border: "#fca5a5", grad: "linear-gradient(135deg,#ef4444,#dc2626)" },
  { id: "text", label: "Text", icon: "📝", color: "#6366f1", light: "#f0f4ff", border: "#a5b4fc", grad: "linear-gradient(135deg,#6366f1,#4f46e5)" },
  { id: "images", label: "Images", icon: "🖼️", color: "#22c55e", light: "#f0fdf4", border: "#86efac", grad: "linear-gradient(135deg,#22c55e,#16a34a)" },
  { id: "quiz", label: "Mini Quiz", icon: "❓", color: "#f59e0b", light: "#fffbeb", border: "#fcd34d", grad: "linear-gradient(135deg,#f59e0b,#d97706)" },
];

const TOPIC_COLORS = [
  { bg:"#fff0f6",border:"#f9a8d4",icon:"#ec4899",badge:"#fce7f3",badgeText:"#9d174d",accent:"#db2777",dark700:"#be185d",dark800:"#9d174d",light50:"#fff0f6",light100:"#fce7f3",heroFrom:"#500724",heroTo:"#9d174d" },
  { bg:"#eff6ff",border:"#93c5fd",icon:"#3b82f6",badge:"#dbeafe",badgeText:"#1e40af",accent:"#2563eb",dark700:"#1d4ed8",dark800:"#1e40af",light50:"#eff6ff",light100:"#dbeafe",heroFrom:"#172554",heroTo:"#1e40af" },
  { bg:"#f0fdf4",border:"#86efac",icon:"#22c55e",badge:"#dcfce7",badgeText:"#166534",accent:"#16a34a",dark700:"#15803d",dark800:"#166534",light50:"#f0fdf4",light100:"#dcfce7",heroFrom:"#052e16",heroTo:"#166534" },
  { bg:"#fffbeb",border:"#fcd34d",icon:"#f59e0b",badge:"#fef3c7",badgeText:"#92400e",accent:"#d97706",dark700:"#b45309",dark800:"#92400e",light50:"#fffbeb",light100:"#fef3c7",heroFrom:"#3b1a00",heroTo:"#92400e" },
  { bg:"#faf5ff",border:"#c4b5fd",icon:"#8b5cf6",badge:"#ede9fe",badgeText:"#6b21a8",accent:"#7c3aed",dark700:"#6d28d9",dark800:"#6b21a8",light50:"#faf5ff",light100:"#ede9fe",heroFrom:"#2e1065",heroTo:"#6b21a8" },
  { bg:"#ecfeff",border:"#67e8f9",icon:"#06b6d4",badge:"#cffafe",badgeText:"#164e63",accent:"#0891b2",dark700:"#0e7490",dark800:"#155e75",light50:"#ecfeff",light100:"#cffafe",heroFrom:"#042f2e",heroTo:"#164e63" },
];

function hexAlpha(hex, alpha) {
  if (!hex || typeof hex !== "string") return `rgba(99,102,241,${alpha})`;
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  if (Number.isNaN(r)) return `rgba(99,102,241,${alpha})`;
  return `rgba(${r},${g},${b},${alpha})`;
}

const inputStyle = {
  background: "#f8faff",
  border: "2px solid #e0e7ff",
  borderRadius: 12,
  padding: "11px 16px",
  color: "#1e293b",
  fontSize: 15,
  width: "100%",
  outline: "none",
  transition: "border-color 0.2s, box-shadow 0.2s",
};

/* ─────────────── MAIN EXPORT ─────────────── */
export default function KaveeshaContentManager({ selectedSubtopic, onBack }) {
  const [subtopics, setSubtopics] = useState([]);
  const [topics, setTopics] = useState([]);
  const [activeSubtopic, setActiveSubtopic] = useState(selectedSubtopic || null);
  const [activeTab, setActiveTab] = useState("video");
  const [subtopic, setSubtopic] = useState(null);
  const [loading, setLoading] = useState(false);
  const [miniQuizFilled, setMiniQuizFilled] = useState(false);
  const [subtopicQuizMap, setSubtopicQuizMap] = useState({});

  const refreshMiniQuizFilled = useCallback(async () => {
    const id = activeSubtopic?._id;
    const ag = activeSubtopic?.ageGroup === "11-15" ? "11-15" : "6-10";
    if (!id) { setMiniQuizFilled(false); return; }
    try {
      const res = await axios.get(`${API}/api/kaveesha-miniquiz`, { params: { subtopicId: id, ageGroup: ag } });
      setMiniQuizFilled(Array.isArray(res.data?.questions) && res.data.questions.length > 0);
    } catch { setMiniQuizFilled(false); }
  }, [activeSubtopic?._id, activeSubtopic?.ageGroup]);

  useEffect(() => { refreshMiniQuizFilled(); }, [refreshMiniQuizFilled]);
  useEffect(() => { axios.get(`${API}/api/topics`).then((r) => setTopics(r.data || [])); }, []);
  useEffect(() => { if (activeSubtopic) fetchSubtopicDetail(); }, [activeSubtopic]);

  const fetchSubtopicDetail = async () => {
    if (!activeSubtopic) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/subtopics/${activeSubtopic._id}`);
      setSubtopic(res.data);
    } catch { setSubtopic(activeSubtopic); }
    finally { setLoading(false); }
  };

  const loadSubtopicsForTopic = async (topicId, ageGroup = "6-10") => {
    const res = await axios.get(`${API}/api/subtopics`, { params: { topicId, ageGroup } });
    const subs = Array.isArray(res.data) ? res.data : res.data?.subtopics || [];
    
    // Check quiz status for each subtopic
    const quizMap = {};
    await Promise.all(
      subs.map(async (sub) => {
        try {
          const quizRes = await axios.get(`${API}/api/kaveesha-miniquiz`, { 
            params: { subtopicId: sub._id, ageGroup: sub.ageGroup || ageGroup } 
          });
          quizMap[sub._id] = Array.isArray(quizRes.data?.questions) && quizRes.data.questions.length > 0;
        } catch {
          quizMap[sub._id] = false;
        }
      })
    );
    setSubtopicQuizMap(quizMap);
    
    return subs;
  };

  const contentFilled = (tab) => {
    if (tab === "quiz") return miniQuizFilled;
    if (!subtopic) return false;
    if (tab === "video") return !!subtopic.videoUrl;
    if (tab === "text") return !!subtopic.content;
    if (tab === "images") return subtopic.images?.length > 0;
    return false;
  };

  // Get content status icons for a subtopic
  const getContentIcons = (sub) => {
    const parts = [];
    if (sub.videoUrl) parts.push({ icon: "🎬", label: "Video" });
    if (sub.content) parts.push({ icon: "📝", label: "Content" });
    if (sub.images?.length > 0) parts.push({ icon: "🖼️", label: "Images" });
    // Check quiz from the map
    if (subtopicQuizMap[sub._id]) parts.push({ icon: "❓", label: "Quiz" });
    return parts;
  };

  return (
    <div style={{ minHeight: "100vh", paddingBottom: 48, fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      {/* ── PAGE HEADER ── */}
      <div
        className="rounded-3xl p-7 mb-7 flex items-center justify-between flex-wrap gap-4"
        style={{
          background: "linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#1e3a5f 100%)",
          boxShadow: "0 20px 60px rgba(15,23,42,0.35)",
        }}
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ background: "rgba(255,255,255,0.12)", border: "1.5px solid rgba(255,255,255,0.2)" }}>🎯</div>
            <div>
              <h2 style={{ fontSize: 26, fontWeight: 900, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1.1 }}>Content Manager</h2>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", fontWeight: 500, marginTop: 2 }}>
                {activeSubtopic
                  ? <><span style={{ color: "#a5b4fc" }}>{activeSubtopic.title}</span><span style={{ color: "rgba(255,255,255,0.4)" }}> · Age {activeSubtopic.ageGroup}</span></>
                  : "Select a subtopic to manage content"}
              </p>
            </div>
          </div>
        </div>
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5"
            style={{ background: "rgba(255,255,255,0.12)", border: "1.5px solid rgba(255,255,255,0.25)", color: "#fff", backdropFilter: "blur(8px)" }}
          >
            ← Back to Subtopics
          </button>
        )}
      </div>

      {/* ── SUBTOPIC PICKER (when not pre-selected) ── */}
      {!selectedSubtopic && (
        <SubtopicPicker
          topics={topics}
          onSelect={(sub) => setActiveSubtopic(sub)}
          onContextChange={() => setActiveSubtopic(null)}
          loadSubtopicsForTopic={loadSubtopicsForTopic}
          activeSubtopic={activeSubtopic}
          topicColors={TOPIC_COLORS}
          getContentIcons={getContentIcons}
        />
      )}

      {/* ── CONTENT AREA ── */}
      {activeSubtopic && (
        <div className="mt-7 space-y-6">
          {/* Active subtopic banner */}
          <div
            className="flex items-center gap-4 px-6 py-4 rounded-2xl"
            style={{ background: "linear-gradient(135deg,#eff6ff,#f0f4ff)", border: "2px solid #c7d2fe" }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: "#e0e7ff", border: "1.5px solid #a5b4fc" }}>📂</div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 800, color: "#6366f1", textTransform: "uppercase", letterSpacing: "0.15em" }}>Now Editing</p>
              <p style={{ fontSize: 18, fontWeight: 800, color: "#1e293b", letterSpacing: "-0.02em" }}>{activeSubtopic.title}</p>
            </div>
            <span className="ml-auto px-3 py-1 rounded-full text-xs font-bold" style={{ background: "#dbeafe", color: "#1e40af", border: "1px solid #93c5fd" }}>Age {activeSubtopic.ageGroup}</span>
          </div>

          {/* ── TAB BAR ── */}
          <div
            className="flex gap-2 p-2 rounded-2xl"
            style={{ background: "#0f172a", boxShadow: "0 8px 32px rgba(15,23,42,0.25)" }}
          >
            {TABS.map((tab) => {
              const filled = contentFilled(tab.id);
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all relative"
                  style={
                    isActive
                      ? { background: tab.grad, color: "#fff", boxShadow: `0 6px 20px ${hexAlpha(tab.color, 0.45)}`, fontSize: 15 }
                      : { background: "transparent", color: "rgba(255,255,255,0.45)", fontSize: 15 }
                  }
                  onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.color = "#fff"; } }}
                  onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.45)"; } }}
                >
                  <span style={{ fontSize: 20 }}>{tab.icon}</span>
                  <span style={{ fontWeight: 800 }}>{tab.label}</span>
                  {filled && (
                    <span className="w-2.5 h-2.5 rounded-full absolute top-2 right-2" style={{ background: "#22c55e", boxShadow: "0 0 8px #22c55e" }} />
                  )}
                </button>
              );
            })}
          </div>

          {/* ── TAB PANEL ── */}
          <div className="rounded-3xl overflow-hidden" style={{ border: "2px solid #e0e7ff", boxShadow: "0 8px 40px rgba(99,102,241,0.08)" }}>
            {/* Panel header strip */}
            {(() => {
              const tab = TABS.find(t => t.id === activeTab);
              return (
                <div className="flex items-center gap-3 px-7 py-5" style={{ background: tab.light, borderBottom: `2px solid ${tab.border}` }}>
                  <span style={{ fontSize: 28 }}>{tab.icon}</span>
                  <h3 style={{ fontSize: 22, fontWeight: 900, color: "#0f172a", letterSpacing: "-0.02em" }}>{tab.label} Content</h3>
                </div>
              );
            })()}

            <div className="p-7" style={{ background: "#fff" }}>
              {loading ? (
                <div className="text-center py-20">
                  <div className="text-5xl mb-4 animate-spin">⏳</div>
                  <p style={{ fontSize: 16, color: "#94a3b8", fontWeight: 600 }}>Loading content…</p>
                </div>
              ) : (
                <>
                  {activeTab === "video" && <VideoPanel subtopic={subtopic} onRefresh={fetchSubtopicDetail} />}
                  {activeTab === "text" && <TextPanel subtopic={subtopic} onRefresh={fetchSubtopicDetail} />}
                  {activeTab === "images" && <ImagesPanel subtopic={subtopic} onRefresh={fetchSubtopicDetail} />}
                  {activeTab === "quiz" && <QuizPanel subtopic={subtopic ?? activeSubtopic} onMiniQuizFilledChange={refreshMiniQuizFilled} />}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────── SUBTOPIC PICKER ─────────────── */
function SubtopicPicker({ topics, loadSubtopicsForTopic, onSelect, onContextChange, activeSubtopic, topicColors, getContentIcons }) {
  const [selTopic, setSelTopic] = useState(null);
  const [selTopicIdx, setSelTopicIdx] = useState(0);
  const [ageGroup, setAgeGroup] = useState("6-10");
  const [subs, setSubs] = useState([]);
  const [loadingSubs, setLoadingSubs] = useState(false);

  const clearParentSelection = () => { onContextChange?.(); };

  const loadSubtopics = async (topic, ag) => {
    setLoadingSubs(true);
    const data = await loadSubtopicsForTopic(topic._id, ag);
    setSubs(data);
    setLoadingSubs(false);
  };

  const selectTopic = async (topic, idx) => {
    clearParentSelection();
    setSelTopic(topic);
    setSelTopicIdx(idx);
    await loadSubtopics(topic, ageGroup);
  };

  const changeAgeGroup = async (ag) => {
    setAgeGroup(ag);
    clearParentSelection();
    if (selTopic) { await loadSubtopics(selTopic, ag); }
    else { setSubs([]); }
  };

  const pal = topicColors[selTopicIdx % topicColors.length];

  return (
    <div className="space-y-5">
      {/* ── STEP 1: AGE GROUP ── */}
      <div
        className="rounded-3xl overflow-hidden"
        style={{ background: "linear-gradient(145deg,#fffbeb,#fff,#fef3c7)", border: "2px solid #fde68a", boxShadow: "0 12px 40px rgba(245,158,11,0.12)" }}
      >
        <div className="px-7 pt-6 pb-4" style={{ borderBottom: "1px solid #fde68a" }}>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#fef3c7", border: "1.5px solid #fcd34d", fontSize: 16 }}>🎯</div>
            <p style={{ fontSize: 11, fontWeight: 800, color: "#d97706", textTransform: "uppercase", letterSpacing: "0.2em" }}>Step 1 — Age Group</p>
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 900, color: "#92400e", letterSpacing: "-0.02em" }}>Which age band are you working on?</h3>
          <p style={{ fontSize: 13, color: "#b45309", marginTop: 4 }}>Changing age reloads subtopics for this age and clears the open lesson.</p>
        </div>
        <div className="px-7 py-5 flex flex-wrap gap-4">
          {["6-10", "11-15"].map((ag) => {
            const isActive = ageGroup === ag;
            return (
              <button key={ag} type="button" onClick={() => changeAgeGroup(ag)}
                className="flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all duration-200"
                style={isActive
                  ? { background: "linear-gradient(135deg,#f59e0b,#ef4444)", color: "#fff", boxShadow: "0 8px 24px rgba(245,158,11,0.4)", transform: "translateY(-2px)", border: "2px solid transparent" }
                  : { background: "#fff", border: "2px solid #fcd34d", color: "#92400e" }}
                onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = "#fef3c7"; e.currentTarget.style.transform = "translateY(-2px)"; } }}
                onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = "#fff"; e.currentTarget.style.transform = "translateY(0)"; } }}
              >
                <span style={{ fontSize: 34, lineHeight: 1 }}>{ag === "6-10" ? "🧒" : "👦"}</span>
                <div className="text-left">
                  <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: "-0.02em" }}>Age {ag}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, opacity: isActive ? 0.85 : 0.6 }}>{ag === "6-10" ? "Junior swimmers" : "Youth swimmers"}</div>
                </div>
                {isActive && <div className="ml-2 w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.3)", fontSize: 13 }}>✓</div>}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── STEP 2: TOPIC ── */}
      <div
        className="rounded-3xl overflow-hidden"
        style={{ background: "linear-gradient(145deg,#f8faff,#fff,#f0f4ff)", border: "2px solid #e0e7ff", boxShadow: "0 8px 32px rgba(99,102,241,0.10)" }}
      >
        <div className="px-7 pt-6 pb-4" style={{ borderBottom: "1px solid #e0e7ff" }}>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#eef2ff", border: "1.5px solid #c7d2fe", fontSize: 16 }}>📚</div>
            <p style={{ fontSize: 11, fontWeight: 800, color: "#6366f1", textTransform: "uppercase", letterSpacing: "0.2em" }}>Step 2 — Topic</p>
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 900, color: "#1e293b", letterSpacing: "-0.02em" }}>Which swimming topic are you working on?</h3>
        </div>
        <div className="px-7 py-5 flex flex-wrap gap-3">
          {topics.length === 0
            ? <p style={{ fontSize: 14, color: "#94a3b8" }}>Loading topics…</p>
            : topics.map((t, idx) => {
              const p = topicColors[idx % topicColors.length];
              const isActive = selTopic?._id === t._id;
              return (
                <button key={t._id} type="button" onClick={() => selectTopic(t, idx)}
                  className="flex items-center gap-3 px-5 py-3 rounded-2xl font-bold transition-all duration-200"
                  style={isActive
                    ? { background: `linear-gradient(135deg,${p.dark700},${p.accent})`, color: "#fff", boxShadow: `0 8px 24px ${hexAlpha(p.accent, 0.4)}`, transform: "translateY(-2px)", border: "2px solid transparent", fontSize: 15 }
                    : { background: p.light50, border: `1.5px solid ${p.border}`, color: p.dark800, fontSize: 15 }}
                  onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = p.light100; e.currentTarget.style.transform = "translateY(-2px)"; } }}
                  onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = p.light50; e.currentTarget.style.transform = "translateY(0)"; } }}
                >
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base" style={{ background: isActive ? "rgba(255,255,255,0.2)" : p.badge, border: `1.5px solid ${isActive ? "rgba(255,255,255,0.35)" : p.border}` }}>📚</div>
                  <span style={{ fontWeight: 800 }}>{t.title}</span>
                  {isActive && <span className="w-2 h-2 rounded-full ml-1" style={{ background: "#fff", boxShadow: "0 0 6px rgba(255,255,255,0.9)" }} />}
                </button>
              );
            })}
        </div>
        {selTopic && (
          <div className="px-7 py-3 flex items-center gap-3" style={{ background: pal.light50, borderTop: `1px solid ${pal.border}` }}>
            <span style={{ color: pal.accent, fontSize: 16 }}>✓</span>
            <p style={{ fontSize: 14, fontWeight: 700, color: pal.dark700 }}>Selected: <span style={{ fontWeight: 900, color: pal.dark800 }}>{selTopic.title}</span></p>
          </div>
        )}
      </div>

      {/* ── STEP 3: SUBTOPICS ── */}
      {selTopic && (
        <div
          className="rounded-3xl overflow-hidden"
          style={{ background: `linear-gradient(145deg,${pal.light50},#fff,${pal.light100})`, border: `2px solid ${pal.border}`, boxShadow: `0 12px 40px ${hexAlpha(pal.accent, 0.10)}` }}
        >
          <div className="px-7 pt-6 pb-4" style={{ borderBottom: `1px solid ${pal.border}` }}>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: pal.badge, border: `1.5px solid ${pal.border}`, fontSize: 16 }}>📂</div>
              <p style={{ fontSize: 11, fontWeight: 800, color: pal.accent, textTransform: "uppercase", letterSpacing: "0.2em" }}>Step 3 — Select Subtopic · Age {ageGroup}</p>
            </div>
            <div className="flex items-center justify-between">
              <h3 style={{ fontSize: 20, fontWeight: 900, color: "#1e293b", letterSpacing: "-0.02em" }}>Pick a lesson to edit its content</h3>
              <span className="px-3 py-1 rounded-full text-sm font-bold" style={{ background: pal.badge, color: pal.dark800, border: `1px solid ${pal.border}` }}>
                {subs.length} lesson{subs.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          <div className="px-7 py-6">
            {loadingSubs ? (
              <div className="text-center py-10">
                <div className="text-3xl animate-spin mb-2">⏳</div>
                <p style={{ fontSize: 14, color: "#94a3b8" }}>Loading lessons…</p>
              </div>
            ) : subs.length === 0 ? (
              <div className="text-center py-10" style={{ background: pal.light50, borderRadius: 16, border: `2px dashed ${pal.border}` }}>
                <div className="text-4xl mb-2">🏊</div>
                <p style={{ fontSize: 15, fontWeight: 700, color: pal.dark800 }}>No subtopics for this topic and age group.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {subs.map((sub) => {
                  const isActive = activeSubtopic?._id === sub._id;
                  return (
                    <button
                      key={sub._id}
                      type="button"
                      onClick={() => onSelect(sub)}
                      className="text-left rounded-2xl overflow-hidden transition-all duration-200"
                      style={isActive
                        ? { background: `linear-gradient(135deg,${pal.dark700},${pal.accent})`, border: `2px solid ${pal.accent}`, boxShadow: `0 10px 28px ${hexAlpha(pal.accent, 0.4)}`, transform: "translateY(-3px)" }
                        : { background: "#fff", border: `2px solid ${pal.border}`, boxShadow: `0 4px 14px ${hexAlpha(pal.accent, 0.07)}` }}
                      onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 10px 24px ${hexAlpha(pal.accent, 0.18)}`; e.currentTarget.style.borderColor = pal.accent; } }}
                      onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = `0 4px 14px ${hexAlpha(pal.accent, 0.07)}`; e.currentTarget.style.borderColor = pal.border; } }}
                    >
                      {/* top bar */}
                      <div className="h-1.5 w-full" style={{ background: isActive ? "rgba(255,255,255,0.4)" : `linear-gradient(90deg,${pal.dark700},${pal.accent})` }} />
                      <div className="p-5">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold" style={{ background: isActive ? "rgba(255,255,255,0.2)" : pal.badge, border: `1.5px solid ${isActive ? "rgba(255,255,255,0.35)" : pal.border}`, color: isActive ? "#fff" : pal.dark800, fontSize: 15 }}>
                            {sub.order || "#"}
                          </div>
                          {isActive && <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: "rgba(255,255,255,0.25)", color: "#fff" }}>✓ Selected</span>}
                        </div>
                        <p style={{ fontSize: 16, fontWeight: 800, color: isActive ? "#fff" : "#0f172a", letterSpacing: "-0.01em", lineHeight: 1.3 }}>{sub.title}</p>
                        <p style={{ fontSize: 13, fontWeight: 600, color: isActive ? "rgba(255,255,255,0.7)" : "#94a3b8", marginTop: 4 }}>Age {sub.ageGroup} · Lesson #{sub.order}</p>
                        
                        {/* Content icons - rounded chips */}
                        <div className="mt-4 flex flex-wrap gap-2 min-h-12 items-center">
                          {(() => {
                            const contentIcons = getContentIcons(sub);
                            return contentIcons.length > 0 ? (
                              contentIcons.map((item, ci) => (
                                <span
                                  key={ci}
                                  className="flex items-center justify-center rounded-full shrink-0"
                                  style={{
                                    width: 40,
                                    height: 40,
                                    background: isActive ? "rgba(255,255,255,0.2)" : pal.light100,
                                    border: `2px solid ${isActive ? "rgba(255,255,255,0.35)" : pal.border}`,
                                    fontSize: 20,
                                    lineHeight: 1,
                                    boxShadow: isActive ? "0 2px 8px rgba(255,255,255,0.2)" : `0 2px 8px ${hexAlpha(pal.accent, 0.15)}`,
                                  }}
                                  title={item.label}
                                >
                                  {item.icon}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs font-medium italic" style={{ color: isActive ? "rgba(255,255,255,0.6)" : "#94a3b8" }}>No content yet</span>
                            );
                          })()}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────── HELPERS ─────────────── */
function Alert({ msg }) {
  if (!msg) return null;
  const isError = msg.startsWith("❌");
  return (
    <div className="flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-semibold"
      style={isError
        ? { background: "linear-gradient(135deg,#fff0f0,#fee2e2)", border: "2px solid #fca5a5", color: "#991b1b", fontSize: 15 }
        : { background: "linear-gradient(135deg,#f0fdf4,#dcfce7)", border: "2px solid #86efac", color: "#166534", fontSize: 15 }}>
      <span style={{ fontSize: 20 }}>{isError ? "⚠️" : "✅"}</span>
      <span>{msg}</span>
    </div>
  );
}

function SectionLabel({ children, color = "#6366f1" }) {
  return <label style={{ fontSize: 12, fontWeight: 800, color, textTransform: "uppercase", letterSpacing: "0.15em", display: "block", marginBottom: 8 }}>{children}</label>;
}

function SaveBtn({ onClick, label = "Save", loading = false }) {
  return (
    <button onClick={onClick} disabled={loading}
      className="flex items-center gap-2 px-7 py-3 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-60"
      style={{ background: "linear-gradient(135deg,#06b6d4,#6366f1)", fontSize: 16 }}>
      <span style={{ fontSize: 18 }}>💾</span>
      {loading ? "Saving…" : label}
    </button>
  );
}

function EditBtn({ onClick, label = "Edit" }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-2 px-7 py-3 rounded-xl font-bold transition-all hover:-translate-y-0.5"
      style={{ background: "linear-gradient(135deg,#fef3c7,#fde68a)", border: "2px solid #fcd34d", color: "#92400e", fontSize: 16 }}>
      <span style={{ fontSize: 18 }}>✏️</span>
      {label}
    </button>
  );
}

function DangerBtn({ onClick, label }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-2 px-7 py-3 rounded-xl font-bold transition-all hover:-translate-y-0.5"
      style={{ background: "linear-gradient(135deg,#fff0f0,#fee2e2)", border: "2px solid #fca5a5", color: "#991b1b", fontSize: 16 }}>
      <span style={{ fontSize: 18 }}>🗑️</span>
      {label}
    </button>
  );
}

/* ─────────────── VIDEO PANEL ─────────────── */
function VideoPanel({ subtopic, onRefresh }) {
  const [url, setUrl] = useState(subtopic?.videoUrl || "");
  const [videoFile, setVideoFile] = useState(null);
  const [videoType, setVideoType] = useState(subtopic?.videoType || "youtube");
  const [youtubeSearch, setYoutubeSearch] = useState("");
  const [youtubeResults, setYoutubeResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");
  const YOUTUBE_API_KEY = API_KEYS?.YOUTUBE || "";

  useEffect(() => { console.log("🔑 YouTube API Key loaded:", YOUTUBE_API_KEY ? "✅ Yes (" + YOUTUBE_API_KEY.substring(0, 10) + "...)" : "❌ No"); }, [YOUTUBE_API_KEY]);

  const searchYouTube = async () => {
    if (!youtubeSearch.trim()) { setMsg("❌ Please enter a search term"); return; }
    if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY.trim() === "") { setMsg("❌ YouTube API key is missing."); return; }
    setSearching(true); setMsg("");
    try {
      const res = await axios.get("https://www.googleapis.com/youtube/v3/search", {
        params: { part: "snippet", q: youtubeSearch, type: "video", maxResults: 12, key: YOUTUBE_API_KEY },
      });
      const items = res.data.items || [];
      if (items.length === 0) { setMsg("⚠️ No videos found."); } else { setYoutubeResults(items); setMsg(`✅ Found ${items.length} videos!`); }
    } catch (err) {
      setMsg(`❌ YouTube API Error: ${err.response?.data?.error?.message || err.message}`);
    } finally { setSearching(false); }
  };

  const saveVideo = async () => {
    if (!subtopic?._id) return;
    try {
      const token = localStorage.getItem("aquachamp_token") || sessionStorage.getItem("aquachamp_token");
      if (videoType === "upload" && videoFile) {
        setUploading(true);
        const formData = new FormData();
        formData.append("video", videoFile);
        formData.append("videoType", "upload");
        await axios.put(`${API}/api/subtopics/video/${subtopic._id}`, formData, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }, withCredentials: true,
        });
        setUploading(false); setMsg("✅ Video uploaded successfully!");
      } else if (videoType === "youtube" && url.trim()) {
        await axios.put(`${API}/api/subtopics/video/${subtopic._id}`, { videoUrl: url, videoType: "youtube" }, {
          headers: { Authorization: `Bearer ${token}` }, withCredentials: true,
        });
        setMsg("✅ YouTube video saved!");
      } else { return setMsg("❌ Please select a video or enter a YouTube URL"); }
      onRefresh?.(); setTimeout(() => setMsg(""), 3000);
    } catch (err) { setUploading(false); setMsg("❌ Failed to save video: " + (err.response?.data?.message || "Unknown error")); }
  };

  const deleteVideo = async () => {
    if (!window.confirm("Remove this video?")) return;
    try {
      const token = localStorage.getItem("aquachamp_token") || sessionStorage.getItem("aquachamp_token");
      await axios.delete(`${API}/api/subtopics/video/${subtopic._id}`, { headers: { Authorization: `Bearer ${token}` }, withCredentials: true });
      setUrl(""); setVideoFile(null); setMsg("✅ Video removed"); onRefresh?.(); setTimeout(() => setMsg(""), 3000);
    } catch { setMsg("❌ Failed to delete"); }
  };

  const getYouTubeId = (u) => { const m = u?.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/); return m ? m[1] : null; };
  const videoId = getYouTubeId(url);

  return (
    <div className="space-y-6">
      {/* Source Selector */}
      <div className="rounded-2xl p-5 space-y-4" style={{ background: "linear-gradient(135deg,#fff5f5,#fff0f0)", border: "2px solid #fca5a5" }}>
        <SectionLabel color="#ef4444">📹 Video Source</SectionLabel>
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: "youtube", icon: "🔍", label: "Search YouTube" },
            { id: "upload", icon: "📁", label: "Upload Video" },
          ].map(({ id, icon, label }) => (
            <button key={id} onClick={() => setVideoType(id)}
              className="flex items-center justify-center gap-3 px-4 py-4 rounded-xl font-bold transition-all"
              style={videoType === id
                ? { background: "linear-gradient(135deg,#ef4444,#dc2626)", color: "#fff", boxShadow: "0 6px 20px rgba(239,68,68,0.4)", fontSize: 16 }
                : { background: "#fff", border: "2px solid #fca5a5", color: "#991b1b", fontSize: 16 }}>
              <span style={{ fontSize: 22 }}>{icon}</span> {label}
            </button>
          ))}
        </div>
      </div>

      {/* YouTube Section */}
      {videoType === "youtube" && (
        <div className="space-y-5">
          <div className="rounded-2xl p-5 space-y-4" style={{ background: "#fff5f5", border: "2px solid #fca5a5" }}>
            <SectionLabel color="#ef4444">🔍 Search YouTube Videos</SectionLabel>
            <div className="flex gap-3">
              <input value={youtubeSearch} onChange={(e) => setYoutubeSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && searchYouTube()}
                placeholder="Search swimming tutorials…" style={{ ...inputStyle, background: "#fff", border: "2px solid #fca5a5", fontSize: 15 }}
                onFocus={(e) => { e.target.style.borderColor = "#ef4444"; }} onBlur={(e) => { e.target.style.borderColor = "#fca5a5"; }} />
              <button onClick={searchYouTube} disabled={searching}
                className="px-5 py-3 text-white rounded-xl font-bold transition-all disabled:opacity-50 hover:-translate-y-0.5 shrink-0"
                style={{ background: "linear-gradient(135deg,#ef4444,#dc2626)", boxShadow: "0 4px 16px rgba(239,68,68,0.4)", fontSize: 15 }}>
                {searching ? "…" : "Search"}
              </button>
            </div>
          </div>

          {youtubeResults.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {youtubeResults.map((item) => (
                <button key={item.id.videoId} onClick={() => setUrl(`https://www.youtube.com/watch?v=${item.id.videoId}`)}
                  className="text-left rounded-2xl overflow-hidden transition-all hover:-translate-y-1"
                  style={{ border: url.includes(item.id.videoId) ? "2.5px solid #ef4444" : "2px solid #e0e7ff", boxShadow: "0 4px 12px rgba(0,0,0,0.07)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#fca5a5"; e.currentTarget.style.boxShadow = "0 10px 24px rgba(0,0,0,0.12)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = url.includes(item.id.videoId) ? "#ef4444" : "#e0e7ff"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.07)"; }}>
                  <img src={item.snippet.thumbnails.medium.url} alt={item.snippet.title} className="w-full h-32 object-cover" />
                  <div className="p-3 bg-white"><p className="text-xs text-slate-600 line-clamp-2 font-semibold">{item.snippet.title}</p></div>
                </button>
              ))}
            </div>
          )}

          <div>
            <SectionLabel color="#ef4444">YouTube URL</SectionLabel>
            <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=…"
              style={{ ...inputStyle, fontSize: 15, border: "2px solid #fca5a5" }}
              onFocus={(e) => { e.target.style.borderColor = "#ef4444"; }} onBlur={(e) => { e.target.style.borderColor = "#fca5a5"; }} />
          </div>
        </div>
      )}

      {/* Upload Section */}
      {videoType === "upload" && (
        <div>
          <SectionLabel color="#ef4444">📁 Upload Video File</SectionLabel>
          <label className="flex flex-col items-center justify-center rounded-2xl p-12 text-center cursor-pointer transition-all"
            style={{ border: "2.5px dashed #fca5a5", background: "#fff5f5" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#ef4444"; e.currentTarget.style.background = "#fee2e2"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#fca5a5"; e.currentTarget.style.background = "#fff5f5"; }}>
            <input type="file" accept="video/*" className="hidden" onChange={(e) => { const f = e.target.files[0]; if (f) { setVideoFile(f); setUrl(""); } }} />
            <div style={{ fontSize: 52, marginBottom: 12 }}>🎥</div>
            <p style={{ fontSize: 16, fontWeight: 800, color: "#b91c1c" }}>{videoFile ? `✅ ${videoFile.name}` : "Click to upload video"}</p>
            <p style={{ fontSize: 14, color: "#ef4444", marginTop: 6 }}>MP4, WebM, AVI supported (Max 100MB)</p>
          </label>
          {videoFile && (
            <div className="mt-4 flex items-center gap-3 px-5 py-4 rounded-2xl" style={{ background: "#dcfce7", border: "2px solid #86efac" }}>
              <span style={{ fontSize: 22 }}>✅</span>
              <div>
                <p style={{ fontSize: 15, fontWeight: 800, color: "#166534" }}>{videoFile.name}</p>
                <p style={{ fontSize: 13, color: "#16a34a" }}>{(videoFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Preview */}
      {(videoId || (subtopic?.videoType === "upload" && subtopic?.videoUrl)) && (
        <div>
          <SectionLabel color="#ef4444">📺 Video Preview</SectionLabel>
          <div className="rounded-2xl overflow-hidden" style={{ border: "3px solid #fca5a5", boxShadow: "0 12px 40px rgba(239,68,68,0.15)" }}>
            {videoId
              ? <iframe src={`https://www.youtube.com/embed/${videoId}`} className="w-full" style={{ height: 460 }} allowFullScreen title="YouTube preview" />
              : <video controls className="w-full" style={{ height: 460, background: "#000" }} src={subtopic.videoUrl.startsWith("/") ? `${API}${subtopic.videoUrl}` : subtopic.videoUrl}>Your browser does not support the video tag.</video>}
          </div>
        </div>
      )}

      <Alert msg={msg} />
      <div className="flex gap-3 flex-wrap pt-2">
        <SaveBtn onClick={saveVideo} label={uploading ? "Uploading…" : "Save Video"} loading={uploading} />
        {subtopic?.videoUrl && <DangerBtn onClick={deleteVideo} label="Remove Video" />}
      </div>
    </div>
  );
}

/* ─────────────── TEXT PANEL ─────────────── */
function TextPanel({ subtopic, onRefresh }) {
  const [content, setContent] = useState(subtopic?.content || "");
  const [contentFiles, setContentFiles] = useState(subtopic?.contentFiles || []);
  const [contentType, setContentType] = useState(subtopic?.contentType || "text");
  const [msg, setMsg] = useState("");
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [hasSavedContent, setHasSavedContent] = useState(!!subtopic?.content);

  const saveText = async () => {
    if (!subtopic?._id) return;
    try {
      const token = localStorage.getItem("aquachamp_token") || sessionStorage.getItem("aquachamp_token");
      await axios.put(`${API}/api/subtopics/text/${subtopic._id}`, { content, contentType, contentFiles }, {
        headers: { Authorization: `Bearer ${token}` }, withCredentials: true,
      });
      setMsg("✅ Content saved successfully!"); 
      setIsEditing(false); 
      setHasSavedContent(true);
      onRefresh?.(); 
      setTimeout(() => setMsg(""), 3000);
    } catch (err) { setMsg("❌ Failed to save content: " + (err.response?.data?.message || "Unknown error")); }
  };

  const deleteText = async () => {
    if (!window.confirm("Are you sure you want to delete this lesson content?")) return;
    try {
      const token = localStorage.getItem("aquachamp_token") || sessionStorage.getItem("aquachamp_token");
      await axios.delete(`${API}/api/subtopics/text/${subtopic._id}`, { headers: { Authorization: `Bearer ${token}` }, withCredentials: true });
      setContent(""); 
      setContentFiles([]); 
      setContentType("text"); 
      setHasSavedContent(false);
      setIsEditing(false);
      setMsg("✅ Lesson content deleted successfully!"); 
      onRefresh?.(); 
      setTimeout(() => setMsg(""), 3000);
    } catch (err) { setMsg("❌ Failed to delete: " + (err.response?.data?.message || "Unknown error")); }
  };

  const deleteContentFile = async (fileId, fileName) => {
    if (!window.confirm(`Delete "${fileName}"?`)) return;
    try {
      const token = localStorage.getItem("aquachamp_token") || sessionStorage.getItem("aquachamp_token");
      const res = await axios.delete(`${API}/api/subtopics/content-file/${subtopic._id}`, {
        headers: { Authorization: `Bearer ${token}` }, withCredentials: true, data: { fileId }
      });
      const remainingFiles = res.data.contentFiles || [];
      setContentFiles(remainingFiles);
      if (remainingFiles.length > 0) setContentType("files");
      setMsg("✅ File deleted successfully!");
      if (onRefresh) onRefresh();
      setTimeout(() => setMsg(""), 3000);
    } catch (err) { setMsg("❌ Failed to delete file: " + (err.response?.data?.message || "Unknown error")); setTimeout(() => setMsg(""), 5000); }
  };

  const insertFormat = (format) => {
    const textarea = document.getElementById('lesson-textarea');
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    let formattedText = '';
    switch(format) {
      case 'bold':
        formattedText = `**${selectedText || 'bold text'}**`;
        break;
      case 'italic':
        formattedText = `_${selectedText || 'italic text'}_`;
        break;
      case 'numbered':
        formattedText = `\n1. First item\n2. Second item\n3. Third item`;
        break;
      case 'bullet':
        formattedText = `\n• First item\n• Second item\n• Third item`;
        break;
      case 'heading':
        formattedText = `\n# ${selectedText || 'Heading'}`;
        break;
      default:
        return;
    }
    
    const newContent = content.substring(0, start) + formattedText + content.substring(end);
    setContent(newContent);
    
    setTimeout(() => {
      textarea.focus();
      const newPos = start + formattedText.length;
      textarea.setSelectionRange(start, newPos);
    }, 0);
  };

  const hasContent = !!content || contentFiles.length > 0;

  return (
    <div className="space-y-6">
      {/* Type Selector */}
      <div className="rounded-2xl p-5 space-y-4" style={{ background: "linear-gradient(135deg,#faf5ff,#eff6ff)", border: "2px solid #c4b5fd" }}>
        <SectionLabel color="#7c3aed">📚 Content Type</SectionLabel>
        <div className="grid grid-cols-2 gap-3">
          {[{ id: "text", icon: "✍️", label: "Write Text" }, { id: "files", icon: "📁", label: "Upload Files" }].map(({ id, icon, label }) => (
            <button key={id} onClick={() => setContentType(id)}
              className="flex items-center justify-center gap-3 px-4 py-4 rounded-xl font-bold transition-all"
              style={contentType === id
                ? { background: "linear-gradient(135deg,#7c3aed,#6366f1)", color: "#fff", boxShadow: "0 6px 20px rgba(124,58,237,0.4)", fontSize: 16 }
                : { background: "#fff", border: "2px solid #c4b5fd", color: "#6b21a8", fontSize: 16 }}>
              <span style={{ fontSize: 22 }}>{icon}</span> {label}
            </button>
          ))}
        </div>
      </div>

      {contentType === "text" && (
        <>
          {/* Text Editor */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <SectionLabel color="#6366f1">Lesson Content</SectionLabel>
              <span style={{ fontSize: 13, color: "#94a3b8", fontWeight: 600 }}>{content.length} characters</span>
            </div>
            
            {/* Formatting Toolbar - only show when editing */}
            {isEditing && (
              <div className="flex gap-2 mb-3 p-3 rounded-xl" style={{ background: "#f8faff", border: "2px solid #e0e7ff" }}>
                <button onClick={() => insertFormat('bold')} className="px-3 py-2 rounded-lg font-bold text-sm transition-all hover:scale-105" style={{ background: "#fff", border: "1.5px solid #c4b5fd", color: "#6366f1" }} title="Bold">
                  𝐁 Bold
                </button>
                <button onClick={() => insertFormat('italic')} className="px-3 py-2 rounded-lg text-sm transition-all hover:scale-105" style={{ background: "#fff", border: "1.5px solid #c4b5fd", color: "#6366f1", fontStyle: "italic" }} title="Italic">
                  𝐼 Italic
                </button>
                <button onClick={() => insertFormat('heading')} className="px-3 py-2 rounded-lg font-bold text-sm transition-all hover:scale-105" style={{ background: "#fff", border: "1.5px solid #c4b5fd", color: "#6366f1" }} title="Heading">
                  H Heading
                </button>
                <button onClick={() => insertFormat('numbered')} className="px-3 py-2 rounded-lg text-sm transition-all hover:scale-105" style={{ background: "#fff", border: "1.5px solid #c4b5fd", color: "#6366f1" }} title="Numbered List">
                  1. List
                </button>
                <button onClick={() => insertFormat('bullet')} className="px-3 py-2 rounded-lg text-sm transition-all hover:scale-105" style={{ background: "#fff", border: "1.5px solid #c4b5fd", color: "#6366f1" }} title="Bullet List">
                  • List
                </button>
              </div>
            )}
            
            <textarea 
              id="lesson-textarea"
              value={content} 
              onChange={(e) => setContent(e.target.value)} 
              rows={14}
              readOnly={!isEditing && hasSavedContent}
              placeholder={hasSavedContent ? (isEditing ? "Edit your lesson content here…" : "Content saved. Click 'Edit Text' to make changes.") : "Write your lesson content here…"}
              style={{ 
                ...inputStyle, 
                resize: "none", 
                fontFamily: "monospace", 
                lineHeight: 1.8, 
                fontSize: 15,
                opacity: (!isEditing && hasSavedContent) ? 0.8 : 1,
                cursor: (!isEditing && hasSavedContent) ? "default" : "text"
              }}
              onFocus={(e) => { if (isEditing || !hasSavedContent) { e.target.style.borderColor = "#6366f1"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.1)"; } }}
              onBlur={(e) => { e.target.style.borderColor = "#e0e7ff"; e.target.style.boxShadow = "none"; }} 
            />
          </div>
          
          <Alert msg={msg} />
          <div className="flex gap-3 flex-wrap pt-2">
            {/* If no saved content yet, show Save button */}
            {!hasSavedContent && (
              <SaveBtn onClick={saveText} label="💾 Save Text" />
            )}
            
            {/* If content is saved, show Edit and Delete buttons */}
            {hasSavedContent && !isEditing && (
              <>
                <EditBtn onClick={() => setIsEditing(true)} label="✏️ Edit Text" />
                <DangerBtn onClick={deleteText} label="🗑️ Delete Text" />
              </>
            )}
            
            {/* If editing saved content, show Save button */}
            {hasSavedContent && isEditing && (
              <SaveBtn onClick={saveText} label="💾 Save Changes" />
            )}
          </div>
        </>
      )}

      {contentType === "files" && (
        <div className="space-y-5">
          <div>
            <SectionLabel color="#6366f1">📁 Upload Documents (PDF, PPT, PPTX)</SectionLabel>
            <label className="flex flex-col items-center justify-center rounded-2xl p-12 text-center cursor-pointer transition-all"
              style={{ border: "2.5px dashed #c4b5fd", background: "#faf5ff" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#7c3aed"; e.currentTarget.style.background = "#ede9fe"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#c4b5fd"; e.currentTarget.style.background = "#faf5ff"; }}>
              <input type="file" accept=".pdf,.ppt,.pptx" className="hidden" onChange={async (e) => {
                const file = e.target.files[0];
                if (file) {
                  setUploadingFiles(true);
                  try {
                    const token = localStorage.getItem("aquachamp_token") || sessionStorage.getItem("aquachamp_token");
                    const formData = new FormData();
                    formData.append("contentFile", file);
                    const fileType = file.name.endsWith(".pdf") ? "pdf" : "presentation";
                    formData.append("fileType", fileType);
                    const res = await axios.put(`${API}/api/subtopics/content-file/${subtopic._id}`, formData, {
                      headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }, withCredentials: true,
                    });
                    setContentFiles(res.data.contentFiles || []);
                    setMsg("✅ File uploaded successfully!");
                    setTimeout(() => setMsg(""), 3000);
                  } catch (err) { setMsg("❌ Failed to upload: " + (err.response?.data?.message || "Unknown error")); }
                  finally { setUploadingFiles(false); }
                }
              }} />
              <div style={{ fontSize: 52, marginBottom: 12 }}>📁</div>
              <p style={{ fontSize: 16, fontWeight: 800, color: "#6d28d9" }}>{contentFiles.length > 0 ? `📎 ${contentFiles.length} file(s) uploaded` : "Click to upload files"}</p>
              <p style={{ fontSize: 14, color: "#8b5cf6", marginTop: 6 }}>PDF, PPT, PPTX supported (Max 20MB each)</p>
            </label>
          </div>

          {contentFiles.length > 0 && (
            <div>
              <SectionLabel color="#7c3aed">📚 Uploaded Files</SectionLabel>
              <div className="space-y-3">
                {contentFiles.map((file, i) => (
                  <div key={file._id || i} className="flex items-center justify-between px-5 py-4 rounded-2xl" style={{ background: "#f3e8ff", border: "2px solid #c4b5fd" }}>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span style={{ fontSize: 28 }}>{file.type === "pdf" ? "📄" : "📊"}</span>
                      <div className="flex-1 min-w-0">
                        <p style={{ fontSize: 15, fontWeight: 800, color: "#6b21a8" }} className="truncate">{file.name}</p>
                        <p style={{ fontSize: 13, color: "#7c3aed" }}>{file.type === "pdf" ? "PDF Document" : "Presentation"} · {(file.size / 1024).toFixed(2)} KB</p>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-3">
                      <a href={file.url.startsWith("/") ? `${API}${file.url}` : file.url} target="_blank" rel="noopener noreferrer"
                        className="px-3 py-2 rounded-xl text-sm font-bold" style={{ background: "#7c3aed", color: "#fff", fontSize: 13 }}>👁️ View</a>
                      <label className="px-3 py-2 rounded-xl text-sm font-bold cursor-pointer transition-all hover:scale-105" style={{ background: "#dbeafe", border: "1.5px solid #93c5fd", color: "#1e40af", fontSize: 13 }}>
                        🔄 Update
                        <input type="file" accept=".pdf,.ppt,.pptx" className="hidden" onChange={async (e) => {
                          const newFile = e.target.files[0];
                          if (newFile) {
                            setUploadingFiles(true);
                            try {
                              const token = localStorage.getItem("aquachamp_token") || sessionStorage.getItem("aquachamp_token");
                              await axios.delete(`${API}/api/subtopics/content-file/${subtopic._id}`, { headers: { Authorization: `Bearer ${token}` }, withCredentials: true, data: { fileId: file._id } });
                              const formData = new FormData();
                              formData.append("contentFile", newFile);
                              const fileType = newFile.name.endsWith(".pdf") ? "pdf" : "presentation";
                              formData.append("fileType", fileType);
                              const res = await axios.put(`${API}/api/subtopics/content-file/${subtopic._id}`, formData, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }, withCredentials: true });
                              setContentFiles(res.data.contentFiles || []);
                              setMsg("✅ File updated successfully!");
                              setTimeout(() => setMsg(""), 3000);
                            } catch (err) { setMsg("❌ Failed to update: " + (err.response?.data?.message || "Unknown error")); }
                            finally { setUploadingFiles(false); }
                          }
                        }} />
                      </label>
                      <button onClick={() => deleteContentFile(file._id, file.name)} className="px-3 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105" style={{ background: "#fee2e2", border: "1.5px solid #fca5a5", color: "#991b1b", fontSize: 13 }}>🗑️ Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─────────────── IMAGES PANEL ─────────────── */
function ImagesPanel({ subtopic, onRefresh }) {
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [msg, setMsg] = useState("");
  const [uploadingFile, setUploadingFile] = useState(false);
  const [addingUrl, setAddingUrl] = useState(false);
  const [updatingPath, setUpdatingPath] = useState(null);

  const deleteImages = async () => {
    if (!window.confirm("Remove all images?")) return;
    try {
      const token = localStorage.getItem("aquachamp_token") || sessionStorage.getItem("aquachamp_token");
      await axios.delete(`${API}/api/subtopics/images/${subtopic._id}`, { headers: { Authorization: `Bearer ${token}` }, withCredentials: true });
      setMsg("✅ Images removed"); onRefresh?.(); setTimeout(() => setMsg(""), 3000);
    } catch { setMsg("❌ Failed to delete"); }
  };

  const deleteSingleImage = async (imagePath, index) => {
    if (!window.confirm(`Delete image #${index + 1}?`)) return;
    try {
      const token = localStorage.getItem("aquachamp_token") || sessionStorage.getItem("aquachamp_token");
      await axios.delete(`${API}/api/subtopics/image/${subtopic._id}`, { headers: { Authorization: `Bearer ${token}` }, withCredentials: true, data: { imagePath } });
      setMsg("✅ Image deleted successfully!"); onRefresh?.(); setTimeout(() => setMsg(""), 3000);
    } catch (err) { setMsg("❌ Failed to delete image: " + (err.response?.data?.message || "Unknown error")); }
  };

  const appendOneFile = async (e) => {
    const file = e.target.files?.[0]; e.target.value = "";
    if (!file || !subtopic?._id) return;
    setUploadingFile(true); setMsg("");
    try {
      const token = localStorage.getItem("aquachamp_token") || sessionStorage.getItem("aquachamp_token");
      const formData = new FormData(); formData.append("image", file);
      await axios.put(`${API}/api/subtopics/images/${subtopic._id}/append`, formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }, withCredentials: true,
      });
      setMsg("✅ Image uploaded!"); onRefresh?.(); setTimeout(() => setMsg(""), 3000);
    } catch (err) { setMsg("❌ " + (err.response?.data?.message || "Upload failed")); }
    finally { setUploadingFile(false); }
  };

  const addImageUrl = async () => {
    const url = imageUrlInput.trim();
    if (!url || !subtopic?._id) { setMsg("❌ Enter a valid image URL"); return; }
    setAddingUrl(true); setMsg("");
    try {
      const token = localStorage.getItem("aquachamp_token") || sessionStorage.getItem("aquachamp_token");
      await axios.put(`${API}/api/subtopics/images/${subtopic._id}/url`, { imageUrl: url }, { headers: { Authorization: `Bearer ${token}` }, withCredentials: true });
      setImageUrlInput(""); setMsg("✅ Image URL added!"); onRefresh?.(); setTimeout(() => setMsg(""), 3000);
    } catch (err) { setMsg("❌ " + (err.response?.data?.message || "Failed to add URL")); }
    finally { setAddingUrl(false); }
  };

  return (
    <div className="space-y-6">
      {/* Existing Images Grid */}
      {subtopic?.images?.length > 0 && (
        <div>
          <SectionLabel color="#16a34a">Current Images ({subtopic.images.length})</SectionLabel>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {subtopic.images.map((img, i) => (
              <div key={`${img}-${i}`} className="rounded-2xl overflow-hidden flex flex-col" style={{ border: "2px solid #bbf7d0", background: "#f0fdf4", boxShadow: "0 4px 16px rgba(34,197,94,0.1)" }}>
                <img src={img.startsWith("/uploads") ? `${API}${img}` : img} alt={`img-${i + 1}`} className="h-36 w-full object-cover" />
                <div className="p-3 flex flex-col gap-2">
                  <span style={{ fontSize: 13, fontWeight: 800, color: "#166534", textAlign: "center" }}>Image #{i + 1}</span>
                  <div className="flex gap-2 justify-center flex-wrap">
                    <label className="px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all hover:scale-105" style={{ background: "#dbeafe", border: "1.5px solid #93c5fd", color: "#1e40af", fontSize: 12 }}>
                      {updatingPath === img ? "⏳" : "🔄 Update"}
                      <input type="file" accept="image/*" className="hidden" disabled={updatingPath === img} onChange={async (ev) => {
                        const file = ev.target.files?.[0]; ev.target.value = ""; if (!file) return;
                        setUpdatingPath(img); setMsg("");
                        try {
                          const token = localStorage.getItem("aquachamp_token") || sessionStorage.getItem("aquachamp_token");
                          const formData = new FormData(); formData.append("image", file); formData.append("oldImagePath", img); formData.append("imageIndex", String(i));
                          await axios.put(`${API}/api/subtopics/image/${subtopic._id}`, formData, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }, withCredentials: true });
                          setMsg("✅ Image updated successfully!"); onRefresh?.(); setTimeout(() => setMsg(""), 3000);
                        } catch (err) { setMsg("❌ Failed to update image: " + (err.response?.data?.message || "Unknown error")); }
                        finally { setUpdatingPath(null); }
                      }} />
                    </label>
                    <button type="button" onClick={() => deleteSingleImage(img, i)} className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:scale-105" style={{ background: "#fee2e2", border: "1.5px solid #fca5a5", color: "#991b1b", fontSize: 12 }}>🗑️ Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload */}
      <div>
        <SectionLabel color="#16a34a">Upload from Device</SectionLabel>
        <label className="flex flex-col items-center justify-center rounded-2xl p-12 text-center cursor-pointer transition-all"
          style={{ border: "2.5px dashed #86efac", background: "#f0fdf4", opacity: uploadingFile ? 0.7 : 1 }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#22c55e"; e.currentTarget.style.background = "#dcfce7"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#86efac"; e.currentTarget.style.background = "#f0fdf4"; }}>
          <input type="file" accept="image/*" className="hidden" disabled={uploadingFile} onChange={appendOneFile} />
          <div style={{ fontSize: 52, marginBottom: 12 }}>📁</div>
          <p style={{ fontSize: 16, fontWeight: 800, color: "#15803d" }}>{uploadingFile ? "Uploading…" : "Click to add one image"}</p>
          <p style={{ fontSize: 14, color: "#22c55e", marginTop: 6 }}>PNG, JPG, WEBP — add another after each upload</p>
        </label>
      </div>

      {/* URL */}
      <div>
        <SectionLabel color="#16a34a">Add Image by URL</SectionLabel>
        <div className="flex gap-3 flex-wrap">
          <input value={imageUrlInput} onChange={(e) => setImageUrlInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addImageUrl()}
            placeholder="https://example.com/image.jpg"
            style={{ ...inputStyle, flex: 1, minWidth: 200, border: "2px solid #86efac", fontSize: 15 }}
            onFocus={(e) => { e.target.style.borderColor = "#22c55e"; }} onBlur={(e) => { e.target.style.borderColor = "#86efac"; }} />
          <button type="button" onClick={addImageUrl} disabled={addingUrl}
            className="px-5 py-3 text-white rounded-xl font-bold transition-all disabled:opacity-50 shrink-0"
            style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)", boxShadow: "0 4px 16px rgba(34,197,94,0.4)", fontSize: 15 }}>
            {addingUrl ? "Adding…" : "Add URL"}
          </button>
        </div>
      </div>

      <Alert msg={msg} />
      <div className="flex gap-3 flex-wrap pt-2">
        {subtopic?.images?.length > 0 && <DangerBtn onClick={deleteImages} label="Remove All Images" />}
      </div>
    </div>
  );
}

/* ─────────────── QUIZ PANEL ─────────────── */
function makeEmptyQuestion() {
  return { clientId: `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`, question: "", options: ["", ""], correctAnswer: "" };
}
function questionRowKey(q, qi) { return q._id ? String(q._id) : q.clientId || `idx-${qi}`; }

function QuizPanel({ subtopic, onMiniQuizFilledChange }) {
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [editingQuestionIdx, setEditingQuestionIdx] = useState(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const ageGroup = subtopic?.ageGroup === "11-15" ? "11-15" : "6-10";

  useEffect(() => {
    if (!subtopic?._id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API}/api/kaveesha-miniquiz`, { params: { subtopicId: subtopic._id, ageGroup } });
        if (cancelled) return;
        setQuiz(res.data);
        setQuestions((res.data.questions || []).map((q) => ({ _id: q._id, question: q.question, options: [...(q.options || [])], correctAnswer: q.correctAnswer || "" })));
      } catch (e) {
        if (cancelled) return;
        if (e.response?.status === 404) { setQuiz(null); setQuestions([]); } else { setQuiz(null); setQuestions([]); }
      } finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [subtopic?._id, subtopic?.ageGroup]);

  const addQuestion = () => { setQuestions((prev) => [...prev, makeEmptyQuestion()]); setEditingQuestionIdx(questions.length); };
  const removeQuestion = (i) => { if (!window.confirm(`Delete question ${i + 1}?`)) return; setQuestions((prev) => prev.filter((_, idx) => idx !== i)); if (editingQuestionIdx === i) setEditingQuestionIdx(null); };
  const toggleEditQuestion = (i) => { setEditingQuestionIdx((prev) => prev === i ? null : i); };

  const updateQuestionField = (i, field, value) => {
    setQuestions((prev) => { const next = [...prev]; next[i] = { ...next[i], [field]: value }; return next; });
  };

  const updateOption = (qi, oi, value) => {
    setQuestions((prev) => {
      const next = [...prev]; const q = { ...next[qi] }; const prevVal = q.options[oi];
      const newOptions = [...q.options]; newOptions[oi] = value;
      let correct = q.correctAnswer; if (correct === prevVal) correct = value;
      const trimmedOpts = newOptions.map((o) => o.trim()).filter(Boolean);
      if (correct && !trimmedOpts.includes(correct.trim())) correct = "";
      q.options = newOptions; q.correctAnswer = correct; next[qi] = q; return next;
    });
  };

  const addOption = (qi) => { setQuestions((prev) => prev.map((q, i) => i === qi ? { ...q, options: [...q.options, ""] } : q)); };

  const removeOption = (qi, oi) => {
    let blocked = false;
    setQuestions((prev) => {
      const q = prev[qi]; if (q.options.length <= 2) { blocked = true; return prev; }
      const removed = q.options[oi]; const newOptions = q.options.filter((_, i) => i !== oi);
      let correct = q.correctAnswer; if (removed === correct) correct = "";
      return prev.map((qq, i) => i === qi ? { ...qq, options: newOptions, correctAnswer: correct } : qq);
    });
    if (blocked) { setMsg("❌ Each question needs at least 2 options"); setTimeout(() => setMsg(""), 3000); }
  };

  const setCorrectAnswer = (qi, optionText) => { updateQuestionField(qi, "correctAnswer", optionText); };

  const buildPayloadQuestions = () => questions.map((q) => ({ ...(q._id ? { _id: q._id } : {}), question: q.question, options: q.options, correctAnswer: q.correctAnswer }));

  const saveQuiz = async () => {
    if (questions.length === 0) return setMsg("❌ Add at least one question before saving");
    try {
      const token = localStorage.getItem("aquachamp_token") || sessionStorage.getItem("aquachamp_token");
      const headers = { Authorization: `Bearer ${token}` };
      const payload = { subtopicId: subtopic._id, ageGroup, questions: buildPayloadQuestions() };
      if (quiz) { await axios.put(`${API}/api/kaveesha-miniquiz/${quiz._id}`, payload, { headers, withCredentials: true }); }
      else { await axios.post(`${API}/api/kaveesha-miniquiz`, payload, { headers, withCredentials: true }); }
      setMsg("✅ Quiz saved!");
      const res = await axios.get(`${API}/api/kaveesha-miniquiz`, { params: { subtopicId: subtopic._id, ageGroup } });
      setQuiz(res.data);
      setQuestions((res.data.questions || []).map((q) => ({ _id: q._id, question: q.question, options: [...(q.options || [])], correctAnswer: q.correctAnswer || "" })));
      onMiniQuizFilledChange?.(); setTimeout(() => setMsg(""), 3000);
    } catch (err) { setMsg("❌ " + (err.response?.data?.message || "Failed to save quiz")); }
  };

  const editQuiz = () => { setEditingQuestionIdx(0); setMsg(""); };

  const deleteQuiz = async () => {
    if (!quiz || !window.confirm("Delete this quiz?")) return;
    try {
      const token = localStorage.getItem("aquachamp_token") || sessionStorage.getItem("aquachamp_token");
      await axios.delete(`${API}/api/kaveesha-miniquiz/${quiz._id}`, { headers: { Authorization: `Bearer ${token}` }, withCredentials: true });
      setQuiz(null); setQuestions([]); setMsg("✅ Quiz deleted"); onMiniQuizFilledChange?.(); setTimeout(() => setMsg(""), 3000);
    } catch { setMsg("❌ Failed to delete quiz"); }
  };

  return (
    <div className="space-y-6">
      {/* Quiz header info */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="flex items-center gap-2 px-4 py-2 rounded-full font-bold" style={{ background: "#e0e7ff", color: "#4338ca", border: "1px solid #a5b4fc", fontSize: 15 }}>
          🎓 Age {ageGroup}
        </span>
        <span className="flex items-center gap-2 px-4 py-2 rounded-full font-bold" style={{ background: "#fef3c7", color: "#92400e", border: "1px solid #fcd34d", fontSize: 15 }}>
          ❓ {questions.length} question{questions.length !== 1 ? "s" : ""}
        </span>
      </div>

      <p style={{ fontSize: 15, color: "#64748b", fontWeight: 500, lineHeight: 1.6 }}>
        Add any number of questions. Each question needs at least two options; use the radio button to set the correct answer.
      </p>

      {loading ? (
        <div className="text-center py-12"><div className="text-4xl animate-spin mb-3">⏳</div><p style={{ fontSize: 16, color: "#94a3b8" }}>Loading quiz…</p></div>
      ) : (
        <div className="space-y-5">
          {questions.length === 0 && (
            <div className="rounded-2xl p-10 text-center" style={{ background: "#fffbeb", border: "2.5px dashed #fcd34d" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>❓</div>
              <p style={{ fontSize: 17, fontWeight: 800, color: "#92400e" }}>No questions yet for age {ageGroup}.</p>
              <p style={{ fontSize: 14, color: "#b45309", marginTop: 6 }}>Click "Add Question" below to start building this quiz.</p>
            </div>
          )}

          {questions.map((q, qi) => {
            const isEditing = editingQuestionIdx === qi;
            return (
              <div key={questionRowKey(q, qi)} className="rounded-2xl overflow-hidden transition-all"
                style={{ border: isEditing ? "2.5px solid #f59e0b" : "2px solid #fde68a", boxShadow: isEditing ? "0 10px 32px rgba(245,158,11,0.2)" : "0 4px 16px rgba(245,158,11,0.08)", background: "#fff" }}>
                {/* Question header */}
                <div className="flex items-center justify-between px-6 py-4" style={{ background: isEditing ? "linear-gradient(135deg,#fef3c7,#fde68a)" : "#fffbeb", borderBottom: `2px solid ${isEditing ? "#fcd34d" : "#fef3c7"}` }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold" style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "#fff", fontSize: 16 }}>{qi + 1}</div>
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 800, color: "#d97706", textTransform: "uppercase", letterSpacing: "0.12em" }}>Question {qi + 1}</span>
                      {!isEditing && q.question && <p style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", marginTop: 2 }} className="line-clamp-1">{q.question}</p>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => toggleEditQuestion(qi)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105"
                      style={{ background: isEditing ? "#fef3c7" : "#dbeafe", border: isEditing ? "1.5px solid #fcd34d" : "1.5px solid #93c5fd", color: isEditing ? "#92400e" : "#1e40af", fontSize: 14 }}>
                      <span style={{ fontSize: 16 }}>{isEditing ? "✅" : "✏️"}</span> {isEditing ? "Done" : "Edit"}
                    </button>
                    <button type="button" onClick={() => removeQuestion(qi)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105"
                      style={{ background: "#fee2e2", border: "1.5px solid #fca5a5", color: "#991b1b", fontSize: 14 }}>
                      <span style={{ fontSize: 16 }}>🗑️</span> Delete
                    </button>
                  </div>
                </div>

                {/* Collapsed: show summary */}
                {!isEditing && (
                  <div className="px-6 py-4">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {q.options.map((opt, oi) => (
                        <span key={oi} className="px-3 py-1.5 rounded-lg font-semibold" style={{ background: q.correctAnswer === opt && opt.trim() ? "#dcfce7" : "#f1f5f9", border: q.correctAnswer === opt && opt.trim() ? "1.5px solid #86efac" : "1.5px solid #e2e8f0", color: q.correctAnswer === opt && opt.trim() ? "#166534" : "#64748b", fontSize: 14 }}>
                          {q.correctAnswer === opt && opt.trim() ? "✅ " : ""}{opt || `Option ${oi + 1}`}
                        </span>
                      ))}
                    </div>
                    {q.correctAnswer && <p style={{ fontSize: 13, fontWeight: 700, color: "#16a34a" }}>✓ Correct: {q.correctAnswer}</p>}
                  </div>
                )}

                {/* Expanded editor */}
                {isEditing && (
                  <div className="px-6 py-5 space-y-5">
                    <div>
                      <SectionLabel color="#d97706">Question Text</SectionLabel>
                      <input value={q.question} onChange={(e) => updateQuestionField(qi, "question", e.target.value)}
                        placeholder="Enter your question here…"
                        style={{ ...inputStyle, border: "2px solid #fcd34d", background: "#fff", fontSize: 16, padding: "14px 18px", fontWeight: 600 }}
                        onFocus={(e) => { e.target.style.borderColor = "#f59e0b"; e.target.style.boxShadow = "0 0 0 3px rgba(245,158,11,0.12)"; }}
                        onBlur={(e) => { e.target.style.borderColor = "#fcd34d"; e.target.style.boxShadow = "none"; }} />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <SectionLabel color="#d97706">Answer Options</SectionLabel>
                        <button type="button" onClick={() => addOption(qi)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold transition-all hover:scale-105"
                          style={{ background: "#dcfce7", color: "#166534", border: "1.5px solid #86efac", fontSize: 14 }}>
                          + Add Option
                        </button>
                      </div>
                      <div className="space-y-3">
                        {q.options.map((opt, oi) => {
                          const isMarked = q.correctAnswer !== "" && q.correctAnswer === opt && opt.trim() !== "";
                          return (
                            <div key={oi} className="flex gap-3 items-center px-5 py-4 rounded-xl transition-all"
                              style={{ background: isMarked ? "#f0fdf4" : "#fafafa", border: `2px solid ${isMarked ? "#22c55e" : "#fde68a"}`, boxShadow: isMarked ? "0 3px 12px rgba(34,197,94,0.12)" : "none" }}>
                              <label className="flex items-center gap-2 shrink-0 cursor-pointer" style={{ minWidth: 110 }}>
                                <input type="radio" name={`correct-${questionRowKey(q, qi)}`} checked={isMarked} onChange={() => setCorrectAnswer(qi, opt)}
                                  className="shrink-0" style={{ accentColor: "#22c55e", width: 18, height: 18 }} title="Mark as correct answer" />
                                <span style={{ fontSize: 14, fontWeight: 800, color: "#d97706", textTransform: "uppercase", letterSpacing: "0.05em" }}>Correct</span>
                              </label>
                              <input value={opt} onChange={(e) => updateOption(qi, oi, e.target.value)} placeholder={`Option ${oi + 1}`}
                                className="min-w-0 flex-1 py-2 px-4 rounded-xl"
                                style={{ border: "1.5px solid #fde68a", outline: "none", color: "#1e293b", background: "#fff", fontSize: 15, fontWeight: 600 }}
                                onFocus={(e) => { e.target.style.borderColor = "#f59e0b"; }} onBlur={(e) => { e.target.style.borderColor = "#fde68a"; }} />
                              <button type="button" onClick={() => removeOption(qi, oi)} disabled={q.options.length <= 2}
                                className="px-4 py-2 rounded-xl font-bold transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
                                style={{ background: "#fef2f2", color: "#991b1b", border: "1.5px solid #fecaca", fontSize: 14 }}>
                                Remove
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {q.correctAnswer.trim() !== "" && (
                      <div className="flex items-center gap-3 px-5 py-4 rounded-xl" style={{ background: "#dcfce7", color: "#166534", border: "2px solid #86efac" }}>
                        <span style={{ fontSize: 20 }}>✅</span>
                        <span style={{ fontSize: 15, fontWeight: 800 }}>Correct Answer: {q.correctAnswer}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Add Question */}
          <button type="button" onClick={addQuestion}
            className="w-full py-4 rounded-2xl font-bold transition-all hover:-translate-y-0.5"
            style={{ border: "2.5px dashed #fcd34d", color: "#92400e", background: "#fffbeb", fontSize: 16 }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#fef3c7"; e.currentTarget.style.borderColor = "#f59e0b"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#fffbeb"; e.currentTarget.style.borderColor = "#fcd34d"; }}>
            + Add Question
          </button>
        </div>
      )}

      <Alert msg={msg} />
      <div className="flex gap-3 flex-wrap pt-2">
        <SaveBtn onClick={saveQuiz} label="Save Quiz" />
        {quiz && <EditBtn onClick={editQuiz} label="Edit Quiz" />}
        {quiz && <DangerBtn onClick={deleteQuiz} label="Delete Quiz" />}
      </div>
    </div>
  );
}