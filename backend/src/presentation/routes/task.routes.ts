import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import * as TaskController from "../controllers/TaskController.js";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

router.get("/project/:projectId", TaskController.getTasksByProject);
router.get("/:id", TaskController.getTaskById);
router.post("/", TaskController.createTask);
router.put("/:id", TaskController.updateTask);
router.delete("/:id", TaskController.deleteTask);

export default router;
