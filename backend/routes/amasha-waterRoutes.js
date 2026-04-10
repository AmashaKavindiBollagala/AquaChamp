// amasha-waterRoutes.js
// ─────────────────────────────────────────────────────────────────────────────
// CRITICAL: Specific literal paths (add-cup, remove-cup, :id/set) MUST be
// registered BEFORE the generic /:id route. If /:id comes first, Express
// will match "add-cup" and "remove-cup" as IDs and all three operations break.
// ─────────────────────────────────────────────────────────────────────────────

import express from "express";
import {
  createWaterLog,
  updateWaterLog,
  addCup,
  removeCup,
  setCups,
  getTodayWater,
  getWaterHistory,
  deleteWaterLog,
  adminGetWaterOverview,
  adminGetUserWaterHistory,
  adminSetCups,
} from "../controllers/amasha-waterController.js";
import verifyJWT from "../middleware/amasha-verifyJWT.js";
import { requireUser } from "../middleware/amasha-requireUser.js";
import { requireAdmin } from "../middleware/amasha-requireAdmin.js";


const router = express.Router();

// ── All user routes require a valid JWT ──────────────────────────────────────
router.use(verifyJWT);

// ── Read ─────────────────────────────────────────────────────────────────────
router.get("/today",        getTodayWater);
router.get("/history",      getWaterHistory);

// ── Create ───────────────────────────────────────────────────────────────────
router.post("/log",         createWaterLog);

// ── Specific PATCH routes — MUST come before  PATCH /log/:id  ─────────────
router.patch("/log/add-cup",    addCup);       // ← literal "add-cup"
router.patch("/log/remove-cup", removeCup);    // ← literal "remove-cup"
router.patch("/log/:id/set",    setCups);      // ← :id + literal "/set"

// ── Generic PATCH / DELETE by ID — AFTER the specific routes above ─────────
router.patch("/log/:id",    updateWaterLog);
router.delete("/log/:id",   deleteWaterLog);

// ── Admin routes ─────────────────────────────────────────────────────────────
router.get("/admin/overview",                requireAdmin, adminGetWaterOverview);
router.get("/admin/history/:userId",         requireAdmin, adminGetUserWaterHistory);
router.patch("/admin/set/:logId",            requireAdmin, adminSetCups);

export default router;