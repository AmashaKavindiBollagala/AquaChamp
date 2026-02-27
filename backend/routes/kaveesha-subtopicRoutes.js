import express from "express";
import verifyJWT from "../middleware/amasha-verifyJWT.js";
import { verifyRoles } from "../middleware/dilshara-verifyRoles.js";
import {
  createSubtopic,
  getSubtopics,
  getSubtopicById,
  updateSubtopic,
  deleteSubtopic,
  getLessonsByUserAge,
  updateVideo,
  updateText,
  updateImages,
  deleteVideo,
  deleteText,
  deleteImages,
  completeSubtopicContent,
  getSubtopicProgress,
  getTopicProgress,
} from "../controllers/kaveesha-subtopicController.js";

const router = express.Router();

// get lessons for user by age
router.get("/user/:age", getLessonsByUserAge);

// Update video, text, images separately
router.put(
  "/video/:id",
  verifyJWT,
  verifyRoles("Lessons_ADMIN", "SUPER_ADMIN"),
  updateVideo,
);
router.delete(
  "/video/:id",
  verifyJWT,
  verifyRoles("Lessons_ADMIN", "SUPER_ADMIN"),
  deleteVideo,
);

router.put(
  "/text/:id",
  verifyJWT,
  verifyRoles("Lessons_ADMIN", "SUPER_ADMIN"),
  updateText,
);
router.delete(
  "/text/:id",
  verifyJWT,
  verifyRoles("Lessons_ADMIN", "SUPER_ADMIN"),
  deleteText,
);

router.put(
  "/images/:id",
  verifyJWT,
  verifyRoles("Lessons_ADMIN", "SUPER_ADMIN"),
  updateImages,
);
router.delete(
  "/images/:id",
  verifyJWT,
  verifyRoles("Lessons_ADMIN", "SUPER_ADMIN"),
  deleteImages,
);

// Progression routes
router.post("/complete/:id", completeSubtopicContent);
router.get("/progress/subtopic", getSubtopicProgress);
router.post("/progress/topic", getTopicProgress);

router.get("/", getSubtopics);
router.get("/:id", getSubtopicById);

// Only ADMIN or SUPER_ADMIN can create/update/delete
router.post(
  "/",
  verifyJWT,
  verifyRoles("Lessons_ADMIN", "SUPER_ADMIN"),
  createSubtopic,
);
router.put(
  "/:id",
  verifyJWT,
  verifyRoles("Lessons_ADMIN", "SUPER_ADMIN"),
  updateSubtopic,
);
router.delete(
  "/:id",
  verifyJWT,
  verifyRoles("Lessons_ADMIN", "SUPER_ADMIN"),
  deleteSubtopic,
);

export default router;
