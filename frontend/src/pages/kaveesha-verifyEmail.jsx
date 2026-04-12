import React, { useState } from "react";

export default function VerifyEmail() {
  const [resendMessage, setResendMessage] = useState("");
  const [resending, setResending] = useState(false);

  // get email saved during registration
  const email = localStorage.getItem("userEmail");

  // function to call backend to resend email
  const handleResend = async () => {
    setResending(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/security/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      setResendMessage(data.message);
    } catch (error) {
      setResendMessage("Error sending email. Try again.");
    } finally {
      setResending(false);
    }
  };

  const getEmailProvider = () => {
    if (!email) return "https://mail.google.com";
    if (email.includes("gmail.com")) return "https://mail.google.com";
    if (email.includes("yahoo.com")) return "https://mail.yahoo.com";
    if (email.includes("outlook.com")) return "https://outlook.live.com";
    return "https://mail.google.com";
  };

  // Left panel step cards with individual color themes
  const LEFT_STEPS = [
    {
      icon: "📬",
      title: "Check Your Inbox",
      desc: "Look for a message from AquaChamp",
      iconBg: "bg-sky-400/30",
      border: "border-sky-400/30",
      hoverBg: "hover:bg-sky-400/20",
      accent: "text-sky-300",
      badge: "bg-sky-400",
      num: "1",
    },
    {
      icon: "🔍",
      title: "Check Spam Too",
      desc: "Sometimes emails hide there!",
      iconBg: "bg-violet-400/30",
      border: "border-violet-400/30",
      hoverBg: "hover:bg-violet-400/20",
      accent: "text-violet-300",
      badge: "bg-violet-400",
      num: "2",
    },
    {
      icon: "✅",
      title: "Click Verify Link",
      desc: "One tap and you're ready to play",
      iconBg: "bg-amber-400/30",
      border: "border-amber-400/30",
      hoverBg: "hover:bg-amber-400/20",
      accent: "text-amber-300",
      badge: "bg-amber-400",
      num: "3",
    },
    {
      icon: "🎮",
      title: "Start Your Quest",
      desc: "Missions and badges await you!",
      iconBg: "bg-emerald-400/30",
      border: "border-emerald-400/30",
      hoverBg: "hover:bg-emerald-400/20",
      accent: "text-emerald-300",
      badge: "bg-emerald-400",
      num: "4",
    },
  ];

  return (
    <div className="min-h-screen w-full bg-[#EAF5FF]">
      <div className="flex min-h-screen w-full">

        {/* LEFT PANEL */}
        <aside className="relative hidden min-h-screen w-[40%] overflow-hidden bg-linear-to-br from-[#042C53] via-[#185FA5] to-[#1D9E75] px-7 py-7 text-white lg:flex lg:flex-col lg:justify-between">
          {/* Decorative circles */}
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

          {/* Hero section */}
          <div className="relative z-10 flex flex-1 flex-col justify-center">
            <h2 className="text-[28px] font-extrabold leading-tight">
              Almost There,<br />
              <span className="text-emerald-400">Hero! ✨</span>
            </h2>
            <p className="mt-3 text-sm text-white/70 leading-relaxed max-w-60">
              Check your email to verify your account and start your hygiene adventure!
            </p>

            <div className="mt-6 space-y-3">
              {[
                { icon: "🎮", title: "Fun Missions", desc: "Play and learn with exciting mini challenges" },
                { icon: "🏆", title: "Earn Badges", desc: "Collect rewards and unlock cool achievements" },
                { icon: "⭐", title: "Score Points", desc: "Gain XP and level up your clean habits" },
                { icon: "🧼", title: "Hygiene Tips", desc: "Learn healthy habits in a fun way" },
              ].map((f) => (
                <div
                  key={f.title}
                  className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-3 py-2.5 backdrop-blur-md transition hover:bg-white/15"
                >
                  <span className="text-xl">{f.icon}</span>
                  <div>
                    <div className="text-[13px] font-extrabold">{f.title}</div>
                    <div className="text-[10px] leading-4 text-white/65">{f.desc}</div>
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
          <div className="w-full max-w-lg rounded-[28px] bg-white/85 px-7 py-8 shadow-[0_20px_60px_rgba(24,95,165,0.15)] backdrop-blur-xl text-center">

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

            {/* Success Icon */}
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-linear-to-br from-emerald-400 to-sky-600 shadow-2xl text-5xl">
                  🎉
                </div>
                {/* Sparkle dots */}
                <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-amber-400 animate-bounce shadow" />
                <div className="absolute -bottom-1 -left-1 h-3 w-3 rounded-full bg-emerald-400 animate-pulse shadow" />
                <div className="absolute top-2 -left-3 h-2.5 w-2.5 rounded-full bg-sky-300 animate-bounce shadow" />
              </div>
            </div>

            {/* Heading */}
            <h2 className="text-[28px] font-extrabold text-sky-950 leading-tight">
              You're Almost a
            </h2>
            <h2 className="text-[30px] font-extrabold leading-tight bg-linear-to-r from-sky-600 to-emerald-500 bg-clip-text text-transparent mb-1">
              Hygiene Hero! 🏆
            </h2>

            <p className="mt-2 text-[14px] font-semibold text-slate-500 leading-relaxed">
              Your account has been created successfully! 🎊<br />
              Now let's verify your email to unlock your adventure.
            </p>

            {/* 📧 EMAIL DISPLAY */}
            <div className="relative mt-4 mb-4 rounded-[18px] border-2 border-sky-200 bg-linear-to-r from-sky-50 to-emerald-50 px-5 py-4 shadow-inner">
              {/* Pulsing mail icon */}
              <div className="flex justify-center mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-sky-500 to-emerald-500 shadow-md text-xl animate-pulse">
                  📧
                </div>
              </div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-sky-500 mb-2">
                ✉️ Verification Email Sent To
              </p>
              <div className="rounded-xl border-2 border-sky-300 bg-white px-5 py-2.5 shadow-sm">
                <p className="text-[15px] font-extrabold text-sky-800 break-all">
                  {email || "your email address"}
                </p>
              </div>
              <p className="mt-2 text-[11px] font-semibold text-amber-600">
                📩 Check your <strong>inbox</strong> & <strong>spam folder</strong> — it might be hiding there!
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2.5 justify-center mb-4">
              <a
                href={getEmailProvider()}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-sky-700 to-emerald-500 px-5 py-2.5 text-[13px] font-extrabold text-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
              >
                📬 Open My Email
              </a>

              <button
                onClick={handleResend}
                disabled={resending}
                className="flex items-center justify-center gap-2 rounded-2xl border-2 border-sky-200 bg-white px-5 py-2.5 text-[13px] font-extrabold text-sky-700 shadow transition hover:-translate-y-1 hover:border-sky-400 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
              >
                {resending ? (
                  <>
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-sky-300 border-t-sky-700" />
                    Sending…
                  </>
                ) : (
                  <>🔁 Resend Email</>
                )}
              </button>
            </div>

            {/* Resend feedback */}
            {resendMessage && (
              <div className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-[12px] font-semibold text-emerald-700">
                ✅ {resendMessage}
              </div>
            )}

            {/* 🪜 4-STEP GUIDE */}
            <div className="grid grid-cols-4 gap-1.5">
              {[
                {
                  icon: "📬",
                  step: "1",
                  label: "Check Inbox",
                  desc: "Open your email",
                  gradient: "from-sky-400 to-sky-600",
                  bg: "from-sky-50 to-sky-100",
                  border: "border-sky-200",
                  text: "text-sky-700",
                },
                {
                  icon: "🔗",
                  step: "2",
                  label: "Click Link",
                  desc: "Tap verify button",
                  gradient: "from-violet-400 to-violet-600",
                  bg: "from-violet-50 to-violet-100",
                  border: "border-violet-200",
                  text: "text-violet-700",
                },
                {
                  icon: "🔑",
                  step: "3",
                  label: "Login",
                  desc: "Sign in to AquaChamp",
                  gradient: "from-amber-400 to-orange-500",
                  bg: "from-amber-50 to-orange-50",
                  border: "border-amber-200",
                  text: "text-amber-700",
                },
                {
                  icon: "🎮",
                  step: "4",
                  label: "Start Playing!",
                  desc: "Earn badges & XP",
                  gradient: "from-emerald-400 to-emerald-600",
                  bg: "from-emerald-50 to-emerald-100",
                  border: "border-emerald-200",
                  text: "text-emerald-700",
                },
              ].map(({ icon, step, label, desc, gradient, bg, border, text }, i, arr) => (
                <div key={step} className="relative flex flex-col items-center">
                  {/* Connector line between steps */}
                  {i < arr.length - 1 && (
                    <div className="absolute top-4.5 left-[calc(50%+14px)] w-[calc(100%-4px)] h-0.5 bg-linear-to-r from-sky-200 to-sky-100 z-0" />
                  )}
                  <div className={`relative z-10 w-full rounded-2xl border-2 ${border} bg-linear-to-br ${bg} px-1.5 py-2.5 flex flex-col items-center gap-1 shadow-sm`}>
                    {/* Step number badge */}
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full bg-linear-to-br ${gradient} text-white text-[10px] font-extrabold shadow mb-0.5`}>
                      {step}
                    </div>
                    <span className="text-xl">{icon}</span>
                    <span className={`text-[10px] font-extrabold ${text} leading-tight text-center`}>{label}</span>
                    <span className="text-[9px] text-slate-400 font-semibold leading-tight text-center">{desc}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Trust badges */}
            <div className="mt-4 flex justify-center gap-5 text-[11px] font-bold text-slate-400">
              {["🔒 Secure", "🎮 Fun", "✅ Safe"].map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}