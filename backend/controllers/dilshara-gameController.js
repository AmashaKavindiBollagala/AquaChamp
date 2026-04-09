import Game from '../models/dilshara-Game.js';
import GameScore from '../models/dilshara-GameScore.js';
import asyncHandler from 'express-async-handler';
import axios from 'axios';

// ─── Topic ID → display name map ──────────────────────────────────────────────
const TOPIC_MAP = {
  'safe-drinking-water':                     'Safe Drinking Water',
  'hand-washing-and-personal-hygiene':       'Handwashing and Personal Hygiene',
  'toilet-and-sanpracticesitation-practices':'Toilet and Sanitation Practices',
  'water-borne-diseases-and-prevention':     'Water-Borne Diseases and Prevention',
  'water-conservation-and-environment-care': 'Water Conservation and Environmental Care',
};

// ─── CREATE GAME ──────────────────────────────────────────────────────────────
export const createGame = asyncHandler(async (req, res) => {
  const {
    title, description, topicId, lessonTopic,
    ageGroup, difficulty, questions,
    pointsPerQuestion, timeLimit, passMark,
    gameType, subType, createdBy,
  } = req.body;

  const resolvedTopic = lessonTopic || TOPIC_MAP[topicId];
  if (!resolvedTopic) {
    return res.status(400).json({ message: 'Valid topic is required' });
  }
  if (!title?.trim()) {
    return res.status(400).json({ message: 'Title is required' });
  }

  // Memory match has NO questions — skip question validation for it
  const resolvedSubType = subType || 'quiz';
  const isMemoryGame = resolvedSubType === 'memory';

  if (!isMemoryGame) {
    if (!questions || questions.length === 0) {
      return res.status(400).json({ message: 'At least one question is required' });
    }
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText?.trim()) {
        return res.status(400).json({ message: `Question ${i + 1}: text is required` });
      }
      const validOptions = (q.options || []).filter(Boolean);
      if (validOptions.length < 4) {
        return res.status(400).json({ message: `Question ${i + 1}: must have 4 options` });
      }
      if (!q.correctAnswer?.trim()) {
        return res.status(400).json({ message: `Question ${i + 1}: correct answer is required` });
      }
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
    questions:         isMemoryGame ? [] : (questions || []),
    pointsPerQuestion: pointsPerQuestion || 10,
    timeLimit:         timeLimit || 30,
    passMark:          passMark || 60,
    active:            true,
    createdBy:         createdBy || req.user || 'admin',
  });

  res.status(201).json({ message: 'Game created successfully', game });
});

// ─── GET ALL GAMES (with optional filters) ────────────────────────────────────
export const getAllGames = asyncHandler(async (req, res) => {
  const { topicId, ageGroup, difficulty, gameType, subType } = req.query;
  const filter = { active: true };

  if (topicId)    filter.topicId    = topicId;
  if (ageGroup)   filter.ageGroup   = ageGroup;
  if (difficulty) filter.difficulty  = difficulty;
  if (gameType)   filter.gameType   = gameType;
  if (subType)    filter.subType    = subType;

  const games = await Game.find(filter).sort({ createdAt: -1 });
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
    'title', 'description', 'lessonTopic', 'topicId', 'ageGroup',
    'difficulty', 'questions', 'pointsPerQuestion', 'timeLimit',
    'passMark', 'gameType', 'subType', 'active',
  ];

  fields.forEach(f => {
    if (req.body[f] !== undefined) game[f] = req.body[f];
  });

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

// ─── GENERATE QUESTIONS FROM OPEN TRIVIA API ──────────────────────────────────
export const generateQuestions = asyncHandler(async (req, res) => {
  const { category = 17, difficulty = 'easy', amount = 5 } = req.query;

  const url = `https://opentdb.com/api.php?amount=${amount}&category=${category}&difficulty=${difficulty}&type=multiple`;

  try {
    const response = await axios.get(url);
    const results  = response.data.results;

    if (!results || results.length === 0) {
      return res.status(502).json({ message: 'Open Trivia API returned no questions. Try again.' });
    }

    const questions = results.map(q => {
      const options = [...q.incorrect_answers, q.correct_answer];
      for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
      }
      return {
        questionText:  decodeHtmlEntities(q.question),
        options:       options.map(decodeHtmlEntities),
        correctAnswer: decodeHtmlEntities(q.correct_answer),
        hint:          '',
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

  if (score === undefined || score === null) {
    return res.status(400).json({ message: 'Score is required' });
  }

  const game = await Game.findById(req.params.id);
  if (!game)        return res.status(404).json({ message: 'Game not found' });
  if (!game.active) return res.status(400).json({ message: 'This game is inactive' });

  // Memory match scores are percentage-based (0–100), others use totalPoints
  const maxScore   = game.subType === 'memory' ? 100 : (game.totalPoints || 100);
  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  const passed     = percentage >= (game.passMark || 60);

  const gameScore = await GameScore.create({
    gameId:     game._id,
    userId:     userId || req.user,
    score,
    maxScore,
    percentage,
    passed,
  });

  res.status(201).json({
    message: 'Score submitted successfully',
    result: {
      game:       game.title,
      score:      gameScore.score,
      maxScore:   gameScore.maxScore,
      percentage: gameScore.percentage,
      passed,
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
  const scores = await GameScore.find({ userId: req.user })
    .populate('gameId', 'title lessonTopic difficulty subType')
    .sort({ createdAt: -1 });

  res.status(200).json({ userId: req.user, count: scores.length, scores });
});

// ─── GET SCORES BY USER ID (Progress Manager) ─────────────────────────────────
export const getScoresByUserId = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const scores = await GameScore.find({ userId })
    .populate('gameId', 'title lessonTopic difficulty subType maxScore')
    .sort({ createdAt: -1 });

  if (scores.length === 0) {
    return res.status(404).json({ message: `No scores found for user: ${userId}` });
  }

  res.status(200).json({ userId, totalGamesPlayed: scores.length, scores });
});

// ─── DELETE A SCORE RECORD ────────────────────────────────────────────────────
export const deleteGameScore = asyncHandler(async (req, res) => {
  const score = await GameScore.findById(req.params.scoreId);
  if (!score) return res.status(404).json({ message: 'Score not found' });

  await score.deleteOne();
  res.status(200).json({ message: 'Score deleted' });
});

// ─── HTML entity decoder ──────────────────────────────────────────────────────
function decodeHtmlEntities(str) {
  return str
    .replace(/&amp;/g,   '&')
    .replace(/&lt;/g,    '<')
    .replace(/&gt;/g,    '>')
    .replace(/&quot;/g,  '"')
    .replace(/&#039;/g,  "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&hellip;/g,'...');
}