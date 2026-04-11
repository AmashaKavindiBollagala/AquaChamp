import { Link } from "react-router-dom";

/* ── Floating bubbles config ─────────────────────────────── */
const bubbles = [
  { size: 80,  left: "5%",  top: "12%", delay: "0s",   dur: "6s"  },
  { size: 50,  left: "15%", top: "70%", delay: "1s",   dur: "8s"  },
  { size: 120, left: "80%", top: "15%", delay: "2s",   dur: "7s"  },
  { size: 40,  left: "70%", top: "65%", delay: "0.5s", dur: "5s"  },
  { size: 60,  left: "50%", top: "80%", delay: "1.5s", dur: "9s"  },
  { size: 30,  left: "90%", top: "45%", delay: "3s",   dur: "6s"  },
  { size: 90,  left: "25%", top: "30%", delay: "2.5s", dur: "10s" },
];

/* ── Mission values ──────────────────────────────────────── */
const values = [
  {
    emoji: "💧", title: "Clean Water Access",
    desc: "We believe every child deserves access to clean, safe water. Our lessons teach kids why water matters and how to protect it.",
    color: "from-blue-400 to-blue-600", bg: "bg-blue-50",
  },
  {
    emoji: "🧼", title: "Hygiene Education",
    desc: "From handwashing to sanitation, we make hygiene fun and memorable through interactive stories and games.",
    color: "from-cyan-400 to-teal-500", bg: "bg-cyan-50",
  },
  {
    emoji: "🌍", title: "Global Impact",
    desc: "Aligned with the UN's SDG Goal 6, we're on a mission to empower the next generation to be stewards of our water planet.",
    color: "from-sky-400 to-blue-500", bg: "bg-sky-50",
  },
  {
    emoji: "🎮", title: "Learning Through Play",
    desc: "We design every quiz, badge, and lesson to make kids excited — because the best learning feels like an adventure.",
    color: "from-teal-400 to-cyan-600", bg: "bg-teal-50",
  },
];

/* ── Team members ────────────────────────────────────────── */
const team = [
  { name: "Dr. Priya Nair",   role: "Founder & Water Scientist", avatar: "👩‍🔬", color: "from-blue-400 to-cyan-400",    fact: "Has worked in 12 countries on clean water projects!" },
  { name: "James Okafor",     role: "Lead Educator & Designer",  avatar: "👨‍🎨", color: "from-cyan-400 to-teal-500",    fact: "Turned 50+ hygiene lessons into fun adventures." },
  { name: "Sofia Ramirez",    role: "Child Psychology Expert",   avatar: "👩‍💼", color: "from-sky-400 to-blue-500",     fact: "Ensures every game is perfectly age-appropriate." },
  { name: "Arun Sharma",      role: "Tech Lead & Developer",     avatar: "👨‍💻", color: "from-teal-400 to-cyan-600",    fact: "Built AquaChamp from the ground up with ❤️." },
];

/* ── Timeline milestones ─────────────────────────────────── */
const milestones = [
  { year: "2021", icon: "💡", title: "The Idea",        desc: "AquaChamp was born from a school science fair project about clean water." },
  { year: "2022", icon: "🛠️", title: "Built & Tested",  desc: "We partnered with 10 schools to test our first lessons and quizzes." },
  { year: "2023", icon: "🚀", title: "Official Launch",  desc: "AquaChamp went live and reached 1,000 kids in the first month!" },
  { year: "2024", icon: "🌍", title: "Going Global",    desc: "Expanded to 15 countries with lessons available in 8 languages." },
  { year: "2025", icon: "🏆", title: "5,000+ Heroes",   desc: "Over 5,000 AquaChamps worldwide protecting water every day." },
];

/* ── SDG Goals ───────────────────────────────────────────── */
const sdgPoints = [
  { icon: "🚰", text: "Universal access to safe drinking water" },
  { icon: "🚽", text: "Adequate sanitation and hygiene for all" },
  { icon: "🌊", text: "Improving water quality worldwide" },
  { icon: "♻️", text: "Sustainable water use & conservation" },
  { icon: "🤝", text: "International cooperation on water issues" },
];

/* ══════════════════════════════════════════════════════════
   ABOUT PAGE
══════════════════════════════════════════════════════════ */
export default function AboutPage() {
  return (
    <div className="min-h-screen overflow-x-hidden" style={{ fontFamily: "'Nunito', sans-serif" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800;900&display=swap');
        @keyframes float {
          0%,100% { transform: translateY(0)    scale(1);    }
          50%      { transform: translateY(-20px) scale(1.05); }
        }
        @keyframes pop {
          0%   { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1);   opacity: 1; }
        }
        .animate-pop { animation: pop 0.6s ease forwards; }
        @keyframes slideUp {
          0%   { transform: translateY(30px); opacity: 0; }
          100% { transform: translateY(0);    opacity: 1; }
        }
        .animate-slide-up { animation: slideUp 0.7s ease forwards; }
      `}</style>

      {/* ════════════ HERO ════════════ */}
      <section className="relative min-h-[70vh] flex items-center justify-center
                          bg-gradient-to-br from-blue-900 via-cyan-800 to-emerald-500
                          overflow-hidden pb-16">

        {/* Bubbles */}
        <div className="absolute inset-0 pointer-events-none">
          {bubbles.map((b, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white/10 border border-white/20"
              style={{
                width: b.size, height: b.size,
                left: b.left,  top: b.top,
                animation: `float ${b.dur} ease-in-out ${b.delay} infinite`,
              }}
            />
          ))}
        </div>

        {/* Wave bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 70" className="w-full block" fill="white">
            <path d="M0,35 C360,70 1080,0 1440,35 L1440,70 L0,70 Z" />
          </svg>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center animate-pop pt-10">
          <div className="inline-flex items-center gap-2 bg-white/20 border border-white/30
                          rounded-full px-4 py-2 text-white text-xs font-bold mb-6 tracking-wide">
            🌍 Our Story &amp; Mission
          </div>

          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-black text-white
                       leading-tight mb-6 drop-shadow-lg"
            style={{ fontFamily: "'Fredoka One', cursive" }}
          >
            About <span className="text-yellow-300">AquaChamp</span> 💧
          </h1>

          <p className="text-blue-100 text-lg sm:text-xl leading-relaxed mb-8 max-w-2xl mx-auto">
            We're on a mission to make every kid on the planet a champion of
            clean water and good hygiene — one fun lesson at a time!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="px-8 py-4 bg-yellow-400 hover:bg-yellow-300 text-blue-900
                         font-black text-lg rounded-2xl shadow-xl
                         hover:shadow-yellow-300/50 hover:scale-105 transition-all duration-200"
              style={{ fontFamily: "'Fredoka One', cursive" }}
            >
              🚀 Join the Mission!
            </Link>
            <a
              href="#our-story"
              className="px-8 py-4 bg-white/20 hover:bg-white/30 text-white
                         font-black text-lg rounded-2xl border-2 border-white/50
                         hover:scale-105 transition-all duration-200"
              style={{ fontFamily: "'Fredoka One', cursive" }}
            >
              📖 Read Our Story
            </a>
          </div>
        </div>
      </section>

      {/* ════════════ OUR STORY ════════════ */}
      <section id="our-story" className="bg-white py-20 px-6">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-14">

          {/* Image */}
          <div className="flex-1 flex justify-center">
            <div className="relative w-72 h-72 sm:w-80 sm:h-80">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-100 to-cyan-100
                              border-4 border-blue-200 flex items-center justify-center shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&h=400&fit=crop"
                  alt="Kids learning about water"
                  className="w-56 h-56 sm:w-64 sm:h-64 rounded-full object-cover border-4 border-white shadow-xl"
                />
              </div>
              <div className="absolute -top-4 -right-4 w-14 h-14 bg-yellow-400 rounded-2xl
                              flex items-center justify-center text-2xl shadow-lg animate-bounce">🌍</div>
              <div className="absolute -bottom-4 -left-4 w-14 h-14 bg-cyan-400 rounded-2xl
                              flex items-center justify-center text-2xl shadow-lg animate-bounce"
                   style={{ animationDelay: "0.5s" }}>💧</div>
            </div>
          </div>

          {/* Text */}
          <div className="flex-1">
            <span className="inline-block bg-blue-100 text-blue-600 font-black text-xs
                             px-4 py-2 rounded-full mb-4 tracking-widest uppercase">
              Our Story
            </span>
            <h2
              className="text-4xl sm:text-5xl font-black text-blue-800 mb-6"
              style={{ fontFamily: "'Fredoka One', cursive" }}
            >
              Why We Built AquaChamp 🌊
            </h2>
            <div className="space-y-4 text-blue-600 leading-relaxed text-base">
              <p>
                Did you know that over <strong className="text-blue-800">2 billion people</strong> around
                the world still don't have access to clean drinking water? That's a huge problem 
                and we believe kids can be part of the solution!
              </p>
              <p>
                AquaChamp was created in 2021 by a group of water scientists, educators, and
                designers who wanted to make learning about clean water and hygiene
                <strong className="text-blue-800"> genuinely exciting</strong> for children.
              </p>
              <p>
                We turned complex topics like sanitation, water conservation, and hygiene into
                <strong className="text-blue-800"> colourful adventures</strong>, quizzes, and badge
                challenges because we believe the habits kids build today will shape the planet tomorrow.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════ VALUES ════════════ */}
      <section className="bg-gradient-to-b from-white to-blue-50 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block bg-blue-100 text-blue-600 font-black text-xs
                             px-4 py-2 rounded-full mb-4 tracking-widest uppercase">
              What We Stand For
            </span>
            <h2
              className="text-4xl sm:text-5xl font-black text-blue-800"
              style={{ fontFamily: "'Fredoka One', cursive" }}
            >
              Our Core Values 🏅
            </h2>
            <p className="text-blue-400 mt-4 max-w-xl mx-auto">
              Everything we build is guided by these four big ideas.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {values.map((v, i) => (
              <div
                key={i}
                className={`group ${v.bg} rounded-3xl p-7 border border-blue-100
                            hover:shadow-xl hover:-translate-y-2 transition-all duration-300
                            flex gap-5 items-start`}
              >
                <div
                  className={`w-14 h-14 min-w-[3.5rem] rounded-2xl bg-gradient-to-br ${v.color}
                               flex items-center justify-center text-3xl shadow-lg
                               group-hover:scale-110 transition-transform duration-300`}
                >
                  {v.emoji}
                </div>
                <div>
                  <h3
                    className="text-xl font-black text-blue-800 mb-2"
                    style={{ fontFamily: "'Fredoka One', cursive" }}
                  >{v.title}</h3>
                  <p className="text-blue-500 text-sm leading-relaxed">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ SDG SECTION ════════════ */}
      <section className="bg-gradient-to-br from-blue-900 via-cyan-800 to-emerald-500 py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <svg viewBox="0 0 800 400" className="w-full h-full">
            <circle cx="100" cy="100" r="120" fill="white" />
            <circle cx="700" cy="300" r="150" fill="white" />
          </svg>
        </div>

        <div className="relative max-w-5xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          {/* Left */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-white/20 border border-white/30
                            rounded-full px-4 py-2 text-white text-xs font-bold mb-6 tracking-wide">
              🌍 United Nations SDG Goal 6
            </div>
            <h2
              className="text-4xl sm:text-5xl font-black text-white mb-6"
              style={{ fontFamily: "'Fredoka One', cursive" }}
            >
              Clean Water &amp; Sanitation for Everyone 💧
            </h2>
            <p className="text-blue-100 leading-relaxed mb-6">
              AquaChamp is proudly aligned with the United Nations Sustainable
              Development Goal 6  ensuring clean water and sanitation for all people
              on Earth by 2030. Every lesson, quiz, and badge we create moves us
              closer to that goal!
            </p>
            <Link
              to="/student/dashboard"
              className="inline-flex items-center gap-2 px-8 py-4 bg-yellow-400 hover:bg-yellow-300
                         text-blue-900 font-black text-lg rounded-2xl shadow-xl
                         hover:scale-105 transition-all duration-200"
              style={{ fontFamily: "'Fredoka One', cursive" }}
            >
              📚 Start Learning Now
            </Link>
          </div>

          {/* Right — SDG points */}
          <div className="flex-1 w-full">
            <div className="bg-white/15 border border-white/30 rounded-3xl p-8 space-y-4">
              <h3
                className="text-white font-black text-xl mb-6"
                style={{ fontFamily: "'Fredoka One', cursive" }}
              >SDG 6 Targets We Support:</h3>
              {sdgPoints.map((p, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30
                                  flex items-center justify-center text-xl flex-shrink-0">
                    {p.icon}
                  </div>
                  <span className="text-blue-100 text-sm font-semibold">{p.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════ TIMELINE ════════════ */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block bg-blue-100 text-blue-600 font-black text-xs
                             px-4 py-2 rounded-full mb-4 tracking-widest uppercase">
              Our Journey
            </span>
            <h2
              className="text-4xl sm:text-5xl font-black text-blue-800"
              style={{ fontFamily: "'Fredoka One', cursive" }}
            >
              How We Got Here 🗺️
            </h2>
          </div>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-8 sm:left-1/2 top-0 bottom-0 w-1
                            bg-gradient-to-b from-blue-300 to-cyan-300 rounded-full
                            hidden sm:block -translate-x-1/2" />

            <div className="space-y-8">
              {milestones.map((m, i) => (
                <div
                  key={i}
                  className={`relative flex flex-col sm:flex-row items-start sm:items-center gap-4
                              ${i % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"}`}
                >
                  {/* Card */}
                  <div className={`flex-1 ${i % 2 === 0 ? "sm:text-right" : "sm:text-left"}`}>
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-6
                                    border border-blue-100 hover:shadow-lg hover:-translate-y-1
                                    transition-all duration-200">
                      <div
                        className="text-blue-400 font-black text-xs tracking-widest uppercase mb-1"
                      >{m.year}</div>
                      <h3
                        className="text-xl font-black text-blue-800 mb-2"
                        style={{ fontFamily: "'Fredoka One', cursive" }}
                      >{m.icon} {m.title}</h3>
                      <p className="text-blue-500 text-sm leading-relaxed">{m.desc}</p>
                    </div>
                  </div>

                  {/* Center dot */}
                  <div className="hidden sm:flex w-10 h-10 rounded-full bg-gradient-to-br
                                  from-blue-400 to-cyan-400 border-4 border-white shadow-lg
                                  items-center justify-center text-lg flex-shrink-0 z-10">
                    {m.icon}
                  </div>

                  {/* Spacer */}
                  <div className="flex-1 hidden sm:block" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      

      {/* ════════════ CTA ════════════ */}
      <section className="bg-gradient-to-br from-blue-900 to-cyan-800 to-emerald-500 py-20 px-6
                          text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none select-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute text-white/10 text-8xl font-black"
              style={{ left: `${i * 18}%`, top: `${20 + (i % 2) * 40}%`, transform: "rotate(-15deg)" }}
            >💧</div>
          ))}
        </div>

        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="text-6xl mb-6">🌟</div>
          <h2
            className="text-4xl sm:text-5xl font-black text-white mb-4"
            style={{ fontFamily: "'Fredoka One', cursive" }}
          >
            Be Part of the Story!
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            Join thousands of kids around the world who are already making a
            difference  one lesson, one habit, one drop at a time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="px-10 py-4 bg-yellow-400 hover:bg-yellow-300 text-blue-900
                         font-black text-xl rounded-2xl shadow-2xl
                         hover:scale-105 transition-all duration-200"
              style={{ fontFamily: "'Fredoka One', cursive" }}
            >
              🚀 Join for Free!
            </Link>
            <Link
              to="/"
              className="px-10 py-4 bg-white/20 hover:bg-white/30 text-white
                         font-black text-xl rounded-2xl border-2 border-white/40
                         hover:scale-105 transition-all duration-200"
              style={{ fontFamily: "'Fredoka One', cursive" }}
            >
              🏠 Back to Home
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}