

import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL;

const TOPIC_LABELS = {
  "safe-drinking-water":                      "Safe Drinking Water",
  "hand-washing-and-personal-hygiene":        "Handwashing & Personal Hygiene",
  "toilet-and-sanpracticesitation-practices": "Toilet & Sanitation Practices",
  "water-borne-diseases-and-prevention":      "Water-Borne Diseases & Prevention",
  "water-conservation-and-environment-care":  "Water Conservation & Environment Care",
};

// Mapping from possible slug variations to the correct topicId
// This handles cases where the URL slug might differ from the database topicId
const TOPIC_SLUG_MAP = {

  // Standard slugs (pass through)
  "safe-drinking-water": "safe-drinking-water",
  "hand-washing-and-personal-hygiene": "hand-washing-and-personal-hygiene",
  "toilet-and-sanpracticesitation-practices": "toilet-and-sanpracticesitation-practices",
  "water-borne-diseases-and-prevention": "water-borne-diseases-and-prevention",
  "water-conservation-and-environment-care": "water-conservation-and-environment-care",

  // Variations that might be generated from topic titles

  "handwashing-and-personal-hygiene": "hand-washing-and-personal-hygiene",
  "handwashing-personal-hygiene": "hand-washing-and-personal-hygiene",
  "toilet-and-sanitation-practices": "toilet-and-sanpracticesitation-practices",
  "toilet-sanitation-practices": "toilet-and-sanpracticesitation-practices",
  "water-borne-diseases-prevention": "water-borne-diseases-and-prevention",
  "water-conservation-environment-care": "water-conservation-and-environment-care",
};

// Function to normalize topicId from URL to match database
const normalizeTopicId = (slug) => {
  if (!slug) return slug;
  const lowerSlug = slug.toLowerCase();
  // Check if we have a mapping for this slug
  if (TOPIC_SLUG_MAP[lowerSlug]) return TOPIC_SLUG_MAP[lowerSlug];
  // If it's a MongoDB ObjectId, pass it through (backend will handle it)
  if (/^[a-f\d]{24}$/i.test(slug)) return slug;
  // Otherwise return the original slug
  return slug;
};

const TOPIC_EMOJIS = {
  "safe-drinking-water":                      "💧",
  "hand-washing-and-personal-hygiene":        "🧼",
  "toilet-and-sanpracticesitation-practices": "🚽",
  "water-borne-diseases-and-prevention":      "🦠",
  "water-conservation-and-environment-care":  "🌿",
};

const TOPIC_GRADIENTS = {
  "safe-drinking-water":                      ["#0ea5e9", "#38bdf8"],
  "hand-washing-and-personal-hygiene":        ["#ec4899", "#f472b6"],
  "toilet-and-sanpracticesitation-practices": ["#10b981", "#34d399"],
  "water-borne-diseases-and-prevention":      ["#f59e0b", "#fbbf24"],
  "water-conservation-and-environment-care":  ["#22c55e", "#86efac"],
};

const DIFF_CONFIG = {
  easy:   {
    color:"#16a34a", bg:"linear-gradient(135deg,#dcfce7,#bbf7d0)",
    glow:"#16a34a", icon:"⭐", label:"Easy",
    desc:"Perfect for starters! Fun & simple!", badge:"BEGINNER", badgeColor:"#16a34a",
    textColor:"#14532d",
  },
  medium: {
    color:"#d97706", bg:"linear-gradient(135deg,#fef3c7,#fde68a)",
    glow:"#d97706", icon:"⭐⭐", label:"Medium",
    desc:"A bit trickier — you've got this!", badge:"EXPLORER", badgeColor:"#d97706",
    textColor:"#78350f",
  },
  hard:   {
    color:"#7c3aed", bg:"linear-gradient(135deg,#ede9fe,#ddd6fe)",
    glow:"#7c3aed", icon:"⭐⭐⭐", label:"Hard",
    desc:"The ultimate challenge awaits!", badge:"CHAMPION", badgeColor:"#7c3aed",
    textColor:"#4c1d95",
  },
};

const FONTS = "https://fonts.googleapis.com/css2?family=Bubblegum+Sans&family=Nunito:wght@400;700;800;900;1000&display=swap";

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bubblegum+Sans&family=Nunito:wght@400;700;800;900;1000&display=swap');
  @keyframes float   { 0%,100%{transform:translateY(0) rotate(-2deg);} 50%{transform:translateY(-12px) rotate(2deg);} }
  @keyframes fadeUp  { from{opacity:0;transform:translateY(24px);} to{opacity:1;transform:translateY(0);} }
  @keyframes pulse   { 0%,100%{transform:scale(1);} 50%{transform:scale(1.06);} }
  @keyframes pop     { 0%{transform:scale(0.5);opacity:0;} 80%{transform:scale(1.08);} 100%{transform:scale(1);opacity:1;} }
  @keyframes wiggle  { 0%,100%{transform:rotate(-4deg);} 50%{transform:rotate(4deg);} }
  @keyframes rainbowBg { 0%{background-position:0% 50%;} 50%{background-position:100% 50%;} 100%{background-position:0% 50%;} }
  @keyframes shimmer { 0%{transform:translateX(-100%);} 100%{transform:translateX(200%);} }
  @keyframes bounce  { 0%,100%{transform:scale(1);} 50%{transform:scale(1.1);} }
  * { box-sizing: border-box; }

  .diff-card:hover { transform: translateY(-6px) scale(1.02) !important; box-shadow: 0 16px 40px rgba(0,0,0,0.18) !important; }
  .diff-card       { transition: transform 0.2s ease, box-shadow 0.2s ease; }

  .age-btn:hover { transform: scale(1.08) rotate(-2deg) !important; }
  .age-btn       { transition: transform 0.2s ease; }

  .play-btn:hover { transform: scale(1.1) !important; }
  .play-btn       { transition: all 0.18s ease; }
`;

export default function GameSelectionPage() {
  const { topicId } = useParams();
  const navigate    = useNavigate();
  const location    = useLocation();

  const token =
    localStorage.getItem("aquachamp_token") ||
    localStorage.getItem("userToken") ||
    localStorage.getItem("superAdminToken");

  // Get username from multiple possible localStorage keys
  
  // Use username (not firstName) as userId for game scores
  const getUsername = () => {
    // Try to get user object first (student login stores user object)
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

  const getInitialAgeGroup = () => {

 
    if (location.state?.ageGroup && !location.state?.fromLessons) {
      console.log("🎮 Using ageGroup from navigation state:", location.state.ageGroup);
      return location.state.ageGroup;
    }
    // From localStorage (stored by student dashboard) - only use if NOT coming from lessons
    if (!location.state?.fromLessons) {
      const storedAgeGroup = localStorage.getItem("aquachamp_ageGroup") || localStorage.getItem("ageGroup");
      if (storedAgeGroup) {
        // FIX: If stored as "6-10", convert to "5-10" to match games
        if (storedAgeGroup === "6-10") return "5-10";
        console.log("🎮 Using ageGroup from localStorage:", storedAgeGroup);
        return storedAgeGroup;
      }
      // From user object
      const userStr = localStorage.getItem("aquachamp_user") || localStorage.getItem("user");
      if (userStr) {
        try {
          const userObj = JSON.parse(userStr);
          const age = userObj.age;
          if (age >= 5 && age <= 10) return "5-10";
          if (age >= 11 && age <= 15) return "11-15";
        } catch {}
      }
    }
    // Return null to show age selection screen
    return null;
  };

  // Check if user came from completing lessons
  const fromLessons = location.state?.fromLessons || false;

  // Auto-read ageGroup from navigation state (set by KaveeshaSubtopicLearn)
  const [ageGroup,  setAgeGroup]  = useState(getInitialAgeGroup());
  const [progress,  setProgress]  = useState(null);
  const [games,     setGames]     = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");

  // Normalize the topicId from URL to match database topicId format
  const normalizedTopicId = normalizeTopicId(topicId);
  const topicLabel    = TOPIC_LABELS[normalizedTopicId]    || topicId;
  const topicEmoji    = TOPIC_EMOJIS[normalizedTopicId]    || "🎮";
  const topicGradient = TOPIC_GRADIENTS[normalizedTopicId] || ["#ec4899","#f472b6"];

  useEffect(() => {
    if (!ageGroup) return;
    fetchProgress();
    fetchGames();
  }, [ageGroup, normalizedTopicId]);

  // FIX: Fetch user profile if not in localStorage to get correct username and ageGroup
  useEffect(() => {
    const fetchUserProfile = async () => {
      // Check if we need to fetch or fix user data
      const userStr = localStorage.getItem("aquachamp_user");
      const storedAgeGroup = localStorage.getItem("aquachamp_ageGroup");
      
      // Need to fetch if: no user data OR ageGroup is still "6-10" (old incorrect value)
      const needFetch = !userStr || storedAgeGroup === "6-10";
      
      if (needFetch && token) {
        try {
          const res = await fetch(`${API_BASE}/api/users/profile/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            const userData = data.user;
            localStorage.setItem("aquachamp_user", JSON.stringify(userData));
            // IMPORTANT: Store username (not firstName) for game scores database
            localStorage.setItem("aquachamp_username", userData.username || userData.firstName || "Player");
            const userAgeGroup = (userData?.age >= 5 && userData?.age <= 10) ? "5-10" : "11-15";
            localStorage.setItem("aquachamp_ageGroup", userAgeGroup);
            // Update state if current is wrong
            if (ageGroup !== userAgeGroup) {
              setAgeGroup(userAgeGroup);
            }
          }
        } catch (e) {
          console.error("Failed to fetch user profile:", e);
        }
      }
    };
    fetchUserProfile();
  }, [token]);

  const fetchProgress = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/api/games/progress/${normalizedTopicId}?userId=${username}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProgress(await res.json());
    } catch {
      setProgress({ easyDone: false, mediumDone: false, hardDone: false });
    }
  };

  const fetchGames = async () => {
    setLoading(true); setError("");
    try {
      const url = `${API_BASE}/api/games?topicId=${normalizedTopicId}&ageGroup=${ageGroup}`;
      console.log("🎮 Fetching games from:", url);
      console.log("   normalizedTopicId:", normalizedTopicId);
      console.log("   ageGroup:", ageGroup);
      const res  = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      console.log("🎮 Games response:", data);
      // Handle both { games: [] } and plain array responses
      const list = Array.isArray(data) ? data : (data.games || []);
      console.log("🎮 Games list:", list);
      setGames(list);
      if (list.length === 0) {
        setError("No games found for this topic and age group. Please try a different topic or age group.");
      }
    } catch (err) {
      console.error("🎮 Error fetching games:", err);
      setError("Could not load games. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isUnlocked = (diff) => {
    if (!progress) return diff === "easy";
    if (diff === "easy")   return true;
    if (diff === "medium") return progress.easyDone;
    if (diff === "hard")   return progress.mediumDone;
    return false;
  };

  const isDone = (diff) => {
    if (!progress) return false;
    return progress[`${diff}Done`] || false;
  };

  const getGameForDiff = (diff) => games.find(g => g.difficulty === diff);

  const handlePlay = (diff) => {
    console.log('🎮 handlePlay called for:', diff);
    console.log('   isUnlocked:', isUnlocked(diff));
    console.log('   games:', games);
    console.log('   game for diff:', getGameForDiff(diff));
    
    if (!isUnlocked(diff)) {
      console.log('   ❌ Not unlocked');
      return;
    }
    const game = getGameForDiff(diff);
    if (!game) { 
      console.log('   ❌ No game found');
      setError(`No ${diff} game found for this topic and age group. Please contact your teacher or try another topic.`); 
      return; 
    }
    console.log('   ✅ Navigating to game:', game._id);
    // Navigate to the game play screen with the game ID
    navigate(`/games/play/${game._id}`, {
      state: {
        ageGroup,
        topicId: normalizedTopicId,
        userId: username,
      },
    });
  };

  // ── AGE GROUP SCREEN 
  if (!ageGroup) return (
    <div style={styles.screen}>
      <link rel="stylesheet" href={FONTS} />
      <style>{GLOBAL_CSS}</style>

      <div style={{ display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center",padding:"40px 24px",maxWidth:500,margin:"auto" }}>

        <div style={{ fontSize:90,animation:"float 3s ease-in-out infinite",marginBottom:8 }}>
          {topicEmoji}
        </div>

        <h1 style={{
          fontFamily:"'Bubblegum Sans',cursive",
          fontSize:38, margin:"0 0 4px",
          color: topicGradient[0],
          textShadow: "3px 3px 0px rgba(0,0,0,0.1)",
        }}>🎮 Topic Games!</h1>

        <p style={{ color:"#374151",fontSize:16,margin:"8px 0 6px",fontFamily:"'Nunito',sans-serif",fontWeight:800 }}>
          You crushed the <span style={{ color:topicGradient[0] }}>{topicLabel}</span> lessons! 🎉
        </p>
        <p style={{ color:"#6b7280",fontSize:14,margin:"0 0 32px",fontFamily:"'Nunito',sans-serif" }}>
          Time to put your knowledge to the test!
        </p>

        <p style={{
          color:"#374151",fontSize:13,marginBottom:20,fontFamily:"'Nunito',sans-serif",fontWeight:900,
          textTransform:"uppercase",letterSpacing:"1.5px",
        }}>Choose your age group 👇</p>

        <div style={{ display:"flex",gap:20,flexWrap:"wrap",justifyContent:"center" }}>
          {[
            { id:"5-10",  emoji:"🧒", label:"Ages 5–10",  desc:"Fun bubble & card games!", colors:["#f59e0b","#fbbf24"], bg:"linear-gradient(135deg,#fef3c7,#fde68a)" },
            { id:"11-15", emoji:"👦", label:"Ages 11–15", desc:"Quiz challenges!",         colors:["#0ea5e9","#38bdf8"], bg:"linear-gradient(135deg,#e0f2fe,#bae6fd)" },
          ].map(ag => (
            <button key={ag.id} className="age-btn" onClick={() => setAgeGroup(ag.id)} style={{
              width:180, padding:"28px 16px", borderRadius:28, cursor:"pointer",
              background: ag.bg,
              border:`4px solid ${ag.colors[0]}`,
              fontFamily:"'Nunito',sans-serif",
              display:"flex",flexDirection:"column",alignItems:"center",gap:10,
              boxShadow:`0 8px 28px ${ag.colors[0]}44`,
            }}>
              <span style={{ fontSize:56 }}>{ag.emoji}</span>
              <span style={{ fontSize:18,fontWeight:900,color:"#111827",fontFamily:"'Bubblegum Sans',cursive" }}>{ag.label}</span>
              <span style={{ fontSize:12,color:"#374151",textAlign:"center",lineHeight:1.4,fontWeight:700 }}>{ag.desc}</span>
              <div style={{
                marginTop:4,padding:"6px 18px",borderRadius:20,
                background:ag.colors[0],color:"#fff",
                fontSize:13,fontWeight:900,fontFamily:"'Bubblegum Sans',cursive",
              }}>Let's Go! →</div>
            </button>
          ))}
        </div>

        {/* Floating decorations */}
        {["⭐","🌟","✨","💫","🌈","🎈"].map((s,i) => (
          <div key={i} style={{
            position:"fixed",fontSize:24,opacity:0.4,pointerEvents:"none",zIndex:0,
            top:`${10+i*15}%`,left:`${3+i*5}%`,
            animation:`float ${3+i}s ease-in-out infinite`,animationDelay:`${i*0.7}s`,
          }}>{s}</div>
        ))}
        {["🎯","🏆","🎪","🎠"].map((s,i) => (
          <div key={i} style={{
            position:"fixed",fontSize:22,opacity:0.35,pointerEvents:"none",zIndex:0,
            top:`${15+i*18}%`,right:`${3+i*4}%`,
            animation:`float ${4+i}s ease-in-out infinite`,animationDelay:`${i*0.5}s`,
          }}>{s}</div>
        ))}
      </div>
    </div>
  );

  // ── DIFFICULTY SCREEN 
  return (
    <div style={styles.screen}>
      <link rel="stylesheet" href={FONTS} />
      <style>{GLOBAL_CSS}</style>

      {/* Header */}
      <div style={{
        padding:"14px 20px",
        background:"rgba(255,255,255,0.85)",
        backdropFilter:"blur(10px)",
        borderBottom:"3px solid #e5e7eb",
        display:"flex",alignItems:"center",gap:14,
      }}>
        {/* Go Back to Lessons button */}
        <button onClick={() => navigate('/student/dashboard')} style={{
          padding:"8px 16px",background:"linear-gradient(135deg,#ec4899,#f472b6)",
          border:"none",borderRadius:12,color:"#fff",
          fontSize:13,cursor:"pointer",fontFamily:"'Nunito',sans-serif",fontWeight:800,
          boxShadow:"0 2px 8px rgba(236,72,153,0.3)",
        }}>📚 Lessons</button>
        
        <button onClick={() => setAgeGroup(null)} style={{
          padding:"8px 16px",background:"#f3f4f6",
          border:"2px solid #d1d5db",borderRadius:12,color:"#374151",
          fontSize:13,cursor:"pointer",fontFamily:"'Nunito',sans-serif",fontWeight:800,
        }}>← Age</button>

        <div style={{ flex:1 }}>
          <div style={{
            fontSize:16,fontWeight:900,fontFamily:"'Bubblegum Sans',cursive",
            color: topicGradient[0],
          }}>{topicEmoji} {topicLabel}</div>
          <div style={{ fontSize:11,color:"#9ca3af",fontFamily:"'Nunito',sans-serif" }}>
            Age {ageGroup || "5-10"} · Playing as <strong style={{ color:"#374151" }}>{username}</strong>
          </div>
        </div>

        {/* Mini stars progress */}
        <div style={{ display:"flex",gap:4 }}>
          {["easy","medium","hard"].map(d => (
            <div key={d} style={{
              width:30,height:30,borderRadius:"50%",
              background: isDone(d) ? DIFF_CONFIG[d].color : "#f3f4f6",
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:13,border:`2px solid ${isDone(d)?DIFF_CONFIG[d].color:"#e5e7eb"}`,
              boxShadow: isDone(d)?`0 0 10px ${DIFF_CONFIG[d].color}66`:"none",
            }}>
              {isDone(d) ? "✅" : isUnlocked(d) ? "▶" : "🔒"}
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding:"20px 16px",maxWidth:580,margin:"0 auto",width:"100%" }}>

        {/* Title */}
        <div style={{ textAlign:"center",marginBottom:20 }}>
          <h2 style={{
            fontFamily:"'Bubblegum Sans',cursive",fontSize:30,margin:"0 0 6px",
            color:"#111827",
          }}>🏆 Choose Your Challenge!</h2>
          <p style={{ color:"#6b7280",fontSize:13,margin:0,fontFamily:"'Nunito',sans-serif",fontWeight:700 }}>
            Complete ⭐ Easy → ⭐⭐ Medium → ⭐⭐⭐ Hard to become a master!
          </p>
        </div>

        {loading && (
          <div style={{ textAlign:"center",padding:32,color:"#374151",fontFamily:"'Bubblegum Sans',cursive",fontSize:20 }}>
            <div style={{ fontSize:40,animation:"pulse 1s linear infinite",display:"inline-block",marginBottom:8 }}>💧</div>
            <div>Loading games...</div>
          </div>
        )}

        {error && (
          <div style={{
            background:"#fee2e2",
            border:"2px solid #dc2626",borderRadius:14,
            padding:"14px 18px",color:"#991b1b",fontSize:13,
            marginBottom:16,fontFamily:"'Nunito',sans-serif",fontWeight:700,
          }}>⚠️ {error}</div>
        )}

        {/* Difficulty cards */}
        {!loading && (
          <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
            {["easy","medium","hard"].map((diff, idx) => {
              const cfg      = DIFF_CONFIG[diff];
              const unlocked = isUnlocked(diff);
              const done     = isDone(diff);
              const game     = getGameForDiff(diff);

              return (
                <div key={diff} className="diff-card" style={{
                  background: done
                    ? cfg.bg
                    : unlocked
                      ? cfg.bg
                      : "linear-gradient(135deg,#f9fafb,#f3f4f6)",
                  border:`3px solid ${done ? cfg.color : unlocked ? cfg.color : "#e5e7eb"}`,
                  borderRadius:22,padding:"20px 22px",
                  display:"flex",alignItems:"center",gap:18,
                  opacity: unlocked ? 1 : 0.65,
                  animation:`fadeUp 0.5s ease ${idx * 0.12}s both`,
                  position:"relative",overflow:"hidden",
                  boxShadow: unlocked ? `0 8px 28px ${cfg.color}33` : "0 4px 12px rgba(0,0,0,0.08)",
                }}>

                  {/* Shimmer on unlocked+not done */}
                  {unlocked && !done && (
                    <div style={{ position:"absolute",inset:0,borderRadius:20,overflow:"hidden",pointerEvents:"none" }}>
                      <div style={{
                        position:"absolute",top:0,bottom:0,width:"40%",
                        background:`linear-gradient(90deg,transparent,rgba(255,255,255,0.5),transparent)`,
                        animation:"shimmer 2.5s ease infinite",
                      }} />
                    </div>
                  )}

                  {/* Left: big icon circle */}
                  <div style={{
                    width:72,height:72,borderRadius:20,flexShrink:0,
                    background: done
                      ? cfg.color
                      : unlocked
                        ? "#fff"
                        : "#f3f4f6",
                    border:`3px solid ${done ? cfg.color : unlocked ? cfg.color : "#e5e7eb"}`,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:done?30:26,
                    boxShadow: done ? `0 4px 16px ${cfg.color}66` : unlocked ? `0 4px 12px ${cfg.color}33` : "none",
                    animation: done ? "bounce 1.5s ease infinite" : "none",
                  }}>
                    {done ? "🏆" : unlocked ? cfg.icon : "🔒"}
                  </div>

                  {/* Middle: info */}
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap" }}>
                      <span style={{
                        fontSize:19,fontWeight:900,
                        fontFamily:"'Bubblegum Sans',cursive",
                        color: done ? cfg.textColor : unlocked ? cfg.textColor : "#9ca3af",
                      }}>{cfg.label}</span>

                      <span style={{
                        fontSize:10,padding:"3px 10px",borderRadius:20,fontWeight:900,
                        fontFamily:"'Nunito',sans-serif",letterSpacing:"0.5px",
                        background: done ? cfg.color : unlocked ? `${cfg.color}22` : "#e5e7eb",
                        color: done ? "#fff" : unlocked ? cfg.color : "#9ca3af",
                        border:`2px solid ${done ? cfg.color : unlocked ? cfg.color : "#e5e7eb"}`,
                      }}>
                        {done ? "✓ COMPLETED" : unlocked ? cfg.badge : "LOCKED"}
                      </span>
                    </div>

                    <p style={{ fontSize:12,color:"#6b7280",margin:"0 0 4px",fontFamily:"'Nunito',sans-serif",fontWeight:700 }}>
                      {cfg.desc}
                    </p>

                    {game && (
                      <div style={{
                        fontSize:11,color:unlocked?cfg.color:"#9ca3af",
                        fontFamily:"'Nunito',sans-serif",fontWeight:800,
                      }}>
                        🎮 {game.title} · {game.subType}
                      </div>
                    )}
                    {!game && !loading && (
                      <div style={{ fontSize:11,color:"#dc2626",fontFamily:"'Nunito',sans-serif",fontWeight:700 }}>
                        ⚠️ No game created yet for this difficulty
                      </div>
                    )}
                  </div>

                  {/* Right: Play button */}
                  <button
                    className="play-btn"
                    onClick={() => handlePlay(diff)}
                    disabled={!unlocked || !game}
                    style={{
                      padding:"12px 20px",
                      background: done
                        ? "#f3f4f6"
                        : (unlocked && game)
                          ? cfg.color
                          : "#e5e7eb",
                      color: done ? "#9ca3af" : (unlocked && game) ? "#fff" : "#9ca3af",
                      border:"none",borderRadius:14,
                      cursor:(unlocked && game)?"pointer":"not-allowed",
                      fontWeight:900,fontSize:15,
                      fontFamily:"'Bubblegum Sans',cursive",
                      flexShrink:0,
                      boxShadow:(unlocked && game && !done)?`0 4px 16px ${cfg.color}66`:"none",
                      animation:(unlocked && !done && game)?"pulse 2.5s ease infinite":"none",
                    }}
                  >
                    {done ? "✓ Done" : unlocked ? "▶ Play!" : "🔒"}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Progress panel */}
        {progress && (
          <div style={{
            marginTop:24,
            background:"rgba(255,255,255,0.85)",
            backdropFilter:"blur(8px)",
            border:"3px solid #e5e7eb",borderRadius:20,padding:"18px 20px",
          }}>
            <div style={{
              fontSize:12,fontWeight:900,color:"#9ca3af",
              textTransform:"uppercase",letterSpacing:"1.2px",
              marginBottom:14,fontFamily:"'Nunito',sans-serif",
            }}>📊 Your Progress</div>

            <div style={{ display:"flex",gap:12 }}>
              {["easy","medium","hard"].map(d => {
                const cfg      = DIFF_CONFIG[d];
                const done     = isDone(d);
                const unlocked = isUnlocked(d);
                return (
                  <div key={d} style={{
                    flex:1,padding:"14px 8px",borderRadius:16,textAlign:"center",
                    background: done ? cfg.bg : "#f9fafb",
                    border:`2px solid ${done?cfg.color:unlocked?`${cfg.color}66`:"#e5e7eb"}`,
                    boxShadow:done?`0 4px 16px ${cfg.color}33`:"none",
                    transition:"all 0.3s",
                  }}>
                    <div style={{ fontSize:26,marginBottom:4 }}>
                      {done?"🏆":unlocked?"▶️":"🔒"}
                    </div>
                    <div style={{
                      fontSize:12,fontWeight:900,textTransform:"capitalize",
                      color:done?cfg.textColor:unlocked?"#374151":"#9ca3af",
                      fontFamily:"'Bubblegum Sans',cursive",
                    }}>{d}</div>
                    {done && (
                      <div style={{
                        marginTop:4,fontSize:9,fontWeight:800,
                        color:cfg.color,fontFamily:"'Nunito',sans-serif",
                      }}>DONE ✓</div>
                    )}
                  </div>
                );
              })}
            </div>

            {progress.allDone && (
              <div style={{
                marginTop:16,padding:"14px",borderRadius:14,textAlign:"center",
                background:"linear-gradient(135deg,#dcfce7,#bbf7d0)",
                border:"3px solid #16a34a",
                animation:"pop 0.5s ease both",
              }}>
                <div style={{ fontSize:32,marginBottom:4 }}>🏆</div>
                <div style={{
                  color:"#15803d",fontSize:16,fontWeight:900,
                  fontFamily:"'Bubblegum Sans',cursive",
                }}>You completed ALL games for this topic!</div>
                <div style={{ color:"#166534",fontSize:12,marginTop:4,fontFamily:"'Nunito',sans-serif",fontWeight:700 }}>
                  You are an absolute champion! 🎉
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  screen: {
    minHeight:"100vh",
    background:"linear-gradient(135deg,#fef9c3 0%,#fce7f3 25%,#e0f2fe 55%,#d1fae5 80%,#fef9c3 100%)",
    backgroundSize:"400% 400%",
    animation:"rainbowBg 10s ease infinite",
    display:"flex",flexDirection:"column",
    fontFamily:"'Nunito',sans-serif",
    overflowX:"hidden",
  },
};