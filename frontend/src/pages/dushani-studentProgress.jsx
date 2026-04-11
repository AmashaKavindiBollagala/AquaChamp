import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// ── Water Drop SVG ────────────────────────────────────────────────────────
const WaterDrop = ({ size = 24, color = "#185FA5", style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={style}>
    <path d="M12 2 C12 2 5 10 5 15 C5 18.866 8.134 22 12 22 C15.866 22 19 18.866 19 15 C19 10 12 2 12 2Z" />
  </svg>
);

const Bubble = ({ size = 16, color = "#185FA530", style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <circle cx="12" cy="12" r="10" fill="none" stroke={color} strokeWidth="2.5" />
    <circle cx="8" cy="8" r="2" fill={color} />
  </svg>
);

const Wave = ({ color = "#185FA520" }) => (
  <svg viewBox="0 0 1200 60" preserveAspectRatio="none" style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: 40, pointerEvents: "none" }}>
    <path d="M0,30 C150,60 350,0 600,30 C850,60 1050,0 1200,30 L1200,60 L0,60 Z" fill={color} />
  </svg>
);

export default function DushaniStudentProgress() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState({
    totalPoints: 0,
    currentLevel: 'N/A',
    rank: 'N/A',
    badgesCount: 0,
    badges: [],
    pointsBreakdown: {
      gamePoints: 0,
      games: [],
      userPoints: 0,
      dailyLoginPoints: 0
    }
  });

  useEffect(() => {
    const fetchProgressData = async () => {
      try {
        let token = localStorage.getItem("aquachamp_token");
        if (!token) {
          token = sessionStorage.getItem("aquachamp_token");
        }

        if (!token) {
          navigate("/login");
          return;
        }

        const config = {
          headers: { 
            Authorization: `Bearer ${token}`
          },
          timeout: 10000
        };

        const response = await axios.get("http://localhost:4000/api/points/my-status", config);

        if (response.data.success) {
          setProgressData(response.data.data);
        }
      } catch (error) {
        console.error("❌ [Progress] Error:", error);
        navigate("/profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProgressData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: "linear-gradient(135deg,#4FC3F7 0%,#1D9E75 50%,#185FA5 100%)" }}>
        <div className="flex flex-col items-center gap-4 p-4">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20">
            <div className="w-full h-full rounded-full border-4 border-white/30 border-t-white animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center text-2xl sm:text-3xl">💧</div>
          </div>
          <p className="font-nunito font-black text-white text-base sm:text-lg text-center" 
             style={{ textShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
            Loading your progress... 📊
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg,#C8E6FA 0%,#B2EDD8 35%,#FEE9BF 70%,#C8E6FA 100%)",
      fontFamily: "'Nunito', sans-serif",
      position: "relative",
      overflowX: "hidden",
    }}>
      {/* Floating decorative BG elements */}
      <WaterDrop size={90} color="#185FA518" style={{ position: "absolute", top: 60, left: 20, animation: "floatSlow 8s ease-in-out infinite", pointerEvents: "none" }} />
      <WaterDrop size={60} color="#1D9E7518" style={{ position: "absolute", top: 200, right: 40, animation: "floatSlow 6s ease-in-out infinite 2s", pointerEvents: "none" }} />
      <Bubble size={40} color="#185FA535" style={{ position: "absolute", top: 350, left: "18%", animation: "floatUp 5s ease-in-out infinite", pointerEvents: "none" }} />
      <Bubble size={28} color="#1D9E7535" style={{ position: "absolute", top: "40%", right: "12%", animation: "floatUp 7s ease-in-out infinite 1.5s", pointerEvents: "none" }} />

      {/* ── NAV BAR ──
      <nav style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 32px",
        background: "linear-gradient(90deg,#042C53,#185FA5,#1496C8,#1D9E75)",
        boxShadow: "0 4px 24px rgba(24,95,165,0.35)",
        flexShrink: 0,
        position: "relative",
        overflow: "hidden"
      }}>
        <Wave color="rgba(255,255,255,0.1)" />
        <div style={{ display: "flex", alignItems: "center", gap: 12, zIndex: 1 }}>
          <button
            onClick={() => navigate("/profile")}
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: "rgba(255,255,255,0.2)",
              border: "2px solid rgba(255,255,255,0.4)",
              color: "#fff",
              fontSize: 18,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s"
            }}
            onMouseOver={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.3)"}
            onMouseOut={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
          >
            ←
          </button>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255,255,255,0.25)",
            border: "2px solid rgba(255,255,255,0.5)",
            fontSize: 22
          }}>📊</div>
          <div>
            <span style={{ fontWeight: 900, fontSize: 20, color: "#fff", letterSpacing: -0.5, display: "block", lineHeight: 1 }}>
              My Progress
            </span>
            <span style={{ fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.85)", letterSpacing: 1.2 }}>
              POINTS BREAKDOWN
            </span>
          </div>
        </div>
        <div style={{ zIndex: 1 }}>
          <button
            onClick={() => navigate("/profile")}
            style={{
              padding: "9px 18px",
              borderRadius: 14,
              background: "rgba(255,255,255,0.2)",
              border: "2px solid rgba(255,255,255,0.4)",
              color: "#fff",
              fontWeight: 900,
              fontSize: 12,
              cursor: "pointer",
              fontFamily: "'Nunito', sans-serif",
              transition: "all 0.2s"
            }}
            onMouseOver={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.3)"}
            onMouseOut={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
          >
            ← Back to Profile
          </button>
        </div>
      </nav> */}

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        
        {/* Stats Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
          {/* Total Points */}
          <div className="rounded-2xl p-5 text-white"
               style={{ background: "linear-gradient(135deg,#185FA5,#1D9E75)", boxShadow: "0 8px 24px rgba(24,95,165,0.3)" }}>
            <div className="text-xs font-extrabold opacity-90 mb-2">💧 Total Points</div>
            <div className="text-3xl sm:text-4xl font-black leading-tight">
              {progressData.totalPoints.toLocaleString()}
            </div>
            <div className="text-xs font-bold opacity-80 mt-1.5">
              Keep earning more!
            </div>
          </div>

          {/* Current Level */}
          <div className="rounded-2xl p-5 text-white"
               style={{ background: "linear-gradient(135deg,#EF9F27,#F5B85D)", boxShadow: "0 8px 24px rgba(239,159,39,0.3)" }}>
            <div className="text-xs font-extrabold opacity-90 mb-2">⭐ Current Level</div>
            <div className="text-2xl sm:text-3xl font-black leading-tight">
              {progressData.currentLevel}
            </div>
            <div className="text-xs font-bold opacity-80 mt-1.5">
              Level up by earning points!
            </div>
          </div>

          {/* Rank */}
          <div className="rounded-2xl p-5 text-white"
               style={{ background: "linear-gradient(135deg,#1D9E75,#4FC3F7)", boxShadow: "0 8px 24px rgba(29,158,117,0.3)" }}>
            <div className="text-xs font-extrabold opacity-90 mb-2">🏆 Your Rank</div>
            <div className="text-3xl sm:text-4xl font-black leading-tight">
              {progressData.rank}
            </div>
            <div className="text-xs font-bold opacity-80 mt-1.5">
              Among all students
            </div>
          </div>

          {/* Badges */}
          <div className="rounded-2xl p-5 text-white"
               style={{ background: "linear-gradient(135deg,#8B5CF6,#A78BFA)", boxShadow: "0 8px 24px rgba(139,92,246,0.3)" }}>
            <div className="text-xs font-extrabold opacity-90 mb-2">🏅 Badges Earned</div>
            <div className="text-3xl sm:text-4xl font-black leading-tight">
              {progressData.badgesCount}
            </div>
            <div className="text-xs font-bold opacity-80 mt-1.5">
              Milestone achievements
            </div>
          </div>
        </div>

        {/* Points Breakdown Section */}
        <div className="bg-white/88 rounded-3xl border-2 border-[#B8D4EE] shadow-lg p-5 sm:p-7 relative overflow-hidden">
          {/* Rainbow top bar */}
          <div className="absolute top-0 left-0 right-0 h-2"
               style={{ background: "linear-gradient(90deg,#4FC3F7,#185FA5,#1D9E75,#EF9F27,#4FC3F7)" }} />

          {/* Section header */}
          <div className="flex items-center gap-3 mb-5 pt-2">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xl sm:text-2xl flex-shrink-0"
                 style={{ background: "linear-gradient(135deg,#EF9F27,#F7C46A)", boxShadow: "0 4px 12px rgba(239,159,39,0.3)" }}>
              📊
            </div>
            <div>
              <span className="font-black text-[#042C53] text-base sm:text-lg block">Points Breakdown</span>
              <p className="text-xs font-extrabold text-[#1D9E75] mt-0.5">
                See how you earned your points! 🎯
              </p>
            </div>
          </div>

          {/* Points Breakdown Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
            {/* Game Points */}
            <div className="bg-white rounded-xl p-4 border-2 border-[#E6F1FB] shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-xl sm:text-2xl flex-shrink-0"
                     style={{ background: "linear-gradient(135deg,#E6F1FB,#C8E6FA)" }}>
                  🎮
                </div>
                <div className="text-xs font-extrabold text-[#7A8CA5]">Game Points</div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-[#185FA5] leading-tight">
                {progressData.pointsBreakdown?.gamePoints || 0}
              </div>
              <div className="text-xs text-[#7A8CA5] font-bold mt-1.5">
                From {(progressData.pointsBreakdown?.games || []).length} games played
              </div>
            </div>

            {/* Daily Login Points */}
            <div className="bg-white rounded-xl p-4 border-2 border-[#FEF6E8] shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-xl sm:text-2xl flex-shrink-0"
                     style={{ background: "linear-gradient(135deg,#FEF6E8,#FDE9BF)" }}>
                  📅
                </div>
                <div className="text-xs font-extrabold text-[#7A8CA5]">Daily Login Points</div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-[#EF9F27] leading-tight">
                {progressData.pointsBreakdown?.dailyLoginPoints || 0}
              </div>
              <div className="text-xs text-[#7A8CA5] font-bold mt-1.5">
                10 pts per daily login
              </div>
            </div>

            {/* User Points */}
            <div className="bg-white rounded-xl p-4 border-2 border-[#F3E8FF] shadow-sm sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-xl sm:text-2xl flex-shrink-0"
                     style={{ background: "linear-gradient(135deg,#F3E8FF,#E9D5FF)" }}>
                  ⭐
                </div>
                <div className="text-xs font-extrabold text-[#7A8CA5]">Activity Points</div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-[#8B5CF6] leading-tight">
                {progressData.pointsBreakdown?.userPoints || 0}
              </div>
              <div className="text-xs text-[#7A8CA5] font-bold mt-1.5">
                From other activities
              </div>
            </div>
          </div>

          {/* Total Points Summary */}
          <div className="rounded-2xl p-5 sm:p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4"
               style={{ background: "linear-gradient(135deg,#185FA5,#1D9E75)", boxShadow: "0 6px 20px rgba(24,95,165,0.3)" }}>
            <div className="text-center sm:text-left">
              <div className="text-sm font-extrabold opacity-90 mb-1">Total Points Earned</div>
              <div className="text-3xl sm:text-4xl font-black leading-tight">
                {progressData.totalPoints.toLocaleString()}
              </div>
            </div>
            <div className="text-center sm:text-right">
              <div className="text-sm font-extrabold opacity-90 mb-1">Current Level</div>
              <div className="text-2xl sm:text-3xl font-black leading-tight">
                {progressData.currentLevel}
              </div>
            </div>
          </div>
        </div>

        {/* Game History Section */}
        {(progressData.pointsBreakdown?.games || []).length > 0 && (
          <div className="mt-6 bg-white/88 rounded-3xl border-2 border-[#B8D4EE] shadow-lg p-5 sm:p-7 relative overflow-hidden">
            {/* Rainbow top bar */}
            <div className="absolute top-0 left-0 right-0 h-2"
                 style={{ background: "linear-gradient(90deg,#4FC3F7,#185FA5,#1D9E75,#EF9F27,#4FC3F7)" }} />

            <div className="flex items-center gap-3 mb-5 pt-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xl sm:text-2xl flex-shrink-0"
                   style={{ background: "linear-gradient(135deg,#185FA5,#4FC3F7)", boxShadow: "0 4px 12px rgba(24,95,165,0.3)" }}>
                🎮
              </div>
              <div>
                <span className="font-black text-[#042C53] text-base sm:text-lg block">Game History</span>
                <p className="text-xs font-extrabold text-[#1D9E75] mt-0.5">
                  Your game performance details 🎯
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {progressData.pointsBreakdown.games.map((game, index) => (
                <div 
                  key={game.gameId || index}
                  className="bg-white rounded-xl p-4 border-2 border-[#E6F1FB] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-xl sm:text-2xl flex-shrink-0"
                         style={{ background: "linear-gradient(135deg,#E6F1FB,#C8E6FA)" }}>
                      🎮
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm sm:text-base font-black text-[#042C53] truncate">
                        {game.gameName}
                      </div>
                      <div className="text-xs text-[#7A8CA5] font-bold mt-0.5">
                        {game.playedAt ? new Date(game.playedAt).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xl sm:text-2xl font-black text-[#185FA5]">
                      {game.score}
                    </div>
                    <div className="text-xs text-[#7A8CA5] font-bold">
                      / {game.maxScore} pts ({game.percentage?.toFixed(1) || 0}%)
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Badges Section */}
        {progressData.badges && progressData.badges.length > 0 && (
          <div className="mt-6 bg-white/88 rounded-3xl border-2 border-[#A8DCC8] shadow-lg p-5 sm:p-7 relative overflow-hidden">
            {/* Rainbow top bar */}
            <div className="absolute top-0 left-0 right-0 h-2"
                 style={{ background: "linear-gradient(90deg,#1D9E75,#185FA5,#EF9F27,#4FC3F7,#1D9E75)" }} />

            <div className="flex items-center gap-3 mb-5 pt-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xl sm:text-2xl flex-shrink-0"
                   style={{ background: "linear-gradient(135deg,#1D9E75,#4FC3F7)", boxShadow: "0 4px 12px rgba(29,158,117,0.3)" }}>
                🏅
              </div>
              <div>
                <span className="font-black text-[#042C53] text-base sm:text-lg block">Earned Badges</span>
                <p className="text-xs font-extrabold text-[#185FA5] mt-0.5">
                  Your achievements ({progressData.badgesCount}) 🎉
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {progressData.badges.map((badge, index) => (
                <div
                  key={badge.badgeId || index}
                  className="flex items-center gap-3 sm:gap-4 p-4 rounded-xl bg-gradient-to-br from-[#F4F9FF] to-[#E6F1FB] border-2 border-[#B8D4EE] shadow-sm"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-2xl sm:text-3xl flex-shrink-0"
                       style={{ background: "linear-gradient(135deg,#185FA5,#1D9E75)", boxShadow: "0 4px 12px rgba(24,95,165,0.25)" }}>
                    {badge.badgeIcon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-black text-[#042C53] mb-1 truncate">
                      {badge.badgeName}
                    </div>
                    <div className="text-xs text-[#185FA5] font-bold leading-tight line-clamp-2">
                      {badge.description}
                    </div>
                    <div className="text-xs text-[#7A8CA5] font-semibold mt-1.5">
                      Earned: {new Date(badge.earnedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── FOOTER ── */}
      <footer className="px-6 sm:px-8 py-3 flex items-center justify-center gap-3 overflow-hidden relative"
              style={{ background: "linear-gradient(90deg,#042C53,#185FA5,#1D9E75)" }}>
        <Wave color="rgba(255,255,255,0.08)" />
        <span className="text-lg sm:text-xl z-10">🐠</span>
        <p className="text-xs sm:text-sm font-extrabold text-white/90 z-10 text-center">
          💧 Keep learning and earning points, AquaChamp! 🌊
        </p>
        <WaterDrop size={14} color="rgba(255,255,255,0.5)" className="z-10" />
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@600;700;800;900&display=swap');
        @keyframes floatSlow { 0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-16px) rotate(8deg)} }
        @keyframes floatUp { 0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-12px) scale(1.1)} }
        @keyframes spin { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }
        * { box-sizing: border-box; }
        
        /* Responsive utilities */
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        /* Mobile optimizations */
        @media (max-width: 640px) {
          .max-w-5xl {
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
