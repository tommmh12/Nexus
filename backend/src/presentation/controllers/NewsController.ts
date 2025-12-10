import { Request, Response } from "express";
import { NewsService } from "../../application/services/NewsService.js";
import { NewsRepository } from "../../infrastructure/repositories/NewsRepository.js";
import { auditLogger } from "../../utils/auditLogger.js";

const newsRepository = new NewsRepository();
const newsService = new NewsService(newsRepository);

const getIpAddress = (req: Request): string => {
  return (req.headers["x-forwarded-for"] as string)?.split(",")[0] || 
         (req.headers["x-real-ip"] as string) || 
         req.socket.remoteAddress || 
         "unknown";
};

// Public endpoints (no auth required for viewing)
export const getPublicArticles = async (req: Request, res: Response) => {
  try {
    const articles = await newsService.getAllArticles({
      status: "Published",
      moderationStatus: "Approved",
      isPublic: true,
      limit: parseInt(req.query.limit as string) || 50,
      offset: parseInt(req.query.offset as string) || 0,
    });
    res.json(articles);
  } catch (error: any) {
    console.error("Error fetching public articles:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getPublicArticleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;
    const ipAddress = getIpAddress(req);
    const userAgent = req.headers["user-agent"];

    const article = await newsService.getArticleById(id, true, userId, ipAddress, userAgent);
    if (!article) {
      return res.status(404).json({ error: "Article not found" });
    }

    // Only return if public and approved
    if (!article.isPublic || article.moderationStatus !== "Approved" || article.status !== "Published") {
      return res.status(404).json({ error: "Article not found" });
    }

    res.json(article);
  } catch (error: any) {
    console.error("Error fetching article:", error);
    res.status(500).json({ error: error.message });
  }
};

// Admin/Manager endpoints (require auth)
export const getAllArticles = async (req: Request, res: Response) => {
  try {
    const articles = await newsService.getAllArticles({
      status: req.query.status as string,
      moderationStatus: req.query.moderationStatus as string,
      isPublic: req.query.isPublic !== undefined ? req.query.isPublic === "true" : undefined,
      category: req.query.category as string,
      limit: parseInt(req.query.limit as string) || 100,
      offset: parseInt(req.query.offset as string) || 0,
    });
    res.json(articles);
  } catch (error: any) {
    console.error("Error fetching articles:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getArticleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const article = await newsService.getArticleById(id);
    if (!article) {
      return res.status(404).json({ error: "Article not found" });
    }
    res.json(article);
  } catch (error: any) {
    console.error("Error fetching article:", error);
    res.status(500).json({ error: error.message });
  }
};

export const createArticle = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const ipAddress = getIpAddress(req);

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Validate required fields
    if (!req.body.title || !req.body.content) {
      return res.status(400).json({ error: "Title and content are required" });
    }
    if (!req.body.category) {
      return res.status(400).json({ error: "Category is required" });
    }

    const article = await newsService.createArticle({
      ...req.body,
      authorId: userId,
    });

    await auditLogger.log({
      userId,
      type: "content_management",
      content: `Tạo bài viết bản tin: ${article.title}`,
      target: article.title,
      ipAddress,
      meta: {
        action: "create",
        entity: "news_article",
        entityId: article.id,
      },
    });

    res.status(201).json(article);
  } catch (error: any) {
    console.error("Error creating article:", error);
    res.status(400).json({ error: error.message });
  }
};

export const updateArticle = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const ipAddress = getIpAddress(req);
    const { id } = req.params;

    const existing = await newsService.getArticleById(id);
    if (!existing) {
      return res.status(404).json({ error: "Article not found" });
    }

    const article = await newsService.updateArticle(id, req.body);

    await auditLogger.log({
      userId,
      type: "content_management",
      content: `Cập nhật bài viết bản tin: ${article.title}`,
      target: article.title,
      ipAddress,
      meta: {
        action: "update",
        entity: "news_article",
        entityId: article.id,
        changes: req.body,
      },
    });

    res.json(article);
  } catch (error: any) {
    console.error("Error updating article:", error);
    res.status(400).json({ error: error.message });
  }
};

export const moderateArticle = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const ipAddress = getIpAddress(req);
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid moderation status" });
    }

    const article = await newsService.moderateArticle(id, status, userId, notes);

    await auditLogger.log({
      userId,
      type: "content_moderation",
      content: `${status === "Approved" ? "Duyệt" : "Từ chối"} bài viết bản tin: ${article.title}`,
      target: article.title,
      ipAddress,
      meta: {
        action: "moderate",
        entity: "news_article",
        entityId: article.id,
        status,
        notes,
      },
    });

    res.json(article);
  } catch (error: any) {
    console.error("Error moderating article:", error);
    res.status(400).json({ error: error.message });
  }
};

export const deleteArticle = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const ipAddress = getIpAddress(req);
    const { id } = req.params;

    const existing = await newsService.getArticleById(id);
    if (!existing) {
      return res.status(404).json({ error: "Article not found" });
    }

    await newsService.deleteArticle(id);

    await auditLogger.log({
      userId,
      type: "content_management",
      content: `Xóa bài viết bản tin: ${existing.title}`,
      target: existing.title,
      ipAddress,
      meta: {
        action: "delete",
        entity: "news_article",
        entityId: id,
      },
    });

    res.json({ message: "Article deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting article:", error);
    res.status(400).json({ error: error.message });
  }
};

export const toggleLike = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const ipAddress = getIpAddress(req);
    const { id } = req.params;

    const result = await newsService.toggleLike(id, userId, ipAddress);
    res.json(result);
  } catch (error: any) {
    console.error("Error toggling like:", error);
    res.status(400).json({ error: error.message });
  }
};

// Comments
export const getComments = async (req: Request, res: Response) => {
  try {
    const { articleId } = req.params;
    const comments = await newsService.getComments(articleId);
    res.json(comments);
  } catch (error: any) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: error.message });
  }
};

export const createComment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const ipAddress = getIpAddress(req);
    const { articleId } = req.params;

    const comment = await newsService.createComment({
      ...req.body,
      articleId,
      userId: userId || undefined,
    });

    await auditLogger.log({
      userId: userId || null,
      type: "content_interaction",
      content: `Thêm bình luận vào bài viết bản tin`,
      target: articleId,
      ipAddress,
      meta: {
        action: "create_comment",
        entity: "news_comment",
        entityId: comment.id,
        articleId,
      },
    });

    res.status(201).json(comment);
  } catch (error: any) {
    console.error("Error creating comment:", error);
    res.status(400).json({ error: error.message });
  }
};

export const moderateComment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const ipAddress = getIpAddress(req);
    const { commentId } = req.params;
    const { status, notes } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid moderation status" });
    }

    await newsService.moderateComment(commentId, status, userId, notes);

    await auditLogger.log({
      userId,
      type: "content_moderation",
      content: `${status === "Approved" ? "Duyệt" : "Từ chối"} bình luận`,
      target: commentId,
      ipAddress,
      meta: {
        action: "moderate_comment",
        entity: "news_comment",
        entityId: commentId,
        status,
        notes,
      },
    });

    res.json({ message: "Comment moderated successfully" });
  } catch (error: any) {
    console.error("Error moderating comment:", error);
    res.status(400).json({ error: error.message });
  }
};

