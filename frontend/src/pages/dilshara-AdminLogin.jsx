import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL;

export default function DilsharaAdminLogin() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!form.username.trim()) e.username = "Username is required";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6) e.password = "Min 6 characters";
    return e;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
    setServerError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    setServerError("");
    try {
      const res = await fetch(`${API_BASE}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: form.username.trim(), password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setServerError(data.message || "Login failed. Please try again.");
        return;
      }
      
      // Store token in BOTH locations for compatibility
      localStorage.setItem("superAdminToken", data.accessToken);
      localStorage.setItem("aquachamp_token", data.accessToken); // For lessons admin
      localStorage.setItem("adminRoles", JSON.stringify(data.user.roles));
      localStorage.setItem("adminUsername", data.user.username);
      
      const roles = data.user.roles;
      console.log("🔑 Admin Login - User roles:", roles);
      
      // Redirect based on admin roles - each admin goes to their own dashboard
// Redirect based on admin roles - each admin goes to their own dashboard
if (roles.includes("SUPER_ADMIN")) {
  navigate("/super-admin");

} else if (roles.includes("Game_ADMIN")) {
  console.log("🎮 Redirecting to Game Dashboard");
  navigate("/game-dashboard");

} else if (roles.includes("Activity_ADMIN")) {
  console.log("💧 Redirecting to Activity Dashboard");
  navigate("/activity-dashboard");

} else if (roles.includes("Progress_ADMIN")) {
  navigate("/progress-dashboard");

} else if (roles.includes("Lesson_ADMIN") || roles.includes("Lessons_ADMIN")) {
  console.log("✅ Redirecting to Lesson Dashboard");
  navigate("/lesson-dashboard");

} else {
  navigate("/admin-dashboard");
}
    } catch {
      setServerError("Unable to connect to server. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      height: "100vh",
      overflow: "hidden",
      display: "flex",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      background: "#0B1E33",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .admin-input {
          width: 100%;
          background: #152B44;
          border: 1.5px solid #1E3A56;
          border-radius: 10px;
          padding: 13px 16px 13px 44px;
          color: #F0F6FF;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
        }
        .admin-input::placeholder { color: #4A6A88; }
        .admin-input:focus {
          border-color: #2B7FD4;
          background: #1A3050;
        }
        .admin-input.error { border-color: #E05252; }

        .sign-btn {
          width: 100%;
          padding: 14px;
          background: #2B7FD4;
          color: #fff;
          font-size: 15px;
          font-weight: 700;
          font-family: 'DM Sans', sans-serif;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          letter-spacing: 0.3px;
          transition: background 0.2s, transform 0.1s;
        }
        .sign-btn:hover:not(:disabled) { background: #1A6BBF; transform: translateY(-1px); }
        .sign-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .role-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #122136;
          border: 1px solid #1E3A56;
          border-radius: 20px;
          padding: 5px 12px;
          font-size: 12px;
          font-weight: 600;
          color: #7BAED4;
          white-space: nowrap;
        }

        .left-panel {
          width: 42%;
          background: linear-gradient(160deg, #0D2137 0%, #071525 100%);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: flex-start;
          padding: 60px 56px;
          border-right: 1px solid #1A3050;
          position: relative;
          overflow: hidden;
        }

        .grid-overlay {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(43,127,212,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(43,127,212,0.04) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
        }

        .right-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 40px 48px;
          background: #0B1E33;
        }

        @media (max-width: 768px) {
          .left-panel { display: none; }
          .right-panel { padding: 32px 24px; }
        }
      `}</style>

      {/* LEFT PANEL */}
      <div className="left-panel">
        <div className="grid-overlay" />

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 56, position: "relative" }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: "linear-gradient(135deg, #2B7FD4, #1D9E75)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, boxShadow: "0 4px 20px rgba(43,127,212,0.35)"
          }}>🌊</div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#F0F6FF", letterSpacing: "-0.3px" }}>AquaChamp</div>
            <div style={{ fontSize: 11, color: "#4A6A88", fontWeight: 500, letterSpacing: "1px", textTransform: "uppercase" }}>Admin Portal</div>
          </div>
        </div>

        {/* Headline */}
        <div style={{ position: "relative", marginBottom: 32 }}>
          <div style={{ fontSize: 11, color: "#2B7FD4", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 12 }}>
            SECURE ACCESS
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 700, color: "#F0F6FF", lineHeight: 1.2, letterSpacing: "-0.5px" }}>
            Admin<br />Control Center
          </h1>
          <p style={{ marginTop: 16, fontSize: 14, color: "#4A6A88", lineHeight: 1.7, maxWidth: 300 }}>
            Manage administrators, monitor activity, and oversee the AquaChamp platform.
          </p>
        </div>

        {/* Role list */}
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 11, color: "#4A6A88", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 14 }}>Access Levels</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { icon: "👑", label: "Super Admin",    color: "#EF9F27" },
              { icon: "🎮", label: "Game Admin",     color: "#2B7FD4" },
              { icon: "🏆", label: "Progress Admin", color: "#1D9E75" },
              { icon: "📚", label: "Lesson Admin",   color: "#9B7FE8" },
              { icon: "💧", label: "Activity Admin", color: "#EF9F27" },
            ].map((r) => (
              <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 14 }}>{r.icon}</span>
                <span style={{ fontSize: 13, color: r.color, fontWeight: 600 }}>{r.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom tag */}
        <div style={{ position: "absolute", bottom: 32, left: 56, fontSize: 11, color: "#1E3A56", fontFamily: "'DM Mono', monospace" }}>
          AquaChamp © 2026
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="right-panel">
        <div style={{ width: "100%", maxWidth: 380 }}>

          {/* Header */}
          <div style={{ marginBottom: 36 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "#0F2840", border: "1px solid #1E3A56",
              borderRadius: 20, padding: "5px 14px", marginBottom: 20
            }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#1D9E75", display: "inline-block" }}></span>
              <span style={{ fontSize: 11, color: "#4A9E7A", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" }}>Admin Access Only</span>
            </div>
            <h2 style={{ fontSize: 26, fontWeight: 700, color: "#F0F6FF", letterSpacing: "-0.3px" }}>Sign In</h2>
            <p style={{ fontSize: 13, color: "#4A6A88", marginTop: 6 }}>Enter your credentials to continue</p>
          </div>

          {/* Server Error */}
          {serverError && (
            <div style={{
              background: "#2A1010", border: "1px solid #5C2020",
              borderRadius: 10, padding: "12px 16px", marginBottom: 20,
              display: "flex", alignItems: "center", gap: 10
            }}>
              <span style={{ fontSize: 14 }}>⚠️</span>
              <span style={{ fontSize: 13, color: "#E07070", fontWeight: 500 }}>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>

            {/* Username */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#7BAED4", letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 8 }}>
                Username
              </label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 15, color: "#2B7FD4" }}>👤</span>
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Enter your username"
                  className={`admin-input${errors.username ? " error" : ""}`}
                  autoComplete="off"
                />
              </div>
              {errors.username && <p style={{ marginTop: 6, fontSize: 12, color: "#E07070", fontWeight: 500 }}>⚠ {errors.username}</p>}
            </div>

            {/* Password */}
            <div style={{ marginBottom: 28 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#7BAED4", letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 8 }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 15, color: "#2B7FD4" }}>🔒</span>
                <input
                  type={showPw ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={`admin-input${errors.password ? " error" : ""}`}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#4A6A88" }}
                >
                  {showPw ? "🙈" : "👁️"}
                </button>
              </div>
              {errors.password && <p style={{ marginTop: 6, fontSize: 12, color: "#E07070", fontWeight: 500 }}>⚠ {errors.password}</p>}
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} className="sign-btn">
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "spin 0.8s linear infinite" }}>
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                  </svg>
                  Signing In...
                </span>
              ) : "Sign In to Dashboard →"}
            </button>
          </form>

        
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}