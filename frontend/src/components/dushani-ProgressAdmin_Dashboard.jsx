import { useState, useEffect } from 'react';

function StatCard({ label, value, sub, icon, iconBg, valueColor, borderColor }) {
  return (
    <div
      className="rounded-2xl p-5 transition-all hover:shadow-xl"
      style={{
        background: '#ffffff',
        border: `1px solid ${borderColor || '#bfdbfe'}`,
        boxShadow: '0 4px 16px rgba(24,95,165,0.08)',
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
          style={{ background: iconBg }}
        >
          {icon}
        </div>
        <div
          className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg"
          style={{ background: iconBg, color: valueColor }}
        >
          LIVE
        </div>
      </div>
      <div className="text-[28px] font-bold leading-tight" style={{ color: valueColor }}>
        {value}
      </div>
      <div className="text-xs font-bold uppercase tracking-widest mt-1" style={{ color: '#94a3b8' }}>
        {label}
      </div>
      <div className="text-[11px] mt-0.5" style={{ color: '#cbd5e1' }}>
        {sub}
      </div>
    </div>
  );
}

export default function DushaniOverviewPage() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    badgesAwarded: 0,
    activeLevels: 0,
    avgPoints: 0,
    recentBadges: [],
    levelDistribution: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token =
          localStorage.getItem('token') || localStorage.getItem('superAdminToken');

        const headers = {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        };

        const [progressRes, levelsRes, badgesRes] = await Promise.all([
          fetch('http://localhost:4000/api/levels/monitoring/students', { headers }),
          fetch('http://localhost:4000/api/levels/', { headers }),
          fetch('http://localhost:4000/api/badges/', { headers }),
        ]);

        const [progressData, levelsData, badgesData] = await Promise.all([
          progressRes.json(),
          levelsRes.json(),
          badgesRes.json(),
        ]);

        if (progressData.success && levelsData.success && badgesData.success) {
          const students = progressData.students || [];
          const levels = levelsData.levels || [];
          const badges = badgesData.badges || [];

          const totalBadges = badges.reduce((sum, b) => sum + (b.earnedCount || 0), 0);
          const totalPoints = students.reduce((sum, s) => sum + (s.totalPoints || 0), 0);
          const avgPoints = students.length > 0 ? Math.round(totalPoints / students.length) : 0;
          
          // Update badgesAwarded to use badgesCount from students if available
          const totalBadgesAwarded = students.reduce((sum, s) => sum + (s.badgesCount || 0), 0);

          // Get badges earned TODAY only
          const today = new Date();
          today.setHours(0, 0, 0, 0); // Start of today
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1); // Start of tomorrow

          const recentBadges = [];
          
          // Loop through all students and find badges earned today
          for (const student of students) {
            // Safe check: ensure badgesEarned exists and is an array
            if (!student.badgesEarned || !Array.isArray(student.badgesEarned) || student.badgesEarned.length === 0) {
              continue;
            }
            
            // Check each badge if it was earned today
            for (const badge of student.badgesEarned) {
              if (!badge.earnedAt) continue; // Skip if no earnedAt date
              
              const earnedDate = new Date(badge.earnedAt);
              
              // Check if badge was earned today (between today 00:00 and tomorrow 00:00)
              if (earnedDate >= today && earnedDate < tomorrow) {
                recentBadges.push({
                  student: student.studentName,
                  badge: badge.badgeDetails?.badgeName || 'Unknown Badge',
                  badgeIcon: badge.badgeDetails?.badgeIcon || '🏆',
                  totalBadges: student.badgesEarned.length,
                  when: earnedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  earnedAt: earnedDate,
                });
              }
            }
          }
          
          // Sort by most recent first
          recentBadges.sort((a, b) => b.earnedAt - a.earnedAt);

          const levelDistribution = levels.map((level) => ({
            name: level.levelName,
            students: students.filter((s) => s.currentLevel === level.levelName).length,
          }));

          if (progressData.naLevelCount > 0) {
            levelDistribution.push({ name: 'N/A', students: progressData.naLevelCount });
          }

          setStats({
            totalStudents: students.length,
            badgesAwarded: totalBadgesAwarded,
            activeLevels: levels.length,
            avgPoints,
            recentBadges,
            levelDistribution,
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div
        className="flex items-center justify-center h-64"
        style={{ background: '#f0f4f8' }}
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl animate-pulse"
            style={{
              background: 'linear-gradient(135deg, #0ea5e9, #185FA5)',
              boxShadow: '0 0 20px rgba(14,165,233,0.4)',
            }}
          >
            🌊
          </div>
          <p className="text-sm font-semibold tracking-wide" style={{ color: '#185FA5' }}>
            Loading dashboard…
          </p>
        </div>
      </div>
    );
  }

  const maxStudents = Math.max(...stats.levelDistribution.map((l) => l.students), 1);

  const levelColors = [
    { bar: '#185FA5', bg: '#E6F1FB', text: '#185FA5' },
    { bar: '#0ea5e9', bg: '#e0f2fe', text: '#0369a1' },
    { bar: '#0F6E56', bg: '#ecfdf5', text: '#065f46' },
    { bar: '#EF9F27', bg: '#faeeda', text: '#854d0e' },
    { bar: '#0284c7', bg: '#f0f9ff', text: '#075985' },
    { bar: '#64748b', bg: '#f1f5f9', text: '#334155' },
  ];

  const badgePills = [
    { bg: '#faeeda', color: '#854d0e' },
    { bg: '#ecfdf5', color: '#065f46' },
    { bg: '#E6F1FB', color: '#185FA5' },
    { bg: '#e0f2fe', color: '#0369a1' },
    { bg: '#fefce8', color: '#854d0e' },
  ];

  return (
    <div style={{ background: '#f0f4f8', minHeight: '100%', fontFamily: "'Segoe UI', sans-serif" }}>
      {/* Page Header */}
      <div
        className="flex items-center justify-between px-8 py-4"
        style={{
          background: 'linear-gradient(90deg, #ffffff 0%, #e6f1fb 100%)',
          borderBottom: '1px solid #bfdbfe',
          boxShadow: '0 2px 12px rgba(24,95,165,0.08)',
        }}
      >
        <div>
          <h1 className="text-xl font-bold tracking-tight" style={{ color: '#0b2540' }}>
            ⚡ Dashboard
          </h1>
          <p className="text-xs mt-0.5 font-medium tracking-wide" style={{ color: '#185FA5' }}>
            AquaChamp · Overview
          </p>
        </div>
        <div
          className="px-3 py-1.5 rounded-xl text-xs font-bold"
          style={{ background: '#E6F1FB', color: '#185FA5', border: '1px solid #93c5fd' }}
        >
          Live Data
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard
            label="Total Students"
            value={stats.totalStudents.toString()}
            sub="Active learners"
            icon="🎓"
            iconBg="#E6F1FB"
            valueColor="#185FA5"
            borderColor="#bfdbfe"
          />
          <StatCard
            label="Badges Awarded"
            value={stats.badgesAwarded.toLocaleString()}
            sub="Across all active badges"
            icon="🏅"
            iconBg="#faeeda"
            valueColor="#EF9F27"
            borderColor="#fde68a"
          />
          <StatCard
            label="Active Levels"
            value={stats.activeLevels.toString()}
            sub="Configured levels"
            icon="🏊"
            iconBg="#ecfdf5"
            valueColor="#0F6E56"
            borderColor="#a7f3d0"
          />
          <StatCard
            label="Avg. Points / Student"
            value={stats.avgPoints.toLocaleString()}
            sub="Calculated from all sources"
            icon="⭐"
            iconBg="#f0f9ff"
            valueColor="#0369a1"
            borderColor="#bfdbfe"
          />
        </div>

        {/* Two-column section */}
        <div className="grid grid-cols-2 gap-5">
          {/* Recent Badge Awards */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: '#ffffff',
              border: '1px solid #bfdbfe',
              boxShadow: '0 4px 16px rgba(24,95,165,0.08)',
            }}
          >
            {/* Card Header */}
            <div
              className="px-5 py-3.5 flex items-center justify-between"
              style={{
                background: 'linear-gradient(90deg, #e6f1fb, #f0f8ff)',
                borderBottom: '1px solid #bfdbfe',
              }}
            >
              <h2
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: '#185FA5' }}
              >
                🏆 Today's Badge Awards
              </h2>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-lg"
                style={{ background: '#E6F1FB', color: '#185FA5', border: '1px solid #93c5fd' }}
              >
                {stats.recentBadges.length} today
              </span>
            </div>

            {/* Table */}
            <div>
              <div
                className="grid text-[10px] font-bold uppercase tracking-widest px-5 py-2.5"
                style={{
                  color: '#94a3b8',
                  borderBottom: '1px solid #f0f4f8',
                  gridTemplateColumns: '1.5fr 1fr 1fr',
                }}
              >
                <span>Student</span>
                <span>Badge</span>
                <span>When</span>
              </div>

              {stats.recentBadges.length > 0 ? (
                stats.recentBadges.map((row, i) => (
                  <div
                    key={i}
                    className="grid items-center px-5 py-3 transition-all"
                    style={{
                      gridTemplateColumns: '1.5fr 1fr 1fr',
                      borderBottom: i < stats.recentBadges.length - 1 ? '1px solid #f0f4f8' : 'none',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#f7f9ff'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
                        style={{ background: 'linear-gradient(135deg, #0ea5e9, #185FA5)' }}
                      >
                        {row.student.charAt(0)}
                      </div>
                      <span className="text-sm font-semibold truncate" style={{ color: '#0b2540' }}>
                        {row.student}
                      </span>
                    </div>
                    <div>
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-bold"
                        style={{
                          background: badgePills[i % badgePills.length].bg,
                          color: badgePills[i % badgePills.length].color,
                        }}
                      >
                        <span>{row.badgeIcon}</span>
                        <span>{row.badge}</span>
                      </span>
                      {row.totalBadges > 1 && (
                        <div className="text-[10px] text-gray-400 mt-1">
                          {row.totalBadges} total badges
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-medium" style={{ color: '#94a3b8' }}>
                      {row.when}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-10" style={{ color: '#94a3b8' }}>
                  <div className="text-3xl mb-2">🏅</div>
                  <p className="text-sm font-semibold">No badges earned today</p>
                  <p className="text-xs mt-1">Badges earned will appear here automatically</p>
                </div>
              )}
            </div>
          </div>

          {/* Level Distribution */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: '#ffffff',
              border: '1px solid #bfdbfe',
              boxShadow: '0 4px 16px rgba(24,95,165,0.08)',
            }}
          >
            {/* Card Header */}
            <div
              className="px-5 py-3.5 flex items-center justify-between"
              style={{
                background: 'linear-gradient(90deg, #e6f1fb, #f0f8ff)',
                borderBottom: '1px solid #bfdbfe',
              }}
            >
              <h2
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: '#185FA5' }}
              >
                🏊 Level Distribution
              </h2>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-lg"
                style={{ background: '#E6F1FB', color: '#185FA5', border: '1px solid #93c5fd' }}
              >
                {stats.totalStudents} total
              </span>
            </div>

            <div className="p-5 space-y-4">
              {stats.levelDistribution.length > 0 ? (
                stats.levelDistribution.map((l, idx) => {
                  const pct =
                    stats.totalStudents > 0
                      ? Math.round((l.students / stats.totalStudents) * 100)
                      : 0;
                  const scheme = levelColors[idx % levelColors.length];
                  return (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ background: scheme.bar }}
                          />
                          <span className="text-xs font-bold" style={{ color: '#0b2540' }}>
                            {l.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-lg"
                            style={{ background: scheme.bg, color: scheme.text }}
                          >
                            {pct}%
                          </span>
                          <span className="text-xs font-bold" style={{ color: '#64748b' }}>
                            {l.students}
                          </span>
                        </div>
                      </div>
                      <div
                        className="h-2.5 rounded-full overflow-hidden"
                        style={{ background: '#f0f4f8' }}
                      >
                        <div
                          className="h-2.5 rounded-full transition-all duration-700"
                          style={{
                            width: `${pct}%`,
                            background: `linear-gradient(90deg, ${scheme.bar}, ${scheme.bar}cc)`,
                            boxShadow: `0 0 8px ${scheme.bar}55`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10" style={{ color: '#94a3b8' }}>
                  <div className="text-3xl mb-2">📊</div>
                  <p className="text-sm font-semibold">No level data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
