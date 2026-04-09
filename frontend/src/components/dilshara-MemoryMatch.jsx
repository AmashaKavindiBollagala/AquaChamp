import { useState, useEffect } from "react";

// ─────────────────────────────────────────────────────────────────────────────
//  CARD LIBRARY  — topic-specific word + icon pairs
//  Expanded to 10 pairs per topic so games have variety
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
  // Shuffle and pick `count` pairs
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

const PAIR_COLORS = ["#3b82f6","#10b981","#f59e0b","#ec4899","#8b5cf6","#ef4444","#06b6d4","#84cc16"];

const AVATAR_URL = (seed) =>
  `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4`;

const FONT_LINK = "https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;700;800;900&display=swap";

// ─────────────────────────────────────────────────────────────────────────────
export default function MemoryMatch({ game, username, onFinish }) {
  // Pair count: easy=4, medium=6, hard=8
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

  // Score: starts at 100, deduct 2 per extra move beyond minimum
  const calcScore = () => {
    const extra = Math.max(0, moves - totalPairs);
    return Math.max(20, 100 - extra * 2);
  };

  const finalScore = phase === "result" ? calcScore() : 0;
  const stars = finalScore >= 85 ? 3 : finalScore >= 60 ? 2 : 1;

  // Determine grid columns based on pair count
  const gridCols = pairCount <= 4 ? "repeat(4, 1fr)" : pairCount <= 6 ? "repeat(4, 1fr)" : "repeat(4, 1fr)";

  // ── INTRO ─────────────────────────────────────────────────────────────────
  if (phase === "intro") return (
    <div style={screen}>
      <link rel="stylesheet" href={FONT_LINK} />
      <style>{CSS}</style>
      <div style={cardS}>
        <div style={{ fontSize: 56, animation: "mspin 4s linear infinite" }}>🃏</div>
        <img src={AVATAR_URL(username)} alt="avatar" style={ava(100)} />
        <h1 style={titleS}>Memory Match!</h1>
        <p style={subS}>Hi <strong style={{ color: "#a78bfa" }}>{username}</strong>! Flip cards to find matching pairs!</p>
        <p style={{ color: "#64748b", fontSize: 12, margin: "0 0 6px", textAlign: "center", maxWidth: 280 }}>
          Topic: <strong style={{ color: "#94a3b8" }}>{game.topicName || game.title}</strong>
        </p>
        <p style={{ color: "#94a3b8", fontSize: 13, textAlign: "center", maxWidth: 280, margin: "0 0 20px" }}>
          Match water & hygiene words to their pictures. Fewer moves = higher score! 🌟
        </p>
        <div style={pills}>
          <span style={pl("#a78bfa")}>🃏 {totalPairs * 2} Cards</span>
          <span style={pl("#34d399")}>🎯 {totalPairs} Pairs</span>
          <span style={pl("#f59e0b")}>⭐ Stars to earn</span>
        </div>
        <button onClick={initGame} style={btn("#7c3aed")}>🎮 Start Matching!</button>
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
        <div style={{ display: "flex", gap: 4, margin: "8px 0", fontSize: 36 }}>
          {[...Array(3)].map((_, i) => (
            <span key={i} style={{ opacity: i < stars ? 1 : 0.2, animation: i < stars ? `starPop 0.4s ease ${i * 0.15}s both` : "none" }}>⭐</span>
          ))}
        </div>
        <h2 style={{ ...titleS, fontSize: 24, color: stars >= 2 ? "#4ade80" : "#f59e0b" }}>
          {stars === 3 ? "Perfect Match! 🎉" : stars === 2 ? "Well done! 👏" : "Good try! 💪"}
        </h2>
        <div style={{ fontSize: 50, fontWeight: 900, color: "#fff", margin: "4px 0" }}>{finalScore}</div>
        <p style={{ color: "#94a3b8", margin: "0 0 6px" }}>points</p>
        <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
          <div style={stat}><span style={{ color: "#a78bfa", fontSize: 22 }}>🔄</span><span style={{ color: "#f1f5f9", fontWeight: 700 }}>{moves} moves</span></div>
          <div style={stat}><span style={{ color: "#34d399", fontSize: 22 }}>⏱</span><span style={{ color: "#f1f5f9", fontWeight: 700 }}>{elapsed}s</span></div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={initGame} style={btn("#7c3aed")}>🔄 Play Again</button>
          <button onClick={() => onFinish(finalScore, 100, finalScore, finalScore >= 60)} style={{ ...btn("#3b82f6"), background: "#1e3a5f" }}>🏠 Back</button>
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
      <div style={{ display: "flex", alignItems: "center", padding: "10px 16px", borderBottom: "1px solid #2d1f4a", gap: 10 }}>
        <img src={AVATAR_URL(username)} alt="avatar" style={ava(36)} />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#a78bfa", fontWeight: 700, fontSize: 13 }}>🃏 Memory Match</span>
            <span style={{ color: "#f59e0b", fontSize: 12 }}>⏱ {elapsed}s</span>
          </div>
        </div>
        <div style={{ background: "#2d1f4a", borderRadius: 10, padding: "4px 10px", color: "#f1f5f9", fontSize: 12, fontWeight: 700 }}>
          {matched.length}/{totalPairs} pairs
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ textAlign: "center", padding: "6px 0", color: "#64748b", fontSize: 12 }}>
        Moves: <strong style={{ color: "#a78bfa" }}>{moves}</strong>
        {" · "}
        Matched: <strong style={{ color: "#34d399" }}>{matched.length}</strong>/{totalPairs}
        {" · "}
        <span style={{ color: "#64748b" }}>Topic: </span>
        <strong style={{ color: "#7baed4", fontSize: 11 }}>{game.topicName || game.title}</strong>
      </div>

      {/* Progress bar */}
      <div style={{ padding: "0 16px 8px" }}>
        <div style={{ background: "#1a0a35", borderRadius: 20, height: 6 }}>
          <div style={{ width: `${(matched.length / totalPairs) * 100}%`, height: "100%", background: "linear-gradient(90deg, #7c3aed, #a78bfa)", borderRadius: 20, transition: "width 0.4s" }} />
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
                {/* Back face (hidden) */}
                <div style={{
                  position: "absolute", inset: 0, backfaceVisibility: "hidden",
                  borderRadius: 14,
                  background: "linear-gradient(135deg, #2d1f4a, #1a1035)",
                  border: "2px solid #4c1d95",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28,
                }}>❓</div>

                {/* Front face */}
                <div style={{
                  position: "absolute", inset: 0, backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)", borderRadius: 14,
                  background: isMatched
                    ? `linear-gradient(135deg, ${color}33, ${color}11)`
                    : "linear-gradient(135deg, #1e1035, #0f0a2a)",
                  border: `2px solid ${isMatched ? color : "#4c1d95"}`,
                  display: "flex", flexDirection: "column", alignItems: "center",
                  justifyContent: "center", padding: 6, gap: 4,
                  boxShadow: isMatched ? `0 0 16px ${color}44` : "none",
                }}>
                  {card.type === "emoji"
                    ? <span style={{ fontSize: 28 }}>{card.content}</span>
                    : <span style={{
                        fontSize: 10, fontWeight: 800,
                        color: isMatched ? color : "#e2e8f0",
                        textAlign: "center", lineHeight: 1.2,
                      }}>{card.content}</span>
                  }
                  {isMatched && <span style={{ fontSize: 14 }}>✓</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const screen = { minHeight: "100vh", background: "#0a0520", display: "flex", flexDirection: "column", fontFamily: "'Nunito', sans-serif" };
const cardS  = { margin: "auto", maxWidth: 400, width: "100%", padding: "28px 24px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" };
const ava    = (s) => ({ width: s, height: s, borderRadius: "50%", border: "3px solid #7c3aed", background: "#1a0a35", flexShrink: 0 });
const titleS = { fontSize: 30, color: "#f1f5f9", margin: "10px 0 6px", fontFamily: "'Fredoka One', cursive" };
const subS   = { color: "#94a3b8", fontSize: 14, margin: "0 0 6px" };
const pills  = { display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: 20 };
const pl     = (c) => ({ padding: "4px 12px", borderRadius: 20, background: c + "22", border: `1px solid ${c}`, color: c, fontSize: 12, fontWeight: 700 });
const btn    = (c) => ({ padding: "13px 28px", background: c, color: "#fff", fontSize: 15, fontWeight: 800, border: "none", borderRadius: 14, cursor: "pointer", fontFamily: "'Nunito', sans-serif", boxShadow: `0 4px 16px ${c}55` });
const stat   = { display: "flex", flexDirection: "column", alignItems: "center", gap: 2, background: "#1a0a35", borderRadius: 10, padding: "8px 16px" };

const CSS = `
  @keyframes mspin   { 0% { transform:rotateY(0deg); }   100% { transform:rotateY(360deg); } }
  @keyframes mshake  { 0%,100% { transform:translateX(0); } 20%,60% { transform:translateX(-6px); } 40%,80% { transform:translateX(6px); } }
  @keyframes matchPop { 0% { transform:scale(1); } 50% { transform:scale(1.12); } 100% { transform:scale(1); } }
  @keyframes starPop { 0% { transform:scale(0) rotate(-20deg); opacity:0; } 80% { transform:scale(1.2); } 100% { transform:scale(1); opacity:1; } }
  @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
`;