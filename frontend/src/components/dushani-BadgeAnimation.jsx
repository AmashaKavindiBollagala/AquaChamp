import { useState, useEffect, useRef } from "react";
import Lottie from "lottie-react";
import axios from "axios";

// Animation mapping based on badge type
const badgeAnimations = {
  'Milestone': '/animations/confetti.json',
  'Section Completion': '/animations/award.json',
  'Special': '/animations/Premium.json'
};

// Helper function to get animation URL based on badge type
const getAnimationURL = (badgeType) => {
  const localPath = badgeAnimations[badgeType] || badgeAnimations['Milestone'];
  return localPath;
};

export default function BadgeAnimation() {
  const [currentBadge, setCurrentBadge] = useState(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [animationData, setAnimationData] = useState(null);
  const pollingRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    // Start polling for untriggered badge animations
    startPolling();

    return () => {
      // Cleanup on unmount
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Load animation when badge is detected
  useEffect(() => {
    if (currentBadge && showAnimation) {
      const badgeType = currentBadge.badgeDetails?.badgeType || 'Milestone';
      const animationPath = getAnimationURL(badgeType);

      // Load local animation
      fetch(animationPath)
        .then((res) => {
          if (!res.ok) throw new Error(`Animation file not found: ${animationPath}`);
          return res.json();
        })
        .then((data) => {
          console.log(`✅ Loaded local animation for ${badgeType}: ${animationPath}`);
          setAnimationData(data);
        })
        .catch((err) => {
          console.error(`❌ Error loading animation: ${err.message}`);
        });
    }
  }, [currentBadge, showAnimation]);

  const startPolling = () => {
    // Check immediately
    checkForUntriggeredAnimations();

    // Then poll every 5 seconds
    pollingRef.current = setInterval(() => {
      if (!showAnimation) {
        checkForUntriggeredAnimations();
      }
    }, 5000);
  };

  const checkForUntriggeredAnimations = async () => {
    try {
      let token = localStorage.getItem("aquachamp_token");
      if (!token) {
        token = sessionStorage.getItem("aquachamp_token");
      }

      if (!token) return;

      const config = {
        headers: { 
          Authorization: `Bearer ${token}`
        },
        timeout: 10000
      };

      const response = await axios.get(
        "http://localhost:4000/api/badge-notifications/animations",
        config
      );

      if (response.data.success && response.data.animations.length > 0) {
        // Get the most recent untriggered animation
        const latestAnimation = response.data.animations[0];
        
        if (!showAnimation) {
          setCurrentBadge(latestAnimation);
          setShowAnimation(true);

          // Mark as triggered after animation starts
          await markAsTriggered(latestAnimation._id);
        }
      }
    } catch (error) {
      console.error("❌ [BadgeAnimation] Error checking animations:", error);
    }
  };

  const markAsTriggered = async (notificationId) => {
    try {
      let token = localStorage.getItem("aquachamp_token");
      if (!token) {
        token = sessionStorage.getItem("aquachamp_token");
      }

      if (!token) return;

      const config = {
        headers: { 
          Authorization: `Bearer ${token}`
        },
        timeout: 10000
      };

      await axios.put(
        `http://localhost:4000/api/badge-notifications/${notificationId}/triggered`,
        {},
        config
      );

      console.log("✅ [BadgeAnimation] Marked as triggered");
    } catch (error) {
      console.error("❌ [BadgeAnimation] Error marking as triggered:", error);
    }
  };

  const handleClose = () => {
    setShowAnimation(false);
    setCurrentBadge(null);
  };

  if (!showAnimation || !currentBadge) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(4, 44, 83, 0.85)",
        backdropFilter: "blur(12px)",
        animation: "fadeIn 0.3s ease-out"
      }}
      onClick={handleClose}
    >
      {/* Animated background particles */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: Math.random() * 10 + 5,
              height: Math.random() * 10 + 5,
              borderRadius: "50%",
              background: ["#EF9F27", "#185FA5", "#1D9E75", "#4FC3F7", "#F7B955"][
                Math.floor(Math.random() * 5)
              ],
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `floatUp ${Math.random() * 3 + 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
              opacity: 0.6
            }}
          />
        ))}
      </div>

      {/* Main celebration card */}
      <div
        style={{
          position: "relative",
          background: "linear-gradient(145deg, #FFFFFF, #F4F9FF, #E6F1FB)",
          borderRadius: 24,
          padding: "28px 28px",
          maxWidth: 420,
          width: "85%",
          boxShadow: "0 20px 60px rgba(24, 95, 165, 0.4)",
          border: "3px solid #185FA5",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
          animation: "scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
          zIndex: 1
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Confetti Lottie Animation */}
        <div style={{ width: 150, height: 150, marginBottom: -10 }}>
          {animationData && (
            <Lottie
              animationData={animationData}
              loop={false}
              autoplay={true}
              style={{ width: "100%", height: "100%" }}
            />
          )}
        </div>

        {/* Celebration emoji */}
        <div
          style={{
            fontSize: 48,
            animation: "bounce 0.8s ease-in-out infinite"
          }}
        >
          🎉
        </div>

        {/* Badge icon */}
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #185FA5, #1D9E75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 30,
            boxShadow: "0 6px 18px rgba(24, 95, 165, 0.4)",
            border: "3px solid #fff",
            animation: "pulse 1.5s ease-in-out infinite"
          }}
        >
          {currentBadge.badgeDetails?.badgeIcon || "🏅"}
        </div>

        {/* Badge name */}
        <h2
          style={{
            margin: 0,
            fontSize: 22,
            fontWeight: 900,
            color: "#042C53",
            textAlign: "center",
            fontFamily: "'Nunito', sans-serif",
            textShadow: "0 2px 8px rgba(0,0,0,0.1)"
          }}
        >
          Congratulations!
        </h2>

        {/* Badge details */}
        <div style={{ textAlign: "center" }}>
          {/* Badge type badge */}
          <div
            style={{
              display: "inline-block",
              padding: "4px 12px",
              borderRadius: 16,
              background: currentBadge.badgeDetails?.badgeType === 'Milestone' 
                ? "linear-gradient(135deg, #FEF6E8, #FDE9BF)"
                : currentBadge.badgeDetails?.badgeType === 'Section Completion'
                ? "linear-gradient(135deg, #E1F5EE, #B2EDD8)"
                : "linear-gradient(135deg, #F3E8FF, #E9D5FF)",
              border: `2px solid ${
                currentBadge.badgeDetails?.badgeType === 'Milestone' 
                  ? "#EF9F27" 
                  : currentBadge.badgeDetails?.badgeType === 'Section Completion'
                  ? "#1D9E75"
                  : "#9333EA"
              }`,
              marginBottom: 8
            }}
          >
            <span
              style={{
                fontSize: 10,
                fontWeight: 900,
                color: currentBadge.badgeDetails?.badgeType === 'Milestone' 
                  ? "#C97900" 
                  : currentBadge.badgeDetails?.badgeType === 'Section Completion'
                  ? "#1D9E75"
                  : "#9333EA",
                fontFamily: "'Nunito', sans-serif",
                textTransform: "uppercase",
                letterSpacing: 0.5
              }}
            >
              {currentBadge.badgeDetails?.badgeType} Badge
            </span>
          </div>

          <p
            style={{
              margin: "0 0 6px",
              fontSize: 17,
              fontWeight: 900,
              color: "#185FA5",
              fontFamily: "'Nunito', sans-serif"
            }}
          >
            You earned: {currentBadge.badgeDetails?.badgeName}
          </p>
          <p
            style={{
              margin: 0,
              fontSize: 12,
              fontWeight: 700,
              color: "#7A8CA5",
              lineHeight: 1.5,
              fontFamily: "'Nunito', sans-serif"
            }}
          >
            {currentBadge.badgeDetails?.description}
          </p>
        </div>

        {/* Motivational message */}
        <div
          style={{
            padding: "10px 16px",
            borderRadius: 14,
            background: "linear-gradient(135deg, #FEF6E8, #FDE9BF)",
            border: "2px solid #EF9F27",
            textAlign: "center"
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 12,
              fontWeight: 800,
              color: "#C97900",
              fontFamily: "'Nunito', sans-serif"
            }}
          >
            🌟 Keep up the amazing work, AquaChamp! 🌊
          </p>
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          style={{
            width: "100%",
            padding: "12px 0",
            borderRadius: 16,
            background: "linear-gradient(90deg, #185FA5, #1D9E75)",
            color: "#fff",
            fontWeight: 900,
            fontSize: 14,
            border: "none",
            cursor: "pointer",
            fontFamily: "'Nunito', sans-serif",
            boxShadow: "0 5px 16px rgba(24, 95, 165, 0.35)",
            transition: "all 0.2s",
            marginTop: 6
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
          onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          Continue Learning! 🚀
        </button>
      </div>

      {/* CSS Animations */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@600;700;800;900&display=swap');
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.7);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 8px 24px rgba(24, 95, 165, 0.4);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 12px 32px rgba(24, 95, 165, 0.6);
          }
        }
        
        @keyframes floatUp {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
            opacity: 0.6;
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
