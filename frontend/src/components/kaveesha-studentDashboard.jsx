import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import KaveeshaStudentNav from "./kaveesha-studentNav";

const API = "http://localhost:4000";

export default function KaveeshaStudentDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [topics, setTopics] = useState([]);
  const [subtopics, setSubtopics] = useState([]);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [showBasic, setShowBasic] = useState(false);
  const isYoung = user?.age >= 5 && user?.age <= 10;
  const ageGroup = isYoung ? "6-10" : "11-15";

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
    if (!user) return;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [topicsRes, subsRes] = await Promise.all([
        axios.get(`${API}/api/topics`),
        axios.get(`${API}/api/subtopics`, { params: { ageGroup } }),
      ]);
      const allTopics = topicsRes.data || [];
      const subs = Array.isArray(subsRes.data)
        ? subsRes.data
        : subsRes.data?.subtopics || [];
      setSubtopics(subs);
      const topicIdsWithLessons = new Set(
        subs.map((s) => String(s.topicId?._id || s.topicId))
      );
      const filteredTopics = allTopics.filter((t) =>
        topicIdsWithLessons.has(String(t._id))
      );
      setTopics(filteredTopics);

      // Build progress map
      const token =
        localStorage.getItem("aquachamp_token") ||
        sessionStorage.getItem("aquachamp_token");
      const progressMap = {};
      for (const topic of filteredTopics) {
        try {
          const r = await axios.post(
            `${API}/api/subtopics/progress/topic`,
            { userId: user._id, topicId: topic._id, ageGroup },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          progressMap[topic._id] = r.data.percentage || 0;
        } catch {
          progressMap[topic._id] = 0;
        }
      }
      setProgress(progressMap);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getSubtopicsForTopic = (topicId) =>
    subtopics.filter(
      (s) => s.topicId === topicId || s.topicId?._id === topicId
    );

  const bgGradient = isYoung
    ? "from-slate-50 via-white to-blue-50"
    : "from-slate-50 via-white to-blue-50";

  const accentColor = isYoung ? "#0ea5e9" : "#2563eb";
  const accentColor2 = isYoung ? "#06b6d4" : "#0891b2";

  return (
    <div className={`min-h-screen bg-gradient-to-br ${bgGradient} font-sans`}>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Nunito:wght@400;600;700;800;900&display=swap');
        body { font-family: 'Inter', sans-serif; }
        .display-font { font-family: 'Nunito', sans-serif; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes pop { 0%{transform:scale(0.8);opacity:0} 100%{transform:scale(1);opacity:1} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        .float { animation: float 3s ease-in-out infinite; }
        .pop { animation: pop 0.4s cubic-bezier(0.175,0.885,0.32,1.275) forwards; }
        .card-hover { transition: all 0.3s cubic-bezier(0.175,0.885,0.32,1.275); }
        .card-hover:hover { transform: translateY(-6px) scale(1.02); }
        .progress-bar { transition: width 1s cubic-bezier(0.4,0,0.2,1); }
      `}</style>

      <KaveeshaStudentNav user={user} ageGroup={ageGroup} />

      <main className="max-w-6xl mx-auto px-4 py-8 pb-16">
        {/* Welcome Hero */}
        <div
          className="rounded-3xl p-8 mb-8 relative overflow-hidden shadow-xl"
          style={{
            background: isYoung
              ? "linear-gradient(135deg, #0ea5e9, #06b6d4, #0891b2)"
              : "linear-gradient(135deg, #2563eb, #0891b2, #0d9488)",
          }}
        >
          {/* Decorative bubbles */}
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full opacity-20 bg-white"
              style={{
                width: `${40 + i * 20}px`,
                height: `${40 + i * 20}px`,
                top: `${Math.random() * 80}%`,
                left: `${Math.random() * 90}%`,
                animationDelay: `${i * 0.5}s`,
              }}
            />
          ))}
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-3">
              <div className="text-5xl float">
                {isYoung ? "💧" : "🌍"}
              </div>
              <div>
                <h1 className="display-font text-4xl font-extrabold text-white drop-shadow-md">
                  Hey {user?.firstName}! 👋
                </h1>
                <p className="text-white/95 font-semibold text-lg mt-1">
                  {isYoung
                    ? "Learn about clean water & staying healthy! 🚰✨"
                    : "Explore WASH lessons — safe water, hygiene & our planet! 🧼💙"}
                </p>
              </div>
            </div>
            <div className="flex gap-4 mt-4 flex-wrap">
              {[
                {
                  icon: "🎯",
                  label: "Age group",
                  value: isYoung ? "5–10" : "11–15",
                },
                { icon: "📚", label: "Topics", value: topics.length },
                {
                  icon: "⭐",
                  label: "Completed",
                  value: `${Object.values(progress).filter((p) => p === 100).length}`,
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="bg-white/25 backdrop-blur-sm rounded-2xl px-5 py-3 flex items-center gap-3"
                >
                  <span className="text-2xl">{stat.icon}</span>
                  <div>
                    <div className="text-xs text-white/80 font-semibold">
                      {stat.label}
                    </div>
                    <div className="text-white font-extrabold text-lg leading-tight">
                      {stat.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Basic Lessons Button for 11-15 */}
        {!isYoung && (
          <div className="mb-8">
            <button
              onClick={() => setShowBasic(!showBasic)}
              className="flex items-center gap-3 px-6 py-3 rounded-2xl font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95"
              style={{
                background: "linear-gradient(135deg, #0891b2, #0e7490)",
              }}
            >
              <span className="text-2xl">📖</span>
              {showBasic ? "Hide" : "Show"} Basic lessons (age 5–10)
              <span className="ml-2 text-xl">{showBasic ? "▲" : "▼"}</span>
            </button>
            {showBasic && (
              <KaveeshaBasicLessonsPanel userId={user?._id} navigate={navigate} />
            )}
          </div>
        )}

        {/* Main Lessons Section */}
        <div className="mb-6">
          <h2 className="display-font text-3xl font-extrabold text-slate-800 mb-2">
            {isYoung ? "🌟 Your water & health lessons" : "🚀 Your main lessons"}
          </h2>
          <p className="text-slate-600 font-medium">
            {isYoung
              ? "Tap a card to start — finish each step to unlock the next! 💧"
              : "Your core lessons are here; open \"Basic\" anytime to review simpler topics."}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-64 rounded-3xl animate-pulse bg-white/30"
              />
            ))}
          </div>
        ) : topics.length === 0 ? (
          <div className="text-center py-20 rounded-3xl bg-white/95 shadow-xl mx-2">
            <div className="text-8xl mb-4 float">🚰</div>
            <p className="text-2xl font-extrabold text-teal-800">
              No lessons yet!
            </p>
            <p className="text-teal-700 mt-2 font-semibold">
              Your teacher is adding clean water & hygiene lessons for you! 💙
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.map((topic, i) => {
              const topicSubs = getSubtopicsForTopic(topic._id);
              const pct = progress[topic._id] || 0;

              return (
                <TopicCard
                  key={topic._id}
                  topic={topic}
                  subtopics={topicSubs}
                  progress={pct}
                  index={i}
                  onClick={() =>
                    navigate(`/student/topic/${topic._id}`, {
                      state: { topic, ageGroup, userId: user?._id, colorIndex: i },
                    })
                  }
                />
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

/* ─── Topic Card ─── */
function TopicCard({ topic, subtopics, progress, index, onClick }) {
  const API = "http://localhost:4000";
  const CARD_COLORS = [
    { from: "#ec4899", to: "#db2777", accent: "#db2777", hover: "#fce7f3", emoji: "💧" },
    { from: "#3b82f6", to: "#2563eb", accent: "#2563eb", hover: "#dbeafe", emoji: "🚰" },
    { from: "#22c55e", to: "#16a34a", accent: "#16a34a", hover: "#dcfce7", emoji: "🌿" },
    { from: "#f59e0b", to: "#d97706", accent: "#d97706", hover: "#fef3c7", emoji: "☀️" },
    { from: "#8b5cf6", to: "#7c3aed", accent: "#7c3aed", hover: "#ede9fe", emoji: "🧼" },
    { from: "#06b6d4", to: "#0891b2", accent: "#0891b2", hover: "#cffafe", emoji: "🌍" },
  ];
  const color = CARD_COLORS[index % CARD_COLORS.length];
  const hasImage = topic.imageUrl && topic.imageUrl.trim() !== "";
  const imageUrl = hasImage 
    ? (topic.imageUrl.startsWith("/") ? `${API}${topic.imageUrl}` : topic.imageUrl)
    : null;

  return (
    <div
      className="card-hover cursor-pointer rounded-3xl overflow-hidden shadow-xl pop bg-white"
      style={{ 
        animationDelay: `${index * 0.1}s`,
        border: `2px solid ${color.from}30`
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = color.from;
        e.currentTarget.style.boxShadow = `0 12px 32px ${color.from}30`;
        e.currentTarget.style.transform = "translateY(-8px) scale(1.02)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = `${color.from}30`;
        e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)";
        e.currentTarget.style.transform = "translateY(0) scale(1)";
      }}
    >
      {/* Card Image/Header */}
      <div className="relative overflow-hidden" style={{ height: "200px" }}>
        {imageUrl ? (
          <>
            <img 
              src={imageUrl} 
              alt={topic.title}
              className="w-full h-full object-cover transition-transform duration-300"
            />
            <div 
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to bottom, rgba(0,0,0,0.05), rgba(0,0,0,0.5))`
              }}
            />
          </>
        ) : (
          <div
            className="absolute inset-0 transition-transform duration-300"
            style={{
              background: `linear-gradient(135deg, ${color.from}, ${color.to})`,
            }}
          >
            <div className="absolute -right-4 -top-4 text-9xl opacity-20">
              {color.emoji}
            </div>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-5">
        {/* Topic Title */}
        <h3 
          className="display-font text-xl font-extrabold mb-2 leading-tight transition-colors duration-300"
          style={{ color: color.accent }}
        >
          {topic.title}
        </h3>
        
        {/* Description */}
        {topic.description && (
          <p className="text-slate-600 text-sm mb-4 font-medium line-clamp-2">
            {topic.description}
          </p>
        )}
        
        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold text-slate-600">
              Progress
            </span>
            <span
              className="text-sm font-bold"
              style={{ color: color.from }}
            >
              {progress}%
            </span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="progress-bar h-full rounded-full"
              style={{
                width: `${progress}%`,
                background: `linear-gradient(90deg, ${color.from}, ${color.to})`,
              }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-slate-500">
            📂 {subtopics.length} lessons
          </span>
          {progress === 100 ? (
            <span 
              className="text-xs font-bold px-3 py-1.5 rounded-full transition-colors duration-300"
              style={{ background: color.hover, color: color.accent }}
            >
              ✅ Completed!
            </span>
          ) : progress > 0 ? (
            <span
              className="text-xs font-bold px-3 py-1.5 rounded-full text-white transition-all duration-300"
              style={{ background: color.from }}
            >
              Keep going! 🔥
            </span>
          ) : (
            <span className="text-xs bg-slate-100 text-slate-600 font-bold px-3 py-1.5 rounded-full">
              Start now! ✨
            </span>
          )}
        </div>

        <button
          className="w-full mt-4 py-3 rounded-2xl font-bold text-white shadow-md transition-all duration-300 hover:shadow-lg active:scale-95"
          style={{
            background: `linear-gradient(135deg, ${color.from}, ${color.to})`,
            boxShadow: `0 4px 12px ${color.from}40`
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = `0 8px 20px ${color.from}60`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = `0 4px 12px ${color.from}40`;
          }}
        >
          {progress > 0 ? "Continue Learning →" : "Start Learning →"}
        </button>
      </div>
    </div>
  );
}

/* ─── Basic Lessons Panel (for 11-15 students) ─── */
function KaveeshaBasicLessonsPanel({ userId, navigate }) {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/api/topics`),
      axios.get(`${API}/api/subtopics`, { params: { ageGroup: "6-10" } }),
    ])
      .then(([topicsRes, subsRes]) => {
        const basicSubs = Array.isArray(subsRes.data)
          ? subsRes.data
          : subsRes.data?.subtopics || [];
        const ids = new Set(
          basicSubs.map((s) => String(s.topicId?._id || s.topicId))
        );
        setTopics(
          (topicsRes.data || []).filter((t) => ids.has(String(t._id)))
        );
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="mt-4 p-6 bg-slate-800/90 text-white rounded-3xl text-center font-bold shadow-lg">
        Loading basic lessons… 💧
      </div>
    );

  return (
    <div className="mt-4 rounded-3xl p-6 border-2 border-slate-200 shadow-xl bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900">
      <h3 className="display-font text-2xl font-bold text-white mb-2">
        📖 Basic lessons — ages 5–10
      </h3>
      <p className="text-slate-300 font-medium mb-5 text-sm">
        Quick, friendly topics on clean water & hygiene — perfect for a refresher! 🚰✨
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {topics.map((topic, i) => (
          <button
            key={topic._id}
            onClick={() =>
              navigate(`/student/topic/${topic._id}`, {
                state: { topic, ageGroup: "6-10", userId, isBasic: true },
              })
            }
            className="card-hover bg-white rounded-2xl p-4 text-left shadow-md border-2 border-slate-200 hover:border-blue-400"
          >
            <div className="text-3xl mb-2">
              {["💧", "🧼", "🚰", "🌿", "⭐", "🌍"][i % 6]}
            </div>
            <p className="font-bold text-slate-800 text-sm">{topic.title}</p>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Tap to learn →
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}