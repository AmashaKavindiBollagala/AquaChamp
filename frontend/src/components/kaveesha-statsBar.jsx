import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:4000";

export default function KaveeshaStatsBar() {
  const [stats, setStats] = useState({
    topics: 0,
    subtopics: 0,
    students610: 0,
    students1115: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      // Get token for authenticated requests
      const token = localStorage.getItem("aquachamp_token") || localStorage.getItem("superAdminToken");
      
      const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

      const [topicsRes, subtopicsRes, usersRes] = await Promise.all([
        axios.get(`${API}/api/topics`),
        axios.get(`${API}/api/subtopics`),
        axios.get(`${API}/api/users/all`, { headers: authHeaders }),
      ]);

      // Topics API returns array directly
      const topics = Array.isArray(topicsRes.data) ? topicsRes.data : [];
      
      // Subtopics API returns array directly
      const subtopics = Array.isArray(subtopicsRes.data) ? subtopicsRes.data : [];
      
      // Users API returns { success: true, count: X, users: [...] }
      const usersData = usersRes.data;
      const users = usersData?.users || (Array.isArray(usersData) ? usersData : []);
      
      // Filter only students (users with role "User" and active)
      const students = users.filter(user => 
        user.roles && 
        Array.isArray(user.roles) && 
        user.roles.includes("User") && 
        user.active !== false
      );
      
      // Count students by age groups
      // Age 5-10: includes ages 5, 6, 7, 8, 9, 10
      const students610 = students.filter(student => 
        student.age >= 5 && student.age <= 10
      ).length;
      
      // Age 11-15: includes ages 11, 12, 13, 14, 15
      const students1115 = students.filter(student => 
        student.age >= 11 && student.age <= 15
      ).length;

      console.log("📊 Stats Update:", {
        topics: topics.length,
        subtopics: subtopics.length,
        totalUsers: users.length,
        students: students.length,
        students610,
        students1115
      });

      setStats({
        topics: topics.length,
        subtopics: subtopics.length,
        students610,
        students1115,
      });
    } catch (err) {
      console.error("❌ Stats fetch error:", err.message);
      console.error("Full error:", err);
      // If auth error, try to show zeros gracefully
      if (err.response?.status === 401) {
        console.error("Authentication error - token may be missing or invalid");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    
    // Auto-refresh every 30 seconds to keep stats updated
    const interval = setInterval(fetchStats, 30000);
    
    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  const cards = [
    {
      label: "Total Topics",
      value: stats.topics,
      icon: "📚",
      iconBg: "linear-gradient(135deg, #10b981, #059669)",
      iconShadow: "0 4px 14px rgba(16,185,129,0.5)",
      cardBg: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
      border: "#6ee7b7",
      valueColor: "#065f46",
      labelColor: "#047857",
      badge: "#d1fae5",
      badgeText: "#065f46",
    },
    {
      label: "Total Subtopics",
      value: stats.subtopics,
      icon: "📂",
      iconBg: "linear-gradient(135deg, #6366f1, #4f46e5)",
      iconShadow: "0 4px 14px rgba(99,102,241,0.5)",
      cardBg: "linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)",
      border: "#a5b4fc",
      valueColor: "#3730a3",
      labelColor: "#4338ca",
      badge: "#e0e7ff",
      badgeText: "#3730a3",
    },
    {
      label: "Students Age 5–10",
      value: stats.students610,
      icon: "🧒",
      iconBg: "linear-gradient(135deg, #f59e0b, #d97706)",
      iconShadow: "0 4px 14px rgba(245,158,11,0.5)",
      cardBg: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
      border: "#fcd34d",
      valueColor: "#78350f",
      labelColor: "#92400e",
      badge: "#fef3c7",
      badgeText: "#78350f",
    },
    {
      label: "Students Age 11–15",
      value: stats.students1115,
      icon: "👦",
      iconBg: "linear-gradient(135deg, #ec4899, #db2777)",
      iconShadow: "0 4px 14px rgba(236,72,153,0.5)",
      cardBg: "linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)",
      border: "#f9a8d4",
      valueColor: "#831843",
      labelColor: "#9d174d",
      badge: "#fce7f3",
      badgeText: "#831843",
    },
  ];

  return (
    <div
      className="grid grid-cols-4 gap-4 px-6 py-4"
      style={{
        background: "linear-gradient(90deg, #ffffff 0%, #f0f4ff 100%)",
        borderBottom: "1px solid #e0e7ff",
      }}
    >
      {cards.map((card, i) => (
        <div
          key={i}
          className="rounded-2xl p-4 flex items-center gap-4 cursor-pointer transition-all duration-200"
          style={{
            background: card.cardBg,
            border: `1.5px solid ${card.border}`,
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-3px)";
            e.currentTarget.style.boxShadow = `0 8px 24px rgba(0,0,0,0.12)`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)";
          }}
        >
          <div
            className="w-13 h-13 rounded-2xl flex items-center justify-center text-2xl shrink-0"
            style={{
              background: card.iconBg,
              boxShadow: card.iconShadow,
              width: "52px",
              height: "52px",
            }}
          >
            {card.icon}
          </div>
          <div>
            <div
              className="text-3xl font-bold leading-none"
              style={{ color: card.valueColor }}
            >
              {loading ? (
                <span
                  className="animate-pulse"
                  style={{ color: "#94a3b8", fontSize: "24px" }}
                >
                  --
                </span>
              ) : (
                card.value
              )}
            </div>
            <div
              className="text-xs mt-1.5 font-bold uppercase tracking-wider"
              style={{ color: card.labelColor }}
            >
              {card.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}