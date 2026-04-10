import { useState } from "react";
import { useNavigate } from "react-router-dom";
import KaveeshaTopicsManager from "./kaveesha-topicsManager";
import KaveeshaSubtopicsManager from "./kaveesha-subtopicsManager";
import KaveeshaContentManager from "./kaveesha-contentManager";
import KaveeshaChartsPanel from "./kaveesha-chartsPanel";
import KaveeshaStatsBar from "./kaveesha-statsBar";

const NAV = [
  { id: "overview", label: "Overview", icon: "⚡" },
  { id: "topics", label: "Topics", icon: "📚" },
  { id: "subtopics", label: "Subtopics", icon: "📂" },
  { id: "content", label: "Content", icon: "🎯" },
  { id: "charts", label: "Analytics", icon: "📊" },
];

export default function KaveeshaLessonsDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedSubtopic, setSelectedSubtopic] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleLogoutConfirm = () => {
    // Clear tokens
    localStorage.removeItem("aquachamp_token");
    sessionStorage.removeItem("aquachamp_token");
    // Redirect to admin login
    navigate("/admin-login");
  };

  const handleLogoutCancel = () => {
    setShowLogoutDialog(false);
  };

  return (
    <div className="flex h-screen bg-slate-100 text-slate-800 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } transition-all duration-300 flex flex-col relative z-10`}
        style={{
          background: "linear-gradient(160deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
          borderRight: "1px solid rgba(99,102,241,0.2)",
          boxShadow: "4px 0 24px rgba(0,0,0,0.4)",
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-3 px-5 py-6"
          style={{ borderBottom: "1px solid rgba(99,102,241,0.25)" }}
        >
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0"
            style={{
              background: "linear-gradient(135deg, #06b6d4, #6366f1)",
              boxShadow: "0 0 20px rgba(99,102,241,0.6)",
            }}
          >
            🌊
          </div>
          {sidebarOpen && (
            <div>
              <div className="text-base font-bold tracking-wide text-white leading-tight">
                AquaChamp
              </div>
              <div
                className="text-[10px] tracking-widest uppercase font-semibold"
                style={{ color: "#a5b4fc" }}
              >
                Lessons Admin
              </div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-5 px-3 space-y-1.5">
          {NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative`}
              style={
                activeTab === item.id
                  ? {
                      background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                      color: "#ffffff",
                      boxShadow: "0 4px 20px rgba(99,102,241,0.55)",
                      border: "1px solid rgba(167,139,250,0.4)",
                    }
                  : {
                      color: "#a5b4fc",
                      border: "1px solid transparent",
                    }
              }
              onMouseEnter={(e) => {
                if (activeTab !== item.id) {
                  e.currentTarget.style.background = "rgba(99,102,241,0.15)";
                  e.currentTarget.style.color = "#e0e7ff";
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== item.id) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#a5b4fc";
                }
              }}
            >
              <span className="text-lg shrink-0">{item.icon}</span>
              {sidebarOpen && (
                <span className="text-sm font-semibold tracking-wide">
                  {item.label}
                </span>
              )}
              {activeTab === item.id && sidebarOpen && (
                <div
                  className="ml-auto w-2 h-2 rounded-full"
                  style={{ background: "#c7d2fe", boxShadow: "0 0 6px #c7d2fe" }}
                />
              )}
              {activeTab === item.id && (
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full"
                  style={{ height: "60%", background: "#a5b4fc" }}
                />
              )}
            </button>
          ))}
        </nav>

        {/* Collapse btn */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="m-3 p-2 rounded-xl text-sm font-bold transition-all"
          style={{
            background: "rgba(99,102,241,0.15)",
            border: "1px solid rgba(99,102,241,0.3)",
            color: "#a5b4fc",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(99,102,241,0.28)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(99,102,241,0.15)";
          }}
        >
          {sidebarOpen ? "◀" : "▶"}
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header
          className="flex items-center justify-between px-8 py-4"
          style={{
            background: "linear-gradient(90deg, #ffffff 0%, #f0f4ff 100%)",
            borderBottom: "1px solid #e0e7ff",
            boxShadow: "0 2px 12px rgba(99,102,241,0.08)",
          }}
        >
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              {NAV.find((n) => n.id === activeTab)?.icon}{" "}
              {NAV.find((n) => n.id === activeTab)?.label}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 font-medium tracking-wide">
              AquaChamp · Lessons Management System
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <button
              className="w-9 h-9 rounded-xl flex items-center justify-center text-base transition-all"
              style={{
                background: "#f0f4ff",
                border: "1px solid #c7d2fe",
                color: "#6366f1",
              }}
            >
              🔔
            </button>
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white"
                style={{
                  background: "linear-gradient(135deg, #06b6d4, #6366f1)",
                  boxShadow: "0 0 12px rgba(99,102,241,0.4)",
                }}
              >
                A
              </div>
              <div>
                <div className="text-sm font-bold text-slate-700 leading-tight">Admin</div>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{
                    background: "#ede9fe",
                    color: "#7c3aed",
                    border: "1px solid #c4b5fd",
                  }}
                >
                  LESSONS_ADMIN
                </span>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogoutClick}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(135deg, #ef4444, #dc2626)",
                color: "#ffffff",
                boxShadow: "0 4px 12px rgba(239,68,68,0.3)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 6px 16px rgba(239,68,68,0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(239,68,68,0.3)";
              }}
            >
              <span>🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6" style={{ background: "#f1f5f9" }}>
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Stats Bar */}
              <KaveeshaStatsBar />

              {/* Charts */}
              <div>
                <KaveeshaChartsPanel compact />
              </div>

              {/* Quick Topic View — full card grid */}
              <div
                className="rounded-2xl p-6 hover:shadow-xl transition-all"
                style={{
                  background: "#ffffff",
                  border: "1px solid #e0e7ff",
                  boxShadow: "0 4px 16px rgba(99,102,241,0.08)",
                }}
              >
                {/* Section header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3
                      className="text-xs font-bold uppercase tracking-widest"
                      style={{ color: "#6366f1" }}
                    >
                      Quick Topic View
                    </h3>
                    <p className="text-slate-400 text-xs mt-0.5 font-medium">
                      All available topics — click any card to manage subtopics
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("topics")}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5"
                    style={{
                      background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                      color: "#ffffff",
                      boxShadow: "0 4px 12px rgba(99,102,241,0.35)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = "0 6px 18px rgba(99,102,241,0.5)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(99,102,241,0.35)";
                    }}
                  >
                    <span>⚙️</span>
                    <span>Manage Topics</span>
                  </button>
                </div>

                {/* Full KaveeshaTopicsManager — not compact, shows all topics as cards */}
                <KaveeshaTopicsManager
                  onSelectTopic={(t) => {
                    setSelectedTopic(t);
                    setActiveTab("subtopics");
                  }}
                />
              </div>
            </div>
          )}

          {activeTab === "topics" && (
            <KaveeshaTopicsManager
              onSelectTopic={(t) => {
                setSelectedTopic(t);
                setActiveTab("subtopics");
              }}
            />
          )}

          {activeTab === "subtopics" && (
            <KaveeshaSubtopicsManager
              selectedTopic={selectedTopic}
              onSelectSubtopic={(s) => {
                setSelectedSubtopic(s);
                setActiveTab("content");
              }}
              onChangeTopic={() => setActiveTab("topics")}
            />
          )}

          {activeTab === "content" && (
            <KaveeshaContentManager
              selectedSubtopic={selectedSubtopic}
              onBack={() => setActiveTab("subtopics")}
            />
          )}

          {activeTab === "charts" && <KaveeshaChartsPanel />}
        </main>
      </div>

      {/* Custom Logout Confirmation Dialog */}
      {showLogoutDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0, 0, 0, 0.6)", backdropFilter: "blur(4px)" }}
          onClick={handleLogoutCancel}
        >
          <div
            className="rounded-3xl p-8 max-w-md mx-4 shadow-2xl"
            style={{
              background: "#ffffff",
              border: "2px solid #e0e7ff",
              animation: "pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-5xl"
                style={{
                  background: "linear-gradient(135deg, #fef3c7, #fde68a)",
                  border: "3px solid #f59e0b",
                  boxShadow: "0 8px 24px rgba(245, 158, 11, 0.3)",
                }}
              >
                👋
              </div>
            </div>

            {/* Message */}
            <h3 className="text-2xl font-bold text-center text-slate-800 mb-2">
              Logout Confirmation
            </h3>
            <p className="text-slate-600 text-center font-medium mb-6">
              Are you sure you want to logout? You will need to login again to access the admin dashboard.
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleLogoutCancel}
                className="flex-1 px-6 py-3 rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5"
                style={{
                  background: "#f1f5f9",
                  border: "2px solid #e2e8f0",
                  color: "#475569",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#e2e8f0";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#f1f5f9";
                }}
              >
                ❌ No, Cancel
              </button>
              <button
                onClick={handleLogoutConfirm}
                className="flex-1 px-6 py-3 rounded-xl font-bold text-sm text-white transition-all hover:-translate-y-0.5"
                style={{
                  background: "linear-gradient(135deg, #ef4444, #dc2626)",
                  boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 6px 16px rgba(239, 68, 68, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(239, 68, 68, 0.3)";
                }}
              >
                ✅ Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pop {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}