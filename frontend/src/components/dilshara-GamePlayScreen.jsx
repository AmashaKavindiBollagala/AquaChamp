import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import GermCatcher from "./dilshara-GermCatcher";
import WaterDropAdventure from "./dilshara-WaterDropAdventure";
import MemoryMatch from "./dilshara-MemoryMatch";

const API_BASE = "http://localhost:4000";

export default function GamePlayScreen() {
  const { gameId } = useParams();
  const navigate = useNavigate();

  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [finalResult, setFinalResult] = useState(null);

  const token = localStorage.getItem("userToken") || localStorage.getItem("superAdminToken");
  const username = localStorage.getItem("username") || localStorage.getItem("adminUsername") || "Player";

  useEffect(() => { fetchGame(); }, [gameId]);

  const fetchGame = async () => {
    setLoading(true);
    setFinalResult(null);
    try {
      const res = await fetch(`${API_BASE}/api/games/${gameId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Game not found");
      setGame(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async (score, maxScore, percentage, passed) => {
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/games/${gameId}/scores`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ score, userId: username }),
      });
      setFinalResult({ score, maxScore, percentage, passed, saved: res.ok });
    } catch {
      setFinalResult({ score, maxScore, percentage, passed, saved: false });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingScreen msg="Loading game..." />;
  if (submitting) return <LoadingScreen msg="Saving your score..." />;
  if (error) return (
    <div style={centerStyle}>
      <div style={{ fontSize: 48 }}>❌</div>
      <p style={{ color: "#f87171", marginTop: 12 }}>{error}</p>
      <button onClick={() => navigate(-1)} style={btnStyle("#3b82f6")}>← Go Back</button>
    </div>
  );

  if (finalResult) return (
    <div style={centerStyle}>
     <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@700;900&display=swap" />
<style>{`@keyframes pop { 0% { transform:scale(0.5);opacity:0; } 80% { transform:scale(1.1); } 100% { transform:scale(1);opacity:1; } }`}</style>
      <div style={{ animation: "pop 0.5s ease both", textAlign: "center" }}>
        <div style={{ fontSize: 72 }}>{finalResult.passed ? "🏆" : "💪"}</div>
        <h2 style={{ color: "#f1f5f9", fontFamily: "'Fredoka One', cursive", fontSize: 28, margin: "12px 0 4px" }}>
          {finalResult.passed ? "Amazing! You Passed!" : "Keep Practicing!"}
        </h2>
        <div style={{ fontSize: 52, fontWeight: 900, color: "#fff", margin: "8px 0" }}>
          {finalResult.percentage}%
        </div>
        <p style={{ color: "#94a3b8" }}>{finalResult.score} / {finalResult.maxScore} points</p>
        <p style={{ fontSize: 12, color: finalResult.saved ? "#4ade80" : "#f87171", margin: "8px 0 20px" }}>
          {finalResult.saved ? "✅ Score saved to database!" : "⚠️ Could not save score"}
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button onClick={() => fetchGame()} style={btnStyle("#10b981")}>🔄 Play Again</button>
          <button onClick={() => navigate(-1)} style={btnStyle("#1e3a5f")}>🏠 Back</button>
        </div>
      </div>
    </div>
  );

  // Route to correct game based on subType field
  const subType = game.subType || "quiz";

  if (subType === "germcatcher") return <GermCatcher game={game} username={username} onFinish={handleFinish} />;
  if (subType === "waterdrop")   return <WaterDropAdventure game={game} username={username} onFinish={handleFinish} />;
  if (subType === "memory")      return <MemoryMatch game={game} username={username} onFinish={handleFinish} />;

  // Default: standard quiz (for 11–15 or unspecified)
  return <StandardQuiz game={game} username={username} onFinish={handleFinish} />;
}

// ── Standard Quiz (ages 11–15 default) ────────────────────────────────────────
function StandardQuiz({ game, username, onFinish }) {
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(game.timeLimit || 20);
  const AVATAR = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username)}`;
  const questions = game.questions || [];
  const currentQ = questions[qIndex];
  const totalQ = questions.length;
  const maxScore = totalQ * (game.pointsPerQuestion || 10);

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
    const isCorrect = opt === currentQ.correctAnswer;
    const newScore = isCorrect ? score + (game.pointsPerQuestion || 10) : score;
    if (isCorrect) setScore(newScore);
    setTimeout(() => {
      if (qIndex + 1 >= totalQ) {
        const pct = Math.round((newScore / maxScore) * 100);
        onFinish(newScore, maxScore, pct, pct >= (game.passMark || 60));
      } else {
        setQIndex(i => i + 1); setAnswered(false); setSelected(null);
        setTimeLeft(game.timeLimit || 20);
      }
    }, 1600);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#060e1a", fontFamily: "'Nunito',sans-serif", display: "flex", flexDirection: "column" }}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&display=swap" />
      <div style={{ display: "flex", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #1e3a5f", gap: 10 }}>
        <img src={AVATAR} alt="avatar" style={{ width: 38, height: 38, borderRadius: "50%", border: "2px solid #3b82f6" }} />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
            <span style={{ color: "#94a3b8", fontSize: 11 }}>Q {qIndex + 1}/{totalQ}</span>
            <span style={{ color: "#f59e0b", fontWeight: 700, fontSize: 12 }}>⭐ {score} pts</span>
          </div>
          <div style={{ background: "#1e3a5f", borderRadius: 10, height: 6 }}>
            <div style={{ width: `${(qIndex / totalQ) * 100}%`, height: "100%", background: "#3b82f6", borderRadius: 10, transition: "width 0.4s" }} />
          </div>
        </div>
        <div style={{ width: 42, height: 42, borderRadius: "50%", background: timeLeft <= 6 ? "#dc2626" : "#1e3a5f", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#fff", fontSize: 15, transition: "background 0.3s" }}>
          {timeLeft}
        </div>
      </div>
      <div style={{ padding: "20px 16px 12px", background: "#0f2040", margin: "16px 16px 8px", borderRadius: 14, border: "1px solid #1e3a5f" }}>
        <p style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 17, margin: 0, lineHeight: 1.4 }}>{currentQ.questionText}</p>
        {currentQ.hint && !answered && <p style={{ color: "#64748b", fontSize: 12, margin: "6px 0 0" }}>💡 {currentQ.hint}</p>}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "0 16px" }}>
        {currentQ.options.map((opt, i) => {
          let bg = "#0f2040", border = "#1e3a5f", color = "#cbd5e1";
          if (answered) {
            if (opt === currentQ.correctAnswer) { bg = "#052e1680"; border = "#16a34a"; color = "#4ade80"; }
            else if (selected === opt) { bg = "#450a0a80"; border = "#dc2626"; color = "#f87171"; }
          }
          return (
            <button key={i} onClick={() => handleAnswer(opt)} disabled={answered}
              style={{ padding: "14px 16px", background: bg, border: `2px solid ${border}`, borderRadius: 12, color, fontWeight: 700, fontSize: 14, fontFamily: "'Nunito',sans-serif", cursor: answered ? "default" : "pointer", textAlign: "left", transition: "all 0.2s" }}>
              {["A","B","C","D"][i]}. {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function LoadingScreen({ msg }) {
  return (
    <div style={centerStyle}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ fontSize: 48, animation: "spin 1s linear infinite" }}>💧</div>
      <p style={{ color: "#94a3b8", marginTop: 16, fontFamily: "sans-serif" }}>{msg}</p>
    </div>
  );
}

const centerStyle = {
  minHeight: "100vh", background: "#060e1a",
  display: "flex", flexDirection: "column",
  alignItems: "center", justifyContent: "center",
  fontFamily: "'Nunito', sans-serif", color: "#f1f5f9", padding: 24,
};
const btnStyle = (c) => ({
  padding: "12px 24px", background: c, color: "#fff",
  fontSize: 14, fontWeight: 700, border: "none", borderRadius: 12,
  cursor: "pointer", fontFamily: "'Nunito', sans-serif",
});