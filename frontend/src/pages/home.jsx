import { Link } from "react-router-dom";

/*  Floating bubbles config  */
const bubbles = [
  { size: 80,  left: "5%",  top: "12%", delay: "0s",   dur: "6s"  },
  { size: 50,  left: "15%", top: "70%", delay: "1s",   dur: "8s"  },
  { size: 120, left: "80%", top: "15%", delay: "2s",   dur: "7s"  },
  { size: 40,  left: "70%", top: "65%", delay: "0.5s", dur: "5s"  },
  { size: 60,  left: "50%", top: "80%", delay: "1.5s", dur: "9s"  },
  { size: 30,  left: "90%", top: "45%", delay: "3s",   dur: "6s"  },
  { size: 90,  left: "25%", top: "30%", delay: "2.5s", dur: "10s" },
];

/* Feature cards  */
const features = [
  {
    emoji: "📚", title: "Fun Lessons",
    desc: "Learn about clean water and hygiene through colourful, interactive stories.",
    color: "from-blue-400 to-blue-600", bg: "bg-blue-50",
    link: "/student/dashboard",
  },
  {
    emoji: "🎯", title: "Cool Quizzes",
    desc: "Test your knowledge and earn stars with exciting sanitation quizzes!",
    color: "from-cyan-400 to-teal-500", bg: "bg-cyan-50",
    link: "/student/dashboard",
  },
  {
    emoji: "🏆", title: "Win Badges",
    desc: "Collect awesome badges and climb the leaderboard as a Water Hero!",
    color: "from-sky-400 to-blue-500", bg: "bg-sky-50",
    link: "/leaderboard",
  },
  {
    emoji: "🚿", title: "Hygiene Tracker",
    desc: "Log your daily hygiene habits and build super-powered streaks.",
    color: "from-teal-400 to-cyan-600", bg: "bg-teal-50",
    link: "/my-activities",
  },
  {
    emoji: "💧", title: "Water Tracker",
    desc: "Track how much water you drink every day and stay hydrated!",
    color: "from-blue-500 to-indigo-500", bg: "bg-indigo-50",
    link: "/water",
  },
  {
    emoji: "📈", title: "Progress Map",
    desc: "Watch your learning journey grow with colourful progress charts.",
    color: "from-cyan-500 to-blue-600", bg: "bg-cyan-50",
    link: "/my-progress",
  },
];

/*  How it works steps  */
const steps = [
  { num: "1", icon: "📖", title: "Learn a Lesson",  desc: "Pick a fun lesson about clean water or hygiene." },
  { num: "2", icon: "✏️", title: "Take the Quiz",   desc: "Answer questions and see how much you know!" },
  { num: "3", icon: "⭐", title: "Earn Rewards",    desc: "Get badges, points, and unlock cool avatars." },
  { num: "4", icon: "🌍", title: "Be a Hero!",       desc: "Practice good habits and share with friends." },
];

/*  Stats  */
const stats = [
  { num: "5,000+", label: "Kids Learning",  icon: "👦" },
  { num: "120+",   label: "Fun Lessons",    icon: "📚" },
  { num: "50+",    label: "Badges to Win",  icon: "🥇" },
  { num: "98%",    label: "Kids Love It",   icon: "❤️" },
];

/*  Testimonials */
const testimonials = [
  { name: "Aisha, Age 9",  quote: "I learned to wash hands properly and got a Gold Badge! So cool! 🌟", avatar: "🧒" },
  { name: "Ravi, Age 11",  quote: "AquaChamp is the best app ever! I'm number 1 on the leaderboard! 🏆", avatar: "👦" },
  { name: "Lily, Age 8",   quote: "I love the water drops and the quizzes are super fun! 💧", avatar: "👧" },
];

/*  Gallery images  */
const gallery = [
  {
    src: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&h=600&fit=crop",
    label: "🌊 Water Heroes", span: "col-span-2 row-span-2", h: "h-72 lg:h-auto",
  },
  {
    src: "./hygine.jpeg",
    label: "🧼 Hygiene", span: "", h: "h-50",
  },
  {
    src: "./games.jpeg",
    label: "🎮 Games", span: "", h: "h-50",
  },
  {
    src: "https://images.unsplash.com/photo-1524503033411-c9566986fc8f?w=300&h=200&fit=crop",
    label: "📖 Learning", span: "", h: "h-50",
  },
  {
    src: "./happychild.jpg",
    label: "😊 Happy Kids", span: "", h: "h-50",
  },
];

/*
   HOME PAGE
 */
export default function HomePage() {
  return (
    <div className="min-h-screen overflow-x-hidden " style={{ fontFamily: "'Nunito', sans-serif" }}>

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
      `}</style>

      {/*  HERO  */}
      <section className="relative min-h-[92vh] flex items-center justify-center
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

        <div className="relative z-10 max-w-6xl mx-auto px-6
                        flex flex-col lg:flex-row items-center gap-12 pt-6">

          {/* Text */}
          <div className="flex-1 text-center lg:text-left animate-pop">
            <div className="inline-flex items-center gap-2 bg-white/20 border border-white/30
                            rounded-full px-4 py-2 text-white text-xs font-bold mb-6 tracking-wide">
              🌍 Supporting SDG Goal 6  Clean Water for All
            </div>

            <h1
              className="text-5xl sm:text-6xl lg:text-7xl font-black text-white
                         leading-tight mb-6 drop-shadow-lg"
              style={{ fontFamily: "'Fredoka One', cursive" }}
            >
              Become a<br />
              <span className="text-yellow-300">AquaChamp!</span> 💧
            </h1>

            <p className="text-blue-100 text-lg sm:text-xl leading-relaxed mb-8
                          max-w-lg mx-auto lg:mx-0">
              Learn about clean water &amp; sanitation through super fun games,
              quizzes, and badges designed just for kids like you!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                to="/register"
                className="px-8 py-4 bg-yellow-400 hover:bg-yellow-300 text-blue-900
                           font-black text-lg rounded-2xl shadow-xl
                           hover:shadow-yellow-300/50 hover:scale-105 transition-all duration-200"
                style={{ fontFamily: "'Fredoka One', cursive" }}
              >
                🚀 Start Adventure!
              </Link>
              <Link
                to="/student/dashboard"
                className="px-8 py-4 bg-white/20 hover:bg-white/30 text-white
                           font-black text-lg rounded-2xl border-2 border-white/50
                           hover:scale-105 transition-all duration-200"
                style={{ fontFamily: "'Fredoka One', cursive" }}
              >
                📚 Explore Lessons
              </Link>
            </div>
          </div>

          {/* Hero image ring */}
          <div className="flex-1 flex justify-center">
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96">
              <div className="w-full h-full rounded-full bg-white/20 border-4 border-white/40
                              flex items-center justify-center shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=400&fit=crop&crop=face"
                  alt="Happy child learning"
                  className="w-52 h-52 sm:w-64 sm:h-64 lg:w-80 lg:h-80 rounded-full object-cover
                             border-4 border-white shadow-xl"
                />
              </div>
              {/* Floating badges */}
              <div className="absolute -top-4 -right-4 w-14 h-14 bg-yellow-400 rounded-2xl
                              flex items-center justify-center text-2xl shadow-lg animate-bounce">🏆</div>
              <div className="absolute -bottom-4 -left-4 w-14 h-14 bg-cyan-400 rounded-2xl
                              flex items-center justify-center text-2xl shadow-lg animate-bounce"
                   style={{ animationDelay: "0.5s" }}>⭐</div>
              <div className="absolute top-1/2 -right-8 w-12 h-12 bg-blue-300 rounded-2xl
                              flex items-center justify-center text-xl shadow-lg animate-bounce"
                   style={{ animationDelay: "1s" }}>💧</div>
            </div>
          </div>
        </div>
      </section>

      {/*  STATS  */}
      <section className="bg-white py-14">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((s, i) => (
            <div
              key={i}
              className="text-center bg-gradient-to-br from-blue-50 to-cyan-50
                         rounded-3xl p-6 shadow-sm border border-blue-100
                         hover:shadow-md hover:-translate-y-1 transition-all duration-200"
            >
              <div className="text-4xl mb-2">{s.icon}</div>
              <div
                className="text-3xl font-black text-blue-700"
                style={{ fontFamily: "'Fredoka One', cursive" }}
              >{s.num}</div>
              <div className="text-xs font-bold text-blue-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/*  FEATURES  */}
      <section className="bg-gradient-to-b from-white to-blue-50 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block bg-blue-100 text-blue-600 font-black text-xs
                             px-4 py-2 rounded-full mb-4 tracking-widest uppercase">
              What Can You Do?
            </span>
            <h2
              className="text-4xl sm:text-5xl font-black text-blue-800"
              style={{ fontFamily: "'Fredoka One', cursive" }}
            >
              Everything to Learn &amp; Play! 🎮
            </h2>
            <p className="text-blue-400 mt-4 max-w-xl mx-auto">
              AquaChamp is packed with activities that make learning about water
              and hygiene super exciting!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <Link
                key={i}
                to={f.link}
                className={`group ${f.bg} rounded-3xl p-7 border border-blue-100
                            hover:shadow-xl hover:-translate-y-2 transition-all duration-300
                            flex flex-col gap-4`}
              >
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color}
                               flex items-center justify-center text-3xl shadow-lg
                               group-hover:scale-110 transition-transform duration-300`}
                >
                  {f.emoji}
                </div>
                <div>
                  <h3
                    className="text-xl font-black text-blue-800 mb-1"
                    style={{ fontFamily: "'Fredoka One', cursive" }}
                  >{f.title}</h3>
                  <p className="text-blue-500 text-sm leading-relaxed">{f.desc}</p>
                </div>
                <div className="mt-auto flex items-center gap-1 text-blue-600 font-bold text-sm
                                group-hover:gap-2 transition-all">
                  Explore <span>→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/*  HOW IT WORKS  */}
      <section className="bg-gradient-to-br from-blue-900 to-cyan-800 to-emerald-500 py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <svg viewBox="0 0 800 400" className="w-full h-full">
            <circle cx="100" cy="100" r="120" fill="white" />
            <circle cx="700" cy="300" r="150" fill="white" />
          </svg>
        </div>

        <div className="relative max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2
              className="text-4xl sm:text-5xl font-black text-white"
              style={{ fontFamily: "'Fredoka One', cursive" }}
            >How It Works 🛤️</h2>
            <p className="text-blue-100 mt-3 text-lg">
              Your journey to becoming an AquaChamp in 4 easy steps!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div
                key={i}
                className="relative bg-white/15 border border-white/30 rounded-3xl p-6 text-center
                           hover:bg-white/25 transition-all duration-200 hover:-translate-y-1"
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full
                                bg-yellow-400 text-blue-900 font-black text-sm
                                flex items-center justify-center shadow-md">
                  {s.num}
                </div>
                <div className="text-4xl mt-4 mb-3">{s.icon}</div>
                <h3
                  className="text-lg font-black text-white mb-2"
                  style={{ fontFamily: "'Fredoka One', cursive" }}
                >{s.title}</h3>
                <p className="text-blue-100 text-sm">{s.desc}</p>
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 z-10 text-white/60 text-2xl">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/*GALLERY  */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2
              className="text-4xl sm:text-5xl font-black text-blue-800"
              style={{ fontFamily: "'Fredoka One', cursive" }}
            >Kids Love AquaChamp! 📸</h2>
            <p className="text-blue-400 mt-3">
              See children around the world on their clean water journey
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {gallery.map((g, i) => (
              <div
                key={i}
                className={`${g.span} ${g.h} rounded-3xl overflow-hidden shadow-xl relative group`}
              >
                <img
                  src={g.src}
                  alt={g.label}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 to-transparent
                                flex items-end p-4">
                  <span
                    className="text-white font-black text-sm"
                    style={{ fontFamily: "'Fredoka One', cursive" }}
                  >{g.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/*  TESTIMONIALS  */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2
              className="text-4xl sm:text-5xl font-black text-blue-800"
              style={{ fontFamily: "'Fredoka One', cursive" }}
            >What Kids Say 💬</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl p-6 shadow-md border border-blue-100
                           hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-400
                                  flex items-center justify-center text-2xl shadow">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-black text-blue-800 text-sm">{t.name}</div>
                    <div className="text-yellow-400 text-xs">★★★★★</div>
                  </div>
                </div>
                <p className="text-blue-500 text-sm leading-relaxed italic">"{t.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/*  CTA  */}
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
          <div className="text-6xl mb-6">🚀</div>
          <h2
            className="text-4xl sm:text-5xl font-black text-white mb-4"
            style={{ fontFamily: "'Fredoka One', cursive" }}
          >
            Ready to Be an AquaChamp?
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            Join thousands of kids learning about clean water and becoming
            real-life hygiene heroes!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="px-10 py-4 bg-yellow-400 hover:bg-yellow-300 text-blue-900
                         font-black text-xl rounded-2xl shadow-2xl
                         hover:scale-105 transition-all duration-200"
              style={{ fontFamily: "'Fredoka One', cursive" }}
            >
              🌟 Join for Free!
            </Link>
            <Link
              to="/student/dashboard"
              className="px-10 py-4 bg-white/20 hover:bg-white/30 text-white
                         font-black text-xl rounded-2xl border-2 border-white/40
                         hover:scale-105 transition-all duration-200"
              style={{ fontFamily: "'Fredoka One', cursive" }}
            >
              📚 See Lessons
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}