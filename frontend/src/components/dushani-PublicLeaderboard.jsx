import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PublicLeaderboard() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('superAdminToken');

        let res;
        try {
          res = await fetch('http://localhost:4000/api/points/leaderboard', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
        } catch {
          res = await fetch('http://localhost:4000/api/progress/leaderboard?limit=100', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
        }

        const data = await res.json();
        if (data.success) {
          const students = data.students || data.leaderboard || [];
          const sortedStudents = students.sort((a, b) => b.totalPoints - a.totalPoints);
          setStudents(sortedStudents);

          const userId = localStorage.getItem('userId');
          if (userId) {
            const user = sortedStudents.find(s => s.userId === userId || s.studentId === userId);
            setCurrentUser(user);
          }
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const filtered = students.filter(s =>
    s.studentName?.toLowerCase().includes(search.toLowerCase()) ||
    s.username?.toLowerCase().includes(search.toLowerCase())
  );

  const calculateRanks = (studentList) => {
    if (studentList.length === 0) return [];

    let rankedList = [];
    let currentRank = 1;

    for (let i = 0; i < studentList.length; i++) {
      if (i > 0 && studentList[i].totalPoints < studentList[i - 1].totalPoints) {
        currentRank = i + 1;
      }

      rankedList.push({
        ...studentList[i],
        rank: currentRank,
        displayRank: currentRank
      });
    }

    return rankedList;
  };

  const rankedStudents = calculateRanks(filtered);
  const rankedAllStudents = calculateRanks(students);

  useEffect(() => {
    if (rankedAllStudents.length > 0 && currentUser) {
      const userWithRank = rankedAllStudents.find(s =>
        s.userId === currentUser.userId || s.studentId === currentUser.studentId
      );
      if (userWithRank) {
        setCurrentUser(userWithRank);
      }
    }
  }, [students]);

  const getRankBadge = (rank) => {
    if (rank === 1) return 'bg-gradient-to-br from-[#EF9F27] to-[#F7B955] text-white shadow-lg shadow-[#EF9F27]/30';
    if (rank === 2) return 'bg-gradient-to-br from-[#7DB6F1] to-[#185FA5] text-white shadow-lg shadow-[#185FA5]/20';
    if (rank === 3) return 'bg-gradient-to-br from-[#46C89A] to-[#1D9E75] text-white shadow-lg shadow-[#1D9E75]/20';
    return 'bg-[#E6F1FB] text-[#185FA5] border border-[#185FA5]/15';
  };

  const getPodiumCardClasses = (rank, highlight) => {
    if (rank === 1) {
      return 'bg-gradient-to-b from-[#2D1C00] via-[#042C53] to-[#021C34] border-2 border-[#EF9F27]/60 shadow-2xl shadow-[#EF9F27]/20';
    }
    if (rank === 2) {
      return 'bg-gradient-to-b from-[#103B63] via-[#042C53] to-[#021C34] border border-[#7DB6F1]/35 shadow-xl shadow-[#185FA5]/20';
    }
    if (rank === 3) {
      return 'bg-gradient-to-b from-[#0E4D3A] via-[#042C53] to-[#021C34] border border-[#46C89A]/35 shadow-xl shadow-[#1D9E75]/20';
    }
    return highlight
      ? 'bg-gradient-to-b from-[#2D1C00] via-[#042C53] to-[#021C34] border-2 border-[#EF9F27]/60 shadow-2xl shadow-[#EF9F27]/20'
      : 'bg-gradient-to-b from-[#103B63] via-[#042C53] to-[#021C34] border border-white/10 shadow-xl';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E6F1FB] via-[#F8FBFF] to-[#E1F5EE] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🏆</div>
          <div className="text-xl font-bold text-[#042C53]">Loading Leaderboard...</div>
          <div className="text-sm text-[#185FA5] mt-2">Preparing the rankings</div>
        </div>
      </div>
    );
  }

  const top3 = rankedAllStudents.filter(s => s.rank <= 3);
  const allStudentsList = rankedStudents;

  const rank1Students = top3.filter(s => s.rank === 1);
  const rank2Students = top3.filter(s => s.rank === 2);
  const rank3Students = top3.filter(s => s.rank === 3);

  let podiumStudents = [];

  if (rank1Students.length === 1 && rank2Students.length >= 1 && rank3Students.length >= 1) {
    podiumStudents = [
      { student: rank2Students[0], position: 'left', medal: '🥈', highlight: false },
      { student: rank1Students[0], position: 'center', medal: '🥇', highlight: true },
      { student: rank3Students[0], position: 'right', medal: '🥉', highlight: false }
    ];
  } else if (rank1Students.length === 2) {
    podiumStudents = [
      { student: rank1Students[0], position: 'left', medal: '🥇', highlight: true },
      { student: rank1Students[1], position: 'right', medal: '🥇', highlight: true },
      ...(rank3Students.length > 0 ? [{ student: rank3Students[0], position: 'hidden', medal: '🥉', highlight: false }] : [])
    ];
  } else if (rank1Students.length === 3) {
    podiumStudents = [
      { student: rank1Students[0], position: 'left', medal: '🥇', highlight: true },
      { student: rank1Students[1], position: 'center', medal: '🥇', highlight: true },
      { student: rank1Students[2], position: 'right', medal: '🥇', highlight: true }
    ];
  } else if (rank1Students.length > 3) {
    podiumStudents = [
      { student: rank1Students[0], position: 'left', medal: '🥇', highlight: true },
      { student: rank1Students[1], position: 'center', medal: '🥇', highlight: true },
      { student: rank1Students[2], position: 'right', medal: '🥇', highlight: true }
    ];
  } else if (rank1Students.length === 1 && rank2Students.length === 0) {
    podiumStudents = [
      { student: rank1Students[0], position: 'center', medal: '🥇', highlight: true }
    ];
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E6F1FB] via-[#F8FBFF] to-[#E1F5EE]">
      {/* Decorative background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-16 left-10 w-72 h-72 bg-[#185FA5]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-16 w-96 h-96 bg-[#EF9F27]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-10 left-1/3 w-80 h-80 bg-[#1D9E75]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <div className="relative z-10 bg-white/80 backdrop-blur-xl border-b border-[#185FA5]/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-[#E6F1FB] hover:bg-[#185FA5] hover:text-white border border-[#185FA5]/10 flex items-center justify-center text-[#185FA5] transition-all cursor-pointer shadow-sm"
            >
              ←
            </button>
            <div>
              <h1 className="text-2xl font-extrabold text-[#042C53]">🏆 Leaderboard</h1>
              <p className="text-sm text-[#185FA5]">Top performers</p>
            </div>
          </div>

          <button
            onClick={() => navigate('/profile')}
            className="px-5 py-2.5 bg-gradient-to-r from-[#185FA5] to-[#2578C9] hover:scale-105 rounded-xl text-white text-sm font-semibold transition-all cursor-pointer shadow-lg shadow-[#185FA5]/20"
          >
            My Profile
          </button>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">

        {/* Current User Rank Card */}
        {currentUser && (
          <div className="mb-8 bg-white/80 backdrop-blur-xl border border-[#EF9F27]/20 rounded-3xl p-6 shadow-xl shadow-[#042C53]/5">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#EF9F27] to-[#F7B955] flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-[#EF9F27]/30">
                  {currentUser.rank}
                </div>
                <div>
                  <div className="text-[#185FA5] text-sm font-medium">Your Rank</div>
                  <div className="text-[#042C53] text-2xl font-extrabold">{currentUser.studentName}</div>
                  <div className="text-[#EF9F27] text-sm font-semibold">@{currentUser.username}</div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-[#185FA5] text-sm font-medium">Total Points</div>
                <div className="text-4xl font-extrabold text-[#EF9F27]">{currentUser.totalPoints?.toLocaleString()}</div>
                <div className="text-[#1D9E75] text-sm mt-1 font-semibold">Level: {currentUser.currentLevel || 'N/A'}</div>
              </div>
            </div>
          </div>
        )}

        {/* Top 3 Podium */}
        {podiumStudents.length > 0 && (
          <div className="mb-12">
            <div className={`grid gap-6 items-end ${
              podiumStudents.length === 1 ? 'grid-cols-1 max-w-md mx-auto' :
              podiumStudents.length === 2 ? 'grid-cols-2 max-w-4xl mx-auto' :
              'grid-cols-3'
            }`}>
              {podiumStudents.map((podium) => (
                <div
                  key={podium.student.userId || podium.student.studentId}
                  className={`rounded-3xl text-center transform hover:-translate-y-2 transition-all duration-300 ${
                    getPodiumCardClasses(podium.student.rank, podium.highlight)
                  } ${
                    podium.highlight && podiumStudents.filter(p => p.highlight).length === 1 ? 'p-8 scale-105' : 'p-6'
                  }`}
                >
                  <div className={`text-6xl mb-3 ${podium.highlight ? 'animate-bounce' : ''}`}>
                    {podium.medal}
                  </div>

                  <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center text-2xl font-bold text-white mb-4 shadow-xl ${
                    podium.student.rank === 1
                      ? 'bg-gradient-to-br from-[#EF9F27] to-[#F7B955] ring-4 ring-[#EF9F27]/20'
                      : podium.student.rank === 2
                        ? 'bg-gradient-to-br from-[#7DB6F1] to-[#185FA5]'
                        : 'bg-gradient-to-br from-[#46C89A] to-[#1D9E75]'
                  }`}>
                    {podium.student.rank}
                  </div>

                  <div className={`font-bold mb-1 ${
                    podium.highlight ? 'text-white text-2xl' : 'text-white text-lg'
                  }`}>
                    {podium.student.studentName}
                  </div>

                  <div className={`text-sm mb-3 font-medium ${
                    podium.student.rank === 1 ? 'text-[#F7B955]' :
                    podium.student.rank === 2 ? 'text-[#9ED0FF]' : 'text-[#7EE2BC]'
                  }`}>
                    @{podium.student.username}
                  </div>

                  <div className={`font-extrabold ${
                    podium.student.rank === 1 ? 'text-4xl text-[#EF9F27]' :
                    podium.student.rank === 2 ? 'text-3xl text-[#9ED0FF]' : 'text-3xl text-[#7EE2BC]'
                  }`}>
                    {podium.student.totalPoints?.toLocaleString()}
                  </div>
                  <div className="text-white/55 text-xs mt-1">points</div>

                  <div className={`mt-4 inline-block px-4 py-1.5 rounded-full text-xs font-bold ${
                    podium.student.rank === 1
                      ? 'bg-[#EF9F27]/15 text-[#F7B955] border border-[#EF9F27]/25'
                      : podium.student.rank === 2
                        ? 'bg-[#7DB6F1]/10 text-[#9ED0FF] border border-[#7DB6F1]/20'
                        : 'bg-[#46C89A]/10 text-[#7EE2BC] border border-[#46C89A]/20'
                  }`}>
                    {podium.student.currentLevel || 'N/A'}
                  </div>
                </div>
              ))}
            </div>

            {rank1Students.length > 1 && (
              <div className="mt-6 text-center">
                <div className="inline-block px-5 py-2.5 bg-[#FFF4DD] border border-[#EF9F27]/30 rounded-xl shadow-sm">
                  <span className="text-[#C97900] font-bold">🏆 {rank1Students.length} students tied for 1st place!</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <input
            className="w-full px-6 py-4 bg-white/80 backdrop-blur-md border border-[#185FA5]/10 rounded-2xl text-[#042C53] placeholder-[#7A8CA5] focus:outline-none focus:border-[#185FA5] focus:ring-4 focus:ring-[#185FA5]/10 text-lg shadow-sm"
            placeholder="🔍 Search students..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Leaderboard List */}
        <div className="bg-white/80 backdrop-blur-xl border border-[#185FA5]/10 rounded-3xl overflow-hidden shadow-xl shadow-[#042C53]/5">
          <div className="px-6 py-5 border-b border-[#185FA5]/10 bg-gradient-to-r from-[#F8FBFF] to-[#F4FCF8]">
            <h2 className="text-lg font-extrabold text-[#042C53]">All Students ({filtered.length})</h2>
          </div>

          {allStudentsList.length === 0 ? (
            <div className="p-12 text-center text-[#7A8CA5] font-medium">
              No students found
            </div>
          ) : (
            <div className="divide-y divide-[#185FA5]/8">
              {allStudentsList.map((s) => {
                const isCurrentUser = currentUser && (currentUser.userId === s.userId || currentUser.studentId === s.studentId);

                return (
                  <div
                    key={s.userId || s.studentId}
                    className={`px-6 py-4 flex items-center gap-4 transition-all duration-200 hover:bg-[#F8FBFF] ${
                      isCurrentUser ? 'bg-[#FFF8EA] border-l-4 border-[#EF9F27]' : ''
                    }`}
                  >
                    {/* Rank */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${getRankBadge(s.rank)}`}>
                      {s.rank <= 3 ? (s.rank === 1 ? '🥇' : s.rank === 2 ? '🥈' : '🥉') : s.rank}
                    </div>

                    {/* Student Info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-[#042C53] font-bold text-lg truncate">
                        {s.studentName}
                        {isCurrentUser && (
                          <span className="ml-2 text-xs bg-[#FFF0D3] text-[#C97900] px-2 py-0.5 rounded-full font-bold">
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-[#185FA5] text-sm">@{s.username}</div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6">
                      <div className="text-right hidden sm:block">
                        <div className="text-[#7A8CA5] text-xs">Level</div>
                        <div className="text-[#1D9E75] font-bold">{s.currentLevel || 'N/A'}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[#7A8CA5] text-xs">Badges</div>
                        <div className="text-[#185FA5] font-bold">{s.badgesCount || 0}</div>
                      </div>
                      <div className="text-right min-w-[100px]">
                        <div className="text-[#7A8CA5] text-xs">Points</div>
                        <div className="text-2xl font-extrabold text-[#EF9F27]">{s.totalPoints?.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-[#7A8CA5] text-sm">
          <p>Points are calculated from quizzes, true/false questions, daily logins, and activities</p>
        </div>
      </div>
    </div>
  );
}