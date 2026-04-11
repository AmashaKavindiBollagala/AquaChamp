import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PublicLeaderboard() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('aquachamp_token') || 
                  localStorage.getItem('token') || 
                  sessionStorage.getItem('aquachamp_token');
    
    if (!token) {
      console.log('⚠️ No authentication token found');
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    const fetchLeaderboard = async () => {
      try {
        let res;
        try {
          res = await fetch('http://localhost:4000/api/points/leaderboard', {
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
          });
        } catch {
          res = await fetch('http://localhost:4000/api/progress/leaderboard?limit=100', {
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
          });
        }

        // If unauthorized (401), show auth required message
        if (res.status === 401 || res.status === 403) {
          console.log('⚠️ Authentication failed');
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        const data = await res.json();
        if (data.success) {
          const list = data.students || data.leaderboard || [];
          const sorted = list.sort((a, b) => b.totalPoints - a.totalPoints);
          setStudents(sorted);
          const userId = localStorage.getItem('userId');
          if (userId) {
            const user = sorted.find(s => s.userId === userId || s.studentId === userId);
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
  }, [navigate]);

  const calculateRanks = (list) => {
    if (!list.length) return [];
    let currentRank = 1;
    return list.map((s, i) => {
      if (i > 0 && s.totalPoints < list[i - 1].totalPoints) currentRank = i + 1;
      return { ...s, rank: currentRank };
    });
  };

  const filtered = students.filter(s =>
    s.studentName?.toLowerCase().includes(search.toLowerCase()) ||
    s.username?.toLowerCase().includes(search.toLowerCase())
  );

  const rankedAll = calculateRanks(students);
  const rankedFiltered = calculateRanks(filtered);

  useEffect(() => {
    if (rankedAll.length > 0 && currentUser) {
      const found = rankedAll.find(s => s.userId === currentUser.userId || s.studentId === currentUser.studentId);
      if (found) setCurrentUser(found);
    }
  }, [students]);

  const top3 = rankedAll.filter(s => s.rank <= 3);
  const rank1 = top3.filter(s => s.rank === 1);
  const rank2 = top3.filter(s => s.rank === 2);
  const rank3 = top3.filter(s => s.rank === 3);

  let podium = [];
  if (rank1.length === 1) {
    if (rank2.length > 0 && rank3.length > 0) {
      podium = [
        { student: rank2[0], medal: '🥈', tier: 'silver' },
        { student: rank1[0], medal: '🥇', tier: 'gold' },
        { student: rank3[0], medal: '🥉', tier: 'bronze' },
      ];
    } else if (rank2.length > 0) {
      podium = [
        { student: rank2[0], medal: '🥈', tier: 'silver' },
        { student: rank1[0], medal: '🥇', tier: 'gold' },
      ];
    } else {
      podium = [{ student: rank1[0], medal: '🥇', tier: 'gold' }];
    }
  } else if (rank1.length === 2) {
    podium = [
      { student: rank1[0], medal: '🥇', tier: 'gold' },
      { student: rank1[1], medal: '🥇', tier: 'gold' },
    ];
  } else if (rank1.length >= 3) {
    podium = rank1.slice(0, 3).map(s => ({ student: s, medal: '🥇', tier: 'gold' }));
  }

  const tierStyles = {
    gold: {
      card: 'bg-amber-50 border-2 border-amber-400 scale-105 shadow-lg shadow-amber-100',
      circle: 'bg-amber-400 text-amber-900',
      name: 'text-amber-900',
      handle: 'text-amber-600',
      pts: 'text-amber-800',
      ptsLabel: 'text-amber-500',
      badge: 'bg-amber-400 text-amber-900',
    },
    silver: {
      card: 'bg-blue-50 border border-blue-300 shadow-md shadow-blue-50',
      circle: 'bg-blue-500 text-blue-50',
      name: 'text-blue-900',
      handle: 'text-blue-500',
      pts: 'text-blue-800',
      ptsLabel: 'text-blue-400',
      badge: 'bg-blue-500 text-blue-50',
    },
    bronze: {
      card: 'bg-teal-50 border border-teal-300 shadow-md shadow-teal-50',
      circle: 'bg-teal-500 text-teal-50',
      name: 'text-teal-900',
      handle: 'text-teal-600',
      pts: 'text-teal-800',
      ptsLabel: 'text-teal-400',
      badge: 'bg-teal-500 text-teal-50',
    },
  };

  const getRankBadgeStyle = (rank) => {
    if (rank === 1) return 'bg-amber-50 text-amber-800 border border-amber-400';
    if (rank === 2) return 'bg-blue-50 text-blue-800 border border-blue-300';
    if (rank === 3) return 'bg-teal-50 text-teal-800 border border-teal-300';
    return 'bg-gray-100 text-gray-500 border border-gray-200';
  };

  const getPtsStyle = (rank) => {
    if (rank === 1) return 'text-amber-700';
    if (rank === 2) return 'text-blue-700';
    if (rank === 3) return 'text-teal-700';
    return 'text-green-700';
  };

  const getRowStyle = (rank, isYou) => {
    if (isYou) return 'bg-amber-50 border-l-2 border-amber-400';
    if (rank === 1) return 'bg-amber-50/40';
    if (rank === 2) return 'bg-blue-50/40';
    if (rank === 3) return 'bg-teal-50/40';
    return '';
  };

  // Show authentication required message
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
           style={{ background: "linear-gradient(160deg,#C8E6FA 0%,#B2EDD8 35%,#FEE9BF 70%,#C8E6FA 100%)" }}>
        <div className="text-center space-y-6 max-w-md mx-4">
          <div className="text-7xl animate-bounce">🔒</div>
          <div className="space-y-3">
            <h2 className="text-3xl font-bold text-gray-800">Login Required</h2>
            <p className="text-lg text-gray-600">
              You need to be logged in to view the leaderboard
            </p>
            <p className="text-sm text-gray-500">
              Please login as a student or admin to see the rankings
            </p>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-3 bg-gradient-to-r from-violet-600 to-sky-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            Go to Login →
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
           style={{ background: "linear-gradient(160deg,#C8E6FA 0%,#B2EDD8 35%,#FEE9BF 70%,#C8E6FA 100%)" }}>
        <div className="text-center space-y-3">
          <div className="text-5xl animate-bounce">🏆</div>
          <p className="text-lg font-semibold text-gray-700">Loading leaderboard...</p>
          <p className="text-sm text-gray-400">Preparing the rankings</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden"
         style={{ background: "linear-gradient(160deg,#C8E6FA 0%,#B2EDD8 35%,#FEE9BF 70%,#C8E6FA 100%)" }}>

      {/* Decorative blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#185FA5]/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-[28rem] h-[28rem] bg-[#1D9E75]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-[#EF9F27]/10 rounded-full blur-3xl" />
        <div className="absolute top-2/3 left-1/2 w-64 h-64 bg-[#4FC3F7]/15 rounded-full blur-2xl" />
      </div>

      {/* Header
      <div className="sticky top-0 z-20 bg-white/60 backdrop-blur-md border-b border-white/50 shadow-sm">
        <div className="max-w-3xl mx-auto px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-500 transition-colors cursor-pointer"
            >
              ←
            </button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 leading-tight">Leaderboard</h1>
              <p className="text-xs text-gray-400">Top performers</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/profile')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors cursor-pointer"
          >
            My Profile
          </button>
        </div>
      </div> */}

      <div className="relative z-10 max-w-3xl mx-auto px-5 py-6 space-y-6">

        {/* Current User Card */}
        {currentUser && (
          <div className="bg-white/70 backdrop-blur-sm border border-amber-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-amber-400 flex items-center justify-center text-amber-900 font-semibold text-base flex-shrink-0">
                  {currentUser.rank}
                </div>
                <div>
                  <p className="text-xs text-amber-500 font-medium">Your rank</p>
                  <p className="text-base font-semibold text-gray-900">{currentUser.studentName}</p>
                  <p className="text-xs text-amber-600">@{currentUser.username}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">Total points</p>
                <p className="text-2xl font-bold text-amber-600">{currentUser.totalPoints?.toLocaleString()}</p>
                <p className="text-xs text-teal-600 font-medium mt-0.5">Level: {currentUser.currentLevel || 'N/A'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Podium */}
        {podium.length > 0 && (
          <div>
            <div className={`grid gap-3 items-end ${
              podium.length === 1 ? 'grid-cols-1 max-w-xs mx-auto' :
              podium.length === 2 ? 'grid-cols-2 max-w-md mx-auto' :
              'grid-cols-3'
            }`}>
              {podium.map((p, i) => {
                const t = tierStyles[p.tier];
                const isCenter = podium.length === 3 && i === 1;
                return (
                  <div
                    key={p.student.userId || p.student.studentId}
                    className={`rounded-2xl text-center transition-transform hover:-translate-y-1 duration-200 ${t.card} ${isCenter ? 'py-7 px-3' : 'py-5 px-3'}`}
                  >
                    <div className={`text-3xl mb-2 ${isCenter ? 'animate-bounce' : ''}`}>{p.medal}</div>
                    <div className={`w-9 h-9 rounded-full mx-auto flex items-center justify-center text-sm font-semibold mb-3 ${t.circle}`}>
                      {p.student.rank}
                    </div>
                    <p className={`font-semibold text-sm leading-tight mb-0.5 truncate ${t.name}`}>{p.student.studentName}</p>
                    <p className={`text-xs mb-2 ${t.handle}`}>@{p.student.username}</p>
                    <p className={`font-bold ${isCenter ? 'text-xl' : 'text-lg'} ${t.pts}`}>{p.student.totalPoints?.toLocaleString()}</p>
                    <p className={`text-xs mb-2 ${t.ptsLabel}`}>points</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${t.badge}`}>
                      {p.student.currentLevel || 'N/A'}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Tie notices */}
            {rank1.length > 1 && (
              <p className="mt-4 text-center text-sm text-amber-700 font-medium bg-amber-50 border border-amber-200 rounded-xl py-2">
                🏆 {rank1.length} students tied for 1st place!
              </p>
            )}
            {rank2.length > 1 && (
              <p className="mt-2 text-center text-sm text-blue-700 font-medium bg-blue-50 border border-blue-200 rounded-xl py-2">
                🥈 {rank2.length} students tied for 2nd place!
              </p>
            )}
            {rank3.length > 1 && (
              <p className="mt-2 text-center text-sm text-teal-700 font-medium bg-teal-50 border border-teal-200 rounded-xl py-2">
                🥉 {rank3.length} students tied for 3rd place!
              </p>
            )}
          </div>
        )}

        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍  Search students..."
          className="w-full px-4 py-3 rounded-xl border border-white/60 bg-white/70 backdrop-blur-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-sm transition-all"
        />

        {/* Student List */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/60 overflow-hidden shadow-sm">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">All students</h2>
            <span className="text-xs text-gray-400">{rankedFiltered.length} students</span>
          </div>

          {rankedFiltered.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm">No students found</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {rankedFiltered.map((s) => {
                const isYou = currentUser && (currentUser.userId === s.userId || currentUser.studentId === s.studentId);
                return (
                  <div
                    key={s.userId || s.studentId}
                    className={`flex items-center gap-3 px-5 py-3 transition-colors hover:bg-gray-50 ${getRowStyle(s.rank, isYou)}`}
                  >
                    {/* Rank badge */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${getRankBadgeStyle(s.rank)}`}>
                      {s.rank <= 3
                        ? (s.rank === 1 ? '🥇' : s.rank === 2 ? '🥈' : '🥉')
                        : s.rank
                      }
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-gray-900 truncate">{s.studentName}</span>
                        {isYou && (
                          <span className="text-xs bg-amber-400 text-amber-900 px-2 py-0.5 rounded-full font-medium">
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">@{s.username}</p>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-5 flex-shrink-0">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs text-gray-400">Level</p>
                        <p className="text-xs font-medium text-teal-600">{s.currentLevel || 'N/A'}</p>
                      </div>
                      <div className="text-right hidden sm:block">
                        <p className="text-xs text-gray-400">Badges</p>
                        <p className="text-xs font-medium text-blue-600">{s.badgesCount || 0}</p>
                      </div>
                      <div className="text-right min-w-[72px]">
                        <p className="text-xs text-gray-400">Points</p>
                        <p className={`text-base font-bold ${getPtsStyle(s.rank)}`}>
                          {s.totalPoints?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 pb-4">
          Points are calculated from quizzes, true/false questions, daily logins, and activities
        </p>
      </div>
    </div>
  );
}
