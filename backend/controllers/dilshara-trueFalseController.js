import TrueFalse from '../models/dilshara-TrueFalse.js';
import TrueFalseResult from '../models/dilshara-TrueFalseResult.js';
import asyncHandler from 'express-async-handler';


// create a true/false statement 
export const createStatement = asyncHandler(async (req, res) => {
    const { statement, correctAnswer, hint, points } = req.body;

    if (!statement || !correctAnswer) {
        return res.status(400).json({ message: 'statement and correctAnswer are required' });
    }

    if (correctAnswer !== 'true' && correctAnswer !== 'false') {
        return res.status(400).json({ message: 'correctAnswer must be "true" or "false"' });
    }

    const trueFalse = await TrueFalse.create({
        statement,
        correctAnswer,
        hint: hint || '',
        lessonTopic: 'Handwashing and Personal Hygiene',
        points: points || 10,
        active: true,
        createdBy: req.user,
    });

    res.status(201).json({
        message: 'True/False statement created successfully',
        trueFalse,
    });
});


// get all statements 
export const getAllStatements = asyncHandler(async (req, res) => {
    const statements = await TrueFalse.find({ active: true })
        .select('-correctAnswer')
        .sort({ createdAt: -1 });

    res.status(200).json({
        count: statements.length,
        statements,
    });
});


// get one statement 
export const getStatementById = asyncHandler(async (req, res) => {
    const statement = await TrueFalse.findById(req.params.id)
        .select('-correctAnswer');

    if (!statement) {
        return res.status(404).json({ message: 'Statement not found' });
    }

    res.status(200).json(statement);
});


// update a statement 
export const updateStatement = asyncHandler(async (req, res) => {
    const statement = await TrueFalse.findById(req.params.id);

    if (!statement) {
        return res.status(404).json({ message: 'Statement not found' });
    }

    const { statement: newStatement, correctAnswer, hint, points, active } = req.body;

    if (newStatement !== undefined) statement.statement = newStatement;
    if (hint !== undefined) statement.hint = hint;
    if (points !== undefined) statement.points = points;
    if (active !== undefined) statement.active = active;

    if (correctAnswer !== undefined) {
        if (correctAnswer !== 'true' && correctAnswer !== 'false') {
            return res.status(400).json({ message: 'correctAnswer must be "true" or "false"' });
        }
        statement.correctAnswer = correctAnswer;
    }

    await statement.save();

    res.status(200).json({
        message: 'Statement updated successfully',
        statement,
    });
});


// delete a statement and all its results 
export const deleteStatement = asyncHandler(async (req, res) => {
    const statement = await TrueFalse.findById(req.params.id);

    if (!statement) {
        return res.status(404).json({ message: 'Statement not found' });
    }

    await TrueFalseResult.deleteMany({ trueFalseId: req.params.id });
    await statement.deleteOne();

    res.status(200).json({ message: 'Statement and all related results deleted successfully' });
});


// submit the answer 
export const submitAnswer = asyncHandler(async (req, res) => {
    const { answer } = req.body;

    if (!answer) {
        return res.status(400).json({ message: 'Answer is required' });
    }

    if (answer !== 'true' && answer !== 'false') {
        return res.status(400).json({ message: 'Answer must be "true" or "false"' });
    }

    const statement = await TrueFalse.findById(req.params.id);

    if (!statement) {
        return res.status(404).json({ message: 'Statement not found' });
    }

    if (!statement.active) {
        return res.status(400).json({ message: 'This statement is currently inactive' });
    }

    // answer correct checking
    const isCorrect = answer === statement.correctAnswer;
    const pointsEarned = isCorrect ? statement.points : 0;

    // Save result to MongoDB
    await TrueFalseResult.create({
        trueFalseId: statement._id,
        userId: req.user,
        submittedAnswer: answer,
        isCorrect,
        pointsEarned,
    });

    res.status(201).json({
        message: isCorrect ? 'Correct! Well done!' : 'Wrong answer! Try again!',
        result: {
            statement: statement.statement,
            yourAnswer: answer,
            isCorrect,
            pointsEarned,
            correctAnswer: statement.correctAnswer,
        },
    });
});


// all results of statements
export const getStatementResults = asyncHandler(async (req, res) => {
    const statement = await TrueFalse.findById(req.params.id).select('statement');

    if (!statement) {
        return res.status(404).json({ message: 'Statement not found' });
    }

    const results = await TrueFalseResult.find({ trueFalseId: req.params.id })
        .sort({ createdAt: -1 });

    res.status(200).json({
        statement: statement.statement,
        count: results.length,
        results,
    });
});


// child result 
export const getMyTrueFalseResults = asyncHandler(async (req, res) => {
    const results = await TrueFalseResult.find({ userId: req.user })
        .populate('trueFalseId', 'statement lessonTopic points')
        .sort({ createdAt: -1 });

    res.status(200).json({
        userId: req.user,
        count: results.length,
        results,
    });
});


// progress manager gets results for the user 
export const getTrueFalseResultsByUserId = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const results = await TrueFalseResult.find({ userId })
        .populate('trueFalseId', 'statement lessonTopic points')
        .sort({ createdAt: -1 });

    if (results.length === 0) {
        return res.status(404).json({ message: `No true/false results found for user: ${userId}` });
    }

    res.status(200).json({
        userId,
        totalAnswered: results.length,
        results,
    });
});