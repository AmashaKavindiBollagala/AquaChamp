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
  // FIX: Changed from "6-10" to "5-10" to match game database ageGroup
  const ageGroup = isYoung ? "5-10" : "11-15";

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
      .then((r) => {
        const userData = r.data.user;
        setUser(userData);
        // FIX: Store user data in localStorage for other components to access
        // IMPORTANT: Store username (not firstName) for game scores database
        // Calculate ageGroup from userData directly (not from user state which isn't set yet)
        const userIsYoung = userData?.age >= 5 && userData?.age <= 10;
        const userAgeGroup = userIsYoung ? "5-10" : "11-15";
        localStorage.setItem("aquachamp_user", JSON.stringify(userData));
        localStorage.setItem("aquachamp_username", userData.username || userData.firstName || "Player");
        localStorage.setItem("aquachamp_ageGroup", userAgeGroup);
      })
      .catch(() => navigate("/login"));
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      // FIX: Query for both "5-10" AND "6-10" since database might have either
      // The model was recently changed from "6-10" to "5-10" but existing data uses "6-10"
      const [topicsRes, subsRes5to10, subsRes6to10] = await Promise.all([
        axios.get(`${API}/api/topics`),
        axios.get(`${API}/api/subtopics`, { params: { ageGroup: "5-10" } }),
        axios.get(`${API}/api/subtopics`, { params: { ageGroup: "6-10" } }),
      ]);
      const allTopics = topicsRes.data || [];
      
      // Merge subtopics from both age group values
      const subs5to10 = Array.isArray(subsRes5to10.data)
        ? subsRes5to10.data
        : subsRes5to10.data?.subtopics || [];
      const subs6to10 = Array.isArray(subsRes6to10.data)
        ? subsRes6to10.data
        : subsRes6to10.data?.subtopics || [];
      
      // Combine and deduplicate by _id
      const subsMap = new Map();
      [...subs5to10, ...subs6to10].forEach(s => {
        if (s._id) subsMap.set(String(s._id), s);
      });
      const subs = Array.from(subsMap.values());
      
      setSubtopics(subs);
      const topicIdsWithLessons = new Set(
        subs.map((s) => String(s.topicId?._id || s.topicId))
      );
      const filteredTopics = allTopics.filter((t) =>
        topicIdsWithLessons.has(String(t._id))
      );
      setTopics(filteredTopics);
      
      // Debug logs after filtering
      console.log('📊 Fetched subtopics:', { '5-10': subs5to10.length, '6-10': subs6to10.length, total: subs.length });
      console.log('📊 Sample subtopic:', subs[0]);
      console.log('📊 Topics found:', filteredTopics.length);
      console.log('📊 Topic IDs with lessons:', Array.from(topicIdsWithLessons));
      console.log('📊 Subtopic topicIds:', subs.map(s => String(s.topicId?._id || s.topicId)));

      // Build progress map
      const token =
        localStorage.getItem("aquachamp_token") ||
        sessionStorage.getItem("aquachamp_token");
      const studentId = user.id ?? user._id;
      const progressMap = {};
      if (studentId != null) {
        for (const topic of filteredTopics) {
          try {
            const r = await axios.post(
              `${API}/api/subtopics/progress/topic`,
              {
                userId: String(studentId),
                topicId: topic._id,
                ageGroup,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            progressMap[topic._id] = r.data.percentage || 0;
          } catch {
            progressMap[topic._id] = 0;
          }
        }
      }
      setProgress(progressMap);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // FIX: Get subtopics for a topic by comparing IDs as strings
  // Handles both ObjectId strings and populated ObjectId objects
  const getSubtopicsForTopic = (topicId) => {
    const topicIdStr = String(topicId);
    return subtopics.filter((s) => {
      const subTopicId = s.topicId?._id ? String(s.topicId._id) : String(s.topicId);
      return subTopicId === topicIdStr;
    });
  };

  const bgGradient = isYoung
    ? "from-slate-50 via-white to-blue-50"
    : "from-slate-50 via-white to-blue-50";

  const accentColor = isYoung ? "#0ea5e9" : "#2563eb";
  const accentColor2 = isYoung ? "#06b6d4" : "#0891b2";

  return (
    <div className={`min-h-screen bg-linear-to-br ${bgGradient} font-sans`}>
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
              <KaveeshaBasicLessonsPanel
                userId={user?.id || user?._id}
                navigate={navigate}
              />
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
                      state: {
                        topic,
                        ageGroup,
                        userId: user?.id || user?._id,
                        colorIndex: i,
                      },
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
  // Debug log to see what subtopics are passed
  console.log(`📋 TopicCard "${topic?.title}":`, { subtopicsCount: subtopics?.length, subtopics });
  
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

        {/* Subtopics List - Show lessons under each topic */}
        {subtopics.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-500 mb-2">📖 Lessons in this topic:</p>
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {subtopics.slice(0, 5).map((sub, idx) => (
                <div 
                  key={sub._id || idx}
                  className="flex items-center gap-2 text-xs text-slate-600 font-medium"
                >
                  <span 
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                    style={{ background: color.hover, color: color.accent }}
                  >
                    {idx + 1}
                  </span>
                  <span className="truncate">{sub.title || `Lesson ${idx + 1}`}</span>
                </div>
              ))}
              {subtopics.length > 5 && (
                <p className="text-xs text-slate-400 font-medium pl-7">
                  +{subtopics.length - 5} more lessons...
                </p>
              )}
            </div>
          </div>
        )}

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
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const CARD_COLORS = [
    { from: "#ec4899", to: "#db2777", accent: "#db2777", hover: "#fce7f3", emoji: "💧" },
    { from: "#3b82f6", to: "#2563eb", accent: "#2563eb", hover: "#dbeafe", emoji: "🚰" },
    { from: "#22c55e", to: "#16a34a", accent: "#16a34a", hover: "#dcfce7", emoji: "🌿" },
    { from: "#f59e0b", to: "#d97706", accent: "#d97706", hover: "#fef3c7", emoji: "☀️" },
    { from: "#8b5cf6", to: "#7c3aed", accent: "#7c3aed", hover: "#ede9fe", emoji: "🧼" },
    { from: "#06b6d4", to: "#0891b2", accent: "#0891b2", hover: "#cffafe", emoji: "🌍" },
  ];

  useEffect(() => {
    const token =
      localStorage.getItem("aquachamp_token") ||
      sessionStorage.getItem("aquachamp_token");
    
    // FIX: Query for both "5-10" AND "6-10" since database might have either
    Promise.all([
      axios.get(`${API}/api/topics`),
      axios.get(`${API}/api/subtopics`, { params: { ageGroup: "5-10" } }),
      axios.get(`${API}/api/subtopics`, { params: { ageGroup: "6-10" } }),
    ])
      .then(async ([topicsRes, subsRes5to10, subsRes6to10]) => {
        // Merge subtopics from both age group values
        const basicSubs5to10 = Array.isArray(subsRes5to10.data)
          ? subsRes5to10.data
          : subsRes5to10.data?.subtopics || [];
        const basicSubs6to10 = Array.isArray(subsRes6to10.data)
          ? subsRes6to10.data
          : subsRes6to10.data?.subtopics || [];
        
        // Combine and deduplicate by _id
        const subsMap = new Map();
        [...basicSubs5to10, ...basicSubs6to10].forEach(s => {
          if (s._id) subsMap.set(String(s._id), s);
        });
        const basicSubs = Array.from(subsMap.values());
        
        const ids = new Set(
          basicSubs.map((s) => String(s.topicId?._id || s.topicId))
        );
        const filteredTopics = (topicsRes.data || []).filter((t) => ids.has(String(t._id)));
        setTopics(filteredTopics);

        // Fetch progress for each basic topic
        const progressMap = {};
        if (userId != null) {
          for (const topic of filteredTopics) {
            try {
              const r = await axios.post(
                `${API}/api/subtopics/progress/topic`,
                {
                  userId: String(userId),
                  topicId: topic._id,
                  // FIX: Changed from "6-10" to "5-10" to match game database
                  ageGroup: "5-10",
                },
                { headers: { Authorization: `Bearer ${token}` } }
              );
              progressMap[topic._id] = r.data.percentage || 0;
            } catch {
              progressMap[topic._id] = 0;
            }
          }
        }
        setProgress(progressMap);
      })
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading)
    return (
      <div className="mt-4 p-6 bg-slate-800/90 text-white rounded-3xl text-center font-bold shadow-lg">
        Loading basic lessons… 💧
      </div>
    );

  return (
    <div className="mt-4 rounded-3xl p-6 border-2 border-slate-200 shadow-xl bg-linear-to-br from-slate-700 via-slate-800 to-slate-900">
      <h3 className="display-font text-2xl font-bold text-white mb-2">
        📖 Basic lessons — ages 5–10
      </h3>
      <p className="text-slate-300 font-medium mb-5 text-sm">
        Quick, friendly topics on clean water & hygiene — perfect for a refresher! 🚰✨
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {topics.map((topic, i) => {
          const color = CARD_COLORS[i % CARD_COLORS.length];
          const pct = progress[topic._id] || 0;
          
          return (
            <button
              key={topic._id}
              onClick={() =>
                navigate(`/student/topic/${topic._id}`, {
                  state: { topic, ageGroup: "5-10", userId, isBasic: true },
                })
              }
              className="card-hover bg-white rounded-2xl p-4 text-left shadow-md border-2 border-slate-200 hover:border-blue-400"
              style={{ borderColor: `${color.from}30` }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = color.from;
                e.currentTarget.style.boxShadow = `0 8px 24px ${color.from}30`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#e2e8f0";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
              }}
            >
              <div className="text-3xl mb-2">
                {color.emoji}
              </div>
              <p className="font-bold text-slate-800 text-sm mb-2">{topic.title}</p>
              
              {/* Progress Bar */}
              <div className="mb-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-semibold text-slate-500">Progress</span>
                  <span className="text-xs font-bold" style={{ color: color.from }}>{pct}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="progress-bar h-full rounded-full"
                    style={{
                      width: `${pct}%`,
                      background: `linear-gradient(90deg, ${color.from}, ${color.to})`,
                    }}
                  />
                </div>
              </div>
              
              <p className="text-xs font-medium mt-1" style={{ color: color.accent }}>
                {pct === 100 ? "✅ Completed!" : pct > 0 ? "Keep going! 🔥" : "Tap to learn →"}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}