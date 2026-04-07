import express from "express";
import {
  createWaterLog,
  updateWaterLog,
  addCup,
  getTodayWater,
  getWaterHistory,
  deleteWaterLog,
} from "../controllers/amasha-waterController.js";
import verifyJWT from "../middleware/amasha-verifyJWT.js";
import { requireUser } from "../middleware/amasha-requireUser.js";

const router = express.Router();

router.use(verifyJWT);

router.post("/log", requireUser, createWaterLog);
router.patch("/log/add-cup", requireUser, addCup);
router.put("/log/:id", requireUser, updateWaterLog);
router.delete("/log/:id", requireUser, deleteWaterLog);
router.get("/today", requireUser, getTodayWater);
router.get("/history", requireUser, getWaterHistory);

export default router;