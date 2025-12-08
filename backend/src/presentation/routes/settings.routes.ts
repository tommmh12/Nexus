import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import * as SettingsController from "../controllers/SettingsController.js";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

router.get("/task", SettingsController.getTaskSettings);

export default router;
