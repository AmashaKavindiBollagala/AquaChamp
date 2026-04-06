import React, { useState, memo, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// ─── Reusable Field ────────────────────────────────────────────────────────────
const Field = memo(function Field({
  name,
  label,
  type = "text",
  placeholder,
  icon,
  showToggle,
  show,
  onToggle,
  value,
  onChange,
  error,
}) {
  return (
    <div className="w-full">
      <label className="mb-1 block text-[10px] font-extrabold uppercase tracking-[0.12em] text-sky-700">
        {label}
      </label>

      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-sky-400">
            {icon}
          </span>
        )}

        <input
          type={showToggle ? (show ? "text" : "password") : type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={name === "email" ? "email" : name === "password" ? "current-password" : "off"}
          className={`w-full rounded-xl border-2 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-sky-600 focus:ring-4 focus:ring-sky-100 ${
            icon ? "pl-9" : ""
          } ${showToggle ? "pr-10" : ""} ${
            error ? "border-red-400" : "border-sky-100"
          }`}
        />

        {showToggle && (
          <button
            type="button"
            tabIndex={-1}
            onMouseDown={(e) => e.preventDefault()}
            onClick={onToggle}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-sky-400 hover:text-sky-700"
          >
            {show ? "🙈" : "👁"}
          </button>
        )}
      </div>

      {error && (
        <p className="mt-1 text-[11px] font-semibold text-red-500">{error}</p>
      )}
    </div>
  );
});

// ─── Forgot Password Modal ─────────────────────────────────────────────────────
const ForgotPasswordModal = memo(function ForgotPasswordModal({ onClose }) {
  const [step, setStep] = useState("request"); // "request" | "sent"
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await axios.post("http://localhost:4000/api/security/forgot-password", {
        email: email.trim().toLowerCase(),
      });
      setStep("sent");
    } catch (err) {
      const msg = err.response?.data?.message;
      // Even on 404 (email not found), show success to prevent email enumeration
      setStep("sent");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
        {step === "request" ? (
          <>
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-sky-500 to-emerald-500 text-xl shadow-md">
                🔑
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-sky-950">Forgot Password?</h3>
                <p className="text-[11px] text-slate-500">We'll send a reset link to your email</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <Field
                name="resetEmail"
                label="Email Address"
                type="email"
                placeholder="user@gmail.com"
                icon="✉"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                error={error}
              />

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-sky-700 to-emerald-500 py-2.5 text-sm font-extrabold text-white shadow-lg transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Sending…
                  </>
                ) : (
                  "📧 Send Reset Link"
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-xl py-2 text-sm font-bold text-slate-400 transition hover:text-slate-600"
              >
                Cancel
              </button>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center py-4 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-emerald-400 to-sky-500 text-3xl shadow-lg">
              📬
            </div>
            <h3 className="text-xl font-extrabold text-sky-950">Check Your Inbox!</h3>
            <p className="mt-2 max-w-xs text-sm text-slate-500 leading-6">
              If an account exists for <span className="font-bold text-sky-700">{email}</span>, you'll receive a password reset link shortly.
            </p>
            <p className="mt-2 text-[11px] text-slate-400">Don't forget to check your spam folder!</p>
            <button
              onClick={onClose}
              className="mt-5 rounded-2xl bg-linear-to-r from-sky-700 to-emerald-500 px-8 py-2.5 text-sm font-extrabold text-white shadow-lg transition hover:-translate-y-0.5"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

// ─── Main Login Component ──────────────────────────────────────────────────────
export default function UserLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  // ✅ FIX 1: Corrected URL — matches server.js: app.use('/auth', authRoutes)
  const API_URL = "http://localhost:4000/auth/login";

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Please enter a valid email";

    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6)
      e.password = "Password must be at least 6 characters";

    return e;
  };

  const onChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setServerError("");
  }, []);

  const togglePw = useCallback(() => setShowPw((p) => !p), []);

  const onSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setServerError("");

    try {
      console.log("📡 [Login] Attempting login...");
      console.log("   Email:", form.email.trim().toLowerCase());
      console.log("   API URL:", API_URL);
      
      // ✅ FIX 2: Added withCredentials so the httpOnly refresh cookie gets stored
      const response = await axios.post(
        API_URL,
        {
          email: form.email.trim().toLowerCase(),
          password: form.password,
        },
        { 
          withCredentials: true,
          timeout: 10000 // 10 second timeout
        }
      );

      console.log("✅ [Login] Response received:", response.status);

      if (response.data.success || response.data.accessToken) {
        const token = response.data.accessToken || response.data.token;
        console.log("✅ [Login] Login successful!");
        console.log("   Token received:", token ? `${token.substring(0, 30)}...` : "NONE");
        console.log("   User data:", response.data.user);
        console.log("   Remember me:", rememberMe);
        
        // Store JWT based on remember me preference
        if (rememberMe) {
          localStorage.setItem("aquachamp_token", token);
          console.log("   ✅ Token stored in localStorage");
          // Verify it was stored
          const verifyToken = localStorage.getItem("aquachamp_token");
          console.log("   ✅ Verification - Token in localStorage:", !!verifyToken);
        } else {
          sessionStorage.setItem("aquachamp_token", token);
          console.log("   ✅ Token stored in sessionStorage");
          // Verify it was stored
          const verifyToken = sessionStorage.getItem("aquachamp_token");
          console.log("   ✅ Verification - Token in sessionStorage:", !!verifyToken);
        }

        setUserData(response.data.user);
        setLoginSuccess(true);

        console.log("   🚀 Navigating to /profile...");
        // Small delay to ensure storage is complete
        setTimeout(() => {
          navigate("/profile");
        }, 100);
      }
    } catch (error) {
      console.error("❌ [Login] Login error:");
      console.error("   Error message:", error.message);
      console.error("   Error code:", error.code);
      
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        console.error("   ⏰ Request timed out after 10 seconds");
        setServerError("Request timed out. Please check your connection and try again.");
      } else if (error.response?.data) {
        const data = error.response.data;
        console.error("   Response status:", error.response.status);
        console.error("   Response data:", data);
        
        if (error.response.status === 401) {
          setServerError("Invalid email or password. Please try again.");
        } else if (error.response.status === 403) {
          setServerError(
            data.message || "Account not verified. Please check your email."
          );
        } else if (error.response.status === 429) {
          setServerError("Too many login attempts. Please wait a moment.");
        } else {
          setServerError(data.message || "Login failed. Please try again.");
        }
      } else {
        console.error("   Full error:", error);
        setServerError(`Unable to connect to server (${error.message})`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}

      <div className="min-h-screen w-full bg-[#EAF5FF]">
        <div className="flex min-h-screen w-full">
          {/* ── LEFT PANEL ── */}
          <aside className="relative hidden min-h-screen w-[40%] overflow-hidden bg-linear-to-br from-[#042C53] via-[#185FA5] to-[#1D9E75] px-7 py-7 text-white lg:flex lg:flex-col lg:justify-between">
            {/* Background decorations */}
            <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-white/5" />
            <div className="absolute -left-12 -top-12 h-52 w-52 rounded-full bg-emerald-300/10" />
            <div className="absolute left-[12%] top-[18%] h-3 w-3 animate-bounce rounded-full bg-white/10" />
            <div className="absolute left-[75%] top-[20%] h-2.5 w-2.5 animate-pulse rounded-full bg-amber-300/20" />
            <div className="absolute left-[20%] bottom-[18%] h-4 w-4 animate-bounce rounded-full bg-white/10" />
            <div className="absolute left-[55%] top-[45%] h-2 w-2 animate-pulse rounded-full bg-emerald-300/30" />

            {/* Brand */}
            <div className="relative z-10">
              <div className="flex items-center">
                <img
                  src="/AquaChampLogo.png"
                  alt="AquaChamp Logo"
                  className="mr-3 h-12 w-12 rounded-2xl border border-cyan-400 bg-white/30 p-1.5 shadow-lg backdrop-blur-md"
                />
                <div>
                  <h1 className="bg-linear-to-r from-white via-sky-100 to-emerald-400 bg-clip-text text-3xl font-extrabold tracking-wide text-transparent">
                    AquaChamp
                  </h1>
                  <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.25em] text-white/70">
                    Clean Water · Safe Futures
                  </p>
                </div>
              </div>

              <div className="ml-15 mt-3 inline-flex items-center rounded-full border border-white/20 bg-linear-to-r from-amber-400 to-orange-400 px-3 py-1 text-[10px] font-black text-white shadow-lg">
                🎯 Play • Learn • Grow
              </div>
            </div>

            {/* Welcome back section */}
            <div className="relative z-10 flex flex-1 flex-col justify-center">
              <h2 className="text-[28px] font-extrabold leading-tight">
                Welcome Back, <br />
                <span className="text-emerald-400">Hero! 👋</span>
              </h2>
              <p className="mt-3 max-w-55 text-sm leading-6 text-white/70">
                Your hygiene missions are waiting. Log in to keep your streak alive and earn new badges!
              </p>

              {/* Stats */}
              <div className="mt-5 flex gap-6">
                {[
                  ["12K+", "Happy Kids"],
                  ["100+", "Fun Quests"],
                  ["Daily", "Tips"],
                ].map(([value, label]) => (
                  <div key={label}>
                    <div className="text-xl font-extrabold text-amber-300">{value}</div>
                    <div className="mt-1 text-[10px] text-white/60">{label}</div>
                  </div>
                ))}
              </div>

              {/* Tip card */}
              <div className="mt-6 rounded-2xl border border-white/15 bg-white/10 px-4 py-4 backdrop-blur-md">
                <div className="text-[11px] font-bold uppercase tracking-widest text-emerald-300 mb-2">
                  💡 Daily Hygiene Tip
                </div>
                <p className="text-sm leading-6 text-white/80">
                  Wash your hands for at least <span className="font-extrabold text-amber-300">20 seconds</span>.
                </p>
              </div>
            </div>

            <p className="relative z-10 text-[10px] italic text-white/40">
              "Small clean habits make a big splash!"
            </p>
          </aside>

          {/* ── RIGHT PANEL ── */}
          <main className="flex min-h-screen flex-1 items-center justify-center px-4 py-6 lg:px-8">
            <div className="w-full max-w-md rounded-[28px] bg-white/85 p-5 shadow-[0_20px_60px_rgba(24,95,165,0.15)] backdrop-blur-xl lg:p-8">
              {/* Mobile Branding */}
              <div className="mb-4 flex items-center gap-3 lg:hidden">
                <img
                  src="/AquaChampLogo.png"
                  alt="AquaChamp Logo"
                  className="h-11 w-11 rounded-2xl border border-cyan-400 bg-white/30 p-1.5 shadow-md"
                />
                <div>
                  <div className="bg-linear-to-r from-sky-800 via-sky-500 to-emerald-400 bg-clip-text text-2xl font-extrabold text-transparent">
                    AquaChamp
                  </div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-sky-600/70">
                    Clean Water · Safe Futures
                  </p>
                </div>
              </div>

              {loginSuccess ? (
                /* ── Success State ── */
                <div className="flex min-h-100 flex-col items-center justify-center text-center">
                  <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-emerald-500 to-sky-600 text-4xl text-white shadow-xl">
                    🏆
                  </div>
                  <h3 className="text-3xl font-extrabold text-sky-950">
                    You're Back, Hero!
                  </h3>
                  {userData && (
                    <p className="mt-2 text-base font-bold text-sky-600">
                      Welcome, {userData.firstName}! 👋
                    </p>
                  )}
                  <p className="mt-3 max-w-xs text-sm font-semibold leading-7 text-slate-500">
                    Login successful. Your hygiene missions are ready for you!
                  </p>
                  <div className="mt-4 flex gap-3">
                    {["🎮 Missions", "🏆 Badges", "⭐ Points"].map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-sky-50 px-3 py-1 text-[11px] font-bold text-sky-700"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      setLoginSuccess(false);
                      setForm({ email: "", password: "" });
                    }}
                    className="mt-6 rounded-2xl bg-linear-to-r from-sky-700 to-emerald-500 px-8 py-3 text-sm font-extrabold text-white shadow-lg transition hover:-translate-y-1"
                  >
                    Continue to Dashboard →
                  </button>
                </div>
              ) : (
                /* ── Login Form ── */
                <>
                  <div className="mb-5">
                    <h3 className="text-3xl font-extrabold text-sky-950">Welcome Back!</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Sign in to continue your hygiene adventure.
                    </p>
                  </div>

                  {serverError && (
                    <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                      {serverError}
                    </div>
                  )}

                  <form onSubmit={onSubmit} noValidate className="space-y-4">
                    <Field
                      name="email"
                      label="Email Address"
                      type="email"
                      placeholder="user@gmail.com"
                      icon="✉"
                      value={form.email}
                      onChange={onChange}
                      error={errors.email}
                    />

                    <div>
                      <Field
                        name="password"
                        label="Password"
                        placeholder="Enter your password"
                        icon="🔒"
                        showToggle
                        show={showPw}
                        onToggle={togglePw}
                        value={form.password}
                        onChange={onChange}
                        error={errors.password}
                      />

                      {/* Forgot Password link — sits below password field */}
                      <div className="mt-1.5 flex justify-end">
                        <button
                          type="button"
                          onClick={() => setShowForgot(true)}
                          className="text-[11px] font-bold text-sky-600 hover:underline"
                        >
                          Forgot Password?
                        </button>
                      </div>
                    </div>

                    {/* Remember Me */}
                    <label className="flex cursor-pointer items-center gap-2.5">
                      <div
                        onClick={() => setRememberMe((p) => !p)}
                        className={`relative h-5 w-5 shrink-0 rounded-md border-2 transition ${
                          rememberMe
                            ? "border-sky-600 bg-linear-to-br from-sky-600 to-emerald-500"
                            : "border-sky-200 bg-white"
                        }`}
                      >
                        {rememberMe && (
                          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white">
                            ✓
                          </span>
                        )}
                      </div>
                      <span className="text-[12px] font-semibold text-slate-600">
                        Remember me for 30 days
                      </span>
                    </label>

                    <button
                      type="submit"
                      disabled={loading}
                      className="mt-1 flex w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-sky-700 to-emerald-500 px-4 py-3 text-sm font-extrabold text-white shadow-lg transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {loading ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          Signing In…
                        </>
                      ) : (
                        <>🎮 Sign In to AquaChamp</>
                      )}
                    </button>

                    <p className="text-center text-sm font-semibold text-slate-500">
                      New to AquaChamp?{" "}
                      <button
                          type="button"
                          onClick={() => navigate("/register")}
                          className="font-extrabold text-sky-700 hover:underline"
                      >
                       Create Account
                     </button>
                    </p>

                    <div className="flex justify-center gap-5 text-[11px] font-bold text-slate-400">
                      {["🔒 Secure", "🎮 Fun", "✅ Safe"].map((t) => (
                        <span key={t}>{t}</span>
                      ))}
                    </div>
                  </form>
                </>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}