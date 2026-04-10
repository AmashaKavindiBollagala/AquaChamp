import { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import axios from "axios";
import KaveeshaStudentNav from "./kaveesha-studentNav";

const API = "http://localhost:4000";

export default function KaveeshaTopicDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { topicId } = useParams();

  const { topic, ageGroup, userId, isBasic } = location.state || {};
  const [subtopics, setSubtopics] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
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
    if (!topicId) return;
    fetchSubtopics();
  }, [topicId, ageGroup]);

  const fetchSubtopics = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/subtopics`, {
        params: { topicId, ageGroup },
      });
      const subs = Array.isArray(res.data)
        ? res.data
        : res.data?.subtopics || [];
      const sorted = [...subs].sort((a, b) => (a.order || 0) - (b.order || 0));
      setSubtopics(sorted);

      // Fetch progress per subtopic
      const token =
        localStorage.getItem("aquachamp_token") ||
        sessionStorage.getItem("aquachamp_token");
      const pMap = {};
      for (const sub of sorted) {
        try {
          const r = await axios.get(`${API}/api/subtopics/progress/subtopic`, {
            params: { userId, subtopicId: sub._id },
            headers: { Authorization: `Bearer ${token}` },
          });
          pMap[sub._id] = r.data.percentage || 0;
        } catch {
          pMap[sub._id] = 0;
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
    const prog = progressMap[sub._id];
    if (!prog) return "video";
    if (prog >= 100) return "done";
    // We'll store section in localStorage per subtopic
    return localStorage.getItem(`kaveesha_section_${sub._id}`) || "video";
  };

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
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        .pop { animation: pop 0.4s cubic-bezier(0.175,0.885,0.32,1.275) forwards; }
        .float { animation: float 3s ease-in-out infinite; }
        .card-hover { transition: all 0.3s cubic-bezier(0.175,0.885,0.32,1.275); }
        .card-hover:hover:not(.locked) { transform: translateY(-4px) scale(1.01); }
        .progress-bar { transition: width 1.2s cubic-bezier(0.4,0,0.2,1); }
      `}</style>

      <KaveeshaStudentNav user={user} ageGroup={ageGroup} />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate("/student/dashboard")}
          className="flex items-center gap-2 mb-6 px-4 py-2 bg-white rounded-2xl shadow-md font-extrabold text-gray-600 hover:shadow-lg transition-all text-sm"
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
            🏊
          </div>
          <div className="relative z-10">
            {isBasic && (
              <span className="inline-block bg-white/30 text-white text-xs font-extrabold px-3 py-1 rounded-full mb-3 uppercase tracking-widest">
                📖 Basic Lesson
              </span>
            )}
            <h1 className="display-font text-4xl font-extrabold mb-2">
              {topic?.title || "Lesson"}
            </h1>
            {topic?.description && (
              <p className="text-white/85 font-semibold text-lg">
                {topic.description}
              </p>
            )}
            <div className="flex gap-4 mt-4 flex-wrap">
              <div className="bg-white/25 rounded-2xl px-4 py-2 backdrop-blur-sm">
                <span className="font-extrabold">
                  📂 {subtopics.length} Subtopics
                </span>
              </div>
              <div className="bg-white/25 rounded-2xl px-4 py-2 backdrop-blur-sm">
                <span className="font-extrabold">
                  ✅{" "}
                  {
                    Object.values(progressMap).filter((p) => p === 100).length
                  }{" "}
                  Completed
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Subtopics */}
        <h2 className="display-font text-2xl font-extrabold text-gray-700 mb-5">
          {isYoung ? "🌟 Your Lessons" : "📚 Lessons"}
        </h2>

        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-28 rounded-3xl animate-pulse bg-white/60"
              />
            ))}
          </div>
        ) : subtopics.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl shadow-md">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-xl font-extrabold text-gray-400">
              No lessons here yet!
            </p>
            <p className="text-gray-400 mt-2">
              Check back soon — your teacher is preparing them!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {subtopics.map((sub, i) => {
              const pct = progressMap[sub._id] || 0;
              const isLocked = sub.isLocked && i !== 0;
              const lastSection = getLastActiveSection(sub);
              const isDone = pct === 100;

              return (
                <div
                  key={sub._id}
                  className={`card-hover bg-white rounded-3xl shadow-md overflow-hidden border-2 transition-all pop ${
                    isDone
                      ? "border-green-200"
                      : isLocked
                      ? "border-gray-200 locked opacity-75"
                      : "border-transparent hover:border-opacity-50"
                  }`}
                  style={{
                    animationDelay: `${i * 0.08}s`,
                    borderColor: isDone
                      ? "#bbf7d0"
                      : isLocked
                      ? "#e5e7eb"
                      : "transparent",
                  }}
                >
                  <div className="flex items-center gap-5 p-5">
                    {/* Order Badge */}
                    <div
                      className="w-14 h-14 rounded-2xl shrink-0 flex items-center justify-center text-2xl font-extrabold shadow-md"
                      style={{
                        background: isDone
                          ? "linear-gradient(135deg, #10B981, #6EE7B7)"
                          : isLocked
                          ? "#f3f4f6"
                          : `linear-gradient(135deg, ${accentFrom}, ${accentTo})`,
                        color: isLocked ? "#9ca3af" : "white",
                      }}
                    >
                      {isDone ? "✅" : isLocked ? "🔒" : i + 1}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-extrabold text-gray-800 text-base truncate">
                          {sub.title}
                        </h3>
                        {isDone && (
                          <span className="text-xs bg-green-100 text-green-600 font-extrabold px-2 py-0.5 rounded-full shrink-0">
                            ⭐ Done!
                          </span>
                        )}
                        {isLocked && (
                          <span className="text-xs bg-gray-100 text-gray-400 font-extrabold px-2 py-0.5 rounded-full shrink-0">
                            🔒 Locked
                          </span>
                        )}
                        {!isLocked && !isDone && pct > 0 && (
                          <span className="text-xs bg-blue-50 text-blue-500 font-extrabold px-2 py-0.5 rounded-full shrink-0">
                            ▶ In Progress
                          </span>
                        )}
                      </div>

                      {/* Content indicators */}
                      <div className="flex gap-2 mb-2">
                        {sub.videoUrl && (
                          <span className="text-xs bg-red-50 text-red-400 px-2 py-0.5 rounded-full font-bold">
                            🎬 Video
                          </span>
                        )}
                        {sub.content && (
                          <span className="text-xs bg-blue-50 text-blue-400 px-2 py-0.5 rounded-full font-bold">
                            📝 Text
                          </span>
                        )}
                        {sub.images?.length > 0 && (
                          <span className="text-xs bg-purple-50 text-purple-400 px-2 py-0.5 rounded-full font-bold">
                            🖼️ Images
                          </span>
                        )}
                        <span className="text-xs bg-amber-50 text-amber-500 px-2 py-0.5 rounded-full font-bold">
                          ❓ Quiz
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="progress-bar h-full rounded-full"
                            style={{
                              width: `${pct}%`,
                              background:
                                pct === 100
                                  ? "linear-gradient(90deg, #10B981, #6EE7B7)"
                                  : `linear-gradient(90deg, ${accentFrom}, ${accentTo})`,
                            }}
                          />
                        </div>
                        <span className="text-xs font-extrabold text-gray-500 w-10 text-right">
                          {pct}%
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    {!isLocked && (
                      <button
                        onClick={() =>
                          navigate(`/student/subtopic/${sub._id}`, {
                            state: {
                              subtopic: sub,
                              ageGroup,
                              userId,
                              topicId,
                              topic,
                              startSection: pct > 0 && !isDone ? lastSection : "video",
                            },
                          })
                        }
                        className="shrink-0 px-5 py-3 rounded-2xl font-extrabold text-white text-sm shadow-md transition-all hover:shadow-lg active:scale-95"
                        style={{
                          background:
                            pct === 100
                              ? "linear-gradient(135deg, #10B981, #6EE7B7)"
                              : `linear-gradient(135deg, ${accentFrom}, ${accentTo})`,
                        }}
                      >
                        {isDone ? "Review ✨" : pct > 0 ? "Continue →" : "Start →"}
                      </button>
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