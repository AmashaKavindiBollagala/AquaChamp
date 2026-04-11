

import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import GermCatcher        from "./dilshara-GermCatcher";
import WaterDropAdventure from "./dilshara-WaterDropAdventure";
import MemoryMatch        from "./dilshara-MemoryMatch";
import CleanOrDirty       from "./dilshara-CleanOrDirty"; 
import CleanDirtyGame from "./dilshara-cleanDirtyGame"; 

const API_BASE = "http://localhost:4000";
const FONTS    = "https://fonts.googleapis.com/css2?family=Bubblegum+Sans&family=Nunito:wght@400;700;800;900;1000&display=swap";

const DIFF_NEXT = { easy: "medium", medium: "hard", hard: null };

const CONGRAT_MESSAGES = {
  easy:   { emoji:"🌟", title:"Easy Level Crushed!", sub:"You're amazing! Ready for Medium? 🔥", color:"#16a34a", bg:"linear-gradient(135deg,#bbf7d0,#86efac)" },
  medium: { emoji:"🔥", title:"Medium Done! Wow!", sub:"One more step to become a CHAMPION! 🏆", color:"#d97706", bg:"linear-gradient(135deg,#fef3c7,#fde68a)" },
  hard:   { emoji:"🏆", title:"You're a CHAMPION!",  sub:"All 3 levels DONE! You're a legend! 🎉", color:"#7c3aed", bg:"linear-gradient(135deg,#ede9fe,#ddd6fe)" },
};

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bubblegum+Sans&family=Nunito:wght@400;700;800;900;1000&display=swap');
  @keyframes pop      { 0%{transform:scale(0.4);opacity:0;} 75%{transform:scale(1.1);} 100%{transform:scale(1);opacity:1;} }
  @keyframes float    { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-14px);} }
  @keyframes fadeUp   { from{opacity:0;transform:translateY(20px);} to{opacity:1;transform:translateY(0);} }
  @keyframes shimmer  { 0%{transform:translateX(-100%);} 100%{transform:translateX(200%);} }
  @keyframes confetti { 0%{transform:translateY(-20px) rotate(0deg);opacity:1;} 100%{transform:translateY(100px) rotate(720deg);opacity:0;} }
  @keyframes bounce   { 0%,100%{transform:scale(1);} 50%{transform:scale(1.15) rotate(5deg);} }
  @keyframes wiggle   { 0%,100%{transform:rotate(-5deg);} 50%{transform:rotate(5deg);} }
  @keyframes rainbowBg { 0%{background-position:0% 50%;} 50%{background-position:100% 50%;} 100%{background-position:0% 50%;} }
  * { box-sizing: border-box; }
  .result-btn:hover { transform: scale(1.06) translateY(-2px) !important; }
  .result-btn { transition: all 0.18s ease; }
`;
export default function GamePlayScreen() {
  const { gameId } = useParams();
  const navigate   = useNavigate();
  const location   = useLocation();

  const [game,        setGame]        = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [submitting,  setSubmitting]  = useState(false);
  const [finalResult, setFinalResult] = useState(null);

  // Get navigation state for ageGroup and userId
  const navAgeGroup = location.state?.ageGroup;
  const navUserId   = location.state?.userId;
  const navTopicId  = location.state?.topicId;

  // ── CORRECT token + username 
  const token =
    localStorage.getItem("aquachamp_token") ||
    localStorage.getItem("userToken") ||
    localStorage.getItem("superAdminToken");

  // Get username from multiple possible localStorage keys

  const getUsername = () => {
    // Try to get user object first 
    const userStr = localStorage.getItem("aquachamp_user") || localStorage.getItem("user");
    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);
        // Use username first for game scores database
        if (userObj.username) return userObj.username;
        if (userObj.firstName) return userObj.firstName;
        if (userObj.name) return userObj.name;
      } catch {}
    }
    // Try individual keys - prioritize username
    return (
      localStorage.getItem("aquachamp_username") ||
      localStorage.getItem("username") ||
      localStorage.getItem("aquachamp_firstName") ||
      localStorage.getItem("firstName") ||
      localStorage.getItem("adminUsername") ||
      "Player"
    );
  };
  const username = getUsername();
  useEffect(() => { fetchGame(); }, [gameId]);

  const fetchGame = async () => {
    setLoading(true); setFinalResult(null);
    try {
      const res  = await fetch(`${API_BASE}/api/games/${gameId}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Game not found");
      setGame(data);
    } catch (e) { setError(e.message); }
    finally     { setLoading(false); }
  };

  const handleFinish = async (score, maxScore, percentage, passed) => {
    setSubmitting(true);
    try {
      // Use navUserId (from navigation state) or username (from localStorage) for userId
      const effectiveUserId = navUserId || username;
      const effectiveTopicId = navTopicId || game?.topicId || "";
      const effectiveAgeGroup = navAgeGroup || game?.ageGroup || "5-10";
      
      const res = await fetch(`${API_BASE}/api/games/${gameId}/scores`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
          score, 
          userId: effectiveUserId, 
          topicId: effectiveTopicId, 
          difficulty: game?.difficulty || "easy" 
        }),
      });
      const saved = res.ok;
      setFinalResult({ score, maxScore, percentage, passed, saved });
    } catch {
      setFinalResult({ score, maxScore, percentage, passed, saved: false });
    } finally { setSubmitting(false); }
  };

  const handleNextDifficulty = async (nextDiff) => {
    // Use game's topicId and ageGroup from API response
    const effectiveTopicId = game?.topicId || navTopicId || "";
    const effectiveAgeGroup = game?.ageGroup || navAgeGroup || "5-10";
    
    if (!effectiveTopicId) { 
      navigate(`/games/topic/${effectiveTopicId}`); 
      return; 
    }
    try {
      // ── FIX: removed &active=true
      const res  = await fetch(
        `${API_BASE}/api/games?topicId=${effectiveTopicId}&ageGroup=${effectiveAgeGroup}&difficulty=${nextDiff}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      const nextGame = data.games?.[0];
      if (nextGame) {
        navigate(`/games/play/${nextGame._id}`, {
          state: {
            ageGroup: effectiveAgeGroup,
            topicId: effectiveTopicId,
            userId: navUserId || username,
          },
        });
      } else {
        navigate(`/games/topic/${effectiveTopicId}`);
      }
    } catch { navigate(`/games/topic/${effectiveTopicId}`); }
  };

  if (loading)    return <SplashScreen msg="Loading your game..." emoji="🎮" />;
  if (submitting) return <SplashScreen msg="Saving your score..." emoji="💾" />;

  if (error) return (
    <div style={center}>
      <link rel="stylesheet" href={FONTS} />
      <style>{GLOBAL_CSS}</style>
      <div style={{ fontSize: 64 }}>😵</div>
      <p style={{ color: "#dc2626", fontFamily: "'Bubblegum Sans',cursive", fontSize: 20, marginTop: 12 }}>{error}</p>
      <button onClick={() => navigate(-1)} style={makBtn("#3b82f6")}>← Go Back</button>
    </div>
  );

  // ── RESULT SCREEN
  if (finalResult) {
    const difficulty = game?.difficulty || "easy";
    const nextDiff   = DIFF_NEXT[difficulty];
    const msg        = CONGRAT_MESSAGES[difficulty];
    const passed     = finalResult.passed;
    const pct        = finalResult.percentage;

    const confetti = passed
      ? ["🎊","🎉","⭐","🌟","✨","💫","🏆","🎈","🍭","🌈"].map((e, i) => (
          <div key={i} style={{
            position: "fixed", fontSize: 28, pointerEvents: "none", zIndex: 0,
            left: `${5 + i * 10}%`, top: "-10%",
            animation: `confetti ${1.5 + i * 0.2}s ease forwards`,
            animationDelay: `${i * 0.1}s`,
          }}>{e}</div>
        ))
      : null;

    const bgStyle = passed
      ? { background: "linear-gradient(135deg,#fef9c3,#fce7f3,#e0f2fe,#d1fae5)", backgroundSize: "400% 400%", animation: "rainbowBg 4s ease infinite" }
      : { background: "linear-gradient(135deg,#fef3c7,#fff7ed)" };

    return (
      <div style={{ ...center, ...bgStyle, overflow: "hidden" }}>
        <link rel="stylesheet" href={FONTS} />
        <style>{GLOBAL_CSS}</style>
        {confetti}

        <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 420, padding: "0 24px", animation: "pop 0.6s ease both" }}>

          <div style={{ fontSize: 100, animation: "bounce 1.5s ease-in-out infinite", marginBottom: 12 }}>
            {passed ? msg.emoji : "💪"}
          </div>

          <h2 style={{
            fontFamily: "'Bubblegum Sans',cursive", fontSize: 30, margin: "0 0 8px",
            color: passed ? msg.color : "#92400e",
            textShadow: "2px 2px 0px rgba(0,0,0,0.1)",
          }}>
            {passed ? msg.title : "Keep Practicing! 💪"}
          </h2>

          <p style={{ color: passed ? "#374151" : "#78350f", fontSize: 14, margin: "0 0 24px", fontFamily: "'Nunito',sans-serif", lineHeight: 1.6, fontWeight: 700 }}>
            {passed ? msg.sub : "Don't give up! Retry to unlock the next level!"}
          </p>

          {/* Score card */}
          <div style={{
            background: "#fff",
            border: `4px solid ${passed ? msg.color : "#f59e0b"}`,
            borderRadius: 24, padding: "24px 28px", marginBottom: 24,
            boxShadow: passed ? `0 8px 32px ${msg.color}44` : "0 8px 24px #f59e0b33",
            display: "inline-block", minWidth: 260,
          }}>
            <div style={{
              fontSize: 64, fontWeight: 900,
              fontFamily: "'Bubblegum Sans',cursive",
              color: passed ? msg.color : "#f59e0b",
              lineHeight: 1, marginBottom: 6,
            }}>{pct}%</div>

            <p style={{ color: "#6b7280", margin: "0 0 12px", fontSize: 14, fontFamily: "'Nunito',sans-serif" }}>
              <strong style={{ color: "#111827" }}>{finalResult.score}</strong> / {finalResult.maxScore} points
            </p>

            <div style={{
              padding: "6px 14px", borderRadius: 20, display: "inline-block",
              background: finalResult.saved ? "#dcfce7" : "#fee2e2",
              border: `2px solid ${finalResult.saved ? "#16a34a" : "#dc2626"}`,
              color: finalResult.saved ? "#16a34a" : "#dc2626",
              fontSize: 12, fontWeight: 800, fontFamily: "'Nunito',sans-serif",
            }}>
              {finalResult.saved ? "✅ Score saved!" : "⚠️ Could not save score"}
            </div>
          </div>

          {/* Difficulty progress dots */}
          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 28, alignItems: "center" }}>
            {["easy","medium","hard"].map((d) => {
              const diffs      = ["easy","medium","hard"];
              const currentIdx = diffs.indexOf(difficulty);
              const thisIdx    = diffs.indexOf(d);
              const done       = passed ? thisIdx <= currentIdx : thisIdx < currentIdx;
              const colors     = { easy: "#16a34a", medium: "#d97706", hard: "#7c3aed" };
              return (
                <div key={d} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{
                    width: done ? 40 : 28, height: done ? 40 : 28, borderRadius: "50%",
                    background: done ? colors[d] : "#e5e7eb",
                    border: `3px solid ${done ? colors[d] : "#d1d5db"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: done ? 18 : 12,
                    boxShadow: done ? `0 4px 12px ${colors[d]}66` : "none",
                    transition: "all 0.4s",
                  }}>
                    {done ? (d === "easy" ? "⭐" : d === "medium" ? "⭐" : "🏆") : "○"}
                  </div>
                  <div style={{ fontSize: 10, color: done ? colors[d] : "#9ca3af", fontFamily: "'Nunito',sans-serif", fontWeight: 800, textTransform: "capitalize" }}>{d}</div>
                </div>
              );
            })}
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>

            {passed && nextDiff && (
              <button className="result-btn" onClick={() => handleNextDifficulty(nextDiff)} style={{
                ...makBtn(nextDiff === "medium" ? "#f59e0b" : "#7c3aed"),
                fontSize: 16, padding: "16px 36px",
                boxShadow: `0 6px 24px ${nextDiff === "medium" ? "#f59e0b" : "#7c3aed"}55`,
              }}>
                {nextDiff === "medium" ? "⭐⭐ Move to Medium! →" : "⭐⭐⭐ Move to Hard! →"}
              </button>
            )}

            {passed && !nextDiff && (
              <>
                <div style={{
                  background: "linear-gradient(135deg,#dcfce7,#bbf7d0)",
                  border: "4px solid #16a34a", borderRadius: 20,
                  padding: "18px 24px", color: "#15803d",
                  fontFamily: "'Bubblegum Sans',cursive", fontSize: 18,
                  textAlign: "center", animation: "pop 0.6s ease 0.2s both",
                  boxShadow: "0 8px 32px #16a34a33",
                }}>
                  🎉 ALL 3 LEVELS COMPLETE!<br />
                  <span style={{ fontSize: 14, fontFamily: "'Nunito',sans-serif", color: "#166534" }}>You're an absolute legend! 🏆</span>
                </div>
                <button className="result-btn" onClick={() => navigate("/profile")} style={{
                  ...makBtn("#16a34a"),
                  fontSize: 16, padding: "16px 36px",
                  boxShadow: "0 6px 24px #16a34a55",
                }}>
                  🏆 Go to My Profile! →
                </button>
              </>
            )}

            {!passed && (
              <button className="result-btn" onClick={fetchGame} style={{
                ...makBtn("#f43f5e"),
                boxShadow: "0 6px 24px #f43f5e55",
              }}>
                🔄 Try Again!
              </button>
            )}

            <button className="result-btn" onClick={() => {
              const effectiveTopicId = game?.topicId || navTopicId || "";
              navigate(`/games/topic/${effectiveTopicId}`, {
                state: {
                  ageGroup: navAgeGroup || game?.ageGroup,
                  userId: navUserId || username,
                },
              });
            }} style={{
              ...makBtn("#fff"),
              border: "3px solid #d1d5db", color: "#374151",
              fontFamily: "'Nunito',sans-serif",
            }}>
              📚 Back to Topic Games
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Route to game component 
  if (!game) return null;
  const subType = game.subType || "quiz";

  if (subType === "germcatcher")
    return <GermCatcher        game={game} username={username} onFinish={handleFinish} />;
  if (subType === "waterdrop")
    return <WaterDropAdventure game={game} username={username} onFinish={handleFinish} />;
  if (subType === "memory")
    return <MemoryMatch        game={game} username={username} onFinish={handleFinish} />;
  // ── NEW: route to CleanOrDirty ──
  if (subType === "cleanordirty")
    return <CleanOrDirty       game={game} username={username} onFinish={handleFinish} />;

  // ── NEW: route to CleanDirtyGame (subType: "cleandirtygame") ──
  if (subType === "cleandirtygame")
    return <CleanDirtyGame     game={game} username={username} onFinish={handleFinish} />;

  return <StandardQuiz game={game} username={username} onFinish={handleFinish} />;
}

// ─────────────────────────────────────────────────────────────────────────────
//  STANDARD QUIZ — bright child-friendly theme
// ─────────────────────────────────────────────────────────────────────────────
function StandardQuiz({ game, username, onFinish }) {
  const [qIndex,   setQIndex]   = useState(0);
  const [score,    setScore]    = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(game.timeLimit || 20);
  const [streak,   setStreak]   = useState(0);

  const AVATAR    = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(username)}&backgroundColor=b6e3f4`;
  const questions = game.questions || [];
  const currentQ  = questions[qIndex];
  const totalQ    = questions.length;
  const maxScore  = totalQ * (game.pointsPerQuestion || 10);
  const progress  = (qIndex / totalQ) * 100;

  const OPTION_COLORS = [
    { bg: "#fef3c7", border: "#f59e0b", text: "#92400e", correct: "#dcfce7", correctBorder: "#16a34a", correctText: "#15803d", wrong: "#fee2e2", wrongBorder: "#dc2626", wrongText: "#991b1b" },
    { bg: "#fce7f3", border: "#ec4899", text: "#9d174d", correct: "#dcfce7", correctBorder: "#16a34a", correctText: "#15803d", wrong: "#fee2e2", wrongBorder: "#dc2626", wrongText: "#991b1b" },
    { bg: "#e0f2fe", border: "#0ea5e9", text: "#075985", correct: "#dcfce7", correctBorder: "#16a34a", correctText: "#15803d", wrong: "#fee2e2", wrongBorder: "#dc2626", wrongText: "#991b1b" },
    { bg: "#f0fdf4", border: "#22c55e", text: "#15803d", correct: "#dcfce7", correctBorder: "#16a34a", correctText: "#15803d", wrong: "#fee2e2", wrongBorder: "#dc2626", wrongText: "#991b1b" },
  ];

  useEffect(() => {
    if (answered) return;
    const t = setInterval(() => {
      setTimeLeft(tl => {
        if (tl <= 1) { clearInterval(t); handleAnswer(null); return 0; }
        return tl - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [qIndex, answered]);

  const handleAnswer = (opt) => {
    if (answered) return;
    setAnswered(true); setSelected(opt);
    const isCorrect = opt === currentQ?.correctAnswer;
    const newScore  = isCorrect ? score + (game.pointsPerQuestion || 10) : score;
    const newStreak = isCorrect ? streak + 1 : 0;
    if (isCorrect) { setScore(newScore); setStreak(newStreak); }
    else           { setStreak(0); }
    setTimeout(() => {
      if (qIndex + 1 >= totalQ) {
        const pct = Math.round((newScore / maxScore) * 100);
        onFinish(newScore, maxScore, pct, pct >= (game.passMark || 60));
      } else {
        setQIndex(i => i + 1); setAnswered(false);
        setSelected(null); setTimeLeft(game.timeLimit || 20);
      }
    }, 1600);
  };

  const timerPct   = (timeLeft / (game.timeLimit || 20)) * 100;
  const timerColor = timeLeft <= 5 ? "#dc2626" : timeLeft <= 10 ? "#f59e0b" : "#16a34a";

  if (!currentQ) return (
    <div style={center}>
      <p style={{ color: "#dc2626", fontFamily: "'Bubblegum Sans',cursive", fontSize: 18 }}>No questions found for this game.</p>
    </div>
  );

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg,#fef9c3 0%,#fce7f3 25%,#e0f2fe 50%,#d1fae5 75%,#fef9c3 100%)",
      backgroundSize: "400% 400%",
      animation: "rainbowBg 8s ease infinite",
      fontFamily: "'Nunito',sans-serif", display: "flex", flexDirection: "column",
    }}>
      <link rel="stylesheet" href={FONTS} />
      <style>{GLOBAL_CSS}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", padding: "12px 16px", borderBottom: "3px solid #fff", gap: 12, background: "rgba(255,255,255,0.85)", backdropFilter: "blur(10px)" }}>
        <img src={AVATAR} alt="avatar" style={{ width: 44, height: 44, borderRadius: "50%", border: "3px solid #ec4899", boxShadow: "0 0 12px #ec489966" }} />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, alignItems: "center" }}>
            <span style={{ color: "#374151", fontSize: 12, fontWeight: 800 }}>Question {qIndex + 1} / {totalQ}</span>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {streak >= 2 && (
                <span style={{ fontSize: 11, color: "#d97706", fontWeight: 800, animation: "bounce 1s ease infinite" }}>
                  🔥 {streak} streak!
                </span>
              )}
              <span style={{ color: "#d97706", fontWeight: 900, fontSize: 13, fontFamily: "'Bubblegum Sans',cursive" }}>⭐ {score} pts</span>
            </div>
          </div>
          <div style={{ background: "#e5e7eb", borderRadius: 20, height: 10, overflow: "hidden" }}>
            <div style={{
              width: `${progress}%`, height: "100%",
              background: "linear-gradient(90deg,#ec4899,#f59e0b,#22c55e)",
              borderRadius: 20, transition: "width 0.5s ease",
            }} />
          </div>
        </div>

        {/* Timer circle */}
        <div style={{ position: "relative", width: 52, height: 52, flexShrink: 0 }}>
          <svg width="52" height="52" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="26" cy="26" r="22" fill="none" stroke="#e5e7eb" strokeWidth="5" />
            <circle cx="26" cy="26" r="22" fill="none" stroke={timerColor}
              strokeWidth="5" strokeDasharray={`${2 * Math.PI * 22}`}
              strokeDashoffset={`${2 * Math.PI * 22 * (1 - timerPct / 100)}`}
              strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.9s linear,stroke 0.3s" }} />
          </svg>
          <div style={{
            position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 900, color: timerColor, fontSize: 15, fontFamily: "'Bubblegum Sans',cursive",
          }}>{timeLeft}</div>
        </div>
      </div>

      {/* Question box */}
      <div style={{
        margin: "16px 16px 12px", padding: "20px",
        background: "rgba(255,255,255,0.9)",
        borderRadius: 20, border: "3px solid #fbbf24",
        boxShadow: "0 4px 20px rgba(251,191,36,0.3)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span style={{
            fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 800,
            background: "#fef3c7", border: "2px solid #f59e0b", color: "#92400e",
            fontFamily: "'Nunito',sans-serif",
          }}>Q{qIndex + 1}</span>
        </div>
        <p style={{ color: "#111827", fontWeight: 800, fontSize: 17, margin: 0, lineHeight: 1.5, fontFamily: "'Nunito',sans-serif" }}>
          {currentQ.questionText}
        </p>
        {currentQ.hint && !answered && (
          <p style={{ color: "#6b7280", fontSize: 12, margin: "8px 0 0", fontFamily: "'Nunito',sans-serif" }}>💡 {currentQ.hint}</p>
        )}
      </div>

      {/* Answer options */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, padding: "0 16px 16px", flex: 1 }}>
        {currentQ.options.map((opt, i) => {
          const theme = OPTION_COLORS[i % 4];
          let bg     = theme.bg;
          let border = theme.border;
          let color  = theme.text;

          if (answered) {
            if (opt === currentQ.correctAnswer) {
              bg = theme.correct; border = theme.correctBorder; color = theme.correctText;
            } else if (selected === opt) {
              bg = theme.wrong; border = theme.wrongBorder; color = theme.wrongText;
            }
          }

          return (
            <button key={i} onClick={() => handleAnswer(opt)} disabled={answered} style={{
              padding: "16px 12px",
              background: bg,
              border: `3px solid ${border}`,
              borderRadius: 16,
              color,
              fontWeight: 800, fontSize: 13,
              fontFamily: "'Nunito',sans-serif",
              cursor: answered ? "default" : "pointer",
              textAlign: "center",
              transition: "all 0.2s",
              lineHeight: 1.3,
              display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
              boxShadow: `0 4px 12px ${border}44`,
            }}>
              <span style={{
                width: 28, height: 28, borderRadius: "50%",
                background: `${border}33`, border: `2px solid ${border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 900, color: border, flexShrink: 0,
              }}>
                {["A","B","C","D"][i]}
              </span>
              <span>{opt}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}


function SplashScreen({ msg, emoji }) {
  return (
    <div style={center}>
      <link rel="stylesheet" href={FONTS} />
      <style>{GLOBAL_CSS}</style>
      <div style={{ fontSize: 64, animation: "float 1.5s ease-in-out infinite", marginBottom: 16 }}>{emoji}</div>
      <p style={{ color: "#374151", fontFamily: "'Bubblegum Sans',cursive", fontSize: 20 }}>{msg}</p>
    </div>
  );
}

const center = {
  minHeight: "100vh",
  background: "linear-gradient(135deg,#fef9c3,#fce7f3,#e0f2fe,#d1fae5)",
  display: "flex", flexDirection: "column",
  alignItems: "center", justifyContent: "center",
  fontFamily: "'Nunito',sans-serif", color: "#111827", padding: 24,
};

const makBtn = (bg) => ({
  padding: "13px 28px", background: bg,
  color: bg === "#fff" ? "#374151" : "#fff",
  fontSize: 15, fontWeight: 900, border: "none", borderRadius: 16,
  cursor: "pointer", fontFamily: "'Bubblegum Sans',cursive",
  width: "100%", maxWidth: 300,
});