/**
 * Daily.co Service
 * Handles all interactions with Daily.co REST API
 * - Room creation/deletion
 * - Meeting token generation
 * - Webhook signature verification
 * - Automatic retry for transient failures
 */

import axios, { AxiosInstance, AxiosError } from "axios";
import crypto from "crypto";
import { createModuleLogger } from "../../infrastructure/logger.js";

const logger = createModuleLogger("DailyService");

// =====================================================
// Retry Configuration
// =====================================================

const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 5000,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// =====================================================
// Types
// =====================================================

export interface DailyRoom {
  id: string;
  name: string;
  url: string;
  privacy: "public" | "private";
  created_at: string;
  config?: {
    exp?: number;
    nbf?: number;
    enable_knocking?: boolean;
    enable_screenshare?: boolean;
    enable_chat?: boolean;
    enable_recording?: string;
  };
}

export interface DailyMeetingToken {
  token: string;
}

export interface CreateRoomOptions {
  privacy?: "public" | "private";
  expiryMinutes?: number;
  startTime?: Date; // Room opens at this time (nbf)
  endTime?: Date; // Room expires at this time (exp)
  enableKnocking?: boolean;
  enableRecording?: boolean;
}

export interface CreateTokenOptions {
  userId: string;
  userName: string;
  userEmail?: string;
  avatarUrl?: string;
  isModerator?: boolean;
  expiryMinutes?: number;
  startVideoOff?: boolean; // For voice calls, start with video off
}

export interface DailyWebhookPayload {
  event: string;
  room?: string;
  room_name?: string;
  participant?: {
    id: string;
    user_id?: string;
    user_name?: string;
    joined_at?: string;
    left_at?: string;
  };
  timestamp?: number;
}

// =====================================================
// Service Implementation
// =====================================================

export class DailyService {
  private client: AxiosInstance;
  private apiBase: string;
  private isConfigured: boolean;

  constructor() {
    this.apiBase = process.env.DAILY_API_BASE || "https://api.daily.co/v1";
    const apiKey = process.env.DAILY_API_KEY;

    this.isConfigured = !!apiKey;

    if (!apiKey) {
      logger.warn(
        "DAILY_API_KEY not configured - Daily.co integration disabled"
      );
    }

    this.client = axios.create({
      baseURL: this.apiBase,
      headers: {
        Authorization: `Bearer ${apiKey || ""}`,
        "Content-Type": "application/json",
      },
      timeout: 15000, // 15 second timeout (increased for reliability)
    });

    // Add response interceptor for error logging
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        logger.error(
          {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            data: error.response?.data,
          },
          "Daily API error"
        );
        throw error;
      }
    );
  }

  /**
   * Check if Daily.co is properly configured
   */
  isEnabled(): boolean {
    return this.isConfigured;
  }

  /**
   * Execute request with automatic retry for transient failures
   */
  private async withRetry<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (error instanceof AxiosError) {
          const status = error.response?.status;
          const isRetryable =
            status && RETRY_CONFIG.retryableStatuses.includes(status);
          const isTimeout =
            error.code === "ECONNABORTED" || error.code === "ETIMEDOUT";

          if ((isRetryable || isTimeout) && attempt < RETRY_CONFIG.maxRetries) {
            const delay = Math.min(
              RETRY_CONFIG.baseDelayMs * Math.pow(2, attempt),
              RETRY_CONFIG.maxDelayMs
            );
            logger.warn(
              {
                operationName,
                attempt: attempt + 1,
                maxRetries: RETRY_CONFIG.maxRetries,
                status,
                delay,
              },
              `Retrying ${operationName} after transient failure`
            );
            await sleep(delay);
            continue;
          }
        }

        // Non-retryable error or max retries exceeded
        throw error;
      }
    }

    throw lastError;
  }

  /**
   * Create a new Daily.co room
   */
  async createRoom(
    name: string,
    options?: CreateRoomOptions
  ): Promise<DailyRoom> {
    if (!this.isConfigured) {
      throw new Error("Daily.co is not configured");
    }

    // Calculate nbf (not before) - when room opens
    // Allow joining 5 minutes before scheduled start
    let nbf: number | undefined;
    if (options?.startTime) {
      nbf = Math.floor(options.startTime.getTime() / 1000) - 5 * 60;
    } else {
      nbf = Math.floor(Date.now() / 1000) - 60;
    }

    // Calculate exp (expiry) - when room closes
    // Add 30 minutes grace period after scheduled end
    let exp: number | undefined;
    if (options?.endTime) {
      exp = Math.floor(options.endTime.getTime() / 1000) + 30 * 60;
    } else if (options?.expiryMinutes) {
      exp = Math.floor(Date.now() / 1000) + options.expiryMinutes * 60;
    }

    logger.info(
      {
        roomName: name,
        startTime: options?.startTime,
        endTime: options?.endTime,
        nbf: nbf ? new Date(nbf * 1000).toISOString() : "none",
        exp: exp ? new Date(exp * 1000).toISOString() : "none",
      },
      "Creating Daily room with time constraints"
    );

    return this.withRetry(async () => {
      const response = await this.client.post<DailyRoom>("/rooms", {
        name,
        privacy: options?.privacy || "private",
        properties: {
          exp,
          nbf,
          enable_knocking: options?.enableKnocking ?? true,
          enable_screenshare: true,
          enable_chat: true,
          enable_recording: options?.enableRecording ? "cloud" : undefined,
          max_participants: 100,
          // Skip the "Are you ready to join?" prejoin screen
          enable_prejoin_ui: false,
        },
      });

      logger.info(
        {
          roomName: name,
          roomUrl: response.data.url,
          privacy: options?.privacy,
        },
        "Daily room created"
      );

      return response.data;
    }, "createRoom");
  }

  /**
   * Get room details
   */
  async getRoom(roomName: string): Promise<DailyRoom | null> {
    if (!this.isConfigured) {
      throw new Error("Daily.co is not configured");
    }

    try {
      return await this.withRetry(async () => {
        const response = await this.client.get<DailyRoom>(`/rooms/${roomName}`);
        return response.data;
      }, "getRoom");
    } catch (error) {
      if ((error as AxiosError).response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Delete a Daily.co room
   */
  async deleteRoom(roomName: string): Promise<boolean> {
    if (!this.isConfigured) {
      throw new Error("Daily.co is not configured");
    }

    try {
      await this.withRetry(async () => {
        await this.client.delete(`/rooms/${roomName}`);
      }, "deleteRoom");
      logger.info({ roomName }, "Daily room deleted");
      return true;
    } catch (error) {
      if ((error as AxiosError).response?.status === 404) {
        logger.warn({ roomName }, "Daily room not found for deletion");
        return false;
      }
      throw error;
    }
  }

  /**
   * Create a meeting token for a user
   */
  async createMeetingToken(
    roomName: string,
    options: CreateTokenOptions
  ): Promise<string> {
    if (!this.isConfigured) {
      throw new Error("Daily.co is not configured");
    }

    const exp = options.expiryMinutes
      ? Math.floor(Date.now() / 1000) + options.expiryMinutes * 60
      : Math.floor(Date.now() / 1000) + 7200; // 2 hours default

    return this.withRetry(async () => {
      const response = await this.client.post<DailyMeetingToken>(
        "/meeting-tokens",
        {
          properties: {
            room_name: roomName,
            user_id: options.userId,
            user_name: options.userName,
            is_owner: options.isModerator ?? false,
            enable_screenshare: true,
            start_video_off: options.startVideoOff ?? false, // Voice call = true, Video call = false
            start_audio_off: false,
            // Skip the "Are you ready to join?" prejoin screen
            enable_prejoin_ui: false,
            exp,
          },
        }
      );

      logger.debug(
        {
          roomName,
          userId: options.userId,
          isModerator: options.isModerator,
        },
        "Meeting token created"
      );

      return response.data.token;
    }, "createMeetingToken");
  }

  /**
   * Verify webhook signature from Daily.co
   * @see https://docs.daily.co/reference/rest-api/webhooks
   */
  verifyWebhookSignature(
    rawBody: string,
    signature: string,
    timestamp: string
  ): boolean {
    const secret = process.env.DAILY_WEBHOOK_SECRET;

    if (!secret) {
      logger.error(
        "DAILY_WEBHOOK_SECRET not configured - cannot verify webhook"
      );
      return false;
    }

    // Check timestamp freshness (5 minute window to prevent replay attacks)
    const timestampMs = parseInt(timestamp, 10) * 1000;
    const now = Date.now();
    const fiveMinutesMs = 5 * 60 * 1000;

    if (Math.abs(now - timestampMs) > fiveMinutesMs) {
      logger.warn(
        {
          timestamp,
          now: Math.floor(now / 1000),
          diff: Math.abs(now - timestampMs) / 1000,
        },
        "Webhook timestamp too old - possible replay attack"
      );
      return false;
    }

    // Compute expected signature
    // Daily uses: HMAC-SHA256(timestamp + "." + rawBody, base64_decoded_secret)
    const signedPayload = `${timestamp}.${rawBody}`;

    try {
      const secretBuffer = Buffer.from(secret, "base64");
      const expectedSignature = crypto
        .createHmac("sha256", secretBuffer)
        .update(signedPayload)
        .digest("hex");

      // Timing-safe comparison
      const isValid = crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );

      if (!isValid) {
        logger.warn("Webhook signature mismatch");
      }

      return isValid;
    } catch (error) {
      logger.error({ error }, "Error verifying webhook signature");
      return false;
    }
  }

  /**
   * Parse webhook payload
   */
  parseWebhookPayload(body: unknown): DailyWebhookPayload | null {
    try {
      const payload = body as DailyWebhookPayload;
      if (!payload.event) {
        logger.warn({ body }, "Invalid webhook payload - missing event");
        return null;
      }
      return payload;
    } catch (error) {
      logger.error({ error, body }, "Failed to parse webhook payload");
      return null;
    }
  }
}

// Singleton instance
export const dailyService = new DailyService();
