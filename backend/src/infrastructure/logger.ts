/**
 * Structured Logger using Pino
 * Provides consistent logging across the application
 */

import pino from 'pino';

const isDevelopment = process.env.NODE_ENV !== 'production';

export const logger = pino({
    level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
    transport: isDevelopment
        ? {
            target: 'pino-pretty',
            options: {
                colorize: true,
                translateTime: 'SYS:standard',
                ignore: 'pid,hostname',
            },
        }
        : undefined,
    base: {
        service: 'nexus-backend',
    },
    formatters: {
        level: (label: string) => ({ level: label }),
    },
});

// Create child loggers for specific modules
export const createModuleLogger = (moduleName: string) => {
    return logger.child({ module: moduleName });
};

// Request context logger
export const createRequestLogger = (correlationId: string, userId?: string) => {
    return logger.child({ correlationId, userId });
};

export default logger;
