import { Request, Response } from "express";
import { ForumService } from "../../application/services/ForumService.js";
import { getSocketServer } from "../../infrastructure/websocket/socketServer.js";

const forumService = new ForumService();

export class ForumController {
  // GET /api/forum/categories
  static async getCategories(req: Request, res: Response) {
    try {
      const categories = await forumService.getCategories();
      res.json({
        success: true,
        data: categories.map((cat) => ({
          id: cat.id,
          name: cat.name,
          description: cat.description,
          icon: cat.icon,
          color: cat.color_class,
          order: cat.order,
          postCount: 0, // TODO: Calculate from posts
        })),
      });
    } catch (error: any) {
      console.error("Error getting categories:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi lấy danh sách chuyên mục",
      });
    }
  }

  // POST /api/forum/categories
  static async createCategory(req: Request, res: Response) {
    try {
      const { name, description, icon, color, order } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: "Tên chuyên mục là bắt buộc",
        });
      }

      const category = await forumService.createCategory({
        name,
        description,
        icon,
        color,
        order,
      });

      res.status(201).json({
        success: true,
        data: {
          id: category.id,
          name: category.name,
          description: category.description,
          icon: category.icon,
          color: category.color_class,
          order: category.order,
        },
      });
    } catch (error: any) {
      console.error("Error creating category:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Lỗi khi tạo chuyên mục",
      });
    }
  }

  // PUT /api/forum/categories/:id
  static async updateCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, description, icon, color, order } = req.body;

      const category = await forumService.updateCategory(id, {
        name,
        description,
        icon,
        color,
        order,
      });

      res.json({
        success: true,
        data: {
          id: category.id,
          name: category.name,
          description: category.description,
          icon: category.icon,
          color: category.color_class,
          order: category.order,
        },
      });
    } catch (error: any) {
      console.error("Error updating category:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Lỗi khi cập nhật chuyên mục",
      });
    }
  }

  // DELETE /api/forum/categories/:id
  static async deleteCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await forumService.deleteCategory(id);
      res.json({
        success: true,
        message: "Đã xóa chuyên mục",
      });
    } catch (error: any) {
      console.error("Error deleting category:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Lỗi khi xóa chuyên mục",
      });
    }
  }

  // GET /api/forum/posts
  static async getPosts(req: Request, res: Response) {
    try {
      const status = req.query.status as "Pending" | "Approved" | "Rejected" | undefined;
      const posts = await forumService.getPosts(status);
      res.json({
        success: true,
        data: posts,
      });
    } catch (error: any) {
      console.error("Error getting posts:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi lấy danh sách bài viết",
      });
    }
  }

  // GET /api/forum/posts/:id
  static async getPostById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const post = await forumService.getPostById(id);
      
      if (!post) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy bài viết",
        });
      }

      res.json({
        success: true,
        data: post,
      });
    } catch (error: any) {
      console.error("Error getting post:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi lấy bài viết",
      });
    }
  }

  // POST /api/forum/posts
  static async createPost(req: Request, res: Response) {
    try {
      const { category_id, title, content, tags } = req.body;
      const author_id = req.user?.userId; // From auth middleware

      if (!author_id) {
        return res.status(401).json({
          success: false,
          message: "Chưa đăng nhập",
        });
      }

      if (!category_id || !title || !content) {
        return res.status(400).json({
          success: false,
          message: "Thiếu thông tin bắt buộc",
        });
      }

      const post = await forumService.createPost({
        category_id,
        author_id,
        title,
        content,
        tags: tags || [],
        status: "Pending",
      });

      // Emit real-time event
      const socketServer = getSocketServer();
      if (socketServer) {
        socketServer.emitForumPostCreated({
          ...post,
          authorId: author_id,
        });
      }

      res.status(201).json({
        success: true,
        data: post,
      });
    } catch (error: any) {
      console.error("Error creating post:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi tạo bài viết",
      });
    }
  }

  // PUT /api/forum/posts/:id
  static async updatePost(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { title, content, category_id, status, is_pinned, tags } = req.body;

      const post = await forumService.updatePost(id, {
        title,
        content,
        category_id,
        status,
        is_pinned,
        tags,
      });

      // Emit real-time event
      const socketServer = getSocketServer();
      if (socketServer) {
        socketServer.emitForumPostUpdated({
          ...post,
        });
      }

      res.json({
        success: true,
        data: post,
      });
    } catch (error: any) {
      console.error("Error updating post:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi cập nhật bài viết",
      });
    }
  }

  // DELETE /api/forum/posts/:id
  static async deletePost(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await forumService.deletePost(id);
      res.json({
        success: true,
        message: "Đã xóa bài viết",
      });
    } catch (error: any) {
      console.error("Error deleting post:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi xóa bài viết",
      });
    }
  }

  // POST /api/forum/posts/:id/approve
  static async approvePost(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const post = await forumService.approvePost(id);
      
      // Emit real-time event
      const socketServer = getSocketServer();
      if (socketServer) {
        socketServer.emitForumPostApproved({
          ...post,
        });
      }
      
      res.json({
        success: true,
        data: post,
      });
    } catch (error: any) {
      console.error("Error approving post:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi duyệt bài viết",
      });
    }
  }

  // POST /api/forum/posts/:id/reject
  static async rejectPost(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const post = await forumService.rejectPost(id);
      
      // Emit real-time event
      const socketServer = getSocketServer();
      if (socketServer) {
        socketServer.emitForumPostRejected({
          ...post,
        });
      }
      
      res.json({
        success: true,
        data: post,
      });
    } catch (error: any) {
      console.error("Error rejecting post:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi từ chối bài viết",
      });
    }
  }
}

