/**
 * Meeting Domain Entities
 * Provider-agnostic meeting system with support for Daily.co, Jitsi, and offline meetings
 */

// =====================================================
// Enums & Types
// =====================================================

export type MeetingProvider = 'DAILY' | 'JITSI' | 'NONE';
export type MeetingType = 'ONLINE' | 'OFFLINE' | 'HYBRID';
export type MeetingStatus = 'scheduled' | 'active' | 'ended' | 'cancelled';
export type AttendanceEventType = 'JOIN' | 'LEAVE' | 'RECONNECT';
export type AttendanceSource = 'API' | 'WEBHOOK';
export type SessionEndReason = 'MANUAL' | 'WEBHOOK' | 'CRON_CLEANUP';

// =====================================================
// Provider Configurations (versioned JSON)
// =====================================================

export interface DailyProviderConfig {
    version: 1;
    roomName: string;
    roomUrl: string;
    privacy: 'public' | 'private';
}

export interface JitsiProviderConfig {
    version: 1;
    roomName: string;
    domain: string;
}

export type ProviderConfig = DailyProviderConfig | JitsiProviderConfig | null;

// =====================================================
// Core Meeting Entity
// =====================================================

export interface Meeting {
    id: string;
    title: string;
    description?: string;
    creatorId: string;
    scheduledStart: Date;
    scheduledEnd?: Date;
    accessMode: 'public' | 'private';
    status: MeetingStatus;
    provider: MeetingProvider;
    type: MeetingType;
    providerConfig?: ProviderConfig;
    recordingUrl?: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;

    // Legacy fields (deprecated, use providerConfig)
    jitsiRoomName?: string;
    jitsiDomain?: string;
}

export interface MeetingWithDetails extends Meeting {
    creatorName: string;
    creatorEmail: string;
    creatorAvatar?: string;
    participants: ParticipantDetails[];
}

// =====================================================
// Participant & Attendance
// =====================================================

export interface MeetingParticipant {
    id: string;
    meetingId: string;
    userId: string;
    invitedAt: Date;
    invitedBy?: string;
    joinedAt?: Date;
    leftAt?: Date;
}

export interface ParticipantDetails {
    userId: string;
    userName: string;
    email: string;
    avatarUrl?: string;
    departmentName?: string;
    invitedAt: Date;
    joinedAt?: Date;
    totalDurationSeconds?: number;
}

// =====================================================
// Meeting Session (each occurrence/run)
// =====================================================

export interface MeetingSession {
    id: string;
    meetingId: string;
    startedAt?: Date;
    endedAt?: Date;
    endedBy?: string;
    endReason?: SessionEndReason;
    providerSessionId?: string;
    createdAt: Date;
}

// =====================================================
// Attendance Log (append-only, source of truth)
// =====================================================

export interface MeetingAttendanceLog {
    id: string;
    meetingId: string;
    sessionId?: string;
    userId: string;
    eventType: AttendanceEventType;
    eventAt: Date;
    clientInstanceId?: string;
    providerParticipantId?: string;
    source: AttendanceSource;
    metadata?: Record<string, unknown>;
}

// =====================================================
// Status History (audit trail)
// =====================================================

export interface MeetingStatusHistory {
    id: string;
    meetingId: string;
    fromStatus?: MeetingStatus;
    toStatus: MeetingStatus;
    changedBy?: string;
    reason?: string;
    changedAt: Date;
}

// =====================================================
// DTOs - Create/Update Operations
// =====================================================

export interface CreateMeetingDTO {
    title: string;
    description?: string;
    scheduledStart: string; // ISO string
    scheduledEnd?: string;
    accessMode: 'public' | 'private';
    type?: MeetingType;
    participantIds?: string[];
}

export interface JoinMeetingDTO {
    clientInstanceId?: string;
    deviceInfo?: string;
}

export interface UpdateMeetingDTO {
    title?: string;
    description?: string;
    scheduledStart?: string;
    scheduledEnd?: string;
    accessMode?: 'public' | 'private';
}

// =====================================================
// Response Types
// =====================================================

export interface JoinMeetingResponse {
    roomUrl: string;
    token: string;
    meetingSessionId: string;
    provider: MeetingProvider;
    userInfo: {
        displayName: string;
        email: string;
        avatarUrl?: string;
    };
}

export interface AttendanceReportEntry {
    meetingId: string;
    meetingTitle: string;
    userId: string;
    userName: string;
    totalDurationSeconds: number;
    joinCount: number;
    firstJoin?: Date;
    lastLeave?: Date;
}

// =====================================================
// State Machine - Valid Transitions
// =====================================================

export const VALID_STATUS_TRANSITIONS: Record<MeetingStatus, MeetingStatus[]> = {
    'scheduled': ['active', 'cancelled'],
    'active': ['ended'],
    'ended': [],
    'cancelled': [],
};

export function isValidTransition(from: MeetingStatus, to: MeetingStatus): boolean {
    return VALID_STATUS_TRANSITIONS[from].includes(to);
}

// =====================================================
// Legacy Compatibility (for old frontend types)
// =====================================================

/** @deprecated Use Meeting instead */
export interface OnlineMeeting extends Meeting { }

/** @deprecated Use MeetingWithDetails instead */
export interface OnlineMeetingWithDetails extends MeetingWithDetails { }

/** @deprecated Use MeetingParticipant instead */
export interface OnlineMeetingParticipant extends MeetingParticipant { }

/** @deprecated Use JoinMeetingResponse instead */
export interface JitsiJoinConfig {
    jwt: string;
    roomName: string;
    domain: string;
    userInfo: {
        displayName: string;
        email: string;
        avatarUrl?: string;
    };
}
