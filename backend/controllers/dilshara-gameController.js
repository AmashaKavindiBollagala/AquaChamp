import Game      from '../models/dilshara-Game.js';
import { GameScore, TopicCompletion } from '../models/dilshara-GameScore.js';
import asyncHandler from 'express-async-handler';
import axios from 'axios';
import Topic from '../models/kaveesha-topicModel.js';

// ─── Topic ID → display name map ──────────────────────────────────────────────
const TOPIC_MAP = {
  'safe-drinking-water':                      'Safe Drinking Water',
  'hand-washing-and-personal-hygiene':        'Handwashing and Personal Hygiene',
  'toilet-and-sanpracticesitation-practices': 'Toilet and Sanitation Practices',
  'water-borne-diseases-and-prevention':      'Water-Borne Diseases and Prevention',
  'water-conservation-and-environment-care':  'Water Conservation and Environmental Care',
};

// ─── CREATE GAME ──────────────────────────────────────────────────────────────
export const createGame = asyncHandler(async (req, res) => {
  const {
    title, description, topicId, lessonTopic,
    ageGroup, difficulty, questions,
    pointsPerQuestion, timeLimit, passMark,
    gameType, subType, createdBy,
  } = req.body;

  const resolvedTopic = TOPIC_MAP[topicId];
  if (!resolvedTopic) return res.status(400).json({ message: 'Valid topic is required' });
  if (!title?.trim()) return res.status(400).json({ message: 'Title is required' });

  const resolvedSubType = subType || 'quiz';
  const NON_QUIZ_TYPES  = ['germcatcher', 'waterdrop', 'memory', 'cleanordirty', 'cleandirtygame'];
  const isNonQuiz       = NON_QUIZ_TYPES.includes(resolvedSubType);

  if (!isNonQuiz) {
    if (!questions || questions.length === 0) {
      return res.status(400).json({ message: 'At least one question is required' });
    }
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText?.trim())
        return res.status(400).json({ message: `Question ${i + 1}: text is required` });
      if ((q.options || []).filter(Boolean).length < 4)
        return res.status(400).json({ message: `Question ${i + 1}: must have 4 options` });
      if (!q.correctAnswer?.trim())
        return res.status(400).json({ message: `Question ${i + 1}: correct answer is required` });
    }
  }

  const game = await Game.create({
    title:             title.trim(),
    description:       description?.trim() || '',
    gameType:          gameType || 'quiz',
    subType:           resolvedSubType,
    lessonTopic:       resolvedTopic,
    topicId:           topicId || '',
    ageGroup:          ageGroup || '5-10',
    difficulty:        difficulty || 'easy',
    questions:         isNonQuiz ? [] : (questions || []),
    pointsPerQuestion: pointsPerQuestion || 10,
    timeLimit:         timeLimit || 30,
    passMark:          passMark || 60,
    active:            true,
    createdBy:         createdBy || req.user || 'admin',
  });

  res.status(201).json({ message: 'Game created successfully', game });
});

// ─── GET ALL GAMES ────────────────────────────────────────────────────────────
// Flexible matching: searches by topicId AND lessonTopic so DB records with
// mismatched fields are still found correctly.
// Also handles MongoDB ObjectId as topicId by looking up the topic first.
export const getAllGames = asyncHandler(async (req, res) => {
  const { topicId, ageGroup, difficulty, gameType, subType } = req.query;
  
  console.log('🎮 getAllGames called with:', { topicId, ageGroup, difficulty, gameType, subType });
  
  const filter = { active: true };

  if (topicId) {
    // Check if topicId is a MongoDB ObjectId (24 char hex string)
    const isObjectId = /^[a-f\d]{24}$/i.test(topicId);
    
    let labelForId = TOPIC_MAP[topicId];
    console.log('🎮 topicId:', topicId, 'isObjectId:', isObjectId, 'labelForId:', labelForId);
    
    // If it's an ObjectId and not in TOPIC_MAP, try to look up the topic
    if (isObjectId && !labelForId) {
      try {
        const topic = await Topic.findById(topicId);
        console.log('🎮 Found topic:', topic?.title);
        if (topic?.title) {
          // Extract the topic name from title like "💧 1. Safe Drinking Water"
          const topicName = topic.title
            .replace(/[^a-zA-Z0-9\s]/g, '')
            .replace(/^\d+\s*/, '')
            .trim();
          
          console.log('🎮 Extracted topicName:', topicName);
          
          // Find the matching key in TOPIC_MAP
          const norm = (str = '') =>
            str.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
          
          for (const [key, label] of Object.entries(TOPIC_MAP)) {
            if (norm(label) === norm(topicName)) {
              labelForId = label;
              console.log('🎮 Matched to labelForId:', labelForId);
              break;
            }
          }
        }
      } catch (e) {
        console.error('Error looking up topic:', e.message);
      }
    }

    // Normalise: strip punctuation, lowercase, collapse spaces
    const norm = (str = '') =>
      str.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();

    const normTarget = norm(labelForId || topicId);
    console.log('🎮 normTarget:', normTarget);

    // Every topicId whose label normalises to the same string
    const relatedIds = Object.entries(TOPIC_MAP)
      .filter(([, label]) => norm(label) === normTarget)
      .map(([id]) => id);

    // Every lessonTopic label that corresponds to a related topicId
    const relatedLabels = relatedIds.map(id => TOPIC_MAP[id]).filter(Boolean);
    
    console.log('🎮 relatedIds:', relatedIds);
    console.log('🎮 relatedLabels:', relatedLabels);

    // Build flexible $or query that also matches partial strings
    // This handles cases where topicId might be stored differently
    const topicIdQueries = [
      { topicId: { $in: [...new Set([topicId, ...relatedIds])] } },
      // Also try matching by ObjectId if the topicId looks like it could be one
      ...(isObjectId ? [{ topicId: topicId }] : []),
    ];
    
    // Add lessonTopic matching
    const lessonTopicQueries = relatedLabels.length 
      ? [{ lessonTopic: { $in: relatedLabels } }]
      : [];
    
    // Also try to match lessonTopic with normalized strings
    const normalizedQueries = [];
    for (const label of relatedLabels) {
      normalizedQueries.push({ lessonTopic: { $regex: label, $options: 'i' } });
      // Also match partial: "Safe Drinking Water" matches "Safe Drinking" etc.
      const words = label.split(' ');
      if (words.length > 1) {
        normalizedQueries.push({ lessonTopic: { $regex: words.slice(0, 2).join(' '), $options: 'i' } });
      }
    }

    filter.$or = [
      ...topicIdQueries,
      ...lessonTopicQueries,
      ...normalizedQueries,
    ];
    
    console.log('🎮 filter.$or:', JSON.stringify(filter.$or, null, 2));
  }

  if (ageGroup)   filter.ageGroup   = ageGroup;
  if (difficulty) filter.difficulty = difficulty;
  if (gameType)   filter.gameType   = gameType;
  if (subType)    filter.subType    = subType;

  console.log('🎮 Final filter:', JSON.stringify(filter, null, 2));

  let games = await Game.find(filter).sort({ createdAt: -1 });
  
  // If no games found with topicId filter, try a broader search
  if (games.length === 0 && topicId && ageGroup) {
    console.log('🎮 No games found, trying broader search without topicId...');
    const broaderFilter = { active: true, ageGroup };
    if (difficulty) broaderFilter.difficulty = difficulty;
    games = await Game.find(broaderFilter).sort({ createdAt: -1 });
    console.log('🎮 Broader search found:', games.length, 'games');
  }
  
  console.log('🎮 Found games:', games.length);
  res.status(200).json({ count: games.length, games });
});

// ─── GET SINGLE GAME ──────────────────────────────────────────────────────────
export const getGameById = asyncHandler(async (req, res) => {
  const game = await Game.findById(req.params.id);
  if (!game) return res.status(404).json({ message: 'Game not found' });
  res.status(200).json(game);
});

// ─── UPDATE GAME ──────────────────────────────────────────────────────────────
export const updateGame = asyncHandler(async (req, res) => {
  const game = await Game.findById(req.params.id);
  if (!game) return res.status(404).json({ message: 'Game not found' });

  const fields = [
    'title','description','topicId','ageGroup',
    'difficulty','questions','pointsPerQuestion','timeLimit',
    'passMark','gameType','subType','active',
  ];
  fields.forEach(f => { if (req.body[f] !== undefined) game[f] = req.body[f]; });

  // Always resolve lessonTopic from TOPIC_MAP so it matches the enum
  if (req.body.topicId && TOPIC_MAP[req.body.topicId]) {
    game.lessonTopic = TOPIC_MAP[req.body.topicId];
  }

  await game.save();
  res.status(200).json({ message: 'Game updated successfully', game });
});

// ─── DELETE GAME ──────────────────────────────────────────────────────────────
export const deleteGame = asyncHandler(async (req, res) => {
  const game = await Game.findById(req.params.id);
  if (!game) return res.status(404).json({ message: 'Game not found' });

  await GameScore.deleteMany({ gameId: req.params.id });
  await game.deleteOne();
  res.status(200).json({ message: 'Game and all related scores deleted' });
});

// ─── GENERATE QUESTIONS ───────────────────────────────────────────────────────
export const generateQuestions = asyncHandler(async (req, res) => {
  const { category = 17, difficulty = 'easy', amount = 5 } = req.query;
  const url = `https://opentdb.com/api.php?amount=${amount}&category=${category}&difficulty=${difficulty}&type=multiple`;

  try {
    const response = await axios.get(url);
    const results  = response.data.results;
    if (!results || results.length === 0)
      return res.status(502).json({ message: 'Open Trivia API returned no questions.' });

    const questions = results.map(q => {
      const options = [...q.incorrect_answers, q.correct_answer].sort(() => Math.random() - 0.5);
      return {
        questionText:  decodeHtmlEntities(q.question),
        options:       options.map(decodeHtmlEntities),
        correctAnswer: decodeHtmlEntities(q.correct_answer),
        hint: '',
      };
    });

    res.status(200).json({ count: questions.length, questions });
  } catch (err) {
    console.error('Open Trivia error:', err.message);
    res.status(502).json({ message: 'Failed to fetch from Open Trivia API' });
  }
});

// ─── SUBMIT GAME SCORE ────────────────────────────────────────────────────────
export const submitGameScore = asyncHandler(async (req, res) => {
  const { score, userId } = req.body;

  if (score === undefined || score === null)
    return res.status(400).json({ message: 'Score is required' });

  const game = await Game.findById(req.params.id);
  if (!game)        return res.status(404).json({ message: 'Game not found' });
  if (!game.active) return res.status(400).json({ message: 'This game is inactive' });

  // Calculate maxScore correctly per game type
  const NON_QUIZ = ['germcatcher', 'waterdrop', 'memory'];
  const maxScore = NON_QUIZ.includes(game.subType)
    ? 100
    : (game.questions.length * (game.pointsPerQuestion || 10)) || 100;

  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  const passed     = percentage >= (game.passMark || 60);

  const gameScore = await GameScore.create({
    gameId:     game._id,
    userId:     userId || req.user,
    score,
    maxScore,
    percentage,
    passed,
    topicId:    game.topicId    || '',
    difficulty: game.difficulty || 'easy',
    playedAt:   new Date(),
  });

  // FIX: use req.body.topicId first, fall back to game.topicId
  // (previously used undefined variable `topicId` which caused a crash)
  const resolvedTopicId = req.body.topicId || game.topicId;

  const allScores = await GameScore.find({ userId, topicId: resolvedTopicId });

  const easyPassed   = allScores.some(s => s.difficulty === 'easy'   && s.passed);
  const mediumPassed = allScores.some(s => s.difficulty === 'medium' && s.passed);
  const hardPassed   = allScores.some(s => s.difficulty === 'hard'   && s.passed);
  const allGamesDone = easyPassed && mediumPassed && hardPassed;

  if (allGamesDone) {
    await TopicCompletion.findOneAndUpdate(
      { userId, topicId: resolvedTopicId },
      {
        userId,
        topicId:              resolvedTopicId,
        topicLabel:           game.lessonTopic,
        ageGroup:             game.ageGroup,
        easyPassed,
        mediumPassed,
        hardPassed,
        lessonsCompleted:     true,
        completionPercentage: 100,
        completedAt:          new Date(),
        badgeIssued:          false,
      },
      { upsert: true, new: true }
    );
  }

  res.status(201).json({
    message: 'Score submitted successfully',
    result: {
      game:       game.title,
      score:      gameScore.score,
      maxScore:   gameScore.maxScore,
      percentage: gameScore.percentage,
      passed:     gameScore.passed,
      topicId:    gameScore.topicId,
      difficulty: gameScore.difficulty,
    },
  });
});

// ─── GET SCORES FOR A GAME ────────────────────────────────────────────────────
export const getScoresByGame = asyncHandler(async (req, res) => {
  const game = await Game.findById(req.params.id);
  if (!game) return res.status(404).json({ message: 'Game not found' });

  const scores = await GameScore.find({ gameId: req.params.id }).sort({ createdAt: -1 });
  res.status(200).json({ game: game.title, count: scores.length, scores });
});

// ─── GET MY SCORES ────────────────────────────────────────────────────────────
export const getMyGameScores = asyncHandler(async (req, res) => {
  const scores = await GameScore
    .find({ userId: req.user })
    .populate('gameId', 'title lessonTopic difficulty subType')
    .sort({ createdAt: -1 });

  res.status(200).json({ userId: req.user, count: scores.length, scores });
});

// ─── GET SCORES BY USER ID ────────────────────────────────────────────────────
export const getScoresByUserId = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const scores = await GameScore
    .find({ userId })
    .populate('gameId', 'title lessonTopic difficulty subType maxScore')
    .sort({ createdAt: -1 });

  if (scores.length === 0)
    return res.status(404).json({ message: `No scores found for user: ${userId}` });

  res.status(200).json({ userId, totalGamesPlayed: scores.length, scores });
});

// ─── GET TOPIC PROGRESS FOR A USER ───────────────────────────────────────────
// GET /api/games/progress/:topicId?userId=xxx
export const getTopicProgress = asyncHandler(async (req, res) => {
  const { topicId } = req.params;
  const userId      = req.query.userId || req.user;

  console.log('🎮 getTopicProgress called with topicId:', topicId, 'userId:', userId);

  // Build a list of possible topicIds to search for
  // This handles the case where the topicId in URL doesn't match what's stored in GameScore
  const possibleTopicIds = [topicId];
  
  // Add related IDs from TOPIC_MAP
  const label = TOPIC_MAP[topicId];
  if (label) {
    // Find all keys in TOPIC_MAP that have the same normalized label
    const norm = (str = '') =>
      str.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
    const normLabel = norm(label);
    
    for (const [key, val] of Object.entries(TOPIC_MAP)) {
      if (norm(val) === normLabel && !possibleTopicIds.includes(key)) {
        possibleTopicIds.push(key);
      }
    }
    
    // Also add the label itself (lessonTopic)
    possibleTopicIds.push(label);
  }
  
  // Also check if topicId is a MongoDB ObjectId and look up related games
  const isObjectId = /^[a-f\d]{24}$/i.test(topicId);
  if (isObjectId) {
    try {
      const topic = await Topic.findById(topicId);
      if (topic?.title) {
        const topicName = topic.title
          .replace(/[^a-zA-Z0-9\s]/g, '')
          .replace(/^\d+\s*/, '')
          .trim();
        
        const norm = (str = '') =>
          str.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
        
        for (const [key, val] of Object.entries(TOPIC_MAP)) {
          if (norm(val) === norm(topicName) && !possibleTopicIds.includes(key)) {
            possibleTopicIds.push(key);
            possibleTopicIds.push(val);
          }
        }
      }
    } catch (e) {
      console.error('Error looking up topic for progress:', e.message);
    }
  }
  
  console.log('🎮 Searching for scores with topicIds:', possibleTopicIds);

  // Search for passed scores matching any of the possible topicIds
  const passedScores = await GameScore.find({
    userId,
    $or: [
      { topicId: { $in: possibleTopicIds } },
      // Also search by gameId and lookup the game's lessonTopic
    ],
    passed: true
  });
  
  // Also search by games that have matching lessonTopic
  const games = await Game.find({
    $or: [
      { topicId: { $in: possibleTopicIds } },
      { lessonTopic: { $in: possibleTopicIds.filter(id => TOPIC_MAP[id] || id.includes(' ')) } },
    ],
    active: true
  });
  
  const gameIds = games.map(g => g._id);
  const additionalScores = await GameScore.find({
    userId,
    gameId: { $in: gameIds },
    passed: true
  });
  
  const allPassedScores = [...passedScores, ...additionalScores];
  const passedDifficulties = [...new Set(allPassedScores.map(s => s.difficulty))];

  console.log('🎮 Found passed difficulties:', passedDifficulties);

  res.status(200).json({
    userId,
    topicId,
    passedDifficulties,
    easyDone:   passedDifficulties.includes('easy'),
    mediumDone: passedDifficulties.includes('medium'),
    hardDone:   passedDifficulties.includes('hard'),
    allDone:    ['easy','medium','hard'].every(d => passedDifficulties.includes(d)),
  });
});

// ─── DELETE A SCORE ───────────────────────────────────────────────────────────
export const deleteGameScore = asyncHandler(async (req, res) => {
  const score = await GameScore.findById(req.params.scoreId);
  if (!score) return res.status(404).json({ message: 'Score not found' });
  await score.deleteOne();
  res.status(200).json({ message: 'Score deleted' });
});

// ─── GET TOPIC COMPLETIONS ────────────────────────────────────────────────────
// GET /api/games/completions — Progress Manager reads this
export const getTopicCompletions = async (req, res) => {
  try {
    const filter = { completionPercentage: 100 };
    if (req.query.badgeIssued !== undefined)
      filter.badgeIssued = req.query.badgeIssued === 'true';
    if (req.query.userId)
      filter.userId = req.query.userId;
    if (req.query.topicId)
      filter.topicId = req.query.topicId;

    const completions = await TopicCompletion.find(filter).sort({ completedAt: -1 });
    res.json(completions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── MARK BADGE ISSUED ────────────────────────────────────────────────────────
// PATCH /api/games/completions/:id/badge — Progress Manager marks badge issued
export const markBadgeIssued = async (req, res) => {
  try {
    const updated = await TopicCompletion.findByIdAndUpdate(
      req.params.id,
      { badgeIssued: true },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Record not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── HTML entity decoder ──────────────────────────────────────────────────────
function decodeHtmlEntities(str) {
  return str
    .replace(/&amp;/g,    '&')
    .replace(/&lt;/g,     '<')
    .replace(/&gt;/g,     '>')
    .replace(/&quot;/g,   '"')
    .replace(/&#039;/g,   "'")
    .replace(/&ldquo;/g,  '"')
    .replace(/&rdquo;/g,  '"')
    .replace(/&hellip;/g, '...');
}