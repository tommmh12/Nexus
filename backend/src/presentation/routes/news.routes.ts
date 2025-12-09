import { Router } from "express";
import { NewsController } from "../controllers/NewsController.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

// Apply authentication middleware to all news routes
router.use(authMiddleware);

// Articles
router.get("/", NewsController.getArticles);
router.get("/:id", NewsController.getArticleById);
router.post("/", NewsController.createArticle);
router.put("/:id", NewsController.updateArticle);
router.delete("/:id", NewsController.deleteArticle);

// Publishing
router.post("/:id/publish", NewsController.publishArticle);
router.post("/:id/archive", NewsController.archiveArticle);

export default router;

