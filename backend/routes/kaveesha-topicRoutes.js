import express from "express";
import {
  createTopic,
  getTopics,
  getTopicById,
  updateTopic,
  deleteTopic
} from "../controllers/kaveesha-topicController.js";

import verifyJWT from "../middleware/amasha-verifyJWT.js";
import { verifyRoles } from "../middleware/dilshara-verifyRoles.js";

const router = express.Router();

//  PUBLIC ROUTES (any user)

router.get("/", getTopics);
router.get("/:id", getTopicById);


// ADMIN ONLY ROUTES

router.post("/", verifyJWT, verifyRoles("Lessons_ADMIN", "SUPER_ADMIN"), createTopic);
router.put("/:id", verifyJWT, verifyRoles("Lessons_ADMIN", "SUPER_ADMIN"), updateTopic);
router.delete("/:id", verifyJWT, verifyRoles("Lessons_ADMIN", "SUPER_ADMIN"), deleteTopic);

export default router;