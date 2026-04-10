import { useNavigate, useLocation } from "react-router-dom";

export default function KaveeshaStudentNav({ user, ageGroup }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isYoung = ageGroup === "6-10";

  const handleLogout = () => {
    localStorage.removeItem("aquachamp_token");
    sessionStorage.removeItem("aquachamp_token");
    navigate("/login");
  };

  const navItems = [
    { path: "/student/dashboard", icon: "🏠", label: "Home" },
    { path: "/student/progress", icon: "📊", label: "My Progress" },
    { path: "/profile", icon: "👤", label: "Profile" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@700;800&family=Nunito:wght@600;700;800&display=swap');
        .nav-font { font-family: 'Baloo 2', cursive; }
        .body-font { font-family: 'Nunito', sans-serif; }
      `}</style>

      <nav
        className="sticky top-0 z-50 shadow-lg"
        style={{
          background: isYoung
            ? "linear-gradient(135deg, #FF6B6B, #FF8E53)"
            : "linear-gradient(135deg, #6C63FF, #3B82F6)",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate("/student/dashboard")}
          >
            <div className="w-10 h-10 bg-white/30 rounded-2xl flex items-center justify-center text-2xl shadow-md backdrop-blur-sm">
              🌊
            </div>
            <div>
              <div className="nav-font text-xl font-extrabold text-white leading-none">
                AquaChamp
              </div>
              <div className="text-white/80 text-[10px] font-bold uppercase tracking-widest">
                {isYoung ? "Young Explorer 🐠" : "Advanced Swimmer 🏊"}
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-extrabold text-sm transition-all body-font ${
                  location.pathname === item.path
                    ? "bg-white text-gray-700 shadow-md"
                    : "text-white/90 hover:bg-white/20"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>

          {/* User + Logout */}
          <div className="flex items-center gap-3">
            {user && (
              <div className="hidden md:flex items-center gap-2 bg-white/20 rounded-2xl px-4 py-2 backdrop-blur-sm">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-lg font-extrabold text-gray-600">
                  {user.firstName?.[0]}
                </div>
                <div>
                  <div className="text-white font-extrabold text-sm leading-none body-font">
                    {user.firstName}
                  </div>
                  <div className="text-white/70 text-[10px] font-bold">
                    Age {user.age}
                  </div>
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-2xl font-extrabold text-sm transition-all body-font backdrop-blur-sm"
            >
              👋 Logout
            </button>
          </div>
        </div>

        {/* Mobile bottom nav */}
        <div className="md:hidden flex justify-around py-2 border-t border-white/20">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl transition-all body-font ${
                location.pathname === item.path
                  ? "bg-white/30"
                  : "text-white/80"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-[10px] font-extrabold text-white">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}