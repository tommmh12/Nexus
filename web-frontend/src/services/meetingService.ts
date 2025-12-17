/**
 * Meeting Service (v2)
 * API service for meeting management with Daily.co support
 * - Retry logic for transient failures
 * - Proper error handling with typed errors
 * - Request cancellation support
 */

import axios, { AxiosError, CancelTokenSource } from "axios";
import {
    MeetingDetails,
    CreateMeetingRequest,
    JoinMeetingRequest,
    JoinMeetingResponse,
    AddParticipantsRequest,
    AttendanceReportEntry,
} from "../types/meeting.types";

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL?.replace(/\/api$/, '/api/v2') || "http://localhost:5000/api/v2";

// =====================================================
// Error Types
// =====================================================

export interface MeetingApiError {
    code: string;
    message: string;
    statusCode: number;
}

export class MeetingServiceError extends Error {
    constructor(
        message: string,
        public code: string,
        public statusCode: number
    ) {
        super(message);
        this.name = 'MeetingServiceError';
    }

    static fromAxiosError(error: AxiosError<{ code?: string; message?: string }>): MeetingServiceError {
        const status = error.response?.status || 500;
        const code = error.response?.data?.code || 'UNKNOWN_ERROR';
        const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
        return new MeetingServiceError(message, code, status);
    }
}

// =====================================================
// Helpers
// =====================================================

// Generate a unique client instance ID for this browser session
const getClientInstanceId = (): string => {
    let instanceId = sessionStorage.getItem('meetingClientInstanceId');
    if (!instanceId) {
        instanceId = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
        sessionStorage.setItem('meetingClientInstanceId', instanceId);
    }
    return instanceId;
};

// Get auth token from localStorage  
const getAuthHeaders = () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
        throw new MeetingServiceError('Not authenticated', 'UNAUTHORIZED', 401);
    }
    return {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    };
};

// Retry configuration
const RETRY_CONFIG = {
    maxRetries: 2,
    retryDelay: 1000, // ms
    retryableStatuses: [408, 429, 500, 502, 503, 504],
};

// Sleep helper
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Retry wrapper for API calls
async function withRetry<T>(
    operation: () => Promise<T>,
    retries = RETRY_CONFIG.maxRetries
): Promise<T> {
    try {
        return await operation();
    } catch (error) {
        if (error instanceof AxiosError) {
            const status = error.response?.status;
            if (status && RETRY_CONFIG.retryableStatuses.includes(status) && retries > 0) {
                console.warn(`[MeetingService] Retrying after ${status} error, ${retries} retries left`);
                await sleep(RETRY_CONFIG.retryDelay);
                return withRetry(operation, retries - 1);
            }
            throw MeetingServiceError.fromAxiosError(error);
        }
        throw error;
    }
}

// Store for cancel tokens
const cancelTokens: Map<string, CancelTokenSource> = new Map();

function getCancelToken(key: string): CancelTokenSource {
    // Cancel any existing request with the same key
    const existing = cancelTokens.get(key);
    if (existing) {
        existing.cancel('Request superseded');
    }
    const source = axios.CancelToken.source();
    cancelTokens.set(key, source);
    return source;
}

// =====================================================
// Service Implementation
// =====================================================

export const meetingService = {
    /**
     * Create a new meeting
     */
    async createMeeting(data: CreateMeetingRequest): Promise<MeetingDetails> {
        return withRetry(async () => {
            const response = await axios.post(`${API_BASE_URL}/meetings`, data, {
                headers: getAuthHeaders(),
            });
            return response.data.data;
        });
    },

    /**
     * Get all meetings accessible by current user
     */
    async getMeetings(): Promise<MeetingDetails[]> {
        const cancelSource = getCancelToken('getMeetings');
        return withRetry(async () => {
            const response = await axios.get(`${API_BASE_URL}/meetings`, {
                headers: getAuthHeaders(),
                cancelToken: cancelSource.token,
            });
            return response.data.data;
        });
    },

    /**
     * Get meeting by ID
     */
    async getMeetingById(id: string): Promise<MeetingDetails> {
        if (!id) {
            throw new MeetingServiceError('Meeting ID is required', 'VALIDATION_ERROR', 400);
        }
        return withRetry(async () => {
            const response = await axios.get(`${API_BASE_URL}/meetings/${id}`, {
                headers: getAuthHeaders(),
            });
            return response.data.data;
        });
    },

    /**
     * Join a meeting (POST - with side effects)
     * Returns room URL and token for Daily.co
     * No retry - joining should be explicit
     */
    async joinMeeting(meetingId: string): Promise<JoinMeetingResponse> {
        if (!meetingId) {
            throw new MeetingServiceError('Meeting ID is required', 'VALIDATION_ERROR', 400);
        }

        const request: JoinMeetingRequest = {
            clientInstanceId: getClientInstanceId(),
            deviceInfo: navigator.userAgent,
        };

        try {
            const response = await axios.post(
                `${API_BASE_URL}/meetings/${meetingId}/join`,
                request,
                {
                    headers: getAuthHeaders(),
                    timeout: 30000, // 30s timeout for join
                }
            );
            return response.data.data;
        } catch (error) {
            if (error instanceof AxiosError) {
                throw MeetingServiceError.fromAxiosError(error);
            }
            throw error;
        }
    },

    /**
     * Add participants to a meeting
     */
    async addParticipants(
        meetingId: string,
        data: AddParticipantsRequest
    ): Promise<MeetingDetails> {
        if (!meetingId) {
            throw new MeetingServiceError('Meeting ID is required', 'VALIDATION_ERROR', 400);
        }
        if (!data.userIds || data.userIds.length === 0) {
            throw new MeetingServiceError('At least one participant is required', 'VALIDATION_ERROR', 400);
        }

        return withRetry(async () => {
            const response = await axios.post(
                `${API_BASE_URL}/meetings/${meetingId}/participants`,
                data,
                {
                    headers: getAuthHeaders(),
                }
            );
            return response.data.data;
        });
    },

    /**
     * Remove a participant from a meeting
     */
    async removeParticipant(meetingId: string, userId: string): Promise<void> {
        if (!meetingId || !userId) {
            throw new MeetingServiceError('Meeting ID and User ID are required', 'VALIDATION_ERROR', 400);
        }

        return withRetry(async () => {
            await axios.delete(
                `${API_BASE_URL}/meetings/${meetingId}/participants/${userId}`,
                {
                    headers: getAuthHeaders(),
                }
            );
        });
    },

    /**
     * End a meeting
     */
    async endMeeting(meetingId: string, reason?: string): Promise<void> {
        if (!meetingId) {
            throw new MeetingServiceError('Meeting ID is required', 'VALIDATION_ERROR', 400);
        }

        return withRetry(async () => {
            await axios.post(
                `${API_BASE_URL}/meetings/${meetingId}/end`,
                { reason },
                {
                    headers: getAuthHeaders(),
                }
            );
        });
    },

    /**
     * Cancel a meeting
     */
    async cancelMeeting(meetingId: string, reason?: string): Promise<void> {
        if (!meetingId) {
            throw new MeetingServiceError('Meeting ID is required', 'VALIDATION_ERROR', 400);
        }

        return withRetry(async () => {
            await axios.post(
                `${API_BASE_URL}/meetings/${meetingId}/cancel`,
                { reason },
                {
                    headers: getAuthHeaders(),
                }
            );
        });
    },

    /**
     * Delete a meeting (soft delete)
     */
    async deleteMeeting(meetingId: string): Promise<void> {
        if (!meetingId) {
            throw new MeetingServiceError('Meeting ID is required', 'VALIDATION_ERROR', 400);
        }

        return withRetry(async () => {
            await axios.delete(`${API_BASE_URL}/meetings/${meetingId}`, {
                headers: getAuthHeaders(),
            });
        });
    },

    /**
     * Get attendance report for a meeting
     */
    async getAttendanceReport(meetingId: string): Promise<AttendanceReportEntry[]> {
        if (!meetingId) {
            throw new MeetingServiceError('Meeting ID is required', 'VALIDATION_ERROR', 400);
        }

        return withRetry(async () => {
            const response = await axios.get(
                `${API_BASE_URL}/meetings/${meetingId}/attendance`,
                {
                    headers: getAuthHeaders(),
                }
            );
            return response.data.data;
        });
    },

    /**
     * Cancel all pending requests (useful for cleanup)
     */
    cancelAllRequests(): void {
        cancelTokens.forEach((source, key) => {
            source.cancel('Cancelled by user');
            cancelTokens.delete(key);
        });
    },
};

export default meetingService;
