import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const navLinks = [
  { label: "Home",          path: "/",                   icon: "🏠" },
  { label: "About Us",      path: "/about",              icon: "ℹ️"  },
  { label: "Lessons",       path: "/student/dashboard",  icon: "📚" },
  { label: "Hygiene",       path: "/my-activities",      icon: "🧼" },
  { label: "Water Tracking",path: "/water",              icon: "💧" },
  { label: "Track Progress",path: "/student/progress",   icon: "📈" },
  { label: "Leaderboard",   path: "/leaderboard",        icon: "🏆" },
  { label: "Profile",       path: "/profile",            icon: "👤" },
];

//  Logout Confirmation Modal 
function LogoutModal({ onConfirm, onCancel }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-red-400 to-rose-500 text-3xl shadow-lg mx-auto">
          🚪
        </div>
        <h3 className="text-xl font-extrabold text-slate-800">Leaving so soon?</h3>
        <p className="mt-2 text-sm text-slate-500 leading-6">
          Are you sure you want to log out of AquaChamp? Your progress is saved!
        </p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-2xl border-2 border-slate-200 py-2.5 text-sm font-extrabold text-slate-600 transition hover:bg-slate-50"
          >
            Stay 😊
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-2xl bg-gradient-to-r from-red-400 to-rose-500 py-2.5 text-sm font-extrabold text-white shadow-md transition hover:-translate-y-0.5"
          >
            Yes, Logout
          </button>
        </div>
      </div>
    </div>
  );
}

// Main Header 
export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const isLoggedIn =
    !!localStorage.getItem("aquachamp_token") ||
    !!sessionStorage.getItem("aquachamp_token");

  const confirmLogout = () => {
    localStorage.removeItem("aquachamp_token");
    sessionStorage.removeItem("aquachamp_token");
    setShowLogoutModal(false);
    setMenuOpen(false);
    navigate("/");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800;900&display=swap');
      `}</style>

      {showLogoutModal && (
        <LogoutModal
          onConfirm={confirmLogout}
          onCancel={() => setShowLogoutModal(false)}
        />
      )}

      <header
        className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-lg"
        style={{ borderBottom: "4px solid #38bdf8" }}
      >
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-[72px]">

            {/* ── Logo ── */}
            <Link to="/" className="flex items-center gap-3 group shrink-0">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br 
                              flex items-center justify-center shadow-md
                              group-hover:scale-110 transition-transform duration-300">
                <div className="header">
             <img src="/AquaChampLogo.png" alt="Logo" className="logo" />
            </div>
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
              {navLinks.map((link) => {
  const protectedRoutes = [
    "/my-activities",
    "/water",
    "/leaderboard",
    "/student/dashboard",
    "/student/progress",
    "/profile",
  ];

  const isProtected = protectedRoutes.includes(link.path);

  return (
    <Link
      key={link.label}
      to={isProtected && !isLoggedIn ? "/login" : link.path}
      onClick={(e) => {
        if (isProtected && !isLoggedIn) {
          e.preventDefault();
          navigate("/login");
        }
        setMenuOpen(false);
      }}
      className={`flex items-center gap-1 px-3 py-2 rounded-xl text-[12.5px] font-bold
        ${isActive(link.path)
          ? "bg-blue-500 text-white"
          : "text-blue-700 hover:bg-blue-50"}`}
    >
      <span>{link.icon}</span>
      {link.label}
    </Link>
  );
})}
            </nav>

            {/* ── Login / Logout Button ── */}
            <div className="hidden xl:flex items-center shrink-0">
              {isLoggedIn ? (
                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-red-400 to-rose-500
                             text-white font-black text-sm shadow-md
                             hover:shadow-red-300 hover:scale-105 transition-all duration-200"
                  style={{ fontFamily: "'Fredoka One', cursive" }}
                >
                  🚪 Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-400
                             text-white font-black text-sm shadow-md
                             hover:shadow-blue-300 hover:scale-105 transition-all duration-200"
                  style={{ fontFamily: "'Fredoka One', cursive" }}
                >
                  🚀 Login
                </Link>
              )}
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

            {isLoggedIn ? (
              <button
                onClick={() => setShowLogoutModal(true)}
                className="mt-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-red-400 to-rose-500
                           text-white font-black text-sm text-center shadow-md"
                style={{ fontFamily: "'Fredoka One', cursive" }}
              >
                🚪 Logout
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="mt-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-400
                           text-white font-black text-sm text-center shadow-md"
                style={{ fontFamily: "'Fredoka One', cursive" }}
              >
                🚀 Login
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Spacer — prevents content hiding under fixed header */}
      <div className="h-[72px]" />
    </>
  );
}