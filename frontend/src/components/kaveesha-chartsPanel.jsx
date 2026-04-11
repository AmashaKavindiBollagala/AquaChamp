import { useEffect, useState } from "react";
import axios from "axios";
import KaveeshaStatsBar from "./kaveesha-statsBar";
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
        border: `4px solid ${accent}`,
        boxShadow: `0 4px 20px ${accent}15`,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 12px 32px ${accent}30`; e.currentTarget.style.transform = "translateY(-4px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = `0 4px 20px ${accent}15`; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      {/* Card Top Bar */}
      <div
        className="px-5 py-4 flex items-start justify-between"
        style={{ background: `linear-gradient(135deg, ${accentLight}, ${accentLight}88)`, borderBottom: `3px solid ${accent}` }}
      >
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-8 rounded-full" style={{ background: `linear-gradient(to bottom, ${accent}, ${accent}66)` }} />
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
  const [students, setStudents] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [topicSubtopics, setTopicSubtopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get token for authenticated requests
        const token = localStorage.getItem("aquachamp_token") || localStorage.getItem("superAdminToken");
        const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

        const [topicsRes, subtopicsRes, usersRes] = await Promise.all([
          axios.get(`${API}/api/topics`),
          axios.get(`${API}/api/subtopics`),
          axios.get(`${API}/api/users/all`, { headers: authHeaders }),
        ]);
        const topicList = topicsRes.data || [];
        const subtopicList = Array.isArray(subtopicsRes.data)
          ? subtopicsRes.data
          : subtopicsRes.data?.subtopics || [];
        
        // Get all users (students) from the response
        const usersData = usersRes.data;
        const users = usersData?.users || (Array.isArray(usersData) ? usersData : []);
        
        // Filter only students (users with role "User" and active)
        const studentList = users.filter(user => 
          user.roles && 
          Array.isArray(user.roles) && 
          user.roles.includes("User") && 
          user.active !== false
        );

        setTopics(topicList);
        setSubtopics(subtopicList);
        setStudents(studentList);
        if (topicList.length > 0) setSelectedTopic(topicList[0]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    
    // Auto-refresh every 30 seconds to keep charts updated with database
    const interval = setInterval(fetchData, 30000);
    
    // Cleanup interval on unmount
    return () => clearInterval(interval);
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

  // Calculate student age groups from database
  const students610 = students.filter(s => s.age >= 5 && s.age <= 10).length;
  const students1115 = students.filter(s => s.age >= 11 && s.age <= 15).length;
  const totalStudents = students.length;

  const ageDistData = {
    labels: ["Age 5–10", "Age 11–15"],
    datasets: [
      {
        data: [students610, students1115],
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
        <ChartCard title="Subtopics per Topic" subtitle="By age group" accent="#06b6d4" accentLight="#cffafe">
          <div className="h-48">
            <Bar data={subtopicsPerTopicData} options={chartOptions} />
          </div>
        </ChartCard>
        <ChartCard title="Age Group Split" subtitle="Student distribution" accent="#8b5cf6" accentLight="#ede9fe">
          <div className="h-48 flex items-center justify-center">
            <div className="w-full h-full relative">
              <Doughnut data={ageDistData} options={doughnutOptions} />
              {/* Center label showing total students */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ paddingBottom: "40px" }}>
                <div className="text-2xl font-bold text-slate-700">{totalStudents}</div>
                <div className="text-xs text-slate-400 font-semibold">Total Students</div>
              </div>
            </div>
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

      {/* Stats Bar - Auto-updates every 30 seconds */}
      <KaveeshaStatsBar />

      {/* Main Charts */}
      <div className="grid grid-cols-2 gap-6">
        <ChartCard title="Subtopics per Topic" subtitle="Grouped by age group" accent="#06b6d4">
          <div className="h-64">
            <Bar data={subtopicsPerTopicData} options={chartOptions} />
          </div>
        </ChartCard>

        <ChartCard title="Age Group Distribution" subtitle="Student split by age" accent="#8b5cf6">
          <div className="h-64 flex items-center justify-center">
            <div className="w-full h-full relative">
              <Doughnut data={ageDistData} options={doughnutOptions} />
              {/* Center label showing total students */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ paddingBottom: "40px" }}>
                <div className="text-3xl font-bold text-slate-700">{totalStudents}</div>
                <div className="text-sm text-slate-400 font-semibold">Total Students</div>
              </div>
            </div>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}