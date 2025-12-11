import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  getAlertRules,
  getAlertRuleById,
  createAlertRule,
  updateAlertRule,
  toggleAlertRule,
  deleteAlertRule,
} from "../controllers/AlertRuleController.js";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/alert-rules - Get all alert rules
router.get("/", getAlertRules);

// GET /api/alert-rules/:id - Get single rule
router.get("/:id", getAlertRuleById);

// POST /api/alert-rules - Create new rule
router.post("/", createAlertRule);

// PUT /api/alert-rules/:id - Update rule
router.put("/:id", updateAlertRule);

// PATCH /api/alert-rules/:id/toggle - Toggle enable/disable
router.patch("/:id/toggle", toggleAlertRule);

// DELETE /api/alert-rules/:id - Delete rule
router.delete("/:id", deleteAlertRule);

export default router;
