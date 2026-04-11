import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Sidebar({ activePage, onNavigate }) {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);

  const isLoggedIn =
    !!localStorage.getItem("aquachamp_token") ||
    !!sessionStorage.getItem("aquachamp_token");

  const navItems = [
    {
      section: "Overview",
      items: [{ id: "overview", label: "Dashboard", icon: "⚡" }],
    },
    {
      section: "Management",
      items: [
        { id: "badges", label: "Badges", icon: "🏅" },
        { id: "levels", label: "Levels", icon: "🏊" },
      ],
    },
    {
      section: "Students",
      items: [
        { id: "leaderboard", label: "Leaderboard", icon: "🏆", external: true },
        { id: "progress", label: "Student Progress", icon: "🎓" },
      ],
    },
  ];

  const handleNavigation = (item) => {
    if (item.external) {
      window.location.href = "/leaderboard";
    } else {
      onNavigate(item.id);
    }
  };

  const handleAuthAction = () => {
    if (isLoggedIn) {
      setShowConfirm(true);
    } else {
      navigate("/");
    }
  };

  const confirmLogout = () => {
    localStorage.removeItem("aquachamp_token");
    sessionStorage.removeItem("aquachamp_token");

    setShowConfirm(false);
    navigate("/");
  };

  return (
    <div
      className="w-64 flex-shrink-0 flex flex-col text-white"
      style={{
        background:
          "linear-gradient(170deg, #0b2540 0%, #0d3b6e 55%, #0b2540 100%)",
        borderRight: "1px solid rgba(24,95,165,0.3)",
        boxShadow: "4px 0 28px rgba(11,37,64,0.5)",
        fontFamily: "'Segoe UI', sans-serif",
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-5 py-6"
        style={{ borderBottom: "1px solid rgba(24,95,165,0.3)" }}
      >
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl bg-gradient-to-br from-sky-400 to-blue-700 shadow-lg">
          🌊
        </div>

        <div>
          <div className="text-base font-bold">AquaChamp</div>
          <div className="text-[10px] uppercase tracking-widest text-sky-300">
            Progress Admin
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-5 px-3 space-y-5">
        {navItems.map(({ section, items }) => (
          <div key={section}>
            <div className="px-3 pb-1 text-[10px] uppercase text-sky-300/50 font-bold tracking-widest">
              {section}
            </div>

            <div className="space-y-1">
              {items.map((item) => {
                const isActive = activePage === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 text-left relative ${
                      isActive
                        ? "bg-gradient-to-r from-blue-700 to-sky-500 text-white shadow-lg"
                        : "text-sky-300 hover:bg-sky-500/10 hover:text-sky-200"
                    }`}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-sky-300 rounded-r-full" />
                    )}

                    <span className="text-base">{item.icon}</span>

                    <span className="flex-1 text-sm font-semibold">
                      {item.label}
                    </span>

                    {item.external && !isActive && (
                      <span className="text-xs text-sky-400">↗</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 border-t border-sky-500/20">
        <div className="flex items-center gap-2.5 px-3 pt-4">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-blue-700 flex items-center justify-center font-bold shadow-md">
            A
          </div>

          <div>
            <div className="text-sm font-bold">Dushani</div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
              Progress Admin
            </span>
          </div>
        </div>

        {/* Logout/Login Button */}
        <button
          onClick={handleAuthAction}
          className="w-full mt-4 py-2 rounded-xl font-semibold text-white bg-sky-500 hover:bg-sky-600 shadow-[0_0_12px_rgba(14,165,233,0.4)] transition-all duration-200"
        >
          {isLoggedIn ? "Logout" : "Login"}
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-80 rounded-2xl bg-white p-6 text-center shadow-xl">
            <h2 className="text-lg font-bold text-gray-800">
              Confirm Logout
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Are you sure you want to logout?
            </p>

            <div className="mt-5 flex justify-center gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700"
              >
                Cancel
              </button>

              <button
                onClick={confirmLogout}
                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}