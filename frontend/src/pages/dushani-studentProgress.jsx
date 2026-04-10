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
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg,#4FC3F7 0%,#1D9E75 50%,#185FA5 100%)"
      }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div style={{ position: "relative", width: 72, height: 72 }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", border: "5px solid rgba(255,255,255,0.3)", borderTop: "5px solid #fff", animation: "spin 1s linear infinite" }} />
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>💧</div>
          </div>
          <p style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, color: "#fff", fontSize: 18, textShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
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

      {/* ── NAV BAR ── */}
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
      </nav>

      {/* ── MAIN CONTENT ── */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "28px 24px 32px" }}>
        
        {/* Stats Overview Cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 28
        }}>
          {/* Total Points */}
          <div style={{
            background: "linear-gradient(135deg,#185FA5,#1D9E75)",
            borderRadius: 20,
            padding: "20px",
            color: "#fff",
            boxShadow: "0 8px 24px rgba(24,95,165,0.3)"
          }}>
            <div style={{ fontSize: 12, fontWeight: 800, opacity: 0.9, marginBottom: 8 }}>💧 Total Points</div>
            <div style={{ fontSize: 36, fontWeight: 900, lineHeight: 1 }}>
              {progressData.totalPoints.toLocaleString()}
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.8, marginTop: 6 }}>
              Keep earning more!
            </div>
          </div>

          {/* Current Level */}
          <div style={{
            background: "linear-gradient(135deg,#EF9F27,#F5B85D)",
            borderRadius: 20,
            padding: "20px",
            color: "#fff",
            boxShadow: "0 8px 24px rgba(239,159,39,0.3)"
          }}>
            <div style={{ fontSize: 12, fontWeight: 800, opacity: 0.9, marginBottom: 8 }}>⭐ Current Level</div>
            <div style={{ fontSize: 32, fontWeight: 900, lineHeight: 1 }}>
              {progressData.currentLevel}
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.8, marginTop: 6 }}>
              Level up by earning points!
            </div>
          </div>

          {/* Rank */}
          <div style={{
            background: "linear-gradient(135deg,#1D9E75,#4FC3F7)",
            borderRadius: 20,
            padding: "20px",
            color: "#fff",
            boxShadow: "0 8px 24px rgba(29,158,117,0.3)"
          }}>
            <div style={{ fontSize: 12, fontWeight: 800, opacity: 0.9, marginBottom: 8 }}>🏆 Your Rank</div>
            <div style={{ fontSize: 36, fontWeight: 900, lineHeight: 1 }}>
              {progressData.rank}
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.8, marginTop: 6 }}>
              Among all students
            </div>
          </div>

          {/* Badges */}
          <div style={{
            background: "linear-gradient(135deg,#8B5CF6,#A78BFA)",
            borderRadius: 20,
            padding: "20px",
            color: "#fff",
            boxShadow: "0 8px 24px rgba(139,92,246,0.3)"
          }}>
            <div style={{ fontSize: 12, fontWeight: 800, opacity: 0.9, marginBottom: 8 }}>🏅 Badges Earned</div>
            <div style={{ fontSize: 36, fontWeight: 900, lineHeight: 1 }}>
              {progressData.badgesCount}
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.8, marginTop: 6 }}>
              Milestone achievements
            </div>
          </div>
        </div>

        {/* Points Breakdown Section */}
        <div style={{
          background: "rgba(255,255,255,0.88)",
          borderRadius: 28,
          border: "3px solid #B8D4EE",
          boxShadow: "0 8px 36px rgba(24,95,165,0.13)",
          padding: "24px 28px",
          position: "relative",
          overflow: "hidden"
        }}>
          {/* Rainbow top bar */}
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 8,
            background: "linear-gradient(90deg,#4FC3F7,#185FA5,#1D9E75,#EF9F27,#4FC3F7)",
            borderRadius: "26px 26px 0 0"
          }} />

          {/* Section header */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, paddingTop: 6 }}>
            <div style={{
              width: 42,
              height: 42,
              borderRadius: 14,
              background: "linear-gradient(135deg,#EF9F27,#F7C46A)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              boxShadow: "0 4px 12px rgba(239,159,39,0.3)"
            }}>📊</div>
            <div>
              <span style={{ fontWeight: 900, color: "#042C53", fontSize: 18 }}>Points Breakdown</span>
              <p style={{ margin: "2px 0 0", fontSize: 12, fontWeight: 800, color: "#1D9E75" }}>
                See how you earned your points! 🎯
              </p>
            </div>
          </div>

          {/* Points Breakdown Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 16,
            marginBottom: 20
          }}>
            {/* Game Points */}
            <div style={{
              background: "#fff",
              borderRadius: 16,
              padding: "18px",
              border: "2.5px solid #E6F1FB",
              boxShadow: "0 3px 12px rgba(24,95,165,0.08)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{
                  width: 42,
                  height: 42,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg,#E6F1FB,#C8E6FA)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20
                }}>🎮</div>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#7A8CA5" }}>Game Points</div>
              </div>
              <div style={{ fontSize: 28, fontWeight: 900, color: "#185FA5", lineHeight: 1 }}>
                {progressData.pointsBreakdown?.gamePoints || 0}
              </div>
              <div style={{ fontSize: 11, color: "#7A8CA5", fontWeight: 700, marginTop: 6 }}>
                From {(progressData.pointsBreakdown?.games || []).length} games played
              </div>
            </div>

            {/* Daily Login Points */}
            <div style={{
              background: "#fff",
              borderRadius: 16,
              padding: "18px",
              border: "2.5px solid #FEF6E8",
              boxShadow: "0 3px 12px rgba(239,159,39,0.08)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{
                  width: 42,
                  height: 42,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg,#FEF6E8,#FDE9BF)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20
                }}>📅</div>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#7A8CA5" }}>Daily Login Points</div>
              </div>
              <div style={{ fontSize: 28, fontWeight: 900, color: "#EF9F27", lineHeight: 1 }}>
                {progressData.pointsBreakdown?.dailyLoginPoints || 0}
              </div>
              <div style={{ fontSize: 11, color: "#7A8CA5", fontWeight: 700, marginTop: 6 }}>
                10 pts per daily login
              </div>
            </div>

            {/* User Points */}
            <div style={{
              background: "#fff",
              borderRadius: 16,
              padding: "18px",
              border: "2.5px solid #F3E8FF",
              boxShadow: "0 3px 12px rgba(139,92,246,0.08)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{
                  width: 42,
                  height: 42,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg,#F3E8FF,#E9D5FF)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20
                }}>⭐</div>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#7A8CA5" }}>Activity Points</div>
              </div>
              <div style={{ fontSize: 28, fontWeight: 900, color: "#8B5CF6", lineHeight: 1 }}>
                {progressData.pointsBreakdown?.userPoints || 0}
              </div>
              <div style={{ fontSize: 11, color: "#7A8CA5", fontWeight: 700, marginTop: 6 }}>
                From other activities
              </div>
            </div>
          </div>

          {/* Total Points Summary */}
          <div style={{
            background: "linear-gradient(135deg,#185FA5,#1D9E75)",
            borderRadius: 18,
            padding: "20px 24px",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 6px 20px rgba(24,95,165,0.3)"
          }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, opacity: 0.9, marginBottom: 4 }}>Total Points Earned</div>
              <div style={{ fontSize: 36, fontWeight: 900, lineHeight: 1 }}>
                {progressData.totalPoints.toLocaleString()}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 13, fontWeight: 800, opacity: 0.9, marginBottom: 4 }}>Current Level</div>
              <div style={{ fontSize: 28, fontWeight: 900, lineHeight: 1 }}>
                {progressData.currentLevel}
              </div>
            </div>
          </div>
        </div>

        {/* Game History Section */}
        {(progressData.pointsBreakdown?.games || []).length > 0 && (
          <div style={{
            marginTop: 24,
            background: "rgba(255,255,255,0.88)",
            borderRadius: 28,
            border: "3px solid #B8D4EE",
            boxShadow: "0 8px 36px rgba(24,95,165,0.13)",
            padding: "24px 28px",
            position: "relative",
            overflow: "hidden"
          }}>
            {/* Rainbow top bar */}
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 8,
              background: "linear-gradient(90deg,#4FC3F7,#185FA5,#1D9E75,#EF9F27,#4FC3F7)",
              borderRadius: "26px 26px 0 0"
            }} />

            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, paddingTop: 6 }}>
              <div style={{
                width: 42,
                height: 42,
                borderRadius: 14,
                background: "linear-gradient(135deg,#185FA5,#4FC3F7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                boxShadow: "0 4px 12px rgba(24,95,165,0.3)"
              }}>🎮</div>
              <div>
                <span style={{ fontWeight: 900, color: "#042C53", fontSize: 18 }}>Game History</span>
                <p style={{ margin: "2px 0 0", fontSize: 12, fontWeight: 800, color: "#1D9E75" }}>
                  Your game performance details 🎯
                </p>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {progressData.pointsBreakdown.games.map((game, index) => (
                <div 
                  key={game.gameId || index}
                  style={{
                    background: "#fff",
                    borderRadius: 16,
                    padding: "16px 18px",
                    border: "2.5px solid #E6F1FB",
                    boxShadow: "0 3px 12px rgba(24,95,165,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1 }}>
                    <div style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg,#E6F1FB,#C8E6FA)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 22,
                      flexShrink: 0
                    }}>🎮</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 900, color: "#042C53" }}>
                        {game.gameName}
                      </div>
                      <div style={{ fontSize: 11, color: "#7A8CA5", fontWeight: 700, marginTop: 3 }}>
                        {game.playedAt ? new Date(game.playedAt).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: "#185FA5" }}>
                      {game.score}
                    </div>
                    <div style={{ fontSize: 11, color: "#7A8CA5", fontWeight: 700 }}>
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
          <div style={{
            marginTop: 24,
            background: "rgba(255,255,255,0.88)",
            borderRadius: 28,
            border: "3px solid #A8DCC8",
            boxShadow: "0 8px 36px rgba(29,158,117,0.13)",
            padding: "24px 28px",
            position: "relative",
            overflow: "hidden"
          }}>
            {/* Rainbow top bar */}
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 8,
              background: "linear-gradient(90deg,#1D9E75,#185FA5,#EF9F27,#4FC3F7,#1D9E75)",
              borderRadius: "26px 26px 0 0"
            }} />

            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, paddingTop: 6 }}>
              <div style={{
                width: 42,
                height: 42,
                borderRadius: 14,
                background: "linear-gradient(135deg,#1D9E75,#4FC3F7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                boxShadow: "0 4px 12px rgba(29,158,117,0.3)"
              }}>🏅</div>
              <div>
                <span style={{ fontWeight: 900, color: "#042C53", fontSize: 18 }}>Earned Badges</span>
                <p style={{ margin: "2px 0 0", fontSize: 12, fontWeight: 800, color: "#185FA5" }}>
                  Your achievements ({progressData.badgesCount}) 🎉
                </p>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 14 }}>
              {progressData.badges.map((badge, index) => (
                <div
                  key={badge.badgeId || index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "14px",
                    borderRadius: 16,
                    background: "linear-gradient(135deg,#F4F9FF,#E6F1FB)",
                    border: "2.5px solid #B8D4EE",
                    boxShadow: "0 3px 12px rgba(24,95,165,0.08)"
                  }}
                >
                  <div style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg,#185FA5,#1D9E75)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 26,
                    flexShrink: 0,
                    boxShadow: "0 4px 12px rgba(24,95,165,0.25)"
                  }}>
                    {badge.badgeIcon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 900, color: "#042C53", marginBottom: 4 }}>
                      {badge.badgeName}
                    </div>
                    <div style={{ fontSize: 12, color: "#185FA5", fontWeight: 700, lineHeight: 1.4 }}>
                      {badge.description}
                    </div>
                    <div style={{ fontSize: 11, color: "#7A8CA5", fontWeight: 600, marginTop: 6 }}>
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
      <footer style={{
        background: "linear-gradient(90deg,#042C53,#185FA5,#1D9E75)",
        padding: "12px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        overflow: "hidden",
        position: "relative"
      }}>
        <Wave color="rgba(255,255,255,0.08)" />
        <span style={{ fontSize: 18, zIndex: 1 }}>🐠</span>
        <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,0.9)", zIndex: 1 }}>
          💧 Keep learning and earning points, AquaChamp! 🌊
        </p>
        <WaterDrop size={14} color="rgba(255,255,255,0.5)" style={{ zIndex: 1 }} />
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@600;700;800;900&display=swap');
        @keyframes floatSlow { 0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-16px) rotate(8deg)} }
        @keyframes floatUp { 0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-12px) scale(1.1)} }
        @keyframes spin { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}
