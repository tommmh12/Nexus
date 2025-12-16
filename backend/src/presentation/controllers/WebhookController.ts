/**
 * Webhook Controller
 * Handles incoming webhooks from Daily.co
 * - Signature verification
 * - Async processing
 */

import { Request, Response } from "express";
import { dailyService } from "../../application/services/DailyService.js";
import { MeetingService } from "../../application/services/MeetingService.js";
import { MeetingRepository } from "../../infrastructure/repositories/MeetingRepository.js";
import { createModuleLogger } from "../../infrastructure/logger.js";

const logger = createModuleLogger('WebhookController');
const meetingService = new MeetingService(new MeetingRepository());

// =====================================================
// Daily.co Webhook Handler
// =====================================================

export const dailyWebhook = async (req: Request, res: Response) => {
    const startTime = Date.now();

    try {
        // Get signature and timestamp from headers
        const signature = req.headers['x-webhook-signature'] as string;
        const timestamp = req.headers['x-webhook-timestamp'] as string;

        if (!signature || !timestamp) {
            logger.warn('Missing webhook signature or timestamp');
            return res.status(401).json({ error: 'Missing signature' });
        }

        // Get raw body for signature verification
        // This requires rawBodyMiddleware to have stored it
        const rawBody = (req as any).rawBody as string;

        if (!rawBody) {
            logger.error('Raw body not available for signature verification');
            return res.status(500).json({ error: 'Internal error' });
        }

        // Verify signature
        const isValid = dailyService.verifyWebhookSignature(rawBody, signature, timestamp);

        if (!isValid) {
            logger.warn({
                signature: signature.substring(0, 10) + '...',
                timestamp
            }, 'Invalid webhook signature');
            return res.status(401).json({ error: 'Invalid signature' });
        }

        // ACK immediately (Daily expects fast response)
        res.status(200).json({ received: true });

        // Process async (don't block response)
        const payload = dailyService.parseWebhookPayload(req.body);

        if (payload) {
            // Fire and forget - don't await
            setImmediate(async () => {
                try {
                    await meetingService.handleDailyWebhook(payload.event, payload);
                    logger.info({
                        event: payload.event,
                        processingTime: Date.now() - startTime
                    }, 'Webhook processed');
                } catch (err) {
                    logger.error({
                        error: (err as Error).message,
                        event: payload.event
                    }, 'Error processing webhook async');
                }
            });
        }
    } catch (error: any) {
        logger.error({ error: error.message }, 'Error handling Daily webhook');

        // If we haven't responded yet
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal error' });
        }
    }
};
