import express from "express";
import verifyJWT from "../middleware/amasha-verifyJWT.js";
import { verifyRoles } from "../middleware/dilshara-verifyRoles.js";
import {
  createMiniQuiz,
  getMiniQuiz,
  updateMiniQuiz,
  deleteMiniQuiz
} from "../controllers/kaveesha-miniquizController.js";

const router = express.Router();


router.get("/", getMiniQuiz);
// Only admin can create/update/delete quiz
router.post("/", verifyJWT, verifyRoles("Lessons_ADMIN", "SUPER_ADMIN"), createMiniQuiz);
router.put("/:id", verifyJWT, verifyRoles("Lessons_ADMIN", "SUPER_ADMIN"), updateMiniQuiz);
router.delete("/:id", verifyJWT, verifyRoles("Lessons_ADMIN", "SUPER_ADMIN"), deleteMiniQuiz);

// Anyone (or logged-in users) can view quizzes
router.get("/", getMiniQuiz);

export default router;