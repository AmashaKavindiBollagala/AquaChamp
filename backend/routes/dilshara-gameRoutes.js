import express from 'express';
import {
    createGame,
    getAllGames,
    getGameById,
    updateGame,
    deleteGame,
    submitGameScore,
    getScoresByGame,
    getMyGameScores,
    deleteGameScore,
    getScoresByUserId,
} from '../controllers/dilshara-gameController.js';
import verifyJWT from '../middleware/amasha-verifyJWT.js';
import { verifyRoles } from '../middleware/dilshara-verifyRoles.js';

const router = express.Router();


// child sees their own scores
router.get('/scores/me', verifyJWT, getMyGameScores);

// progress manager views all game scores for a specific child
router.get('/scores/user/:userId', verifyJWT, getScoresByUserId);

// delete a score record
router.delete('/scores/:scoreId', verifyJWT, verifyRoles('Game_ADMIN'), deleteGameScore);

//all games here
router.get('/', verifyJWT, getAllGames);

//admin can create new game
router.post('/', verifyJWT, verifyRoles('Game_ADMIN'), createGame);

//using id one game can get
router.get('/:id', verifyJWT, getGameById);

//update the game
router.put('/:id', verifyJWT, verifyRoles('Game_ADMIN'), updateGame);

//delete the game
router.delete('/:id', verifyJWT, verifyRoles('Game_ADMIN'), deleteGame);

//user/child submit the score
router.post('/:id/score', verifyJWT, submitGameScore);

//admin view all score
router.get('/:id/scores', verifyJWT, verifyRoles('Game_ADMIN'), getScoresByGame);

export default router;