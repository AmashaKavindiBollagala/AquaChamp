import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800;900&display=swap');
      `}</style>

      <footer className="bg-gradient-to-br from-blue-900 to-cyan-800 to-emerald-800 text-white mt-20">
        {/* Wave */}
        <div className="overflow-hidden leading-none">
          <svg viewBox="0 0 1440 60" className="w-full block" fill="white">
            <path d="M0,30 C360,60 1080,0 1440,30 L1440,0 L0,0 Z" />
          </svg>
        </div>

        <div className="max-w-screen-xl mx-auto px-6 pt-8 pb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-300
                              flex items-center justify-center shadow-md">
                <span className="text-xl">💧</span>
              </div>
              <span
                className="text-xl font-black"
                style={{ fontFamily: "'Fredoka One', cursive" }}
              >
                AquaChamp
              </span>
            </div>
            <p
              className="text-blue-200 text-sm leading-relaxed"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              Empowering children to become Clean Water &amp; Sanitation heroes
              through fun, games, and learning! 🌊
            </p>
            <div className="flex gap-2 mt-4">
              {["🐦", "📘", "▶️", "📸"].map((icon, i) => (
                <button
                  key={i}
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20
                             flex items-center justify-center text-base
                             transition hover:scale-110"
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links — using real routes */}
          <div>
            <h3
              className="text-base font-black mb-4 text-cyan-300"
              style={{ fontFamily: "'Fredoka One', cursive" }}
            >
              Quick Links
            </h3>
            <ul className="space-y-2" style={{ fontFamily: "'Nunito', sans-serif" }}>
              {[
                { label: "Home",          path: "/student/dashboard" },
                { label: "About Us",      path: "/about"             },
                { label: "Lessons",       path: "/student/dashboard" },
                { label: "Hygiene Tips",  path: "/my-activities"     },
                { label: "Water Tracking",path: "/water"             },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    className="text-blue-200 hover:text-cyan-300 text-sm font-semibold
                               transition flex items-center gap-2"
                  >
                    <span className="text-cyan-400">›</span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* My Account — using real routes */}
          <div>
            <h3
              className="text-base font-black mb-4 text-cyan-300"
              style={{ fontFamily: "'Fredoka One', cursive" }}
            >
              My Account
            </h3>
            <ul className="space-y-2" style={{ fontFamily: "'Nunito', sans-serif" }}>
              {[
                { label: "Track Progress", path: "/my-progress"  },
                { label: "Leaderboard",    path: "/leaderboard"  },
                { label: "My Profile",     path: "/profile"      },
                { label: "Login",          path: "/login"        },
                { label: "Register",       path: "/register"     },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    className="text-blue-200 hover:text-cyan-300 text-sm font-semibold
                               transition flex items-center gap-2"
                  >
                    <span className="text-cyan-400">›</span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Mission */}
          <div>
            <h3
              className="text-base font-black mb-4 text-cyan-300"
              style={{ fontFamily: "'Fredoka One', cursive" }}
            >
              Our Mission
            </h3>
            <div className="bg-white/10 rounded-2xl p-4 mb-4 border border-white/10">
              <div className="text-3xl mb-2">🌍</div>
              <p
                className="text-sm font-bold text-white"
                style={{ fontFamily: "'Nunito', sans-serif" }}
              >
                Supporting SDG Goal 6
              </p>
              <p className="text-xs text-blue-200 mt-1">
                Clean Water &amp; Sanitation for All
              </p>
            </div>
            <p
              className="text-blue-200 text-xs"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              📧 hello@aquachamp.fun<br />
              🌐 www.aquachamp.fun
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="max-w-screen-xl mx-auto px-6 mt-8 pt-5 border-t border-white/10
                        flex flex-col sm:flex-row items-center justify-between gap-3 pb-6">
          <p
            className="text-blue-300 text-xs"
            style={{ fontFamily: "'Nunito', sans-serif" }}
          >
            © 2025 AquaChamp. Made with 💙 for children everywhere.
          </p>
          <div className="flex gap-4 text-xs text-blue-300">
            <Link to="/privacy" className="hover:text-cyan-300 transition">Privacy Policy</Link>
            <Link to="/terms"   className="hover:text-cyan-300 transition">Terms of Use</Link>
          </div>
        </div>
      </footer>
    </>
  );
}