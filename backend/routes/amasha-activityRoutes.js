import express from "express";
import {
  createSystemActivity,
  createCustomActivity,
  getAllActivities,
  updateActivity,
  deleteActivity,
} from "../controllers/amasha-activityController.js";
import {
  logActivity,
  getUserLogs,
  updateLog,
  deleteLog,
  getReport,
  getStreak,
} from "../controllers/amasha-activityLogController.js";
import verifyJWT from "../middleware/amasha-verifyJWT.js";
import { requireAdmin } from "../middleware/amasha-requireAdmin.js";
import { requireUser } from "../middleware/amasha-requireUser.js";

const router = express.Router();

// All routes require authentication
router.use(verifyJWT);

// Activity Definitions 

// Admin: create a global system activity
router.post("/system", requireAdmin, createSystemActivity);

// User: add a custom personal activity
router.post("/custom", createCustomActivity);

// Get all activities available to the user (system + own custom)
router.get("/", getAllActivities);

// Update an activity (admin → system; user → their own)
router.put("/:id", updateActivity);

// Delete (soft) an activity
router.delete("/:id", deleteActivity);

//  Daily Activity Logs 

router.post("/log", requireUser, logActivity);
router.get("/logs", requireUser, getUserLogs);
router.put("/log/:id", requireUser, updateLog);
router.delete("/log/:id", requireUser, deleteLog);
router.get("/report", requireUser, getReport);
router.get("/streak", requireUser, getStreak);

export default router;