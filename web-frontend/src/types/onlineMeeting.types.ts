// Frontend TypeScript types for Online Meetings

export interface OnlineMeeting {
    id: string;
    title: string;
    description?: string;
    jitsiRoomName: string;
    creatorId: string;
    scheduledStart: string; // ISO string
    scheduledEnd?: string;
    accessMode: 'public' | 'private';
    status: 'scheduled' | 'active' | 'ended' | 'cancelled';
    jitsiDomain: string;
    recordingUrl?: string;
    createdAt: string;
    updatedAt: string;
}

export interface MeetingParticipantInfo {
    userId: string;
    userName: string;
    email: string;
    avatarUrl?: string;
    departmentName?: string;
    invitedAt: string;
    joinedAt?: string;
}

export interface OnlineMeetingDetails extends OnlineMeeting {
    creatorName: string;
    creatorEmail: string;
    creatorAvatar?: string;
    participants: MeetingParticipantInfo[];
}

export interface CreateOnlineMeetingRequest {
    title: string;
    description?: string;
    scheduledStart: string; // ISO string
    scheduledEnd?: string;
    accessMode: 'public' | 'private';
    participantIds?: string[];
}

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

export interface UpdateMeetingStatusRequest {
    status: 'scheduled' | 'active' | 'ended' | 'cancelled';
}

export interface AddParticipantsRequest {
    userIds: string[];
}
