import express from 'express';
import {
    createQuiz,
    getAllQuizzes,
    getQuizById,
    updateQuiz,
    deleteQuiz,
    submitQuiz,
    getQuizResults,
    getMyQuizResults,
    getQuizResultsByUserId,
} from '../controllers/dilshara-quizController.js';
import verifyJWT from '../middleware/amasha-verifyJWT.js';
import { verifyRoles } from '../middleware/dilshara-verifyRoles.js';

const router = express.Router();


// child sees their own quiz results
router.get('/results/me', verifyJWT, getMyQuizResults);

// progress manager views all quiz results for a specific child
router.get('/results/user/:userId', verifyJWT, getQuizResultsByUserId);

// get all quizzes
router.get('/', verifyJWT, getAllQuizzes);

// admin creates a quiz
router.post('/', verifyJWT, verifyRoles('Game_ADMIN'), createQuiz);

// get one quiz
router.get('/:id', verifyJWT, getQuizById);

// update a quiz
router.put('/:id', verifyJWT, verifyRoles('Game_ADMIN'), updateQuiz);

// delete a quiz
router.delete('/:id', verifyJWT, verifyRoles('Game_ADMIN'), deleteQuiz);

// child submits quiz answers
router.post('/:id/submit', verifyJWT, submitQuiz);

// admin views all results for a quiz
router.get('/:id/results', verifyJWT, verifyRoles('Game_ADMIN'), getQuizResults);

export default router;