import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import axios from "axios";
import KaveeshaStudentNav from "./kaveesha-studentNav";

const API = "http://localhost:4000";
const SECTIONS = ["video", "text", "images", "quiz"];

export default function KaveeshaSubtopicLearn() {
  const navigate = useNavigate();
  const location = useLocation();
  const { subtopicId } = useParams();

  const { subtopic: initSub, ageGroup, userId, topicId, topic, startSection } =
    location.state || {};

  const [subtopic, setSubtopic] = useState(initSub || null);
  const [user, setUser] = useState(null);
  const [currentSection, setCurrentSection] = useState(startSection || "video");
  const [sectionDone, setSectionDone] = useState({
    video: false, text: false, images: false, quiz: false,
  });
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMsg, setCelebrationMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState(null);
  const isYoung = ageGroup === "6-10";
  const accentFrom = isYoung ? "#FF6B6B" : "#6C63FF";
  const accentTo = isYoung ? "#FFD93D" : "#00D4AA";

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
    fetchQuiz();
    loadProgress();
  }, [subtopicId]);

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
      const res = await axios.get(`${API}/api/kaveesha-miniquiz`, {
        params: { subtopicId, ageGroup },
      });
      setQuiz(res.data);
    } catch {
      setQuiz(null);
    }
  };

  const loadProgress = () => {
    const saved = localStorage.getItem(`kaveesha_done_${subtopicId}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      setSectionDone(parsed);
      // Restore last section
      const savedSection = localStorage.getItem(`kaveesha_section_${subtopicId}`);
      if (savedSection) setCurrentSection(savedSection);
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

    // Show celebration
    const msgs = {
      video: ["🎬 Amazing! You watched the video!", "⭐ Great job watching!"],
      text: ["📝 Brilliant! You read the lesson!", "🌟 Reading superstar!"],
      images: ["🖼️ Wonderful! You viewed all images!", "✨ Great explorer!"],
    };
    const msgList = msgs[section] || ["✅ Well done!"];
    setCelebrationMsg(msgList[Math.floor(Math.random() * msgList.length)]);
    setShowCelebration(true);

    // Call backend progress
    try {
      const token =
        localStorage.getItem("aquachamp_token") ||
        sessionStorage.getItem("aquachamp_token");
      await axios.post(
        `${API}/api/subtopics/complete/${subtopicId}`,
        { userId, contentType: section },
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );
    } catch (err) {
      console.error("Progress save error:", err);
    }

    setTimeout(() => {
      setShowCelebration(false);
      // Move to next section
      const idx = SECTIONS.indexOf(section);
      if (idx < SECTIONS.length - 1) {
        const next = SECTIONS[idx + 1];
        setCurrentSection(next);
        saveProgress(newDone, next);
      }
    }, 2500);
  };

  const getSectionIndex = () => SECTIONS.indexOf(currentSection);
  const canAccessSection = (section) => {
    const idx = SECTIONS.indexOf(section);
    if (idx === 0) return true;
    return sectionDone[SECTIONS[idx - 1]];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: isYoung ? "linear-gradient(135deg,#fff9f0,#fff0fa)" : "linear-gradient(135deg,#f0f4ff,#f5f0ff)" }}>
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🌊</div>
          <p className="text-2xl font-extrabold text-gray-500">Loading your lesson...</p>
        </div>
      </div>
    );
  }

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
        @keyframes pop { 0%{transform:scale(0.5);opacity:0} 70%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
        @keyframes star-burst { 0%{transform:scale(0) rotate(0deg);opacity:1} 100%{transform:scale(2) rotate(180deg);opacity:0} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes confetti { 0%{transform:translateY(-20px) rotate(0deg);opacity:1} 100%{transform:translateY(100vh) rotate(720deg);opacity:0} }
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
              {[...Array(5)].map((_, i) => (
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

      <KaveeshaStudentNav user={user} ageGroup={ageGroup} />

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Back */}
        <button
          onClick={() =>
            navigate(`/student/topic/${topicId}`, {
              state: { topic, ageGroup, userId },
            })
          }
          className="flex items-center gap-2 mb-6 px-4 py-2 bg-white rounded-2xl shadow-md font-extrabold text-gray-600 hover:shadow-lg transition-all text-sm"
        >
          ← Back to {topic?.title}
        </button>

        {/* Subtopic Header */}
        <div
          className="rounded-3xl p-6 mb-6 text-white shadow-xl"
          style={{ background: `linear-gradient(135deg, ${accentFrom}, ${accentTo})` }}
        >
          <h1 className="display-font text-3xl font-extrabold mb-1">
            {subtopic?.title}
          </h1>
          <p className="text-white/80 font-semibold text-sm">
            Age {ageGroup} · {topic?.title}
          </p>
        </div>

        {/* Section Progress Steps */}
        <div className="bg-white rounded-3xl shadow-md p-5 mb-6">
          <div className="flex items-center gap-2">
            {SECTIONS.map((sec, i) => {
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
                    className={`flex flex-col items-center gap-1 flex-1 p-2 rounded-2xl transition-all ${
                      active
                        ? "bg-gray-900 text-white shadow-md scale-105"
                        : done
                        ? "bg-green-50 text-green-600"
                        : accessible
                        ? "bg-gray-50 text-gray-500 hover:bg-gray-100"
                        : "opacity-40 cursor-not-allowed text-gray-300"
                    }`}
                  >
                    <span className="text-xl">{done ? "✅" : icons[sec]}</span>
                    <span className="text-[10px] font-extrabold">{labels[sec]}</span>
                  </button>
                  {i < SECTIONS.length - 1 && (
                    <div className={`w-6 h-0.5 shrink-0 mx-1 rounded-full ${done ? "bg-green-400" : "bg-gray-200"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Section Content */}
        <div className="bg-white rounded-3xl shadow-md overflow-hidden">
          {currentSection === "video" && (
            <KaveeshaVideoSection
              subtopic={subtopic}
              done={sectionDone.video}
              onComplete={() => markSectionComplete("video")}
              accentFrom={accentFrom}
              accentTo={accentTo}
              isYoung={isYoung}
            />
          )}
          {currentSection === "text" && (
            <KaveeshaTextSection
              subtopic={subtopic}
              done={sectionDone.text}
              onComplete={() => markSectionComplete("text")}
              accentFrom={accentFrom}
              accentTo={accentTo}
              isYoung={isYoung}
            />
          )}
          {currentSection === "images" && (
            <KaveeshaImagesSection
              subtopic={subtopic}
              done={sectionDone.images}
              onComplete={() => markSectionComplete("images")}
              accentFrom={accentFrom}
              accentTo={accentTo}
              isYoung={isYoung}
            />
          )}
          {currentSection === "quiz" && (
            <KaveeshaQuizSection
              subtopic={subtopic}
              quiz={quiz}
              userId={userId}
              ageGroup={ageGroup}
              done={sectionDone.quiz}
              onComplete={async () => {
                const newDone = { ...sectionDone, quiz: true };
                setSectionDone(newDone);
                saveProgress(newDone, "quiz");
                try {
                  const token =
                    localStorage.getItem("aquachamp_token") ||
                    sessionStorage.getItem("aquachamp_token");
                  await axios.post(
                    `${API}/api/subtopics/complete/${subtopicId}`,
                    { userId, contentType: "miniQuiz" },
                    { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
                  );
                } catch {}
              }}
              onNavigateBack={() =>
                navigate(`/student/topic/${topicId}`, {
                  state: { topic, ageGroup, userId },
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
  const [playerReady, setPlayerReady] = useState(false);
  const iframeRef = useRef(null);

  const getYouTubeId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  };

  const videoId = getYouTubeId(subtopic?.videoUrl);

  // YouTube IFrame API for detecting video end
  useEffect(() => {
    if (!videoId) return;
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);

    window.onYouTubeIframeAPIReady = () => {
      new window.YT.Player("yt-player", {
        events: {
          onStateChange: (e) => {
            if (e.data === window.YT.PlayerState.ENDED) {
              setWatched(true);
            }
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
          <button onClick={onComplete} className="mt-4 px-6 py-3 rounded-2xl font-extrabold text-white shadow-md"
            style={{ background: `linear-gradient(135deg, ${accentFrom}, ${accentTo})` }}>
            Skip & Continue →
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-md"
          style={{ background: `linear-gradient(135deg, ${accentFrom}, ${accentTo})` }}>
          🎬
        </div>
        <div>
          <h2 className="display-font text-xl font-extrabold text-gray-800">Watch the Video</h2>
          <p className="text-sm text-gray-500 font-semibold">
            {isYoung ? "Watch the whole video to earn a star! ⭐" : "Watch completely to unlock the next section"}
          </p>
        </div>
      </div>

      {/* Video */}
      <div className="rounded-2xl overflow-hidden shadow-lg mb-5 relative">
        {!watched && (
          <div className="absolute top-3 right-3 z-10 bg-black/70 text-white text-xs font-extrabold px-3 py-1.5 rounded-full">
            👀 Watch fully to continue
          </div>
        )}
        <div id="yt-player-wrapper">
          <iframe
            id="yt-player"
            src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0`}
            className="w-full h-64 md:h-80"
            allowFullScreen
            title="Lesson Video"
          />
        </div>
      </div>

      {/* Manual watched button (fallback) */}
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
    if (!subtopic?.content) return;
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

    // Pick a nice voice
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(
      (v) => v.name.includes("Google") || v.name.includes("Samantha")
    );
    if (preferred) utterance.voice = preferred;

    utterance.onend = () => {
      setSpeaking(false);
      setSpeechProgress(100);
    };
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

  if (!subtopic?.content) {
    return (
      <div className="p-8 text-center">
        <div className="text-5xl mb-3">📝</div>
        <p className="text-gray-400 font-bold">No text content for this lesson yet</p>
        {!done && (
          <button onClick={onComplete} className="mt-4 px-6 py-3 rounded-2xl font-extrabold text-white shadow-md"
            style={{ background: `linear-gradient(135deg, ${accentFrom}, ${accentTo})` }}>
            Skip & Continue →
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-md"
          style={{ background: `linear-gradient(135deg, ${accentFrom}, ${accentTo})` }}>
          📝
        </div>
        <div>
          <h2 className="display-font text-xl font-extrabold text-gray-800">Read the Lesson</h2>
          <p className="text-sm text-gray-500 font-semibold">
            {isYoung ? "Read or listen to learn! 📖" : "Read through the lesson content below"}
          </p>
        </div>
      </div>

      {/* TTS Controls */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <button
          onClick={handleTextToSpeech}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl font-extrabold text-white shadow-md transition-all hover:shadow-lg active:scale-95"
          style={{
            background: speaking
              ? "linear-gradient(135deg, #EF4444, #F97316)"
              : "linear-gradient(135deg, #8B5CF6, #6C63FF)",
          }}
        >
          <span className="text-xl">{speaking ? "⏹️" : "🔊"}</span>
          {speaking ? "Stop Reading" : "Read to Me!"}
        </button>
        <button
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl font-extrabold text-gray-700 bg-gray-100 hover:bg-gray-200 shadow-md transition-all active:scale-95"
        >
          <span className="text-xl">📄</span>
          Download PDF
        </button>
      </div>

      {/* Speech progress */}
      {speaking && (
        <div className="mb-4">
          <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
            <span>🔊 Reading aloud...</span>
            <span>{speechProgress}%</span>
          </div>
          <div className="h-2 bg-purple-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-purple-500 to-violet-500 rounded-full transition-all duration-300"
              style={{ width: `${speechProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="bg-linear-to-br from-blue-50 to-purple-50 rounded-2xl p-6 mb-5 border-2 border-blue-100">
        <p
          className="text-gray-700 leading-relaxed font-semibold whitespace-pre-wrap"
          style={{ fontSize: isYoung ? "17px" : "15px", lineHeight: isYoung ? "1.9" : "1.8" }}
        >
          {subtopic.content}
        </p>
      </div>

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

  const getImgSrc = (img) =>
    img.startsWith("/uploads") ? `${API}${img}` : img;

  if (!images.length) {
    return (
      <div className="p-8 text-center">
        <div className="text-5xl mb-3">🖼️</div>
        <p className="text-gray-400 font-bold">No images for this lesson yet</p>
        {!done && (
          <button onClick={onComplete} className="mt-4 px-6 py-3 rounded-2xl font-extrabold text-white shadow-md"
            style={{ background: `linear-gradient(135deg, ${accentFrom}, ${accentTo})` }}>
            Skip & Continue →
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-md"
          style={{ background: `linear-gradient(135deg, ${accentFrom}, ${accentTo})` }}>
          🖼️
        </div>
        <div>
          <h2 className="display-font text-xl font-extrabold text-gray-800">View Images</h2>
          <p className="text-sm text-gray-500 font-semibold">
            Image {currentImg + 1} of {images.length}
          </p>
        </div>
      </div>

      {/* Image Viewer */}
      <div className="rounded-2xl overflow-hidden shadow-lg mb-4 bg-gray-50">
        <img
          src={getImgSrc(images[currentImg])}
          alt={`Lesson image ${currentImg + 1}`}
          className="w-full max-h-72 object-contain"
          style={{ background: "#f8fafc" }}
        />
      </div>

      {/* Dots */}
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

      {/* Navigation */}
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
function KaveeshaQuizSection({ subtopic, quiz, userId, ageGroup, done, onComplete, onNavigateBack, accentFrom, accentTo, isYoung }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [score, setScore] = useState(0);
  const [allDone, setAllDone] = useState(done);
  const [showFinalCelebration, setShowFinalCelebration] = useState(false);

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

    if (correct === total) {
      setAllDone(true);
      await onComplete();
      setShowFinalCelebration(true);
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
    setResults(null);
    setScore(0);
  };

  if (!quiz?.questions?.length) {
    return (
      <div className="p-8 text-center">
        <div className="text-5xl mb-3">❓</div>
        <p className="text-gray-400 font-bold">No quiz for this lesson yet</p>
        {!done && (
          <button onClick={onComplete} className="mt-4 px-6 py-3 rounded-2xl font-extrabold text-white shadow-md"
            style={{ background: `linear-gradient(135deg, ${accentFrom}, ${accentTo})` }}>
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
          {[...Array(5)].map((_, i) => (
            <span key={i} className="text-3xl pop" style={{ animationDelay: `${i * 0.1}s` }}>⭐</span>
          ))}
        </div>
        <h2 className="display-font text-3xl font-extrabold text-gray-800 mb-2">
          🎉 Subtopic Complete!
        </h2>
        <p className="text-gray-600 font-bold text-lg mb-2">
          You completed <span className="font-extrabold" style={{ color: accentFrom }}>{subtopic?.title}</span>!
        </p>
        <p className="text-gray-500 font-semibold mb-6">
          {isYoung
            ? "Amazing work! You're a swimming superstar! 🌟"
            : "Excellent! The next lesson has been unlocked! 🔓"}
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
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-md"
          style={{ background: `linear-gradient(135deg, ${accentFrom}, ${accentTo})` }}>
          ❓
        </div>
        <div>
          <h2 className="display-font text-xl font-extrabold text-gray-800">Mini Quiz</h2>
          <p className="text-sm text-gray-500 font-semibold">
            {isYoung
              ? "Answer all questions correctly to unlock the next lesson! 🌟"
              : "Answer all questions correctly to proceed"}
          </p>
        </div>
      </div>

      {submitted && (
        <div className={`rounded-2xl p-4 mb-5 text-center border-2 ${
          score === quiz.questions.length
            ? "bg-green-50 border-green-200"
            : "bg-amber-50 border-amber-200"
        }`}>
          <p className={`font-extrabold text-lg ${score === quiz.questions.length ? "text-green-600" : "text-amber-600"}`}>
            {score === quiz.questions.length
              ? "🎉 Perfect Score! All correct!"
              : `You got ${score}/${quiz.questions.length} correct. Try again! 💪`}
          </p>
        </div>
      )}

      <div className="space-y-6">
        {quiz.questions.map((q, qi) => (
          <div key={qi} className="bg-gray-50 rounded-2xl p-5 border-2 border-gray-100">
            <p className="font-extrabold text-gray-800 mb-4 text-base">
              <span className="inline-block w-7 h-7 rounded-full text-white text-center text-sm leading-7 mr-2 shrink-0"
                style={{ background: accentFrom }}>
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
                    style={isSelected && !submitted ? { background: accentFrom, borderColor: accentFrom } : {}}
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
        ) : null}
      </div>
    </div>
  );
}