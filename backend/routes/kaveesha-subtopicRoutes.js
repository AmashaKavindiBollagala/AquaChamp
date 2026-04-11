import express from "express";
import verifyJWT from "../middleware/amasha-verifyJWT.js";
import { verifyRoles } from "../middleware/dilshara-verifyRoles.js";
import { upload } from "../middleware/kaveesha-uploadMiddleware.js";
import { videoUpload } from "../middleware/kaveesha-videoUploadMiddleware.js";
import { contentUpload } from "../middleware/kaveesha-contentFileUploadMiddleware.js";



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
  uploadContentFile,
  deleteContentFile,
  deleteSingleImage,
  updateSingleImage,
  appendSubtopicImage,
  appendSubtopicImageUrl,
} from "../controllers/kaveesha-subtopicController.js";

const router = express.Router();

// get lessons for user by age
router.get("/user/:age", getLessonsByUserAge);

// VIDEO
router.put("/video/:id",
  verifyJWT,
  verifyRoles("Lessons_ADMIN", "SUPER_ADMIN"),
  videoUpload.single("video"),
  updateVideo
);

router.delete("/video/:id",
  verifyJWT,
  verifyRoles("Lessons_ADMIN", "SUPER_ADMIN"),
  deleteVideo
);

// TEXT
router.put("/text/:id",
  verifyJWT,
  verifyRoles("Lessons_ADMIN", "SUPER_ADMIN"),
  updateText
);

router.delete("/text/:id",
  verifyJWT,
  verifyRoles("Lessons_ADMIN", "SUPER_ADMIN"),
  deleteText
);

// CONTENT FILE UPLOAD (PDF, Presentations) 
router.put("/content-file/:id",
  verifyJWT,
  verifyRoles("Lessons_ADMIN", "SUPER_ADMIN"),
  contentUpload.single("contentFile"),
  uploadContentFile
);

router.delete("/content-file/:id",
  verifyJWT,
  verifyRoles("Lessons_ADMIN", "SUPER_ADMIN"),
  deleteContentFile
);

// IMAGES UPLOAD
router.put("/images/:id/append",
  verifyJWT,
  verifyRoles("Lessons_ADMIN", "SUPER_ADMIN"),
  upload.single("image"),
  appendSubtopicImage
);

router.put("/images/:id/url",
  verifyJWT,
  verifyRoles("Lessons_ADMIN", "SUPER_ADMIN"),
  appendSubtopicImageUrl
);

router.put("/images/:id",
  verifyJWT,
  verifyRoles("Lessons_ADMIN", "SUPER_ADMIN"),
  upload.array("images", 5),   // upload images from device
  updateImages
);

router.delete("/images/:id",
  verifyJWT,
  verifyRoles("Lessons_ADMIN", "SUPER_ADMIN"),
  deleteImages
);

// Single image operations
router.delete("/image/:id",
  verifyJWT,
  verifyRoles("Lessons_ADMIN", "SUPER_ADMIN"),
  deleteSingleImage
);

router.put("/image/:id",
  verifyJWT,
  verifyRoles("Lessons_ADMIN", "SUPER_ADMIN"),
  upload.single("image"),
  updateSingleImage
);

// PROGRESS
router.post("/complete/:id", completeSubtopicContent);
router.get("/progress/subtopic", getSubtopicProgress);
router.post("/progress/topic", getTopicProgress);

// GENERAL
router.get("/", getSubtopics);
router.get("/:id", getSubtopicById);

// ADMIN only
router.post("/",
  verifyJWT,
  verifyRoles("Lessons_ADMIN", "SUPER_ADMIN"),
  createSubtopic
);

router.put("/:id",
  verifyJWT,
  verifyRoles("Lessons_ADMIN", "SUPER_ADMIN"),
  updateSubtopic
);

router.delete("/:id",
  verifyJWT,
  verifyRoles("Lessons_ADMIN", "SUPER_ADMIN"),
  deleteSubtopic
);

router.put(
  "/:id/images",
  upload.array("images", 5),   // max 5 images
  updateImages
);

export default router;