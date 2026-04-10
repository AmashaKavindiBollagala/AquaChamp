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
  const ageGroup = user?.age >= 6 && user?.age <= 10 ? "6-10" : "11-15";

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
      setTopics(topicsRes.data || []);
      const subs = Array.isArray(subsRes.data)
        ? subsRes.data
        : subsRes.data?.subtopics || [];
      setSubtopics(subs);

      // Build progress map
      const token =
        localStorage.getItem("aquachamp_token") ||
        sessionStorage.getItem("aquachamp_token");
      const progressMap = {};
      for (const topic of topicsRes.data || []) {
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

  const isYoung = ageGroup === "6-10";

  const bgGradient = isYoung
    ? "from-[#fff9f0] via-[#fff0fa] to-[#f0f8ff]"
    : "from-[#f0f4ff] via-[#f5f0ff] to-[#f0fff8]";

  const accentColor = isYoung ? "#FF6B6B" : "#6C63FF";
  const accentColor2 = isYoung ? "#FFD93D" : "#00D4AA";

  return (
    <div className={`min-h-screen bg-linear-to-br ${bgGradient} font-sans`}>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Baloo+2:wght@400;600;700;800&display=swap');
        body { font-family: 'Nunito', sans-serif; }
        .display-font { font-family: 'Baloo 2', cursive; }
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

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome Hero */}
        <div
          className="rounded-3xl p-8 mb-8 relative overflow-hidden shadow-2xl"
          style={{
            background: isYoung
              ? "linear-gradient(135deg, #FF6B6B, #FFD93D, #6BCB77)"
              : "linear-gradient(135deg, #6C63FF, #00D4AA, #3B82F6)",
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
                {isYoung ? "🐠" : "🏊"}
              </div>
              <div>
                <h1 className="display-font text-4xl font-extrabold text-white drop-shadow-md">
                  Hey {user?.firstName}! 👋
                </h1>
                <p className="text-white/90 font-semibold text-lg mt-1">
                  {isYoung
                    ? "Ready for a fun swimming adventure? 🌊"
                    : "Level up your swimming skills today! 💪"}
                </p>
              </div>
            </div>
            <div className="flex gap-4 mt-4 flex-wrap">
              {[
                { icon: "🎯", label: `Age Group`, value: `${ageGroup} years` },
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
              className="flex items-center gap-3 px-6 py-3 rounded-2xl font-extrabold text-white shadow-lg transition-all hover:scale-105 active:scale-95"
              style={{
                background: "linear-gradient(135deg, #F59E0B, #EF4444)",
              }}
            >
              <span className="text-2xl">📖</span>
              {showBasic ? "Hide" : "Show"} Basic Lessons (Age 6–10)
              <span className="ml-2 text-xl">{showBasic ? "▲" : "▼"}</span>
            </button>
            {showBasic && (
              <KaveeshaBasicLessonsPanel userId={user?._id} navigate={navigate} />
            )}
          </div>
        )}

        {/* Main Lessons Section */}
        <div className="mb-6">
          <h2 className="display-font text-3xl font-extrabold text-gray-800 mb-2">
            {isYoung ? "🌟 Your Lessons" : "🚀 Your Main Lessons"}
          </h2>
          <p className="text-gray-500 font-semibold">
            {isYoung
              ? "Tap a lesson to start learning!"
              : "Continue your advanced swimming journey"}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-64 rounded-3xl animate-pulse"
                style={{ background: "linear-gradient(135deg, #e0e7ff, #f0fdf4)" }}
              />
            ))}
          </div>
        ) : topics.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-8xl mb-4 float">🏊</div>
            <p className="text-2xl font-extrabold text-gray-400">
              No lessons yet!
            </p>
            <p className="text-gray-400 mt-2">
              Your teacher is preparing awesome lessons for you!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.map((topic, i) => {
              const topicSubs = getSubtopicsForTopic(topic._id);
              const pct = progress[topic._id] || 0;
              const completedSubs = topicSubs.filter((s) => !s.isLocked).length;

              return (
                <TopicCard
                  key={topic._id}
                  topic={topic}
                  subtopics={topicSubs}
                  progress={pct}
                  completedSubs={completedSubs}
                  index={i}
                  isYoung={isYoung}
                  onClick={() =>
                    navigate(`/student/topic/${topic._id}`, {
                      state: { topic, ageGroup, userId: user?._id },
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
function TopicCard({ topic, subtopics, progress, completedSubs, index, isYoung, onClick }) {
  const CARD_COLORS = [
    { from: "#FF6B6B", to: "#FF8E53", emoji: "🏊" },
    { from: "#6C63FF", to: "#3B82F6", emoji: "🌊" },
    { from: "#00D4AA", to: "#10B981", emoji: "🐬" },
    { from: "#FFD93D", to: "#F59E0B", emoji: "⭐" },
    { from: "#FF6BCB", to: "#A855F7", emoji: "🦋" },
    { from: "#4ADE80", to: "#06B6D4", emoji: "🐟" },
  ];
  const color = CARD_COLORS[index % CARD_COLORS.length];

  return (
    <div
      className="card-hover cursor-pointer rounded-3xl overflow-hidden shadow-xl pop"
      style={{ animationDelay: `${index * 0.1}s` }}
      onClick={onClick}
    >
      {/* Card Header */}
      <div
        className="p-6 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${color.from}, ${color.to})`,
        }}
      >
        <div className="absolute -right-4 -top-4 text-8xl opacity-20">
          {color.emoji}
        </div>
        <div className="relative z-10">
          <div className="text-4xl mb-2 float">{color.emoji}</div>
          <h3 className="display-font text-xl font-extrabold text-white leading-tight">
            {topic.title}
          </h3>
          {topic.description && (
            <p className="text-white/80 text-sm mt-1 font-semibold line-clamp-2">
              {topic.description}
            </p>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="bg-white p-5">
        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-extrabold text-gray-600">
              Progress
            </span>
            <span
              className="text-sm font-extrabold"
              style={{ color: color.from }}
            >
              {progress}%
            </span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
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
          <span className="text-xs font-bold text-gray-400">
            📂 {subtopics.length} lessons
          </span>
          {progress === 100 ? (
            <span className="text-xs bg-green-100 text-green-600 font-extrabold px-3 py-1 rounded-full">
              ✅ Completed!
            </span>
          ) : progress > 0 ? (
            <span
              className="text-xs font-extrabold px-3 py-1 rounded-full text-white"
              style={{ background: color.from }}
            >
              Keep going! 🔥
            </span>
          ) : (
            <span className="text-xs bg-gray-100 text-gray-500 font-extrabold px-3 py-1 rounded-full">
              Start now! ✨
            </span>
          )}
        </div>

        <button
          className="w-full mt-4 py-3 rounded-2xl font-extrabold text-white shadow-md transition-all hover:shadow-lg active:scale-95"
          style={{
            background: `linear-gradient(135deg, ${color.from}, ${color.to})`,
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
      .then(([topicsRes]) => {
        setTopics(topicsRes.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="mt-4 p-6 bg-amber-50 rounded-3xl text-center text-amber-600 font-bold">
        Loading basic lessons...
      </div>
    );

  return (
    <div className="mt-4 bg-linear-to-br from-amber-50 to-orange-50 rounded-3xl p-6 border-2 border-amber-200 shadow-lg">
      <h3 className="display-font text-2xl font-extrabold text-amber-700 mb-4">
        📖 Basic Lessons — Age 6–10
      </h3>
      <p className="text-amber-600 font-semibold mb-5 text-sm">
        Want to review the basics? These are great for building a strong foundation! 🌟
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
            className="card-hover bg-white rounded-2xl p-4 text-left shadow-md border-2 border-amber-100 hover:border-amber-300"
          >
            <div className="text-3xl mb-2">
              {["🏊", "🌊", "🐬", "⭐", "🦋", "🐟"][i % 6]}
            </div>
            <p className="font-extrabold text-gray-700 text-sm">{topic.title}</p>
            <p className="text-xs text-amber-500 font-bold mt-1">
              Tap to explore →
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}