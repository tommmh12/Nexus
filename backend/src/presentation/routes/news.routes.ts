import { Router } from "express";
import * as NewsController from "../controllers/NewsController.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  requireNewsPermission,
  requireNewsCreatePermission,
  requireDepartmentAccessPermission,
  NewsPolicy,
} from "../../application/policies/index.js";
import { requireRole } from "../middlewares/rbac.middleware.js";

const router = Router();

// Public routes (no auth required)
router.get("/public", NewsController.getPublicArticles);
router.get("/public/:id", NewsController.getPublicArticleById);
router.post("/public/:id/like", NewsController.toggleLike);
router.get("/public/:articleId/comments", NewsController.getComments);
router.post("/public/:articleId/comments", NewsController.createComment);

// Check department access (public - for frontend menu check)
router.get(
  "/department-access/check/:departmentId",
  NewsController.checkDepartmentAccess
);

// Admin/Manager routes (require auth)
router.use(authMiddleware);

// Department access management (Admin only) - MUST be before /:id routes
router.get("/department-access", requireDepartmentAccessPermission, NewsController.getDepartmentsWithAccess);
router.get("/departments", NewsController.getAllDepartments);
router.post("/department-access", requireDepartmentAccessPermission, NewsController.addDepartmentAccess);
router.delete(
  "/department-access/:departmentId",
  requireDepartmentAccessPermission,
  NewsController.removeDepartmentAccess
);

// Comments moderation - admin/manager only
router.post("/comments/:commentId/moderate", requireRole("admin", "manager"), NewsController.moderateComment);

// Article routes with :id parameter
router.get("/", NewsController.getAllArticles);

// Create article - admin/manager only
router.post("/", requireNewsCreatePermission, NewsController.createArticle);

router.get("/:id", NewsController.getArticleById);

// Edit article - author or admin
router.put(
  "/:id",
  requireNewsPermission(NewsPolicy.canEdit),
  NewsController.updateArticle
);

// Delete article - author or admin
router.delete(
  "/:id",
  requireNewsPermission(NewsPolicy.canDelete),
  NewsController.deleteArticle
);

// Moderate article - admin/manager only
router.post("/:id/moderate", requireRole("admin", "manager"), NewsController.moderateArticle);
router.post("/:id/like", NewsController.toggleLike);
router.get("/:articleId/comments", NewsController.getComments);
router.post("/:articleId/comments", NewsController.createComment);

export default router;
