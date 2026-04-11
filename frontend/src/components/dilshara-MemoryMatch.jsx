import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// ─────────────────────────────────────────────────────────────────────────────
//  CARD LIBRARY
// ─────────────────────────────────────────────────────────────────────────────
const CARD_LIBRARY = {
  "safe-drinking-water": [
    { word: "Boil Water",    icon: "♨️" }, { word: "Clean Cup",       icon: "🥤" },
    { word: "Filter",        icon: "🔽" }, { word: "Well",             icon: "🪣" },
    { word: "Tap Water",     icon: "🚰" }, { word: "Safe to Drink",   icon: "✅" },
    { word: "River Water",   icon: "🏞️" }, { word: "Rain Water",      icon: "🌧️" },
    { word: "Clear Water",   icon: "💎" }, { word: "Water Bottle",    icon: "🍶" },
  ],
  "hand-washing-and-personal-hygiene": [
    { word: "Soap",          icon: "🧼" }, { word: "Towel",            icon: "🧻" },
    { word: "Toothbrush",    icon: "🪥" }, { word: "Germs",            icon: "🦠" },
    { word: "Clean Hands",   icon: "🙌" }, { word: "Nail Brush",       icon: "💅" },
    { word: "Sanitizer",     icon: "💊" }, { word: "Bath",             icon: "🛁" },
    { word: "Shampoo",       icon: "🧴" }, { word: "Comb",             icon: "🪮" },
  ],
  "toilet-and-sanpracticesitation-practices": [
    { word: "Toilet",        icon: "🚽" }, { word: "Flush",            icon: "💦" },
    { word: "Wash After",    icon: "🧼" }, { word: "Outdoor",          icon: "⛺" },
    { word: "Sewage",        icon: "🕳️" }, { word: "Toilet Paper",    icon: "🧻" },
    { word: "Pit Latrine",   icon: "⬛" }, { word: "Clean Toilet",    icon: "✨" },
    { word: "Drain",         icon: "🌀" }, { word: "Hygiene",          icon: "🏅" },
  ],
  "water-borne-diseases-and-prevention": [
    { word: "Cholera",       icon: "⚠️" }, { word: "Diarrhoea",       icon: "🤒" },
    { word: "Mosquito",      icon: "🦟" }, { word: "Vaccine",          icon: "💉" },
    { word: "Dirty Water",   icon: "🚫" }, { word: "Boil First",       icon: "♨️" },
    { word: "Typhoid",       icon: "🌡️" }, { word: "Prevention",      icon: "🛡️" },
    { word: "Doctor",        icon: "👨‍⚕️"}, { word: "Clean Water",    icon: "💧" },
  ],
  "water-conservation-and-environment-care": [
    { word: "Save Water",    icon: "💧" }, { word: "Fix Leak",         icon: "🔧" },
    { word: "Rain Harvest",  icon: "🌧️" }, { word: "Tree Planting",   icon: "🌳" },
    { word: "Short Shower",  icon: "🚿" }, { word: "Turn Off Tap",    icon: "🚰" },
    { word: "Ocean",         icon: "🌊" }, { word: "Recycle",          icon: "♻️" },
    { word: "Clean River",   icon: "🏞️" }, { word: "Fresh Water",     icon: "🥤" },
  ],
  default: [
    { word: "Clean Water",   icon: "💧" }, { word: "Wash Hands",       icon: "🧼" },
    { word: "Toilet",        icon: "🚽" }, { word: "Germs",            icon: "🦠" },
    { word: "Rain",          icon: "🌧️" }, { word: "River",            icon: "🏞️" },
    { word: "Filter",        icon: "🔽" }, { word: "Safe to Drink",   icon: "✅" },
    { word: "Boil Water",    icon: "♨️" }, { word: "Tap Water",       icon: "🚰" },
  ],
};

function getPairs(topicId, count = 6) {
  const pool = CARD_LIBRARY[topicId] || CARD_LIBRARY.default;
  return [...pool].sort(() => Math.random() - 0.5).slice(0, Math.min(count, pool.length));
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildCards(pairs) {
  const cards = [];
  pairs.forEach((pair, i) => {
    cards.push({ id: `w${i}`, pairId: i, type: "word",  content: pair.word });
    cards.push({ id: `e${i}`, pairId: i, type: "emoji", content: pair.icon });
  });
  return shuffle(cards);
}

// Bright, child-friendly pair colors
const PAIR_COLORS = ["#f43f5e","#f59e0b","#10b981","#ec4899","#8b5cf6","#0ea5e9","#22c55e","#ef4444"];

const AVATAR_URL = (seed) =>
  `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4`;

const FONT_LINK = "https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;700;800;900&display=swap";

// ─────────────────────────────────────────────────────────────────────────────
export default function MemoryMatch({ game, username, onFinish, onNavigateBack }) {
  const navigate = useNavigate();
  
  // Navigate back to game selection page
  const handleGoBack = () => {
    if (onNavigateBack) {
      onNavigateBack();
    } else {
      navigate(-1);
    }
  };
  
  const pairCount = game.difficulty === "hard" ? 8 : game.difficulty === "medium" ? 6 : 4;
  const topicId   = game.topicId || "default";

  const [phase, setPhase]     = useState("intro");
  const [cards, setCards]     = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves]     = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [canFlip, setCanFlip] = useState(true);
  const [wrongPair, setWrongPair] = useState([]);
  const [lastMatch, setLastMatch] = useState(null);

  const totalPairs = pairCount;
  const isWon = matched.length === totalPairs;

  useEffect(() => {
    if (phase !== "playing" || isWon) return;
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(t);
  }, [phase, isWon, startTime]);

  useEffect(() => {
    if (phase === "playing" && isWon) setTimeout(() => setPhase("result"), 900);
  }, [matched, phase]);

  const initGame = () => {
    const pairs = getPairs(topicId, pairCount);
    setCards(buildCards(pairs));
    setFlipped([]); setMatched([]); setMoves(0);
    setWrongPair([]); setCanFlip(true); setLastMatch(null);
    setStartTime(Date.now()); setElapsed(0);
    setPhase("playing");
  };

  const handleFlip = (card) => {
    if (!canFlip) return;
    if (matched.includes(card.pairId)) return;
    if (flipped.find(c => c.id === card.id)) return;
    if (flipped.length === 2) return;

    const newFlipped = [...flipped, card];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      setCanFlip(false);
      if (newFlipped[0].pairId === newFlipped[1].pairId) {
        setLastMatch(newFlipped[0].pairId);
        setTimeout(() => {
          setMatched(m => [...m, newFlipped[0].pairId]);
          setFlipped([]); setCanFlip(true); setLastMatch(null);
        }, 700);
      } else {
        setWrongPair(newFlipped.map(c => c.id));
        setTimeout(() => { setFlipped([]); setWrongPair([]); setCanFlip(true); }, 950);
      }
    }
  };

  const calcScore = () => {
    const extra = Math.max(0, moves - totalPairs);
    return Math.max(20, 100 - extra * 2);
  };

  const finalScore = phase === "result" ? calcScore() : 0;
  const stars = finalScore >= 85 ? 3 : finalScore >= 60 ? 2 : 1;

  const gridCols = "repeat(4, 1fr)";

  // ── INTRO ─────────────────────────────────────────────────────────────────
  if (phase === "intro") return (
    <div style={screen}>
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
      
      <div style={cardS}>
        <div style={{ fontSize: 60, animation: "mspin 4s linear infinite" }}>🃏</div>
        <img src={AVATAR_URL(username)} alt="avatar" style={ava(100)} />
        <h1 style={titleS}>Memory Match!</h1>
        <p style={subS}>Hi <strong style={{ color: "#8b5cf6" }}>{username}</strong>! Flip cards to find matching pairs!</p>
        <p style={{ color: "#374151", fontSize: 12, margin: "0 0 6px", textAlign: "center", maxWidth: 280, fontWeight: 700 }}>
          Topic: <strong style={{ color: "#7c3aed" }}>{game.topicName || game.title}</strong>
        </p>
        <p style={{ color: "#6b7280", fontSize: 13, textAlign: "center", maxWidth: 280, margin: "0 0 20px" }}>
          Match water & hygiene words to their pictures. Fewer moves = higher score! 🌟
        </p>
        <div style={pills}>
          <span style={pl("#8b5cf6")}>🃏 {totalPairs * 2} Cards</span>
          <span style={pl("#10b981")}>🎯 {totalPairs} Pairs</span>
          <span style={pl("#f59e0b")}>⭐ Stars to earn</span>
        </div>
        <button onClick={initGame} style={btn("#8b5cf6")}>🎮 Start Matching!</button>
      </div>
    </div>
  );

  // ── RESULT ────────────────────────────────────────────────────────────────
  if (phase === "result") return (
    <div style={screen}>
      <link rel="stylesheet" href={FONT_LINK} />
      <style>{CSS}</style>
      <div style={cardS}>
        <img src={AVATAR_URL(username)} alt="avatar" style={ava(90)} />
        <div style={{ display: "flex", gap: 4, margin: "8px 0", fontSize: 40 }}>
          {[...Array(3)].map((_, i) => (
            <span key={i} style={{ opacity: i < stars ? 1 : 0.2, animation: i < stars ? `starPop 0.4s ease ${i * 0.15}s both` : "none" }}>⭐</span>
          ))}
        </div>
        <h2 style={{ ...titleS, fontSize: 26, color: stars >= 2 ? "#16a34a" : "#d97706" }}>
          {stars === 3 ? "Perfect Match! 🎉" : stars === 2 ? "Well done! 👏" : "Good try! 💪"}
        </h2>
        <div style={{ fontSize: 52, fontWeight: 900, color: "#8b5cf6", margin: "4px 0" }}>{finalScore}</div>
        <p style={{ color: "#6b7280", margin: "0 0 6px" }}>points</p>
        <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
          <div style={stat}><span style={{ fontSize: 22 }}>🔄</span><span style={{ color: "#111827", fontWeight: 800 }}>{moves} moves</span></div>
          <div style={stat}><span style={{ fontSize: 22 }}>⏱</span><span style={{ color: "#111827", fontWeight: 800 }}>{elapsed}s</span></div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={initGame} style={btn("#8b5cf6")}>🔄 Play Again</button>
          <button onClick={() => onFinish(finalScore, 100, finalScore, finalScore >= 60)} style={{ ...btn("#3b82f6") }}>🏠 Back</button>
        </div>
      </div>
    </div>
  );

  // ── PLAYING ───────────────────────────────────────────────────────────────
  return (
    <div style={screen}>
      <link rel="stylesheet" href={FONT_LINK} />
      <style>{CSS}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", padding: "10px 16px", borderBottom: "3px solid #e5e7eb", gap: 10, background: "rgba(255,255,255,0.85)", backdropFilter: "blur(10px)" }}>
        <img src={AVATAR_URL(username)} alt="avatar" style={ava(36)} />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#8b5cf6", fontWeight: 800, fontSize: 13, fontFamily: "'Fredoka One', cursive" }}>🃏 Memory Match</span>
            <span style={{ color: "#d97706", fontSize: 12, fontWeight: 800 }}>⏱ {elapsed}s</span>
          </div>
        </div>
        <div style={{ background: "#f3f4f6", border: "2px solid #e5e7eb", borderRadius: 10, padding: "4px 10px", color: "#374151", fontSize: 12, fontWeight: 800 }}>
          {matched.length}/{totalPairs} pairs
        </div>
        {/* Pause button */}
        <button onClick={handleGoBack} style={{
          padding: "6px 12px", background: "linear-gradient(135deg,#f59e0b,#fbbf24)",
          border: "none", borderRadius: 10, color: "#fff", fontSize: 12,
          cursor: "pointer", fontFamily: "'Nunito',sans-serif", fontWeight: 800,
          boxShadow: "0 2px 8px rgba(245,158,11,0.3)",
        }}>⏸ Pause</button>
      </div>

      {/* Stats bar */}
      <div style={{ textAlign: "center", padding: "6px 0", color: "#6b7280", fontSize: 12, fontWeight: 700 }}>
        Moves: <strong style={{ color: "#8b5cf6" }}>{moves}</strong>
        {" · "}
        Matched: <strong style={{ color: "#10b981" }}>{matched.length}</strong>/{totalPairs}
      </div>

      {/* Progress bar */}
      <div style={{ padding: "0 16px 8px" }}>
        <div style={{ background: "#e5e7eb", borderRadius: 20, height: 8 }}>
          <div style={{ width: `${(matched.length / totalPairs) * 100}%`, height: "100%", background: "linear-gradient(90deg, #8b5cf6, #ec4899, #f59e0b)", borderRadius: 20, transition: "width 0.4s" }} />
        </div>
      </div>

      {/* Card grid */}
      <div style={{ display: "grid", gridTemplateColumns: gridCols, gap: 10, padding: "4px 16px 16px", flex: 1 }}>
        {cards.map(card => {
          const isFaceUp  = flipped.find(c => c.id === card.id) || matched.includes(card.pairId);
          const isMatched = matched.includes(card.pairId);
          const isWrong   = wrongPair.includes(card.id);
          const isNew     = lastMatch === card.pairId;
          const color     = PAIR_COLORS[card.pairId % PAIR_COLORS.length];

          return (
            <div
              key={card.id}
              onClick={() => !isFaceUp && handleFlip(card)}
              style={{ aspectRatio: "1 / 1.2", borderRadius: 14, cursor: isFaceUp ? "default" : "pointer", perspective: 600 }}
            >
              <div style={{
                width: "100%", height: "100%", position: "relative",
                transformStyle: "preserve-3d", transition: "transform 0.35s ease",
                transform: isFaceUp ? "rotateY(180deg)" : "rotateY(0deg)",
                animation: isWrong ? "mshake 0.5s ease" : isNew ? "matchPop 0.4s ease" : "none",
              }}>
                {/* Back face */}
                <div style={{
                  position: "absolute", inset: 0, backfaceVisibility: "hidden",
                  borderRadius: 14,
                  background: "linear-gradient(135deg,#8b5cf6,#ec4899)",
                  border: "3px solid #7c3aed",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30,
                  boxShadow: "0 4px 12px rgba(139,92,246,0.4)",
                }}>❓</div>

                {/* Front face */}
                <div style={{
                  position: "absolute", inset: 0, backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)", borderRadius: 14,
                  background: isMatched
                    ? `linear-gradient(135deg, ${color}44, ${color}22)`
                    : "#fff",
                  border: `3px solid ${isMatched ? color : "#e5e7eb"}`,
                  display: "flex", flexDirection: "column", alignItems: "center",
                  justifyContent: "center", padding: 6, gap: 4,
                  boxShadow: isMatched ? `0 0 20px ${color}66` : "0 2px 8px rgba(0,0,0,0.08)",
                }}>
                  {card.type === "emoji"
                    ? <span style={{ fontSize: 30 }}>{card.content}</span>
                    : <span style={{
                        fontSize: 10, fontWeight: 900,
                        color: isMatched ? color : "#374151",
                        textAlign: "center", lineHeight: 1.2,
                      }}>{card.content}</span>
                  }
                  {isMatched && <span style={{ fontSize: 16 }}>✓</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const screen = {
  minHeight: "100vh",
  background: "linear-gradient(135deg,#fef9c3 0%,#fce7f3 30%,#e0f2fe 60%,#d1fae5 100%)",
  display: "flex", flexDirection: "column", fontFamily: "'Nunito', sans-serif"
};
const cardS  = { margin: "auto", maxWidth: 400, width: "100%", padding: "28px 24px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" };
const ava    = (s) => ({ width: s, height: s, borderRadius: "50%", border: "4px solid #8b5cf6", background: "#ede9fe", flexShrink: 0 });
const titleS = { fontSize: 32, color: "#111827", margin: "10px 0 6px", fontFamily: "'Fredoka One', cursive" };
const subS   = { color: "#374151", fontSize: 14, margin: "0 0 6px", fontWeight: 700 };
const pills  = { display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: 20 };
const pl     = (c) => ({ padding: "5px 14px", borderRadius: 20, background: "#fff", border: `2px solid ${c}`, color: c, fontSize: 12, fontWeight: 800, boxShadow: `0 2px 8px ${c}44` });
const btn    = (c) => ({ padding: "13px 28px", background: c, color: "#fff", fontSize: 15, fontWeight: 900, border: "none", borderRadius: 14, cursor: "pointer", fontFamily: "'Nunito', sans-serif", boxShadow: `0 4px 16px ${c}55` });
const stat   = { display: "flex", flexDirection: "column", alignItems: "center", gap: 4, background: "#fff", border: "2px solid #e5e7eb", borderRadius: 12, padding: "10px 18px" };

const CSS = `
  @keyframes mspin   { 0% { transform:rotateY(0deg); }   100% { transform:rotateY(360deg); } }
  @keyframes mshake  { 0%,100% { transform:translateX(0); } 20%,60% { transform:translateX(-6px); } 40%,80% { transform:translateX(6px); } }
  @keyframes matchPop { 0% { transform:scale(1); } 50% { transform:scale(1.12); } 100% { transform:scale(1); } }
  @keyframes starPop { 0% { transform:scale(0) rotate(-20deg); opacity:0; } 80% { transform:scale(1.2); } 100% { transform:scale(1); opacity:1; } }
  @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
`;