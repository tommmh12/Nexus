/**
 * Webhook Routes
 * Public endpoints for external webhook providers
 * Note: These routes do NOT use authMiddleware
 */

import { Router } from "express";
import { dailyWebhook } from "../controllers/WebhookController.js";
import { rawBodyMiddleware } from "../middlewares/rawBody.middleware.js";

const router = Router();

// =====================================================
// Daily.co Webhooks
// =====================================================

// Daily.co webhook endpoint
// Uses rawBodyMiddleware for signature verification
// Does NOT use authMiddleware (external service)
router.post("/daily", rawBodyMiddleware, dailyWebhook);

// Health check for webhook endpoint
router.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

export default router;
