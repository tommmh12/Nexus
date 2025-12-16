/**
 * Meeting Configuration
 * Daily.co ONLY - Jitsi has been removed
 * Fail-fast: app won't start if DAILY_API_KEY is missing
 */

import { createModuleLogger } from '../infrastructure/logger.js';

const logger = createModuleLogger('MeetingConfig');

// =====================================================
// Types
// =====================================================

export type MeetingProviderType = 'DAILY' | 'NONE';

export interface DailyConfig {
    apiKey: string;
    apiBase: string;
    webhookSecret?: string;
}

export interface MeetingConfig {
    provider: MeetingProviderType;
    daily: DailyConfig;
}

// =====================================================
// Configuration Service
// =====================================================

class MeetingConfigService {
    private config: MeetingConfig | null = null;
    private validated = false;

    /**
     * Validate and load meeting configuration
     * Call this at app startup - will throw if DAILY_API_KEY is missing
     */
    validate(): MeetingConfig {
        if (this.validated && this.config) {
            return this.config;
        }

        const dailyApiKey = process.env.DAILY_API_KEY;

        // FAIL-FAST: DAILY_API_KEY is required
        if (!dailyApiKey || dailyApiKey === 'your_daily_api_key_here') {
            const errorMsg = `
================================================================================
FATAL: DAILY_API_KEY is required for video conferencing.

To fix:
1. Get your API key from https://dashboard.daily.co/developers
2. Add to your .env file:
   DAILY_API_KEY=your_actual_api_key_here

The app cannot start without a valid Daily.co API key.
================================================================================`;
            logger.error(errorMsg);
            throw new Error('DAILY_API_KEY is required. See logs for details.');
        }

        this.config = {
            provider: 'DAILY',
            daily: {
                apiKey: dailyApiKey,
                apiBase: process.env.DAILY_API_BASE || 'https://api.daily.co/v1',
                webhookSecret: process.env.DAILY_WEBHOOK_SECRET,
            },
        };

        this.validated = true;

        logger.info({
            provider: 'DAILY',
            apiBase: this.config.daily.apiBase,
            hasWebhookSecret: !!this.config.daily.webhookSecret,
        }, 'Meeting configuration validated - Daily.co enabled');

        return this.config;
    }

    /**
     * Get current meeting configuration
     */
    get(): MeetingConfig {
        if (!this.validated || !this.config) {
            return this.validate();
        }
        return this.config;
    }

    /**
     * Check if Daily.co is enabled (always true after validation)
     */
    isDailyEnabled(): boolean {
        return this.validated && this.config !== null;
    }
}

// Singleton instance
export const meetingConfig = new MeetingConfigService();

// Export validation function for app startup
export function validateMeetingConfig(): void {
    meetingConfig.validate();
}

