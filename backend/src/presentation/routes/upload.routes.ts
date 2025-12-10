import { Router, Request, Response } from 'express';
import { commentImageUpload, getImageUrl } from '../../application/services/uploadService.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * POST /api/upload/comment-image
 * Upload an image for use in comments
 */
router.post('/comment-image', commentImageUpload.single('image'), (req: Request, res: Response) => {
    try {
        if (!req.file) {
            res.status(400).json({
                success: false,
                message: 'Không có file được upload'
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
                size: req.file.size
            }
        });
    } catch (error: any) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Lỗi khi upload file'
        });
    }
});

export default router;

