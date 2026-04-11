

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";


//  UNSPLASH API KEY


const UNSPLASH_ACCESS_KEY = "sPOeRrswOVi84FdlGk1lEQ49S5JqESRmjgXQdKBOSEE";


//  topic search

const TOPIC_QUERIES = {
  "safe-drinking-water":                      { clean: "clean drinking water glass",         dirty: "contaminated water polluted river" },
  "hand-washing-and-personal-hygiene":        { clean: "clean hands soap washing hygiene",    dirty: "dirty hands germs bacteria" },
  "toilet-and-sanpracticesitation-practices": { clean: "clean toilet sanitation facility",    dirty: "open defecation dirty drain sewage" },
  "water-borne-diseases-and-prevention":      { clean: "purified water filter treatment",     dirty: "polluted water disease mosquito" },
  "water-conservation-and-environment-care":  { clean: "clean river nature conservation",     dirty: "water pollution plastic garbage river" },
  default:                                    { clean: "clean drinking water safe",           dirty: "dirty polluted water unsafe" },
};


//  SANITATION TIPS 

const SANITATION_TIPS = [
  "💧 Always boil water from unknown sources before drinking!",
  "🧼 Wash hands with soap for 20 seconds after using the toilet.",
  "🚰 A covered water tank keeps water safe from insects and dirt.",
  "🏞️ Never dump rubbish near rivers or streams — it pollutes drinking water.",
  "🦟 Standing dirty water breeds mosquitoes — drain or cover it!",
  "🌿 Planting trees near rivers helps keep water clean.",
  "🧴 Use water purification tablets when clean water is not available.",
  "🚿 Fix leaking pipes quickly — wasted water can become dirty fast.",
  "🪣 Always store water in clean, covered containers.",
  "♻️ Reusing water wisely helps protect our environment.",
];


//  FALLBACK IMAGES (in case Unsplash API fails or rate-limit hit)
//  Using public Unsplash images by topic

const FALLBACK_CARDS = [
  { id: "f1", imageUrl: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400", label: "Crystal Clear Tap Water",        isClean: true,  description: "Safe tap water is treated and clean to drink." },
  { id: "f2", imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400", label: "Clean Mountain Spring",         isClean: true,  description: "Fresh spring water from mountains is often very pure." },
  { id: "f3", imageUrl: "https://images.unsplash.com/photo-1559825481-12a05cc00344?w=400", label: "Covered Water Storage Tank",     isClean: true,  description: "Covered tanks keep stored water safe from contamination." },
  { id: "f4", imageUrl: "https://images.unsplash.com/photo-1594398901394-4e34939a4fd0?w=400", label: "Filtered Bottled Water",        isClean: true,  description: "Filtered water removes harmful bacteria and particles." },
  { id: "f5", imageUrl: "https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=400", label: "Polluted River with Waste",     isClean: false, description: "Dumping waste in rivers makes the water dangerous to drink." },
  { id: "f6", imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400", label: "Open Sewage Drain",              isClean: false, description: "Open drains carry disease-causing bacteria and spread illness." },
  { id: "f7", imageUrl: "https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=400", label: "Muddy Brown Flood Water",       isClean: false, description: "Floodwater mixes with sewage and is extremely unsafe." },
  { id: "f8", imageUrl: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400", label: "Plastic Polluted Ocean",        isClean: false, description: "Plastic in water harms marine life and contaminates water sources." },
];


//  FONTS & ANIMATION CSS

const FONT_LINK = "https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;700;800;900&display=swap";

const CSS_ANIMATIONS = `
  @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;700;800;900&display=swap');

  @keyframes card-enter {
    0%   { transform: scale(0.5) rotate(-8deg); opacity: 0; }
    70%  { transform: scale(1.08) rotate(2deg); }
    100% { transform: scale(1) rotate(0deg); opacity: 1; }
  }
  @keyframes card-float {
    0%,100% { transform: translateY(0px) rotate(-1deg); }
    50%      { transform: translateY(-10px) rotate(1deg); }
  }
  @keyframes bounce-in {
    0%   { transform: scale(0); opacity: 0; }
    60%  { transform: scale(1.2); }
    100% { transform: scale(1); opacity: 1; }
  }
  @keyframes shake {
    0%,100% { transform: translateX(0); }
    20%      { transform: translateX(-12px) rotate(-3deg); }
    40%      { transform: translateX(12px) rotate(3deg); }
    60%      { transform: translateX(-8px); }
    80%      { transform: translateX(8px); }
  }
  @keyframes pop-correct {
    0%   { transform: scale(1); }
    30%  { transform: scale(1.3) rotate(5deg); }
    60%  { transform: scale(0.9); }
    100% { transform: scale(1); }
  }
  @keyframes fade-up {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes rainbow-border {
    0%   { border-color: #f43f5e; }
    25%  { border-color: #f59e0b; }
    50%  { border-color: #22c55e; }
    75%  { border-color: #3b82f6; }
    100% { border-color: #f43f5e; }
  }
  @keyframes pulse-glow {
    0%,100% { box-shadow: 0 0 12px rgba(34,197,94,0.4); }
    50%      { box-shadow: 0 0 28px rgba(34,197,94,0.9); }
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes confetti-fall {
    0%   { transform: translateY(-20px) rotate(0deg) scale(1); opacity: 1; }
    100% { transform: translateY(120px) rotate(720deg) scale(0.5); opacity: 0; }
  }
  @keyframes tip-slide {
    0%   { transform: translateY(60px); opacity: 0; }
    15%  { transform: translateY(0); opacity: 1; }
    80%  { transform: translateY(0); opacity: 1; }
    100% { transform: translateY(-20px); opacity: 0; }
  }
  .drop-zone-hover {
    transform: scale(1.04);
    transition: transform 0.15s ease;
  }
  * { box-sizing: border-box; }
`;

const AVATAR_URL = (seed) =>
  `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4`;


//  UNSPLASH FETCH HELPER

async function fetchUnsplashImages(query, count = 4) {
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&orientation=squarish&content_filter=high`;
  const res = await fetch(url, {
    headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` },
  });
  if (!res.ok) throw new Error(`Unsplash API error: ${res.status}`);
  const data = await res.json();
  return data.results || [];
}


//  BUILD CARD DECK FROM UNSPLASH RESULTS

function buildDeckFromUnsplash(cleanPhotos, dirtyPhotos) {
  const cleanCards = cleanPhotos.map((photo, i) => ({
    id: `clean-${photo.id}`,
   imageUrl: photo.urls.regular,
imageThumb: photo.urls.small,
    label: photo.alt_description
      ? photo.alt_description.replace(/\b\w/g, c => c.toUpperCase()).slice(0, 30)
      : `Clean Water ${i + 1}`,
    credit: photo.user?.name || "Unsplash",
    creditUrl: photo.links?.html,
    isClean: true,
    description: photo.description || "This water source appears clean and safe.",
  }));

  const dirtyCards = dirtyPhotos.map((photo, i) => ({
    id: `dirty-${photo.id}`,
    imageUrl: photo.urls.small,
    imageThumb: photo.urls.thumb,
    label: photo.alt_description
      ? photo.alt_description.replace(/\b\w/g, c => c.toUpperCase()).slice(0, 30)
      : `Dirty Water ${i + 1}`,
    credit: photo.user?.name || "Unsplash",
    creditUrl: photo.links?.html,
    isClean: false,
    description: photo.description || "This water source looks polluted and unsafe.",
  }));

  // Shuffle both together
  return [...cleanCards, ...dirtyCards].sort(() => Math.random() - 0.5);
}


//  CONFETTI BURST COMPONENT

function ConfettiBurst({ active }) {
  if (!active) return null;
  const pieces = ["🎊","⭐","💧","🌊","✨","🎉","💫","🌟"];
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 999, overflow: "hidden" }}>
      {pieces.map((p, i) => (
        <div key={i} style={{
          position: "absolute",
          left: `${10 + i * 11}%`,
          top: "-5%",
          fontSize: 28,
          animation: `confetti-fall 1.2s ease forwards`,
          animationDelay: `${i * 0.08}s`,
        }}>{p}</div>
      ))}
    </div>
  );
}


//  SANITATION TIP TOAST

function TipToast({ tip, visible }) {
  if (!tip || !visible) return null;
  return (
    <div style={{
      position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
      background: "linear-gradient(135deg,#0ea5e9,#06b6d4)",
      color: "#fff", borderRadius: 20, padding: "14px 22px",
      fontSize: 13, fontWeight: 800, fontFamily: "'Nunito',sans-serif",
      maxWidth: 340, width: "90%", textAlign: "center",
      boxShadow: "0 8px 32px rgba(14,165,233,0.5)",
      border: "3px solid #fff",
      zIndex: 998,
      animation: "tip-slide 3.5s ease forwards",
    }}>
      {tip}
    </div>
  );
}


//  MAIN COMPONENT

export default function cleanDirtyGame({ game, username, onFinish, onNavigateBack }) {
  const navigate = useNavigate();
  
  // Navigate back to game selection page
  const handleGoBack = () => {
    if (onNavigateBack) {
      onNavigateBack();
    } else {
      navigate(-1);
    }
  };
  
  const [phase, setPhase]           = useState("loading"); // loading | intro | playing | result
  const [cards, setCards]           = useState([]);
  const [cardIndex, setCardIndex]   = useState(0);
  const [score, setScore]           = useState(0);
  const [results, setResults]       = useState([]);
  const [feedback, setFeedback]     = useState(null); // null | { correct, message, description }
  const [showConfetti, setShowConfetti] = useState(false);
  const [currentTip, setCurrentTip] = useState("");
  const [showTip, setShowTip]       = useState(false);
  const [apiSource, setApiSource]   = useState("unsplash"); // "unsplash" | "fallback"
  const [loadError, setLoadError]   = useState("");
  const [dragging, setDragging]     = useState(false);
  const [dragOver, setDragOver]     = useState(null); // "clean" | "dirty" | null

  const pointsPerCard = game.pointsPerQuestion || 10;
  const topicId       = game.topicId || "default";
  const queries       = TOPIC_QUERIES[topicId] || TOPIC_QUERIES.default;

  // ── LOAD IMAGES FROM UNSPLASH
  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    setPhase("loading");
    setLoadError("");
    try {
      const [cleanPhotos, dirtyPhotos] = await Promise.all([
        fetchUnsplashImages(queries.clean, 4),
        fetchUnsplashImages(queries.dirty, 4),
      ]);

      if (cleanPhotos.length === 0 && dirtyPhotos.length === 0) {
        throw new Error("No images returned from Unsplash.");
      }

      const deck = buildDeckFromUnsplash(cleanPhotos, dirtyPhotos);
      setCards(deck);
      setApiSource("unsplash");
      setPhase("intro");
    } catch (err) {
      console.warn("Unsplash API failed, using fallback images:", err.message);
      setCards([...FALLBACK_CARDS].sort(() => Math.random() - 0.5));
      setApiSource("fallback");
      setLoadError("Using offline images — Unsplash API unavailable.");
      setPhase("intro");
    }
  };

  const totalCards = cards.length;
  const maxScore = totalCards > 0 ? totalCards * pointsPerCard : 1;
  
  const currentCard = cards[cardIndex];

  // ── HANDLE ANSWER (drag or tap)
  const handleClassify = (guessedClean) => {
    if (feedback) return; // already answered this card
    const isCorrect = guessedClean === currentCard.isClean;
    const tip = SANITATION_TIPS[Math.floor(Math.random() * SANITATION_TIPS.length)];

    setFeedback({
      correct: isCorrect,
      guessedClean,
      message: isCorrect
        ? (guessedClean ? "✅ Correct! That water IS clean!" : "✅ Correct! That water IS dirty!")
        : (guessedClean ? "❌ Oops! That water is actually DIRTY!" : "❌ Oops! That water is actually CLEAN!"),
      description: currentCard.description,
    });

    if (isCorrect) {
      setScore(s => s + pointsPerCard);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1500);
    }

    setResults(r => [...r, { correct: isCorrect, isClean: currentCard.isClean }]);

    // Show tip after correct answer
    if (isCorrect) {
      setTimeout(() => { setCurrentTip(tip); setShowTip(true); }, 400);
      setTimeout(() => setShowTip(false), 4000);
    }

    // Advance to next card
    setTimeout(() => {
      setFeedback(null);
      setDragOver(null);
      if (cardIndex + 1 >= totalCards) {
        setPhase("result");
      } else {
        setCardIndex(i => i + 1);
      }
    }, 2200);
  };

  //  DRAG AND DROP HANDLERS 
  const handleDragStart = (e) => {
    e.dataTransfer.effectAllowed = "move";
    setDragging(true);
  };
  const handleDragEnd = () => {
    setDragging(false);
    setDragOver(null);
  };
  const handleDragOver = (e, zone) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOver(zone);
  };
  const handleDrop = (e, zone) => {
    e.preventDefault();
    setDragging(false);
    setDragOver(null);
    handleClassify(zone === "clean");
  };

  const percentage = totalCards > 0 ? Math.round((score / maxScore) * 100) : 0;
  const passed     = percentage >= (game.passMark || 60);
  const correctCount = results.filter(r => r.correct).length;

  // ── LOADING SCREEN ──────────────────────────────────────────────────────────
  if (phase === "loading") return (
    <div style={STYLES.screen}>
      <link rel="stylesheet" href={FONT_LINK} />
      <style>{CSS_ANIMATIONS}</style>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        <div style={{ fontSize: 64, animation: "spin 2s linear infinite" }}>🌊</div>
        <div style={{
          fontFamily: "'Fredoka One',cursive", fontSize: 22, color: "#0369a1",
          textAlign: "center",
        }}>
          Fetching water images from Unsplash...
        </div>
        <div style={{ fontSize: 13, color: "#64748b", fontFamily: "'Nunito',sans-serif" }}>
          Powered by Unsplash API 📸
        </div>
        {/* Loading bar */}
        <div style={{ width: 200, height: 8, background: "#e0f2fe", borderRadius: 20, overflow: "hidden" }}>
          <div style={{
            height: "100%", width: "60%",
            background: "linear-gradient(90deg,#0ea5e9,#22c55e)",
            borderRadius: 20,
            animation: "rainbow-border 1s ease infinite",
          }} />
        </div>
      </div>
    </div>
  );

  // ── INTRO SCREEN ────────────────────────────────────────────────────────────
  if (phase === "intro") return (
    <div style={STYLES.screen}>
      <link rel="stylesheet" href={FONT_LINK} />
      <style>{CSS_ANIMATIONS}</style>
      
      {/* Go Back button */}
      <button onClick={handleGoBack} style={{
        position: "absolute", top: 16, left: 16,
        padding: "10px 20px", background: "linear-gradient(135deg,#ec4899,#f472b6)",
        border: "none", borderRadius: 14, color: "#fff",
        fontSize: 14, cursor: "pointer", fontFamily: "'Nunito',sans-serif", fontWeight: 800,
        boxShadow: "0 4px 12px rgba(236,72,153,0.3)", zIndex: 10,
      }}>← Back to Games</button>

      <div style={STYLES.card}>
        <img src={AVATAR_URL(username)} alt="avatar" style={STYLES.avatar(100)} />

        <div style={{ fontSize: 56, margin: "8px 0", animation: "card-float 2s ease-in-out infinite" }}>🫧</div>

        <h1 style={{
          fontFamily: "'Fredoka One',cursive",
          fontSize: 30, margin: "0 0 8px",
          background: "linear-gradient(135deg,#0ea5e9,#22c55e,#f59e0b)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          Clean or Dirty Water?
        </h1>

        <p style={{ color: "#374151", fontSize: 14, fontWeight: 700, margin: "0 0 4px", fontFamily: "'Nunito',sans-serif" }}>
          Hi <strong style={{ color: "#0ea5e9" }}>{username}</strong>! Can you tell which water is safe?
        </p>

        {/* API Source badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "5px 14px", borderRadius: 20, marginBottom: 14,
          background: apiSource === "unsplash" ? "#e0f2fe" : "#fef3c7",
          border: `2px solid ${apiSource === "unsplash" ? "#0ea5e9" : "#f59e0b"}`,
          fontSize: 11, fontWeight: 800, fontFamily: "'Nunito',sans-serif",
          color: apiSource === "unsplash" ? "#0369a1" : "#92400e",
        }}>
          <span>{apiSource === "unsplash" ? "📸" : "🖼️"}</span>
          {apiSource === "unsplash" ? "Real photos from Unsplash API" : "Offline images (fallback)"}
        </div>

        {loadError && (
          <div style={{
            fontSize: 11, color: "#92400e", background: "#fef3c7",
            border: "1px solid #f59e0b", borderRadius: 8, padding: "6px 12px", marginBottom: 8,
            fontFamily: "'Nunito',sans-serif",
          }}>
            ⚠️ {loadError}
          </div>
        )}

        {/* How to play */}
        <div style={{
          background: "linear-gradient(135deg,#f0fdf4,#e0f2fe)",
          border: "2px solid #22c55e", borderRadius: 16,
          padding: "14px 18px", margin: "8px 0 16px",
          textAlign: "left", maxWidth: 320,
        }}>
          <div style={{ fontFamily: "'Fredoka One',cursive", color: "#15803d", fontSize: 15, marginBottom: 8 }}>
            How to Play:
          </div>
          {[
            "👀 A water image appears on your screen",
            "🖱️ Drag it — or tap — into the right bin",
            "✅ CLEAN bin = safe water",
            "❌ DIRTY bin = unsafe water",
            "⭐ Get 10 points for each correct answer!",
          ].map((step, i) => (
            <div key={i} style={{
              fontSize: 12, color: "#374151", fontFamily: "'Nunito',sans-serif",
              fontWeight: 700, marginBottom: 4,
            }}>{step}</div>
          ))}
        </div>

        {/* Stats pills */}
        <div style={STYLES.pills}>
          <span style={STYLES.pill("#0ea5e9")}>🖼️ {totalCards} Images</span>
          <span style={STYLES.pill("#22c55e")}>⭐ {maxScore} pts total</span>
          <span style={STYLES.pill("#f59e0b")}>🎯 Pass: {game.passMark || 60}%</span>
        </div>

        <button
          onClick={() => setPhase("playing")}
          style={{
            ...STYLES.bigBtn("linear-gradient(135deg,#0ea5e9,#22c55e)"),
            animation: "bounce-in 0.5s ease 0.2s both",
          }}
        >
          🎮 Start Sorting!
        </button>
      </div>
    </div>
  );

  // ── RESULT SCREEN ────────────────────────────────────────────────────────────
  if (phase === "result") return (
    <div style={STYLES.screen}>
      <link rel="stylesheet" href={FONT_LINK} />
      <style>{CSS_ANIMATIONS}</style>
      <ConfettiBurst active={passed} />

      <div style={STYLES.card}>
        <img src={AVATAR_URL(username)} alt="avatar" style={STYLES.avatar(90)} />
        <div style={{ fontSize: 70, margin: "10px 0", animation: "bounce-in 0.5s ease both" }}>
          {passed ? "🏆" : "💪"}
        </div>
        <h2 style={{
          fontFamily: "'Fredoka One',cursive", fontSize: 26, margin: "0 0 8px",
          color: passed ? "#15803d" : "#d97706",
        }}>
          {passed ? "Amazing Water Expert!" : "Keep Learning! You Can Do It!"}
        </h2>

        {/* Big score */}
        <div style={{
          fontSize: 64, fontWeight: 900,
          fontFamily: "'Fredoka One',cursive",
          color: passed ? "#16a34a" : "#d97706",
          margin: "8px 0",
          animation: "bounce-in 0.6s ease 0.2s both",
        }}>
          {percentage}%
        </div>

        <p style={{ color: "#374151", fontWeight: 800, fontFamily: "'Nunito',sans-serif", margin: "0 0 16px" }}>
          You got <strong style={{ color: "#0ea5e9" }}>{correctCount}</strong> out of <strong>{totalCards}</strong> correct!
          &nbsp;(<strong style={{ color: "#22c55e" }}>{score}</strong> / {maxScore} pts)
        </p>

        {/* Per-card result row */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: 20 }}>
          {results.map((r, i) => (
            <div key={i} style={{
              width: 42, height: 42, borderRadius: 12,
              background: r.correct ? "#dcfce7" : "#fee2e2",
              border: `3px solid ${r.correct ? "#22c55e" : "#f43f5e"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20,
            }}>
              {r.correct ? "✅" : "❌"}
            </div>
          ))}
        </div>

        {/* API credit */}
        <div style={{
          fontSize: 11, color: "#94a3b8", fontFamily: "'Nunito',sans-serif",
          margin: "0 0 20px",
        }}>
          {apiSource === "unsplash"
            ? "📸 Real photos powered by Unsplash API (unsplash.com)"
            : "🖼️ Played with offline fallback images"
          }
        </div>

        <button
          onClick={() => onFinish(score, maxScore, percentage, passed)}
          style={STYLES.bigBtn("linear-gradient(135deg,#0ea5e9,#3b82f6)")}
        >
          🏠 Back to Games
        </button>

        <button
          onClick={() => {
            setCardIndex(0); setScore(0); setResults([]);
            setFeedback(null); setShowTip(false);
            loadCards(); // fetch fresh images from Unsplash!
          }}
          style={{
            ...STYLES.bigBtn("linear-gradient(135deg,#f59e0b,#f43f5e)"),
            marginTop: 10,
          }}
        >
          🔄 Play Again (New Images!)
        </button>
      </div>
    </div>
  );

  // ── PLAYING SCREEN ───────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg,#e0f2fe 0%,#fce7f3 40%,#fef3c7 70%,#d1fae5 100%)",
      display: "flex", flexDirection: "column",
      fontFamily: "'Nunito',sans-serif",
    }}>
      <link rel="stylesheet" href={FONT_LINK} />
      <style>{CSS_ANIMATIONS}</style>
      <ConfettiBurst active={showConfetti} />
      <TipToast tip={currentTip} visible={showTip} />

      {/* ── Header ── */}
      <div style={{
        background: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)",
        borderBottom: "3px solid #e0f2fe",
        display: "flex", alignItems: "center", gap: 10, padding: "10px 16px",
      }}>
        <img src={AVATAR_URL(username)} alt="avatar" style={STYLES.avatar(40)} />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: "#374151" }}>
              Card {cardIndex + 1} / {totalCards}
            </span>
            <span style={{ fontWeight: 900, color: "#d97706", fontFamily: "'Fredoka One',cursive" }}>
              ⭐ {score} pts
            </span>
          </div>
          <div style={{ background: "#e5e7eb", borderRadius: 20, height: 8 }}>
            <div style={{
              width: `${(cardIndex / totalCards) * 100}%`, height: "100%",
              background: "linear-gradient(90deg,#0ea5e9,#22c55e,#f59e0b)",
              borderRadius: 20, transition: "width 0.4s",
            }} />
          </div>
        </div>
        {/* API badge top-right */}
        <div style={{
          fontSize: 10, fontWeight: 800, color: "#0369a1",
          background: "#e0f2fe", border: "1px solid #7dd3fc",
          borderRadius: 8, padding: "3px 8px", fontFamily: "'Nunito',sans-serif",
        }}>
          {apiSource === "unsplash" ? "📸 Unsplash" : "🖼️ Offline"}
        </div>
        {/* Pause button */}
        <button onClick={handleGoBack} style={{
          marginLeft: 6, padding: "6px 12px", background: "linear-gradient(135deg,#f59e0b,#fbbf24)",
          border: "none", borderRadius: 10, color: "#fff", fontSize: 12,
          cursor: "pointer", fontFamily: "'Nunito',sans-serif", fontWeight: 800,
          boxShadow: "0 2px 8px rgba(245,158,11,0.3)",
        }}>⏸ Pause</button>
      </div>

      {/* Main Play Area  */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "12px 16px", gap: 12 }}>

        {/*  Current Card  */}
        {currentCard && (
          <div
            draggable={!feedback}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            style={{
              background: "#fff",
              borderRadius: 24,
              border: feedback
                ? `5px solid ${feedback.correct ? "#22c55e" : "#f43f5e"}`
                : "4px solid #fbbf24",
              boxShadow: feedback
                ? `0 8px 32px ${feedback.correct ? "#22c55e66" : "#f43f5e66"}`
                : "0 8px 24px rgba(251,191,36,0.3)",
              overflow: "hidden",
              animation: feedback
                ? (feedback.correct ? "pop-correct 0.5s ease" : "shake 0.5s ease")
                : "card-enter 0.5s ease",
              cursor: feedback ? "default" : (dragging ? "grabbing" : "grab"),
              transition: "border-color 0.3s, box-shadow 0.3s",
              position: "relative",
            }}
          >
            {/* Image */}
            <div style={{ position: "relative", height: 400, overflow: "hidden" }}>
              <img
                src={currentCard.imageUrl}
                alt={currentCard.label}
                style={{
                  width: "100%", height: "100%", objectFit: "cover",
                  filter: feedback ? (feedback.correct ? "brightness(1.1) saturate(1.3)" : "brightness(0.8) saturate(0.6)") : "none",
                  transition: "filter 0.3s",
                }}
                draggable={false}
              />

              {/* Drag hint overlay */}
              {!feedback && !dragging && (
                <div style={{
                  position: "absolute", bottom: 8, right: 8,
                  background: "rgba(0,0,0,0.55)", color: "#fff",
                  fontSize: 11, fontWeight: 800, padding: "4px 10px",
                  borderRadius: 20, fontFamily: "'Nunito',sans-serif",
                }}>
                  ✋ Drag or tap a bin below
                </div>
              )}

              {/* Feedback overlay */}
              {feedback && (
                <div style={{
                  position: "absolute", inset: 0,
                  background: feedback.correct ? "rgba(34,197,94,0.25)" : "rgba(244,63,94,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 80,
                }}>
                  {feedback.correct ? "✅" : "❌"}
                </div>
              )}
            </div>

            {/* Card info */}
            <div style={{ padding: "12px 16px" }}>
              <div style={{ fontWeight: 900, color: "#111827", fontSize: 15, marginBottom: 4 }}>
                {currentCard.label}
              </div>

              {/* Feedback message */}
              {feedback && (
                <div style={{ animation: "fade-up 0.3s ease" }}>
                  <div style={{
                    fontWeight: 900, fontSize: 14,
                    color: feedback.correct ? "#16a34a" : "#dc2626",
                    marginBottom: 4,
                  }}>
                    {feedback.message}
                  </div>
                  <div style={{ fontSize: 12, color: "#6b7280", fontStyle: "italic", lineHeight: 1.4 }}>
                    {feedback.description}
                  </div>
                </div>
              )}

              {/* Unsplash credit */}
              {currentCard.credit && (
                <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 6 }}>
                  📸 Photo by {currentCard.credit} on Unsplash
                </div>
              )}
            </div>
          </div>
        )}

        {/*  Drop Zones  */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 4 }}>

          {/* CLEAN BIN */}
          <div
            onClick={() => !feedback && handleClassify(true)}
            onDragOver={(e) => handleDragOver(e, "clean")}
            onDragLeave={() => setDragOver(null)}
            onDrop={(e) => handleDrop(e, "clean")}
            style={{
              background: dragOver === "clean"
                ? "linear-gradient(135deg,#bbf7d0,#86efac)"
                : "linear-gradient(135deg,#dcfce7,#f0fdf4)",
              border: `4px solid ${dragOver === "clean" ? "#16a34a" : "#22c55e"}`,
              borderRadius: 20,
              padding: "10px 8px",
              textAlign: "center",
              cursor: feedback ? "default" : "pointer",
              transition: "all 0.2s ease",
              transform: dragOver === "clean" ? "scale(1.06)" : "scale(1)",
              boxShadow: dragOver === "clean"
                ? "0 0 24px rgba(34,197,94,0.5)"
                : "0 4px 16px rgba(34,197,94,0.15)",
              animation: dragOver === "clean" ? "pulse-glow 0.8s ease infinite" : "none",
            }}
          >
            <div style={{ fontSize: 44, marginBottom: 6 }}>✅</div>
            <div style={{
              fontFamily: "'Fredoka One',cursive",
              fontSize: 18, color: "#15803d",
            }}>CLEAN</div>
            <div style={{ fontSize: 11, color: "#16a34a", fontWeight: 800, marginTop: 2 }}>
              Safe to use
            </div>
            <div style={{ fontSize: 10, color: "#4ade80", marginTop: 4 }}>
              Drop here or tap
            </div>
          </div>

          {/* DIRTY BIN */}
          <div
            onClick={() => !feedback && handleClassify(false)}
            onDragOver={(e) => handleDragOver(e, "dirty")}
            onDragLeave={() => setDragOver(null)}
            onDrop={(e) => handleDrop(e, "dirty")}
            style={{
              background: dragOver === "dirty"
                ? "linear-gradient(135deg,#fecaca,#fca5a5)"
                : "linear-gradient(135deg,#fee2e2,#fff5f5)",
              border: `4px solid ${dragOver === "dirty" ? "#dc2626" : "#f43f5e"}`,
              borderRadius: 20,
              padding: "20px 12px",
              textAlign: "center",
              cursor: feedback ? "default" : "pointer",
              transition: "all 0.2s ease",
              transform: dragOver === "dirty" ? "scale(1.06)" : "scale(1)",
              boxShadow: dragOver === "dirty"
                ? "0 0 24px rgba(244,63,94,0.5)"
                : "0 4px 16px rgba(244,63,94,0.15)",
              animation: dragOver === "dirty" ? "pulse-glow 0.8s ease infinite" : "none",
            }}
          >
            <div style={{ fontSize: 44, marginBottom: 6 }}>❌</div>
            <div style={{
              fontFamily: "'Fredoka One',cursive",
              fontSize: 18, color: "#991b1b",
            }}>DIRTY</div>
            <div style={{ fontSize: 11, color: "#dc2626", fontWeight: 800, marginTop: 2 }}>
              Not safe!
            </div>
            <div style={{ fontSize: 10, color: "#f87171", marginTop: 4 }}>
              Drop here or tap
            </div>
          </div>
        </div>

        {/* Instruction text */}
        <div style={{ textAlign: "center", fontSize: 12, color: "#64748b", fontWeight: 800, padding: "4px 0 8px" }}>
          🖱️ Drag the image into a bin — or just tap a bin!
        </div>
      </div>
    </div>
  );
}


//  SHARED STYLES

const STYLES = {
  screen: {
    minHeight: "100vh",
    background: "linear-gradient(160deg,#e0f2fe 0%,#fce7f3 40%,#fef3c7 70%,#d1fae5 100%)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "'Nunito',sans-serif",
    padding: 20,
  },
  card: {
    maxWidth: 420, width: "100%", padding: "28px 24px",
    display: "flex", flexDirection: "column", alignItems: "center",
    textAlign: "center", gap: 4,
  },
  avatar: (size) => ({
    width: size, height: size, borderRadius: "50%",
    border: "4px solid #0ea5e9", background: "#e0f2fe",
  }),
  pills: { display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", margin: "10px 0" },
  pill: (c) => ({
    padding: "5px 14px", borderRadius: 20,
    background: "#fff", border: `2px solid ${c}`, color: c,
    fontSize: 12, fontWeight: 800,
    boxShadow: `0 2px 8px ${c}44`,
  }),
  bigBtn: (bg) => ({
    padding: "14px 32px",
    background: bg,
    color: "#fff", fontSize: 16, fontWeight: 900,
    border: "none", borderRadius: 16, cursor: "pointer",
    fontFamily: "'Fredoka One',cursive",
    boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
    width: "100%", maxWidth: 280,
  }),
};
