/**
 * Meeting Service
 * Business logic layer for meeting operations
 * - State machine enforcement
 * - Daily.co provider ONLY
 * - Attendance tracking
 * - Webhook handling
 * - Input validation
 * - Error handling with specific error types
 */

import { MeetingRepository } from '../../infrastructure/repositories/MeetingRepository.js';
import { dailyService } from './DailyService.js';
import {
    Meeting,
    MeetingStatus,
    MeetingProvider,
    JoinMeetingResponse,
    CreateMeetingDTO,
    JoinMeetingDTO,
    DailyProviderConfig,
    isValidTransition,
} from '../../domain/entities/Meeting.js';
import { createModuleLogger } from '../../infrastructure/logger.js';

const logger = createModuleLogger('MeetingService');

// =====================================================
// Error Types for better error handling
// =====================================================

export class MeetingError extends Error {
    constructor(
        message: string,
        public code: string,
        public statusCode: number = 400
    ) {
        super(message);
        this.name = 'MeetingError';
    }
}

export class MeetingNotFoundError extends MeetingError {
    constructor(meetingId: string) {
        super(`Meeting not found: ${meetingId}`, 'MEETING_NOT_FOUND', 404);
    }
}

export class MeetingAccessDeniedError extends MeetingError {
    constructor() {
        super('Access denied to this meeting', 'ACCESS_DENIED', 403);
    }
}

export class MeetingValidationError extends MeetingError {
    constructor(message: string) {
        super(message, 'VALIDATION_ERROR', 400);
    }
}

export class MeetingProviderError extends MeetingError {
    constructor(message: string) {
        super(message, 'PROVIDER_ERROR', 503);
    }
}

// =====================================================
// Constants
// =====================================================

const MEETING_CONSTRAINTS = {
    TITLE_MIN_LENGTH: 3,
    TITLE_MAX_LENGTH: 200,
    DESCRIPTION_MAX_LENGTH: 2000,
    MAX_DURATION_HOURS: 8,
    PAST_TOLERANCE_MINUTES: 5,
    IDEMPOTENCY_WINDOW_SECONDS: 30,
    TOKEN_EXPIRY_MINUTES: 180,
    ROOM_EXPIRY_HOURS: 24,
} as const;

// =====================================================
// Service Implementation
// =====================================================

export class MeetingService {
    private repo: MeetingRepository;

    constructor(repo?: MeetingRepository) {
        this.repo = repo || new MeetingRepository();
    }

    // =====================================================
    // Input Validation Helpers
    // =====================================================

    private validateTitle(title: string): void {
        if (!title || typeof title !== 'string') {
            throw new MeetingValidationError('Title is required');
        }
        const trimmed = title.trim();
        if (trimmed.length < MEETING_CONSTRAINTS.TITLE_MIN_LENGTH) {
            throw new MeetingValidationError(`Title must be at least ${MEETING_CONSTRAINTS.TITLE_MIN_LENGTH} characters`);
        }
        if (trimmed.length > MEETING_CONSTRAINTS.TITLE_MAX_LENGTH) {
            throw new MeetingValidationError(`Title cannot exceed ${MEETING_CONSTRAINTS.TITLE_MAX_LENGTH} characters`);
        }
    }

    private validateDescription(description?: string): void {
        if (description && description.length > MEETING_CONSTRAINTS.DESCRIPTION_MAX_LENGTH) {
            throw new MeetingValidationError(`Description cannot exceed ${MEETING_CONSTRAINTS.DESCRIPTION_MAX_LENGTH} characters`);
        }
    }

    private validateScheduledTimes(scheduledStart: string, scheduledEnd?: string): { start: Date; end?: Date } {
        const start = new Date(scheduledStart);
        if (isNaN(start.getTime())) {
            throw new MeetingValidationError('Invalid scheduled start time format');
        }

        const now = new Date();
        const pastTolerance = new Date(now.getTime() - MEETING_CONSTRAINTS.PAST_TOLERANCE_MINUTES * 60 * 1000);
        if (start < pastTolerance) {
            throw new MeetingValidationError('Cannot schedule meeting in the past');
        }

        let end: Date | undefined;
        if (scheduledEnd) {
            end = new Date(scheduledEnd);
            if (isNaN(end.getTime())) {
                throw new MeetingValidationError('Invalid scheduled end time format');
            }
            if (end <= start) {
                throw new MeetingValidationError('End time must be after start time');
            }
            const durationMs = end.getTime() - start.getTime();
            const maxDurationMs = MEETING_CONSTRAINTS.MAX_DURATION_HOURS * 60 * 60 * 1000;
            if (durationMs > maxDurationMs) {
                throw new MeetingValidationError(`Meeting duration cannot exceed ${MEETING_CONSTRAINTS.MAX_DURATION_HOURS} hours`);
            }
        }

        return { start, end };
    }

    private validateAccessMode(accessMode: string): 'public' | 'private' {
        if (accessMode !== 'public' && accessMode !== 'private') {
            throw new MeetingValidationError('Access mode must be "public" or "private"');
        }
        return accessMode;
    }

    // =====================================================
    // Create Meeting
    // =====================================================

    async createMeeting(dto: CreateMeetingDTO, creatorId: string): Promise<Meeting> {
        logger.info({ title: dto.title, creatorId }, 'Creating meeting...');

        // === Input Validation ===
        this.validateTitle(dto.title);
        this.validateDescription(dto.description);
        const { start: startTime, end: endTime } = this.validateScheduledTimes(dto.scheduledStart, dto.scheduledEnd);
        const accessMode = this.validateAccessMode(dto.accessMode);

        // Sanitize title and description
        const sanitizedTitle = dto.title.trim();
        const sanitizedDescription = dto.description?.trim();

        // === Determine provider ===
        const meetingType = dto.type || 'ONLINE';
        let provider: MeetingProvider = 'NONE';
        let providerConfig = null;

        if (meetingType === 'ONLINE' || meetingType === 'HYBRID') {
            if (!dailyService.isEnabled()) {
                throw new MeetingProviderError('Video conference not configured. DAILY_API_KEY is required.');
            }

            provider = 'DAILY';
            const roomName = this.generateRoomName();

            try {
                const room = await dailyService.createRoom(roomName, {
                    privacy: accessMode === 'private' ? 'private' : 'public',
                    startTime,
                    endTime,
                    expiryMinutes: endTime ? undefined : MEETING_CONSTRAINTS.MAX_DURATION_HOURS * 60,
                });

                providerConfig = {
                    version: 1,
                    roomName: room.name,
                    roomUrl: room.url,
                    privacy: room.privacy,
                } as DailyProviderConfig;
            } catch (error: any) {
                logger.error({ error: error.message, roomName }, 'Failed to create Daily room');
                throw new MeetingProviderError('Failed to create video room. Please try again.');
            }
        }

        // === Create meeting in database ===
        try {
            const meeting = await this.repo.createMeeting({
                ...dto,
                title: sanitizedTitle,
                description: sanitizedDescription,
                accessMode,
                type: meetingType,
                provider,
                providerConfig,
            }, creatorId);

            // === Record initial status ===
            await this.repo.recordStatusChange(
                meeting.id,
                null,
                'scheduled',
                creatorId,
                'Meeting created'
            );

            logger.info({
                meetingId: meeting.id,
                provider,
                type: meetingType,
                creatorId
            }, 'Meeting created successfully');

            return meeting;
        } catch (error: any) {
            // Cleanup Daily room if database insert fails
            if (providerConfig && provider === 'DAILY') {
                try {
                    await dailyService.deleteRoom((providerConfig as DailyProviderConfig).roomName);
                } catch (cleanupError) {
                    logger.warn({ error: cleanupError }, 'Failed to cleanup Daily room after DB error');
                }
            }
            logger.error({ error: error.message }, 'Failed to create meeting in database');
            throw new MeetingError('Failed to create meeting', 'DATABASE_ERROR', 500);
        }
    }

    // =====================================================
    // Join Meeting
    // =====================================================

    async joinMeeting(
        meetingId: string,
        userId: string,
        dto: JoinMeetingDTO = {}
    ): Promise<JoinMeetingResponse> {
        // Validate meetingId format
        if (!meetingId || typeof meetingId !== 'string') {
            throw new MeetingValidationError('Invalid meeting ID');
        }

        const meeting = await this.repo.getMeetingById(meetingId);
        if (!meeting) {
            throw new MeetingNotFoundError(meetingId);
        }

        // === Check access ===
        const hasAccess = await this.repo.checkUserAccess(meetingId, userId);
        if (!hasAccess) {
            logger.warn({ meetingId, userId }, 'Access denied to meeting');
            throw new MeetingAccessDeniedError();
        }

        // === Validate state ===
        if (meeting.status === 'cancelled') {
            throw new MeetingValidationError('Cannot join cancelled meeting');
        }
        if (meeting.status === 'ended') {
            throw new MeetingValidationError('Meeting has ended');
        }

        // === Get or create session ===
        let session = await this.repo.getActiveSession(meetingId);
        if (!session) {
            session = await this.repo.createSession(meetingId);
            logger.info({ meetingId, sessionId: session.id }, 'Meeting session created');
        }

        // === Idempotency check ===
        // Same user+client within 30 seconds = skip duplicate log
        const recentJoin = await this.repo.getRecentJoinLog(
            meetingId,
            userId,
            dto.clientInstanceId,
            30 // seconds
        );

        if (!recentJoin) {
            await this.repo.recordAttendanceLog({
                meetingId,
                sessionId: session.id,
                userId,
                eventType: 'JOIN',
                clientInstanceId: dto.clientInstanceId,
                source: 'API',
            });
            logger.info({ meetingId, userId, sessionId: session.id }, 'User joined meeting');
        } else {
            logger.debug({ meetingId, userId }, 'Duplicate join within idempotency window');
        }

        // === Transition to ACTIVE if scheduled ===
        if (meeting.status === 'scheduled') {
            await this.transitionStatus(meetingId, 'active', userId, 'First participant joined');
        }

        // === Generate provider token ===
        const user = await this.repo.getUserById(userId);
        const userName = user?.fullName || 'User';
        const userEmail = user?.email || '';
        const isModerator = meeting.creatorId === userId;

        let roomUrl: string;
        let token: string;

        // === VALIDATE DAILY CONFIG ===
        if (!dailyService.isEnabled()) {
            logger.error({ meetingId }, 'DAILY_API_KEY not configured');
            throw new MeetingProviderError('Video conferencing not configured. Please contact administrator.');
        }

        // === ENSURE DAILY ROOM EXISTS (Self-healing) ===
        let config = meeting.providerConfig as DailyProviderConfig;

        // Check if valid Daily room config exists
        const hasValidConfig = config?.roomName && config?.roomUrl &&
            config.roomUrl.includes('daily.co');

        if (!hasValidConfig) {
            logger.info({ meetingId, config }, 'Meeting missing valid Daily room - creating...');

            try {
                // Generate deterministic room name based on meetingId to avoid race conditions
                const roomName = `nexus-${meetingId}`;

                // Create room via Daily API
                let room;
                try {
                    room = await dailyService.createRoom(roomName, {
                        privacy: meeting.accessMode === 'private' ? 'private' : 'public',
                        expiryMinutes: MEETING_CONSTRAINTS.ROOM_EXPIRY_HOURS * 60,
                    });
                } catch (createError: any) {
                    // If room already exists, fetch it
                    if (createError.response?.status === 400 || createError.message?.includes('already exists')) {
                        logger.info({ meetingId, roomName }, 'Room already exists, fetching details');
                        const existingRoom = await dailyService.getRoom(roomName);
                        if (!existingRoom) throw createError;
                        room = existingRoom;
                    } else {
                        throw createError;
                    }
                }

                // Build new provider config
                config = {
                    version: 1,
                    roomName: room.name,
                    roomUrl: room.url,
                    privacy: room.privacy,
                };

                // Update meeting in database with new room info
                await this.repo.updateMeetingProviderConfig(meetingId, 'DAILY', config);

                logger.info({
                    meetingId,
                    roomName: room.name,
                    roomUrl: room.url
                }, 'Daily room created and meeting updated (self-healing)');

            } catch (createError: any) {
                logger.error({
                    meetingId,
                    error: createError.message,
                    status: createError.response?.status,
                    data: createError.response?.data,
                }, 'Failed to create Daily room');
                throw new MeetingProviderError('Failed to create video room. Please try again.');
            }
        }

        // === GENERATE MEETING TOKEN ===
        try {
            token = await dailyService.createMeetingToken(config.roomName, {
                userId,
                userName,
                userEmail,
                isModerator,
                expiryMinutes: MEETING_CONSTRAINTS.TOKEN_EXPIRY_MINUTES,
            });
            roomUrl = config.roomUrl;
            logger.info({ meetingId, userId, roomName: config.roomName }, 'Daily.co token generated');

            return {
                roomUrl,
                token,
                meetingSessionId: session.id,
                provider: 'DAILY',
                userInfo: {
                    displayName: userName,
                    email: userEmail,
                    avatarUrl: user?.avatarUrl,
                },
            };
        } catch (tokenError: any) {
            logger.error({
                meetingId,
                roomName: config.roomName,
                error: tokenError.message,
                status: tokenError.response?.status,
                data: tokenError.response?.data,
            }, 'Failed to generate Daily token');
            throw new MeetingProviderError('Failed to generate meeting token. Please try again.');
        }
    }

    // =====================================================
    // End Meeting
    // =====================================================

    async endMeeting(meetingId: string, userId: string, reason?: string): Promise<void> {
        const meeting = await this.repo.getMeetingById(meetingId);
        if (!meeting) {
            throw new MeetingNotFoundError(meetingId);
        }

        // Only creator can end
        if (meeting.creatorId !== userId) {
            throw new MeetingAccessDeniedError();
        }

        // Validate current status allows ending
        if (meeting.status === 'ended') {
            logger.warn({ meetingId }, 'Meeting already ended');
            return; // Idempotent - already ended
        }
        if (meeting.status === 'cancelled') {
            throw new MeetingValidationError('Cannot end a cancelled meeting');
        }

        await this.transitionStatus(meetingId, 'ended', userId, reason || 'Manually ended');

        // Close active session
        await this.repo.endActiveSession(meetingId, userId, 'MANUAL');

        // Record leave for all active participants
        await this.repo.recordBulkLeave(meetingId, 'Meeting ended');

        // Delete provider room (fire and forget, don't fail the operation)
        this.cleanupProviderRoom(meeting).catch(err => {
            logger.warn({ meetingId, error: err.message }, 'Background room cleanup failed');
        });

        logger.info({ meetingId, userId }, 'Meeting ended');
    }

    // =====================================================
    // Cancel Meeting
    // =====================================================

    async cancelMeeting(meetingId: string, userId: string, reason?: string): Promise<void> {
        const meeting = await this.repo.getMeetingById(meetingId);
        if (!meeting) {
            throw new MeetingNotFoundError(meetingId);
        }

        // Only creator can cancel
        if (meeting.creatorId !== userId) {
            throw new MeetingAccessDeniedError();
        }

        // Validate current status allows cancellation
        if (meeting.status === 'cancelled') {
            logger.warn({ meetingId }, 'Meeting already cancelled');
            return; // Idempotent - already cancelled
        }
        if (meeting.status === 'ended') {
            throw new MeetingValidationError('Cannot cancel an ended meeting');
        }
        if (meeting.status === 'active') {
            throw new MeetingValidationError('Cannot cancel an active meeting. End it instead.');
        }

        await this.transitionStatus(meetingId, 'cancelled', userId, reason || 'Cancelled by organizer');

        // Delete provider room (fire and forget)
        this.cleanupProviderRoom(meeting).catch(err => {
            logger.warn({ meetingId, error: err.message }, 'Background room cleanup failed');
        });

        logger.info({ meetingId, userId }, 'Meeting cancelled');
    }

    // =====================================================
    // Webhook Handler (Daily.co)
    // =====================================================

    async handleDailyWebhook(event: string, payload: any): Promise<void> {
        logger.info({ event, roomName: payload?.room_name }, 'Processing Daily webhook');

        switch (event) {
            case 'meeting.ended': {
                const roomName = payload.room_name;
                if (!roomName) break;

                const meeting = await this.repo.getMeetingByProviderRoom(roomName);
                if (meeting && meeting.status === 'active') {
                    await this.repo.endActiveSession(meeting.id, null, 'WEBHOOK');
                    await this.repo.recordBulkLeave(meeting.id, 'Webhook: room closed');
                    await this.transitionStatus(meeting.id, 'ended', 'system', 'Webhook: meeting ended');
                    logger.info({ meetingId: meeting.id, roomName }, 'Meeting auto-ended via webhook');
                }
                break;
            }

            case 'participant.left': {
                const roomName = payload.room_name;
                const participantUserId = payload.participant?.user_id;

                if (!roomName || !participantUserId) break;

                const meeting = await this.repo.getMeetingByProviderRoom(roomName);
                if (meeting) {
                    await this.repo.recordAttendanceLog({
                        meetingId: meeting.id,
                        userId: participantUserId,
                        eventType: 'LEAVE',
                        providerParticipantId: payload.participant?.id,
                        source: 'WEBHOOK',
                    });
                    logger.debug({
                        meetingId: meeting.id,
                        userId: participantUserId
                    }, 'Participant left (webhook)');
                }
                break;
            }

            case 'participant.joined': {
                const roomName = payload.room_name;
                const participantUserId = payload.participant?.user_id;

                if (!roomName || !participantUserId) break;

                const meeting = await this.repo.getMeetingByProviderRoom(roomName);
                if (meeting) {
                    // Record webhook-based join (may be duplicate of API join, that's OK)
                    await this.repo.recordAttendanceLog({
                        meetingId: meeting.id,
                        userId: participantUserId,
                        eventType: 'JOIN',
                        providerParticipantId: payload.participant?.id,
                        source: 'WEBHOOK',
                    });
                }
                break;
            }

            default:
                logger.debug({ event }, 'Unhandled webhook event');
        }
    }

    // =====================================================
    // Zombie Meeting Cleanup (for cron job)
    // =====================================================

    async cleanupZombieMeetings(): Promise<number> {
        // Find meetings that are ACTIVE but:
        // 1. Past scheduled end + 30 min grace period
        // 2. OR no activity for 60 minutes
        const zombies = await this.repo.findZombieMeetings({
            pastEndGraceMinutes: 30,
            noActivityMinutes: 60,
        });

        let cleanedCount = 0;
        for (const meeting of zombies) {
            try {
                await this.repo.endActiveSession(meeting.id, null, 'CRON_CLEANUP');
                await this.repo.recordBulkLeave(meeting.id, 'Cron cleanup');
                await this.transitionStatus(meeting.id, 'ended', 'system', 'Auto-ended by cleanup job');
                await this.cleanupProviderRoom(meeting);
                cleanedCount++;
                logger.info({ meetingId: meeting.id }, 'Zombie meeting cleaned up');
            } catch (error) {
                logger.error({ meetingId: meeting.id, error }, 'Failed to cleanup zombie meeting');
            }
        }

        if (cleanedCount > 0) {
            logger.info({ count: cleanedCount }, 'Zombie meetings cleanup completed');
        }

        return cleanedCount;
    }

    // =====================================================
    // Private Helpers
    // =====================================================

    private async transitionStatus(
        meetingId: string,
        toStatus: MeetingStatus,
        changedBy: string,
        reason: string
    ): Promise<void> {
        const meeting = await this.repo.getMeetingById(meetingId);
        if (!meeting) {
            throw new Error('Meeting not found');
        }

        if (!isValidTransition(meeting.status, toStatus)) {
            throw new Error(`Invalid status transition: ${meeting.status} → ${toStatus}`);
        }

        await this.repo.updateMeetingStatus(meetingId, toStatus);
        await this.repo.recordStatusChange(meetingId, meeting.status, toStatus, changedBy, reason);

        logger.info({
            meetingId,
            from: meeting.status,
            to: toStatus,
            changedBy,
            reason
        }, 'Meeting status changed');
    }

    private async cleanupProviderRoom(meeting: Meeting): Promise<void> {
        if (meeting.provider === 'DAILY' && meeting.providerConfig) {
            try {
                const config = meeting.providerConfig as DailyProviderConfig;
                await dailyService.deleteRoom(config.roomName);
            } catch (error) {
                logger.error({ meetingId: meeting.id, error }, 'Failed to delete Daily room');
            }
        }
        // Jitsi rooms don't need explicit cleanup (public meet.jit.si)
    }

    private generateRoomName(): string {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).slice(2, 8);
        return `nexus-${timestamp}-${random}`;
    }

    // =====================================================
    // Attendance Report
    // =====================================================

    async getAttendanceReport(meetingId: string): Promise<{
        userId: string;
        userName: string;
        totalDurationSeconds: number;
        joinCount: number;
    }[]> {
        return this.repo.calculateAttendanceDuration(meetingId);
    }
}

// Singleton instance
export const meetingService = new MeetingService();
