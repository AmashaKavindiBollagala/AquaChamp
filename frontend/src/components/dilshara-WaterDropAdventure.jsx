import { useState, useEffect, useRef } from "react";

const AVATAR_URL = (seed) =>
  `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4`;

// River path steps visuals
const PATH_ICONS = ["🏔️", "🌧️", "🏞️", "🌊", "🏗️", "🚰", "🏡"];

export default function WaterDropAdventure({ game, username, onFinish }) {
  const [phase, setPhase] = useState("intro"); // intro | playing | result
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [waterLevel, setWaterLevel] = useState(0); // 0–100
  const [timeLeft, setTimeLeft] = useState(game.timeLimit || 30);
  const [selected, setSelected] = useState(null); // selected option text
  const [feedback, setFeedback] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [results, setResults] = useState([]);
  const [characterPos, setCharacterPos] = useState(0); // 0–100 (percentage along path)
  const [dropAnimation, setDropAnimation] = useState(false);
  const timerRef = useRef(null);

  const questions = game.questions || [];
  const currentQ = questions[qIndex];
  const totalQ = questions.length;
  const maxScore = totalQ * (game.pointsPerQuestion || 10);

  useEffect(() => {
    if (phase !== "playing" || answered) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          handleTimeout();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, qIndex, answered]);

  const handleTimeout = () => {
    if (answered) return;
    setAnswered(true);
    setFeedback({ correct: false, text: `⏰ Time's up! Answer: ${currentQ.correctAnswer}` });
    setResults(r => [...r, false]);
    setTimeout(advance, 2000);
  };

  const handleAnswer = (option) => {
    if (answered) return;
    clearInterval(timerRef.current);
    setAnswered(true);
    setSelected(option);

    const isCorrect = option === currentQ.correctAnswer;
    if (isCorrect) {
      const pts = game.pointsPerQuestion || 10;
      setScore(s => s + pts);
      setWaterLevel(w => Math.min(100, w + (100 / totalQ)));
      setCharacterPos(p => Math.min(100, p + (100 / totalQ)));
      setDropAnimation(true);
      setTimeout(() => setDropAnimation(false), 800);
      setFeedback({ correct: true, text: "💧 Great! The water flows forward!" });
    } else {
      setFeedback({ correct: false, text: `Not quite! The answer was: ${currentQ.correctAnswer}` });
    }
    setResults(r => [...r, isCorrect]);
    setTimeout(advance, 2000);
  };

  const advance = () => {
    if (qIndex + 1 >= totalQ) {
      setPhase("result");
    } else {
      setQIndex(i => i + 1);
      setAnswered(false);
      setSelected(null);
      setFeedback(null);
      setTimeLeft(game.timeLimit || 30);
    }
  };

  const percentage = Math.round((score / maxScore) * 100);
  const passed = percentage >= (game.passMark || 60);

  // ── INTRO ──────────────────────────────────────────────────────────────────
  if (phase === "intro") return (
    <div style={fullScreenStyle}>
      <style>{css}</style>
      <div style={cardStyle}>
        <div style={{ fontSize: 64, marginBottom: 8, animation: "float 2s ease-in-out infinite" }}>💧</div>
        <img src={AVATAR_URL(username)} alt="avatar" style={avatarStyle(100)} />
        <h1 style={titleStyle}>Water Drop Adventure!</h1>
        <p style={subStyle}>Hi <strong style={{ color: "#38bdf8" }}>{username}</strong>! Help the water drop travel from the mountains to the village!</p>
        <p style={{ color: "#94a3b8", fontSize: 13, margin: "0 0 20px", textAlign: "center", maxWidth: 300 }}>
          Answer questions correctly to fill the river and move your character along the path. Wrong answers slow you down!
        </p>
        <div style={pillsRow}>
          <span style={pill("#38bdf8")}>💧 {totalQ} Steps</span>
          <span style={pill("#34d399")}>⏱ {game.timeLimit}s each</span>
          <span style={pill("#f59e0b")}>🏆 {maxScore} pts</span>
        </div>
        <button onClick={() => setPhase("playing")} style={btnStyle("#0ea5e9")}>
          🌊 Start the Journey!
        </button>
      </div>
    </div>
  );

  // ── RESULT ─────────────────────────────────────────────────────────────────
  if (phase === "result") return (
    <div style={fullScreenStyle}>
      <style>{css}</style>
      <div style={cardStyle}>
        <div style={{ fontSize: 64, animation: "float 1.5s ease-in-out infinite" }}>
          {passed ? "🎉" : "💪"}
        </div>
        <img src={AVATAR_URL(username)} alt="avatar" style={avatarStyle(90)} />
        <h2 style={{ ...titleStyle, fontSize: 26, color: passed ? "#4ade80" : "#f59e0b" }}>
          {passed ? "The village has clean water!" : "Keep trying, hero!"}
        </h2>
        <div style={{ fontSize: 52, fontWeight: 900, color: "#fff", margin: "8px 0" }}>{percentage}%</div>

        {/* Water level bar */}
        <div style={{ width: "100%", maxWidth: 300, margin: "0 auto 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ color: "#64748b", fontSize: 12 }}>Water collected</span>
            <span style={{ color: "#38bdf8", fontSize: 12, fontWeight: 700 }}>{Math.round(waterLevel)}%</span>
          </div>
          <div style={{ background: "#1e3a5f", borderRadius: 20, height: 16, overflow: "hidden" }}>
            <div style={{
              width: `${waterLevel}%`, height: "100%",
              background: "linear-gradient(90deg, #0ea5e9, #38bdf8)",
              borderRadius: 20, transition: "width 1s ease",
            }} />
          </div>
        </div>

        <p style={{ color: "#94a3b8", margin: "0 0 16px" }}>
          Score: <strong style={{ color: "#60a5fa" }}>{score}</strong> / {maxScore} pts
        </p>
        <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap", justifyContent: "center" }}>
          {results.map((r, i) => <span key={i} style={{ fontSize: 20 }}>{r ? "💧" : "💢"}</span>)}
        </div>
        <button onClick={() => onFinish(score, maxScore, percentage, passed)} style={btnStyle("#3b82f6")}>
          🏠 Back to Games
        </button>
      </div>
    </div>
  );

  // ── PLAYING ────────────────────────────────────────────────────────────────
  return (
    <div style={fullScreenStyle}>
      <style>{css}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #1e3a5f", gap: 10 }}>
        <img src={AVATAR_URL(username)} alt="avatar" style={avatarStyle(38)} />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
            <span style={{ color: "#94a3b8", fontSize: 11 }}>Question {qIndex + 1}/{totalQ}</span>
            <span style={{ color: "#f59e0b", fontWeight: 700, fontSize: 12 }}>⭐ {score} pts</span>
          </div>
          <div style={{ background: "#1e3a5f", borderRadius: 20, height: 6 }}>
            <div style={{ width: `${(qIndex / totalQ) * 100}%`, height: "100%", background: "#0ea5e9", borderRadius: 20, transition: "width 0.4s" }} />
          </div>
        </div>
        <div style={{
          width: 44, height: 44, borderRadius: "50%",
          background: timeLeft <= 8 ? "#dc2626" : "#1e3a5f",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 15, fontWeight: 900, color: "#fff", transition: "background 0.3s",
          animation: timeLeft <= 5 ? "pulse 0.5s infinite" : "none",
        }}>{timeLeft}</div>
      </div>

      {/* River Path */}
      <div style={{
        background: "linear-gradient(180deg, #0c1f3a 0%, #0a3d62 100%)",
        padding: "12px 16px", position: "relative", overflow: "hidden",
      }}>
        {/* Sky & scenery */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 6, position: "relative", zIndex: 2 }}>
          {PATH_ICONS.slice(0, totalQ + 1).map((icon, i) => (
            <div key={i} style={{ textAlign: "center", opacity: i <= qIndex ? 1 : 0.3 }}>
              <div style={{ fontSize: i === qIndex ? 22 : 16 }}>{icon}</div>
            </div>
          ))}
        </div>

        {/* River */}
        <div style={{ background: "#1e3a5f", borderRadius: 20, height: 20, position: "relative", overflow: "visible" }}>
          {/* Water fill */}
          <div style={{
            width: `${waterLevel}%`, height: "100%",
            background: "linear-gradient(90deg, #0c4a6e, #0ea5e9, #38bdf8)",
            borderRadius: 20, transition: "width 0.6s ease",
            position: "relative",
          }}>
            {/* Wave shimmer */}
            <div style={{
              position: "absolute", inset: 0, borderRadius: 20,
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
              animation: "shimmer 1.5s linear infinite",
            }} />
          </div>

          {/* Character on river */}
          <div style={{
            position: "absolute", top: "50%",
            left: `${Math.max(2, Math.min(96, characterPos))}%`,
            transform: "translate(-50%, -50%)",
            fontSize: 22, zIndex: 5,
            transition: "left 0.6s ease",
            animation: dropAnimation ? "bounce 0.5s ease" : "float 2s ease-in-out infinite",
          }}>
            💧
          </div>
        </div>

        {/* Water level label */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
          <span style={{ color: "#0ea5e9", fontSize: 10 }}>🏔️ Source</span>
          <span style={{ color: "#38bdf8", fontSize: 10 }}>🚰 Village</span>
        </div>
      </div>

      {/* Question */}
      <div style={{
        background: "#0f2040", border: "1px solid #1e3a5f",
        borderRadius: 12, padding: "14px 18px", margin: "10px 16px",
        textAlign: "center",
      }}>
        <p style={{ fontSize: 17, fontWeight: 700, color: "#f1f5f9", margin: 0, lineHeight: 1.4 }}>
          {currentQ.questionText}
        </p>
        {currentQ.hint && !answered && (
          <p style={{ fontSize: 12, color: "#64748b", margin: "6px 0 0" }}>💡 Hint: {currentQ.hint}</p>
        )}
      </div>

      {/* Feedback */}
      {feedback && (
        <div style={{
          margin: "0 16px 8px", padding: "10px 16px", borderRadius: 10,
          background: feedback.correct ? "#052e1680" : "#450a0a80",
          border: `1px solid ${feedback.correct ? "#16a34a" : "#dc2626"}`,
          color: feedback.correct ? "#4ade80" : "#f87171",
          fontWeight: 700, fontSize: 13, textAlign: "center",
          animation: "fadeIn 0.3s ease",
        }}>
          {feedback.text}
        </div>
      )}

      {/* Answer options */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, padding: "0 16px 16px" }}>
        {currentQ.options.map((opt, i) => {
          const isSelected = selected === opt;
          const isCorrectOpt = opt === currentQ.correctAnswer;
          let bg = "#0f2040";
          let border = "#1e3a5f";
          let color = "#cbd5e1";
          if (answered) {
            if (isCorrectOpt) { bg = "#052e1680"; border = "#16a34a"; color = "#4ade80"; }
            else if (isSelected && !isCorrectOpt) { bg = "#450a0a80"; border = "#dc2626"; color = "#f87171"; }
          }
          const DROPS = ["💧", "🌊", "⛲", "🏞️"];
          return (
            <button key={i} onClick={() => handleAnswer(opt)} disabled={answered} style={{
              padding: "14px 12px", borderRadius: 14, cursor: answered ? "default" : "pointer",
              background: bg, border: `2px solid ${border}`, color,
              fontSize: 13, fontWeight: 700, fontFamily: "'Nunito', sans-serif",
              textAlign: "center", transition: "all 0.2s", lineHeight: 1.3,
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
            }}
              onMouseEnter={e => !answered && (e.currentTarget.style.borderColor = "#0ea5e9")}
              onMouseLeave={e => !answered && (e.currentTarget.style.borderColor = "#1e3a5f")}
            >
              <span style={{ fontSize: 20 }}>{DROPS[i]}</span>
              <span>{opt}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const fullScreenStyle = {
  minHeight: "100vh", background: "#060e1a",
  display: "flex", flexDirection: "column",
  fontFamily: "'Nunito', sans-serif",
};
const cardStyle = {
  margin: "auto", maxWidth: 420, width: "100%",
  padding: "32px 24px", display: "flex",
  flexDirection: "column", alignItems: "center", textAlign: "center",
};
const avatarStyle = (size) => ({
  width: size, height: size, borderRadius: "50%",
  border: "3px solid #0ea5e9", background: "#0f2040", flexShrink: 0,
});
const titleStyle = {
  fontSize: 30, color: "#f1f5f9", margin: "12px 0 8px",
  fontFamily: "'Fredoka One', cursive",
};
const subStyle = { color: "#94a3b8", fontSize: 14, margin: "0 0 12px" };
const pillsRow = { display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: 20 };
const pill = (c) => ({ padding: "4px 12px", borderRadius: 20, background: c + "22", border: `1px solid ${c}`, color: c, fontSize: 12, fontWeight: 700 });
const btnStyle = (c) => ({
  padding: "14px 32px", background: c, color: "#fff",
  fontSize: 16, fontWeight: 800, border: "none", borderRadius: 16,
  cursor: "pointer", fontFamily: "'Nunito', sans-serif",
  boxShadow: `0 4px 20px ${c}66`,
});

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;700;800;900&display=swap');
  @keyframes float { 0%,100% { transform: translate(-50%,-50%) translateY(0); } 50% { transform: translate(-50%,-50%) translateY(-8px); } }
  @keyframes bounce { 0%,100% { transform: translate(-50%,-50%) scale(1); } 50% { transform: translate(-50%,-50%) scale(1.5); } }
  @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.15); } }
  @keyframes fadeIn { from { opacity:0; transform: translateY(-6px); } to { opacity:1; transform: translateY(0); } }
  @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }
`;