import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import * as SettingsController from "../controllers/SettingsController.js";

const router = Router();

// Protected routes
router.use(authMiddleware);
router.get("/departments", SettingsController.getDepartments);
router.get("/task", SettingsController.getTaskSettings);

export default router;
