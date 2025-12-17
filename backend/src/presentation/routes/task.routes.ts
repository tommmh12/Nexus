import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import * as TaskController from "../controllers/TaskController.js";
import {
    requireTaskPermission,
    requireTaskCreatePermission,
    TaskPolicy,
} from "../../application/policies/index.js";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// My tasks - no additional permission needed (filtered by user ID)
router.get("/my-tasks", TaskController.getMyTasks);

// Tasks by project - requires view permission on project (checked in controller for now)
router.get("/project/:projectId", TaskController.getTasksByProject);

// View single task - requires task view permission
router.get(
    "/:id",
    requireTaskPermission(TaskPolicy.canView),
    TaskController.getTaskById
);

// Create task - requires create permission in the project
router.post("/", requireTaskCreatePermission, TaskController.createTask);

// Update task - requires edit permission (manager or assignee)
router.put(
    "/:id",
    requireTaskPermission(TaskPolicy.canEdit),
    TaskController.updateTask
);

// Delete task - requires delete permission (manager only)
router.delete(
    "/:id",
    requireTaskPermission(TaskPolicy.canDelete),
    TaskController.deleteTask
);

// Checklist management - requires edit permission on parent task
router.post(
    "/:id/checklist",
    requireTaskPermission(TaskPolicy.canEdit),
    TaskController.addChecklistItem
);

// Note: checklist item routes use itemId, need special handling
// For now, these will be checked in controller or we need a different approach
router.put("/checklist/:itemId", TaskController.updateChecklistItem);
router.delete("/checklist/:itemId", TaskController.deleteChecklistItem);

// Update task status (for workflow drag-drop) - requires edit permission
router.patch(
    "/:id/status",
    requireTaskPermission(TaskPolicy.canEdit),
    TaskController.updateTaskStatus
);

export default router;
