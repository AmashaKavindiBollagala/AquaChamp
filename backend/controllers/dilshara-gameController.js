import Game from '../models/dilshara-Game.js';
import GameScore from '../models/dilshara-GameScore.js';
import asyncHandler from 'express-async-handler';



// create  a game
export const createGame = asyncHandler(async (req, res) => {
    const { title, description, lessonTopic, difficulty, maxScore } = req.body;

    if (!title || !description || !lessonTopic || !maxScore) {
        return res.status(400).json({ message: 'title, description, lessonTopic, and maxScore are required' });
    }

    const game = await Game.create({
        title,
        description,
        lessonTopic,
        difficulty: difficulty || 'easy',
        maxScore,
        active: true,
        createdBy: req.user,
    });

    res.status(201).json({ message: 'Game created successfully', game });
});


// get all games
export const getAllGames = asyncHandler(async (req, res) => {
    const games = await Game.find({ active: true }).sort({ createdAt: -1 });
    res.status(200).json({ count: games.length, games });
});


// get single game
export const getGameById = asyncHandler(async (req, res) => {
    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ message: 'Game not found' });
    res.status(200).json(game);
});


// update game
export const updateGame = asyncHandler(async (req, res) => {
    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ message: 'Game not found' });

    const { title, description, lessonTopic, difficulty, maxScore, active } = req.body;

    if (title !== undefined) game.title = title;
    if (description !== undefined) game.description = description;
    if (lessonTopic !== undefined) game.lessonTopic = lessonTopic;
    if (difficulty !== undefined) game.difficulty = difficulty;
    if (maxScore !== undefined) game.maxScore = maxScore;
    if (active !== undefined) game.active = active;

    await game.save();
    res.status(200).json({ message: 'Game updated successfully', game });
});


// delete game
export const deleteGame = asyncHandler(async (req, res) => {
    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ message: 'Game not found' });

    await GameScore.deleteMany({ gameId: req.params.id });
    await game.deleteOne();

    res.status(200).json({ message: 'Game and all related scores deleted successfully' });
});


// submit game score
export const submitGameScore = asyncHandler(async (req, res) => {
    const { score } = req.body;

    if (score === undefined || score === null) {
        return res.status(400).json({ message: 'Score is required' });
    }

    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ message: 'Game not found' });
    if (!game.active) return res.status(400).json({ message: 'This game is currently inactive' });
    if (score > game.maxScore) return res.status(400).json({ message: `Score cannot exceed max score of ${game.maxScore}` });
    if (score < 0) return res.status(400).json({ message: 'Score cannot be negative' });

    // Calculate percentage here directly
    const percentage = Math.round((score / game.maxScore) * 100);

    const gameScore = await GameScore.create({
        gameId: game._id,
        userId: req.user,
        score,
        maxScore: game.maxScore,
        percentage,
    });

    res.status(201).json({
        message: 'Score submitted successfully',
        result: {
            game: game.title,
            score: gameScore.score,
            maxScore: gameScore.maxScore,
            percentage: gameScore.percentage,
        },
    });
});


// get all scores
export const getScoresByGame = asyncHandler(async (req, res) => {
    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ message: 'Game not found' });

    const scores = await GameScore.find({ gameId: req.params.id }).sort({ createdAt: -1 });
    res.status(200).json({ game: game.title, count: scores.length, scores });
});


// get my own score
export const getMyGameScores = asyncHandler(async (req, res) => {
    const scores = await GameScore.find({ userId: req.user })
        .populate('gameId', 'title lessonTopic difficulty')
        .sort({ createdAt: -1 });

    res.status(200).json({ userId: req.user, count: scores.length, scores });
});


// delete score records
export const deleteGameScore = asyncHandler(async (req, res) => {
    const score = await GameScore.findById(req.params.scoreId);
    if (!score) return res.status(404).json({ message: 'Score record not found' });

    await score.deleteOne();
    res.status(200).json({ message: 'Score record deleted successfully' });
});


// progress manager gets all game scores for a specific child
export const getScoresByUserId = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const scores = await GameScore.find({ userId })
        .populate('gameId', 'title lessonTopic difficulty maxScore')
        .sort({ createdAt: -1 });

    if (scores.length === 0) {
        return res.status(404).json({ message: `No game scores found for user: ${userId}` });
    }

    res.status(200).json({
        userId,
        totalGamesPlayed: scores.length,
        scores,
    });
});