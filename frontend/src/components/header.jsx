import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const navLinks = [
  { label: "Home",          path: "/", icon: "🏠" },
  { label: "About Us",      path: "/about",              icon: "ℹ️"  },
  { label: "Lessons",       path: "/student/dashboard",  icon: "📚" },
  { label: "Hygiene",       path: "/my-activities",      icon: "🧼" },
  { label: "Water Tracking",path: "/water",              icon: "💧" },
  { label: "Track Progress",path: "/student/progress",        icon: "📈" },
  { label: "Leaderboard",   path: "/leaderboard",        icon: "🏆" },
  { label: "Profile",       path: "/profile",            icon: "👤" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800;900&display=swap');
      `}</style>

      <header
        className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-lg"
        style={{ borderBottom: "4px solid #38bdf8" }}
      >
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-[72px]">

            {/* ── Logo ── */}
            <Link to="/student/dashboard" className="flex items-center gap-3 group shrink-0">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400
                              flex items-center justify-center shadow-md
                              group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">💧</span>
              </div>
              <div className="leading-tight">
                <span
                  className="block text-[1.35rem] font-black text-blue-700 tracking-tight"
                  style={{ fontFamily: "'Fredoka One', cursive" }}
                >
                  AquaChamp
                </span>
                <span className="block text-[10px] font-bold text-cyan-500 tracking-widest uppercase">
                  Clean Water Heroes
                </span>
              </div>
            </Link>

            {/* ── Desktop Nav ── */}
            <nav className="hidden xl:flex items-center gap-0.5">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.path}
                  className={`flex items-center gap-1 px-3 py-2 rounded-xl text-[12.5px] font-bold
                              transition-all duration-200 whitespace-nowrap
                              ${isActive(link.path)
                                ? "bg-blue-500 text-white shadow-md"
                                : "text-blue-700 hover:bg-blue-50 hover:text-blue-500"
                              }`}
                  style={{ fontFamily: "'Nunito', sans-serif" }}
                >
                  <span className="text-sm">{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* ── Login Button ── */}
            <div className="hidden xl:flex items-center shrink-0">
              <Link
                to="/login"
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-400
                           text-white font-black text-sm shadow-md
                           hover:shadow-blue-300 hover:scale-105 transition-all duration-200"
                style={{ fontFamily: "'Fredoka One', cursive" }}
              >
                🚀 Login
              </Link>
            </div>

            {/* ── Hamburger ── */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="xl:hidden flex flex-col gap-[5px] p-2 rounded-xl hover:bg-blue-50 transition"
              aria-label="Toggle menu"
            >
              <span className={`block w-6 h-0.5 bg-blue-600 rounded-full transition-all duration-300
                              ${menuOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
              <span className={`block w-6 h-0.5 bg-blue-600 rounded-full transition-all duration-300
                              ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`block w-6 h-0.5 bg-blue-600 rounded-full transition-all duration-300
                              ${menuOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
            </button>
          </div>
        </div>

        {/* ── Mobile Menu ── */}
        <div
          className={`xl:hidden overflow-hidden transition-all duration-300 bg-white border-t border-blue-100
                      ${menuOpen ? "max-h-[600px] pb-4" : "max-h-0"}`}
        >
          <nav className="flex flex-col px-4 pt-2 gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.path}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold
                            transition-all duration-200
                            ${isActive(link.path)
                              ? "bg-blue-500 text-white"
                              : "text-blue-700 hover:bg-blue-50"
                            }`}
                style={{ fontFamily: "'Nunito', sans-serif" }}
              >
                <span>{link.icon}</span>
                {link.label}
              </Link>
            ))}
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="mt-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-400
                         text-white font-black text-sm text-center shadow-md"
              style={{ fontFamily: "'Fredoka One', cursive" }}
            >
              🚀 Login
            </Link>
          </nav>
        </div>
      </header>

      {/* Spacer — prevents content hiding under fixed header */}
      <div className="h-[72px]" />
    </>
  );
}