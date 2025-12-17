import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import * as ProjectController from "../controllers/ProjectController.js";
import {
    requireProjectPermission,
    ProjectPolicy,
} from "../../application/policies/index.js";
import { requireRole } from "../middlewares/rbac.middleware.js";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Route này phải đặt TRƯỚC /:id để tránh bị match nhầm id là "generate-code"
router.get("/generate-code", ProjectController.generateProjectCode);
router.get("/my-projects", ProjectController.getMyProjects);
router.get("/", ProjectController.getProjects);

// View project - requires view permission
router.get(
    "/:id",
    requireProjectPermission(ProjectPolicy.canView),
    ProjectController.getProjectById
);

// Create project - only admin/manager roles can create
router.post("/", requireRole("admin", "manager"), ProjectController.createProject);

// Update project - requires edit permission (manager of project or admin)
router.put(
    "/:id",
    requireProjectPermission(ProjectPolicy.canEdit),
    ProjectController.updateProject
);

// Delete project - requires delete permission
router.delete(
    "/:id",
    requireProjectPermission(ProjectPolicy.canDelete),
    ProjectController.deleteProject
);

// Member management - requires manage members permission
router.post(
    "/:id/members",
    requireProjectPermission(ProjectPolicy.canManageMembers),
    ProjectController.addMember
);

router.delete(
    "/:id/members/:userId",
    requireProjectPermission(ProjectPolicy.canManageMembers),
    ProjectController.removeMember
);

export default router;
