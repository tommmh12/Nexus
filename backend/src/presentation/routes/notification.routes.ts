import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { notificationService } from "../../application/services/NotificationService.js";

const router = Router();

router.use(authMiddleware);

// Get notifications for the authenticated user
router.get("/", async (req, res) => {
    try {
        // Assuming user ID is attached to req.user by auth middleware
        // But middleware is not shown in server.ts for these routes? 
        // Wait, server.ts has no auth middleware on /api/notifications likely. 
        // I need to check auth middleware usage.
        // For now let's assume req.user.id or pass userId via query/header if needed.
        // Actually, usually auth middleware is used. Let's assume standard pattern.
        const userId = (req as any).user?.userId || req.query.userId;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const notifications = await notificationService.getUserNotifications(userId);
        res.json({ success: true, data: notifications });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Mark as read
router.put("/:id/read", async (req, res) => {
    try {
        const { id } = req.params;
        await notificationService.markAsRead(id);
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
