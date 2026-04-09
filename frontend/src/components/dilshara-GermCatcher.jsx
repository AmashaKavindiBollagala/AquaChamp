import { useState, useEffect, useRef } from "react";

const AVATAR_URL = (seed) =>
  `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4`;

// Germ emoji options for floating bubbles
const GERM_COLORS = ["#FF6B6B", "#FF8E53", "#A855F7", "#EC4899", "#F59E0B"];
const GERM_EMOJIS = ["🦠", "🧫", "🦠", "😷", "🦠"];

function FloatingGerm({ option, index, isCorrect, onClick, state, position }) {
  const color = GERM_COLORS[index % GERM_COLORS.length];
  const emoji = GERM_EMOJIS[index % GERM_EMOJIS.length];

  const animClass =
    state === "correct"
      ? "germ-pop"
      : state === "wrong"
      ? "germ-bounce"
      : "germ-float";

  return (
    <div
      onClick={onClick}
      style={{
        position: "absolute",
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: "translate(-50%, -50%)",
        cursor: state === "idle" ? "pointer" : "default",
        animation: `${animClass} ${state === "idle" ? "3s ease-in-out infinite" : "0.5s ease forwards"}`,
        animationDelay: `${index * 0.4}s`,
        zIndex: 10,
      }}
    >
      <div
        style={{
          width: 110,
          height: 110,
          borderRadius: "50%",
          background: `radial-gradient(circle at 35% 35%, ${color}CC, ${color})`,
          border: `3px solid ${color}`,
          boxShadow: `0 0 20px ${color}66, inset 0 -4px 8px rgba(0,0,0,0.2)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 8,
          transition: "transform 0.15s",
        }}
        onMouseEnter={e => state === "idle" && (e.currentTarget.style.transform = "scale(1.12)")}
        onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
      >
        <span style={{ fontSize: 24 }}>{emoji}</span>
        <span style={{
          fontSize: 11,
          fontWeight: 700,
          color: "#fff",
          textAlign: "center",
          lineHeight: 1.2,
          textShadow: "0 1px 3px rgba(0,0,0,0.4)",
          padding: "0 4px",
          wordBreak: "break-word",
        }}>
          {option}
        </span>
      </div>
    </div>
  );
}

export default function GermCatcher({ game, username, onFinish }) {
  const [phase, setPhase] = useState("intro"); // intro | playing | result
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [germStates, setGermStates] = useState({}); // optionText -> "idle"|"correct"|"wrong"
  const [timeLeft, setTimeLeft] = useState(game.timeLimit || 30);
  const [feedback, setFeedback] = useState(null); // { text, color }
  const [answered, setAnswered] = useState(false);
  const [results, setResults] = useState([]);
  const timerRef = useRef(null);

  const questions = game.questions || [];
  const currentQ = questions[qIndex];
  const totalQ = questions.length;

  // Positions for 4 germs — spread across the arena
  const POSITIONS = [
    { x: 22, y: 35 },
    { x: 78, y: 35 },
    { x: 22, y: 72 },
    { x: 78, y: 72 },
  ];

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
    setFeedback({ text: "⏰ Time's up! The germs escaped!", color: "#FF6B6B" });
    setResults(r => [...r, { correct: false }]);
    setTimeout(nextQuestion, 1800);
  };

  const handleAnswer = (option) => {
    if (answered) return;
    clearInterval(timerRef.current);
    setAnswered(true);

    const isCorrect = option === currentQ.correctAnswer;
    setGermStates(prev => ({ ...prev, [option]: isCorrect ? "correct" : "wrong" }));

    if (isCorrect) {
      setScore(s => s + (game.pointsPerQuestion || 10));
      setFeedback({ text: "🎉 You caught the right germ!", color: "#4ADE80" });
    } else {
      setFeedback({ text: `❌ Wrong! The answer was: ${currentQ.correctAnswer}`, color: "#FF6B6B" });
      setGermStates(prev => ({ ...prev, [currentQ.correctAnswer]: "correct" }));
    }

    setResults(r => [...r, { correct: isCorrect }]);
    setTimeout(nextQuestion, 1800);
  };

  const nextQuestion = () => {
    if (qIndex + 1 >= totalQ) {
      setPhase("result");
    } else {
      setQIndex(i => i + 1);
      setAnswered(false);
      setGermStates({});
      setFeedback(null);
      setTimeLeft(game.timeLimit || 30);
    }
  };

  const startGame = () => {
    setPhase("playing");
    setTimeLeft(game.timeLimit || 30);
  };

  const maxScore = totalQ * (game.pointsPerQuestion || 10);
  const percentage = Math.round((score / maxScore) * 100);
  const passed = percentage >= (game.passMark || 60);

  // ── INTRO ────────────────────────────────────────────────────────────────────
  if (phase === "intro") return (
    <div style={styles.fullScreen("#0a1628")}>
      <style>{cssAnimations}</style>
      <div style={styles.introCard}>
        <img src={AVATAR_URL(username)} alt="avatar" style={styles.avatar(120)} />
        <h1 style={{ fontSize: 32, color: "#fff", margin: "16px 0 8px", fontFamily: "'Fredoka One', cursive" }}>
          🦠 Germ Catcher!
        </h1>
        <p style={{ color: "#94a3b8", fontSize: 15, margin: "0 0 8px" }}>
          Hi <strong style={{ color: "#60a5fa" }}>{username}</strong>! Germs are everywhere!
        </p>
        <p style={{ color: "#cbd5e1", fontSize: 14, margin: "0 0 20px", textAlign: "center", maxWidth: 300 }}>
          Tap the germ bubble with the <strong>correct answer</strong> to catch it! Wrong germs will bounce away!
        </p>
        <div style={styles.infoPills}>
          <span style={styles.pill("#3b82f6")}>📝 {totalQ} Questions</span>
          <span style={styles.pill("#10b981")}>⏱ {game.timeLimit}s each</span>
          <span style={styles.pill("#f59e0b")}>🏆 {maxScore} pts total</span>
        </div>
        <button onClick={startGame} style={styles.bigBtn("#10b981")}>
          🎮 Start Catching!
        </button>
      </div>
    </div>
  );

  // ── RESULT ───────────────────────────────────────────────────────────────────
  if (phase === "result") return (
    <div style={styles.fullScreen("#0a1628")}>
      <style>{cssAnimations}</style>
      <div style={styles.introCard}>
        <img src={AVATAR_URL(username)} alt="avatar" style={styles.avatar(100)} />
        <div style={{ fontSize: 60, margin: "8px 0" }}>{passed ? "🏆" : "💪"}</div>
        <h2 style={{ fontSize: 28, color: passed ? "#4ADE80" : "#f59e0b", margin: "0 0 6px", fontFamily: "'Fredoka One', cursive" }}>
          {passed ? "Amazing! You did it!" : "Good try! Keep going!"}
        </h2>
        <div style={{ fontSize: 48, fontWeight: 900, color: "#fff", margin: "8px 0" }}>{percentage}%</div>
        <p style={{ color: "#94a3b8", margin: "0 0 16px" }}>
          You scored <strong style={{ color: "#60a5fa" }}>{score}</strong> out of <strong>{maxScore}</strong> points
        </p>
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {results.map((r, i) => (
            <span key={i} style={{ fontSize: 22 }}>{r.correct ? "✅" : "❌"}</span>
          ))}
        </div>
        <button onClick={() => onFinish(score, maxScore, percentage, passed)} style={styles.bigBtn("#3b82f6")}>
          🏠 Back to Games
        </button>
      </div>
    </div>
  );

  // ── PLAYING ──────────────────────────────────────────────────────────────────
  return (
    <div style={styles.fullScreen("#0a1628")}>
      <style>{cssAnimations}</style>

      {/* Header */}
      <div style={styles.header}>
        <img src={AVATAR_URL(username)} alt="avatar" style={styles.avatar(40)} />
        <div style={{ flex: 1, margin: "0 12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ color: "#94a3b8", fontSize: 12 }}>Question {qIndex + 1}/{totalQ}</span>
            <span style={{ color: "#60a5fa", fontWeight: 700 }}>⭐ {score} pts</span>
          </div>
          <div style={{ background: "#1e3a5f", borderRadius: 20, height: 8 }}>
            <div style={{ width: `${((qIndex) / totalQ) * 100}%`, height: "100%", background: "linear-gradient(90deg,#3b82f6,#10b981)", borderRadius: 20, transition: "width 0.4s" }} />
          </div>
        </div>
        <div style={{
          width: 48, height: 48, borderRadius: "50%",
          background: timeLeft <= 8 ? "#ff4444" : "#1e3a5f",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, fontWeight: 900, color: "#fff",
          transition: "background 0.3s",
          animation: timeLeft <= 5 ? "pulse 0.5s infinite" : "none",
        }}>
          {timeLeft}
        </div>
      </div>

      {/* Question */}
      <div style={{
        background: "#0f2040", border: "1px solid #1e3a5f",
        borderRadius: 16, padding: "16px 20px", margin: "0 16px 8px",
        textAlign: "center",
      }}>
        <p style={{ fontSize: 18, fontWeight: 700, color: "#f1f5f9", margin: 0, lineHeight: 1.4 }}>
          {currentQ.questionText}
        </p>
        {currentQ.hint && !answered && (
          <p style={{ fontSize: 12, color: "#64748b", margin: "6px 0 0" }}>💡 {currentQ.hint}</p>
        )}
      </div>

      {/* Feedback */}
      {feedback && (
        <div style={{
          margin: "0 16px 4px", padding: "10px 16px", borderRadius: 12,
          background: feedback.color + "22", border: `1px solid ${feedback.color}`,
          color: feedback.color, fontWeight: 700, fontSize: 14, textAlign: "center",
          animation: "fadeIn 0.3s ease",
        }}>
          {feedback.text}
        </div>
      )}

      {/* Germ arena */}
      <div style={{
        flex: 1, position: "relative", margin: "0 16px",
        background: "radial-gradient(ellipse at center, #0d2040 0%, #060e1a 100%)",
        borderRadius: 20, border: "1px solid #1e3a5f", overflow: "hidden",
        minHeight: 280,
      }}>
        {/* Background blobs */}
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", opacity: 0.15 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{
              position: "absolute",
              width: 80 + i * 20,
              height: 80 + i * 20,
              borderRadius: "50%",
              background: GERM_COLORS[i % GERM_COLORS.length],
              left: `${10 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              filter: "blur(20px)",
            }} />
          ))}
        </div>

        {currentQ.options.map((opt, i) => (
          <FloatingGerm
            key={`${qIndex}-${i}`}
            option={opt}
            index={i}
            isCorrect={opt === currentQ.correctAnswer}
            onClick={() => handleAnswer(opt)}
            state={germStates[opt] || "idle"}
            position={POSITIONS[i]}
          />
        ))}
      </div>

      <div style={{ textAlign: "center", padding: "8px", color: "#475569", fontSize: 12 }}>
        Tap the correct germ bubble! 🦠
      </div>
    </div>
  );
}

// ── Shared styles ─────────────────────────────────────────────────────────────
const styles = {
  fullScreen: (bg) => ({
    minHeight: "100vh", background: bg,
    display: "flex", flexDirection: "column",
    fontFamily: "'Nunito', 'DM Sans', sans-serif",
  }),
  introCard: {
    margin: "auto", maxWidth: 420, width: "100%",
    padding: 32, display: "flex", flexDirection: "column",
    alignItems: "center", textAlign: "center",
  },
  avatar: (size) => ({
    width: size, height: size, borderRadius: "50%",
    border: "3px solid #3b82f6", background: "#0f2040",
  }),
  infoPills: {
    display: "flex", gap: 8, flexWrap: "wrap",
    justifyContent: "center", marginBottom: 20,
  },
  pill: (color) => ({
    padding: "4px 12px", borderRadius: 20,
    background: color + "22", border: `1px solid ${color}`,
    color, fontSize: 12, fontWeight: 700,
  }),
  bigBtn: (color) => ({
    padding: "14px 32px", background: color,
    color: "#fff", fontSize: 16, fontWeight: 800,
    border: "none", borderRadius: 16, cursor: "pointer",
    fontFamily: "'Nunito', sans-serif",
    boxShadow: `0 4px 20px ${color}66`,
    transition: "transform 0.15s",
  }),
  header: {
    display: "flex", alignItems: "center",
    padding: "12px 16px", borderBottom: "1px solid #1e3a5f",
  },
};

const cssAnimations = `
  @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;700;800;900&display=swap');
  @keyframes germ-float {
    0%, 100% { transform: translate(-50%, -50%) translateY(0px) rotate(-3deg); }
    50% { transform: translate(-50%, -50%) translateY(-14px) rotate(3deg); }
  }
  @keyframes germ-pop {
    0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
    50% { transform: translate(-50%, -50%) scale(1.5); opacity: 0.8; }
    100% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
  }
  @keyframes germ-bounce {
    0% { transform: translate(-50%, -50%) rotate(0deg); }
    25% { transform: translate(-50%, -80%) rotate(-15deg); }
    50% { transform: translate(-80%, -50%) rotate(15deg); }
    75% { transform: translate(-50%, -20%) rotate(-10deg); }
    100% { transform: translate(-50%, -50%) rotate(0deg); opacity: 0.3; }
  }
  @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.15); } }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
`;