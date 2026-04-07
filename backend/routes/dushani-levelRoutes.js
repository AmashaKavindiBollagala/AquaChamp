import express from "express";
import {
  createLevel,
  getAllLevels,
  getLevelById,
  updateLevel,
  deleteLevel,
  getStudentProgressMonitoring,
  getStudentDetails,
  recalculateAllStudentLevels,
} from "../controllers/dushani-LevelController.js";

import verifyJWT from "../middleware/amasha-verifyJWT.js";

const router = express.Router();

// All routes require JWT authentication
router.use(verifyJWT);

//MONITORING ROUTES (PUT FIRST)

router.get("/monitoring/students", getStudentProgressMonitoring);
router.get("/monitoring/student/:userId", getStudentDetails);

//LEVEL MANAGEMENT ROUTES

router.post("/", createLevel);
router.get("/", getAllLevels);
router.get("/:id", getLevelById);
router.put("/:id", updateLevel);
router.delete("/:id", deleteLevel);

//UTILITY ROUTES
router.post("/recalculate-all", recalculateAllStudentLevels);

export default router;
