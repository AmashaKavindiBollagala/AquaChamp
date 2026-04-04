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

// ── Avatar ────────────────────────────────────────────────────────────────
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

// ── Toast ─────────────────────────────────────────────────────────────────
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

// ── Success Modal ─────────────────────────────────────────────────────────
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

// ── Input ─────────────────────────────────────────────────────────────────
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

// ══════════════════════════════════════════════════════════════════════════
// CHANGE PASSWORD PANEL
// ══════════════════════════════════════════════════════════════════════════
const ChangePasswordPanel = ({ navigate }) => {
  const [step, setStep] = useState("form");
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const handle = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const requestOtp = async () => {
    setError("");
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) return setError("Please fill in all fields! 😊");
    if (form.newPassword.length < 6) return setError("New password needs 6+ characters! 🔐");
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.newPassword)) return setError("Need uppercase, lowercase & a number! 💪");
    if (form.newPassword !== form.confirmPassword) return setError("Passwords don't match! 🙈");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post("/api/security/request-password-otp",
        { currentPassword: form.currentPassword, newPassword: form.newPassword },
        { headers: { Authorization: `Bearer ${token}` } });
      setStep("otp");
    } catch (err) {
      setError(err.response?.data?.message || "Oops! Something went wrong 😥");
    } finally { setLoading(false); }
  };

  const verifyOtp = async () => {
    setError("");
    if (!otp) return setError("Please enter the OTP! 📨");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post("/api/security/verify-password-otp",
        { otp, newPassword: form.newPassword },
        { headers: { Authorization: `Bearer ${token}` } });
      setShowSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || "Wrong OTP! Try again 🙈");
    } finally { setLoading(false); }
  };

  return (
    <>
      {showSuccess && <SuccessModal onOk={() => { localStorage.clear(); navigate("/login"); }} />}
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 14, display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 22,
            background: "linear-gradient(135deg,#4FC3F7,#185FA5)",
            boxShadow: "0 4px 12px rgba(24,95,165,0.3)"
          }}>🔒</div>
          <div>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 900, color: "#042C53", fontFamily: "'Nunito', sans-serif" }}>Change Password</h3>
            <p style={{ margin: 0, fontSize: 10, fontWeight: 800, color: "#1D9E75", fontFamily: "'Nunito', sans-serif" }}>Protect your water world! 🛡️💧</p>
          </div>
        </div>

        {/* Step indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
          {["form", "otp"].map((s, i) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{
                width: 26, height: 26, borderRadius: "50%",
                background: step === s || (s === "form" && step === "otp")
                  ? "linear-gradient(135deg,#185FA5,#1D9E75)"
                  : "#DCE8F5",
                color: step === s || (s === "form" && step === "otp") ? "#fff" : "#185FA5",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 900, fontFamily: "'Nunito', sans-serif",
                boxShadow: step === s ? "0 3px 8px rgba(24,95,165,0.3)" : "none",
                transition: "all 0.3s"
              }}>{i + 1}</div>
              {i === 0 && <div style={{ width: 24, height: 3, borderRadius: 4, background: step === "otp" ? "#1D9E75" : "#DCE8F5", transition: "background 0.3s" }} />}
            </div>
          ))}
          <span style={{ fontSize: 10, fontWeight: 800, color: "#185FA5", fontFamily: "'Nunito', sans-serif" }}>
            {step === "form" ? "Enter passwords" : "Verify OTP"}
          </span>
        </div>

        {error && (
          <div style={{
            marginBottom: 10, padding: "9px 12px", borderRadius: 12,
            background: "#FFF0F0", border: "2px solid #FFAAAA",
            color: "#e05a5a", fontWeight: 800, fontSize: 11,
            display: "flex", alignItems: "center", gap: 6, fontFamily: "'Nunito', sans-serif"
          }}>⚠️ {error}</div>
        )}

        {step === "form" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
            <StyledInput label="Current Password" emoji="🔑" name="currentPassword" type="password" value={form.currentPassword} onChange={handle} placeholder="Your current password" />
            <StyledInput label="New Password" emoji="✨" name="newPassword" type="password" value={form.newPassword} onChange={handle} placeholder="Min 6 chars, A-Z + 0-9" />
            <StyledInput label="Confirm New Password" emoji="🔄" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handle} placeholder="Re-enter new password" />
            <button onClick={requestOtp} disabled={loading} style={{
              marginTop: "auto", width: "100%", padding: "12px 0", borderRadius: 14,
              background: loading ? "#B8D4EE" : "linear-gradient(90deg,#185FA5,#1D9E75)",
              color: "#fff", fontWeight: 900, fontSize: 13, border: "none",
              cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Nunito', sans-serif",
              boxShadow: "0 5px 16px rgba(24,95,165,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "transform 0.15s"
            }}
              onMouseOver={e => { if (!loading) e.currentTarget.style.transform = "scale(1.03)"; }}
              onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}>
              {loading ? <><span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⏳</span> Sending...</> : <>📨 Request OTP</>}
            </button>
          </div>
        )}

        {step === "otp" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
            <div style={{
              padding: "10px 14px", borderRadius: 14,
              background: "linear-gradient(135deg,#E1F5EE,#E6F1FB)",
              border: "2.5px solid #1D9E7550", color: "#1D9E75",
              fontWeight: 800, fontSize: 12, textAlign: "center", fontFamily: "'Nunito', sans-serif"
            }}>📬 OTP sent to your email! Check your inbox.</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <label style={{ fontSize: 10, fontWeight: 900, color: "#185FA5", textTransform: "uppercase", letterSpacing: 1.2, fontFamily: "'Nunito', sans-serif" }}>🔢 Enter OTP</label>
              <input type="text" value={otp} onChange={e => setOtp(e.target.value)} maxLength={6} placeholder="• • • • • •"
                style={{
                  padding: "14px", borderRadius: 14, border: "2.5px solid #1D9E75",
                  background: "linear-gradient(135deg,#E1F5EE,#E6F1FB)",
                  color: "#042C53", fontWeight: 900, fontSize: 24, textAlign: "center",
                  letterSpacing: "0.4em", fontFamily: "'Nunito', sans-serif", outline: "none"
                }} />
            </div>
            <button onClick={verifyOtp} disabled={loading} style={{
              width: "100%", padding: "12px 0", borderRadius: 14,
              background: loading ? "#B8D4EE" : "linear-gradient(90deg,#1D9E75,#185FA5)",
              color: "#fff", fontWeight: 900, fontSize: 13, border: "none",
              cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Nunito', sans-serif",
              boxShadow: "0 5px 16px rgba(29,158,117,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8
            }}>
              {loading ? <><span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⏳</span> Verifying...</> : <>✅ Verify &amp; Change</>}
            </button>
            <button onClick={() => { setStep("form"); setError(""); }} style={{
              background: "none", border: "none", color: "#185FA5", fontWeight: 800,
              fontSize: 12, cursor: "pointer", fontFamily: "'Nunito', sans-serif"
            }}>← Back</button>
          </div>
        )}

        {/* Tips */}
        <div style={{ marginTop: "auto", paddingTop: 10, borderTop: "2.5px dashed #B8D4EE" }}>
          <p style={{ margin: "0 0 7px", fontSize: 10, fontWeight: 900, color: "#185FA5", textTransform: "uppercase", letterSpacing: 1.1, fontFamily: "'Nunito', sans-serif" }}>💡 Password Tips</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
            {[
              { icon: "🔤", tip: "Mix A-Z & a-z", bg: "#E6F1FB", color: "#185FA5" },
              { icon: "🔢", tip: "Add a number", bg: "#E1F5EE", color: "#1D9E75" },
              { icon: "📏", tip: "8+ characters", bg: "#FEF6E8", color: "#EF9F27" },
              { icon: "🚫", tip: "Don't share it!", bg: "#F3E8FF", color: "#8B5CF6" },
            ].map(({ icon, tip, bg, color }) => (
              <div key={tip} style={{
                display: "flex", alignItems: "center", gap: 5,
                fontSize: 11, color, fontWeight: 800,
                padding: "5px 9px", borderRadius: 10, background: bg,
                fontFamily: "'Nunito', sans-serif", border: `1.5px solid ${color}30`
              }}>{icon} {tip}</div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// MAIN PROFILE PAGE
// ══════════════════════════════════════════════════════════════════════════
export default function KaveeshaUserProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const testUser = { _id: "123", firstName: "Kamal", lastName: "Perera", age: 10, email: "kamal@example.com", username: "kamal_p", isVerified: true };
    setTimeout(() => { setUser(testUser); setFormData(testUser); setLoading(false); }, 800);
  }, []);

  const showToast = (msg, type = "success") => setToast({ message: msg, type });

  const validate = () => {
    const e = {};
    if (!formData.firstName?.trim()) e.firstName = "First name required!";
    if (!formData.lastName?.trim()) e.lastName = "Last name required!";
    if (!formData.age || formData.age < 5 || formData.age > 15) e.age = "Age must be 5–15!";
    if (!formData.email?.trim()) e.email = "Email required!";
    if (!formData.username?.trim()) e.username = "Username required!";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      const res = await axios.put(`/api/users/profile/${userId}`,
        { firstName: formData.firstName, lastName: formData.lastName, age: formData.age, email: formData.email, username: formData.username },
        { headers: { Authorization: `Bearer ${token}` } });
      setUser(res.data.user); setFormData(res.data.user); setEditMode(false);
      showToast("Profile updated! Awesome! 🎉");
    } catch (err) {
      showToast(err.response?.data?.message || "Couldn't save changes 😥", "error");
    } finally { setSaving(false); }
  };

  const ProfileField = ({ label, name, type = "text", emoji }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <label style={{ fontSize: 9, fontWeight: 900, color: "#185FA5", textTransform: "uppercase", letterSpacing: 1.2, fontFamily: "'Nunito', sans-serif" }}>
        {emoji} {label}
      </label>
      {editMode ? (
        <>
          <input type={type} value={formData[name] ?? ""}
            onChange={e => { setFormData(p => ({ ...p, [name]: e.target.value })); setErrors(p => ({ ...p, [name]: "" })); }}
            style={{
              padding: "8px 11px", borderRadius: 11,
              border: errors[name] ? "2.5px solid #e05a5a" : "2.5px solid #B8D4EE",
              background: errors[name] ? "#FFF5F5" : "#F0F8FF",
              color: "#042C53", fontWeight: 700, fontSize: 12,
              fontFamily: "'Nunito', sans-serif", outline: "none"
            }}
            onFocus={e => { e.target.style.border = "2.5px solid #185FA5"; e.target.style.background = "#E6F1FB"; e.target.style.boxShadow = "0 0 0 3px rgba(24,95,165,0.12)"; }}
            onBlur={e => { e.target.style.border = errors[name] ? "2.5px solid #e05a5a" : "2.5px solid #B8D4EE"; e.target.style.background = errors[name] ? "#FFF5F5" : "#F0F8FF"; e.target.style.boxShadow = "none"; }}
          />
          {errors[name] && <p style={{ fontSize: 9, color: "#e05a5a", fontWeight: 800, margin: "1px 0 0 2px", fontFamily: "'Nunito', sans-serif" }}>⚠️ {errors[name]}</p>}
        </>
      ) : (
        <div style={{
          padding: "8px 11px", borderRadius: 11, border: "2px solid #DCE8F5",
          background: "#F4F9FF", color: "#042C53", fontWeight: 700, fontSize: 12,
          fontFamily: "'Nunito', sans-serif"
        }}>{formData[name] ?? "—"}</div>
      )}
    </div>
  );

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
      minHeight: "100vh", height: "100vh", overflow: "hidden",
      background: "linear-gradient(160deg,#C8E6FA 0%,#B2EDD8 35%,#FEE9BF 70%,#C8E6FA 100%)",
      display: "flex", flexDirection: "column", fontFamily: "'Nunito', sans-serif",
      position: "relative"
    }}>

      {/* ── Decorative background elements ── */}
      <WaterDrop size={90} color="#185FA520" style={{ position: "absolute", top: -20, left: 30, animation: "floatSlow 8s ease-in-out infinite", pointerEvents: "none" }} />
      <WaterDrop size={60} color="#1D9E7520" style={{ position: "absolute", top: 60, right: 50, animation: "floatSlow 6s ease-in-out infinite 2s", pointerEvents: "none" }} />
      <WaterDrop size={45} color="#EF9F2725" style={{ position: "absolute", bottom: 100, left: 80, animation: "floatSlow 7s ease-in-out infinite 1s", pointerEvents: "none" }} />
      <WaterDrop size={70} color="#4FC3F720" style={{ position: "absolute", bottom: 40, right: 100, animation: "floatSlow 9s ease-in-out infinite 3s", pointerEvents: "none" }} />
      <WaterDrop size={35} color="#185FA530" style={{ position: "absolute", top: "45%", left: 20, animation: "floatSlow 5s ease-in-out infinite 0.5s", pointerEvents: "none" }} />

      <Bubble size={40} color="#185FA540" style={{ position: "absolute", top: 100, left: "20%", animation: "floatUp 5s ease-in-out infinite", pointerEvents: "none" }} />
      <Bubble size={28} color="#1D9E7540" style={{ position: "absolute", top: "30%", right: "15%", animation: "floatUp 7s ease-in-out infinite 1.5s", pointerEvents: "none" }} />
      <Bubble size={20} color="#EF9F2740" style={{ position: "absolute", bottom: "25%", left: "10%", animation: "floatUp 6s ease-in-out infinite 0.8s", pointerEvents: "none" }} />
      <Bubble size={34} color="#4FC3F740" style={{ position: "absolute", top: "60%", right: "8%", animation: "floatUp 8s ease-in-out infinite 2s", pointerEvents: "none" }} />

      <Fish size={36} color="#185FA540" style={{ position: "absolute", top: "25%", left: "5%", animation: "swimRight 12s linear infinite", pointerEvents: "none" }} />
      <Fish size={28} color="#1D9E7540" style={{ position: "absolute", top: "65%", right: "5%", animation: "swimLeft 15s linear infinite 4s", pointerEvents: "none" }} flip />

      <StarBurst size={22} color="#EF9F27" style={{ position: "absolute", top: 70, left: "35%", animation: "twinkle 2s ease-in-out infinite", pointerEvents: "none" }} />
      <StarBurst size={16} color="#185FA5" style={{ position: "absolute", top: "50%", right: "20%", animation: "twinkle 3s ease-in-out infinite 1s", pointerEvents: "none" }} />
      <StarBurst size={18} color="#1D9E75" style={{ position: "absolute", bottom: 80, left: "40%", animation: "twinkle 2.5s ease-in-out infinite 0.5s", pointerEvents: "none" }} />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* ── NAV BAR ── */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "8px 24px",
        background: "linear-gradient(90deg,#185FA5,#1496C8,#1D9E75)",
        boxShadow: "0 4px 20px rgba(24,95,165,0.3)", flexShrink: 0,
        position: "relative", overflow: "hidden"
      }}>
        <Wave color="rgba(255,255,255,0.1)" />
        <div style={{ position: "absolute", right: "35%", top: "50%", transform: "translateY(-50%)", opacity: 0.2, animation: "swimLeft 10s linear infinite", pointerEvents: "none" }}>
          <Fish size={22} color="#fff" flip />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, zIndex: 1 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 14, display: "flex", alignItems: "center",
            justifyContent: "center", background: "rgba(255,255,255,0.25)",
            border: "2px solid rgba(255,255,255,0.5)", fontSize: 20
          }}>🌊</div>
          <div>
            <span style={{ fontWeight: 900, fontSize: 17, color: "#fff", letterSpacing: -0.5, display: "block", lineHeight: 1 }}>AquaChamp</span>
            <span style={{ fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.85)", letterSpacing: 1 }}>CLEAN WATER HEROES</span>
          </div>
          <span style={{ padding: "3px 10px", borderRadius: 20, background: "rgba(239,159,39,0.95)", color: "#fff", fontSize: 10, fontWeight: 900, border: "1.5px solid rgba(255,255,255,0.4)" }}>
            ⭐ Kids Edition
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, zIndex: 1 }}>
          <span style={{ fontWeight: 900, color: "#fff", fontSize: 13 }}>Hi, {user?.firstName}! 👋</span>
          <div style={{
            width: 34, height: 34, borderRadius: "50%",
            background: "rgba(255,255,255,0.25)",
            border: "2.5px solid rgba(255,255,255,0.6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 900, color: "#fff", fontSize: 15
          }}>{user?.firstName?.[0]}</div>
        </div>
      </nav>

      {/* ── PAGE HEADER ── */}
      <div style={{ padding: "10px 24px 6px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "#042C53", letterSpacing: -0.5 }}>My Profile</h1>
            <WaterDrop size={22} color="#185FA5" style={{ animation: "bounce 1.5s ease-in-out infinite" }} />
            <StarBurst size={20} color="#EF9F27" style={{ animation: "twinkle 2s ease-in-out infinite" }} />
          </div>
          <p style={{ margin: "1px 0 0", fontSize: 11, fontWeight: 800, color: "#1D9E75" }}>
            🌊 Manage your info and protect your water world!
          </p>
        </div>
        {/* XP chips */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {[
            { emoji: "💧", val: "850", label: "Drops", bg: "linear-gradient(135deg,#E6F1FB,#C8E6FA)", color: "#185FA5", border: "#185FA550" },
            { emoji: "⭐", val: "Pro", label: "Level", bg: "linear-gradient(135deg,#FEF6E8,#FDE9BF)", color: "#EF9F27", border: "#EF9F2750" },
            { emoji: "🏆", val: "#12", label: "Rank", bg: "linear-gradient(135deg,#E1F5EE,#B2EDD8)", color: "#1D9E75", border: "#1D9E7550" },
          ].map(({ emoji, val, label, bg, color, border }) => (
            <div key={label} style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              padding: "5px 11px", borderRadius: 14, background: bg,
              border: `2.5px solid ${border}`, minWidth: 52
            }}>
              <span style={{ fontSize: 14 }}>{emoji}</span>
              <span style={{ fontSize: 12, fontWeight: 900, color, lineHeight: 1 }}>{val}</span>
              <span style={{ fontSize: 9, fontWeight: 800, color: "#185FA5", opacity: 0.7 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex: 1, padding: "0 24px 10px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, minHeight: 0, overflow: "hidden" }}>

        {/* ══ LEFT — Profile Info ══ */}
        <div style={{
          background: "#fff", borderRadius: 24,
          border: "3px solid #B8D4EE",
          boxShadow: "0 6px 28px rgba(24,95,165,0.13)",
          padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10,
          overflow: "hidden", position: "relative"
        }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 8, background: "linear-gradient(90deg,#4FC3F7,#185FA5,#1D9E75,#EF9F27,#4FC3F7)", borderRadius: "22px 22px 0 0" }} />
          <div style={{ position: "absolute", top: 8, right: 10, opacity: 0.07, fontSize: 52, lineHeight: 1, pointerEvents: "none" }}>💧</div>
          <div style={{ position: "absolute", bottom: 10, left: 8, opacity: 0.06, fontSize: 40, lineHeight: 1, pointerEvents: "none" }}>🌊</div>

          {/* Avatar + name */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 8, paddingBottom: 10, borderBottom: "2.5px dashed #B8D4EE" }}>
            <AvatarBubble firstName={user?.firstName} lastName={user?.lastName} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 900, color: "#042C53" }}>
                {user?.firstName} {user?.lastName}
              </h2>
              <p style={{ margin: "2px 0 0", fontSize: 12, fontWeight: 900, color: "#185FA5" }}>@{user?.username}</p>
              <div style={{ display: "flex", gap: 5, marginTop: 5, flexWrap: "wrap" }}>
                <span style={{ padding: "3px 9px", borderRadius: 20, fontSize: 10, fontWeight: 900, background: "linear-gradient(90deg,#E6F1FB,#C8E6FA)", color: "#185FA5", border: "2px solid #185FA540" }}>🎂 Age {user?.age}</span>
                <span style={{
                  padding: "3px 9px", borderRadius: 20, fontSize: 10, fontWeight: 900,
                  background: user?.isVerified ? "linear-gradient(90deg,#E1F5EE,#B2EDD8)" : "linear-gradient(90deg,#FEF6E8,#FDE9BF)",
                  color: user?.isVerified ? "#1D9E75" : "#EF9F27",
                  border: `2px solid ${user?.isVerified ? "#1D9E7550" : "#EF9F2750"}`
                }}>{user?.isVerified ? "✅ Verified" : "⏳ Unverified"}</span>
                <span style={{ padding: "3px 9px", borderRadius: 20, fontSize: 10, fontWeight: 900, background: "linear-gradient(90deg,#F3E8FF,#E9D5FF)", color: "#8B5CF6", border: "2px solid #8B5CF640" }}>💧 Water Hero</span>
              </div>
            </div>
          </div>

          {/* Edit controls */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <div style={{ width: 28, height: 28, borderRadius: 10, background: "linear-gradient(135deg,#EF9F27,#F7C46A)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>👤</div>
              <span style={{ fontWeight: 900, color: "#042C53", fontSize: 13 }}>Profile Info</span>
            </div>
            {!editMode ? (
              <button onClick={() => setEditMode(true)} style={{
                display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 12,
                background: "linear-gradient(90deg,#185FA5,#1D9E75)", color: "#fff", fontWeight: 900,
                fontSize: 11, border: "none", cursor: "pointer",
                boxShadow: "0 4px 12px rgba(24,95,165,0.3)", transition: "transform 0.15s",
                fontFamily: "'Nunito', sans-serif"
              }}
                onMouseOver={e => e.currentTarget.style.transform = "scale(1.05)"}
                onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}>
                ✏️ Edit Profile
              </button>
            ) : (
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => { setFormData(user); setEditMode(false); setErrors({}); }} style={{
                  padding: "6px 11px", borderRadius: 12, border: "2.5px solid #DCE8F5",
                  background: "#fff", color: "#185FA5", fontWeight: 900, fontSize: 11,
                  cursor: "pointer", fontFamily: "'Nunito', sans-serif"
                }}>✕ Cancel</button>
                <button onClick={handleSave} disabled={saving} style={{
                  display: "flex", alignItems: "center", gap: 5, padding: "6px 13px", borderRadius: 12,
                  background: saving ? "#B8D4EE" : "linear-gradient(90deg,#1D9E75,#185FA5)",
                  color: "#fff", fontWeight: 900, fontSize: 11, border: "none",
                  cursor: saving ? "not-allowed" : "pointer", fontFamily: "'Nunito', sans-serif"
                }}>
                  {saving ? <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⏳</span> : "💾"} Save
                </button>
              </div>
            )}
          </div>

          {/* Fields */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, flex: 1 }}>
            <ProfileField label="First Name" name="firstName" emoji="🏷️" />
            <ProfileField label="Last Name" name="lastName" emoji="🏷️" />
            <ProfileField label="Age" name="age" type="number" emoji="🎂" />
            <ProfileField label="Username" name="username" emoji="🎮" />
            <div style={{ gridColumn: "1 / -1" }}>
              <ProfileField label="Email Address" name="email" type="email" emoji="📧" />
            </div>
          </div>

          {/* Badges / edit hint */}
          {!editMode ? (
            <div style={{ borderTop: "2.5px dashed #B8D4EE", paddingTop: 10 }}>
              <p style={{ margin: "0 0 7px", fontSize: 9, fontWeight: 900, color: "#185FA5", textTransform: "uppercase", letterSpacing: 1.2 }}>🏅 My Water Missions</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
                {[
                  { icon: "💧", label: "Drop Saver", bg: "linear-gradient(135deg,#E6F1FB,#C8E6FA)", color: "#185FA5", border: "#185FA550" },
                  { icon: "🌿", label: "Eco Friend", bg: "linear-gradient(135deg,#E1F5EE,#B2EDD8)", color: "#1D9E75", border: "#1D9E7550" },
                  { icon: "⭐", label: "Star Hero", bg: "linear-gradient(135deg,#FEF6E8,#FDE9BF)", color: "#EF9F27", border: "#EF9F2750" },
                ].map(({ icon, label, bg, color, border }) => (
                  <div key={label} style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    padding: "8px 4px", borderRadius: 14, background: bg,
                    border: `2.5px solid ${border}`
                  }}>
                    <span style={{ fontSize: 18 }}>{icon}</span>
                    <span style={{ fontSize: 9, fontWeight: 900, color, marginTop: 3, textAlign: "center" }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p style={{ fontSize: 10, fontWeight: 800, color: "#185FA5", textAlign: "center", borderTop: "2.5px dashed #B8D4EE", paddingTop: 8, margin: 0 }}>
              💡 Edit above, then hit <span style={{ color: "#1D9E75", fontWeight: 900 }}>Save</span>!
            </p>
          )}
        </div>

        {/* ══ RIGHT — Change Password ══ */}
        <div style={{
          background: "#fff", borderRadius: 24,
          border: "3px solid #A8DCC8",
          boxShadow: "0 6px 28px rgba(29,158,117,0.13)",
          padding: "16px 18px", display: "flex", flexDirection: "column",
          overflow: "hidden", position: "relative"
        }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 8, background: "linear-gradient(90deg,#1D9E75,#185FA5,#EF9F27,#4FC3F7,#1D9E75)", borderRadius: "22px 22px 0 0" }} />
          <div style={{ position: "absolute", top: 8, right: 10, opacity: 0.07, fontSize: 48, lineHeight: 1, pointerEvents: "none" }}>🔒</div>
          <div style={{ position: "absolute", bottom: 10, right: 10, opacity: 0.06, fontSize: 40, lineHeight: 1, pointerEvents: "none" }}>💧</div>
          <div style={{ paddingTop: 8, flex: 1, display: "flex", flexDirection: "column" }}>
            <ChangePasswordPanel navigate={navigate} />
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer style={{
        background: "linear-gradient(90deg,#042C53,#185FA5,#1D9E75)",
        padding: "8px 24px",
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: 10, flexShrink: 0, overflow: "hidden", position: "relative"
      }}>
        <Wave color="rgba(255,255,255,0.08)" />
        <span style={{ fontSize: 16, zIndex: 1 }}>🐠</span>
        <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.9)", zIndex: 1 }}>
          💧 Keep saving water, keep winning, AquaChamp! 🌊
        </p>
        <WaterDrop size={14} color="rgba(255,255,255,0.5)" style={{ zIndex: 1 }} />
        <StarBurst size={13} color="#EF9F27" style={{ zIndex: 1 }} />
        <span style={{ fontSize: 16, zIndex: 1 }}>🐟</span>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@600;700;800;900&display=swap');
        @keyframes floatSlow { 0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-16px) rotate(8deg)} }
        @keyframes floatUp { 0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-12px) scale(1.1)} }
        @keyframes swimRight { 0%{transform:translateX(-60px)}100%{transform:translateX(calc(100vw + 60px))} }
        @keyframes swimLeft { 0%{transform:translateX(calc(100vw + 60px)) scaleX(-1)}100%{transform:translateX(-60px) scaleX(-1)} }
        @keyframes spin { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }
        @keyframes bounce { 0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)} }
        @keyframes wobble { 0%,100%{transform:rotate(-12deg) scale(1)}50%{transform:rotate(12deg) scale(1.2)} }
        @keyframes twinkle { 0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(0.75)} }
        @keyframes slideInRight { from{transform:translateX(120%);opacity:0}to{transform:translateX(0);opacity:1} }
        @keyframes ping { 0%{transform:scale(1);opacity:0.4}75%,100%{transform:scale(1.5);opacity:0} }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}

