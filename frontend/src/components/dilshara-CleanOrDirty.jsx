

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";


//  ITEM LIBRARY  — keyed by topicId

const ITEM_LIBRARY = {
  "safe-drinking-water": [
    { id: 1,  label: "Boiled water",      icon: "♨️",  correct: "clean"  },
    { id: 2,  label: "Muddy river water", icon: "🟫",  correct: "dirty"  },
    { id: 3,  label: "Filtered water",    icon: "🔽",  correct: "clean"  },
    { id: 4,  label: "Stagnant puddle",   icon: "🪣",  correct: "dirty"  },
    { id: 5,  label: "Tap water",         icon: "🚰",  correct: "clean"  },
    { id: 6,  label: "Pond water",        icon: "🏞️",  correct: "dirty"  },
    { id: 7,  label: "Bottled water",     icon: "🍶",  correct: "clean"  },
    { id: 8,  label: "Smelly water",      icon: "💀",  correct: "dirty"  },
    { id: 9,  label: "Clear tap water",   icon: "💎",  correct: "clean"  },
    { id: 10, label: "Open drain water",  icon: "🕳️",  correct: "dirty"  },
  ],
  "hand-washing-and-personal-hygiene": [
    { id: 1,  label: "Washed hands",      icon: "🙌",  correct: "clean"  },
    { id: 2,  label: "Muddy hands",       icon: "🤲",  correct: "dirty"  },
    { id: 3,  label: "Soap + water",      icon: "🧼",  correct: "clean"  },
    { id: 4,  label: "Hands after toilet",icon: "🚽",  correct: "dirty"  },
    { id: 5,  label: "Brushed teeth",     icon: "🪥",  correct: "clean"  },
    { id: 6,  label: "Dirty nails",       icon: "💅",  correct: "dirty"  },
    { id: 7,  label: "Clean towel",       icon: "🧻",  correct: "clean"  },
    { id: 8,  label: "Unwashed hands",    icon: "🤚",  correct: "dirty"  },
    { id: 9,  label: "Hand sanitizer",    icon: "💊",  correct: "clean"  },
    { id: 10, label: "After touching rubbish", icon: "🗑️", correct: "dirty" },
  ],
  "toilet-and-sanpracticesitation-practices": [
    { id: 1,  label: "Flushed toilet",    icon: "✅",  correct: "clean"  },
    { id: 2,  label: "Open latrine",      icon: "⛔",  correct: "dirty"  },
    { id: 3,  label: "Covered toilet",    icon: "🚽",  correct: "clean"  },
    { id: 4,  label: "Waste in open",     icon: "⚠️",  correct: "dirty"  },
    { id: 5,  label: "Washed after toilet", icon: "🧼", correct: "clean" },
    { id: 6,  label: "Unflushed toilet",  icon: "🚫",  correct: "dirty"  },
    { id: 7,  label: "Clean bathroom",    icon: "✨",  correct: "clean"  },
    { id: 8,  label: "Open drain",        icon: "🕳️",  correct: "dirty"  },
    { id: 9,  label: "Toilet paper",      icon: "🧻",  correct: "clean"  },
    { id: 10, label: "Sewage overflow",   icon: "💢",  correct: "dirty"  },
  ],
  "water-borne-diseases-and-prevention": [
    { id: 1,  label: "Boiled water",      icon: "♨️",  correct: "clean"  },
    { id: 2,  label: "Stagnant water",    icon: "🦟",  correct: "dirty"  },
    { id: 3,  label: "Vaccine",           icon: "💉",  correct: "clean"  },
    { id: 4,  label: "Dirty cup",         icon: "🥤",  correct: "dirty"  },
    { id: 5,  label: "Washed hands",      icon: "🙌",  correct: "clean"  },
    { id: 6,  label: "Cholera water",     icon: "☣️",  correct: "dirty"  },
    { id: 7,  label: "Filtered water",    icon: "🔽",  correct: "clean"  },
    { id: 8,  label: "Mosquito breeding", icon: "🪣",  correct: "dirty"  },
    { id: 9,  label: "ORS solution",      icon: "💊",  correct: "clean"  },
    { id: 10, label: "Open food + flies", icon: "🪰",  correct: "dirty"  },
  ],
  "water-conservation-and-environment-care": [
    { id: 1,  label: "Fixed leaking tap", icon: "🔧",  correct: "clean"  },
    { id: 2,  label: "Rubbish in river",  icon: "🗑️",  correct: "dirty"  },
    { id: 3,  label: "Rain harvesting",   icon: "🌧️",  correct: "clean"  },
    { id: 4,  label: "Oil in drain",      icon: "🛢️",  correct: "dirty"  },
    { id: 5,  label: "Tree planting",     icon: "🌳",  correct: "clean"  },
    { id: 6,  label: "Plastic in ocean",  icon: "🌊",  correct: "dirty"  },
    { id: 7,  label: "Short shower",      icon: "🚿",  correct: "clean"  },
    { id: 8,  label: "Tap left open",     icon: "💦",  correct: "dirty"  },
    { id: 9,  label: "Recycling water",   icon: "♻️",  correct: "clean"  },
    { id: 10, label: "Chemical in lake",  icon: "⚗️",  correct: "dirty"  },
  ],
};

const DEFAULT_ITEMS = ITEM_LIBRARY["safe-drinking-water"];

function getItems(topicId, difficulty) {
  const pool = ITEM_LIBRARY[topicId] || DEFAULT_ITEMS;
  const count = difficulty === "hard" ? 10 : difficulty === "medium" ? 8 : 6;
  return [...pool].sort(() => Math.random() - 0.5).slice(0, count);
}

// 
const AVATAR_URL = (seed) =>
  `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4`;

const FONT_LINK = "https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;700;800;900&display=swap";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;700;800;900&display=swap');
  * { box-sizing: border-box; }
  @keyframes popIn     { 0%{transform:scale(0.4) rotate(-8deg);opacity:0;} 75%{transform:scale(1.12);} 100%{transform:scale(1);opacity:1;} }
  @keyframes float     { 0%,100%{transform:translateY(0) rotate(-2deg);} 50%{transform:translateY(-10px) rotate(2deg);} }
  @keyframes shake     { 0%,100%{transform:translateX(0);} 20%,60%{transform:translateX(-8px);} 40%,80%{transform:translateX(8px);} }
  @keyframes binPulse  { 0%,100%{transform:scale(1);} 50%{transform:scale(1.08);} }
  @keyframes fadeUp    { from{opacity:0;transform:translateY(16px);} to{opacity:1;transform:translateY(0);} }
  @keyframes bounce    { 0%,100%{transform:scale(1);} 50%{transform:scale(1.18) rotate(5deg);} }
  @keyframes confetti  { 0%{transform:translateY(-20px) rotate(0deg);opacity:1;} 100%{transform:translateY(120px) rotate(720deg);opacity:0;} }
  @keyframes rainbowBg { 0%{background-position:0% 50%;} 50%{background-position:100% 50%;} 100%{background-position:0% 50%;} }
  @keyframes wriggle   { 0%,100%{transform:rotate(-3deg);} 50%{transform:rotate(3deg);} }

  .item-card {
    cursor: grab;
    user-select: none;
    touch-action: none;
    transition: transform 0.15s, box-shadow 0.15s;
  }
  .item-card:hover { transform: scale(1.07) rotate(2deg) !important; }
  .item-card:active { cursor: grabbing; transform: scale(1.12) rotate(3deg) !important; }
  .bin-zone { transition: transform 0.2s, box-shadow 0.2s, background 0.2s; }
  .bin-zone.dragover { transform: scale(1.04); }
`;

//
//  DRAGGABLE ITEM CARD

function ItemCard({ item, onDrop, sorted, animIdx }) {
  const cardRef = useRef(null);

  //  Touch drag state 
  const touchStartRef = useRef(null);
  const cloneRef      = useRef(null);

  const handleTouchStart = (e) => {
    if (sorted) return;
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };

    // Create floating clone for visual feedback
    const rect = cardRef.current.getBoundingClientRect();
    const clone = cardRef.current.cloneNode(true);
    clone.style.cssText = `
      position: fixed;
      width: ${rect.width}px;
      height: ${rect.height}px;
      left: ${rect.left}px;
      top: ${rect.top}px;
      opacity: 0.85;
      pointer-events: none;
      z-index: 9999;
      transform: scale(1.1) rotate(5deg);
      transition: none;
      border-radius: 20px;
      box-shadow: 0 12px 30px rgba(0,0,0,0.3);
    `;
    document.body.appendChild(clone);
    cloneRef.current = clone;
  };

  const handleTouchMove = (e) => {
    if (!cloneRef.current) return;
    const touch = e.touches[0];
    const rect  = cardRef.current.getBoundingClientRect();
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    cloneRef.current.style.left = `${rect.left + dx}px`;
    cloneRef.current.style.top  = `${rect.top  + dy}px`;
  };

  const handleTouchEnd = (e) => {
    if (cloneRef.current) { cloneRef.current.remove(); cloneRef.current = null; }
    const touch = e.changedTouches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!el) return;
    const bin = el.closest("[data-bin]");
    if (bin) onDrop(item.id, bin.dataset.bin);
  };

  // ── Mouse drag 
  const handleDragStart = (e) => {
    e.dataTransfer.setData("itemId", String(item.id));
  };

  if (sorted) return null; // remove from hand once sorted

  return (
    <div
      ref={cardRef}
      className="item-card"
      draggable
      onDragStart={handleDragStart}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        background: "#fff",
        border: "3px solid #e5e7eb",
        borderRadius: 20,
        padding: "14px 10px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        minWidth: 90,
        maxWidth: 110,
        animation: `popIn 0.4s ease ${animIdx * 0.08}s both`,
        boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
      }}
    >
      <span style={{ fontSize: 32, lineHeight: 1 }}>{item.icon}</span>
      <span style={{
        fontSize: 11, fontWeight: 800, color: "#374151",
        textAlign: "center", lineHeight: 1.3, fontFamily: "'Nunito', sans-serif",
      }}>{item.label}</span>
    </div>
  );
}


//  BIN (drop zone)

function Bin({ type, shaking, accepted, onDragOver, onDrop }) {
  const isClean = type === "clean";
  const color   = isClean ? "#16a34a" : "#dc2626";
  const bg      = isClean ? "linear-gradient(135deg,#dcfce7,#bbf7d0)" : "linear-gradient(135deg,#fee2e2,#fecaca)";
  const emoji   = isClean ? "✅" : "❌";
  const label   = isClean ? "CLEAN" : "DIRTY";

  return (
    <div
      className={`bin-zone ${accepted ? "bin-zone" : ""}`}
      data-bin={type}
      onDragOver={onDragOver}
      onDrop={onDrop}
      style={{
        flex: 1,
        minHeight: 180,
        background: bg,
        border: `4px solid ${color}`,
        borderRadius: 24,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: 12,
        animation: shaking
          ? "shake 0.4s ease"
          : accepted
            ? "binPulse 0.4s ease"
            : "none",
        boxShadow: `0 6px 24px ${color}33`,
      }}
    >
      <span style={{ fontSize: 44 }}>{emoji}</span>
      <span style={{
        fontSize: 20, fontWeight: 900, color,
        fontFamily: "'Fredoka One', cursive",
        letterSpacing: 1,
      }}>{label}</span>
      <span style={{ fontSize: 11, color: color + "bb", fontWeight: 700, fontFamily: "'Nunito',sans-serif" }}>
        Drop here
      </span>
    </div>
  );
}


//  MAIN COMPONENT

export default function CleanOrDirty({ game, username, onFinish, onNavigateBack }) {
  const navigate = useNavigate();
  
  // Navigate back to game selection page
  const handleGoBack = () => {
    if (onNavigateBack) {
      onNavigateBack();
    } else {
      navigate(-1);
    }
  };
  
  const items = useRef(getItems(game.topicId, game.difficulty)).current;
  const total = items.length;
  const pts   = game.pointsPerQuestion || 10;

  const [phase,       setPhase]       = useState("intro");
  const [sorted,      setSorted]      = useState({});   // { itemId: "clean"|"dirty" }
  const [score,       setScore]       = useState(0);
  const [feedback,    setFeedback]    = useState(null); // { text, color }
  const [shakeBin,    setShakeBin]    = useState(null); // "clean"|"dirty"
  const [acceptBin,   setAcceptBin]   = useState(null);
  const [results,     setResults]     = useState([]);   // array of booleans

  const remaining = items.filter(it => !sorted[it.id]);
  const done      = remaining.length === 0 && phase === "playing";

  // Auto-advance to result when all sorted
  useEffect(() => {
    if (done) setTimeout(() => setPhase("result"), 800);
  }, [done]);

  const handleDrop = (itemId, bin) => {
    if (sorted[itemId]) return;
    const item      = items.find(it => it.id === itemId);
    const isCorrect = item.correct === bin;

    setSorted(s => ({ ...s, [itemId]: bin }));
    setResults(r => [...r, isCorrect]);

    if (isCorrect) {
      setScore(s => s + pts);
      setAcceptBin(bin);
      setFeedback({ text: `🎉 Correct! "${item.label}" is ${bin}!`, color: "#16a34a" });
      setTimeout(() => setAcceptBin(null), 500);
    } else {
      setShakeBin(bin);
      setFeedback({ text: `❌ Oops! "${item.label}" goes in ${item.correct.toUpperCase()}!`, color: "#dc2626" });
      setTimeout(() => setShakeBin(null), 500);
    }
    setTimeout(() => setFeedback(null), 1800);
  };

  const handleDragOver  = (e) => e.preventDefault();
  const handleBinDrop   = (e, bin) => {
    e.preventDefault();
    const id = parseInt(e.dataTransfer.getData("itemId"), 10);
    handleDrop(id, bin);
  };

  const maxScore  = total * pts;
  const pct       = Math.round((score / maxScore) * 100);
  const passed    = pct >= (game.passMark || 60);
  const correct   = results.filter(Boolean).length;

  // ── INTRO 
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
      
      <div style={centerCard}>
        <div style={{ fontSize: 80, animation: "float 2s ease-in-out infinite" }}>🫧</div>
        <img src={AVATAR_URL(username)} alt="avatar"
          style={{ width: 90, height: 90, borderRadius: "50%", border: "4px solid #0ea5e9", marginTop: 8 }} />
        <h1 style={titleS}>Clean or Dirty?</h1>
        <p style={{ color: "#374151", fontSize: 14, fontWeight: 700, margin: "0 0 6px", fontFamily: "'Nunito',sans-serif" }}>
          Hi <strong style={{ color: "#0ea5e9" }}>{username}</strong>! Sort the items into the right bins!
        </p>
        <p style={{ color: "#6b7280", fontSize: 13, margin: "0 0 20px", textAlign: "center", maxWidth: 300, fontFamily: "'Nunito',sans-serif" }}>
          Drag each card to ✅ <strong>CLEAN</strong> or ❌ <strong>DIRTY</strong>.
          Get them all right to win!
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: 20 }}>
          {[`🃏 ${total} Items`, `🏆 ${pts} pts each`, "🖐 Drag to sort"].map(t => (
            <span key={t} style={{
              padding: "5px 14px", borderRadius: 20, background: "#fff",
              border: "2px solid #0ea5e9", color: "#0369a1",
              fontSize: 12, fontWeight: 800, fontFamily: "'Nunito',sans-serif",
            }}>{t}</span>
          ))}
        </div>
        <button onClick={() => setPhase("playing")} style={{
          padding: "14px 36px", background: "#0ea5e9", color: "#fff",
          fontSize: 16, fontWeight: 900, border: "none", borderRadius: 16,
          cursor: "pointer", fontFamily: "'Fredoka One',cursive",
          boxShadow: "0 4px 20px #0ea5e966",
        }}>🫧 Start Sorting!</button>
      </div>
    </div>
  );

  // RESULT 
  if (phase === "result") {
    const confettiItems = passed
      ? ["🎊","🎉","⭐","🌟","✨","💫","🏆","🎈","🫧","🌈"]
      : [];

    return (
      <div style={{
        ...screen,
        background: passed
          ? "linear-gradient(135deg,#dcfce7,#fce7f3,#e0f2fe)"
          : "linear-gradient(135deg,#fef3c7,#fff7ed)",
      }}>
        <link rel="stylesheet" href={FONT_LINK} />
        <style>{CSS}</style>
        {confettiItems.map((e, i) => (
          <div key={i} style={{
            position: "fixed", fontSize: 26, pointerEvents: "none", zIndex: 0,
            left: `${5 + i * 10}%`, top: "-10%",
            animation: `confetti ${1.4 + i * 0.2}s ease forwards`,
            animationDelay: `${i * 0.1}s`,
          }}>{e}</div>
        ))}
        <div style={{ ...centerCard, position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 88, animation: "bounce 1.4s ease-in-out infinite", marginBottom: 8 }}>
            {passed ? "🏆" : "💪"}
          </div>
          <img src={AVATAR_URL(username)} alt="avatar"
            style={{ width: 80, height: 80, borderRadius: "50%", border: "4px solid #ec4899", marginBottom: 8 }} />
          <h2 style={{ ...titleS, color: passed ? "#16a34a" : "#d97706", fontSize: 28 }}>
            {passed ? "Brilliant Sorting! 🎉" : "Keep Practicing! 💪"}
          </h2>
          <div style={{
            background: "#fff", border: `4px solid ${passed ? "#16a34a" : "#f59e0b"}`,
            borderRadius: 24, padding: "20px 28px", margin: "12px 0",
            textAlign: "center", minWidth: 260,
            boxShadow: `0 8px 32px ${passed ? "#16a34a" : "#f59e0b"}33`,
          }}>
            <div style={{ fontSize: 56, fontWeight: 900, fontFamily: "'Fredoka One',cursive",
              color: passed ? "#16a34a" : "#f59e0b", lineHeight: 1 }}>{pct}%</div>
            <p style={{ color: "#6b7280", margin: "6px 0 0", fontFamily: "'Nunito',sans-serif", fontSize: 13, fontWeight: 700 }}>
              <strong style={{ color: "#111827" }}>{correct}</strong> / {total} correct
              &nbsp;·&nbsp;
              <strong style={{ color: "#0ea5e9" }}>{score}</strong> pts
            </p>
          </div>
          {/* Per-item result strip */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center", marginBottom: 20 }}>
            {items.map((it, i) => (
              <div key={it.id} style={{
                fontSize: 22, textAlign: "center",
                filter: results[i] ? "none" : "grayscale(0.4)",
              }} title={`${it.label}: ${results[i] ? "✅" : "❌"}`}>
                {it.icon}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            <button onClick={() => {
              setSorted({}); setScore(0); setResults([]);
              setPhase("intro");
            }} style={btnStyle("#8b5cf6")}>🔄 Play Again</button>
            <button onClick={() => onFinish(score, maxScore, pct, passed)} style={btnStyle("#3b82f6")}>
              🏠 Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── PLAYING ────────────────────────────────────────────────────────────────
  return (
    <div style={screen}>
      <link rel="stylesheet" href={FONT_LINK} />
      <style>{CSS}</style>

      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "10px 16px", borderBottom: "3px solid #e5e7eb",
        background: "rgba(255,255,255,0.9)", backdropFilter: "blur(10px)",
      }}>
        <img src={AVATAR_URL(username)} alt="avatar"
          style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid #0ea5e9" }} />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: "#374151", fontFamily: "'Nunito',sans-serif" }}>
              Sorted: {total - remaining.length} / {total}
            </span>
            <span style={{ fontSize: 13, fontWeight: 900, color: "#d97706", fontFamily: "'Fredoka One',cursive" }}>
              ⭐ {score} pts
            </span>
          </div>
          <div style={{ background: "#e5e7eb", borderRadius: 20, height: 10, overflow: "hidden" }}>
            <div style={{
              width: `${((total - remaining.length) / total) * 100}%`,
              height: "100%",
              background: "linear-gradient(90deg,#0ea5e9,#10b981)",
              borderRadius: 20, transition: "width 0.4s ease",
            }} />
          </div>
        </div>
        {/* Pause button */}
        <button onClick={handleGoBack} style={{
          padding: "6px 12px", background: "linear-gradient(135deg,#f59e0b,#fbbf24)",
          border: "none", borderRadius: 10, color: "#fff", fontSize: 12,
          cursor: "pointer", fontFamily: "'Nunito',sans-serif", fontWeight: 800,
          boxShadow: "0 2px 8px rgba(245,158,11,0.3)",
        }}>⏸ Pause</button>
      </div>

      {/* Feedback bar */}
      {feedback && (
        <div style={{
          margin: "8px 16px 0",
          padding: "10px 16px",
          borderRadius: 12,
          background: feedback.color === "#16a34a" ? "#dcfce7" : "#fee2e2",
          border: `2px solid ${feedback.color}`,
          color: feedback.color,
          fontSize: 13, fontWeight: 800, textAlign: "center",
          fontFamily: "'Nunito',sans-serif",
          animation: "fadeUp 0.25s ease",
        }}>{feedback.text}</div>
      )}

      {/* Item cards hand */}
      <div style={{
        padding: "12px 16px 8px",
        minHeight: 130,
      }}>
        <div style={{ fontSize: 11, fontWeight: 900, color: "#9ca3af", letterSpacing: 1,
          textTransform: "uppercase", marginBottom: 8, fontFamily: "'Nunito',sans-serif" }}>
          🖐 Drag items to the bins below
        </div>
        {remaining.length === 0 ? (
          <div style={{ textAlign: "center", padding: 16, color: "#16a34a",
            fontSize: 16, fontWeight: 900, fontFamily: "'Fredoka One',cursive",
            animation: "bounce 0.8s ease infinite" }}>
            All sorted! 🎉 Great job!
          </div>
        ) : (
          <div style={{
            display: "flex", flexWrap: "wrap", gap: 10,
            justifyContent: "center",
          }}>
            {remaining.map((item, i) => (
              <ItemCard
                key={item.id}
                item={item}
                animIdx={i}
                sorted={!!sorted[item.id]}
                onDrop={handleDrop}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bins */}
      <div style={{
        display: "flex", gap: 12, padding: "8px 16px 16px", flex: 1,
      }}>
        {["clean", "dirty"].map(bin => (
          <Bin
            key={bin}
            type={bin}
            shaking={shakeBin === bin}
            accepted={acceptBin === bin}
            onDragOver={handleDragOver}
            onDrop={(e) => handleBinDrop(e, bin)}
          />
        ))}
      </div>

      {/* Sorted items preview at bottom */}
      {Object.keys(sorted).length > 0 && (
        <div style={{
          padding: "8px 16px 12px",
          borderTop: "2px solid #e5e7eb",
          background: "rgba(255,255,255,0.7)",
        }}>
          <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 800, marginBottom: 6,
            letterSpacing: 1, textTransform: "uppercase", fontFamily: "'Nunito',sans-serif" }}>
            Sorted so far
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {items.filter(it => sorted[it.id]).map(it => {
              const isRight = sorted[it.id] === it.correct;
              return (
                <div key={it.id} style={{
                  display: "flex", alignItems: "center", gap: 4,
                  background: isRight ? "#dcfce7" : "#fee2e2",
                  border: `2px solid ${isRight ? "#16a34a" : "#dc2626"}`,
                  borderRadius: 12, padding: "4px 8px",
                  fontSize: 11, fontWeight: 800,
                  color: isRight ? "#15803d" : "#991b1b",
                  fontFamily: "'Nunito',sans-serif",
                }}>
                  <span style={{ fontSize: 16 }}>{it.icon}</span>
                  <span>{isRight ? "✓" : "✗"}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}


const screen = {
  minHeight: "100vh",
  background: "linear-gradient(135deg,#fef9c3 0%,#fce7f3 30%,#e0f2fe 60%,#d1fae5 100%)",
  backgroundSize: "400% 400%",
  animation: "rainbowBg 10s ease infinite",
  display: "flex", flexDirection: "column",
  fontFamily: "'Nunito', sans-serif",
};
const centerCard = {
  margin: "auto", maxWidth: 420, width: "100%",
  padding: "32px 24px",
  display: "flex", flexDirection: "column",
  alignItems: "center", textAlign: "center",
};
const titleS = {
  fontSize: 34, color: "#111827",
  margin: "10px 0 6px",
  fontFamily: "'Fredoka One', cursive",
};
const btnStyle = (c) => ({
  padding: "13px 28px", background: c, color: "#fff",
  fontSize: 15, fontWeight: 900, border: "none", borderRadius: 14,
  cursor: "pointer", fontFamily: "'Fredoka One',cursive",
  boxShadow: `0 4px 16px ${c}55`,
});