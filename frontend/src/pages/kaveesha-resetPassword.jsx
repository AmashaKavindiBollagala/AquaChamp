import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(null); // null = checking, true/false
  const [success, setSuccess] = useState(false);

  // Validate password with same rules as registration
  const validatePassword = (password) => {
    if (password.length < 6) return "Password must be at least 6 characters long";
    if (!/[A-Z]/.test(password)) return "Password must include at least one uppercase letter";
    if (!/[0-9]/.test(password)) return "Password must include at least one number";
    if (!/[a-z]/.test(password)) return "Password must include at least one lowercase letter";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return "Password must include at least one special character";
    return null;
  };

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      try {
        console.log("🔐 Verifying reset token...");
        const response = await axios.get(
          `http://localhost:4000/api/security/forgot-password/verify-token/${token}`
        );
        console.log("✅ Token valid:", response.data);
        setTokenValid(true);
      } catch (error) {
        console.error("❌ Token invalid:", error.response?.data?.message);
        setTokenValid(false);
        setServerError(error.response?.data?.message || "Invalid or expired link");
      }
    };

    if (token) {
      verifyToken();
    }
  }, [token]);

  const validate = () => {
    const e = {};
    
    const passwordError = validatePassword(form.newPassword);
    if (passwordError) {
      e.newPassword = passwordError;
    }
    
    if (!form.confirmPassword) {
      e.confirmPassword = "Please confirm your password";
    } else if (form.newPassword !== form.confirmPassword) {
      e.confirmPassword = "Passwords do not match";
    }
    
    return e;
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setServerError("");
  };

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
      console.log("🔄 Resetting password...");
      await axios.post("http://localhost:4000/api/security/forgot-password/reset", {
        token,
        newPassword: form.newPassword,
      });
      
      console.log("✅ Password reset successful!");
      setSuccess(true);
      
      // Auto redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      console.error("❌ Reset password error:", error.response?.data);
      setServerError(error.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  if (tokenValid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EAF5FF]">
        <div className="text-center">
          <div className="h-16 w-16 mx-auto mb-4 animate-spin rounded-full border-4 border-sky-200 border-t-sky-600" />
          <p className="text-sky-700 font-bold">Verifying your link...</p>
        </div>
      </div>
    );
  }

  if (tokenValid === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EAF5FF] p-4">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl text-center">
          <div className="mb-4 text-6xl">❌</div>
          <h2 className="text-2xl font-extrabold text-sky-950 mb-2">Invalid Link</h2>
          <p className="text-slate-600 mb-6">{serverError}</p>
          <button
            onClick={() => navigate("/login")}
            className="rounded-2xl bg-linear-to-r from-sky-700 to-emerald-500 px-8 py-3 text-sm font-extrabold text-white shadow-lg transition hover:-translate-y-1"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EAF5FF] p-4">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl text-center">
          <div className="mb-4 text-6xl animate-bounce">🎉</div>
          <h2 className="text-3xl font-extrabold text-sky-950 mb-2">Password Reset Successful!</h2>
          <p className="text-slate-600 mb-4">Your password has been updated.</p>
          <p className="text-sm text-sky-600 font-semibold">Redirecting to login page...</p>
          <div className="mt-4 h-2 w-full bg-sky-100 rounded-full overflow-hidden">
            <div className="h-full bg-linear-to-r from-sky-600 to-emerald-500 animate-[shrink_3s_linear]" style={{ width: '100%' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#EAF5FF] p-4">
      <div className="w-full max-w-md rounded-3xl bg-white/85 p-8 shadow-2xl backdrop-blur-xl">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-sky-500 to-emerald-500 text-3xl shadow-lg">
            🔐
          </div>
          <h2 className="text-3xl font-extrabold text-sky-950">Reset Password</h2>
          <p className="mt-1 text-sm text-slate-500">Create a new secure password</p>
        </div>

        {serverError && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            {serverError}
          </div>
        )}

        <form onSubmit={onSubmit} noValidate className="space-y-4">
          {/* New Password */}
          <div>
            <label className="mb-1 block text-[10px] font-extrabold uppercase tracking-[0.12em] text-sky-700">
              New Password
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-sky-400">
                🔒
              </span>
              <input
                type={showPw ? "text" : "password"}
                name="newPassword"
                value={form.newPassword}
                onChange={onChange}
                placeholder="Enter new password"
                className={`w-full rounded-xl border-2 bg-white pl-9 pr-10 py-2.5 text-sm text-slate-800 outline-none transition focus:border-sky-600 focus:ring-4 focus:ring-sky-100 ${
                  errors.newPassword ? "border-red-400" : "border-sky-100"
                }`}
              />
              <button
                type="button"
                tabIndex={-1}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-sky-400 hover:text-sky-700"
              >
                {showPw ? "🙈" : "👁"}
              </button>
            </div>
            {errors.newPassword && (
              <p className="mt-1 text-[11px] font-semibold text-red-500">{errors.newPassword}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="mb-1 block text-[10px] font-extrabold uppercase tracking-[0.12em] text-sky-700">
              Confirm New Password
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-sky-400">
                🔒
              </span>
              <input
                type={showConfirmPw ? "text" : "password"}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={onChange}
                placeholder="Confirm new password"
                className={`w-full rounded-xl border-2 bg-white pl-9 pr-10 py-2.5 text-sm text-slate-800 outline-none transition focus:border-sky-600 focus:ring-4 focus:ring-sky-100 ${
                  errors.confirmPassword ? "border-red-400" : "border-sky-100"
                }`}
              />
              <button
                type="button"
                tabIndex={-1}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setShowConfirmPw(!showConfirmPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-sky-400 hover:text-sky-700"
              >
                {showConfirmPw ? "🙈" : "👁"}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-[11px] font-semibold text-red-500">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Password Requirements */}
          <div className="rounded-xl bg-sky-50 p-3 border border-sky-100">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-sky-700 mb-2">
              Password Requirements:
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              {[
                { icon: "📏", text: "6+ characters", met: form.newPassword.length >= 6 },
                { icon: "🔤", text: "Uppercase (A-Z)", met: /[A-Z]/.test(form.newPassword) },
                { icon: "🔡", text: "Lowercase (a-z)", met: /[a-z]/.test(form.newPassword) },
                { icon: "🔢", text: "Number (0-9)", met: /[0-9]/.test(form.newPassword) },
                { icon: "✨", text: "Special char", met: /[!@#$%^&*(),.?":{}|<>]/.test(form.newPassword) },
              ].map(({ icon, text, met }) => (
                <div key={text} className={`flex items-center gap-1.5 ${met ? 'text-emerald-600' : 'text-slate-400'}`}>
                  <span>{icon}</span>
                  <span className="font-semibold">{text}</span>
                  {met && <span className="text-emerald-500">✓</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-sky-700 to-emerald-500 px-4 py-3 text-sm font-extrabold text-white shadow-lg transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Resetting Password…
              </>
            ) : (
              <>🔄 Reset Password</>
            )}
          </button>

          {/* Back to Login */}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="w-full rounded-xl py-2 text-sm font-bold text-slate-400 transition hover:text-slate-600"
          >
            ← Back to Login
          </button>
        </form>
      </div>

      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}
