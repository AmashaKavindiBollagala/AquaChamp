import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Water Drop SVG
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

const Fish = ({ size = 28, color = "#185FA5", style = {}, flip = false }) => (
  <svg width={size} height={size} viewBox="0 0 48 32" fill={color} style={{ ...style, transform: flip ? "scaleX(-1)" : "none" }}>
    <ellipse cx="26" cy="16" rx="16" ry="9" />
    <polygon points="4,4 14,16 4,28" />
    <circle cx="36" cy="12" r="2.5" fill="#fff" />
    <circle cx="37" cy="11" r="1" fill="#042C53" />
  </svg>
);

const StarBurst = ({ size = 20, color = "#EF9F27", style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={style}>
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6Z" />
  </svg>
);

const Wave = ({ color = "#185FA520" }) => (
  <svg viewBox="0 0 1200 60" preserveAspectRatio="none" style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: 40, pointerEvents: "none" }}>
    <path d="M0,30 C150,60 350,0 600,30 C850,60 1050,0 1200,30 L1200,60 L0,60 Z" fill={color} />
  </svg>
);

// Avatar
const AvatarBubble = ({ firstName, lastName }) => {
  const initials = `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase();
  return (
    <div style={{ position: "relative", width: 88, height: 88, flexShrink: 0 }}>
      <div style={{
        position: "absolute", inset: -6, borderRadius: "50%",
        background: "conic-gradient(#185FA5,#1D9E75,#EF9F27,#4FC3F7,#185FA5)",
        animation: "spin 6s linear infinite", opacity: 0.7
      }} />
      <div style={{ position: "absolute", inset: -4, borderRadius: "50%", background: "#fff" }} />
      <div style={{
        position: "absolute", inset: 0, borderRadius: "50%",
        background: "linear-gradient(135deg,#185FA5 0%,#1D9E75 50%,#4FC3F7 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 4px 20px rgba(24,95,165,0.35)"
      }}>
        <span style={{ fontSize: 26, fontWeight: 900, color: "#fff", fontFamily: "'Nunito', sans-serif" }}>{initials}</span>
      </div>
      <span style={{ position: "absolute", top: -8, right: -6, fontSize: 18, animation: "wobble 2s ease-in-out infinite", zIndex: 2 }}>💧</span>
      <span style={{ position: "absolute", bottom: -6, left: -4, fontSize: 14, animation: "wobble 3s ease-in-out infinite 1s", zIndex: 2 }}>⭐</span>
    </div>
  );
};

// Toast
const Toast = ({ message, type, onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{
      position: "fixed", top: 20, right: 20, zIndex: 9999,
      display: "flex", alignItems: "center", gap: 10,
      padding: "14px 20px", borderRadius: 20,
      background: type === "success"
        ? "linear-gradient(135deg,#1D9E75,#185FA5)"
        : "linear-gradient(135deg,#e05a5a,#c0392b)",
      color: "#fff", fontWeight: 800, fontSize: 14,
      boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
      animation: "slideInRight 0.35s ease-out forwards",
      fontFamily: "'Nunito', sans-serif",
      border: "3px solid rgba(255,255,255,0.4)"
    }}>
      <span style={{ fontSize: 20 }}>{type === "success" ? "🎉" : "😬"}</span>
      {message}
    </div>
  );
};

// Success Modal
const SuccessModal = ({ onOk }) => (
  <div style={{
    position: "fixed", inset: 0, zIndex: 9999,
    display: "flex", alignItems: "center", justifyContent: "center",
    background: "rgba(4,44,83,0.6)", backdropFilter: "blur(8px)"
  }}>
    <div style={{
      background: "linear-gradient(145deg,#E6F1FB,#E1F5EE,#FEF6E8)",
      borderRadius: 32, padding: "36px 28px", maxWidth: 320, width: "90%",
      display: "flex", flexDirection: "column", alignItems: "center", gap: 14,
      border: "4px solid #1D9E75", boxShadow: "0 20px 60px rgba(29,158,117,0.3)",
      position: "relative", overflow: "hidden"
    }}>
      <div style={{ position: "absolute", top: -20, left: -20, fontSize: 40, opacity: 0.12, transform: "rotate(-20deg)" }}>💧</div>
      <div style={{ position: "absolute", bottom: -10, right: -10, fontSize: 50, opacity: 0.1 }}>🌊</div>
      <div style={{ fontSize: 52, animation: "bounce 0.8s ease-in-out infinite" }}>🎊</div>
      <h2 style={{ fontSize: 22, fontWeight: 900, color: "#185FA5", textAlign: "center", margin: 0, fontFamily: "'Nunito', sans-serif" }}>Password Changed!</h2>
      <p style={{ color: "#042C53", textAlign: "center", fontSize: 13, fontWeight: 700, lineHeight: 1.7, margin: 0, fontFamily: "'Nunito', sans-serif" }}>
        Awesome! You're keeping your water world safe! 🌊💧<br />
        <span style={{ color: "#1D9E75" }}>Login with your new password!</span>
      </p>
      <button onClick={onOk} style={{
        width: "100%", padding: "13px 0", borderRadius: 18,
        background: "linear-gradient(90deg,#185FA5,#1D9E75)",
        color: "#fff", fontWeight: 900, fontSize: 15, border: "none",
        cursor: "pointer", fontFamily: "'Nunito', sans-serif",
        boxShadow: "0 6px 18px rgba(24,95,165,0.3)"
      }}>Let's Go! 🐠</button>
    </div>
  </div>
);

// Input
const StyledInput = ({ label, emoji, name, type = "text", value, onChange, error, placeholder }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
    <label style={{ fontSize: 10, fontWeight: 900, color: "#185FA5", textTransform: "uppercase", letterSpacing: 1.2, fontFamily: "'Nunito', sans-serif" }}>
      {emoji} {label}
    </label>
    <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}
      style={{
        padding: "9px 13px", borderRadius: 12, border: error ? "2.5px solid #e05a5a" : "2.5px solid #B8D4EE",
        background: error ? "#FFF5F5" : "#F0F8FF", color: "#042C53", fontWeight: 700, fontSize: 13,
        fontFamily: "'Nunito', sans-serif", outline: "none", transition: "all 0.2s"
      }}
      onFocus={e => { e.target.style.border = "2.5px solid #185FA5"; e.target.style.background = "#E6F1FB"; e.target.style.boxShadow = "0 0 0 3px rgba(24,95,165,0.12)"; }}
      onBlur={e => { e.target.style.border = error ? "2.5px solid #e05a5a" : "2.5px solid #B8D4EE"; e.target.style.background = error ? "#FFF5F5" : "#F0F8FF"; e.target.style.boxShadow = "none"; }}
    />
    {error && <p style={{ fontSize: 10, color: "#e05a5a", fontWeight: 800, margin: "1px 0 0 2px", fontFamily: "'Nunito', sans-serif" }}>⚠️ {error}</p>}
  </div>
);

// Profile Field Component 
const ProfileField = ({ label, name, type = "text", emoji, disabled = false, editMode, formData, errors, setFormData, setErrors }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
    <label style={{ fontSize: 10, fontWeight: 900, color: "#185FA5", textTransform: "uppercase", letterSpacing: 1.2, fontFamily: "'Nunito', sans-serif" }}>
      {emoji} {label}
    </label>
    {editMode && !disabled ? (
      <>
        <input type={type} value={formData[name] ?? ""}
          onChange={e => { setFormData(p => ({ ...p, [name]: e.target.value })); setErrors(p => ({ ...p, [name]: "" })); }}
          style={{
            padding: "10px 13px", borderRadius: 12,
            border: errors[name] ? "2.5px solid #e05a5a" : "2.5px solid #B8D4EE",
            background: errors[name] ? "#FFF5F5" : "#F0F8FF",
            color: "#042C53", fontWeight: 700, fontSize: 13,
            fontFamily: "'Nunito', sans-serif", outline: "none"
          }}
          onFocus={e => { e.target.style.border = "2.5px solid #185FA5"; e.target.style.background = "#E6F1FB"; e.target.style.boxShadow = "0 0 0 3px rgba(24,95,165,0.12)"; }}
          onBlur={e => { e.target.style.border = errors[name] ? "2.5px solid #e05a5a" : "2.5px solid #B8D4EE"; e.target.style.background = errors[name] ? "#FFF5F5" : "#F0F8FF"; e.target.style.boxShadow = "none"; }}
        />
        {errors[name] && <p style={{ fontSize: 10, color: "#e05a5a", fontWeight: 800, margin: "1px 0 0 2px", fontFamily: "'Nunito', sans-serif" }}>⚠️ {errors[name]}</p>}
      </>
    ) : (
      <div style={{
        padding: "10px 13px", borderRadius: 12, 
        border: "2px solid #DCE8F5",
        background: disabled ? "#E8E8E8" : "#F4F9FF", 
        color: disabled ? "#999" : "#042C53", 
        fontWeight: 700, fontSize: 13,
        fontFamily: "'Nunito', sans-serif",
        cursor: disabled ? "not-allowed" : "default",
        opacity: disabled ? 0.7 : 1
      }}>{formData[name] ?? "—"}{disabled && editMode && <span style={{ marginLeft: 8, fontSize: 10, color: "#999" }}>(Cannot edit)</span>}</div>
    )}
  </div>
);


// CHANGE PASSWORD PANEL
const ChangePasswordPanel = ({ navigate }) => {
  const [step, setStep] = useState("form");
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const handle = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  // Validate password with same rules as registration
  const validatePassword = (password) => {
    if (password.length < 6) return "Password must be at least 6 characters long";
    if (!/[A-Z]/.test(password)) return "Password must include at least one uppercase letter";
    if (!/[0-9]/.test(password)) return "Password must include at least one number";
    if (!/[a-z]/.test(password)) return "Password must include at least one lowercase letter";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return "Password must include at least one special character";
    return null;
  };

  const requestOtp = async () => {
    setError("");
    
    // Validate all fields
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      return setError("Please fill in all fields! 😊");
    }
    
    // Validate new password strength (same as registration)
    const passwordError = validatePassword(form.newPassword);
    if (passwordError) return setError(passwordError);
    
    // Check passwords match
    if (form.newPassword !== form.confirmPassword) {
      return setError("Passwords don't match! 🙈");
    }
    
    setLoading(true);
    try {
      // Get token from localStorage or sessionStorage
      let token = localStorage.getItem("aquachamp_token");
      if (!token) {
        token = sessionStorage.getItem("aquachamp_token");
      }
      
      console.log("📨 Requesting OTP...");
      
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/security/change-password/request-otp`,
        { 
          currentPassword: form.currentPassword, 
          newPassword: form.newPassword 
        },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      console.log("✅ OTP sent successfully:", response.data);
      setUserEmail(response.data.email);
      setStep("otp");
    } catch (err) {
      console.error("❌ Request OTP error:", err.response?.data);
      setError(err.response?.data?.message || "Oops! Something went wrong 😥");
    } finally { 
      setLoading(false); 
    }
  };

  const resendOtp = async () => {
    setError("");
    setLoading(true);
    try {
      let token = localStorage.getItem("aquachamp_token");
      if (!token) {
        token = sessionStorage.getItem("aquachamp_token");
      }
      
      console.log("🔄 Resending OTP...");
      
      const response = await axios.post(
       `${import.meta.env.VITE_API_URL}/api/security/change-password/resend-otp`,
        { newPassword: form.newPassword },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      console.log("✅ New OTP sent:", response.data);
      setUserEmail(response.data.email);
      setError(""); // Clear any previous errors
    } catch (err) {
      console.error("❌ Resend OTP error:", err.response?.data);
      setError(err.response?.data?.message || "Failed to resend OTP 😥");
    } finally { 
      setLoading(false); 
    }
  };

  const verifyOtp = async () => {
    setError("");
    if (!otp) return setError("Please enter the OTP! 📨");
    
    setLoading(true);
    try {
      let token = localStorage.getItem("aquachamp_token");
      if (!token) {
        token = sessionStorage.getItem("aquachamp_token");
      }
      
      console.log("✅ Verifying OTP...");
      
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/security/change-password/verify-otp`,
        { otp, newPassword: form.newPassword },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      console.log("🎉 Password changed successfully!");
      setShowSuccess(true);
    } catch (err) {
      console.error("❌ Verify OTP error:", err.response?.data);
      setError(err.response?.data?.message || "Wrong OTP! Try again 🙈");
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <>
      {showSuccess && <SuccessModal onOk={() => { localStorage.clear(); navigate("/login"); }} />}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div style={{
          width: 46, height: 46, borderRadius: 16, display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 24,
          background: "linear-gradient(135deg,#4FC3F7,#185FA5)",
          boxShadow: "0 4px 14px rgba(24,95,165,0.35)"
        }}>🔒</div>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: "#042C53", fontFamily: "'Nunito', sans-serif" }}>Change Password</h3>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: "#1D9E75", fontFamily: "'Nunito', sans-serif" }}>Protect your water world! 🛡️💧</p>
        </div>
      </div>

      {/* Step indicator */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        {["form", "otp"].map((s, i) => (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 30, height: 30, borderRadius: "50%",
              background: step === s || (s === "form" && step === "otp")
                ? "linear-gradient(135deg,#185FA5,#1D9E75)"
                : "#DCE8F5",
              color: step === s || (s === "form" && step === "otp") ? "#fff" : "#185FA5",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 900, fontFamily: "'Nunito', sans-serif",
              boxShadow: step === s ? "0 3px 10px rgba(24,95,165,0.35)" : "none",
              transition: "all 0.3s"
            }}>{i + 1}</div>
            {i === 0 && <div style={{ width: 32, height: 4, borderRadius: 4, background: step === "otp" ? "#1D9E75" : "#DCE8F5", transition: "background 0.3s" }} />}
          </div>
        ))}
        <span style={{ fontSize: 11, fontWeight: 800, color: "#185FA5", fontFamily: "'Nunito', sans-serif" }}>
          {step === "form" ? "Enter passwords" : "Verify OTP"}
        </span>
      </div>

      {error && (
        <div style={{
          marginBottom: 12, padding: "10px 14px", borderRadius: 12,
          background: "#FFF0F0", border: "2px solid #FFAAAA",
          color: "#e05a5a", fontWeight: 800, fontSize: 12,
          display: "flex", alignItems: "center", gap: 6, fontFamily: "'Nunito', sans-serif"
        }}>⚠️ {error}</div>
      )}

      {step === "form" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <StyledInput label="Current Password" emoji="🔑" name="currentPassword" type="password" value={form.currentPassword} onChange={handle} placeholder="Current password" />
            <StyledInput label="New Password" emoji="✨" name="newPassword" type="password" value={form.newPassword} onChange={handle} placeholder="Min 6 chars, A-Z + 0-9" />
            <StyledInput label="Confirm New Password" emoji="🔄" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handle} placeholder="Re-enter new password" />
          </div>

          {/* Password tips inline */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
            {[
              { icon: "🔤", tip: "Mix A-Z & a-z", bg: "#E6F1FB", color: "#185FA5" },
              { icon: "🔢", tip: "Add a number", bg: "#E1F5EE", color: "#1D9E75" },
              { icon: "📏", tip: "6+ characters", bg: "#FEF6E8", color: "#EF9F27" },
              { icon: "✨", tip: "1 special char", bg: "#F3E8FF", color: "#8B5CF6" },
            ].map(({ icon, tip, bg, color }) => (
              <div key={tip} style={{
                display: "flex", alignItems: "center", gap: 5,
                fontSize: 11, color, fontWeight: 800,
                padding: "6px 10px", borderRadius: 10, background: bg,
                fontFamily: "'Nunito', sans-serif", border: `1.5px solid ${color}30`
              }}>{icon} {tip}</div>
            ))}
          </div>

          <button onClick={requestOtp} disabled={loading} style={{
            width: "100%", padding: "13px 0", borderRadius: 16,
            background: loading ? "#B8D4EE" : "linear-gradient(90deg,#185FA5,#1D9E75)",
            color: "#fff", fontWeight: 900, fontSize: 14, border: "none",
            cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Nunito', sans-serif",
            boxShadow: "0 6px 20px rgba(24,95,165,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "transform 0.15s"
          }}
            onMouseOver={e => { if (!loading) e.currentTarget.style.transform = "scale(1.02)"; }}
            onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}>
            {loading ? <><span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⏳</span> Sending...</> : <>📨 Request OTP</>}
          </button>
        </div>
      )}

      {step === "otp" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{
            padding: "12px 16px", borderRadius: 14,
            background: "linear-gradient(135deg,#E1F5EE,#E6F1FB)",
            border: "2.5px solid #1D9E7550", color: "#1D9E75",
            fontWeight: 800, fontSize: 13, textAlign: "center", fontFamily: "'Nunito', sans-serif"
          }}>
            📬 OTP sent to <span style={{ color: "#185FA5", fontWeight: 900 }}>{userEmail}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 10, fontWeight: 900, color: "#185FA5", textTransform: "uppercase", letterSpacing: 1.2, fontFamily: "'Nunito', sans-serif" }}>🔢 Enter OTP</label>
            <input type="text" value={otp} onChange={e => setOtp(e.target.value)} maxLength={6} placeholder="• • • • • •"
              style={{
                padding: "16px", borderRadius: 16, border: "2.5px solid #1D9E75",
                background: "linear-gradient(135deg,#E1F5EE,#E6F1FB)",
                color: "#042C53", fontWeight: 900, fontSize: 28, textAlign: "center",
                letterSpacing: "0.4em", fontFamily: "'Nunito', sans-serif", outline: "none"
              }} />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => { setStep("form"); setError(""); }} style={{
              flex: 1, padding: "13px 0", borderRadius: 16, border: "2.5px solid #DCE8F5",
              background: "#fff", color: "#185FA5", fontWeight: 900, fontSize: 13,
              cursor: "pointer", fontFamily: "'Nunito', sans-serif"
            }}>← Back</button>
            <button onClick={verifyOtp} disabled={loading} style={{
              flex: 2, padding: "13px 0", borderRadius: 16,
              background: loading ? "#B8D4EE" : "linear-gradient(90deg,#1D9E75,#185FA5)",
              color: "#fff", fontWeight: 900, fontSize: 14, border: "none",
              cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Nunito', sans-serif",
              boxShadow: "0 6px 20px rgba(29,158,117,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8
            }}>
              {loading ? <><span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⏳</span> Verifying...</> : <>✅ Verify &amp; Change</>}
            </button>
          </div>
          {/* Resend OTP button */}
          <button onClick={resendOtp} disabled={loading} style={{
            width: "100%", padding: "11px 0", borderRadius: 14, border: "2.5px solid #EF9F27",
            background: "#FEF6E8", color: "#EF9F27", fontWeight: 900, fontSize: 13,
            cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Nunito', sans-serif",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            transition: "all 0.2s"
          }}
            onMouseOver={e => { if (!loading) { e.currentTarget.style.background = "#FDE9BF"; e.currentTarget.style.transform = "scale(1.02)"; } }}
            onMouseOut={e => { e.currentTarget.style.background = "#FEF6E8"; e.currentTarget.style.transform = "scale(1)"; }}>
            {loading ? <><span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⏳</span> Sending...</> : <>🔄 Resend OTP</>}
          </button>
        </div>
      )}
    </>
  );
};

// MAIN PROFILE PAGE

export default function KaveeshaUserProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});
  const [studentStats, setStudentStats] = useState({
    totalPoints: 0,
    currentLevel: 'N/A',
    rank: 'N/A',
    rankNumber: null,
    badgesCount: 0,
    badges: []
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Get token - check both localStorage and sessionStorage
        let token = localStorage.getItem("aquachamp_token");
        let tokenSource = "localStorage";
        
        if (!token) {
          token = sessionStorage.getItem("aquachamp_token");
          tokenSource = "sessionStorage";
        }
        
        console.log("🔍 [Profile] Fetching user profile...");
        console.log("   Token source:", tokenSource);
        console.log("   Token exists:", !!token);
        
        if (!token) {
          console.error("❌ [Profile] No token found in localStorage or sessionStorage");
          showToast("Not authenticated. Please login again.", "error");
          setTimeout(() => navigate("/login"), 2000);
          return;
        }

        console.log("📡 [Profile] Calling API with token from", tokenSource);
        console.log("   Token first 50 chars:", token.substring(0, 50));
        
        const config = {
          headers: { 
            Authorization: `Bearer ${token}`
          },
          timeout: 10000
        };
        
        console.log("   Request config headers:", config.headers);
        
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/profile/me`, config);

        console.log("✅ [Profile] Success:", response.data.user);
        setUser(response.data.user);
        setFormData(response.data.user);
        
        // Fetch student stats (points, level, rank)
        await fetchStudentStats(token);
      } catch (error) {
        console.error("❌ [Profile] Error:", error.response?.status, error.response?.data?.message);
        
        if (error.response?.status === 401 || error.response?.status === 403) {
          showToast("Session expired. Please login again.", "error");
        } else {
          showToast(`Error: ${error.response?.data?.message || error.message}`, "error");
        }
        
        setTimeout(() => navigate("/login"), 2500);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const fetchStudentStats = async (token) => {
    try {
      console.log("📊 [Stats] Fetching student stats...");
      
      const config = {
        headers: { 
          Authorization: `Bearer ${token}`
        },
        timeout: 10000
      };
      
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/points/my-status`, config);
      
      if (response.data.success) {
        console.log("✅ [Stats] Success:", response.data.data);
        setStudentStats({
          totalPoints: response.data.data.totalPoints,
          currentLevel: response.data.data.currentLevel,
          rank: response.data.data.rank,
          rankNumber: response.data.data.rankNumber,
          badgesCount: response.data.data.badgesCount,
          badges: response.data.data.badges || []
        });
      }
    } catch (error) {
      console.error("❌ [Stats] Error:", error.response?.status, error.response?.data?.message);
      // Don't show error toast for stats, just use default values
    }
  };

  const showToast = (msg, type = "success") => setToast({ message: msg, type });

  const validate = () => {
    const e = {};
    if (!formData.firstName?.trim()) e.firstName = "First name required!";
    else if (formData.firstName.trim().length > 50) e.firstName = "Max 50 characters!";
    
    if (!formData.lastName?.trim()) e.lastName = "Last name required!";
    else if (formData.lastName.trim().length > 50) e.lastName = "Max 50 characters!";
    
    if (!formData.age) e.age = "Age required!";
    else if (formData.age < 5 || formData.age > 15) e.age = "Age must be 5–15!";
    
    if (!formData.username?.trim()) e.username = "Username required!";
    else if (formData.username.trim().length < 3) e.username = "Min 3 characters!";
    else if (formData.username.trim().length > 30) e.username = "Max 30 characters!";
    else if (!/^[a-zA-Z0-9_]+$/.test(formData.username.trim())) e.username = "Only letters, numbers & underscores!";
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      // Get token - check both localStorage and sessionStorage
      let token = localStorage.getItem("aquachamp_token");
      if (!token) {
        token = sessionStorage.getItem("aquachamp_token");
      }
      
      const userId = user?.id;
      
      console.log("💾 [Profile] Saving profile updates...");
      console.log("   User ID:", userId);
      console.log("   Token exists:", !!token);
      
      // Send update without email (email cannot be edited)
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        age: parseInt(formData.age),
        username: formData.username
      };
      
      console.log("   Update data:", updateData);
      
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/users/profile/${userId}`,
        updateData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      console.log("✅ [Profile] Profile updated successfully:", res.data.user);
      setUser(res.data.user); 
      setFormData(res.data.user); 
      setEditMode(false);
      showToast("Profile updated! Awesome! 🎉");
    } catch (err) {
      console.error("❌ [Profile] Update error:", err.response?.data);
      showToast(err.response?.data?.message || "Couldn't save changes 😥", "error");
    } finally { 
      setSaving(false); 
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "linear-gradient(135deg,#4FC3F7 0%,#1D9E75 50%,#185FA5 100%)"
      }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div style={{ position: "relative", width: 72, height: 72 }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", border: "5px solid rgba(255,255,255,0.3)", borderTop: "5px solid #fff", animation: "spin 1s linear infinite" }} />
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>💧</div>
          </div>
          <p style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, color: "#fff", fontSize: 18, textShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>Loading your water world... 🌊</p>
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
      <WaterDrop size={45} color="#EF9F2720" style={{ position: "absolute", bottom: 180, left: 60, animation: "floatSlow 7s ease-in-out infinite 1s", pointerEvents: "none" }} />
      <WaterDrop size={70} color="#4FC3F718" style={{ position: "absolute", bottom: 80, right: 80, animation: "floatSlow 9s ease-in-out infinite 3s", pointerEvents: "none" }} />
      <Bubble size={40} color="#185FA535" style={{ position: "absolute", top: 350, left: "18%", animation: "floatUp 5s ease-in-out infinite", pointerEvents: "none" }} />
      <Bubble size={28} color="#1D9E7535" style={{ position: "absolute", top: "40%", right: "12%", animation: "floatUp 7s ease-in-out infinite 1.5s", pointerEvents: "none" }} />
      <Fish size={36} color="#185FA530" style={{ position: "absolute", top: "30%", left: "3%", animation: "swimRight 14s linear infinite", pointerEvents: "none" }} />
      <Fish size={28} color="#1D9E7530" style={{ position: "absolute", top: "70%", right: "3%", animation: "swimLeft 16s linear infinite 4s", pointerEvents: "none" }} flip />
      <StarBurst size={22} color="#EF9F27" style={{ position: "absolute", top: 120, left: "38%", animation: "twinkle 2s ease-in-out infinite", pointerEvents: "none", opacity: 0.5 }} />
      <StarBurst size={16} color="#185FA5" style={{ position: "absolute", top: "55%", right: "22%", animation: "twinkle 3s ease-in-out infinite 1s", pointerEvents: "none", opacity: 0.4 }} />
      <StarBurst size={18} color="#1D9E75" style={{ position: "absolute", bottom: 120, left: "42%", animation: "twinkle 2.5s ease-in-out infinite 0.5s", pointerEvents: "none", opacity: 0.4 }} />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* HERO HEADER BAND */}
      <div style={{
        background: "linear-gradient(135deg,rgba(255,255,255,0.7),rgba(255,255,255,0.4))",
        backdropFilter: "blur(10px)",
        borderBottom: "2.5px solid rgba(24,95,165,0.12)",
        padding: "18px 40px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "relative", overflow: "hidden"
      }}>
        {/* Left — avatar + name */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <AvatarBubble firstName={user?.firstName} lastName={user?.lastName} />
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: "#042C53" }}>
                {user?.firstName} {user?.lastName}
              </h1>
              <WaterDrop size={22} color="#185FA5" style={{ animation: "bounce 1.5s ease-in-out infinite" }} />
              <StarBurst size={20} color="#EF9F27" style={{ animation: "twinkle 2s ease-in-out infinite" }} />
            </div>
            <p style={{ margin: "3px 0 0", fontSize: 13, fontWeight: 800, color: "#185FA5" }}>@{user?.username}</p>
            <div style={{ display: "flex", gap: 6, marginTop: 7, flexWrap: "wrap" }}>
              <span style={{ padding: "3px 11px", borderRadius: 20, fontSize: 11, fontWeight: 900, background: "linear-gradient(90deg,#E6F1FB,#C8E6FA)", color: "#185FA5", border: "2px solid #185FA540" }}>🎂 Age {user?.age}</span>
              <span style={{
                padding: "3px 11px", borderRadius: 20, fontSize: 11, fontWeight: 900,
                background: user?.isVerified ? "linear-gradient(90deg,#E1F5EE,#B2EDD8)" : "linear-gradient(90deg,#FEF6E8,#FDE9BF)",
                color: user?.isVerified ? "#1D9E75" : "#EF9F27",
                border: `2px solid ${user?.isVerified ? "#1D9E7550" : "#EF9F2750"}`
              }}>{user?.isVerified ? "✅ Verified" : "⏳ Unverified"}</span>
              <span style={{ padding: "3px 11px", borderRadius: 20, fontSize: 11, fontWeight: 900, background: "linear-gradient(90deg,#F3E8FF,#E9D5FF)", color: "#8B5CF6", border: "2px solid #8B5CF640" }}>💧 Water Hero</span>
            </div>
          </div>
        </div>

        {/* Right — XP chips */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, position: "relative" }} data-badges-container>
          {[
            { emoji: "🏅", val: studentStats.badgesCount.toString(), label: "Badges", bg: "linear-gradient(135deg,#E6F1FB,#C8E6FA)", color: "#185FA5", border: "#185FA550" },
            { emoji: "⭐", val: studentStats.currentLevel, label: "Level", bg: "linear-gradient(135deg,#FEF6E8,#FDE9BF)", color: "#EF9F27", border: "#EF9F2750" },
            { emoji: "🏆", val: studentStats.rank, label: "Rank", bg: "linear-gradient(135deg,#E1F5EE,#B2EDD8)", color: "#1D9E75", border: "#1D9E7550" },
          ].map(({ emoji, val, label, bg, color, border }) => (
            <div 
              key={label} 
              style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                padding: "10px 18px", borderRadius: 18, background: bg,
                border: `2.5px solid ${border}`, minWidth: 64,
                boxShadow: "0 3px 12px rgba(24,95,165,0.1)"
              }}
            >
              <span style={{ fontSize: 20 }}>{emoji}</span>
              <span style={{ fontSize: 16, fontWeight: 900, color, lineHeight: 1.1 }}>{val}</span>
              <span style={{ fontSize: 10, fontWeight: 800, color: "#185FA5", opacity: 0.7 }}>{label}</span>
            </div>
          ))}

          {/* My Progress Button */}
          <button
            onClick={() => navigate("/my-progress")}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "10px 18px",
              borderRadius: 18,
              background: "linear-gradient(135deg,#FEF6E8,#FDE9BF)",
              border: "2.5px solid #EF9F2750",
              minWidth: 64,
              boxShadow: "0 3px 12px rgba(24,95,165,0.1)",
              cursor: "pointer",
              transition: "all 0.2s",
              fontFamily: "'Nunito', sans-serif"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.boxShadow = "0 5px 18px rgba(239,159,39,0.25)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 3px 12px rgba(24,95,165,0.1)";
            }}
          >
            <span style={{ fontSize: 20 }}>📊</span>
            <span style={{ fontSize: 11, fontWeight: 900, color: "#EF9F27", lineHeight: 1.1 }}>My</span>
            <span style={{ fontSize: 10, fontWeight: 800, color: "#185FA5", opacity: 0.7 }}>Progress</span>
          </button>
        </div>
      </div>

      {/* MAIN CONTENT — vertical stack */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "28px 24px 32px", display: "flex", flexDirection: "column", gap: 22 }}>

        {/* SECTION 1 — Profile Info Card */}
        <div style={{
          background: "rgba(255,255,255,0.88)",
          borderRadius: 28,
          border: "3px solid #B8D4EE",
          boxShadow: "0 8px 36px rgba(24,95,165,0.13)",
          padding: "24px 28px",
          position: "relative", overflow: "hidden"
        }}>
          {/* Rainbow top bar */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 8, background: "linear-gradient(90deg,#4FC3F7,#185FA5,#1D9E75,#EF9F27,#4FC3F7)", borderRadius: "26px 26px 0 0" }} />
          {/* Ghost watermark */}
          <div style={{ position: "absolute", top: 10, right: 18, opacity: 0.05, fontSize: 80, lineHeight: 1, pointerEvents: "none" }}>💧</div>

          {/* Section header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, paddingTop: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: 13, background: "linear-gradient(135deg,#EF9F27,#F7C46A)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, boxShadow: "0 4px 12px rgba(239,159,39,0.3)" }}>👤</div>
              <div>
                <span style={{ fontWeight: 900, color: "#042C53", fontSize: 16 }}>My Profile Info</span>
                <p style={{ margin: "1px 0 0", fontSize: 11, fontWeight: 800, color: "#1D9E75" }}>Keep your details up to date! 🌟</p>
              </div>
            </div>
            {!editMode ? (
              <button onClick={() => setEditMode(true)} style={{
                display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 14,
                background: "linear-gradient(90deg,#185FA5,#1D9E75)", color: "#fff", fontWeight: 900,
                fontSize: 12, border: "none", cursor: "pointer",
                boxShadow: "0 4px 14px rgba(24,95,165,0.3)", transition: "transform 0.15s",
                fontFamily: "'Nunito', sans-serif"
              }}
                onMouseOver={e => e.currentTarget.style.transform = "scale(1.05)"}
                onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}>
                ✏️ Edit Profile
              </button>
            ) : (
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => { setFormData(user); setEditMode(false); setErrors({}); }} style={{
                  padding: "9px 16px", borderRadius: 14, border: "2.5px solid #DCE8F5",
                  background: "#fff", color: "#185FA5", fontWeight: 900, fontSize: 12,
                  cursor: "pointer", fontFamily: "'Nunito', sans-serif"
                }}>✕ Cancel</button>
                <button onClick={handleSave} disabled={saving} style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "9px 20px", borderRadius: 14,
                  background: saving ? "#B8D4EE" : "linear-gradient(90deg,#1D9E75,#185FA5)",
                  color: "#fff", fontWeight: 900, fontSize: 12, border: "none",
                  cursor: saving ? "not-allowed" : "pointer", fontFamily: "'Nunito', sans-serif",
                  boxShadow: "0 4px 14px rgba(29,158,117,0.3)"
                }}>
                  {saving ? <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⏳</span> : "💾"} Save Changes
                </button>
              </div>
            )}
          </div>

          {/* Fields — 3 columns top, email full width below */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 14 }}>
            <ProfileField label="First Name" name="firstName" emoji="🏷️" editMode={editMode} formData={formData} errors={errors} setFormData={setFormData} setErrors={setErrors} />
            <ProfileField label="Last Name" name="lastName" emoji="🏷️" editMode={editMode} formData={formData} errors={errors} setFormData={setFormData} setErrors={setErrors} />
            <ProfileField label="Age" name="age" type="number" emoji="🎂" editMode={editMode} formData={formData} errors={errors} setFormData={setFormData} setErrors={setErrors} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <ProfileField label="Username" name="username" emoji="🎮" disabled={true} editMode={editMode} formData={formData} errors={errors} setFormData={setFormData} setErrors={setErrors} />
            <ProfileField label="Email Address" name="email" type="email" emoji="📧" disabled={true} editMode={editMode} formData={formData} errors={errors} setFormData={setFormData} setErrors={setErrors} />
          </div>

          {/* Badges strip */}
          {!editMode && (
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: "2.5px dashed #B8D4EE" }}>
              <p style={{ margin: "0 0 10px", fontSize: 10, fontWeight: 900, color: "#185FA5", textTransform: "uppercase", letterSpacing: 1.3 }}>🏅 My Water Missions</p>
              {studentStats.badges.length > 0 ? (
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {studentStats.badges.slice(0, 5).map((badge, index) => (
                    <div 
                      key={badge.badgeId || index}
                      style={{
                        display: "flex", flexDirection: "column", alignItems: "center",
                        padding: "10px 14px", borderRadius: 16, 
                        background: "linear-gradient(135deg,#E6F1FB,#C8E6FA)",
                        border: "2.5px solid #185FA540", 
                        minWidth: 90,
                        boxShadow: "0 2px 8px rgba(24,95,165,0.08)"
                      }}
                    >
                      <span style={{ fontSize: 22 }}>{badge.badgeIcon}</span>
                      <span style={{ fontSize: 9, fontWeight: 900, color: "#185FA5", marginTop: 4, textAlign: "center" }}>{badge.badgeName}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ 
                  padding: "20px", 
                  borderRadius: 16, 
                  background: "#F4F9FF", 
                  border: "2px dashed #B8D4EE",
                  textAlign: "center"
                }}>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: "#7A8CA5", fontFamily: "'Nunito', sans-serif" }}>
                    🎯 No badges earned yet. Keep learning and completing activities to earn badges!
                  </p>
                </div>
              )}
            </div>
          )}
          {editMode && (
            <p style={{ margin: "16px 0 0", fontSize: 11, fontWeight: 800, color: "#185FA5", textAlign: "center", borderTop: "2.5px dashed #B8D4EE", paddingTop: 14 }}>
              💡 Edit your details above, then hit <span style={{ color: "#1D9E75", fontWeight: 900 }}>Save Changes</span>! 📧 Email & 🎮 Username cannot be changed.
            </p>
          )}
        </div>

        {/* SECTION 2 — Change Password Card */}
        <div style={{
          background: "rgba(255,255,255,0.88)",
          borderRadius: 28,
          border: "3px solid #A8DCC8",
          boxShadow: "0 8px 36px rgba(29,158,117,0.13)",
          padding: "24px 28px",
          position: "relative", overflow: "hidden"
        }}>
          {/* Rainbow top bar */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 8, background: "linear-gradient(90deg,#1D9E75,#185FA5,#EF9F27,#4FC3F7,#1D9E75)", borderRadius: "26px 26px 0 0" }} />
          {/* Ghost watermark */}
          <div style={{ position: "absolute", top: 10, right: 18, opacity: 0.05, fontSize: 80, lineHeight: 1, pointerEvents: "none" }}>🔒</div>

          <div style={{ paddingTop: 6 }}>
            <ChangePasswordPanel navigate={navigate} />
          </div>
        </div>

      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@600;700;800;900&display=swap');
        @keyframes floatSlow { 0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-16px) rotate(8deg)} }
        @keyframes floatUp { 0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-12px) scale(1.1)} }
        @keyframes swimRight { 0%{transform:translateX(-80px)}100%{transform:translateX(calc(100vw + 80px))} }
        @keyframes swimLeft { 0%{transform:translateX(calc(100vw + 80px)) scaleX(-1)}100%{transform:translateX(-80px) scaleX(-1)} }
        @keyframes spin { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }
        @keyframes bounce { 0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)} }
        @keyframes wobble { 0%,100%{transform:rotate(-12deg) scale(1)}50%{transform:rotate(12deg) scale(1.2)} }
        @keyframes twinkle { 0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(0.75)} }
        @keyframes slideInRight { from{transform:translateX(120%);opacity:0}to{transform:translateX(0);opacity:1} }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}