import { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import axios from "axios";
import KaveeshaStudentNav from "./kaveesha-studentNav";

const API = "http://localhost:4000";

function computeLessonSections(subtopic, quiz) {
  if (!subtopic) return ["text"];
  const list = [];
  if (subtopic.videoUrl) list.push("video");
  if (
    (subtopic.content && String(subtopic.content).trim()) ||
    (subtopic.contentFiles && subtopic.contentFiles.length > 0)
  )
    list.push("text");
  if (subtopic.images && subtopic.images.length > 0) list.push("images");
  if (quiz?.questions?.length > 0) list.push("quiz");
  if (list.length === 0) list.push("text");
  return list;
}

export default function KaveeshaSubtopicLearn() {
  const navigate = useNavigate();
  const location = useLocation();
  const { subtopicId } = useParams();

  const {
    subtopic: initSub,
    ageGroup,
    userId,
    topicId,
    topic,
    startSection,
    isBasic,
    colorIndex,
  } = location.state || {};

  const CARD_COLORS = [
    { from: "#ec4899", to: "#db2777", accent: "#db2777", hover: "#fce7f3", light: "#fdf2f8" },
    { from: "#3b82f6", to: "#2563eb", accent: "#2563eb", hover: "#dbeafe", light: "#eff6ff" },
    { from: "#22c55e", to: "#16a34a", accent: "#16a34a", hover: "#dcfce7", light: "#f0fdf4" },
    { from: "#f59e0b", to: "#d97706", accent: "#d97706", hover: "#fef3c7", light: "#fffbeb" },
    { from: "#8b5cf6", to: "#7c3aed", accent: "#7c3aed", hover: "#ede9fe", light: "#faf5ff" },
    { from: "#06b6d4", to: "#0891b2", accent: "#0891b2", hover: "#cffafe", light: "#ecfeff" },
  ];

  const topicColor = CARD_COLORS[(colorIndex ?? 0) % CARD_COLORS.length];
  const accentFrom = topicColor.from;
  const accentTo = topicColor.to;

  const [subtopic, setSubtopic] = useState(initSub || null);
  const [user, setUser] = useState(null);
  const [currentSection, setCurrentSection] = useState("video");
  const [sectionDone, setSectionDone] = useState({
    video: false, text: false, images: false, quiz: false,
  });
  const [backendProgress, setBackendProgress] = useState(null);
  const [backendRequirements, setBackendRequirements] = useState(null);
  const [backendPct, setBackendPct] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMsg, setCelebrationMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState(null);

  const effectiveUserIdRaw = userId || user?.id || user?._id;
  const effectiveUserId =
    effectiveUserIdRaw != null ? String(effectiveUserIdRaw) : undefined;
  
  // FIX: Get ageGroup from multiple sources - localStorage (set on login), location.state, or user object
  const getStoredAgeGroup = () => {
    // From localStorage (set by login/student dashboard)
    const stored = localStorage.getItem("aquachamp_ageGroup");
    if (stored) return stored;
    // From user object in localStorage
    const userStr = localStorage.getItem("aquachamp_user");
    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);
        if (userObj?.age >= 5 && userObj?.age <= 10) return "5-10";
        if (userObj?.age >= 11 && userObj?.age <= 15) return "11-15";
      } catch {}
    }
    return null;
  };
  
  const resolvedAgeGroup =
    ageGroup || getStoredAgeGroup() || (user?.age >= 5 && user?.age <= 10 ? "5-10" : "11-15");
  // FIX: Handle both "5-10" and "6-10" as young age group
  const isYoung = resolvedAgeGroup === "5-10" || resolvedAgeGroup === "6-10";

  const sections = useMemo(
    () => computeLessonSections(subtopic, quiz),
    [subtopic, quiz]
  );

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
    if (!subtopicId) return;
    fetchSubtopic();
  }, [subtopicId]);

  useEffect(() => {
    if (!subtopicId || !resolvedAgeGroup) return;
    fetchQuiz();
  }, [subtopicId, resolvedAgeGroup]);

  useEffect(() => {
    fetchBackendProgress();
  }, [subtopicId, effectiveUserId]);

  useEffect(() => {
    if (!subtopicId || !subtopic) return;
    const secs = computeLessonSections(subtopic, quiz);
    const savedSection = localStorage.getItem(`kaveesha_section_${subtopicId}`);
    const fromNav = startSection;
    const pick =
      (fromNav && secs.includes(fromNav) && fromNav) ||
      (savedSection && secs.includes(savedSection) && savedSection) ||
      secs[0];
    setCurrentSection(pick);
  }, [subtopicId, subtopic, quiz, startSection]);

  const fetchSubtopic = async () => {
    try {
      const res = await axios.get(`${API}/api/subtopics/${subtopicId}`);
      setSubtopic(res.data);
    } catch {
      setSubtopic(initSub);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuiz = async () => {
    try {
      // FIX: Try both "5-10" and "6-10" age groups since database might have either
      const ageGroupsToTry = ["5-10", "6-10"];
      let quizData = null;
      
      for (const ag of ageGroupsToTry) {
        try {
          const res = await axios.get(`${API}/api/kaveesha-miniquiz`, {
            params: { subtopicId, ageGroup: ag },
          });
          if (res.data) {
            quizData = res.data;
            break;
          }
        } catch {
          // Continue to try next age group
        }
      }
      
      setQuiz(quizData);
    } catch {
      setQuiz(null);
    }
  };

  const fetchBackendProgress = async () => {
    if (!subtopicId || !effectiveUserId) return;
    try {
      const token =
        localStorage.getItem("aquachamp_token") ||
        sessionStorage.getItem("aquachamp_token");
      const r = await axios.get(`${API}/api/subtopics/progress/subtopic`, {
        params: { userId: String(effectiveUserId), subtopicId },
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        withCredentials: true,
      });
      const p = r.data?.progress || null;
      const req = r.data?.requirements || null;
      const pct = r.data?.percentage || 0;
      setBackendProgress(p);
      setBackendRequirements(req);
      setBackendPct(pct);

      const fromBackend = {
        video: !!p?.videoCompleted,
        text: !!p?.textCompleted,
        images: !!p?.imagesCompleted,
        quiz: !!p?.miniQuizCompleted,
      };
      setSectionDone((prev) => ({ ...prev, ...fromBackend }));
      localStorage.setItem(
        `kaveesha_done_${subtopicId}`,
        JSON.stringify(fromBackend)
      );
    } catch {
      const saved = localStorage.getItem(`kaveesha_done_${subtopicId}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setSectionDone((prev) => ({
            ...prev,
            video: !!parsed.video,
            text: !!parsed.text,
            images: !!parsed.images,
            quiz: !!parsed.quiz,
          }));
        } catch {
          /* ignore */
        }
      }
    }
  };

  // Check if ALL subtopics of this topic are 100% done → navigate to games
  const checkIfTopicComplete = async () => {
    if (!topicId || !effectiveUserId || !resolvedAgeGroup) return;
    try {
      // 1. Get all subtopics for this topic (try both age groups)
      // FIX: Query for both "5-10" AND "6-10" since database might have either
      const [res5to10, res6to10] = await Promise.all([
        axios.get(`${API}/api/subtopics`, {
          params: { topicId, ageGroup: "5-10" },
        }),
        axios.get(`${API}/api/subtopics`, {
          params: { topicId, ageGroup: "6-10" },
        }),
      ]);
      
      const subs5to10 = Array.isArray(res5to10.data) ? res5to10.data : res5to10.data?.subtopics || [];
      const subs6to10 = Array.isArray(res6to10.data) ? res6to10.data : res6to10.data?.subtopics || [];
      
      // Combine and deduplicate by _id
      const subsMap = new Map();
      [...subs5to10, ...subs6to10].forEach(s => {
        if (s._id) subsMap.set(String(s._id), s);
      });
      const allSubs = Array.from(subsMap.values());
      
      console.log('📊 checkIfTopicComplete - subtopics found:', { '5-10': subs5to10.length, '6-10': subs6to10.length, total: allSubs.length });
      
      if (allSubs.length === 0) return;

      // 2. Check progress for every subtopic
      const token =
        localStorage.getItem("aquachamp_token") ||
        sessionStorage.getItem("aquachamp_token");

      const progressResults = await Promise.all(
        allSubs.map((sub) =>
          axios
            .get(`${API}/api/subtopics/progress/subtopic`, {
              params: { userId: String(effectiveUserId), subtopicId: sub._id },
              headers: token ? { Authorization: `Bearer ${token}` } : undefined,
              withCredentials: true,
            })
            .then((r) => r.data?.percentage || 0)
            .catch(() => 0)
        )
      );
      
      console.log('📊 checkIfTopicComplete - progress results:', progressResults);

      // 3. Only proceed if every single subtopic is 100%
      const allDone = progressResults.every((pct) => pct >= 100);
      console.log('📊 checkIfTopicComplete - allDone:', allDone);
      
      if (!allDone) return;

      // 4. Build the game slug from the topic title
      //    Fetch topic directly from backend — never rely on location.state
      let gameTopicSlug = null;
      try {
        const topicRes = await axios.get(`${API}/api/topics/${topicId}`);
        const fetchedTitle = topicRes.data?.title || "";
        // e.g. "💧 1. Safe Drinking Water" → "safe-drinking-water"
        gameTopicSlug = fetchedTitle
          .replace(/[^a-zA-Z0-9\s]/g, "") // strip emoji & punctuation
          .trim()
          .toLowerCase()
          .replace(/^\d+\s*/, "")
          .replace(/\s+/g, "-");           // spaces → hyphens
      } catch {
        // fallback to topic from location.state if API call fails
        const fallbackTitle = topic?.title || "";
        gameTopicSlug = fallbackTitle
          .replace(/[^a-zA-Z0-9\s]/g, "")
          .trim()
          .toLowerCase()
          .replace(/^\d+\s*/, "")
          .replace(/\s+/g, "-");
      }

      if (!gameTopicSlug) {
        console.error("Could not determine game topic slug");
        return;
      }

      console.log("All subtopics done! Navigating to game slug:", gameTopicSlug);
      console.log("   resolvedAgeGroup:", resolvedAgeGroup);
      console.log("   effectiveUserId:", effectiveUserId);

      // 5. Wait 3s so the celebration screen shows first, then navigate
      // Navigate WITHOUT ageGroup so user sees age selection first
      setTimeout(() => {
        navigate(`/games/topic/${gameTopicSlug}`, {
          state: {
            userId: effectiveUserId,
            fromLessons: true, // Flag to show welcome message
          },
        });
      }, 3000);
    } catch (err) {
      console.error("Topic completion check failed:", err);
    }
  };

  const saveProgress = (newDone, section) => {
    localStorage.setItem(`kaveesha_done_${subtopicId}`, JSON.stringify(newDone));
    localStorage.setItem(`kaveesha_section_${subtopicId}`, section);
  };

  const markSectionComplete = async (section) => {
    const newDone = { ...sectionDone, [section]: true };
    setSectionDone(newDone);
    saveProgress(newDone, section);

    const msgs = {
      video: ["🎬 Amazing! You watched the video!", "⭐ Great job watching!"],
      text: ["📝 Brilliant! You read the lesson!", "🌟 Reading superstar!"],
      images: ["🖼️ Wonderful! You viewed all images!", "✨ Great explorer!"],
    };
    const msgList = msgs[section] || ["✅ Well done!"];
    setCelebrationMsg(msgList[Math.floor(Math.random() * msgList.length)]);
    setShowCelebration(true);

    try {
      const token =
        localStorage.getItem("aquachamp_token") ||
        sessionStorage.getItem("aquachamp_token");
      await axios.post(
        `${API}/api/subtopics/complete/${subtopicId}`,
        { userId: effectiveUserId, contentType: section },
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );
      await fetchBackendProgress();
    } catch (err) {
      console.error("Progress save error:", err);
    }

    setTimeout(() => {
      setShowCelebration(false);
      const idx = sections.indexOf(section);
      if (idx >= 0 && idx < sections.length - 1) {
        const next = sections[idx + 1];
        setCurrentSection(next);
        saveProgress(newDone, next);
      }
    }, 2500);
  };

  const canAccessSection = (section) => {
    const idx = sections.indexOf(section);
    if (idx <= 0) return true;
    return sectionDone[sections[idx - 1]];
  };

  // Guard: redirect back if previous subtopic not completed
  useEffect(() => {
    if (!subtopicId || !topicId || !effectiveUserId || !resolvedAgeGroup || !subtopic) return;
    let cancelled = false;
    (async () => {
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
        
        const raw5to10 = Array.isArray(res5to10.data) ? res5to10.data : res5to10.data?.subtopics || [];
        const raw6to10 = Array.isArray(res6to10.data) ? res6to10.data : res6to10.data?.subtopics || [];
        
        // Combine and deduplicate by _id
        const subsMap = new Map();
        [...raw5to10, ...raw6to10].forEach(s => {
          if (s._id) subsMap.set(String(s._id), s);
        });
        const raw = Array.from(subsMap.values());
        
        const sorted = [...raw].sort((a, b) => (a.order || 0) - (b.order || 0));
        const idx = sorted.findIndex((s) => String(s._id) === String(subtopicId));
        if (idx <= 0) return;
        const prevId = sorted[idx - 1]._id;
        const pr = await axios.get(`${API}/api/subtopics/progress/subtopic`, {
          params: { userId: effectiveUserId, subtopicId: prevId },
        });
        if (cancelled) return;
        if ((pr.data?.percentage || 0) < 100) {
          navigate(`/student/topic/${topicId}`, {
            replace: true,
            state: { topic, ageGroup: resolvedAgeGroup, userId: effectiveUserId, isBasic },
          });
        }
      } catch {
        /* keep student on page if check fails */
      }
    })();
    return () => { cancelled = true; };
  }, [subtopicId, topicId, effectiveUserId, resolvedAgeGroup, subtopic?._id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-white to-slate-50">
        <div className="text-center rounded-3xl bg-white px-10 py-8 shadow-xl border-2 border-slate-200">
          <div className="text-6xl mb-4 animate-bounce">💧</div>
          <p className="text-2xl font-bold text-slate-800">Loading your lesson…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Nunito:wght@400;600;700;800;900&display=swap');
        body { font-family: 'Inter', sans-serif; }
        .display-font { font-family: 'Nunito', sans-serif; }
        @keyframes pop { 0%{transform:scale(0.5);opacity:0} 70%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        .pop { animation: pop 0.5s cubic-bezier(0.175,0.885,0.32,1.275) forwards; }
        .float { animation: float 3s ease-in-out infinite; }
        .progress-bar { transition: width 1s cubic-bezier(0.4,0,0.2,1); }
      `}</style>

      {/* Celebration Overlay */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-10 text-center shadow-2xl pop max-w-sm mx-4">
            <div className="text-7xl mb-4 float">⭐</div>
            <div className="flex justify-center gap-2 mb-4">
              {[...Array(4)].map((_, i) => (
                <span key={i} className="text-3xl" style={{ animationDelay: `${i * 0.1}s` }}>⭐</span>
              ))}
            </div>
            <h2 className="display-font text-2xl font-extrabold text-gray-800 mb-2">
              {celebrationMsg}
            </h2>
            <p className="text-gray-500 font-semibold">Moving to next step...</p>
          </div>
        </div>
      )}

      <KaveeshaStudentNav user={user} ageGroup={resolvedAgeGroup} />

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Back */}
        <button
          onClick={() =>
            navigate(`/student/topic/${topicId}`, {
              state: {
                topic,
                ageGroup: resolvedAgeGroup,
                userId: effectiveUserId,
                isBasic,
                colorIndex,
              },
            })
          }
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
          ← Back to {topic?.title}
        </button>

        {/* Subtopic Header */}
        <div
          className="rounded-3xl p-7 mb-6 text-white shadow-2xl relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${accentFrom}, ${accentTo})` }}
        >
          <div className="absolute -right-10 -bottom-10 text-[140px] opacity-10 select-none">
            🎓
          </div>
          <h1 className="display-font text-3xl font-extrabold mb-1 drop-shadow-lg">
            {subtopic?.title}
          </h1>
          <p className="text-white/90 font-medium text-sm">
            {isYoung ? "Ages 5–10 track" : "Ages 11–15 track"} ·{" "}
            {topic?.title || "Lesson"}
          </p>
          <div className="mt-4 bg-white/20 rounded-2xl p-4 backdrop-blur-sm border border-white/25">
            <div className="flex items-center justify-between gap-3 mb-2">
              <p className="text-xs font-extrabold uppercase tracking-wider text-white/90">
                Subtopic progress
              </p>
              <p className="text-sm font-extrabold text-white flex items-center gap-2">
                {backendPct}%
                {backendPct === 100 ? (
                  <span className="text-base leading-none" aria-hidden>
                    {"\u2B50".repeat(4)}
                  </span>
                ) : null}
              </p>
            </div>
            <div className="h-3 bg-white/25 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${backendPct}%`,
                  background:
                    backendPct === 100
                      ? "linear-gradient(90deg,#10B981,#059669)"
                      : "linear-gradient(90deg, rgba(255,255,255,0.95), rgba(255,255,255,0.55))",
                }}
              />
            </div>
            {backendRequirements && (
              <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { id: "video", label: "Video", icon: "🎬", req: backendRequirements.video, done: backendProgress?.videoCompleted },
                  { id: "text", label: "Read", icon: "📝", req: backendRequirements.text, done: backendProgress?.textCompleted },
                  { id: "images", label: "Images", icon: "🖼️", req: backendRequirements.images, done: backendProgress?.imagesCompleted },
                  { id: "quiz", label: "Mini quiz", icon: "❓", req: backendRequirements.miniQuiz, done: backendProgress?.miniQuizCompleted },
                ]
                  .filter((x) => x.req)
                  .map((x) => (
                    <div
                      key={x.id}
                      className="flex items-center justify-between gap-2 bg-white/15 rounded-xl px-3 py-2 border border-white/20"
                    >
                      <span className="text-sm font-extrabold text-white/95">
                        {x.done ? "✅" : x.icon} {x.label}
                      </span>
                      <span
                        className="text-[11px] font-extrabold px-2 py-0.5 rounded-full"
                        style={{
                          background: x.done ? "rgba(16,185,129,0.25)" : "rgba(15,23,42,0.15)",
                          border: x.done ? "1px solid rgba(16,185,129,0.35)" : "1px solid rgba(255,255,255,0.25)",
                        }}
                      >
                        {x.done ? "Completed" : "Remaining"}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Section Progress Steps */}
        <div className="bg-white/95 rounded-3xl shadow-lg border-2 border-white p-5 mb-6">
          <div className="flex items-center gap-2">
            {sections.map((sec, i) => {
              const icons = { video: "🎬", text: "📝", images: "🖼️", quiz: "❓" };
              const labels = { video: "Video", text: "Read", images: "Images", quiz: "Quiz" };
              const done = sectionDone[sec];
              const active = currentSection === sec;
              const accessible = canAccessSection(sec);

              return (
                <div key={sec} className="flex items-center flex-1">
                  <button
                    onClick={() => accessible && setCurrentSection(sec)}
                    disabled={!accessible}
                    className={`flex flex-col items-center gap-1.5 flex-1 p-2 rounded-2xl transition-all ${
                      active
                        ? "bg-teal-800 text-white shadow-md scale-105"
                        : done
                        ? "bg-emerald-50 text-emerald-900"
                        : accessible
                        ? "bg-sky-100 text-sky-900 hover:bg-sky-200"
                        : "opacity-40 cursor-not-allowed text-slate-400"
                    }`}
                  >
                    <span
                      className={`flex items-center justify-center w-11 h-11 rounded-full text-xl transition-all ${
                        done
                          ? "bg-emerald-500 text-white border-2 border-emerald-600 shadow-md"
                          : active
                          ? "bg-white text-teal-900 border-2 border-white/90"
                          : accessible
                          ? "bg-white border-2 border-sky-200"
                          : "bg-slate-100 border-2 border-slate-200"
                      }`}
                    >
                      {icons[sec]}
                    </span>
                    <span className="text-[10px] font-extrabold">{labels[sec]}</span>
                  </button>
                  {i < sections.length - 1 && (
                    <div
                      className={`w-6 h-0.5 shrink-0 mx-1 rounded-full ${
                        done ? "bg-emerald-500" : "bg-slate-300"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Section Content */}
        <div className="bg-white/95 rounded-3xl shadow-lg border-2 border-white overflow-hidden">
          {currentSection === "video" && sections.includes("video") && (
            <KaveeshaVideoSection
              subtopic={subtopic}
              done={sectionDone.video}
              onComplete={() => markSectionComplete("video")}
              accentFrom={accentFrom}
              accentTo={accentTo}
              isYoung={isYoung}
            />
          )}
          {currentSection === "text" && sections.includes("text") && (
            <KaveeshaTextSection
              subtopic={subtopic}
              done={sectionDone.text}
              onComplete={() => markSectionComplete("text")}
              accentFrom={accentFrom}
              accentTo={accentTo}
              isYoung={isYoung}
            />
          )}
          {currentSection === "images" && sections.includes("images") && (
            <KaveeshaImagesSection
              subtopic={subtopic}
              done={sectionDone.images}
              onComplete={() => markSectionComplete("images")}
              accentFrom={accentFrom}
              accentTo={accentTo}
              isYoung={isYoung}
            />
          )}
          {currentSection === "quiz" && sections.includes("quiz") && (
            <KaveeshaQuizSection
              subtopic={subtopic}
              quiz={quiz}
              userId={effectiveUserId}
              ageGroup={resolvedAgeGroup}
              done={sectionDone.quiz}
              onComplete={async ({ miniQuizAnswers, score, total }) => {
                const token =
                  localStorage.getItem("aquachamp_token") ||
                  sessionStorage.getItem("aquachamp_token");
                const r = await axios.post(
                  `${API}/api/subtopics/complete/${subtopicId}`,
                  {
                    userId: effectiveUserId,
                    contentType: "miniQuiz",
                    miniQuizAnswers,
                  },
                  { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
                );
                const backendMarked =
                  !!r.data?.progress?.miniQuizCompleted ||
                  (score === total && total > 0);
                if (backendMarked) {
                  const newDone = { ...sectionDone, quiz: true };
                  setSectionDone(newDone);
                  saveProgress(newDone, "quiz");
                  await fetchBackendProgress();
                  await checkIfTopicComplete(); // navigate to games if all subtopics done
                  return { ok: true };
                }
                fetchBackendProgress();
                return { ok: false, message: r.data?.message || "Try again." };
              }}
              onNavigateBack={() =>
                navigate(`/student/topic/${topicId}`, {
                  state: {
                    topic,
                    ageGroup: resolvedAgeGroup,
                    userId: effectiveUserId,
                    isBasic,
                    colorIndex,
                  },
                })
              }
              accentFrom={accentFrom}
              accentTo={accentTo}
              isYoung={isYoung}
            />
          )}
        </div>
      </main>
    </div>
  );
}

/* ─── VIDEO SECTION ─── */
function KaveeshaVideoSection({ subtopic, done, onComplete, accentFrom, accentTo, isYoung }) {
  const [watched, setWatched] = useState(false);
  const iframeRef = useRef(null);

  useEffect(() => {
    if (done) setWatched(true);
  }, [done]);

  const getYouTubeId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  };

  const videoId = getYouTubeId(subtopic?.videoUrl);

  useEffect(() => {
    if (!videoId) return;
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);
    window.onYouTubeIframeAPIReady = () => {
      new window.YT.Player("yt-player", {
        events: {
          onStateChange: (e) => {
            if (e.data === window.YT.PlayerState.ENDED) setWatched(true);
          },
        },
      });
    };
  }, [videoId]);

  if (!subtopic?.videoUrl) {
    return (
      <div className="p-8 text-center">
        <div className="text-5xl mb-3">🎬</div>
        <p className="text-gray-400 font-bold">No video for this lesson yet</p>
        {!done && (
          <button
            onClick={onComplete}
            className="mt-4 px-6 py-3 rounded-2xl font-extrabold text-white shadow-md"
            style={{ background: `linear-gradient(135deg, ${accentFrom}, ${accentTo})` }}
          >
            Skip & Continue →
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-5">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-md"
          style={{ background: `linear-gradient(135deg, ${accentFrom}, ${accentTo})` }}
        >
          🎬
        </div>
        <div>
          <h2 className="display-font text-xl font-extrabold text-gray-800">Watch the Video</h2>
          <p className="text-sm text-gray-500 font-semibold">
            {isYoung
              ? "Watch carefully — learn how water & hygiene keep us healthy! 💧"
              : "Watch the full clip to unlock the next step"}
          </p>
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden shadow-lg mb-5 relative">
        {!watched && (
          <div className="absolute top-3 right-3 z-10 bg-black/70 text-white text-xs font-extrabold px-3 py-1.5 rounded-full">
            👀 Watch fully to continue
          </div>
        )}
        <iframe
          id="yt-player"
          src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0`}
          className="w-full h-64 md:h-80"
          allowFullScreen
          title="Lesson Video"
        />
      </div>

      {!done && (
        <div className="space-y-3">
          {!watched && (
            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 text-center">
              <p className="text-amber-700 font-extrabold text-sm">
                🎬 Watch the full video above, then mark it as complete!
              </p>
              <button
                onClick={() => setWatched(true)}
                className="mt-2 px-4 py-2 bg-amber-500 text-white rounded-xl font-extrabold text-sm hover:bg-amber-600 transition-all"
              >
                ✅ I watched it all!
              </button>
            </div>
          )}
          {watched && (
            <button
              onClick={onComplete}
              className="w-full py-4 rounded-2xl font-extrabold text-white text-lg shadow-lg transition-all hover:shadow-xl active:scale-95"
              style={{ background: `linear-gradient(135deg, ${accentFrom}, ${accentTo})` }}
            >
              ⭐ Mark as Complete & Continue!
            </button>
          )}
        </div>
      )}

      {done && (
        <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 text-center">
          <p className="text-green-600 font-extrabold">✅ Video completed! Well done! ⭐</p>
        </div>
      )}
    </div>
  );
}

/* ─── TEXT SECTION ─── */
function KaveeshaTextSection({ subtopic, done, onComplete, accentFrom, accentTo, isYoung }) {
  const [speaking, setSpeaking] = useState(false);
  const [speechProgress, setSpeechProgress] = useState(0);
  const utteranceRef = useRef(null);

  const handleTextToSpeech = () => {
    if (!hasTextBody) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      setSpeechProgress(0);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(subtopic.content);
    utterance.rate = isYoung ? 0.85 : 0.95;
    utterance.pitch = isYoung ? 1.2 : 1.0;
    utterance.lang = "en-US";
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(
      (v) => v.name.includes("Google") || v.name.includes("Samantha")
    );
    if (preferred) utterance.voice = preferred;
    utterance.onend = () => { setSpeaking(false); setSpeechProgress(100); };
    utterance.onboundary = (e) => {
      const pct = Math.round((e.charIndex / subtopic.content.length) * 100);
      setSpeechProgress(pct);
    };
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  };

  const handleDownloadPDF = async () => {
    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text(subtopic?.title || "Lesson", 20, 25);
    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80);
    const lines = doc.splitTextToSize(subtopic?.content || "", 170);
    doc.text(lines, 20, 40);
    doc.save(`${subtopic?.title || "lesson"}.pdf`);
  };

  const hasTextBody = !!(subtopic?.content && String(subtopic.content).trim());
  const hasFiles = !!(subtopic?.contentFiles && subtopic.contentFiles.length > 0);

  if (!hasTextBody && !hasFiles) {
    return (
      <div className="p-8 text-center">
        <div className="text-5xl mb-3">📝</div>
        <p className="text-gray-400 font-bold">No reading content for this lesson yet</p>
        {!done && (
          <button
            onClick={onComplete}
            className="mt-4 px-6 py-3 rounded-2xl font-extrabold text-white shadow-md"
            style={{ background: `linear-gradient(135deg, ${accentFrom}, ${accentTo})` }}
          >
            Skip & Continue →
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-5">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-md"
          style={{ background: `linear-gradient(135deg, ${accentFrom}, ${accentTo})` }}
        >
          📝
        </div>
        <div>
          <h2 className="display-font text-xl font-extrabold text-gray-800">Read & learn</h2>
          <p className="text-sm text-sky-900 font-semibold">
            {isYoung
              ? "Read, listen, or open teacher files — clean water tips! 💧"
              : "Work through the text and any PDFs or slides below"}
          </p>
        </div>
      </div>

      <div className="flex gap-3 mb-5 flex-wrap">
        {hasTextBody && (
          <button
            onClick={handleTextToSpeech}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl font-extrabold text-white shadow-md transition-all hover:shadow-lg active:scale-95"
            style={{
              background: speaking
                ? "linear-gradient(135deg, #EF4444, #F97316)"
                : "linear-gradient(135deg, #7c3aed, #0d9488)",
            }}
          >
            <span className="text-xl">{speaking ? "⏹️" : "🔊"}</span>
            {speaking ? "Stop Reading" : "Read to Me!"}
          </button>
        )}
        <button
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl font-extrabold text-gray-700 bg-gray-100 hover:bg-gray-200 shadow-md transition-all active:scale-95"
        >
          <span className="text-xl">📄</span>
          Download PDF
        </button>
      </div>

      {speaking && (
        <div className="mb-4">
          <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
            <span>🔊 Reading aloud...</span>
            <span>{speechProgress}%</span>
          </div>
          <div className="h-2 bg-purple-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 rounded-full transition-all duration-300"
              style={{ width: `${speechProgress}%` }}
            />
          </div>
        </div>
      )}

      {hasTextBody && (
        <div className="bg-sky-50 rounded-2xl p-6 mb-5 border-2 border-sky-300">
          <p
            className="text-slate-800 leading-relaxed font-semibold whitespace-pre-wrap"
            style={{ fontSize: isYoung ? "18px" : "16px", lineHeight: isYoung ? "1.95" : "1.85" }}
          >
            {subtopic.content}
          </p>
        </div>
      )}

      {hasFiles && (
        <div className="rounded-2xl p-5 mb-5 border-2 border-amber-400 bg-amber-50">
          <p className="font-extrabold text-amber-900 mb-3 flex items-center gap-2">
            <span className="text-2xl">📎</span> Your teacher added files
          </p>
          <ul className="space-y-2">
            {(subtopic.contentFiles || []).map((f) => (
              <li key={f._id || f.url}>
                <a
                  href={f.url?.startsWith("/") ? `${API}${f.url}` : f.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-bold text-teal-800 underline decoration-2 hover:text-teal-950"
                >
                  📄 {f.name || "Download file"}
                </a>
              </li>
            ))}
          </ul>
          <p className="text-sm text-amber-900 font-semibold mt-3">
            Open each file, then tap complete when you&apos;re done! ✨
          </p>
        </div>
      )}

      {!done && (
        <button
          onClick={onComplete}
          className="w-full py-4 rounded-2xl font-extrabold text-white text-lg shadow-lg transition-all hover:shadow-xl active:scale-95"
          style={{ background: `linear-gradient(135deg, ${accentFrom}, ${accentTo})` }}
        >
          ⭐ I Read It! Mark Complete & Continue
        </button>
      )}

      {done && (
        <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 text-center">
          <p className="text-green-600 font-extrabold">✅ Reading completed! Great job! ⭐</p>
        </div>
      )}
    </div>
  );
}

/* ─── IMAGES SECTION ─── */
function KaveeshaImagesSection({ subtopic, done, onComplete, accentFrom, accentTo, isYoung }) {
  const [currentImg, setCurrentImg] = useState(0);
  const [viewedAll, setViewedAll] = useState(false);
  const images = subtopic?.images || [];

  const handleNext = () => {
    if (currentImg < images.length - 1) {
      const next = currentImg + 1;
      setCurrentImg(next);
      if (next === images.length - 1) setViewedAll(true);
    } else {
      setViewedAll(true);
    }
  };

  const getImgSrc = (img) => (img.startsWith("/uploads") ? `${API}${img}` : img);

  if (!images.length) {
    return (
      <div className="p-8 text-center">
        <div className="text-5xl mb-3">🖼️</div>
        <p className="text-gray-400 font-bold">No images for this lesson yet</p>
        {!done && (
          <button
            onClick={onComplete}
            className="mt-4 px-6 py-3 rounded-2xl font-extrabold text-white shadow-md"
            style={{ background: `linear-gradient(135deg, ${accentFrom}, ${accentTo})` }}
          >
            Skip & Continue →
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-5">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-md"
          style={{ background: `linear-gradient(135deg, ${accentFrom}, ${accentTo})` }}
        >
          🖼️
        </div>
        <div>
          <h2 className="display-font text-xl font-extrabold text-gray-800">View Images</h2>
          <p className="text-sm text-gray-500 font-semibold">
            Image {currentImg + 1} of {images.length}
          </p>
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden shadow-lg mb-4 bg-gray-50">
        <img
          src={getImgSrc(images[currentImg])}
          alt={`Lesson image ${currentImg + 1}`}
          className="w-full max-h-72 object-contain"
          style={{ background: "#f8fafc" }}
        />
      </div>

      <div className="flex justify-center gap-2 mb-5">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setCurrentImg(i);
              if (i === images.length - 1) setViewedAll(true);
            }}
            className="w-3 h-3 rounded-full transition-all"
            style={{
              background: i === currentImg ? accentFrom : i < currentImg ? "#10B981" : "#e5e7eb",
              transform: i === currentImg ? "scale(1.4)" : "scale(1)",
            }}
          />
        ))}
      </div>

      <div className="flex gap-3 mb-5">
        <button
          onClick={() => setCurrentImg(Math.max(0, currentImg - 1))}
          disabled={currentImg === 0}
          className="flex-1 py-3 rounded-2xl font-extrabold text-gray-600 bg-gray-100 hover:bg-gray-200 disabled:opacity-40 transition-all"
        >
          ← Previous
        </button>
        <button
          onClick={handleNext}
          className="flex-1 py-3 rounded-2xl font-extrabold text-white shadow-md transition-all hover:shadow-lg active:scale-95"
          style={{ background: `linear-gradient(135deg, ${accentFrom}, ${accentTo})` }}
        >
          {currentImg === images.length - 1 ? "All Viewed! ✅" : "Next →"}
        </button>
      </div>

      {(viewedAll || images.length === 1) && !done && (
        <button
          onClick={onComplete}
          className="w-full py-4 rounded-2xl font-extrabold text-white text-lg shadow-lg transition-all hover:shadow-xl active:scale-95"
          style={{ background: `linear-gradient(135deg, ${accentFrom}, ${accentTo})` }}
        >
          ⭐ I Viewed All! Mark Complete & Continue
        </button>
      )}

      {done && (
        <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 text-center">
          <p className="text-green-600 font-extrabold">✅ Images completed! Awesome! ⭐</p>
        </div>
      )}
    </div>
  );
}

/* ─── QUIZ SECTION ─── */
function KaveeshaQuizSection({
  subtopic, quiz, userId, ageGroup, done,
  onComplete, onNavigateBack, accentFrom, accentTo, isYoung,
}) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [score, setScore] = useState(0);
  const [allDone, setAllDone] = useState(done);
  const [showFinalCelebration, setShowFinalCelebration] = useState(false);
  const [saving, setSaving] = useState(false);
  const [serverMsg, setServerMsg] = useState("");

  const handleAnswer = (qIdx, option) => {
    if (submitted) return;
    setAnswers({ ...answers, [qIdx]: option });
  };

  const handleSubmit = async () => {
    if (!quiz?.questions) return;
    const total = quiz.questions.length;
    let correct = 0;
    const res = quiz.questions.map((q, i) => {
      const isCorrect = answers[i] === q.correctAnswer;
      if (isCorrect) correct++;
      return { isCorrect, correctAnswer: q.correctAnswer, selected: answers[i] };
    });
    setResults(res);
    setScore(correct);
    setSubmitted(true);
    if (correct !== total) return;

    const miniQuizAnswers = quiz.questions.map((q, i) => ({
      questionId: q._id,
      selectedOption: answers[i],
    }));

    try {
      setSaving(true);
      setServerMsg("");
      const r = await onComplete({ miniQuizAnswers, score: correct, total });
      if (r?.ok) {
        setAllDone(true);
        setShowFinalCelebration(true);
      } else {
        setServerMsg(r?.message || "Some answers are incorrect. Retry the quiz.");
      }
    } catch (e) {
      setServerMsg(e?.response?.data?.message || "Could not save quiz completion. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
    setResults(null);
    setScore(0);
    setServerMsg("");
  };

  if (!quiz?.questions?.length) {
    return (
      <div className="p-8 text-center">
        <div className="text-5xl mb-3">❓</div>
        <p className="text-gray-400 font-bold">No quiz for this lesson yet</p>
        {!done && (
          <button
            onClick={onComplete}
            className="mt-4 px-6 py-3 rounded-2xl font-extrabold text-white shadow-md"
            style={{ background: `linear-gradient(135deg, ${accentFrom}, ${accentTo})` }}
          >
            Complete Lesson →
          </button>
        )}
      </div>
    );
  }

  if (showFinalCelebration || (done && allDone)) {
    return (
      <div className="p-8 text-center">
        <div className="text-7xl mb-4 float">🏆</div>
        <div className="flex justify-center gap-1 mb-4">
          {[...Array(4)].map((_, i) => (
            <span key={i} className="text-3xl pop" style={{ animationDelay: `${i * 0.1}s` }}>⭐</span>
          ))}
        </div>
        <h2 className="display-font text-3xl font-extrabold text-gray-800 mb-2">
          🎉 Subtopic Complete!
        </h2>
        <p className="text-gray-600 font-bold text-lg mb-2">
          You completed{" "}
          <span className="font-extrabold" style={{ color: accentFrom }}>
            {subtopic?.title}
          </span>
          !
        </p>
        <p className="text-gray-500 font-semibold mb-6">
          {isYoung
            ? "Amazing work! You're a clean-water champion! 🌟"
            : "Excellent! The next lesson step is ready for you! 🔓"}
        </p>
        <div className="bg-green-50 rounded-2xl p-4 mb-6 border-2 border-green-200">
          <p className="text-green-700 font-extrabold text-lg">
            🎯 Quiz Score: {score}/{quiz.questions.length}
          </p>
        </div>
        <button
          onClick={onNavigateBack}
          className="px-8 py-4 rounded-2xl font-extrabold text-white text-lg shadow-lg transition-all hover:shadow-xl active:scale-95"
          style={{ background: `linear-gradient(135deg, ${accentFrom}, ${accentTo})` }}
        >
          🚀 Back to Lessons →
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-5">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-md"
          style={{ background: `linear-gradient(135deg, ${accentFrom}, ${accentTo})` }}
        >
          ❓
        </div>
        <div>
          <h2 className="display-font text-xl font-extrabold text-gray-800">Mini Quiz</h2>
          <p className="text-sm text-gray-500 font-semibold">
            {isYoung
              ? "Get them all right to finish this step and unlock the next one! 💧"
              : "Answer all questions correctly to complete this subtopic"}
          </p>
        </div>
      </div>

      {submitted && (
        <div
          className={`rounded-2xl p-4 mb-5 text-center border-2 ${
            score === quiz.questions.length
              ? "bg-green-50 border-green-200"
              : "bg-amber-50 border-amber-200"
          }`}
        >
          <p
            className={`font-extrabold text-lg ${
              score === quiz.questions.length ? "text-green-600" : "text-amber-600"
            }`}
          >
            {score === quiz.questions.length
              ? "🎉 Perfect Score! All correct!"
              : `You got ${score}/${quiz.questions.length} correct. Try again! 💪`}
          </p>
          {!!serverMsg && (
            <p className="mt-2 text-sm font-extrabold text-amber-700">{serverMsg}</p>
          )}
        </div>
      )}

      <div className="space-y-6">
        {quiz.questions.map((q, qi) => (
          <div key={qi} className="bg-gray-50 rounded-2xl p-5 border-2 border-gray-100">
            <p className="font-extrabold text-gray-800 mb-4 text-base">
              <span
                className="inline-block w-7 h-7 rounded-full text-white text-center text-sm leading-7 mr-2 shrink-0"
                style={{ background: accentFrom }}
              >
                {qi + 1}
              </span>
              {q.question}
            </p>
            <div className="grid grid-cols-1 gap-2">
              {q.options.map((opt, oi) => {
                const isSelected = answers[qi] === opt;
                const isCorrect = results && results[qi]?.correctAnswer === opt;
                const isWrong = submitted && isSelected && !isCorrect;
                return (
                  <button
                    key={oi}
                    onClick={() => handleAnswer(qi, opt)}
                    disabled={submitted}
                    className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all border-2 ${
                      isCorrect && submitted
                        ? "bg-green-100 border-green-400 text-green-700"
                        : isWrong
                        ? "bg-red-100 border-red-400 text-red-700"
                        : isSelected
                        ? "border-2 text-white shadow-md"
                        : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
                    }`}
                    style={
                      isSelected && !submitted
                        ? { background: accentFrom, borderColor: accentFrom }
                        : {}
                    }
                  >
                    {isCorrect && submitted ? "✅ " : isWrong ? "❌ " : isSelected ? "→ " : "○ "}
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={Object.keys(answers).length < quiz.questions.length}
            className="w-full py-4 rounded-2xl font-extrabold text-white text-lg shadow-lg transition-all hover:shadow-xl active:scale-95 disabled:opacity-50"
            style={{ background: `linear-gradient(135deg, ${accentFrom}, ${accentTo})` }}
          >
            🎯 Submit Answers!
          </button>
        ) : score < quiz.questions.length ? (
          <button
            onClick={handleRetry}
            className="w-full py-4 rounded-2xl font-extrabold text-white text-lg shadow-lg transition-all hover:shadow-xl active:scale-95"
            style={{ background: "linear-gradient(135deg, #F59E0B, #EF4444)" }}
          >
            🔄 Try Again!
          </button>
        ) : (
          <button
            type="button"
            disabled={saving}
            className="w-full py-4 rounded-2xl font-extrabold text-white text-lg shadow-lg transition-all hover:shadow-xl active:scale-95 disabled:opacity-60"
            style={{ background: `linear-gradient(135deg, ${accentFrom}, ${accentTo})` }}
          >
            {saving ? "Saving..." : "✅ Completing..."}
          </button>
        )}
      </div>
    </div>
  );
}