import { useState } from "react";
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
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedSubtopic, setSelectedSubtopic] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      window.location.href = "/logout";
    }
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

        {/* Logout Button */}
        <div className="px-3 pb-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200"
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.25)",
              color: "#fca5a5",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(239,68,68,0.22)";
              e.currentTarget.style.color = "#fecaca";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(239,68,68,0.1)";
              e.currentTarget.style.color = "#fca5a5";
            }}
          >
            <span className="text-lg shrink-0">🚪</span>
            {sidebarOpen && (
              <span className="text-sm font-semibold tracking-wide">Logout</span>
            )}
          </button>
        </div>

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
            {/* Admin Avatar */}
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
          </div>
        </header>

        {/* Stats Bar */}
        <KaveeshaStatsBar />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6" style={{ background: "#f1f5f9" }}>
          {activeTab === "overview" && (
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2">
                <KaveeshaChartsPanel compact />
              </div>
              <div
                className="rounded-2xl p-5 hover:shadow-xl transition-all"
                style={{
                  background: "#ffffff",
                  border: "1px solid #e0e7ff",
                  boxShadow: "0 4px 16px rgba(99,102,241,0.08)",
                }}
              >
                <h3
                  className="text-xs font-bold uppercase tracking-widest mb-4"
                  style={{ color: "#6366f1" }}
                >
                  Quick Topic View
                </h3>
                <KaveeshaTopicsManager
                  compact
                  onSelectTopic={(t) => {
                    setSelectedTopic(t);
                    setActiveTab("subtopics");
                  }}
                />
              </div>
              <div
                className="rounded-2xl p-5 hover:shadow-xl transition-all"
                style={{
                  background: "#ffffff",
                  border: "1px solid #e0e7ff",
                  boxShadow: "0 4px 16px rgba(99,102,241,0.08)",
                }}
              >
                <h3
                  className="text-xs font-bold uppercase tracking-widest mb-4"
                  style={{ color: "#6366f1" }}
                >
                  Recent Activity
                </h3>
                <RecentActivity />
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
    </div>
  );
}

function RecentActivity() {
  const items = [
    { icon: "📚", text: "Topic 'Freestyle' created", time: "2m ago", bg: "#f0fdf4", border: "#86efac", color: "#166534" },
    { icon: "📂", text: "Subtopic added to 'Breaststroke'", time: "15m ago", bg: "#eff6ff", border: "#93c5fd", color: "#1e40af" },
    { icon: "🎬", text: "Video updated in 'Backstroke Intro'", time: "1h ago", bg: "#faf5ff", border: "#c4b5fd", color: "#6b21a8" },
    { icon: "❓", text: "Quiz added to 'Water Safety'", time: "3h ago", bg: "#fffbeb", border: "#fcd34d", color: "#92400e" },
    { icon: "🖼️", text: "Images uploaded to 'Breathing'", time: "5h ago", bg: "#ecfdf5", border: "#6ee7b7", color: "#065f46" },
  ];
  return (
    <div className="space-y-2.5">
      {items.map((item, i) => (
        <div
          key={i}
          className="flex items-center gap-3 text-sm p-3 rounded-xl transition-all cursor-pointer"
          style={{
            background: item.bg,
            border: `1px solid ${item.border}`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateX(4px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateX(0)";
          }}
        >
          <span className="text-base shrink-0">{item.icon}</span>
          <span className="flex-1 font-semibold" style={{ color: item.color }}>
            {item.text}
          </span>
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full shrink-0"
            style={{ background: "rgba(0,0,0,0.06)", color: item.color }}
          >
            {item.time}
          </span>
        </div>
      ))}
    </div>
  );
}