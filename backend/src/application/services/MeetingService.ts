/**
 * Meeting Service
 * Business logic layer for meeting operations
 * - State machine enforcement
 * - Daily.co provider ONLY
 * - Attendance tracking
 * - Webhook handling
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
// Service Implementation
// =====================================================

export class MeetingService {
    private repo: MeetingRepository;

    constructor(repo?: MeetingRepository) {
        this.repo = repo || new MeetingRepository();
    }

    // =====================================================
    // Create Meeting
    // =====================================================

    async createMeeting(dto: CreateMeetingDTO, creatorId: string): Promise<Meeting> {
        // === Validation ===
        logger.info({ dto, creatorId }, 'Creating meeting...');

        const now = new Date();
        const scheduledStart = new Date(dto.scheduledStart);

        if (isNaN(scheduledStart.getTime())) {
            logger.error({ scheduledStart: dto.scheduledStart }, 'Invalid scheduled start time');
            throw new Error('Invalid scheduled start time');
        }

        // Allow meetings to start immediately (5 minute tolerance for clock drift)
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
        if (scheduledStart < fiveMinutesAgo) {
            logger.error({ scheduledStart, fiveMinutesAgo }, 'Cannot schedule meeting in the past');
            throw new Error('Cannot schedule meeting in the past');
        }

        if (dto.scheduledEnd) {
            const scheduledEnd = new Date(dto.scheduledEnd);
            if (isNaN(scheduledEnd.getTime())) {
                throw new Error('Invalid scheduled end time');
            }
            if (scheduledEnd <= scheduledStart) {
                throw new Error('End time must be after start time');
            }
            const durationMs = scheduledEnd.getTime() - scheduledStart.getTime();
            const maxDurationMs = 8 * 60 * 60 * 1000; // 8 hours
            if (durationMs > maxDurationMs) {
                throw new Error('Meeting duration cannot exceed 8 hours');
            }
        }

        // === Determine provider ===
        const meetingType = dto.type || 'ONLINE';
        let provider: MeetingProvider = 'NONE';
        let providerConfig = null;

        if (meetingType === 'ONLINE' || meetingType === 'HYBRID') {
            const configuredProvider = process.env.MEETING_PROVIDER || 'DAILY';

            if (configuredProvider === 'DAILY' && dailyService.isEnabled()) {
                provider = 'DAILY';
                const roomName = this.generateRoomName();

                // Parse scheduled times for room constraints
                const startTime = new Date(dto.scheduledStart);
                const endTime = dto.scheduledEnd ? new Date(dto.scheduledEnd) : undefined;

                try {
                    const room = await dailyService.createRoom(roomName, {
                        privacy: dto.accessMode === 'private' ? 'private' : 'public',
                        startTime,
                        endTime,
                        // Fallback to 8 hours if no end time set
                        expiryMinutes: endTime ? undefined : 60 * 8,
                    });

                    providerConfig = {
                        version: 1,
                        roomName: room.name,
                        roomUrl: room.url,
                        privacy: room.privacy,
                    } as DailyProviderConfig;
                } catch (error) {
                    logger.error({ error, roomName }, 'Failed to create Daily room');
                    throw new Error('Failed to create video room');
                }
            } else {
                // Daily.co is required - no fallback
                throw new Error('Video conference not configured. DAILY_API_KEY is required.');
            }
        }

        // === Create meeting in database ===
        const meeting = await this.repo.createMeeting({
            ...dto,
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
        }, 'Meeting created');

        return meeting;
    }

    // =====================================================
    // Join Meeting
    // =====================================================

    async joinMeeting(
        meetingId: string,
        userId: string,
        dto: JoinMeetingDTO = {}
    ): Promise<JoinMeetingResponse> {
        const meeting = await this.repo.getMeetingById(meetingId);
        if (!meeting) {
            throw new Error('Meeting not found');
        }

        // === Check access ===
        const hasAccess = await this.repo.checkUserAccess(meetingId, userId);
        if (!hasAccess) {
            logger.warn({ meetingId, userId }, 'Access denied to meeting');
            throw new Error('Access denied');
        }

        // === Validate state ===
        if (meeting.status === 'cancelled') {
            throw new Error('Cannot join cancelled meeting');
        }
        if (meeting.status === 'ended') {
            throw new Error('Meeting has ended');
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
            throw new Error('Video conferencing not configured. Please set DAILY_API_KEY environment variable.');
        }

        // === ENSURE DAILY ROOM EXISTS (Self-healing) ===
        let config = meeting.providerConfig as DailyProviderConfig;

        // Check if valid Daily room config exists
        const hasValidConfig = config?.roomName && config?.roomUrl &&
            config.roomUrl.includes('daily.co');

        if (!hasValidConfig) {
            logger.info({ meetingId, config }, 'Meeting missing valid Daily room - creating...');

            try {
                // Generate unique room name based on meetingId
                const roomName = `nexus-${meetingId.slice(0, 8)}-${Date.now().toString(36)}`;

                // Create room via Daily API
                const room = await dailyService.createRoom(roomName, {
                    privacy: meeting.accessMode === 'private' ? 'private' : 'public',
                    expiryMinutes: 60 * 24, // 24 hours
                });

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
                throw new Error(`Failed to create video room: ${createError.message}`);
            }
        }

        // === GENERATE MEETING TOKEN ===
        try {
            token = await dailyService.createMeetingToken(config.roomName, {
                userId,
                userName,
                userEmail,
                isModerator,
                expiryMinutes: 180,
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
            throw new Error(`Failed to generate meeting token: ${tokenError.message}`);
        }
    }

    // =====================================================
    // End Meeting
    // =====================================================

    async endMeeting(meetingId: string, userId: string, reason?: string): Promise<void> {
        const meeting = await this.repo.getMeetingById(meetingId);
        if (!meeting) {
            throw new Error('Meeting not found');
        }

        // Only creator can end
        if (meeting.creatorId !== userId) {
            throw new Error('Only meeting creator can end the meeting');
        }

        await this.transitionStatus(meetingId, 'ended', userId, reason || 'Manually ended');

        // Close active session
        await this.repo.endActiveSession(meetingId, userId, 'MANUAL');

        // Record leave for all active participants
        await this.repo.recordBulkLeave(meetingId, 'Meeting ended');

        // Delete provider room
        await this.cleanupProviderRoom(meeting);

        logger.info({ meetingId, userId }, 'Meeting ended');
    }

    // =====================================================
    // Cancel Meeting
    // =====================================================

    async cancelMeeting(meetingId: string, userId: string, reason?: string): Promise<void> {
        const meeting = await this.repo.getMeetingById(meetingId);
        if (!meeting) {
            throw new Error('Meeting not found');
        }

        // Only creator can cancel
        if (meeting.creatorId !== userId) {
            throw new Error('Only meeting creator can cancel the meeting');
        }

        await this.transitionStatus(meetingId, 'cancelled', userId, reason || 'Cancelled by organizer');

        // Delete provider room
        await this.cleanupProviderRoom(meeting);

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
