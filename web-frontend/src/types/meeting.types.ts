// Frontend TypeScript types for Meetings (v2 - provider-agnostic)

// =====================================================
// Enums & Types
// =====================================================

export type MeetingProvider = 'DAILY' | 'NONE';
export type MeetingType = 'ONLINE' | 'OFFLINE' | 'HYBRID';
export type MeetingStatus = 'scheduled' | 'active' | 'ended' | 'cancelled';

// =====================================================
// Core Types
// =====================================================

export interface Meeting {
    id: string;
    title: string;
    description?: string;
    creatorId: string;
    scheduledStart: string; // ISO string
    scheduledEnd?: string;
    accessMode: 'public' | 'private';
    status: MeetingStatus;
    provider: MeetingProvider;
    type: MeetingType;
    recordingUrl?: string;
    createdAt: string;
    updatedAt: string;
}

export interface MeetingParticipant {
    userId: string;
    userName: string;
    email: string;
    avatarUrl?: string;
    departmentName?: string;
    invitedAt: string;
    joinedAt?: string;
    totalDurationSeconds?: number;
}

export interface MeetingDetails extends Meeting {
    creatorName: string;
    creatorEmail: string;
    creatorAvatar?: string;
    participants: MeetingParticipant[];
}

// =====================================================
// Request/Response Types
// =====================================================

export interface CreateMeetingRequest {
    title: string;
    description?: string;
    scheduledStart: string; // ISO string
    scheduledEnd?: string;
    accessMode: 'public' | 'private';
    type?: MeetingType;
    participantIds?: string[];
}

export interface JoinMeetingRequest {
    clientInstanceId?: string;
    deviceInfo?: string;
}

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

export interface UpdateMeetingStatusRequest {
    status: MeetingStatus;
    reason?: string;
}

export interface AddParticipantsRequest {
    userIds: string[];
}

export interface AttendanceReportEntry {
    userId: string;
    userName: string;
    totalDurationSeconds: number;
    joinCount: number;
}

// =====================================================
// Legacy Types (backward compatibility)
// =====================================================

/** @deprecated Use Meeting instead */
export interface OnlineMeeting {
    id: string;
    title: string;
    description?: string;
    jitsiRoomName: string;
    creatorId: string;
    scheduledStart: string;
    scheduledEnd?: string;
    accessMode: 'public' | 'private';
    status: 'scheduled' | 'active' | 'ended' | 'cancelled';
    jitsiDomain: string;
    recordingUrl?: string;
    createdAt: string;
    updatedAt: string;
}

/** @deprecated Use MeetingDetails instead */
export interface OnlineMeetingDetails extends OnlineMeeting {
    creatorName: string;
    creatorEmail: string;
    creatorAvatar?: string;
    participants: MeetingParticipant[];
}

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
