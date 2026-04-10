import { useEffect, useState } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale, LinearScale, BarElement, ArcElement,
  Title, Tooltip, Legend, RadialLinearScale, PointElement, LineElement
);

const API = "http://localhost:4000";

function ChartCard({ title, subtitle, children, action, accent = "#6366f1", accentLight = "#ede9fe" }) {
  return (
    <div
      className="rounded-2xl overflow-hidden transition-all hover:-translate-y-1"
      style={{
        background: "#fff",
        border: "2px solid #e0e7ff",
        boxShadow: "0 4px 20px rgba(99,102,241,0.07)",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 12px 32px rgba(99,102,241,0.14)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 4px 20px rgba(99,102,241,0.07)"; }}
    >
      {/* Card Top Bar */}
      <div
        className="px-5 py-4 flex items-start justify-between"
        style={{ background: "linear-gradient(135deg, #f8faff, #f0f4ff)", borderBottom: "1.5px solid #e0e7ff" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 rounded-full" style={{ background: `linear-gradient(to bottom, ${accent}, ${accent}88)` }} />
          <div>
            <h3 className="text-sm font-bold text-slate-700">{title}</h3>
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export default function KaveeshaChartsPanel({ compact }) {
  const [topics, setTopics] = useState([]);
  const [subtopics, setSubtopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [topicSubtopics, setTopicSubtopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [topicsRes, subtopicsRes] = await Promise.all([
          axios.get(`${API}/api/topics`),
          axios.get(`${API}/api/subtopics`),
        ]);
        const topicList = topicsRes.data || [];
        const subtopicList = Array.isArray(subtopicsRes.data)
          ? subtopicsRes.data
          : subtopicsRes.data?.subtopics || [];
        setTopics(topicList);
        setSubtopics(subtopicList);
        if (topicList.length > 0) setSelectedTopic(topicList[0]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!selectedTopic) return;
    const subs = subtopics.filter(
      (s) => s.topicId === selectedTopic._id || s.topicId?._id === selectedTopic._id
    );
    setTopicSubtopics(subs);
  }, [selectedTopic, subtopics]);

  // Chart color palettes (light, vibrant)
  const CYAN = "rgba(6,182,212,0.75)";
  const CYAN_BORDER = "rgba(6,182,212,1)";
  const VIOLET = "rgba(139,92,246,0.75)";
  const VIOLET_BORDER = "rgba(139,92,246,1)";

  const TOPIC_PALETTE = [
    "rgba(99,102,241,0.72)", "rgba(6,182,212,0.72)", "rgba(16,185,129,0.72)",
    "rgba(245,158,11,0.72)", "rgba(236,72,153,0.72)", "rgba(239,68,68,0.72)",
  ];
  const TOPIC_BORDER = [
    "rgba(99,102,241,1)", "rgba(6,182,212,1)", "rgba(16,185,129,1)",
    "rgba(245,158,11,1)", "rgba(236,72,153,1)", "rgba(239,68,68,1)",
  ];

  const subtopicsPerTopicData = {
    labels: topics.map((t) => t.title),
    datasets: [
      {
        label: "Age 6–10",
        data: topics.map(
          (t) => subtopics.filter(
            (s) => (s.topicId === t._id || s.topicId?._id === t._id) && s.ageGroup === "6-10"
          ).length
        ),
        backgroundColor: CYAN,
        borderColor: CYAN_BORDER,
        borderWidth: 2,
        borderRadius: 8,
      },
      {
        label: "Age 11–15",
        data: topics.map(
          (t) => subtopics.filter(
            (s) => (s.topicId === t._id || s.topicId?._id === t._id) && s.ageGroup === "11-15"
          ).length
        ),
        backgroundColor: VIOLET,
        borderColor: VIOLET_BORDER,
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const ageDistData = {
    labels: ["Age 6–10", "Age 11–15"],
    datasets: [
      {
        data: [
          subtopics.filter((s) => s.ageGroup === "6-10").length,
          subtopics.filter((s) => s.ageGroup === "11-15").length,
        ],
        backgroundColor: [CYAN, VIOLET],
        borderColor: [CYAN_BORDER, VIOLET_BORDER],
        borderWidth: 3,
        hoverOffset: 12,
      },
    ],
  };

  const contentCompletenessData = {
    labels: topicSubtopics.map((s) => s.title),
    datasets: [
      {
        label: "Content Items",
        data: topicSubtopics.map((s) => {
          let count = 0;
          if (s.videoUrl) count++;
          if (s.content) count++;
          if (s.images?.length > 0) count++;
          return count;
        }),
        backgroundColor: topicSubtopics.map((s) => {
          let count = 0;
          if (s.videoUrl) count++;
          if (s.content) count++;
          if (s.images?.length > 0) count++;
          if (count === 3) return "rgba(34,197,94,0.75)";
          if (count === 2) return "rgba(234,179,8,0.75)";
          if (count === 1) return "rgba(249,115,22,0.75)";
          return "rgba(239,68,68,0.5)";
        }),
        borderColor: topicSubtopics.map((s) => {
          let count = 0;
          if (s.videoUrl) count++;
          if (s.content) count++;
          if (s.images?.length > 0) count++;
          if (count === 3) return "rgba(34,197,94,1)";
          if (count === 2) return "rgba(234,179,8,1)";
          if (count === 1) return "rgba(249,115,22,1)";
          return "rgba(239,68,68,1)";
        }),
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const topicPopularityData = {
    labels: topics.map((t) => t.title),
    datasets: [
      {
        label: "Total Subtopics",
        data: topics.map(
          (t) => subtopics.filter(
            (s) => s.topicId === t._id || s.topicId?._id === t._id
          ).length
        ),
        backgroundColor: topics.map((_, i) => TOPIC_PALETTE[i % TOPIC_PALETTE.length]),
        borderColor: topics.map((_, i) => TOPIC_BORDER[i % TOPIC_BORDER.length]),
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "#64748b",
          font: { size: 12, weight: "600" },
          padding: 16,
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        backgroundColor: "#fff",
        borderColor: "#e0e7ff",
        borderWidth: 2,
        titleColor: "#1e293b",
        bodyColor: "#64748b",
        padding: 12,
        cornerRadius: 10,
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
      },
    },
    scales: {
      x: {
        ticks: { color: "#94a3b8", font: { size: 12, weight: "500" } },
        grid: { color: "rgba(226,232,240,0.8)", drawBorder: false },
        border: { display: false },
      },
      y: {
        ticks: { color: "#94a3b8", font: { size: 12 }, stepSize: 1 },
        grid: { color: "rgba(226,232,240,0.8)", drawBorder: false },
        border: { display: false },
        beginAtZero: true,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "68%",
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#64748b",
          font: { size: 12, weight: "600" },
          padding: 20,
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        backgroundColor: "#fff",
        borderColor: "#e0e7ff",
        borderWidth: 2,
        titleColor: "#1e293b",
        bodyColor: "#64748b",
        padding: 12,
        cornerRadius: 10,
      },
    },
  };

  const summaryCards = [
    {
      label: "Topics",
      value: topics.length,
      icon: "📚",
      bg: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
      border: "#86efac",
      color: "#166534",
      iconBg: "linear-gradient(135deg, #22c55e, #16a34a)",
    },
    {
      label: "Total Subtopics",
      value: subtopics.length,
      icon: "📂",
      bg: "linear-gradient(135deg, #eff6ff, #dbeafe)",
      border: "#93c5fd",
      color: "#1e40af",
      iconBg: "linear-gradient(135deg, #3b82f6, #2563eb)",
    },
    {
      label: "Age 6–10",
      value: subtopics.filter((s) => s.ageGroup === "6-10").length,
      icon: "🧒",
      bg: "linear-gradient(135deg, #ecfeff, #cffafe)",
      border: "#67e8f9",
      color: "#164e63",
      iconBg: "linear-gradient(135deg, #06b6d4, #0891b2)",
    },
    {
      label: "Age 11–15",
      value: subtopics.filter((s) => s.ageGroup === "11-15").length,
      icon: "👦",
      bg: "linear-gradient(135deg, #faf5ff, #ede9fe)",
      border: "#c4b5fd",
      color: "#6b21a8",
      iconBg: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-64 rounded-2xl animate-pulse" style={{ background: "#f0f4ff", border: "2px solid #e0e7ff" }} />
        ))}
      </div>
    );
  }

  if (compact) {
    return (
      <div className="grid grid-cols-2 gap-5">
        <ChartCard title="Subtopics per Topic" subtitle="By age group" accent="#06b6d4">
          <div className="h-48">
            <Bar data={subtopicsPerTopicData} options={chartOptions} />
          </div>
        </ChartCard>
        <ChartCard title="Age Group Split" subtitle="Content distribution" accent="#8b5cf6">
          <div className="h-48">
            <Doughnut data={ageDistData} options={doughnutOptions} />
          </div>
        </ChartCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">📊 Analytics</h2>
        <p className="text-slate-500 text-sm mt-1">Lesson content overview and progress insights</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        {summaryCards.map((card, i) => (
          <div
            key={i}
            className="rounded-2xl p-4 flex items-center gap-4 transition-all hover:-translate-y-1 cursor-default"
            style={{
              background: card.bg,
              border: `2px solid ${card.border}`,
              boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.05)"; }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
              style={{ background: card.iconBg, boxShadow: `0 4px 12px ${card.border}` }}
            >
              {card.icon}
            </div>
            <div>
              <div className="text-3xl font-bold leading-none" style={{ color: card.color }}>
                {card.value}
              </div>
              <div className="text-xs font-bold mt-1 uppercase tracking-wide" style={{ color: card.color, opacity: 0.7 }}>
                {card.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-2 gap-6">
        <ChartCard title="Subtopics per Topic" subtitle="Grouped by age group" accent="#06b6d4">
          <div className="h-64">
            <Bar data={subtopicsPerTopicData} options={chartOptions} />
          </div>
        </ChartCard>

        <ChartCard title="Age Group Distribution" subtitle="Subtopic split by age" accent="#8b5cf6">
          <div className="h-64 flex items-center justify-center">
            <div className="w-full h-full relative">
              <Doughnut data={ageDistData} options={doughnutOptions} />
              {/* Center label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ paddingBottom: "40px" }}>
                <div className="text-2xl font-bold text-slate-700">{subtopics.length}</div>
                <div className="text-xs text-slate-400 font-semibold">Total</div>
              </div>
            </div>
          </div>
        </ChartCard>

        <ChartCard title="Topic Popularity" subtitle="By total subtopic count" accent="#f59e0b">
          <div className="h-64">
            <Bar data={topicPopularityData} options={{ ...chartOptions, indexAxis: "y" }} />
          </div>
        </ChartCard>

        <ChartCard
          title="Content Completeness"
          subtitle="Per subtopic in selected topic"
          accent="#22c55e"
          action={
            <select
              value={selectedTopic?._id || ""}
              onChange={(e) => setSelectedTopic(topics.find((t) => t._id === e.target.value))}
              className="text-xs rounded-xl px-3 py-2 font-semibold focus:outline-none transition-all"
              style={{ background: "#f0f4ff", border: "2px solid #e0e7ff", color: "#4338ca" }}
            >
              {topics.map((t) => (
                <option key={t._id} value={t._id}>{t.title}</option>
              ))}
            </select>
          }
        >
          {topicSubtopics.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3">
              <span className="text-4xl">📂</span>
              <p className="text-slate-400 text-sm font-medium">No subtopics for this topic</p>
            </div>
          ) : (
            <>
              <div className="h-52">
                <Bar data={contentCompletenessData} options={chartOptions} />
              </div>
              <div className="flex flex-wrap gap-3 mt-4">
                {[
                  { color: "rgba(34,197,94,0.75)", label: "Complete (3 items)" },
                  { color: "rgba(234,179,8,0.75)", label: "2 items" },
                  { color: "rgba(249,115,22,0.75)", label: "1 item" },
                  { color: "rgba(239,68,68,0.5)", label: "Empty" },
                ].map((leg, i) => (
                  <span key={i} className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                    <span className="w-3 h-3 rounded-sm inline-block" style={{ background: leg.color }} />
                    {leg.label}
                  </span>
                ))}
              </div>
            </>
          )}
        </ChartCard>
      </div>

      {/* Lock Status Overview */}
      <ChartCard title="🔐 Lock Status Overview" subtitle="Across all topics and subtopics" accent="#ec4899">
        <div className="grid grid-cols-3 gap-4 mt-1">
          {topics.map((topic, ti) => {
            const subs = subtopics.filter(
              (s) => s.topicId === topic._id || s.topicId?._id === topic._id
            );
            const locked = subs.filter((s) => s.isLocked).length;
            const unlocked = subs.length - locked;
            const pct = subs.length > 0 ? Math.round((unlocked / subs.length) * 100) : 0;
            const palette = [
              { bar: "linear-gradient(90deg, #06b6d4, #6366f1)", bg: "#eff6ff", border: "#bfdbfe" },
              { bar: "linear-gradient(90deg, #8b5cf6, #ec4899)", bg: "#faf5ff", border: "#ddd6fe" },
              { bar: "linear-gradient(90deg, #22c55e, #06b6d4)", bg: "#f0fdf4", border: "#bbf7d0" },
              { bar: "linear-gradient(90deg, #f59e0b, #ef4444)", bg: "#fffbeb", border: "#fde68a" },
              { bar: "linear-gradient(90deg, #ec4899, #8b5cf6)", bg: "#fdf2f8", border: "#fbcfe8" },
              { bar: "linear-gradient(90deg, #10b981, #3b82f6)", bg: "#ecfdf5", border: "#a7f3d0" },
            ][ti % 6];
            return (
              <div
                key={topic._id}
                className="rounded-xl p-4"
                style={{ background: palette.bg, border: `1.5px solid ${palette.border}` }}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-700 truncate flex-1">{topic.title}</span>
                  <span
                    className="ml-2 text-xs font-bold px-2 py-0.5 rounded-full shrink-0"
                    style={{ background: "#e0e7ff", color: "#4338ca" }}
                  >
                    {subs.length}
                  </span>
                </div>
                <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "#e2e8f0" }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: palette.bar }}
                  />
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-xs font-bold" style={{ color: "#166534" }}>🔓 {unlocked} open</span>
                  <span className="text-xs font-bold" style={{ color: "#92400e" }}>🔒 {locked} locked</span>
                </div>
                <div className="text-xs font-bold mt-1" style={{ color: "#6366f1" }}>{pct}% unlocked</div>
              </div>
            );
          })}
        </div>
      </ChartCard>
    </div>
  );
}