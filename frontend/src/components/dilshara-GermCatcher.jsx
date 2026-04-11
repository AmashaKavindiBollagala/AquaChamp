import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";


//  TOPIC WORD-BANK

const TOPIC_QUESTIONS = {
  "safe-drinking-water": [
    { q: "What should you do to water before drinking it if unsure?", a: "Boil it", wrong: ["Freeze it", "Colour it", "Shake it"] },
    { q: "Which water is safe to drink straight away?", a: "Tap water", wrong: ["River water", "Pond water", "Muddy water"] },
    { q: "What colour is clean, safe water?", a: "Clear", wrong: ["Brown", "Green", "Yellow"] },
    { q: "Which removes dirt from water?", a: "A filter", wrong: ["A spoon", "A bucket", "A fan"] },
    { q: "Where does safe drinking water come from at home?", a: "The tap", wrong: ["The garden", "A puddle", "The roof"] },
    { q: "What kills germs in water when boiling?", a: "Heat", wrong: ["Cold", "Salt", "Sugar"] },
    { q: "Which container keeps water clean?", a: "A covered pot", wrong: ["An open bucket", "A shoe", "A leaf"] },
    { q: "What is a sign water might NOT be safe?", a: "Bad smell", wrong: ["No colour", "Cool feeling", "Clear look"] },
  ],
  "hand-washing-and-personal-hygiene": [
    { q: "What do you use to wash your hands properly?", a: "Soap and water", wrong: ["Just water", "Mud", "Sand"] },
    { q: "How long should you scrub your hands?", a: "20 seconds", wrong: ["2 seconds", "1 minute", "5 seconds"] },
    { q: "When MUST you wash your hands?", a: "After toilet", wrong: ["Before sleeping", "After drawing", "Before reading"] },
    { q: "What does soap do to germs?", a: "Kills them", wrong: ["Feeds them", "Hides them", "Grows them"] },
    { q: "Which part of your hands do people forget to wash?", a: "Under nails", wrong: ["Palms", "Wrists", "Fingers"] },
    { q: "What should you use to dry clean hands?", a: "A clean towel", wrong: ["Your trousers", "A dirty cloth", "Hair"] },
    { q: "How often should you brush your teeth?", a: "Twice a day", wrong: ["Once a week", "Once a month", "Never"] },
    { q: "Why is personal hygiene important?", a: "Stops disease", wrong: ["Makes you tall", "Helps you run", "Gives energy"] },
  ],
  "toilet-and-sanpracticesitation-practices": [
    { q: "What should you do after using the toilet?", a: "Wash hands", wrong: ["Eat food", "Go to sleep", "Touch your face"] },
    { q: "Why should we use a toilet?", a: "Keeps germs away", wrong: ["Saves water", "Looks nice", "Saves time"] },
    { q: "What should you do after flushing?", a: "Wash hands", wrong: ["Drink water", "Run outside", "Eat a snack"] },
    { q: "Where should you NEVER go to the toilet?", a: "Near water sources", wrong: ["In a toilet", "In a latrine", "In a bathroom"] },
    { q: "What is a latrine?", a: "An outdoor toilet", wrong: ["A type of food", "A water filter", "A bucket"] },
    { q: "Why must toilets have a door?", a: "For privacy & hygiene", wrong: ["For decoration", "To keep it warm", "To store things"] },
    { q: "What happens when waste is left in the open?", a: "Spreads disease", wrong: ["Grows flowers", "Makes clean water", "Nothing happens"] },
    { q: "Which is best for proper sanitation?", a: "A covered toilet", wrong: ["An open hole", "A river", "A drain"] },
  ],
  "water-borne-diseases-and-prevention": [
    { q: "Which disease comes from dirty water?", a: "Cholera", wrong: ["Broken leg", "Sunburn", "Toothache"] },
    { q: "How do water-borne diseases spread?", a: "Through dirty water", wrong: ["Through sunlight", "Through clean air", "Through books"] },
    { q: "What stops water-borne diseases?", a: "Clean water", wrong: ["Dirty rivers", "Open toilets", "Uncovered food"] },
    { q: "Which is a sign of water-borne disease?", a: "Diarrhoea", wrong: ["Blue eyes", "Curly hair", "Sneezing"] },
    { q: "What should you do if water looks dirty?", a: "Boil or filter it", wrong: ["Drink it fast", "Add sugar", "Freeze it"] },
    { q: "Who is most at risk from water-borne disease?", a: "Young children", wrong: ["Adults only", "Tall people", "Old buildings"] },
    { q: "Which animal spreads water disease through bite?", a: "Mosquito", wrong: ["Cat", "Dog", "Fish"] },
    { q: "Which habit prevents water-borne illness?", a: "Hand washing", wrong: ["Skipping meals", "Staying indoors", "Wearing hats"] },
  ],
  "water-conservation-and-environment-care": [
    { q: "What does 'conserve water' mean?", a: "Use less water", wrong: ["Use more water", "Paint water", "Sell water"] },
    { q: "Which is a good way to save water?", a: "Fix leaking taps", wrong: ["Leave taps open", "Water plants at noon", "Take long baths"] },
    { q: "Where does most of Earth's water come from?", a: "The oceans", wrong: ["The sky alone", "The trees", "The ground only"] },
    { q: "What percentage of Earth's water is fresh?", a: "About 3%", wrong: ["50%", "90%", "25%"] },
    { q: "Which damages water sources?", a: "Dumping rubbish", wrong: ["Planting trees", "Fixing pipes", "Closing taps"] },
    { q: "What is a rainwater harvesting?", a: "Collecting rainwater", wrong: ["Selling rain", "Dancing in rain", "Blocking rain"] },
    { q: "Why should we protect rivers?", a: "Animals depend on them", wrong: ["They taste sweet", "They glow at night", "They are hot"] },
    { q: "Which is an eco-friendly water habit?", a: "Shorter showers", wrong: ["Longer showers", "Leaving sprinklers on", "Wasting dishwater"] },
  ],
};

const DEFAULT_QUESTIONS = TOPIC_QUESTIONS["safe-drinking-water"];

function buildRound(topicId, count) {
  const pool = TOPIC_QUESTIONS[topicId] || DEFAULT_QUESTIONS;
  const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, Math.min(count, pool.length));
  return shuffled.map(item => {
    const options = [item.a, ...item.wrong].sort(() => Math.random() - 0.5);
    return { questionText: item.q, correctAnswer: item.a, options };
  });
}


//  VISUAL CONSTANTS

const AVATAR_URL = (seed) =>
  `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4`;

// Bright, saturated germ colors for children
const GERM_COLORS  = ["#f43f5e", "#f59e0b", "#8b5cf6", "#ec4899", "#10b981"];
const GERM_EMOJIS  = ["🦠", "🧫", "🦠", "😷", "🦠"];
const FONT_LINK    = "https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;700;800;900&display=swap";

const POSITIONS = [
  { x: 22, y: 35 }, { x: 78, y: 35 },
  { x: 22, y: 72 }, { x: 78, y: 72 },
];

//  FLOATING GERM BUBBLE
// 
function FloatingGerm({ option, index, onClick, state, position }) {
  const color = GERM_COLORS[index % GERM_COLORS.length];
  const emoji = GERM_EMOJIS[index % GERM_EMOJIS.length];
  const animName = state === "correct" ? "germ-pop" : state === "wrong" ? "germ-shake" : "germ-float";

  return (
    <div onClick={onClick} style={{
      position: "absolute",
      left: `${position.x}%`,
      top: `${position.y}%`,
      transform: "translate(-50%, -50%)",
      cursor: state === "idle" ? "pointer" : "default",
      animation: `${animName} ${state === "idle" ? "3s ease-in-out infinite" : "0.5s ease forwards"}`,
      animationDelay: state === "idle" ? `${index * 0.4}s` : "0s",
      zIndex: 10,
      filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.2))",
    }}>
      <div style={{
        width: 110, height: 110, borderRadius: "50%",
        background: `radial-gradient(circle at 35% 35%, #fff, ${color})`,
        border: `4px solid ${color}`,
        boxShadow: `0 0 24px ${color}99, inset 0 -4px 8px rgba(0,0,0,0.1)`,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: 8, transition: "transform 0.15s",
      }}
        onMouseEnter={e => state === "idle" && (e.currentTarget.style.transform = "scale(1.12)")}
        onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
      >
        <span style={{ fontSize: 26 }}>{emoji}</span>
        <span style={{
          fontSize: 11, fontWeight: 900, color: "#fff",
          textAlign: "center", lineHeight: 1.2,
          textShadow: "0 1px 4px rgba(0,0,0,0.5)",
          padding: "0 4px", wordBreak: "break-word",
        }}>{option}</span>
      </div>
    </div>
  );
}

//
//  MAIN COMPONENT
// 
export default function GermCatcher({ game, username, onFinish, onNavigateBack }) {
  const navigate = useNavigate();
  
  // Navigate back to game selection page
  const handleGoBack = () => {
    if (onNavigateBack) {
      onNavigateBack();
    } else {
      navigate(-1);
    }
  };
  
  const questionCount = game.questions?.length > 0
    ? game.questions.length
    : (game.difficulty === "hard" ? 10 : game.difficulty === "medium" ? 8 : 5);

  const [questions]  = useState(() => {
    if (game.questions && game.questions.length > 0) return game.questions;
    return buildRound(game.topicId, questionCount);
  });

  const [phase, setPhase]       = useState("intro");
  const [qIndex, setQIndex]     = useState(0);
  const [score, setScore]       = useState(0);
  const [germStates, setGermStates] = useState({});
  const [timeLeft, setTimeLeft] = useState(game.timeLimit || 30);
  const [feedback, setFeedback] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [results, setResults]   = useState([]);
  const timerRef = useRef(null);

  const currentQ = questions[qIndex];
  const totalQ   = questions.length;
  const maxScore = totalQ * (game.pointsPerQuestion || 10);

  useEffect(() => {
    if (phase !== "playing" || answered) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); handleTimeout(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, qIndex, answered]);

  const handleTimeout = () => {
    if (answered) return;
    setAnswered(true);
    setFeedback({ text: "⏰ Time's up! The germs escaped!", color: "#dc2626" });
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
      setFeedback({ text: "🎉 You caught the right germ!", color: "#16a34a" });
    } else {
      setGermStates(prev => ({ ...prev, [currentQ.correctAnswer]: "correct" }));
      setFeedback({ text: `❌ Oops! The right answer: ${currentQ.correctAnswer}`, color: "#dc2626" });
    }
    setResults(r => [...r, { correct: isCorrect }]);
    setTimeout(nextQuestion, 1800);
  };

  const nextQuestion = () => {
    if (qIndex + 1 >= totalQ) {
      setPhase("result");
    } else {
      setQIndex(i => i + 1);
      setAnswered(false); setGermStates({});
      setFeedback(null); setTimeLeft(game.timeLimit || 30);
    }
  };

  const percentage = Math.round((score / maxScore) * 100);
  const passed     = percentage >= (game.passMark || 60);

  // ── INTRO 
  if (phase === "intro") return (
    <div style={styles.screen}>
      <link rel="stylesheet" href={FONT_LINK} />
      <style>{CSS_ANIMATIONS}</style>
      
      {/* Go Back button in top-left corner */}
      <button onClick={handleGoBack} style={{
        position: "absolute", top: 16, left: 16,
        padding: "10px 20px", background: "linear-gradient(135deg,#ec4899,#f472b6)",
        border: "none", borderRadius: 14, color: "#fff",
        fontSize: 14, cursor: "pointer", fontFamily: "'Nunito',sans-serif", fontWeight: 800,
        boxShadow: "0 4px 12px rgba(236,72,153,0.3)", zIndex: 10,
      }}>← Back to Games</button>
      
      <div style={styles.card}>
        <img src={AVATAR_URL(username)} alt="avatar" style={styles.avatar(110)} />
        <h1 style={{ fontSize: 34, color: "#111827", margin: "14px 0 6px", fontFamily: "'Fredoka One', cursive" }}>
          🦠 Germ Catcher!
        </h1>
        <p style={{ color: "#374151", fontSize: 14, margin: "0 0 6px", fontWeight: 700 }}>
          Hi <strong style={{ color: "#f43f5e" }}>{username}</strong>! Germs are everywhere — catch the right ones!
        </p>
        <p style={{ color: "#374151", fontSize: 13, margin: "0 0 6px", textAlign: "center", maxWidth: 300, fontWeight: 700 }}>
          Topic: <strong style={{ color: "#7c3aed" }}>{game.topicName || game.title}</strong>
        </p>
        <p style={{ color: "#6b7280", fontSize: 12, margin: "0 0 20px", textAlign: "center", maxWidth: 300 }}>
          Tap the germ bubble with the <strong style={{ color: "#374151" }}>correct answer</strong> before time runs out!
        </p>
        <div style={styles.pills}>
          <span style={styles.pill("#3b82f6")}>📝 {totalQ} Questions</span>
          <span style={styles.pill("#10b981")}>⏱ {game.timeLimit || 30}s each</span>
          <span style={styles.pill("#f59e0b")}>🏆 {maxScore} pts total</span>
        </div>
        <button onClick={() => { setPhase("playing"); setTimeLeft(game.timeLimit || 30); }} style={styles.bigBtn("#10b981")}>
          🎮 Start Catching!
        </button>
      </div>
    </div>
  );

  // ── RESULT 
  if (phase === "result") return (
    <div style={styles.screen}>
      <link rel="stylesheet" href={FONT_LINK} />
      <style>{CSS_ANIMATIONS}</style>
      <div style={styles.card}>
        <img src={AVATAR_URL(username)} alt="avatar" style={styles.avatar(90)} />
        <div style={{ fontSize: 60, margin: "8px 0", animation: "pop 0.5s ease both" }}>
          {passed ? "🏆" : "💪"}
        </div>
        <h2 style={{ fontSize: 26, color: passed ? "#16a34a" : "#d97706", margin: "0 0 6px", fontFamily: "'Fredoka One', cursive" }}>
          {passed ? "Amazing! You did it!" : "Good try! Keep going!"}
        </h2>
        <div style={{ fontSize: 52, fontWeight: 900, color: passed ? "#16a34a" : "#d97706", margin: "6px 0" }}>{percentage}%</div>
        <p style={{ color: "#374151", margin: "0 0 16px", fontWeight: 700 }}>
          You scored <strong style={{ color: "#3b82f6" }}>{score}</strong> out of <strong>{maxScore}</strong> points
        </p>
        <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap", justifyContent: "center" }}>
          {results.map((r, i) => <span key={i} style={{ fontSize: 22 }}>{r.correct ? "✅" : "❌"}</span>)}
        </div>
        <button onClick={() => onFinish(score, maxScore, percentage, passed)} style={styles.bigBtn("#3b82f6")}>
          🏠 Back to Games
        </button>
      </div>
    </div>
  );

  // ── PLAYING
  return (
    <div style={{ ...styles.screen, minHeight: "100vh" }}>
      <link rel="stylesheet" href={FONT_LINK} />
      <style>{CSS_ANIMATIONS}</style>

      {/* Header */}
      <div style={{ ...styles.header, background: "rgba(255,255,255,0.9)", backdropFilter: "blur(10px)", borderBottom: "3px solid #e5e7eb" }}>
        <img src={AVATAR_URL(username)} alt="avatar" style={styles.avatar(40)} />
        <div style={{ flex: 1, margin: "0 12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ color: "#374151", fontSize: 12, fontWeight: 700 }}>Question {qIndex + 1}/{totalQ}</span>
            <span style={{ color: "#d97706", fontWeight: 800 }}>⭐ {score} pts</span>
          </div>
          <div style={{ background: "#e5e7eb", borderRadius: 20, height: 8 }}>
            <div style={{
              width: `${((qIndex) / totalQ) * 100}%`, height: "100%",
              background: "linear-gradient(90deg,#f43f5e,#f59e0b,#22c55e)",
              borderRadius: 20, transition: "width 0.4s",
            }} />
          </div>
        </div>
        <div style={{
          width: 48, height: 48, borderRadius: "50%",
          background: timeLeft <= 8 ? "#dc2626" : "#16a34a",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, fontWeight: 900, color: "#fff", transition: "background 0.3s",
          animation: timeLeft <= 5 ? "pulse 0.5s infinite" : "none",
          boxShadow: `0 4px 12px ${timeLeft <= 8 ? "#dc262699" : "#16a34a99"}`,
        }}>{timeLeft}</div>
        
        {/* Pause button */}
        <button onClick={handleGoBack} style={{
          marginLeft: 8, padding: "8px 14px", background: "linear-gradient(135deg,#f59e0b,#fbbf24)",
          border: "none", borderRadius: 10, color: "#fff", fontSize: 12,
          cursor: "pointer", fontFamily: "'Nunito',sans-serif", fontWeight: 800,
          boxShadow: "0 2px 8px rgba(245,158,11,0.3)",
        }}>⏸ Pause</button>
      </div>

      {/* Question text */}
      <div style={{
        background: "rgba(255,255,255,0.9)", border: "3px solid #fbbf24",
        borderRadius: 16, padding: "16px 20px", margin: "10px 16px 8px", textAlign: "center",
        boxShadow: "0 4px 16px rgba(251,191,36,0.3)",
      }}>
        <p style={{ fontSize: 17, fontWeight: 800, color: "#111827", margin: 0, lineHeight: 1.4 }}>
          {currentQ.questionText}
        </p>
        {currentQ.hint && !answered && (
          <p style={{ fontSize: 12, color: "#6b7280", margin: "6px 0 0" }}>💡 {currentQ.hint}</p>
        )}
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div style={{
          margin: "0 16px 4px", padding: "10px 16px", borderRadius: 12,
          background: feedback.color === "#16a34a" ? "#dcfce7" : "#fee2e2",
          border: `2px solid ${feedback.color}`,
          color: feedback.color, fontWeight: 800, fontSize: 14, textAlign: "center",
          animation: "fadeIn 0.3s ease",
        }}>{feedback.text}</div>
      )}

      {/* Germ arena — bright sunny background */}
      <div style={{
        flex: 1, position: "relative", margin: "0 16px",
        background: "linear-gradient(135deg,#fef3c7,#fce7f3,#e0f2fe)",
        borderRadius: 20, border: "3px solid #e5e7eb",
        overflow: "hidden", minHeight: 280,
      }}>
        {/* Decorative spots */}
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", opacity: 0.15 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{
              position: "absolute",
              width: 80 + i * 20, height: 80 + i * 20, borderRadius: "50%",
              background: GERM_COLORS[i % GERM_COLORS.length],
              left: `${10 + i * 15}%`, top: `${20 + (i % 3) * 25}%`,
              filter: "blur(20px)",
            }} />
          ))}
        </div>
        {/* Germ bubbles */}
        {currentQ.options.map((opt, i) => (
          <FloatingGerm
            key={`${qIndex}-${i}`}
            option={opt} index={i}
            onClick={() => handleAnswer(opt)}
            state={germStates[opt] || "idle"}
            position={POSITIONS[i]}
          />
        ))}
      </div>

      <div style={{ textAlign: "center", padding: "8px", color: "#6b7280", fontSize: 12, fontWeight: 700 }}>
        Tap the correct germ bubble! 🦠
      </div>
    </div>
  );
}


//  SHARED STYLES

const styles = {
  screen: {
    minHeight: "100vh",
    background: "linear-gradient(135deg,#fef9c3 0%,#fce7f3 30%,#e0f2fe 60%,#d1fae5 100%)",
    display: "flex", flexDirection: "column",
    fontFamily: "'Nunito', sans-serif",
  },
  card: {
    margin: "auto", maxWidth: 420, width: "100%", padding: 32,
    display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
  },
  avatar: (size) => ({
    width: size, height: size, borderRadius: "50%",
    border: "4px solid #ec4899", background: "#fce7f3",
  }),
  pills: { display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: 20 },
  pill:  (c) => ({
    padding: "5px 14px", borderRadius: 20,
    background: "#fff", border: `2px solid ${c}`, color: c, fontSize: 12, fontWeight: 800,
    boxShadow: `0 2px 8px ${c}44`,
  }),
  bigBtn: (c) => ({
    padding: "14px 32px", background: c, color: "#fff", fontSize: 16, fontWeight: 900,
    border: "none", borderRadius: 16, cursor: "pointer",
    fontFamily: "'Nunito', sans-serif", boxShadow: `0 4px 20px ${c}66`,
  }),
  header: {
    display: "flex", alignItems: "center",
    padding: "12px 16px", gap: 10,
  },
};

const CSS_ANIMATIONS = `
  @keyframes germ-float {
    0%, 100% { transform: translate(-50%, -50%) translateY(0px) rotate(-3deg); }
    50%       { transform: translate(-50%, -50%) translateY(-14px) rotate(3deg); }
  }
  @keyframes germ-pop {
    0%   { transform: translate(-50%, -50%) scale(1); opacity: 1; }
    50%  { transform: translate(-50%, -50%) scale(1.5); opacity: 0.8; }
    100% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
  }
  @keyframes germ-shake {
    0%, 100% { transform: translate(-50%, -50%) rotate(0deg); }
    20%       { transform: translate(-56%, -50%) rotate(-12deg); }
    40%       { transform: translate(-44%, -50%) rotate(12deg); }
    60%       { transform: translate(-56%, -50%) rotate(-8deg); }
    80%       { transform: translate(-44%, -50%) rotate(8deg); }
  }
  @keyframes pulse   { 0%,100% { transform: scale(1); }   50% { transform: scale(1.15); } }
  @keyframes fadeIn  { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
  @keyframes pop     { 0% { transform:scale(0.5); opacity:0; } 80% { transform:scale(1.1); } 100% { transform:scale(1); opacity:1; } }
`;