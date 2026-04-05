import { useNavigate } from "react-router-dom";

export default function EmailVerified() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-[#EAF5FF]">
      <div className="flex min-h-screen w-full">

        {/* LEFT PANEL — same as registration */}
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
              You Did It,<br />
              <span className="text-emerald-400">Champion! 🏆</span>
            </h2>
            <p className="mt-3 text-sm text-white/70 leading-relaxed max-w-60">
              Your email is verified! Login and dive into your hygiene adventure right now!
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
            <div className="mb-5 flex items-center gap-3 lg:hidden">
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

            {/* ✅ Big Verified Icon */}
            <div className="flex justify-center mb-5">
              <div className="relative">
                {/* Outer glow ring */}
                <div className="absolute inset-0 rounded-full bg-linear-to-br from-emerald-400 to-sky-500 opacity-30 blur-xl scale-125" />
                <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-linear-to-br from-emerald-400 to-sky-600 shadow-2xl text-6xl">
                  ✅
                </div>
                {/* Sparkle dots */}
                <div className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-amber-400 animate-bounce shadow-md" />
                <div className="absolute -bottom-1 -left-2 h-4 w-4 rounded-full bg-emerald-300 animate-pulse shadow" />
                <div className="absolute top-1 -left-3 h-3 w-3 rounded-full bg-sky-300 animate-bounce shadow" />
              </div>
            </div>

            {/* Floating emoji celebration row */}
            <div className="flex justify-center gap-2 text-xl mb-3 animate-bounce">
              🌊 🎉 🏆 ⭐ 🎮
            </div>

            {/* ✅ BIG SUCCESS BANNER */}
            <div className="relative rounded-[20px] bg-linear-to-r from-emerald-500 via-sky-500 to-[#185FA5] p-0.5 shadow-xl mb-5">
              <div className="rounded-[18px] bg-linear-to-br from-emerald-50 to-sky-50 px-5 py-4">
                <h2 className="text-[22px] font-extrabold leading-snug text-sky-950">
                  Email Verified
                </h2>
                <h2 className="text-[27px] font-extrabold leading-snug bg-linear-to-r from-emerald-500 to-sky-600 bg-clip-text text-transparent">
                  Successfully! 🎊
                </h2>
                <p className="mt-2 text-[13px] font-bold text-slate-500 leading-relaxed">
                  Woohoo! 🥳 You're now a verified AquaChamp hero.<br />
                  Login and start your clean water adventure!
                </p>
              </div>
            </div>

            {/* Unlocked features strip */}
            <div className="mb-5 grid grid-cols-3 gap-2">
              {[
                { icon: "🎮", label: "Missions Unlocked", color: "border-sky-200 bg-sky-50 text-sky-700" },
                { icon: "🏅", label: "Badges Ready", color: "border-violet-200 bg-violet-50 text-violet-700" },
                { icon: "⭐", label: "XP Waiting!", color: "border-amber-200 bg-amber-50 text-amber-700" },
              ].map(({ icon, label, color }) => (
                <div
                  key={label}
                  className={`rounded-2xl border-2 ${color} px-2 py-3 flex flex-col items-center gap-1 shadow-sm`}
                >
                  <span className="text-2xl">{icon}</span>
                  <span className="text-[10px] font-extrabold leading-tight text-center">{label}</span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <button
              onClick={() => navigate("/login")}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-sky-700 to-emerald-500 px-6 py-3.5 text-[15px] font-extrabold text-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
            >
              🔑 Login to AquaChamp
            </button>

            <p className="mt-3 text-[12px] font-semibold text-slate-400">
              Your adventure is just one click away! 🚀
            </p>

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