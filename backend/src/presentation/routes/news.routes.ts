import { Router } from "express";
import * as NewsController from "../controllers/NewsController.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

// Public routes (no auth required)
router.get("/public", NewsController.getPublicArticles);
router.get("/public/:id", NewsController.getPublicArticleById);
router.post("/public/:id/like", NewsController.toggleLike);
router.get("/public/:articleId/comments", NewsController.getComments);
router.post("/public/:articleId/comments", NewsController.createComment);

// Check department access (public - for frontend menu check)
router.get("/department-access/check/:departmentId", NewsController.checkDepartmentAccess);

// Admin/Manager routes (require auth)
router.use(authMiddleware);

// Department access management (Admin only) - MUST be before /:id routes
router.get("/department-access", NewsController.getDepartmentsWithAccess);
router.get("/departments", NewsController.getAllDepartments);
router.post("/department-access", NewsController.addDepartmentAccess);
router.delete("/department-access/:departmentId", NewsController.removeDepartmentAccess);

// Comments moderation
router.post("/comments/:commentId/moderate", NewsController.moderateComment);

// Article routes with :id parameter
router.get("/", NewsController.getAllArticles);
router.post("/", NewsController.createArticle);
router.get("/:id", NewsController.getArticleById);
router.put("/:id", NewsController.updateArticle);
router.delete("/:id", NewsController.deleteArticle);
router.post("/:id/moderate", NewsController.moderateArticle);
router.post("/:id/like", NewsController.toggleLike);
router.get("/:articleId/comments", NewsController.getComments);
router.post("/:articleId/comments", NewsController.createComment);

export default router;

