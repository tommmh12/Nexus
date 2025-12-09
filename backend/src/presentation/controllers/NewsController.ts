import { Request, Response } from "express";
import { NewsService } from "../../application/services/NewsService.js";

const newsService = new NewsService();

export class NewsController {
  // GET /api/news
  static async getArticles(req: Request, res: Response) {
    try {
      const status = req.query.status as "Draft" | "Published" | "Archived" | undefined;
      const articles = await newsService.getArticles(status);
      res.json({
        success: true,
        data: articles,
      });
    } catch (error: any) {
      console.error("Error getting articles:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi lấy danh sách bài viết",
      });
    }
  }

  // GET /api/news/:id
  static async getArticleById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const article = await newsService.getArticleById(id);
      
      if (!article) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy bài viết",
        });
      }

      // Increment view count
      await newsService.incrementViewCount(id);

      res.json({
        success: true,
        data: article,
      });
    } catch (error: any) {
      console.error("Error getting article:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi lấy bài viết",
      });
    }
  }

  // POST /api/news
  static async createArticle(req: Request, res: Response) {
    try {
      const { title, summary, content, cover_image, category, is_featured, read_time, tags } = req.body;
      const author_id = req.user?.userId; // From auth middleware

      if (!author_id) {
        return res.status(401).json({
          success: false,
          message: "Chưa đăng nhập",
        });
      }

      if (!title || !content || !category) {
        return res.status(400).json({
          success: false,
          message: "Thiếu thông tin bắt buộc",
        });
      }

      const article = await newsService.createArticle({
        title,
        summary,
        content,
        cover_image,
        category,
        author_id,
        status: "Draft",
        is_featured: is_featured || false,
        read_time,
        tags: tags || [],
      });

      // Emit real-time event
      const socketServer = getSocketServer();
      if (socketServer) {
        socketServer.emitNewsArticleCreated({
          ...article,
          authorId: author_id,
        });
      }

      res.status(201).json({
        success: true,
        data: article,
      });
    } catch (error: any) {
      console.error("Error creating article:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi tạo bài viết",
      });
    }
  }

  // PUT /api/news/:id
  static async updateArticle(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { title, summary, content, cover_image, category, status, is_featured, read_time, tags } = req.body;

      const article = await newsService.updateArticle(id, {
        title,
        summary,
        content,
        cover_image,
        category,
        status,
        is_featured,
        read_time,
        tags,
      });

      // Emit real-time event
      const socketServer = getSocketServer();
      if (socketServer) {
        socketServer.emitNewsArticleUpdated({
          ...article,
        });
      }

      res.json({
        success: true,
        data: article,
      });
    } catch (error: any) {
      console.error("Error updating article:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi cập nhật bài viết",
      });
    }
  }

  // DELETE /api/news/:id
  static async deleteArticle(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await newsService.deleteArticle(id);
      res.json({
        success: true,
        message: "Đã xóa bài viết",
      });
    } catch (error: any) {
      console.error("Error deleting article:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi xóa bài viết",
      });
    }
  }

  // POST /api/news/:id/publish
  static async publishArticle(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const article = await newsService.publishArticle(id);
      
      // Emit real-time event
      const socketServer = getSocketServer();
      if (socketServer) {
        socketServer.emitNewsArticlePublished({
          ...article,
        });
      }
      
      res.json({
        success: true,
        data: article,
      });
    } catch (error: any) {
      console.error("Error publishing article:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi xuất bản bài viết",
      });
    }
  }

  // POST /api/news/:id/archive
  static async archiveArticle(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const article = await newsService.archiveArticle(id);
      
      // Emit real-time event
      const socketServer = getSocketServer();
      if (socketServer) {
        socketServer.emitNewsArticleArchived({
          ...article,
        });
      }
      
      res.json({
        success: true,
        data: article,
      });
    } catch (error: any) {
      console.error("Error archiving article:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi lưu trữ bài viết",
      });
    }
  }
}

