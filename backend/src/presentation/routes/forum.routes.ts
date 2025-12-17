import { Router } from "express";
import * as ForumController from "../controllers/ForumController.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
    requireForumPermission,
    ForumPolicy,
} from "../../application/policies/index.js";
import { requireRole } from "../middlewares/rbac.middleware.js";

const router = Router();

// Public category endpoint (no auth required)
router.get("/categories", ForumController.getCategories);

// All other forum routes require authentication (internal only)
router.use(authMiddleware);

// Category management routes (admin only)
router.post("/categories", requireRole("admin"), ForumController.createCategory);
router.put("/categories/:id", requireRole("admin"), ForumController.updateCategory);
router.delete("/categories/:id", requireRole("admin"), ForumController.deleteCategory);

// Hot topics endpoint
router.get("/hot-topics", ForumController.getHotTopics);

// User forum stats endpoint
router.get("/user-stats/:userId", ForumController.getUserForumStats);

router.get("/", ForumController.getAllPosts);
router.get("/:id", ForumController.getPostById);
router.post("/", ForumController.createPost);

// Edit post - author or admin
router.put(
    "/:id",
    requireForumPermission(ForumPolicy.canEdit),
    ForumController.updatePost
);

// Delete post - author, admin, or manager
router.delete(
    "/:id",
    requireForumPermission(ForumPolicy.canDelete),
    ForumController.deletePost
);

// Moderate post - admin/manager only
router.post(
    "/:id/moderate",
    requireForumPermission(ForumPolicy.canModerate),
    ForumController.moderatePost
);

router.post("/:id/vote", ForumController.toggleVote);
router.get("/:postId/comments", ForumController.getComments);
router.post("/:postId/comments", ForumController.createComment);

// Reaction endpoints
router.post("/:targetType/:targetId/reaction", ForumController.toggleReaction);
router.get("/:targetType/:targetId/reactions", ForumController.getReactions);

// Attachment endpoints
router.get("/:postId/attachments", ForumController.getPostAttachments);
router.post("/:postId/attachments", ForumController.addAttachment);
router.delete("/attachments/:attachmentId", ForumController.deleteAttachment);

export default router;
