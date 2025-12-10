import { Router } from "express";
import * as ForumController from "../controllers/ForumController.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

// Public category endpoint (no auth required)
router.get("/categories", ForumController.getCategories);

// All other forum routes require authentication (internal only)
router.use(authMiddleware);

// Category management routes (admin only)
router.post("/categories", ForumController.createCategory);
router.put("/categories/:id", ForumController.updateCategory);
router.delete("/categories/:id", ForumController.deleteCategory);

router.get("/", ForumController.getAllPosts);
router.get("/:id", ForumController.getPostById);
router.post("/", ForumController.createPost);
router.put("/:id", ForumController.updatePost);
router.delete("/:id", ForumController.deletePost);
router.post("/:id/moderate", ForumController.moderatePost);
router.post("/:id/vote", ForumController.toggleVote);
router.get("/:postId/comments", ForumController.getComments);
router.post("/:postId/comments", ForumController.createComment);

export default router;

