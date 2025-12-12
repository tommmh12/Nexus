import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import * as TaskController from "../controllers/TaskController.js";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

router.get("/my-tasks", TaskController.getMyTasks);
router.get("/project/:projectId", TaskController.getTasksByProject);
router.get("/:id", TaskController.getTaskById);
router.post("/", TaskController.createTask);
router.put("/:id", TaskController.updateTask);
router.delete("/:id", TaskController.deleteTask);

router.post("/:id/checklist", TaskController.addChecklistItem);
router.put("/checklist/:itemId", TaskController.updateChecklistItem);
router.delete("/checklist/:itemId", TaskController.deleteChecklistItem);

// Update task status (for workflow drag-drop)
router.patch("/:id/status", TaskController.updateTaskStatus);

export default router;
