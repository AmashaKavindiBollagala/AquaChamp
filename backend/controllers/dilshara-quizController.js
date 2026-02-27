import Quiz from '../models/dilshara-Quiz.js';
import QuizResult from '../models/dilshara-QuizResult.js';
import asyncHandler from 'express-async-handler';



// create quiz
export const createQuiz = asyncHandler(async (req, res) => {
    const { title, description, lessonTopic, difficulty, questions, pointsPerQuestion } = req.body;

    if (!title || !lessonTopic || !questions || questions.length === 0) {
        return res.status(400).json({ message: 'title, lessonTopic, and questions are required' });
    }

    for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (!q.questionText) return res.status(400).json({ message: `Question ${i + 1} is missing questionText` });
        if (!q.options || q.options.length !== 4) return res.status(400).json({ message: `Question ${i + 1} must have exactly 4 options` });
        if (!q.correctAnswer) return res.status(400).json({ message: `Question ${i + 1} is missing correctAnswer` });
        if (!q.options.includes(q.correctAnswer)) return res.status(400).json({ message: `Question ${i + 1}: correctAnswer must match one of the options` });
    }

    const quiz = await Quiz.create({
        title,
        description,
        lessonTopic,
        difficulty: difficulty || 'easy',
        questions,
        pointsPerQuestion: pointsPerQuestion || 10,
        active: true,
        createdBy: req.user,
    });

    res.status(201).json({ message: 'Quiz created successfully', quiz });
});


// get all quizzes
export const getAllQuizzes = asyncHandler(async (req, res) => {
    const quizzes = await Quiz.find({ active: true })
        .select('-questions.correctAnswer')
        .sort({ createdAt: -1 });

    res.status(200).json({ count: quizzes.length, quizzes });
});


// get single quiz
export const getQuizById = asyncHandler(async (req, res) => {
    const quiz = await Quiz.findById(req.params.id)
        .select('-questions.correctAnswer');

    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    res.status(200).json(quiz);
});


// update quiz
export const updateQuiz = asyncHandler(async (req, res) => {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    const { title, description, lessonTopic, difficulty, questions, pointsPerQuestion, active } = req.body;

    if (title !== undefined) quiz.title = title;
    if (description !== undefined) quiz.description = description;
    if (lessonTopic !== undefined) quiz.lessonTopic = lessonTopic;
    if (difficulty !== undefined) quiz.difficulty = difficulty;
    if (pointsPerQuestion !== undefined) quiz.pointsPerQuestion = pointsPerQuestion;
    if (active !== undefined) quiz.active = active;

    if (questions !== undefined) {
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if (!q.questionText) return res.status(400).json({ message: `Question ${i + 1} is missing questionText` });
            if (!q.options || q.options.length !== 4) return res.status(400).json({ message: `Question ${i + 1} must have exactly 4 options` });
            if (!q.correctAnswer) return res.status(400).json({ message: `Question ${i + 1} is missing correctAnswer` });
            if (!q.options.includes(q.correctAnswer)) return res.status(400).json({ message: `Question ${i + 1}: correctAnswer must match one of the options` });
        }
        quiz.questions = questions;
    }

    await quiz.save();
    res.status(200).json({ message: 'Quiz updated successfully', quiz });
});


// delete quiz
export const deleteQuiz = asyncHandler(async (req, res) => {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    await QuizResult.deleteMany({ quizId: req.params.id });
    await quiz.deleteOne();

    res.status(200).json({ message: 'Quiz and all related results deleted successfully' });
});


// submit quiz answer - automatically marks the score
export const submitQuiz = asyncHandler(async (req, res) => {
    const { answers } = req.body;

    if (!answers || answers.length === 0) {
        return res.status(400).json({ message: 'Answers are required' });
    }

    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    if (!quiz.active) return res.status(400).json({ message: 'This quiz is currently inactive' });

    if (answers.length !== quiz.questions.length) {
        return res.status(400).json({
            message: `You must answer all ${quiz.questions.length} questions. You answered ${answers.length}.`
        });
    }

    // automatically make game score
    let correctCount = 0;
    const markedAnswers = answers.map((answer) => {
        const question = quiz.questions[answer.questionIndex];
        const isCorrect = question && question.correctAnswer === answer.selectedAnswer;
        if (isCorrect) correctCount++;
        return {
            questionIndex: answer.questionIndex,
            selectedAnswer: answer.selectedAnswer,
            isCorrect,
        };
    });

    const maxScore = quiz.questions.length * quiz.pointsPerQuestion;
    const score = correctCount * quiz.pointsPerQuestion;
    const percentage = Math.round((score / maxScore) * 100);
    const passed = percentage >= 60;

    await QuizResult.create({
        quizId: quiz._id,
        userId: req.user,
        submittedAnswers: answers,
        correctCount,
        score,
        maxScore,
        percentage,
        passed,
    });

    res.status(201).json({
        message: passed ? 'Congratulations! You passed!' : 'Keep trying! You can do better!',
        result: {
            quizTitle: quiz.title,
            totalQuestions: quiz.questions.length,
            correctAnswers: correctCount,
            score,
            maxScore,
            percentage,
            passed,
            markedAnswers,
        },
    });
});


// admin views all results for a specific quiz
export const getQuizResults = asyncHandler(async (req, res) => {
    const quiz = await Quiz.findById(req.params.id).select('title');
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    const results = await QuizResult.find({ quizId: req.params.id }).sort({ createdAt: -1 });
    res.status(200).json({ quiz: quiz.title, count: results.length, results });
});


// child sees only their own quiz results
export const getMyQuizResults = asyncHandler(async (req, res) => {
    const results = await QuizResult.find({ userId: req.user })
        .populate('quizId', 'title lessonTopic difficulty')
        .sort({ createdAt: -1 });

    res.status(200).json({ userId: req.user, count: results.length, results });
});


// progress manager gets all quiz results for a specific child
export const getQuizResultsByUserId = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const results = await QuizResult.find({ userId })
        .populate('quizId', 'title lessonTopic difficulty')
        .sort({ createdAt: -1 });

    if (results.length === 0) {
        return res.status(404).json({ message: `No quiz results found for user: ${userId}` });
    }

    res.status(200).json({
        userId,
        totalQuizzesTaken: results.length,
        results,
    });
});