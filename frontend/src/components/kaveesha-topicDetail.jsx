import { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import axios from "axios";
import KaveeshaStudentNav from "./kaveesha-studentNav";

const API = "http://localhost:4000";

export default function KaveeshaTopicDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { topicId } = useParams();

  const { topic: topicFromState, ageGroup, userId, isBasic } =
    location.state || {};
  const [topic, setTopic] = useState(topicFromState || null);
  const [subtopics, setSubtopics] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subtopicQuizMap, setSubtopicQuizMap] = useState({});
  const resolvedAgeGroup =
    ageGroup || (user?.age >= 5 && user?.age <= 10 ? "5-10" : "11-15");
  const effectiveUserIdRaw = userId || user?.id || user?._id;
  const effectiveUserId =
    effectiveUserIdRaw != null ? String(effectiveUserIdRaw) : undefined;
  const isYoung = resolvedAgeGroup === "5-10" || resolvedAgeGroup === "6-10";

  useEffect(() => {
    const token =
      localStorage.getItem("aquachamp_token") ||
      sessionStorage.getItem("aquachamp_token");
    if (!token) return navigate("/login");

    axios
      .get(`${API}/api/users/profile/me`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      })
      .then((r) => setUser(r.data.user))
      .catch(() => navigate("/login"));
  }, []);

  useEffect(() => {
    if (topicFromState) setTopic(topicFromState);
  }, [topicFromState]);

  useEffect(() => {
    if (topicId && !topicFromState) {
      axios
        .get(`${API}/api/topics/${topicId}`)
        .then((r) => setTopic(r.data))
        .catch(() => setTopic(null));
    }
  }, [topicId, topicFromState]);

  useEffect(() => {
    if (!topicId || !resolvedAgeGroup) return;
    fetchSubtopics();
  }, [topicId, resolvedAgeGroup, effectiveUserId]);

  const fetchSubtopics = async () => {
    setLoading(true);
    try {
      // FIX: Query for both "5-10" AND "6-10" since database might have either
      const [res5to10, res6to10] = await Promise.all([
        axios.get(`${API}/api/subtopics`, {
          params: { topicId, ageGroup: "5-10" },
        }),
        axios.get(`${API}/api/subtopics`, {
          params: { topicId, ageGroup: "6-10" },
        }),
      ]);
      
      // Merge subtopics from both age group values
      const subs5to10 = Array.isArray(res5to10.data)
        ? res5to10.data
        : res5to10.data?.subtopics || [];
      const subs6to10 = Array.isArray(res6to10.data)
        ? res6to10.data
        : res6to10.data?.subtopics || [];
      
      // Combine and deduplicate by _id
      const subsMap = new Map();
      [...subs5to10, ...subs6to10].forEach(s => {
        if (s._id) subsMap.set(String(s._id), s);
      });
      const subs = Array.from(subsMap.values());
      
      console.log('📋 Fetched subtopics for topic:', { '5-10': subs5to10.length, '6-10': subs6to10.length, total: subs.length });
      
      const sorted = [...subs].sort((a, b) => (a.order || 0) - (b.order || 0));
      setSubtopics(sorted);

      // Check quiz status for each subtopic
      // FIX: Check for mini quiz with both "5-10" and "6-10" age groups
      // since database might have either
      const quizMap = {};
      await Promise.all(
        sorted.map(async (sub) => {
          // Try "5-10" first, then "6-10" if not found
          const ageGroupsToTry = ["5-10", "6-10"];
          let hasQuiz = false;
          
          for (const ag of ageGroupsToTry) {
            try {
              const quizRes = await axios.get(`${API}/api/kaveesha-miniquiz`, {
                params: { subtopicId: sub._id, ageGroup: ag },
              });
              if (Array.isArray(quizRes.data?.questions) && quizRes.data.questions.length > 0) {
                hasQuiz = true;
                break;
              }
            } catch {
              // Continue to try next age group
            }
          }
          
          quizMap[sub._id] = hasQuiz;
        })
      );
      setSubtopicQuizMap(quizMap);

      // Fetch progress per subtopic
      const token =
        localStorage.getItem("aquachamp_token") ||
        sessionStorage.getItem("aquachamp_token");
      const pMap = {};
      for (const sub of sorted) {
        if (!effectiveUserId) {
          pMap[sub._id] = { percentage: 0, requirements: null, progress: null };
          continue;
        }
        try {
          const r = await axios.get(`${API}/api/subtopics/progress/subtopic`, {
            params: { userId: String(effectiveUserId), subtopicId: sub._id },
            headers: { Authorization: `Bearer ${token}` },
          });
          pMap[sub._id] = {
            percentage: r.data.percentage || 0,
            requirements: r.data.requirements || null,
            progress: r.data.progress || null,
          };
        } catch {
          pMap[sub._id] = { percentage: 0, requirements: null, progress: null };
        }
      }
      setProgressMap(pMap);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getLastActiveSection = (sub) => {
    const prog = progressMap[sub._id]?.percentage ?? 0;
    if (!prog) return "video";
    if (prog >= 100) return "done";
    // We'll store section in localStorage per subtopic
    return localStorage.getItem(`kaveesha_section_${sub._id}`) || "video";
  };

  const CARD_COLORS = [
    { from: "#ec4899", to: "#db2777", accent: "#db2777", hover: "#fce7f3", light: "#fdf2f8" },
    { from: "#3b82f6", to: "#2563eb", accent: "#2563eb", hover: "#dbeafe", light: "#eff6ff" },
    { from: "#22c55e", to: "#16a34a", accent: "#16a34a", hover: "#dcfce7", light: "#f0fdf4" },
    { from: "#f59e0b", to: "#d97706", accent: "#d97706", hover: "#fef3c7", light: "#fffbeb" },
    { from: "#8b5cf6", to: "#7c3aed", accent: "#7c3aed", hover: "#ede9fe", light: "#faf5ff" },
    { from: "#06b6d4", to: "#0891b2", accent: "#0891b2", hover: "#cffafe", light: "#ecfeff" },
  ];
  
  // Use topic index or default to first color
  const colorIndex = topicFromState?.colorIndex ?? 0;
  const topicColor = CARD_COLORS[colorIndex % CARD_COLORS.length];
  
  const accentFrom = topicColor.from;
  const accentTo = topicColor.to;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Nunito:wght@400;600;700;800;900&display=swap');
        body { font-family: 'Inter', sans-serif; }
        .display-font { font-family: 'Nunito', sans-serif; }
        @keyframes pop { 0%{transform:scale(0.9);opacity:0} 100%{transform:scale(1);opacity:1} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes slideIn { 0%{transform:translateX(-20px);opacity:0} 100%{transform:translateX(0);opacity:1} }
        .pop { animation: pop 0.4s cubic-bezier(0.175,0.885,0.32,1.275) forwards; }
        .float { animation: float 3s ease-in-out infinite; }
        .slide-in { animation: slideIn 0.5s ease-out forwards; }
        .card-hover { transition: all 0.3s cubic-bezier(0.175,0.885,0.32,1.275); }
        .card-hover:hover:not(.locked) { transform: translateY(-4px) scale(1.01); }
        .progress-bar { transition: width 1.2s cubic-bezier(0.4,0,0.2,1); }
      `}</style>

      <KaveeshaStudentNav user={user} ageGroup={resolvedAgeGroup} />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate("/student/dashboard")}
          className="flex items-center gap-2 mb-6 px-5 py-2.5 bg-white rounded-xl shadow-md font-bold text-slate-600 hover:shadow-lg transition-all text-sm border-2 border-slate-200 hover:border-slate-300"
          onMouseEnter={(e) => {
            e.currentTarget.style.color = accentFrom;
            e.currentTarget.style.borderColor = accentFrom;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#475569";
            e.currentTarget.style.borderColor = "#e2e8f0";
          }}
        >
          ← Back to Dashboard
        </button>

        {/* Topic Header */}
        <div
          className="rounded-3xl p-8 mb-8 text-white shadow-2xl relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${accentFrom}, ${accentTo})`,
          }}
        >
          <div className="absolute -right-8 -bottom-8 text-9xl opacity-10 float">
            📚
          </div>
          <div className="relative z-10">
            {isBasic && (
              <span className="inline-block bg-white/30 text-white text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-wider">
                📖 Basic Lesson
              </span>
            )}
            <h1 className="display-font text-4xl font-extrabold mb-2 drop-shadow-lg">
              {topic?.title || "Lesson"}
            </h1>
            {topic?.description && (
              <p className="text-white/90 font-medium text-lg">
                {topic.description}
              </p>
            )}
            <div className="flex gap-4 mt-5 flex-wrap">
              <div className="bg-white/25 rounded-xl px-4 py-2.5 backdrop-blur-sm border border-white/30">
                <span className="font-bold text-sm">
                  📂 {subtopics.length} Lessons
                </span>
              </div>
              <div className="bg-white/25 rounded-xl px-4 py-2.5 backdrop-blur-sm border border-white/30">
                <span className="font-bold text-sm">
                  ✅{" "}
                  {Object.values(progressMap).filter((p) => p?.percentage === 100)
                    .length}{" "}
                  Completed
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Subtopics */}
        <h2 className="display-font text-3xl font-extrabold text-slate-800 mb-2">
          📚 Lesson Steps
        </h2>
        <p className="text-slate-600 font-medium mb-6">
          Complete each step to unlock the next one. You've got this! 💪
        </p>

        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-28 rounded-3xl animate-pulse bg-white/35"
              />
            ))}
          </div>
        ) : subtopics.length === 0 ? (
          <div className="text-center py-16 bg-white/95 rounded-3xl shadow-xl border-4 border-white/50">
            <div className="text-6xl mb-4">🚰</div>
            <p className="text-xl font-extrabold text-teal-800">
              No lesson steps here yet!
            </p>
            <p className="text-teal-700 font-semibold mt-2">
              Your teacher may still be adding videos, stories & quizzes! 💙
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {subtopics.map((sub, i) => {
              const entry = progressMap[sub._id];
              const pct = entry?.percentage ?? 0;
              const req = entry?.requirements;
              const prog = entry?.progress;
              const prevDone =
                i === 0 ||
                (progressMap[subtopics[i - 1]._id]?.percentage ?? 0) >= 100;
              const isLocked = !prevDone;
              const lastSection = getLastActiveSection(sub);
              const isDone = pct === 100;

              const contentRows = [
                {
                  id: "video",
                  label: "Video",
                  icon: "🎬",
                  required: !!req?.video,
                  done: !!prog?.videoCompleted,
                },
                {
                  id: "text",
                  label: "Read / files",
                  icon: "📝",
                  required: !!req?.text,
                  done: !!prog?.textCompleted,
                },
                {
                  id: "images",
                  label: "Images",
                  icon: "🖼️",
                  required: !!req?.images,
                  done: !!prog?.imagesCompleted,
                },
                {
                  id: "quiz",
                  label: "Mini quiz",
                  icon: "❓",
                  required: !!req?.miniQuiz,
                  done: !!prog?.miniQuizCompleted,
                },
              ].filter((x) => x.required);

              // Get content availability directly from subtopic database
              const getContentIcons = () => {
                const icons = [];
                if (sub.videoUrl) icons.push({ icon: "🎬", label: "Video" });
                if (sub.content || (sub.contentFiles && sub.contentFiles.length > 0)) icons.push({ icon: "📝", label: "Content" });
                if (sub.images && sub.images.length > 0) icons.push({ icon: "🖼️", label: "Images" });
                // Check quiz from the quiz map (fetched from API)
                if (subtopicQuizMap[sub._id]) icons.push({ icon: "❓", label: "Quiz" });
                return icons;
              };
              const contentIcons = getContentIcons();

              return (
                <div
                  key={sub._id}
                  className={`card-hover rounded-2xl shadow-lg overflow-hidden border-2 transition-all pop slide-in ${
                    isDone
                      ? "bg-emerald-50 border-emerald-300"
                      : isLocked
                      ? "bg-slate-50 border-slate-200 locked opacity-75"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                  style={{
                    animationDelay: `${i * 0.08}s`,
                  }}
                >
                  <div className="flex items-start gap-5 p-5">
                    {/* Order Badge */}
                    <div
                      className="w-16 h-16 rounded-2xl shrink-0 flex items-center justify-center text-2xl font-extrabold shadow-lg"
                      style={{
                        background: isDone
                          ? "linear-gradient(135deg, #10B981, #059669)"
                          : isLocked
                          ? "#e5e7eb"
                          : `linear-gradient(135deg, ${accentFrom}, ${accentTo})`,
                        color: isLocked ? "#9ca3af" : "white",
                        boxShadow: isLocked ? "none" : `0 4px 12px ${accentFrom}30`
                      }}
                    >
                      {isDone ? "✓" : isLocked ? "🔒" : i + 1}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-slate-800 text-lg truncate">
                          {sub.title}
                        </h3>
                        {isDone && (
                          <span className="text-xs bg-emerald-100 text-emerald-700 font-bold px-2.5 py-1 rounded-full shrink-0">
                            ✓ Complete
                          </span>
                        )}
                        {isLocked && (
                          <span className="text-xs bg-slate-100 text-slate-500 font-bold px-2.5 py-1 rounded-full shrink-0">
                            🔒 Locked
                          </span>
                        )}
                        {!isLocked && !isDone && pct > 0 && (
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full shrink-0 text-white"
                            style={{ background: accentFrom }}
                          >
                            In Progress
                          </span>
                        )}
                      </div>

                      {/* Clear Completed vs Remaining */}
                      <div className="mt-3 rounded-2xl border-2 border-slate-100 bg-slate-50/60 p-4">
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <p className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                            What to complete
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-extrabold text-slate-600">
                              Remaining{" "}
                              <span className="text-slate-900">
                                {Math.max(
                                  0,
                                  contentRows.filter((r) => !r.done).length
                                )}
                              </span>
                            </span>
                          </div>
                        </div>

                        {/* Content Availability Icons */}
                        {contentIcons.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {contentIcons.map((item, idx) => (
                              <span
                                key={idx}
                                className="flex items-center justify-center rounded-full"
                                style={{
                                  width: 40,
                                  height: 40,
                                  background: isDone ? "#dcfce7" : "#f1f5f9",
                                  border: `2px solid ${isDone ? "#86efac" : "#e2e8f0"}`,
                                  fontSize: 20,
                                  lineHeight: 1,
                                  boxShadow: `0 2px 8px ${isDone ? "rgba(16,185,129,0.15)" : "rgba(0,0,0,0.08)"}`,
                                }}
                                title={item.label}
                              >
                                {item.icon}
                              </span>
                            ))}
                          </div>
                        )}

                        {contentIcons.length === 0 && contentRows.length === 0 ? (
                          <div className="text-sm font-bold text-slate-500">
                            No content inside yet.
                          </div>
                        ) : contentRows.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {contentRows.map((row) => (
                              <div
                                key={row.id}
                                className="flex items-center justify-between gap-3 bg-white rounded-xl px-3 py-2 border-2"
                                style={{
                                  borderColor: row.done ? "#bbf7d0" : "#e2e8f0",
                                  background: row.done ? "#f0fdf4" : "#ffffff",
                                }}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="text-lg shrink-0">
                                    {row.done ? "✅" : row.icon}
                                  </span>
                                  <span className="text-sm font-extrabold text-slate-800 truncate">
                                    {row.label}
                                  </span>
                                </div>
                                {row.done ? (
                                  <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 shrink-0">
                                    Completed
                                  </span>
                                ) : (
                                  <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 shrink-0">
                                    Remaining
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>

                      {/* Progress bar */}
                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="progress-bar h-full rounded-full"
                            style={{
                              width: `${pct}%`,
                              background:
                                pct === 100
                                  ? "linear-gradient(90deg, #10B981, #059669)"
                                  : `linear-gradient(90deg, ${accentFrom}, ${accentTo})`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-bold text-slate-600 text-right whitespace-nowrap">
                          {pct}%
                          {pct === 100 ? (
                            <span className="ml-1.5" title="All steps complete">
                              {"\u2B50".repeat(4)}
                            </span>
                          ) : null}
                        </span>
                      </div>
                    </div>

                    {/* Action / lock message */}
                    {isLocked ? (
                      <div className="shrink-0 text-center max-w-37.5">
                        <p className="text-xs font-bold text-slate-500 leading-tight">
                          🔒 Complete previous lesson first
                        </p>
                      </div>
                    ) : (
                      <div className="shrink-0 w-42.5">
                        <button
                          onClick={() =>
                            navigate(`/student/subtopic/${sub._id}`, {
                              state: {
                                subtopic: sub,
                                ageGroup: resolvedAgeGroup,
                                userId: effectiveUserId,
                                topicId,
                                topic,
                                isBasic,
                                colorIndex,
                                startSection:
                                  pct > 0 && !isDone ? lastSection : undefined,
                              },
                            })
                          }
                          className="w-full px-6 py-3 rounded-xl font-bold text-white text-sm shadow-md transition-all hover:shadow-lg active:scale-95"
                          style={{
                            background:
                              pct === 100
                                ? "linear-gradient(135deg, #10B981, #059669)"
                                : `linear-gradient(135deg, ${accentFrom}, ${accentTo})`,
                            boxShadow: `0 4px 12px ${accentFrom}30`,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.boxShadow = `0 8px 20px ${accentFrom}50`;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.boxShadow = `0 4px 12px ${accentFrom}30`;
                          }}
                        >
                          {isDone
                            ? "Review →"
                            : pct > 0
                            ? "Continue →"
                            : "Start →"}
                        </button>
                        <p className="mt-2 text-[11px] text-slate-500 font-bold text-center leading-tight">
                          Start button is below your checklist
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}