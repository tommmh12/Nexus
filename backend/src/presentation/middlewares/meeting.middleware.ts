/**
 * Meeting Middleware
 * - Rate limiting for meeting operations
 * - Request validation
 */

import { Request, Response, NextFunction } from "express";
import { createModuleLogger } from "../../infrastructure/logger.js";

const logger = createModuleLogger('MeetingMiddleware');

// =====================================================
// Rate Limiting Configuration
// =====================================================

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

// Separate rate limits for different operations
const joinRateLimit = new Map<string, RateLimitEntry>();
const createRateLimit = new Map<string, RateLimitEntry>();

const RATE_LIMITS = {
    JOIN: {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 10, // 10 joins per minute per user
    },
    CREATE: {
        windowMs: 60 * 60 * 1000, // 1 hour
        maxRequests: 20, // 20 meetings per hour per user
    },
} as const;

// Cleanup old entries periodically
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of joinRateLimit.entries()) {
        if (now > entry.resetTime) {
            joinRateLimit.delete(key);
        }
    }
    for (const [key, entry] of createRateLimit.entries()) {
        if (now > entry.resetTime) {
            createRateLimit.delete(key);
        }
    }
}, 60 * 1000); // Cleanup every minute

// =====================================================
// Rate Limit Middleware Factory
// =====================================================

function createRateLimiter(
    store: Map<string, RateLimitEntry>,
    config: { windowMs: number; maxRequests: number },
    operationName: string
) {
    return (req: Request, res: Response, next: NextFunction) => {
        const userId = (req as any).user?.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                code: 'UNAUTHORIZED',
                message: 'Authentication required',
            });
        }

        const now = Date.now();
        const entry = store.get(userId);

        if (!entry || now > entry.resetTime) {
            // New window
            store.set(userId, {
                count: 1,
                resetTime: now + config.windowMs,
            });
            return next();
        }

        if (entry.count >= config.maxRequests) {
            const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
            logger.warn({ userId, operationName, count: entry.count }, 'Rate limit exceeded');
            
            res.setHeader('Retry-After', retryAfter.toString());
            res.setHeader('X-RateLimit-Limit', config.maxRequests.toString());
            res.setHeader('X-RateLimit-Remaining', '0');
            res.setHeader('X-RateLimit-Reset', entry.resetTime.toString());

            return res.status(429).json({
                success: false,
                code: 'RATE_LIMIT_EXCEEDED',
                message: `Too many ${operationName} requests. Please try again in ${retryAfter} seconds.`,
                retryAfter,
            });
        }

        // Increment counter
        entry.count++;
        
        // Set rate limit headers
        res.setHeader('X-RateLimit-Limit', config.maxRequests.toString());
        res.setHeader('X-RateLimit-Remaining', (config.maxRequests - entry.count).toString());
        res.setHeader('X-RateLimit-Reset', entry.resetTime.toString());

        next();
    };
}

// =====================================================
// Exported Middlewares
// =====================================================

/**
 * Rate limit for joining meetings
 * Prevents abuse of the join endpoint which creates Daily.co tokens
 */
export const rateLimitJoin = createRateLimiter(
    joinRateLimit,
    RATE_LIMITS.JOIN,
    'join'
);

/**
 * Rate limit for creating meetings
 * Prevents spam creation of meetings/Daily.co rooms
 */
export const rateLimitCreate = createRateLimiter(
    createRateLimit,
    RATE_LIMITS.CREATE,
    'create'
);

// =====================================================
// Input Validation Middleware
// =====================================================

/**
 * Validate meeting ID format (UUID)
 */
export const validateMeetingId = (req: Request, res: Response, next: NextFunction): void => {
    const meetingId = req.params.id;
    
    if (!meetingId) {
        res.status(400).json({
            success: false,
            code: 'VALIDATION_ERROR',
            message: 'Meeting ID is required',
        });
        return;
    }

    // UUID v4 format validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(meetingId)) {
        res.status(400).json({
            success: false,
            code: 'VALIDATION_ERROR',
            message: 'Invalid meeting ID format',
        });
        return;
    }

    next();
};

/**
 * Validate create meeting request body
 */
export const validateCreateMeeting = (req: Request, res: Response, next: NextFunction): void => {
    const { title, scheduledStart, accessMode } = req.body;

    const errors: string[] = [];

    if (!title || typeof title !== 'string') {
        errors.push('Title is required');
    } else if (title.trim().length < 3) {
        errors.push('Title must be at least 3 characters');
    } else if (title.length > 200) {
        errors.push('Title cannot exceed 200 characters');
    }

    if (!scheduledStart) {
        errors.push('Scheduled start time is required');
    } else {
        const startDate = new Date(scheduledStart);
        if (isNaN(startDate.getTime())) {
            errors.push('Invalid scheduled start time format');
        }
    }

    if (accessMode && accessMode !== 'public' && accessMode !== 'private') {
        errors.push('Access mode must be "public" or "private"');
    }

    if (errors.length > 0) {
        res.status(400).json({
            success: false,
            code: 'VALIDATION_ERROR',
            message: errors.join('. '),
            errors,
        });
        return;
    }

    next();
};
