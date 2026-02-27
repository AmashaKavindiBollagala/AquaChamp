import express from 'express';
import {
    createStatement,
    getAllStatements,
    getStatementById,
    updateStatement,
    deleteStatement,
    submitAnswer,
    getStatementResults,
    getMyTrueFalseResults,
    getTrueFalseResultsByUserId,
} from '../controllers/dilshara-trueFalseController.js';
import verifyJWT from '../middleware/amasha-verifyJWT.js';
import { verifyRoles } from '../middleware/dilshara-verifyRoles.js';

const router = express.Router();


// Otherwise Express treats 
router.get('/results/me', verifyJWT, getMyTrueFalseResults);

// progress manager views all true/false results 
router.get('/results/user/:userId', verifyJWT, getTrueFalseResultsByUserId);

// all statements
router.get('/', verifyJWT, getAllStatements);

// create a statement
router.post('/', verifyJWT, verifyRoles('Game_ADMIN'), createStatement);

// one statement
router.get('/:id', verifyJWT, getStatementById);

// update a statement
router.put('/:id', verifyJWT, verifyRoles('Game_ADMIN'), updateStatement);

// one statement and all its results
router.delete('/:id', verifyJWT, verifyRoles('Game_ADMIN'), deleteStatement);

// submit answer
router.post('/:id/submit', verifyJWT, submitAnswer);

// all results for one statement
router.get('/:id/results', verifyJWT, verifyRoles('Game_ADMIN'), getStatementResults);

export default router;