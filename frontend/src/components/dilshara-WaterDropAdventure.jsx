import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// ─────────────────────────────────────────────────────────────────────────────
//  TOPIC WORD-BANK
// ─────────────────────────────────────────────────────────────────────────────
const TOPIC_QUESTIONS = {
  "safe-drinking-water": [
    { q: "What should you do to water before drinking it if unsure?", a: "Boil it",      wrong: ["Freeze it",     "Colour it",   "Shake it"] },
    { q: "Which water is safe to drink straight away?",               a: "Tap water",   wrong: ["River water",   "Pond water",  "Muddy water"] },
    { q: "What colour is clean, safe water?",                         a: "Clear",        wrong: ["Brown",         "Green",       "Yellow"] },
    { q: "Which removes dirt from water?",                            a: "A filter",     wrong: ["A spoon",       "A bucket",    "A fan"] },
    { q: "Where does safe drinking water come from at home?",         a: "The tap",      wrong: ["The garden",    "A puddle",    "The roof"] },
    { q: "What kills germs in water when boiling?",                   a: "Heat",         wrong: ["Cold",          "Salt",        "Sugar"] },
    { q: "What is a sign water might NOT be safe?",                   a: "Bad smell",    wrong: ["No colour",     "Cool feeling","Clear look"] },
  ],
  "hand-washing-and-personal-hygiene": [
    { q: "What do you use to wash your hands properly?",              a: "Soap and water", wrong: ["Just water",  "Mud",         "Sand"] },
    { q: "How long should you scrub your hands?",                     a: "20 seconds",     wrong: ["2 seconds",   "1 minute",    "5 seconds"] },
    { q: "When MUST you wash your hands?",                            a: "After toilet",   wrong: ["Before sleeping","After drawing","Before reading"] },
    { q: "What does soap do to germs?",                               a: "Kills them",     wrong: ["Feeds them",  "Hides them",  "Grows them"] },
    { q: "How often should you brush your teeth?",                    a: "Twice a day",    wrong: ["Once a week", "Once a month","Never"] },
    { q: "What should you use to dry clean hands?",                   a: "A clean towel",  wrong: ["Your trousers","A dirty cloth","Hair"] },
    { q: "Why is personal hygiene important?",                        a: "Stops disease",  wrong: ["Makes you tall","Helps you run","Gives energy"] },
  ],
  "toilet-and-sanpracticesitation-practices": [
    { q: "What should you do after using the toilet?",                a: "Wash hands",       wrong: ["Eat food",    "Go to sleep", "Touch face"] },
    { q: "Why should we use a toilet?",                               a: "Keeps germs away", wrong: ["Saves water", "Looks nice",  "Saves time"] },
    { q: "Where should you NEVER go to the toilet?",                  a: "Near water sources",wrong:["In a toilet", "In a latrine","In a bathroom"]},
    { q: "What is a latrine?",                                        a: "An outdoor toilet", wrong: ["A food type","A water filter","A bucket"] },
    { q: "What happens when waste is left in the open?",              a: "Spreads disease",  wrong: ["Grows flowers","Makes clean water","Nothing"] },
    { q: "Which is best for proper sanitation?",                      a: "A covered toilet", wrong: ["An open hole","A river",     "A drain"] },
    { q: "What should you flush after using the toilet?",             a: "Waste away",       wrong: ["More water",  "Soap",        "Paper only"] },
  ],
  "water-borne-diseases-and-prevention": [
    { q: "Which disease comes from dirty water?",                     a: "Cholera",       wrong: ["Broken leg",  "Sunburn",     "Toothache"] },
    { q: "How do water-borne diseases spread?",                       a: "Dirty water",   wrong: ["Sunlight",    "Clean air",   "Books"] },
    { q: "What stops water-borne diseases?",                          a: "Clean water",   wrong: ["Dirty rivers","Open toilets","Uncovered food"] },
    { q: "Which is a sign of water-borne disease?",                   a: "Diarrhoea",     wrong: ["Blue eyes",   "Curly hair",  "Sneezing"] },
    { q: "What should you do if water looks dirty?",                  a: "Boil or filter",wrong: ["Drink it fast","Add sugar",  "Freeze it"] },
    { q: "Which habit prevents water-borne illness?",                 a: "Hand washing",  wrong: ["Skipping meals","Staying indoors","Wearing hats"] },
    { q: "Which animal spreads water disease through bite?",          a: "Mosquito",      wrong: ["Cat",         "Dog",         "Fish"] },
  ],
  "water-conservation-and-environment-care": [
    { q: "What does 'conserve water' mean?",                          a: "Use less water",    wrong: ["Use more water","Paint water","Sell water"] },
    { q: "Which is a good way to save water?",                        a: "Fix leaking taps",  wrong: ["Leave taps open","Water at noon","Long baths"] },
    { q: "What percentage of Earth's water is fresh?",               a: "About 3%",          wrong: ["50%",          "90%",        "25%"] },
    { q: "Which damages water sources?",                              a: "Dumping rubbish",   wrong: ["Planting trees","Fixing pipes","Closing taps"] },
    { q: "What is rainwater harvesting?",                             a: "Collecting rainwater",wrong:["Selling rain","Dancing in rain","Blocking rain"]},
    { q: "Why should we protect rivers?",                             a: "Animals need them", wrong: ["They taste sweet","They glow","They are hot"] },
    { q: "Which is an eco-friendly water habit?",                     a: "Shorter showers",   wrong: ["Longer showers","Sprinklers on","Wasting dishwater"] },
  ],
};

const DEFAULT_QUESTIONS = TOPIC_QUESTIONS["safe-drinking-water"];

function buildRound(topicId, count) {
  const pool = TOPIC_QUESTIONS[topicId] || DEFAULT_QUESTIONS;
  const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, Math.min(count, pool.length));
  return shuffled.map(item => ({
    questionText: item.q,
    correctAnswer: item.a,
    options: [item.a, ...item.wrong].sort(() => Math.random() - 0.5),
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
const AVATAR_URL = (seed) =>
  `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4`;

const PATH_ICONS = ["🏔️", "🌧️", "🏞️", "🌊", "🏗️", "🚰", "🏡"];
const FONT_LINK  = "https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;700;800;900&display=swap";
// Bright, cheerful option colors for children
const OPTION_BG  = ["#fef3c7","#fce7f3","#e0f2fe","#d1fae5"];
const OPTION_BORDER = ["#f59e0b","#ec4899","#0ea5e9","#10b981"];
const OPTION_TEXT   = ["#92400e","#9d174d","#075985","#065f46"];
const OPTION_DROPS  = ["💧","🌊","⛲","🏞️"];

// ─────────────────────────────────────────────────────────────────────────────
export default function WaterDropAdventure({ game, username, onFinish, onNavigateBack }) {
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

  const [questions] = useState(() => {
    if (game.questions && game.questions.length > 0) return game.questions;
    return buildRound(game.topicId, questionCount);
  });

  const [phase, setPhase]           = useState("intro");
  const [qIndex, setQIndex]         = useState(0);
  const [score, setScore]           = useState(0);
  const [waterLevel, setWaterLevel] = useState(0);
  const [timeLeft, setTimeLeft]     = useState(game.timeLimit || 30);
  const [selected, setSelected]     = useState(null);
  const [feedback, setFeedback]     = useState(null);
  const [answered, setAnswered]     = useState(false);
  const [results, setResults]       = useState([]);
  const [characterPos, setCharacterPos] = useState(2);
  const [dropAnim, setDropAnim]     = useState(false);
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
    setFeedback({ correct: false, text: `⏰ Time's up! Answer: ${currentQ.correctAnswer}` });
    setResults(r => [...r, false]);
    setTimeout(advance, 2000);
  };

  const handleAnswer = (option) => {
    if (answered) return;
    clearInterval(timerRef.current);
    setAnswered(true); setSelected(option);
    const isCorrect = option === currentQ.correctAnswer;
    if (isCorrect) {
      setScore(s => s + (game.pointsPerQuestion || 10));
      setWaterLevel(w => Math.min(100, w + (100 / totalQ)));
      setCharacterPos(p => Math.min(96, p + (90 / totalQ)));
      setDropAnim(true); setTimeout(() => setDropAnim(false), 800);
      setFeedback({ correct: true, text: "💧 Great! The water flows forward!" });
    } else {
      setFeedback({ correct: false, text: `Not quite! The answer was: ${currentQ.correctAnswer}` });
    }
    setResults(r => [...r, isCorrect]);
    setTimeout(advance, 2000);
  };

  const advance = () => {
    if (qIndex + 1 >= totalQ) { setPhase("result"); return; }
    setQIndex(i => i + 1); setAnswered(false);
    setSelected(null); setFeedback(null);
    setTimeLeft(game.timeLimit || 30);
  };

  const percentage = Math.round((score / maxScore) * 100);
  const passed     = percentage >= (game.passMark || 60);

  // ── INTRO ─────────────────────────────────────────────────────────────────
  if (phase === "intro") return (
    <div style={fullScreen}>
      <link rel="stylesheet" href={FONT_LINK} />
      <style>{CSS}</style>
      
      {/* Go Back button */}
      <button onClick={handleGoBack} style={{
        position: "absolute", top: 16, left: 16,
        padding: "10px 20px", background: "linear-gradient(135deg,#ec4899,#f472b6)",
        border: "none", borderRadius: 14, color: "#fff",
        fontSize: 14, cursor: "pointer", fontFamily: "'Nunito',sans-serif", fontWeight: 800,
        boxShadow: "0 4px 12px rgba(236,72,153,0.3)", zIndex: 10,
      }}>← Back to Games</button>
      
      <div style={card}>
        <div style={{ fontSize: 70, marginBottom: 8, animation: "wfloat 2s ease-in-out infinite" }}>💧</div>
        <img src={AVATAR_URL(username)} alt="avatar" style={ava(100)} />
        <h1 style={titleS}>Water Drop Adventure!</h1>
        <p style={subS}>Hi <strong style={{ color: "#0ea5e9" }}>{username}</strong>! Help the water drop travel to the village!</p>
        <p style={{ color: "#374151", fontSize: 12, margin: "0 0 6px", textAlign: "center", maxWidth: 300, fontWeight: 700 }}>
          Topic: <strong style={{ color: "#0ea5e9" }}>{game.topicName || game.title}</strong>
        </p>
        <p style={{ color: "#6b7280", fontSize: 13, margin: "0 0 20px", textAlign: "center", maxWidth: 300 }}>
          Answer correctly to fill the river and move your drop along the path!
        </p>
        <div style={pillsRow}>
          <span style={pl("#0ea5e9")}>💧 {totalQ} Steps</span>
          <span style={pl("#10b981")}>⏱ {game.timeLimit || 30}s each</span>
          <span style={pl("#f59e0b")}>🏆 {maxScore} pts</span>
        </div>
        <button onClick={() => setPhase("playing")} style={btn("#0ea5e9")}>
          🌊 Start the Journey!
        </button>
      </div>
    </div>
  );

  // ── RESULT ────────────────────────────────────────────────────────────────
  if (phase === "result") return (
    <div style={fullScreen}>
      <link rel="stylesheet" href={FONT_LINK} />
      <style>{CSS}</style>
      <div style={card}>
        <div style={{ fontSize: 68, animation: "wfloat 1.5s ease-in-out infinite" }}>{passed ? "🎉" : "💪"}</div>
        <img src={AVATAR_URL(username)} alt="avatar" style={ava(90)} />
        <h2 style={{ ...titleS, fontSize: 26, color: passed ? "#16a34a" : "#d97706" }}>
          {passed ? "The village has clean water!" : "Keep trying, hero!"}
        </h2>
        <div style={{ fontSize: 54, fontWeight: 900, color: passed ? "#16a34a" : "#d97706", margin: "8px 0" }}>{percentage}%</div>
        {/* Water bar */}
        <div style={{ width: "100%", maxWidth: 300, margin: "0 auto 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ color: "#6b7280", fontSize: 12, fontWeight: 700 }}>Water collected</span>
            <span style={{ color: "#0ea5e9", fontSize: 12, fontWeight: 800 }}>{Math.round(waterLevel)}%</span>
          </div>
          <div style={{ background: "#e0f2fe", borderRadius: 20, height: 18, overflow: "hidden", border: "2px solid #bae6fd" }}>
            <div style={{ width: `${waterLevel}%`, height: "100%", background: "linear-gradient(90deg, #0ea5e9, #38bdf8, #7dd3fc)", borderRadius: 20, transition: "width 1s ease" }} />
          </div>
        </div>
        <p style={{ color: "#374151", margin: "0 0 16px", fontWeight: 700 }}>
          Score: <strong style={{ color: "#0ea5e9" }}>{score}</strong> / {maxScore} pts
        </p>
        <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap", justifyContent: "center" }}>
          {results.map((r, i) => <span key={i} style={{ fontSize: 22 }}>{r ? "💧" : "💢"}</span>)}
        </div>
        <button onClick={() => onFinish(score, maxScore, percentage, passed)} style={btn("#3b82f6")}>
          🏠 Back to Games
        </button>
      </div>
    </div>
  );

  // ── PLAYING ───────────────────────────────────────────────────────────────
  return (
    <div style={fullScreen}>
      <link rel="stylesheet" href={FONT_LINK} />
      <style>{CSS}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", padding: "12px 16px", borderBottom: "3px solid #e5e7eb", gap: 10, background: "rgba(255,255,255,0.9)", backdropFilter: "blur(10px)" }}>
        <img src={AVATAR_URL(username)} alt="avatar" style={ava(38)} />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
            <span style={{ color: "#374151", fontSize: 11, fontWeight: 700 }}>Question {qIndex + 1}/{totalQ}</span>
            <span style={{ color: "#d97706", fontWeight: 800, fontSize: 12 }}>⭐ {score} pts</span>
          </div>
          <div style={{ background: "#e5e7eb", borderRadius: 20, height: 8 }}>
            <div style={{ width: `${(qIndex / totalQ) * 100}%`, height: "100%", background: "linear-gradient(90deg,#0ea5e9,#38bdf8)", borderRadius: 20, transition: "width 0.4s" }} />
          </div>
        </div>
        <div style={{
          width: 44, height: 44, borderRadius: "50%",
          background: timeLeft <= 8 ? "#dc2626" : "#0ea5e9",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 15, fontWeight: 900, color: "#fff", transition: "background 0.3s",
          animation: timeLeft <= 5 ? "pulse 0.5s infinite" : "none",
          boxShadow: `0 4px 12px ${timeLeft <= 8 ? "#dc262688" : "#0ea5e988"}`,
        }}>{timeLeft}</div>
        
        {/* Pause button */}
        <button onClick={handleGoBack} style={{
          marginLeft: 8, padding: "8px 14px", background: "linear-gradient(135deg,#f59e0b,#fbbf24)",
          border: "none", borderRadius: 10, color: "#fff", fontSize: 12,
          cursor: "pointer", fontFamily: "'Nunito',sans-serif", fontWeight: 800,
          boxShadow: "0 2px 8px rgba(245,158,11,0.3)",
        }}>⏸ Pause</button>
      </div>

      {/* River path — bright sky-blue theme */}
      <div style={{ background: "linear-gradient(180deg,#e0f2fe,#bae6fd)", padding: "10px 16px", position: "relative", overflow: "hidden", borderBottom: "3px solid #7dd3fc" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 6 }}>
          {PATH_ICONS.slice(0, Math.min(totalQ + 1, 7)).map((icon, i) => (
            <div key={i} style={{ textAlign: "center", opacity: i <= qIndex ? 1 : 0.3, transition: "opacity 0.4s" }}>
              <div style={{ fontSize: i === qIndex ? 22 : 16 }}>{icon}</div>
            </div>
          ))}
        </div>
        <div style={{ background: "#bae6fd", borderRadius: 20, height: 22, position: "relative", overflow: "visible", border: "2px solid #7dd3fc" }}>
          <div style={{
            width: `${waterLevel}%`, height: "100%",
            background: "linear-gradient(90deg, #0ea5e9, #38bdf8, #7dd3fc)",
            borderRadius: 20, transition: "width 0.6s ease", position: "relative",
          }}>
            <div style={{ position: "absolute", inset: 0, borderRadius: 20, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)", animation: "shimmer 1.5s linear infinite" }} />
          </div>
          {/* Water drop character */}
          <div style={{
            position: "absolute", top: "50%",
            left: `${characterPos}%`,
            transform: "translate(-50%, -50%)",
            fontSize: 24, zIndex: 5, transition: "left 0.6s ease",
            animation: dropAnim ? "wbounce 0.5s ease" : "wfloat 2s ease-in-out infinite",
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
          }}>💧</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
          <span style={{ color: "#0369a1", fontSize: 10, fontWeight: 800 }}>🏔️ Source</span>
          <span style={{ color: "#0369a1", fontSize: 10, fontWeight: 800 }}>🚰 Village</span>
        </div>
      </div>

      {/* Question */}
      <div style={{ background: "rgba(255,255,255,0.9)", border: "3px solid #fbbf24", borderRadius: 14, padding: "14px 18px", margin: "10px 16px", textAlign: "center", boxShadow: "0 4px 16px rgba(251,191,36,0.25)" }}>
        <p style={{ fontSize: 16, fontWeight: 800, color: "#111827", margin: 0, lineHeight: 1.4 }}>{currentQ.questionText}</p>
        {currentQ.hint && !answered && <p style={{ fontSize: 12, color: "#6b7280", margin: "6px 0 0" }}>💡 {currentQ.hint}</p>}
      </div>

      {/* Feedback */}
      {feedback && (
        <div style={{
          margin: "0 16px 8px", padding: "10px 16px", borderRadius: 10,
          background: feedback.correct ? "#dcfce7" : "#fee2e2",
          border: `2px solid ${feedback.correct ? "#16a34a" : "#dc2626"}`,
          color: feedback.correct ? "#15803d" : "#991b1b",
          fontWeight: 800, fontSize: 13, textAlign: "center", animation: "fadeIn 0.3s ease",
        }}>{feedback.text}</div>
      )}

      {/* Answer options */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, padding: "0 16px 16px" }}>
        {currentQ.options.map((opt, i) => {
          const isSel  = selected === opt;
          const isCorr = opt === currentQ.correctAnswer;
          let bg = OPTION_BG[i], border = OPTION_BORDER[i], color = OPTION_TEXT[i];
          if (answered) {
            if (isCorr)              { bg = "#dcfce7"; border = "#16a34a"; color = "#15803d"; }
            else if (isSel && !isCorr){ bg = "#fee2e2"; border = "#dc2626"; color = "#991b1b"; }
          }
          return (
            <button key={i} onClick={() => handleAnswer(opt)} disabled={answered} style={{
              padding: "14px 12px", borderRadius: 14, cursor: answered ? "default" : "pointer",
              background: bg, border: `3px solid ${border}`, color,
              fontSize: 13, fontWeight: 800, fontFamily: "'Nunito', sans-serif",
              textAlign: "center", transition: "all 0.2s", lineHeight: 1.3,
              display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
              boxShadow: `0 4px 12px ${border}44`,
            }}
              onMouseEnter={e => !answered && (e.currentTarget.style.transform = "scale(1.04)")}
              onMouseLeave={e => !answered && (e.currentTarget.style.transform = "scale(1)")}
            >
              <span style={{ fontSize: 22 }}>{OPTION_DROPS[i]}</span>
              <span>{opt}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const fullScreen = {
  minHeight: "100vh",
  background: "linear-gradient(135deg,#fef9c3 0%,#fce7f3 30%,#e0f2fe 60%,#d1fae5 100%)",
  display: "flex", flexDirection: "column", fontFamily: "'Nunito', sans-serif"
};
const card       = { margin: "auto", maxWidth: 420, width: "100%", padding: "32px 24px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" };
const ava        = (s) => ({ width: s, height: s, borderRadius: "50%", border: "4px solid #0ea5e9", background: "#e0f2fe", flexShrink: 0 });
const titleS     = { fontSize: 32, color: "#111827", margin: "12px 0 8px", fontFamily: "'Fredoka One', cursive" };
const subS       = { color: "#374151", fontSize: 14, margin: "0 0 6px", fontWeight: 700 };
const pillsRow   = { display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: 20 };
const pl         = (c) => ({ padding: "5px 14px", borderRadius: 20, background: "#fff", border: `2px solid ${c}`, color: c, fontSize: 12, fontWeight: 800, boxShadow: `0 2px 8px ${c}44` });
const btn        = (c) => ({ padding: "14px 32px", background: c, color: "#fff", fontSize: 16, fontWeight: 900, border: "none", borderRadius: 16, cursor: "pointer", fontFamily: "'Nunito', sans-serif", boxShadow: `0 4px 20px ${c}66` });

const CSS = `
  @keyframes wfloat  { 0%,100% { transform:translateY(0);          } 50% { transform:translateY(-10px); } }
  @keyframes wbounce { 0%,100% { transform:translate(-50%,-50%) scale(1); } 50% { transform:translate(-50%,-50%) scale(1.5); } }
  @keyframes pulse   { 0%,100% { transform:scale(1); }              50% { transform:scale(1.15); } }
  @keyframes fadeIn  { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
  @keyframes shimmer { 0% { transform:translateX(-100%); } 100% { transform:translateX(200%); } }
`;