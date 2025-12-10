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

// Admin/Manager routes (require auth)
router.use(authMiddleware);

router.get("/", NewsController.getAllArticles);
router.get("/:id", NewsController.getArticleById);
router.post("/", NewsController.createArticle);
router.put("/:id", NewsController.updateArticle);
router.delete("/:id", NewsController.deleteArticle);
router.post("/:id/moderate", NewsController.moderateArticle);
router.post("/:id/like", NewsController.toggleLike);
router.get("/:articleId/comments", NewsController.getComments);
router.post("/:articleId/comments", NewsController.createComment);
router.post("/comments/:commentId/moderate", NewsController.moderateComment);

export default router;

