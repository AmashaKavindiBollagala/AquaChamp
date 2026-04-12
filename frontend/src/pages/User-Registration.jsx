import React, { useState, memo, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const FEATURES = [
  {
    icon: "🎮",
    title: "Fun Missions",
    desc: "Play and learn with exciting mini challenges",
  },
  {
    icon: "🏆",
    title: "Earn Badges",
    desc: "Collect rewards and unlock cool achievements",
  },
  {
    icon: "⭐",
    title: "Score Points",
    desc: "Gain XP and level up your clean habits",
  },
  {
    icon: "🧼",
    title: "Hygiene Tips",
    desc: "Learn healthy habits in a fun way",
  },
];

const Field = memo(function Field({
  name,
  label,
  type = "text",
  placeholder,
  note,
  icon,
  prefix,
  showToggle,
  show,
  onToggle,
  value,
  onChange,
  error,
  available,
  checking,
}) {
  return (
    <div className="w-full">
      <label className="mb-1 block text-[10px] font-extrabold uppercase tracking-[0.12em] text-sky-700">
        {label} {note && <span className="text-amber-500">{note}</span>}
      </label>

      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-sky-400">
            {icon}
          </span>
        )}

        {prefix && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-extrabold text-sky-700">
            {prefix}
          </span>
        )}

        <input
          type={showToggle ? (show ? "text" : "password") : type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete="off"
          min={name === "age" ? 5 : undefined}
          max={name === "age" ? 15 : undefined}
          className={`w-full rounded-xl border-2 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-sky-600 focus:ring-4 focus:ring-sky-100 ${
            icon ? "pl-9" : ""
          } ${prefix ? "pl-7" : ""} ${showToggle ? "pr-10" : ""} ${
            error ? "border-red-400" : available === true ? "border-emerald-400" : "border-sky-100"
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

        {/* Username/Email availability indicator */}
        {(name === "username" || name === "email") && value && !error && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {checking ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-sky-300 border-t-sky-600" />
            ) : available === true ? (
              <span className="text-emerald-500 text-sm" title={`${name === 'username' ? 'Username' : 'Email'} is available`}>✓</span>
            ) : available === false ? (
              <span className="text-red-500 text-sm" title={`${name === 'username' ? 'Username' : 'Email'} is already taken`}>✗</span>
            ) : null}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-[11px] font-semibold text-red-500">{error}</p>
      )}
      
      {/* Username availability message */}
      {name === "username" && value && value.length >= 3 && !error && available === true && (
        <p className="mt-1 text-[11px] font-semibold text-emerald-600">✓ Username is available</p>
      )}
      {name === "username" && value && value.length >= 3 && !error && available === false && (
        <p className="mt-1 text-[11px] font-semibold text-red-500">✗ This username is already taken</p>
      )}
      
      {/* Email availability message */}
      {name === "email" && value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && !error && available === true && (
        <p className="mt-1 text-[11px] font-semibold text-emerald-600">✓ Email is available</p>
      )}
      {name === "email" && value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && !error && available === false && (
        <p className="mt-1 text-[11px] font-semibold text-red-500">✗ This email is already registered</p>
      )}
    </div>
  );
});

export default function UserRegistration() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    age: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState(null);
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
  });

  // 🔗 Backend API URL
  const API_URL = `${import.meta.env.VITE_API_URL}/api/users/register`;

  const validate = () => {
    const e = {};

    if (!form.firstName.trim()) e.firstName = "First name is required";
    else if (form.firstName.length > 50)
      e.firstName = "First name cannot exceed 50 characters";

    if (!form.lastName.trim()) e.lastName = "Last name is required";
    else if (form.lastName.length > 50)
      e.lastName = "Last name cannot exceed 50 characters";

    if (!form.age) e.age = "Age is required";
    else {
      const ageNum = parseInt(form.age);
      if (isNaN(ageNum)) {
        e.age = "Age must be a valid number";
      } else if (ageNum < 0) {
        e.age = "Age cannot be negative";
      } else if (ageNum < 5 || ageNum > 15) {
        e.age = "Age must be between 5 and 15";
      }
    }

    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Please enter a valid email";
    else {
      // Check for common fake/random domain patterns
      const domain = form.email.split("@")[1];
      const hasNumbers = /\d/.test(domain.split(".")[0]);
      const isVeryShort = domain.split(".")[0].length < 3;
      
      // Block obviously fake domains with random numbers
      if (hasNumbers && isVeryShort) {
        e.email = "Please use a valid email address (e.g., gmail.com, yahoo.com, outlook.com)";
      }
    }

    if (!form.username.trim()) e.username = "Username is required";
    else if (form.username.length < 3 || form.username.length > 30)
      e.username = "Username must be between 3 and 30 characters";
    else if (!/^[a-zA-Z0-9_]+$/.test(form.username))
      e.username = "Username can only contain letters, numbers, and underscores";

    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6)
      e.password = "Password must be at least 6 characters";
    else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password))
      e.password =
        "Password must contain uppercase, lowercase, and a number";

    if (!form.confirmPassword)
      e.confirmPassword = "Confirm password is required";
    else if (form.password !== form.confirmPassword)
      e.confirmPassword = "Passwords do not match";

    return e;
  };

  // Check username availability
  const checkUsernameAvailability = useCallback(async (username) => {
    if (!username || username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    setCheckingUsername(true);
    try {
      // Try to find if user exists with this username
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/check-username/${username}`);
      setUsernameAvailable(response.data.available);
    } catch (error) {
      // If endpoint doesn't exist, we'll rely on registration error
      setUsernameAvailable(null);
    } finally {
      setCheckingUsername(false);
    }
  }, []);

  // Check email availability and validate domain
  const checkEmailAvailability = useCallback(async (email) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailAvailable(null);
      return;
    }

    // Check for fake domain patterns first
    const domain = email.split("@")[1];
    const hasNumbers = /\d/.test(domain.split(".")[0]);
    const isVeryShort = domain.split(".")[0].length < 3;
    
    if (hasNumbers && isVeryShort) {
      setErrors((prev) => ({
        ...prev,
        email: "Please use a valid email address (e.g., gmail.com, yahoo.com, outlook.com)",
      }));
      setEmailAvailable(null);
      return;
    }

    setCheckingEmail(true);
    try {
      // Try to find if user exists with this email
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/check-email/${email}`);
      setEmailAvailable(response.data.available);
      // Clear any previous email errors if domain is valid
      setErrors((prev) => ({
        ...prev,
        email: "",
      }));
    } catch (error) {
      // If endpoint doesn't exist, we'll rely on registration error
      setEmailAvailable(null);
    } finally {
      setCheckingEmail(false);
    }
  }, []);

  // Debounced checks
  const debounceTimeout = React.useRef(null);

  const onChange = useCallback((ev) => {
    const { name, value } = ev.target;

    // Prevent values outside 5-15 range for age
    if (name === "age") {
      // Allow empty value (for clearing the field)
      if (value === "") {
        setForm((prev) => ({ ...prev, [name]: "" }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
        setServerError("");
        return;
      }
      
      const numValue = parseInt(value);
      
      // Block non-numeric input
      if (isNaN(numValue)) {
        return;
      }
      
      // Allow typing multi-digit numbers temporarily (e.g., typing "1" then "0" to make "10")
      if (value.length <= 2 && numValue >= 1 && numValue <= 99) {
        setForm((prev) => ({ ...prev, [name]: value }));
        
        // Show error immediately if value is outside 5-15 range
        if (numValue < 5 || numValue > 15) {
          setErrors((prev) => ({
            ...prev,
            [name]: "Age must be between 5 and 15",
          }));
        } else {
          setErrors((prev) => ({ ...prev, [name]: "" }));
        }
        
        setServerError("");
        return;
      }
      
      // Block values outside 1-99 range or more than 2 digits
      if (numValue < 1 || numValue > 99 || value.length > 2) {
        return;
      }
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setServerError("");

    // Real-time email validation
    if (name === "email") {
      // Clear availability status when typing
      setEmailAvailable(null);
      
      // Check if email is not empty
      if (value.trim()) {
        // Check basic email format
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          setErrors((prev) => ({
            ...prev,
            email: "Please enter a valid email",
          }));
        } else {
          // Email format is valid, check for fake domains
          const domain = value.split("@")[1];
          const hasNumbers = /\d/.test(domain.split(".")[0]);
          const isVeryShort = domain.split(".")[0].length < 3;
          
          if (hasNumbers && isVeryShort) {
            setErrors((prev) => ({
              ...prev,
              email: "Please use a valid email address (e.g., gmail.com, yahoo.com, outlook.com)",
            }));
          }
        }
      }
    }

    // Check username availability with debounce
    if (name === "username") {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
      debounceTimeout.current = setTimeout(() => {
        checkUsernameAvailability(value.trim());
      }, 500);
    }

    // Check email availability with debounce
    if (name === "email") {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
      debounceTimeout.current = setTimeout(() => {
        checkEmailAvailability(value.trim().toLowerCase());
      }, 500);
    }

    // Check password strength in real-time
    if (name === "password") {
      setPasswordStrength({
        hasMinLength: value.length >= 6,
        hasUppercase: /[A-Z]/.test(value),
        hasLowercase: /[a-z]/.test(value),
        hasNumber: /\d/.test(value),
      });
    }
  }, [checkUsernameAvailability, checkEmailAvailability]);

  const togglePw = useCallback(() => {
    setShowPw((prev) => !prev);
  }, []);

  const toggleCpw = useCallback(() => {
    setShowCpw((prev) => !prev);
  }, []);

  const onSubmit = async (ev) => {
    ev.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setServerError("");

    try {
      const response = await axios.post(API_URL, {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        age: parseInt(form.age),
        email: form.email.trim().toLowerCase(),
        username: form.username.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
      }, {
        timeout: 10000, // 10 second timeout
      });

      if (response.data.success) {
        // Save email to localStorage for verification page
        localStorage.setItem("userEmail", form.email.trim().toLowerCase());
        
        navigate("/verify-email");

        // Optional: reset form after success
        setForm({
          firstName: "",
          lastName: "",
          age: "",
          email: "",
          username: "",
          password: "",
          confirmPassword: "",
        });

        setErrors({});
        setUsernameAvailable(null);
        setEmailAvailable(null);
        setPasswordStrength({
          hasMinLength: false,
          hasUppercase: false,
          hasLowercase: false,
          hasNumber: false,
        });
      }
    } catch (error) {
      console.error("Registration Error:", error);

      if (error.response?.data) {
        const data = error.response.data;

        // Backend validation errors from express-validator
        if (data.errors && Array.isArray(data.errors)) {
          const backendErrors = {};
          data.errors.forEach((err) => {
            backendErrors[err.path] = err.msg;
          });
          setErrors(backendErrors);
        } else {
          const message = data.message || "Registration failed";
          
          // Check if it's an invalid email domain error - show ONLY near email field
          if (message.includes("Invalid email domain") || message.includes("invalid email")) {
            setErrors((prev) => ({
              ...prev,
              email: "Please use a valid email address (e.g., gmail.com, yahoo.com, outlook.com)",
            }));
            // Don't show in server error banner
          } else {
            // Show other errors in server banner
            setServerError(message);
            
            // Check if it's a duplicate username or email error
            if (message.includes("username") || message.includes("Username")) {
              setErrors((prev) => ({
                ...prev,
                username: "This username is already taken",
              }));
              setUsernameAvailable(false);
            }
            if (message.includes("email") || message.includes("Email")) {
              setErrors((prev) => ({
                ...prev,
                email: "This email is already registered",
              }));
              setEmailAvailable(false);
            }
          }
        }
      } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        setServerError("Request timed out. Please try again.");
      } else {
        setServerError("Unable to connect to server. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#EAF5FF]">
      <div className="flex min-h-screen w-full">
        {/* LEFT PANEL */}
        <aside className="relative hidden min-h-screen w-[40%] overflow-hidden bg-linear-to-br from-[#042C53] via-[#185FA5] to-[#1D9E75] px-7 py-7 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-white/5" />
          <div className="absolute -left-12 -top-12 h-52 w-52 rounded-full bg-emerald-300/10" />
          <div className="absolute left-[12%] top-[18%] h-3 w-3 animate-bounce rounded-full bg-white/10" />
          <div className="absolute left-[75%] top-[20%] h-2.5 w-2.5 animate-pulse rounded-full bg-amber-300/20" />
          <div className="absolute left-[20%] bottom-[18%] h-4 w-4 animate-bounce rounded-full bg-white/10" />

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

          {/* Hero */}
          <div className="relative z-10 flex flex-1 flex-col justify-center">
            <h2 className="text-[28px] font-extrabold leading-tight">
              Play, Learn & <br />
              <span className="text-emerald-400">Stay Clean</span> ✨
            </h2>

            <div className="mt-5 flex gap-6">
              {[
                ["12K+", "Happy Kids"],
                ["100+", "Fun Quests"],
                ["Daily", "Tips"],
              ].map(([value, label]) => (
                <div key={label}>
                  <div className="text-xl font-extrabold text-amber-300">
                    {value}
                  </div>
                  <div className="mt-1 text-[10px] text-white/60">{label}</div>
                </div>
              ))}
            </div>

            <div className="mt-5 space-y-2.5">
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-3 py-2.5 backdrop-blur-md transition hover:bg-white/15"
                >
                  <span className="text-xl">{f.icon}</span>
                  <div>
                    <div className="text-[13px] font-extrabold">{f.title}</div>
                    <div className="text-[10px] leading-4 text-white/65">
                      {f.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="relative z-10 text-[10px] italic text-white/40">
            "Small clean habits make a big splash!"
          </p>
        </aside>

        {/* RIGHT PANEL */}
        <main className="flex min-h-screen flex-1 items-center justify-center px-4 py-6 lg:px-8">
          <div className="w-full max-w-2xl rounded-[28px] bg-white/85 p-5 shadow-[0_20px_60px_rgba(24,95,165,0.15)] backdrop-blur-xl lg:p-7">
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

            {success ? (
              <div className="flex min-h-130 flex-col items-center justify-center text-center">
                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-emerald-500 to-sky-600 text-4xl text-white shadow-xl">
                  ✓
                </div>

                <h3 className="text-3xl font-extrabold text-sky-950">
                  You’re a Hygiene Hero! 🎉
                </h3>

                <p className="mt-4 max-w-md text-sm font-semibold leading-7 text-slate-500">
                  Your account has been created successfully.
                </p>

                <button
                  onClick={() => setSuccess(false)}
                  className="mt-6 rounded-2xl bg-linear-to-r from-sky-700 to-emerald-500 px-8 py-3 text-sm font-extrabold text-white shadow-lg transition hover:-translate-y-1"
                >
                  Back to Form
                </button>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <h3 className="text-3xl font-extrabold text-sky-950">
                    Create Account
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Join AquaChamp and start your fun hygiene journey today.
                  </p>
                </div>

                {serverError && (
                  <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                    {serverError}
                  </div>
                )}

                <form onSubmit={onSubmit} noValidate className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field
                      name="firstName"
                      label="First Name"
                      placeholder="Enter Your First Name"
                      icon="👤"
                      value={form.firstName}
                      onChange={onChange}
                      error={errors.firstName}
                    />
                    <Field
                      name="lastName"
                      label="Last Name"
                      placeholder="Enter Your Last Name"
                      icon="👤"
                      value={form.lastName}
                      onChange={onChange}
                      error={errors.lastName}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-[100px_1fr]">
                    <Field
                      name="age"
                      label="Age"
                      note="(5–15)"
                      type="number"
                      placeholder="10"
                      value={form.age}
                      onChange={onChange}
                      error={errors.age}
                    />
                    <Field
                      name="username"
                      label="Username"
                      placeholder="Enter Your Username (Ex: clean_hero)"
                      prefix="@"
                      value={form.username}
                      onChange={onChange}
                      error={errors.username}
                      available={usernameAvailable}
                      checking={checkingUsername}
                    />
                  </div>

                  <Field
                    name="email"
                    label="Email Address"
                    type="email"
                    placeholder="user@gmail.com"
                    icon="✉"
                    value={form.email}
                    onChange={onChange}
                    error={errors.email}
                    available={emailAvailable}
                    checking={checkingEmail}
                  />

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <Field
                        name="password"
                        label="Password"
                        placeholder="Min 6 characters"
                        icon="🔒"
                        showToggle
                        show={showPw}
                        onToggle={togglePw}
                        value={form.password}
                        onChange={onChange}
                        error={errors.password}
                      />
                      
                      {/* Password Strength Indicator */}
                      {form.password && (
                        <div className="mt-2 space-y-1 rounded-lg bg-slate-50 p-2 text-[10px]">
                          <div className={`flex items-center gap-1.5 ${passwordStrength.hasMinLength ? 'text-emerald-600' : 'text-slate-400'}`}>
                            <span>{passwordStrength.hasMinLength ? '✓' : '○'}</span>
                            <span>At least 6 characters</span>
                          </div>
                          <div className={`flex items-center gap-1.5 ${passwordStrength.hasUppercase ? 'text-emerald-600' : 'text-slate-400'}`}>
                            <span>{passwordStrength.hasUppercase ? '✓' : '○'}</span>
                            <span>One uppercase letter (A-Z)</span>
                          </div>
                          <div className={`flex items-center gap-1.5 ${passwordStrength.hasLowercase ? 'text-emerald-600' : 'text-slate-400'}`}>
                            <span>{passwordStrength.hasLowercase ? '✓' : '○'}</span>
                            <span>One lowercase letter (a-z)</span>
                          </div>
                          <div className={`flex items-center gap-1.5 ${passwordStrength.hasNumber ? 'text-emerald-600' : 'text-slate-400'}`}>
                            <span>{passwordStrength.hasNumber ? '✓' : '○'}</span>
                            <span>One number (0-9)</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <Field
                      name="confirmPassword"
                      label="Confirm Password"
                      placeholder="Re-enter password"
                      icon="🔐"
                      showToggle
                      show={showCpw}
                      onToggle={toggleCpw}
                      value={form.confirmPassword}
                      onChange={onChange}
                      error={errors.confirmPassword}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-1 flex w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-sky-700 to-emerald-500 px-4 py-3 text-sm font-extrabold text-white shadow-lg transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loading ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Creating Account…
                      </>
                    ) : (
                      <>🎮 Join AquaChamp</>
                    )}
                  </button>

                  <p className="text-center text-sm font-semibold text-slate-500">
                    Already a hero?{" "}
                     <button
                          type="button"
                           onClick={() => navigate("/login")}
                          className="font-extrabold text-sky-700 hover:underline"
                      >
                       Sign In 
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
  );
}