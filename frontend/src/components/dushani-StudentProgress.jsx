import { useState, useEffect } from 'react';

const levelColorSchemes = [
  { bar: '#185FA5', bg: '#E6F1FB', color: '#185FA5', border: '#93c5fd', icon: '🥇' },
  { bar: '#0ea5e9', bg: '#e0f2fe', color: '#0369a1', border: '#7dd3fc', icon: '🥈' },
  { bar: '#0F6E56', bg: '#ecfdf5', color: '#065f46', border: '#6ee7b7', icon: '🥉' },
  { bar: '#EF9F27', bg: '#faeeda', color: '#854d0e', border: '#fcd34d', icon: '🏊' },
  { bar: '#0284c7', bg: '#f0f9ff', color: '#075985', border: '#bae6fd', icon: '🌊' },
  { bar: '#64748b', bg: '#f1f5f9', color: '#334155', border: '#cbd5e1', icon: '⭐' },
];

const inputStyle = {
  background: '#f8faff',
  border: '1px solid #bfdbfe',
  color: '#0b2540',
  borderRadius: '12px',
  padding: '10px 14px',
  fontSize: '13px',
  outline: 'none',
  fontFamily: "'Segoe UI', sans-serif",
};

export default function ProgressPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('superAdminToken');
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/levels/monitoring/students`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await res.json();
        if (data.success) setStudents(data.students || []);
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const filtered = students.filter(s =>
    (s.studentName.toLowerCase().includes(search.toLowerCase()) || s.username.toLowerCase().includes(search.toLowerCase())) &&
    (levelFilter === '' || s.currentLevel === levelFilter)
  );

  async function viewStudent(id) {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('superAdminToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/levels/monitoring/student/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      if (data.success) {
        setSelectedStudent(data.studentDetails);
        setActiveTab('details');
      }
    } catch (error) {
      console.error('Error fetching student details:', error);
    }
  }

  function backToAll() {
    setActiveTab('all');
    setSelectedStudent(null);
  }

  const initials = name => name.split(' ').map(x => x[0]).join('');

  const getLevelScheme = (levelName) => {
    if (!levelName) return levelColorSchemes[5];
    const num = parseInt(levelName.replace(/\D/g, '')) || 0;
    return levelColorSchemes[(num - 1) % levelColorSchemes.length] || levelColorSchemes[0];
  };

  const maxPoints = students.length > 0 ? Math.max(...students.map(s => s.totalPoints || 0), 1) : 1;

  if (loading) {
    return (
      <div style={{ background: '#f0f4f8', minHeight: '100%', fontFamily: "'Segoe UI', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', height: '256px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', background: 'linear-gradient(135deg, #0ea5e9, #185FA5)' }}>
            🎓
          </div>
          <p style={{ fontSize: '13px', fontWeight: '600', color: '#185FA5', letterSpacing: '0.05em', margin: 0 }}>Loading students…</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#f0f4f8', minHeight: '100%', fontFamily: "'Segoe UI', sans-serif" }}>

      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 32px', background: 'linear-gradient(90deg, #ffffff 0%, #e6f1fb 100%)', borderBottom: '1px solid #bfdbfe', boxShadow: '0 2px 12px rgba(24,95,165,0.08)' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#0b2540', margin: 0, letterSpacing: '-0.01em' }}>🎓 Student Progress</h1>
          <p style={{ fontSize: '11px', fontWeight: '600', color: '#185FA5', margin: '2px 0 0', letterSpacing: '0.08em' }}>AquaChamp · Monitoring</p>
        </div>
        <span style={{ fontSize: '11px', fontWeight: '700', padding: '6px 12px', borderRadius: '12px', background: '#E6F1FB', color: '#185FA5', border: '1px solid #93c5fd' }}>
          {students.length} student{students.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #bfdbfe' }}>
          {[{ id: 'all', label: 'All students' }, { id: 'details', label: 'Student details' }].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '10px 16px',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer',
                border: 'none',
                background: 'transparent',
                borderBottom: activeTab === tab.id ? '2px solid #185FA5' : '2px solid transparent',
                color: activeTab === tab.id ? '#185FA5' : '#94a3b8',
                marginBottom: '-1px',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                transition: 'color 0.15s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* All Students Tab */}
        {activeTab === 'all' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                style={{ ...inputStyle, flex: 1 }}
                placeholder="Search by name or username…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onFocus={e => { e.target.style.border = '1px solid #0ea5e9'; e.target.style.boxShadow = '0 0 0 3px rgba(14,165,233,0.15)'; }}
                onBlur={e => { e.target.style.border = '1px solid #bfdbfe'; e.target.style.boxShadow = 'none'; }}
              />
              <select
                style={{ ...inputStyle, width: '160px', cursor: 'pointer' }}
                value={levelFilter}
                onChange={e => setLevelFilter(e.target.value)}
              >
                <option value="">All levels</option>
                {['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5'].map(l => <option key={l}>{l}</option>)}
              </select>
            </div>

            {/* Table */}
            <div style={{ borderRadius: '16px', overflow: 'hidden', background: '#ffffff', border: '1px solid #bfdbfe', boxShadow: '0 4px 16px rgba(24,95,165,0.08)' }}>

              {/* Table Header */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 2fr 90px', padding: '10px 20px', background: 'linear-gradient(90deg, #e6f1fb, #f0f8ff)', borderBottom: '1px solid #bfdbfe', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#185FA5' }}>
                <span>Student</span>
                <span>Points</span>
                <span>Level</span>
                <span>Badges</span>
                <span>Distribution</span>
                <span></span>
              </div>

              {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '56px 0', color: '#94a3b8' }}>
                  <div style={{ fontSize: '36px', marginBottom: '8px' }}>🎓</div>
                  <p style={{ fontSize: '13px', fontWeight: '600', margin: '0 0 4px' }}>No students found</p>
                  <p style={{ fontSize: '11px', margin: 0 }}>Try adjusting your search or filter</p>
                </div>
              ) : (
                filtered.map((s, idx) => {
                  const scheme = getLevelScheme(s.currentLevel);
                  const pct = Math.round((s.totalPoints / maxPoints) * 100);
                  return (
                    <div
                      key={s.studentId}
                      style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 2fr 90px', alignItems: 'center', padding: '12px 20px', borderBottom: idx < filtered.length - 1 ? '1px solid #e0eeff' : 'none', transition: 'background 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#f7f9ff'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      {/* Student */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#E6F1FB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: '#185FA5', border: '1px solid #93c5fd', flexShrink: 0 }}>
                          {initials(s.studentName)}
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '700', color: '#0b2540' }}>{s.studentName}</div>
                          <div style={{ fontSize: '11px', color: '#94a3b8' }}>@{s.username}</div>
                        </div>
                      </div>

                      {/* Points */}
                      <div style={{ fontSize: '14px', fontWeight: '700', color: '#EF9F27' }}>{s.totalPoints.toLocaleString()}</div>

                      {/* Level badge */}
                      <div>
                        <span style={{ fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '8px', background: scheme.bg, color: scheme.color, border: `1px solid ${scheme.border}` }}>
                          {s.currentLevel || 'N/A'}
                        </span>
                      </div>

                      {/* Badges */}
                      <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '600' }}>{s.badgesCount || 0}</div>

                      {/* Distribution bar */}
                      <div style={{ paddingRight: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                          <span style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8' }}>{pct}%</span>
                        </div>
                        <div style={{ height: '10px', borderRadius: '9999px', overflow: 'hidden', background: '#f0f4f8' }}>
                          <div style={{ height: '10px', borderRadius: '9999px', width: `${pct}%`, background: `linear-gradient(90deg, ${scheme.bar}, ${scheme.bar}cc)`, boxShadow: `0 0 8px ${scheme.bar}55`, transition: 'width 0.7s' }} />
                        </div>
                      </div>

                      {/* View button */}
                      <div>
                        <button
                          onClick={() => viewStudent(s.studentId)}
                          style={{ padding: '6px 14px', borderRadius: '12px', fontSize: '12px', fontWeight: '700', background: '#E6F1FB', color: '#185FA5', border: '1px solid #93c5fd', cursor: 'pointer', transition: 'background 0.15s' }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#bfdbfe'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = '#E6F1FB'; }}
                        >
                          View
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Student Details Tab */}
        {activeTab === 'details' && (
          <div>
            {!selectedStudent ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px', background: '#E6F1FB', border: '1px solid #93c5fd', borderRadius: '12px', fontSize: '13px', color: '#185FA5', fontWeight: '600' }}>
                ℹ️ Click "View" on any student in the All Students tab to see their full breakdown here.
              </div>
            ) : (() => {
              const scheme = getLevelScheme(selectedStudent.currentLevel);
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ borderRadius: '16px', overflow: 'hidden', background: '#ffffff', border: '1px solid #bfdbfe', boxShadow: '0 4px 20px rgba(24,95,165,0.1)' }}>

                    {/* Card header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 24px', background: 'linear-gradient(90deg, #e6f1fb, #f0f8ff)', borderBottom: '1px solid #bfdbfe' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#E6F1FB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '700', color: '#185FA5', border: '2px solid #93c5fd', flexShrink: 0 }}>
                        {initials(selectedStudent.studentName)}
                      </div>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: '700', color: '#0b2540' }}>{selectedStudent.studentName}</div>
                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>@{selectedStudent.username}</div>
                      </div>
                      <span style={{ marginLeft: 'auto', fontSize: '11px', fontWeight: '700', padding: '5px 14px', borderRadius: '12px', background: scheme.bg, color: scheme.color, border: `1px solid ${scheme.border}` }}>
                        {selectedStudent.currentLevel || 'N/A'}
                      </span>
                    </div>

                    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

                      {/* Stats grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                        {[
                          { label: 'Total points', value: selectedStudent.totalPoints.toLocaleString(), color: '#EF9F27' },
                          { label: 'Badges earned', value: selectedStudent.badgesEarned?.length || 0, color: '#185FA5' },
                          { label: 'Last active', value: selectedStudent.lastActivity ? new Date(selectedStudent.lastActivity).toLocaleDateString() : 'N/A', color: '#0b2540', small: true },
                        ].map(stat => (
                          <div key={stat.label} style={{ background: '#f8faff', border: '1px solid #e0eeff', borderRadius: '12px', padding: '14px' }}>
                            <div style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#185FA5', marginBottom: '6px' }}>{stat.label}</div>
                            <div style={{ fontSize: stat.small ? '15px' : '24px', fontWeight: '700', color: stat.color }}>{stat.value}</div>
                          </div>
                        ))}
                      </div>

                      {/* Points breakdown */}
                      <div>
                        <div style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#185FA5', marginBottom: '12px' }}>Points breakdown</div>
                        <div style={{ background: '#f8faff', border: '1px solid #e0eeff', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                            {[
                              { label: 'Game points', value: selectedStudent.pointsBreakdown?.gamePoints || 0, sub: `From ${(selectedStudent.pointsBreakdown?.games || []).length} games played`, icon: '🎮', color: '#185FA5', bg: '#E6F1FB', border: '#93c5fd' },
                              { label: 'Daily login', value: selectedStudent.pointsBreakdown?.dailyLoginPoints || 0, sub: '10 pts per daily login', icon: '📅', color: '#854d0e', bg: '#faeeda', border: '#fcd34d' },
                              { label: 'Other activity', value: selectedStudent.pointsBreakdown?.userPoints || 0, sub: 'From other activities', icon: '⭐', color: '#334155', bg: '#f1f5f9', border: '#cbd5e1' },
                            ].map(item => (
                              <div key={item.label} style={{ background: '#ffffff', borderRadius: '10px', padding: '12px', border: `1px solid ${item.border}` }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>{item.icon}</div>
                                  <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>{item.label}</div>
                                </div>
                                <div style={{ fontSize: '22px', fontWeight: '700', color: item.color }}>{item.value.toLocaleString()}</div>
                                <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>{item.sub}</div>
                              </div>
                            ))}
                          </div>

                          {/* Total banner */}
                          <div style={{ background: 'linear-gradient(90deg, #EF9F27, #F5B85D)', borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                              <div style={{ fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.85)' }}>Total points</div>
                              <div style={{ fontSize: '28px', fontWeight: '700', color: '#ffffff', marginTop: '2px' }}>{selectedStudent.totalPoints.toLocaleString()}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.85)' }}>Current level</div>
                              <div style={{ fontSize: '22px', fontWeight: '700', color: '#ffffff', marginTop: '2px' }}>{selectedStudent.currentLevel || 'N/A'}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Game History */}
                      {(selectedStudent.pointsBreakdown?.games || []).length > 0 && (
                        <div>
                          <div style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#185FA5', marginBottom: '12px' }}>
                            Game history ({selectedStudent.pointsBreakdown.games.length})
                          </div>
                          <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #bfdbfe' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '8px 16px', background: 'linear-gradient(90deg, #e6f1fb, #f0f8ff)', borderBottom: '1px solid #bfdbfe', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#185FA5' }}>
                              <span>Game</span><span>Score</span><span>Max / %</span><span>Date</span>
                            </div>
                            {selectedStudent.pointsBreakdown.games.map((game, idx) => (
                              <div
                                key={game.gameId || idx}
                                style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', alignItems: 'center', padding: '10px 16px', borderBottom: idx < selectedStudent.pointsBreakdown.games.length - 1 ? '1px solid #e0eeff' : 'none', background: '#ffffff', transition: 'background 0.15s' }}
                                onMouseEnter={e => { e.currentTarget.style.background = '#f7f9ff'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#E6F1FB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', border: '1px solid #93c5fd', flexShrink: 0 }}>🎮</div>
                                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#0b2540' }}>{game.gameName}</span>
                                </div>
                                <div style={{ fontSize: '14px', fontWeight: '700', color: '#185FA5' }}>{game.score}</div>
                                <div style={{ fontSize: '12px', color: '#94a3b8' }}>/ {game.maxScore} <span style={{ color: '#185FA5', fontWeight: '600' }}>({game.percentage?.toFixed(1) || 0}%)</span></div>
                                <div style={{ fontSize: '11px', color: '#94a3b8' }}>{game.playedAt ? new Date(game.playedAt).toLocaleDateString() : 'N/A'}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Badges */}
                      {selectedStudent.badgesEarned?.length > 0 && (
                        <div>
                          <div style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#185FA5', marginBottom: '12px' }}>
                            Earned badges ({selectedStudent.badgesEarned.length})
                          </div>
                          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            {selectedStudent.badgesEarned.map((badge, idx) => (
                              <div key={idx} style={{ background: 'linear-gradient(135deg, #faeeda, #F5E6C8)', border: '1px solid #E8D5A8', borderRadius: '12px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ fontSize: '22px' }}>{badge.badgeDetails?.badgeIcon || '🏆'}</span>
                                <div>
                                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#854d0e' }}>{badge.badgeDetails?.badgeName || 'Badge'}</div>
                                  <div style={{ fontSize: '10px', color: '#A67B27' }}>{badge.earnedAt ? new Date(badge.earnedAt).toLocaleDateString() : 'Recently'}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Back button */}
                  <div>
                    <button
                      onClick={backToAll}
                      style={{ padding: '8px 18px', borderRadius: '12px', fontSize: '12px', fontWeight: '700', background: '#f0f4f8', color: '#64748b', border: '1px solid #bfdbfe', cursor: 'pointer', transition: 'background 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#e2e8f0'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#f0f4f8'; }}
                    >
                      ← Back to all students
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
