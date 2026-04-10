import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import KaveeshaStudentNav from "./kaveesha-studentNav";

const API = "http://localhost:4000";

export default function KaveeshaStudentProgress() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [topics, setTopics] = useState([]);
  const [subtopics, setSubtopics] = useState([]);
  const [topicProgress, setTopicProgress] = useState({});
  const [subtopicProgress, setSubtopicProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const ageGroup = user?.age >= 5 && user?.age <= 10 ? "6-10" : "11-15";
  const isYoung = ageGroup === "6-10";

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
    fetchProgress();
  }, [user]);

  const fetchProgress = async () => {
    const token =
      localStorage.getItem("aquachamp_token") ||
      sessionStorage.getItem("aquachamp_token");
    try {
      const [topicsRes, subsRes] = await Promise.all([
        axios.get(`${API}/api/topics`),
        axios.get(`${API}/api/subtopics`, { params: { ageGroup } }),
      ]);
      const topicList = topicsRes.data || [];
      const subList = Array.isArray(subsRes.data)
        ? subsRes.data
        : subsRes.data?.subtopics || [];
      setTopics(topicList);
      setSubtopics(subList);

      // Topic progress
      const tProg = {};
      for (const t of topicList) {
        try {
          const r = await axios.post(
            `${API}/api/subtopics/progress/topic`,
            { userId: user._id, topicId: t._id, ageGroup },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          tProg[t._id] = r.data.percentage || 0;
        } catch {
          tProg[t._id] = 0;
        }
      }
      setTopicProgress(tProg);

      // Subtopic progress
      const sProg = {};
      for (const s of subList) {
        try {
          const r = await axios.get(`${API}/api/subtopics/progress/subtopic`, {
            params: { userId: user._id, subtopicId: s._id },
            headers: { Authorization: `Bearer ${token}` },
          });
          sProg[s._id] = r.data.percentage || 0;
        } catch {
          sProg[s._id] = 0;
        }
      }
      setSubtopicProgress(sProg);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const overallProgress =
    topics.length > 0
      ? Math.round(
          Object.values(topicProgress).reduce((a, b) => a + b, 0) / topics.length
        )
      : 0;

  const accentFrom = isYoung ? "#FF6B6B" : "#6C63FF";
  const accentTo = isYoung ? "#FFD93D" : "#00D4AA";

  return (
    <div
      className="min-h-screen"
      style={{
        background: isYoung
          ? "linear-gradient(135deg, #fff9f0, #fff0fa, #f0f8ff)"
          : "linear-gradient(135deg, #f0f4ff, #f5f0ff, #f0fff8)",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Baloo+2:wght@700;800&display=swap');
        body { font-family: 'Nunito', sans-serif; }
        .display-font { font-family: 'Baloo 2', cursive; }
        @keyframes pop { 0%{transform:scale(0.9);opacity:0} 100%{transform:scale(1);opacity:1} }
        .pop { animation: pop 0.4s cubic-bezier(0.175,0.885,0.32,1.275) forwards; }
        .progress-bar { transition: width 1.5s cubic-bezier(0.4,0,0.2,1); }
      `}</style>

      <KaveeshaStudentNav user={user} ageGroup={ageGroup} />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="display-font text-4xl font-extrabold text-gray-800 mb-2">
            📊 My Progress
          </h1>
          <p className="text-gray-500 font-semibold">
            {isYoung
              ? "See how awesome you're doing! 🌟"
              : "Track your swimming journey"}
          </p>
        </div>

        {/* Overall Progress Circle */}
        <div
          className="rounded-3xl p-8 mb-8 text-white shadow-2xl text-center relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${accentFrom}, ${accentTo})` }}
        >
          <div className="absolute inset-0 opacity-10">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white"
                style={{
                  width: `${60 + i * 30}px`,
                  height: `${60 + i * 30}px`,
                  top: `${Math.random() * 80}%`,
                  left: `${Math.random() * 90}%`,
                }}
              />
            ))}
          </div>
          <div className="relative z-10">
            {/* Circle Progress */}
            <div className="flex justify-center mb-4">
              <div className="relative w-36 h-36">
                <svg className="w-36 h-36 -rotate-90" viewBox="0 0 144 144">
                  <circle cx="72" cy="72" r="60" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="12" />
                  <circle
                    cx="72" cy="72" r="60"
                    fill="none"
                    stroke="white"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 60}`}
                    strokeDashoffset={`${2 * Math.PI * 60 * (1 - overallProgress / 100)}`}
                    style={{ transition: "stroke-dashoffset 1.5s ease" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-extrabold text-white leading-none">{overallProgress}%</span>
                  <span className="text-white/80 text-xs font-bold mt-1">Overall</span>
                </div>
              </div>
            </div>
            <h2 className="display-font text-2xl font-extrabold">
              {overallProgress === 100
                ? "🏆 All Done! You're a Champion!"
                : overallProgress >= 50
                ? "🔥 Great Progress! Keep going!"
                : isYoung
                ? "🌟 Keep Swimming! You're doing great!"
                : "💪 Keep pushing! You're on track!"}
            </h2>
          </div>
        </div>

        {/* Topic Progress Cards */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 rounded-3xl animate-pulse bg-white/60" />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {topics.map((topic, ti) => {
              const tPct = topicProgress[topic._id] || 0;
              const topicSubs = subtopics.filter(
                (s) => s.topicId === topic._id || s.topicId?._id === topic._id
              );

              const COLORS = [
                { from: "#FF6B6B", to: "#FF8E53" },
                { from: "#6C63FF", to: "#3B82F6" },
                { from: "#00D4AA", to: "#10B981" },
                { from: "#FFD93D", to: "#F59E0B" },
                { from: "#FF6BCB", to: "#A855F7" },
              ];
              const c = COLORS[ti % COLORS.length];

              return (
                <div key={topic._id} className="bg-white rounded-3xl shadow-md overflow-hidden pop"
                  style={{ animationDelay: `${ti * 0.1}s` }}>
                  {/* Topic Header */}
                  <div
                    className="p-5 flex items-center justify-between"
                    style={{ background: `linear-gradient(135deg, ${c.from}15, ${c.to}15)` }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-md"
                        style={{ background: `linear-gradient(135deg, ${c.from}, ${c.to})` }}>
                        {["🏊", "🌊", "🐬", "⭐", "🦋"][ti % 5]}
                      </div>
                      <div>
                        <h3 className="display-font text-lg font-extrabold text-gray-800">
                          {topic.title}
                        </h3>
                        <p className="text-xs text-gray-500 font-bold">
                          {topicSubs.length} subtopics · {topicSubs.filter(s => !s.isLocked).length} unlocked
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-extrabold" style={{ color: c.from }}>
                        {tPct}%
                      </div>
                      {tPct === 100 && (
                        <span className="text-xs bg-green-100 text-green-600 font-extrabold px-2 py-0.5 rounded-full">
                          ✅ Done!
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Topic Progress Bar */}
                  <div className="px-5 pt-3">
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="progress-bar h-full rounded-full"
                        style={{
                          width: `${tPct}%`,
                          background: `linear-gradient(90deg, ${c.from}, ${c.to})`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Subtopics */}
                  <div className="p-5 space-y-2">
                    {topicSubs.map((sub, si) => {
                      const sPct = subtopicProgress[sub._id] || 0;
                      return (
                        <div key={sub._id} className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0"
                            style={{ background: sPct === 100 ? "#10B981" : sub.isLocked ? "#e5e7eb" : c.from, color: "white" }}>
                            {sPct === 100 ? "✅" : sub.isLocked ? "🔒" : si + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-extrabold text-gray-700 truncate">{sub.title}</p>
                              <span className="text-xs font-extrabold ml-2 shrink-0"
                                style={{ color: c.from }}>{sPct}%</span>
                            </div>
                            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="progress-bar h-full rounded-full"
                                style={{
                                  width: `${sPct}%`,
                                  background: sPct === 100
                                    ? "linear-gradient(90deg,#10B981,#6EE7B7)"
                                    : `linear-gradient(90deg, ${c.from}, ${c.to})`,
                                }}
                              />
                            </div>
                          </div>

                          {/* Section dots */}
                          <div className="flex gap-1 shrink-0">
                            {["🎬", "📝", "🖼️", "❓"].map((icon, di) => {
                              const done = sPct >= (di + 1) * 25;
                              return (
                                <span key={di} className="text-xs" style={{ opacity: done ? 1 : 0.3 }}>
                                  {icon}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="px-5 pb-5">
                    <button
                      onClick={() => navigate(`/student/topic/${topic._id}`, {
                        state: { topic, ageGroup, userId: user?._id }
                      })}
                      className="w-full py-3 rounded-2xl font-extrabold text-white text-sm shadow-md transition-all hover:shadow-lg active:scale-95"
                      style={{ background: `linear-gradient(135deg, ${c.from}, ${c.to})` }}
                    >
                      {tPct > 0 ? "Continue Topic →" : "Start Topic →"}
                    </button>
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