import express from "express";
import { getMyPoints, getUserPoints } from "../controllers/amasha-pointsController.js";
import verifyJWT from "../middleware/amasha-verifyJWT.js";
import { requireAdmin } from "../middleware/amasha-requireAdmin.js";

const router = express.Router();

router.use(verifyJWT);

// Get own points summary
router.get("/me", getMyPoints);

// Admin/Component 3: get any user's points total
router.get("/user/:userId", requireAdmin, getUserPoints);

export default router;