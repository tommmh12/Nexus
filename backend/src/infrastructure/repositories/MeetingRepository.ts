/**
 * Meeting Repository
 * Data access layer for meetings, sessions, attendance, and status history
 */

import { ResultSetHeader, RowDataPacket } from "mysql2";
import { dbPool as db } from "../database/connection.js";
import {
    Meeting,
    MeetingWithDetails,
    MeetingSession,
    MeetingAttendanceLog,
    MeetingStatusHistory,
    MeetingStatus,
    MeetingProvider,
    MeetingType,
    ParticipantDetails,
    CreateMeetingDTO,
    ProviderConfig,
    SessionEndReason,
    AttendanceEventType,
    AttendanceSource,
} from "../../domain/entities/Meeting.js";
import { createModuleLogger } from "../logger.js";

const logger = createModuleLogger('MeetingRepository');

// =====================================================
// Row Interfaces
// =====================================================

interface MeetingRow extends RowDataPacket {
    id: string;
    title: string;
    description: string | null;
    jitsi_room_name: string | null;
    jitsi_domain: string | null;
    creator_id: string;
    scheduled_start: Date;
    scheduled_end: Date | null;
    access_mode: 'public' | 'private';
    status: MeetingStatus;
    provider: MeetingProvider;
    type: MeetingType;
    provider_config: string | null;
    recording_url: string | null;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
    creatorName?: string;
    creatorEmail?: string;
    creatorAvatar?: string;
}

interface UserRow extends RowDataPacket {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
}

// =====================================================
// Repository Implementation
// =====================================================

export class MeetingRepository {

    // =====================================================
    // Meeting CRUD
    // =====================================================

    // Helper to convert ISO date string to MySQL datetime format
    private toMySQLDatetime(isoString: string | Date | undefined): string | null {
        if (!isoString) return null;
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return null;
        return date.toISOString().slice(0, 19).replace('T', ' ');
    }

    async createMeeting(
        data: CreateMeetingDTO & {
            provider: MeetingProvider;
            providerConfig: ProviderConfig;
            type: MeetingType;
        },
        creatorId: string
    ): Promise<Meeting> {
        // Generate UUID for the meeting
        const [uuidResult] = await db.execute<RowDataPacket[]>('SELECT UUID() as id');
        const meetingId = (uuidResult[0] as any).id;

        // For backward compatibility, also store in legacy columns
        let jitsiRoomName: string = '';  // Default empty string to satisfy NOT NULL
        let jitsiDomain: string = 'meet.jit.si';  // Default domain

        if (data.provider === 'JITSI' && data.providerConfig) {
            const config = data.providerConfig as { roomName: string; domain: string };
            jitsiRoomName = config.roomName;
            jitsiDomain = config.domain;
        } else if (data.provider === 'DAILY' && data.providerConfig) {
            // For Daily, use the room name from config as fallback
            const config = data.providerConfig as { roomName: string };
            jitsiRoomName = config.roomName || `daily-${Date.now()}`;
        }

        // Convert dates to MySQL format
        const scheduledStartMySQL = this.toMySQLDatetime(data.scheduledStart);
        const scheduledEndMySQL = this.toMySQLDatetime(data.scheduledEnd);

        await db.execute<ResultSetHeader>(
            `INSERT INTO online_meetings 
            (id, title, description, jitsi_room_name, jitsi_domain, creator_id, 
             scheduled_start, scheduled_end, access_mode, status, provider, type, provider_config) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'scheduled', ?, ?, ?)`,
            [
                meetingId,
                data.title,
                data.description || null,
                jitsiRoomName,
                jitsiDomain,
                creatorId,
                scheduledStartMySQL,
                scheduledEndMySQL,
                data.accessMode,
                data.provider,
                data.type,
                data.providerConfig ? JSON.stringify(data.providerConfig) : null,
            ]
        );

        // Add participants if provided
        if (data.participantIds && data.participantIds.length > 0) {
            await this.addParticipants(meetingId, data.participantIds, creatorId);
        }

        const meeting = await this.getMeetingById(meetingId);
        if (!meeting) {
            throw new Error('Failed to create meeting');
        }

        return meeting;
    }

    async getMeetingById(id: string): Promise<MeetingWithDetails | null> {
        const [rows] = await db.execute<MeetingRow[]>(
            `SELECT 
                m.*,
                u.full_name as creatorName,
                u.email as creatorEmail,
                u.avatar_url as creatorAvatar
            FROM online_meetings m
            JOIN users u ON m.creator_id = u.id
            WHERE m.id = ? AND m.deleted_at IS NULL`,
            [id]
        );

        if (rows.length === 0) return null;

        const row = rows[0];
        const participants = await this.getMeetingParticipants(id);

        return this.mapRowToMeeting(row, participants);
    }

    async getAccessibleMeetings(userId: string): Promise<MeetingWithDetails[]> {
        const [rows] = await db.execute<MeetingRow[]>(
            `SELECT DISTINCT
                m.*,
                u.full_name as creatorName,
                u.email as creatorEmail,
                u.avatar_url as creatorAvatar
            FROM online_meetings m
            JOIN users u ON m.creator_id = u.id
            LEFT JOIN online_meeting_participants p ON m.id = p.meeting_id
            WHERE m.deleted_at IS NULL
            AND (
                m.creator_id = ?
                OR m.access_mode = 'public'
                OR p.user_id = ?
            )
            ORDER BY m.scheduled_start DESC`,
            [userId, userId]
        );

        const meetings = await Promise.all(
            rows.map(async (row) => {
                const participants = await this.getMeetingParticipants(row.id);
                return this.mapRowToMeeting(row, participants);
            })
        );

        return meetings;
    }

    async getMeetingByProviderRoom(roomName: string): Promise<Meeting | null> {
        const [rows] = await db.execute<MeetingRow[]>(
            `SELECT m.*, u.full_name as creatorName, u.email as creatorEmail, u.avatar_url as creatorAvatar
            FROM online_meetings m
            JOIN users u ON m.creator_id = u.id
            WHERE m.deleted_at IS NULL
            AND (
                JSON_UNQUOTE(JSON_EXTRACT(m.provider_config, '$.roomName')) = ?
                OR m.jitsi_room_name = ?
            )`,
            [roomName, roomName]
        );

        if (rows.length === 0) return null;
        return this.mapRowToMeeting(rows[0], []);
    }

    async updateMeetingStatus(meetingId: string, status: MeetingStatus): Promise<void> {
        await db.execute(
            `UPDATE online_meetings SET status = ? WHERE id = ?`,
            [status, meetingId]
        );
    }

    /**
     * Update meeting provider configuration (used for self-healing join)
     */
    async updateMeetingProviderConfig(
        meetingId: string,
        provider: MeetingProvider,
        providerConfig: ProviderConfig
    ): Promise<void> {
        await db.execute(
            `UPDATE online_meetings 
             SET provider = ?, 
                 provider_config = ?,
                 updated_at = CURRENT_TIMESTAMP 
             WHERE id = ?`,
            [provider, JSON.stringify(providerConfig), meetingId]
        );
        logger.info({ meetingId, provider }, 'Meeting provider config updated');
    }

    async deleteMeeting(meetingId: string): Promise<void> {
        await db.execute(
            `UPDATE online_meetings SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?`,
            [meetingId]
        );
    }

    // =====================================================
    // Participants
    // =====================================================

    async getMeetingParticipants(meetingId: string): Promise<ParticipantDetails[]> {
        const [rows] = await db.execute<RowDataPacket[]>(
            `SELECT 
                p.user_id as userId,
                p.invited_at as invitedAt,
                p.joined_at as joinedAt,
                u.full_name as userName,
                u.email,
                u.avatar_url as avatarUrl,
                d.name as departmentName
            FROM online_meeting_participants p
            JOIN users u ON p.user_id = u.id
            LEFT JOIN departments d ON u.department_id = d.id
            WHERE p.meeting_id = ?
            ORDER BY p.invited_at ASC`,
            [meetingId]
        );

        return rows.map((row) => ({
            userId: row.userId,
            userName: row.userName,
            email: row.email,
            avatarUrl: row.avatarUrl,
            departmentName: row.departmentName,
            invitedAt: row.invitedAt,
            joinedAt: row.joinedAt,
        }));
    }

    async addParticipants(
        meetingId: string,
        userIds: string[],
        invitedBy: string
    ): Promise<void> {
        if (userIds.length === 0) return;

        const values = userIds.map((userId) => [meetingId, userId, invitedBy]);
        await db.query(
            `INSERT INTO online_meeting_participants (meeting_id, user_id, invited_by) 
            VALUES ?
            ON DUPLICATE KEY UPDATE invited_by = VALUES(invited_by)`,
            [values]
        );
    }

    async removeParticipant(meetingId: string, userId: string): Promise<void> {
        await db.execute(
            `DELETE FROM online_meeting_participants 
            WHERE meeting_id = ? AND user_id = ?`,
            [meetingId, userId]
        );
    }

    async checkUserAccess(meetingId: string, userId: string): Promise<boolean> {
        const [rows] = await db.execute<RowDataPacket[]>(
            `SELECT 1
            FROM online_meetings m
            LEFT JOIN online_meeting_participants p ON m.id = p.meeting_id AND p.user_id = ?
            WHERE m.id = ? AND m.deleted_at IS NULL
            AND (
                m.creator_id = ?
                OR m.access_mode = 'public'
                OR p.user_id IS NOT NULL
            )`,
            [userId, meetingId, userId]
        );

        return rows.length > 0;
    }

    // =====================================================
    // Sessions
    // =====================================================

    async createSession(meetingId: string): Promise<MeetingSession> {
        const [uuidResult] = await db.execute<RowDataPacket[]>('SELECT UUID() as id');
        const sessionId = (uuidResult[0] as any).id;

        await db.execute<ResultSetHeader>(
            `INSERT INTO meeting_sessions (id, meeting_id, started_at) 
            VALUES (?, ?, CURRENT_TIMESTAMP)`,
            [sessionId, meetingId]
        );

        return {
            id: sessionId,
            meetingId,
            startedAt: new Date(),
            createdAt: new Date(),
        };
    }

    async getActiveSession(meetingId: string): Promise<MeetingSession | null> {
        const [rows] = await db.execute<RowDataPacket[]>(
            `SELECT * FROM meeting_sessions 
            WHERE meeting_id = ? AND ended_at IS NULL
            ORDER BY created_at DESC LIMIT 1`,
            [meetingId]
        );

        if (rows.length === 0) return null;

        const row = rows[0];
        return {
            id: row.id,
            meetingId: row.meeting_id,
            startedAt: row.started_at,
            endedAt: row.ended_at,
            endedBy: row.ended_by,
            endReason: row.end_reason,
            providerSessionId: row.provider_session_id,
            createdAt: row.created_at,
        };
    }

    async endActiveSession(
        meetingId: string,
        endedBy: string | null,
        reason: SessionEndReason
    ): Promise<void> {
        await db.execute(
            `UPDATE meeting_sessions 
            SET ended_at = CURRENT_TIMESTAMP, ended_by = ?, end_reason = ?
            WHERE meeting_id = ? AND ended_at IS NULL`,
            [endedBy, reason, meetingId]
        );
    }

    // =====================================================
    // Attendance Logs
    // =====================================================

    async recordAttendanceLog(data: {
        meetingId: string;
        sessionId?: string;
        userId: string;
        eventType: AttendanceEventType;
        clientInstanceId?: string;
        providerParticipantId?: string;
        source: AttendanceSource;
        metadata?: Record<string, unknown>;
    }): Promise<void> {
        await db.execute(
            `INSERT INTO meeting_attendance_logs 
            (meeting_id, session_id, user_id, event_type, client_instance_id, 
             provider_participant_id, source, metadata) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                data.meetingId,
                data.sessionId || null,
                data.userId,
                data.eventType,
                data.clientInstanceId || null,
                data.providerParticipantId || null,
                data.source,
                data.metadata ? JSON.stringify(data.metadata) : null,
            ]
        );
    }

    async getRecentJoinLog(
        meetingId: string,
        userId: string,
        clientInstanceId: string | undefined,
        withinSeconds: number
    ): Promise<MeetingAttendanceLog | null> {
        const [rows] = await db.execute<RowDataPacket[]>(
            `SELECT * FROM meeting_attendance_logs 
            WHERE meeting_id = ? 
            AND user_id = ?
            AND event_type = 'JOIN'
            AND event_at > DATE_SUB(NOW(), INTERVAL ? SECOND)
            ${clientInstanceId ? 'AND client_instance_id = ?' : ''}
            ORDER BY event_at DESC LIMIT 1`,
            clientInstanceId
                ? [meetingId, userId, withinSeconds, clientInstanceId]
                : [meetingId, userId, withinSeconds]
        );

        if (rows.length === 0) return null;

        const row = rows[0];
        return {
            id: row.id,
            meetingId: row.meeting_id,
            sessionId: row.session_id,
            userId: row.user_id,
            eventType: row.event_type,
            eventAt: row.event_at,
            clientInstanceId: row.client_instance_id,
            providerParticipantId: row.provider_participant_id,
            source: row.source,
            metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
        };
    }

    async recordBulkLeave(meetingId: string, reason: string): Promise<void> {
        // Find users who have JOIN without matching LEAVE
        const [activeUsers] = await db.execute<RowDataPacket[]>(
            `SELECT DISTINCT user_id 
            FROM meeting_attendance_logs 
            WHERE meeting_id = ? 
            AND event_type = 'JOIN'
            AND user_id NOT IN (
                SELECT DISTINCT user_id 
                FROM meeting_attendance_logs 
                WHERE meeting_id = ? 
                AND event_type = 'LEAVE'
                AND event_at > (
                    SELECT MAX(event_at) 
                    FROM meeting_attendance_logs l2 
                    WHERE l2.meeting_id = meeting_attendance_logs.meeting_id 
                    AND l2.user_id = meeting_attendance_logs.user_id 
                    AND l2.event_type = 'JOIN'
                )
            )`,
            [meetingId, meetingId]
        );

        for (const row of activeUsers) {
            await this.recordAttendanceLog({
                meetingId,
                userId: row.user_id,
                eventType: 'LEAVE',
                source: 'API',
                metadata: { reason },
            });
        }
    }

    async calculateAttendanceDuration(meetingId: string): Promise<{
        userId: string;
        userName: string;
        totalDurationSeconds: number;
        joinCount: number;
    }[]> {
        // Get all attendance events for this meeting
        const [logs] = await db.execute<RowDataPacket[]>(
            `SELECT 
                l.user_id,
                u.full_name as userName,
                l.event_type,
                l.event_at
            FROM meeting_attendance_logs l
            JOIN users u ON l.user_id = u.id
            WHERE l.meeting_id = ?
            ORDER BY l.user_id, l.event_at`,
            [meetingId]
        );

        // Get meeting end time
        const [sessionRows] = await db.execute<RowDataPacket[]>(
            `SELECT ended_at FROM meeting_sessions 
            WHERE meeting_id = ? ORDER BY ended_at DESC LIMIT 1`,
            [meetingId]
        );
        const meetingEndTime = sessionRows[0]?.ended_at || new Date();

        // Calculate duration per user
        const userDurations: Map<string, { userName: string; totalSeconds: number; joinCount: number }> = new Map();

        let currentUserId: string | null = null;
        let joinTime: Date | null = null;

        for (const log of logs) {
            if (currentUserId !== log.user_id) {
                // Close previous user's open session
                if (currentUserId && joinTime) {
                    const existing = userDurations.get(currentUserId)!;
                    existing.totalSeconds += Math.floor((meetingEndTime.getTime() - joinTime.getTime()) / 1000);
                }
                currentUserId = log.user_id;
                joinTime = null;

                if (!userDurations.has(currentUserId)) {
                    userDurations.set(currentUserId, {
                        userName: log.userName,
                        totalSeconds: 0,
                        joinCount: 0
                    });
                }
            }

            if (log.event_type === 'JOIN' || log.event_type === 'RECONNECT') {
                if (!joinTime) {
                    joinTime = log.event_at;
                    userDurations.get(currentUserId!)!.joinCount++;
                }
            } else if (log.event_type === 'LEAVE') {
                if (joinTime) {
                    const duration = Math.floor((log.event_at.getTime() - joinTime.getTime()) / 1000);
                    userDurations.get(currentUserId!)!.totalSeconds += duration;
                    joinTime = null;
                }
            }
        }

        // Close last user's open session
        if (currentUserId && joinTime) {
            const existing = userDurations.get(currentUserId)!;
            existing.totalSeconds += Math.floor((meetingEndTime.getTime() - joinTime.getTime()) / 1000);
        }

        return Array.from(userDurations.entries()).map(([userId, data]) => ({
            userId,
            userName: data.userName,
            totalDurationSeconds: data.totalSeconds,
            joinCount: data.joinCount,
        }));
    }

    // =====================================================
    // Status History
    // =====================================================

    async recordStatusChange(
        meetingId: string,
        fromStatus: MeetingStatus | null,
        toStatus: MeetingStatus,
        changedBy: string,
        reason: string
    ): Promise<void> {
        await db.execute(
            `INSERT INTO meeting_status_history 
            (meeting_id, from_status, to_status, changed_by, reason) 
            VALUES (?, ?, ?, ?, ?)`,
            [meetingId, fromStatus, toStatus, changedBy === 'system' ? null : changedBy, reason]
        );
    }

    // =====================================================
    // Zombie Meeting Detection
    // =====================================================

    async findZombieMeetings(options: {
        pastEndGraceMinutes: number;
        noActivityMinutes: number;
    }): Promise<Meeting[]> {
        const [rows] = await db.execute<MeetingRow[]>(
            `SELECT m.*, u.full_name as creatorName, u.email as creatorEmail, u.avatar_url as creatorAvatar
            FROM online_meetings m
            JOIN users u ON m.creator_id = u.id
            WHERE m.status = 'active'
            AND m.deleted_at IS NULL
            AND (
                -- Past scheduled end + grace period
                (m.scheduled_end IS NOT NULL AND m.scheduled_end < DATE_SUB(NOW(), INTERVAL ? MINUTE))
                OR
                -- No recent activity
                NOT EXISTS (
                    SELECT 1 FROM meeting_attendance_logs l 
                    WHERE l.meeting_id = m.id 
                    AND l.event_at > DATE_SUB(NOW(), INTERVAL ? MINUTE)
                )
            )`,
            [options.pastEndGraceMinutes, options.noActivityMinutes]
        );

        return rows.map(row => this.mapRowToMeeting(row, []));
    }

    // =====================================================
    // User Helper
    // =====================================================

    async getUserById(userId: string): Promise<{ fullName: string; email: string; avatarUrl?: string } | null> {
        const [rows] = await db.execute<UserRow[]>(
            `SELECT id, full_name, email, avatar_url FROM users WHERE id = ?`,
            [userId]
        );

        if (rows.length === 0) return null;

        return {
            fullName: rows[0].full_name,
            email: rows[0].email,
            avatarUrl: rows[0].avatar_url || undefined,
        };
    }

    // =====================================================
    // Private Helpers
    // =====================================================

    private mapRowToMeeting(row: MeetingRow, participants: ParticipantDetails[]): MeetingWithDetails {
        let providerConfig: ProviderConfig = null;
        if (row.provider_config) {
            try {
                providerConfig = JSON.parse(row.provider_config);
            } catch {
                logger.warn({ meetingId: row.id }, 'Failed to parse provider_config');
            }
        }

        return {
            id: row.id,
            title: row.title,
            description: row.description || undefined,
            creatorId: row.creator_id,
            scheduledStart: row.scheduled_start,
            scheduledEnd: row.scheduled_end || undefined,
            accessMode: row.access_mode,
            status: row.status,
            provider: row.provider || 'DAILY',
            type: row.type || 'ONLINE',
            providerConfig,
            recordingUrl: row.recording_url || undefined,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            deletedAt: row.deleted_at || undefined,
            jitsiRoomName: row.jitsi_room_name || undefined,
            jitsiDomain: row.jitsi_domain || undefined,
            creatorName: row.creatorName || '',
            creatorEmail: row.creatorEmail || '',
            creatorAvatar: row.creatorAvatar || undefined,
            participants,
        };
    }
}
