// routes/analytics.js
import express from 'express';
import { GameScore as Score } from '../models/dilshara-GameScore.js';
import Game from '../models/dilshara-Game.js';
import authMiddleware from '../middleware/amasha-verifyJWT.js';

const router = express.Router();
// ── 1. Summary stats (aggregated, no big list) ──
router.get('/summary', authMiddleware, async (req, res) => {
  const [
    totalPlays,
    passCount,
    avgArr,
    topGamesRaw,
    topTopicsRaw,
    byDiffRaw,
    strugglingRaw,
    uniquePlayersRaw
  ] = await Promise.all([
    Score.countDocuments(),
    Score.countDocuments({ passed: true }),
    Score.aggregate([{ $group: { _id: null, avg: { $avg: '$percentage' } } }]),
    Score.aggregate([
      { $group: { _id: '$gameId', plays: { $sum: 1 } } },
      { $sort: { plays: -1 } }, { $limit: 5 }
    ]),
    Score.aggregate([
      { $group: { _id: '$topicId', plays: { $sum: 1 } } },
      { $sort: { plays: -1 } }
    ]),
    Score.aggregate([
      { $group: { _id: '$difficulty', plays: { $sum: 1 } } }
    ]),
    // games where fail rate > 40%
    Score.aggregate([
      { $group: {
          _id: '$gameId',
          total: { $sum: 1 },
          failed: { $sum: { $cond: [{ $eq: ['$passed', false] }, 1, 0] } }
      }},
      { $project: { failRate: { $multiply: [{ $divide: ['$failed', '$total'] }, 100] } } },
      { $match: { failRate: { $gt: 40 } } },
      { $sort: { failRate: -1 } }, { $limit: 5 }
    ]),
    Score.distinct('userId')
  ]);

  // enrich top games with titles
  const gameIds  = topGamesRaw.map(g => g._id);
  const games    = await Game.find({ _id: { $in: gameIds } }, 'title subType');
  const gameMap  = Object.fromEntries(games.map(g => [g._id.toString(), g]));

  const topGames = topGamesRaw.map(g => ({
    title:   gameMap[g._id]?.title   || g._id,
    subType: gameMap[g._id]?.subType || 'quiz',
    plays:   g.plays
  }));

  // enrich struggling with titles
  const sGameIds   = strugglingRaw.map(g => g._id);
  const sGames     = await Game.find({ _id: { $in: sGameIds } }, 'title');
  const sGameMap   = Object.fromEntries(sGames.map(g => [g._id.toString(), g]));
  const struggling = strugglingRaw.map(g => ({
    title:    sGameMap[g._id]?.title || g._id,
    failRate: Math.round(g.failRate)
  }));

  const diffMap = { easy: 0, medium: 0, hard: 0 };
  byDiffRaw.forEach(d => { if (diffMap[d._id] !== undefined) diffMap[d._id] = d.plays; });

  res.json({
    totalPlays,
    uniquePlayers: uniquePlayersRaw.length,
    avgScore:      Math.round(avgArr[0]?.avg || 0),
    passRate:      Math.round((passCount / (totalPlays || 1)) * 100),
    topGames,
    topTopics:     topTopicsRaw.map(t => ({ topicId: t._id, plays: t.plays })),
    byDifficulty:  diffMap,
    struggling
  });
});

// ── 2. Recent activity feed ──
router.get('/recent-activity', authMiddleware, async (req, res) => {
  const limit  = Math.min(parseInt(req.query.limit) || 10, 50);
  const scores = await Score.find()
    .sort({ playedAt: -1 })
    .limit(limit)
    .lean();

  const gameIds = [...new Set(scores.map(s => s.gameId))];
  const games   = await Game.find({ _id: { $in: gameIds } }, 'title subType');
  const gameMap = Object.fromEntries(games.map(g => [g._id.toString(), g]));

  const activity = scores.map(s => ({
    userId:     s.userId,
    gameTitle:  gameMap[s.gameId]?.title   || 'Unknown Game',
    subType:    gameMap[s.gameId]?.subType || 'quiz',
    topicId:    s.topicId,
    difficulty: s.difficulty,
    percentage: s.percentage,
    passed:     s.passed,
    playedAt:   s.playedAt
  }));

  res.json({ activity });
});

export default router;