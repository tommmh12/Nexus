import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import * as ProjectController from "../controllers/ProjectController.js";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

router.get("/", ProjectController.getProjects);
router.get("/:id", ProjectController.getProjectById);
router.post("/", ProjectController.createProject);
router.put("/:id", ProjectController.updateProject);
router.delete("/:id", ProjectController.deleteProject);

export default router;
