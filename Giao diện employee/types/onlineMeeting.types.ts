
export interface CreateOnlineMeetingRequest {
    title: string;
    description: string;
    scheduledStart: string;
    scheduledEnd: string;
    accessMode: 'public' | 'private';
    participantIds: string[];
}

export interface OnlineMeetingDetails {
    id: string;
    title: string;
    description: string;
    scheduledStart: string;
    status: 'scheduled' | 'active' | 'ended' | 'cancelled';
    accessMode: 'public' | 'private';
    creatorName: string;
    participants: any[];
}
