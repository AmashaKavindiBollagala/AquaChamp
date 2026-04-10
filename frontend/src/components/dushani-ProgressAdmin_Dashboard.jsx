import { useState, useEffect } from 'react';

function StatCard({ label, value, sub, accentClass }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="text-xs text-gray-500 mb-1.5">{label}</div>
      <div className={`text-[22px] font-medium ${accentClass}`}>{value}</div>
      <div className="text-[11px] text-gray-400 mt-1">{sub}</div>
    </div>
  );
}

export default function OverviewPage() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    badgesAwarded: 0,
    activeLevels: 0,
    avgPoints: 0,
    recentBadges: [],
    levelDistribution: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('superAdminToken');
        console.log('Dashboard Token:', token ? 'Found' : 'NOT FOUND');
        
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        // Fetch student progress data
        console.log('Fetching student progress...');
        const progressRes = await fetch('http://localhost:4000/api/levels/monitoring/students', {
          headers
        });
        console.log('Progress response status:', progressRes.status);
        const progressData = await progressRes.json();
        console.log('Progress data:', progressData);

        // Fetch levels
        console.log('Fetching levels...');
        const levelsRes = await fetch('http://localhost:4000/api/levels/', {
          headers
        });
        console.log('Levels response status:', levelsRes.status);
        const levelsData = await levelsRes.json();
        console.log('Levels data:', levelsData);

        // Fetch badges
        console.log('Fetching badges...');
        const badgesRes = await fetch('http://localhost:4000/api/badges/', {
          headers
        });
        console.log('Badges response status:', badgesRes.status);
        const badgesData = await badgesRes.json();
        console.log('Badges data:', badgesData);

        if (progressData.success && levelsData.success && badgesData.success) {
          const students = progressData.students || [];
          const levels = levelsData.levels || [];
          const badges = badgesData.badges || [];

          // Calculate total badges awarded
          const totalBadges = badges.reduce((sum, badge) => sum + (badge.earnedCount || 0), 0);

          // Calculate average points
          const totalPoints = students.reduce((sum, student) => sum + (student.totalPoints || 0), 0);
          const avgPoints = students.length > 0 ? Math.round(totalPoints / students.length) : 0;

          // Get recent badge awards (from students with badges)
          const recentBadges = students
            .filter(s => s.badgesEarned > 0)
            .slice(0, 4)
            .map(s => ({
              student: s.studentName,
              badge: `${s.badgesEarned} badges`,
              when: s.lastActivity ? new Date(s.lastActivity).toLocaleDateString() : 'N/A'
            }));

          // Level distribution
          const levelDistribution = levels.map(level => ({
            name: level.levelName,
            students: students.filter(s => s.currentLevel === level.levelName).length
          }));
          
          // Add N/A level if there are students with no level
          if (progressData.naLevelCount > 0) {
            levelDistribution.push({
              name: 'N/A',
              students: progressData.naLevelCount
            });
          }

          setStats({
            totalStudents: students.length,
            badgesAwarded: totalBadges,
            activeLevels: levels.length,
            avgPoints,
            recentBadges,
            levelDistribution
          });
        }
      } catch (error) {
        console.error('❌ Error fetching dashboard data:', error);
        console.error('Error details:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div>
        <div className="bg-white border-b border-gray-200 px-6 py-3.5 flex items-center justify-between">
          <h1 className="text-base font-medium text-gray-900">Dashboard</h1>
        </div>
        <div className="p-6">
          <div className="text-center text-gray-500">Loading dashboard data...</div>
        </div>
      </div>
    );
  }
  return (
    <div>
      <div className="bg-white border-b border-gray-200 px-6 py-3.5 flex items-center justify-between">
        <h1 className="text-base font-medium text-gray-900">Dashboard</h1>
      </div>

      <div className="p-6">
        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <StatCard label="Total students" value={stats.totalStudents.toString()} sub="Active students" accentClass="text-[#185FA5]" />
          <StatCard label="Badges awarded" value={stats.badgesAwarded.toLocaleString()} sub="across all active badges" accentClass="text-[#EF9F27]" />
          <StatCard label="Active levels" value={stats.activeLevels.toString()} sub="configured levels" accentClass="text-[#1D9E75]" />
          <StatCard label="Avg. points / student" value={stats.avgPoints.toString()} sub="calculated from all sources" accentClass="text-gray-900" />
        </div>

        {/* Two column layout */}
        <div className="grid grid-cols-2 gap-4">
          {/* Recent Badge Awards */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3.5 border-b border-gray-200">
              <h2 className="text-sm font-medium text-gray-900">Recent badge awards</h2>
            </div>
            <table className="w-full text-[13px]">
              <thead>
                <tr>
                  {['Student', 'Badge', 'When'].map(h => (
                    <th key={h} className="text-left text-[11px] font-medium text-gray-400 uppercase tracking-wide px-3 py-2 border-b border-gray-100">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.recentBadges.length > 0 ? (
                  stats.recentBadges.map((row, i) => {
                    const pillColors = ['amber', 'teal', 'blue', 'amber'];
                    const pill = pillColors[i % pillColors.length];
                    return (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-3 py-2.5 text-gray-800">{row.student}</td>
                        <td className="px-3 py-2.5">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium
                            ${pill === 'amber' ? 'bg-[#FAEEDA] text-[#854F0B]' : pill === 'teal' ? 'bg-[#E1F5EE] text-[#0F6E56]' : 'bg-[#E6F1FB] text-[#185FA5]'}`}>
                            {row.badge}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-gray-400">{row.when}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="3" className="px-3 py-4 text-center text-gray-400">No recent badge awards</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Level Distribution */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3.5 border-b border-gray-200">
              <h2 className="text-sm font-medium text-gray-900">Level distribution</h2>
            </div>
            <div className="p-4">
              {stats.levelDistribution.length > 0 ? (
                stats.levelDistribution.map((l, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 mb-3 last:mb-0">
                    <span className="text-xs text-gray-400 w-14">{l.name}</span>
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full">
                      <div
                        className="h-1.5 rounded-full bg-[#185FA5]"
                        style={{ width: `${stats.totalStudents > 0 ? Math.round((l.students / stats.totalStudents) * 100) : 0}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-700 w-7 text-right">{l.students}</span>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-400 py-4">No level data available</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
