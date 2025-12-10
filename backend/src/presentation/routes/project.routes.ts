import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import * as ProjectController from "../controllers/ProjectController.js";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Route này phải đặt TRƯỚC /:id để tránh bị match nhầm id là "generate-code"
router.get("/generate-code", ProjectController.generateProjectCode);
router.get("/", ProjectController.getProjects);
router.get("/:id", ProjectController.getProjectById);
router.post("/", ProjectController.createProject);
router.put("/:id", ProjectController.updateProject);
router.delete("/:id", ProjectController.deleteProject);
router.post("/:id/members", ProjectController.addMember);
router.delete("/:id/members/:userId", ProjectController.removeMember);

export default router;
