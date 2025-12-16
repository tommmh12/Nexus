/**
 * Raw Body Middleware
 * Captures raw request body for webhook signature verification
 */

import { Request, Response, NextFunction } from 'express';

export const rawBodyMiddleware = (req: Request, res: Response, next: NextFunction) => {
    let data = '';

    req.setEncoding('utf8');

    req.on('data', (chunk) => {
        data += chunk;
    });

    req.on('end', () => {
        (req as any).rawBody = data;

        // Parse JSON body manually since we consumed the stream
        if (data && req.headers['content-type']?.includes('application/json')) {
            try {
                req.body = JSON.parse(data);
            } catch (e) {
                // Leave body as-is if not valid JSON
            }
        }

        next();
    });

    req.on('error', (err) => {
        next(err);
    });
};
