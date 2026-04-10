import express from 'express';
import {
  createGame,
  getAllGames,
  getGameById,
  updateGame,
  deleteGame,
  generateQuestions,
  submitGameScore,
  getScoresByGame,
  getMyGameScores,
  getScoresByUserId,
  deleteGameScore,
  getTopicProgress,   // ← NEW
} from '../controllers/dilshara-gameController.js';
import verifyJWT       from '../middleware/amasha-verifyJWT.js';
import { verifyRoles } from '../middleware/dilshara-verifyRoles.js';

const router = express.Router();

router.use(verifyJWT);

// Question generation
router.get('/generate-questions', verifyRoles('Game_ADMIN', 'SUPER_ADMIN'), generateQuestions);

// My scores  (must be before /:id to avoid conflict)
router.get('/my/scores', getMyGameScores);

// ── NEW: topic progress ───────────────────────────────────────────────────────
// GET /api/games/progress/safe-drinking-water?userId=Dilsha
router.get('/progress/:topicId', getTopicProgress);

// Game CRUD
router.post('/',      verifyRoles('Game_ADMIN', 'SUPER_ADMIN'), createGame);
router.get('/',       getAllGames);
router.get('/:id',    getGameById);
router.put('/:id',    verifyRoles('Game_ADMIN', 'SUPER_ADMIN'), updateGame);
router.delete('/:id', verifyRoles('Game_ADMIN', 'SUPER_ADMIN'), deleteGame);

// Scores
router.post('/:id/scores',         submitGameScore);
router.get('/:id/scores',          verifyRoles('Game_ADMIN', 'SUPER_ADMIN'), getScoresByGame);
router.get('/user/:userId/scores', verifyRoles('Game_ADMIN', 'SUPER_ADMIN', 'Progress_ADMIN'), getScoresByUserId);
router.delete('/scores/:scoreId',  verifyRoles('Game_ADMIN', 'SUPER_ADMIN'), deleteGameScore);

export default router;