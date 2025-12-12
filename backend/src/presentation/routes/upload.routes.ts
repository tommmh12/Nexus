import { Router, Request, Response } from "express";
import {
  commentImageUpload,
  getImageUrl,
  avatarUpload,
  getAvatarUrl,
} from "../../application/services/uploadService.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { UserRepository } from "../../infrastructure/repositories/UserRepository.js";

const router = Router();
const userRepository = new UserRepository();

// All routes require authentication
router.use(authMiddleware);

/**
 * POST /api/upload/comment-image
 * Upload an image for use in comments
 */
router.post(
  "/comment-image",
  commentImageUpload.single("image"),
  (req: Request, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: "Không có file được upload",
        });
        return;
      }

      const imageUrl = getImageUrl(req.file.filename);

      res.json({
        success: true,
        data: {
          url: imageUrl,
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
        },
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Lỗi khi upload file",
      });
    }
  }
);

/**
 * POST /api/upload/avatar
 * Upload avatar for current user and update profile
 */
router.post(
  "/avatar",
  avatarUpload.single("avatar"),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: "Không có file được upload",
        });
        return;
      }

      const userId = (req as any).user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const avatarUrl = getAvatarUrl(req.file.filename);
      const fullAvatarUrl = `http://localhost:5000${avatarUrl}`;

      // Update user's avatar_url in database
      await userRepository.updateProfile(userId, {
        avatar_url: fullAvatarUrl,
      });

      res.json({
        success: true,
        message: "Upload avatar thành công",
        data: {
          url: fullAvatarUrl,
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
        },
      });
    } catch (error: any) {
      console.error("Avatar upload error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Lỗi khi upload avatar",
      });
    }
  }
);

export default router;
