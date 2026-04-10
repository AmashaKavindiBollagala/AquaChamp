import { useState, useEffect } from 'react';

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
        const res = await fetch('http://localhost:4000/api/levels/monitoring/students', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await res.json();
        if (data.success) {
          setStudents(data.students || []);
        }
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
      const res = await fetch(`http://localhost:4000/api/levels/monitoring/student/${id}`, {
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

  if (loading) {
    return (
      <div>
        <div className="bg-white border-b border-gray-200 px-6 py-3.5">
          <h1 className="text-base font-medium text-gray-900">Student progress</h1>
        </div>
        <div className="p-6">
          <div className="text-center text-gray-500">Loading students...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white border-b border-gray-200 px-6 py-3.5">
        <h1 className="text-base font-medium text-gray-900">Student progress</h1>
      </div>

      <div className="p-6">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-5">
          {[{ id: 'all', label: 'All students' }, { id: 'details', label: 'Student details' }].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-[13px] cursor-pointer border-0 bg-transparent border-b-2 -mb-px transition-colors
                ${activeTab === tab.id ? 'text-[#185FA5] border-[#185FA5] font-medium' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* All Students Tab */}
        {activeTab === 'all' && (
          <div>
            <div className="flex gap-2 mb-4">
              <input
                className="flex-1 px-3 py-2 border border-gray-200 rounded-md text-[13px] text-gray-900 focus:outline-none focus:border-[#185FA5] placeholder-gray-400"
                placeholder="Search by name or username..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <select
                className="w-40 px-2.5 py-2 border border-gray-200 rounded-md text-[13px] text-gray-900 focus:outline-none focus:border-[#185FA5] bg-white cursor-pointer"
                value={levelFilter}
                onChange={e => setLevelFilter(e.target.value)}
              >
                <option value="">All levels</option>
                {['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5'].map(l => <option key={l}>{l}</option>)}
              </select>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-[13px]">
                <thead>
                  <tr>
                    {['Student', 'Points', 'Level', 'Badges', 'Last active', ''].map(h => (
                      <th key={h} className="text-left text-[11px] font-medium text-gray-400 uppercase tracking-wide px-3 py-2 border-b border-gray-100">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(s => (
                    <tr key={s.studentId} className="hover:bg-gray-50 border-b border-gray-100 last:border-0">
                      <td className="px-3 py-2.5">
                        <div className="font-medium text-gray-800">{s.studentName}</div>
                        <div className="text-[11px] text-gray-400">@{s.username}</div>
                      </td>
                      <td className="px-3 py-2.5 font-medium text-[#EF9F27]">{s.totalPoints.toLocaleString()}</td>
                      <td className="px-3 py-2.5">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#E6F1FB] text-[#185FA5]">{s.currentLevel || 'N/A'}</span>
                      </td>
                      <td className="px-3 py-2.5 text-gray-400">{s.badgesEarned}</td>
                      <td className="px-3 py-2.5 text-gray-400 text-xs">{s.lastActivity ? new Date(s.lastActivity).toLocaleDateString() : 'N/A'}</td>
                      <td className="px-3 py-2.5">
                        <button onClick={() => viewStudent(s.studentId)} className="px-2.5 py-1 border border-gray-200 rounded text-[12px] text-gray-600 hover:bg-gray-50 cursor-pointer bg-white">View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Student Details Tab */}
        {activeTab === 'details' && (
          <div>
            {!selectedStudent ? (
              <div className="flex items-center gap-2 px-3.5 py-2.5 bg-[#E6F1FB] text-[#185FA5] rounded-md text-[13px]">
                ℹ️ Click "View" on any student in the All Students tab to see their full breakdown here.
              </div>
            ) : (
              <div>
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-4">
                  <div className="p-4">
                    {/* Header */}
                    <div className="flex items-center gap-3.5 mb-5">
                      <div className="w-12 h-12 rounded-full bg-[#E6F1FB] flex items-center justify-center font-medium text-base text-[#185FA5]">
                        {initials(selectedStudent.studentName)}
                      </div>
                      <div>
                        <div className="font-medium text-[15px] text-gray-900">{selectedStudent.studentName}</div>
                        <div className="text-xs text-gray-400">@{selectedStudent.username}</div>
                      </div>
                      <span className="ml-auto inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#E6F1FB] text-[#185FA5]">
                        {selectedStudent.currentLevel || 'N/A'}
                      </span>
                    </div>

                    {/* Stats grid */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-[11px] text-gray-400 mb-1">Total points</div>
                        <div className="text-xl font-medium text-[#EF9F27]">{selectedStudent.totalPoints.toLocaleString()}</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-[11px] text-gray-400 mb-1">Badges earned</div>
                        <div className="text-xl font-medium text-[#185FA5]">{selectedStudent.badgesEarned?.length || 0}</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-[11px] text-gray-400 mb-1">Last active</div>
                        <div className="text-sm font-medium text-gray-800">{selectedStudent.lastActivity ? new Date(selectedStudent.lastActivity).toLocaleDateString() : 'N/A'}</div>
                      </div>
                    </div>

                    {/* Points breakdown */}
                    <div className="mt-5">
                      <div className="text-sm font-medium text-gray-700 mb-3">Points Breakdown</div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          {/* Quiz Points */}
                          <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-8 h-8 rounded-full bg-[#E6F1FB] flex items-center justify-center text-base">📝</div>
                              <div className="text-xs text-gray-500">Quiz Points</div>
                            </div>
                            <div className="text-2xl font-semibold text-[#185FA5]">
                              {selectedStudent.pointsBreakdown?.quizPoints || 0}
                            </div>
                            <div className="text-[11px] text-gray-400 mt-1">
                              From quiz completions
                            </div>
                          </div>

                          {/* True/False Points */}
                          <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-8 h-8 rounded-full bg-[#E1F5EE] flex items-center justify-center text-base">✅</div>
                              <div className="text-xs text-gray-500">True/False Points</div>
                            </div>
                            <div className="text-2xl font-semibold text-[#0F6E56]">
                              {selectedStudent.pointsBreakdown?.trueFalsePoints || 0}
                            </div>
                            <div className="text-[11px] text-gray-400 mt-1">
                              From true/false questions
                            </div>
                          </div>

                          {/* Daily Login Points */}
                          <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-8 h-8 rounded-full bg-[#FAEEDA] flex items-center justify-center text-base">📅</div>
                              <div className="text-xs text-gray-500">Daily Login Points</div>
                            </div>
                            <div className="text-2xl font-semibold text-[#854F0B]">
                              {selectedStudent.pointsBreakdown?.dailyLoginPoints || 0}
                            </div>
                            <div className="text-[11px] text-gray-400 mt-1">
                              10 pts per daily login
                            </div>
                          </div>

                          {/* User Points */}
                          <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-base">⭐</div>
                              <div className="text-xs text-gray-500">User Points</div>
                            </div>
                            <div className="text-2xl font-semibold text-gray-600">
                              {selectedStudent.pointsBreakdown?.userPoints || 0}
                            </div>
                            <div className="text-[11px] text-gray-400 mt-1">
                              From other activities
                            </div>
                          </div>
                        </div>

                        {/* Total */}
                        <div className="bg-gradient-to-r from-[#EF9F27] to-[#F5B85D] rounded-lg p-4 text-white">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm font-medium opacity-90">Total Points</div>
                              <div className="text-3xl font-bold mt-1">
                                {selectedStudent.totalPoints.toLocaleString()}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm opacity-90">Current Level</div>
                              <div className="text-2xl font-bold mt-1">
                                {selectedStudent.currentLevel || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Badges Section */}
                    {selectedStudent.badgesEarned && selectedStudent.badgesEarned.length > 0 && (
                      <div className="mt-5">
                        <div className="text-sm font-medium text-gray-700 mb-3">Earned Badges ({selectedStudent.badgesEarned.length})</div>
                        <div className="flex gap-2 flex-wrap">
                          {selectedStudent.badgesEarned.map((badge, idx) => (
                            <div key={idx} className="bg-gradient-to-br from-[#FAEEDA] to-[#F5E6C8] border border-[#E8D5A8] rounded-lg p-3 flex items-center gap-2">
                              <span className="text-2xl">{badge.badgeDetails?.badgeIcon || '🏆'}</span>
                              <div>
                                <div className="text-sm font-medium text-[#854F0B]">{badge.badgeDetails?.badgeName || 'Badge'}</div>
                                <div className="text-[11px] text-[#A67B27]">
                                  {badge.earnedAt ? new Date(badge.earnedAt).toLocaleDateString() : 'Recently'}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <button onClick={backToAll} className="px-3.5 py-1.5 border border-gray-200 rounded-md text-[13px] text-gray-600 hover:bg-gray-50 cursor-pointer bg-white">
                  ← Back to all students
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
