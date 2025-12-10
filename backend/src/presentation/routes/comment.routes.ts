import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import * as CommentController from "../controllers/CommentController.js";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Get comments by thread (forum_post or task)
router.get("/:type/:id", CommentController.getCommentsByThread);

// Create comment
router.post("/", CommentController.createComment);

// Update comment
router.put("/:id", CommentController.updateComment);

// Retract comment
router.post("/:id/retract", CommentController.retractComment);

// Delete comment
router.delete("/:id", CommentController.deleteComment);

// Toggle reaction
router.post("/:id/reactions", CommentController.toggleReaction);

// Get edit history
router.get("/:id/history", CommentController.getEditHistory);

export default router;
