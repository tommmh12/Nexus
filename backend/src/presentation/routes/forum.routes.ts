import { Router } from "express";
import { ForumController } from "../controllers/ForumController.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

// Apply authentication middleware to all forum routes
router.use(authMiddleware);

// Categories
router.get("/categories", ForumController.getCategories);
router.post("/categories", ForumController.createCategory);
router.put("/categories/:id", ForumController.updateCategory);
router.delete("/categories/:id", ForumController.deleteCategory);

// Posts
router.get("/posts", ForumController.getPosts);
router.get("/posts/:id", ForumController.getPostById);
router.post("/posts", ForumController.createPost);
router.put("/posts/:id", ForumController.updatePost);
router.delete("/posts/:id", ForumController.deletePost);

// Moderation
router.post("/posts/:id/approve", ForumController.approvePost);
router.post("/posts/:id/reject", ForumController.rejectPost);

export default router;

