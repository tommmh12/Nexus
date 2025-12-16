/**
 * Meeting Service (v2)
 * API service for meeting management with Daily.co support
 */

import axios from "axios";
import {
    MeetingDetails,
    CreateMeetingRequest,
    JoinMeetingRequest,
    JoinMeetingResponse,
    AddParticipantsRequest,
    AttendanceReportEntry,
} from "../types/meeting.types";

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/api$/, '/api/v2') || "http://localhost:5000/api/v2";

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
    return {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    };
};

export const meetingService = {
    /**
     * Create a new meeting
     */
    async createMeeting(data: CreateMeetingRequest): Promise<MeetingDetails> {
        const response = await axios.post(`${API_BASE_URL}/meetings`, data, {
            headers: getAuthHeaders(),
        });
        return response.data.data;
    },

    /**
     * Get all meetings accessible by current user
     */
    async getMeetings(): Promise<MeetingDetails[]> {
        const response = await axios.get(`${API_BASE_URL}/meetings`, {
            headers: getAuthHeaders(),
        });
        return response.data.data;
    },

    /**
     * Get meeting by ID
     */
    async getMeetingById(id: string): Promise<MeetingDetails> {
        const response = await axios.get(`${API_BASE_URL}/meetings/${id}`, {
            headers: getAuthHeaders(),
        });
        return response.data.data;
    },

    /**
     * Join a meeting (POST - with side effects)
     * Returns room URL and token for Daily.co or Jitsi
     */
    async joinMeeting(meetingId: string): Promise<JoinMeetingResponse> {
        const request: JoinMeetingRequest = {
            clientInstanceId: getClientInstanceId(),
            deviceInfo: navigator.userAgent,
        };

        const response = await axios.post(
            `${API_BASE_URL}/meetings/${meetingId}/join`,
            request,
            {
                headers: getAuthHeaders(),
            }
        );
        return response.data.data;
    },

    /**
     * Add participants to a meeting
     */
    async addParticipants(
        meetingId: string,
        data: AddParticipantsRequest
    ): Promise<MeetingDetails> {
        const response = await axios.post(
            `${API_BASE_URL}/meetings/${meetingId}/participants`,
            data,
            {
                headers: getAuthHeaders(),
            }
        );
        return response.data.data;
    },

    /**
     * Remove a participant from a meeting
     */
    async removeParticipant(meetingId: string, userId: string): Promise<void> {
        await axios.delete(
            `${API_BASE_URL}/meetings/${meetingId}/participants/${userId}`,
            {
                headers: getAuthHeaders(),
            }
        );
    },

    /**
     * End a meeting
     */
    async endMeeting(meetingId: string, reason?: string): Promise<void> {
        await axios.post(
            `${API_BASE_URL}/meetings/${meetingId}/end`,
            { reason },
            {
                headers: getAuthHeaders(),
            }
        );
    },

    /**
     * Cancel a meeting
     */
    async cancelMeeting(meetingId: string, reason?: string): Promise<void> {
        await axios.post(
            `${API_BASE_URL}/meetings/${meetingId}/cancel`,
            { reason },
            {
                headers: getAuthHeaders(),
            }
        );
    },

    /**
     * Delete a meeting (soft delete)
     */
    async deleteMeeting(meetingId: string): Promise<void> {
        await axios.delete(`${API_BASE_URL}/meetings/${meetingId}`, {
            headers: getAuthHeaders(),
        });
    },

    /**
     * Get attendance report for a meeting
     */
    async getAttendanceReport(meetingId: string): Promise<AttendanceReportEntry[]> {
        const response = await axios.get(
            `${API_BASE_URL}/meetings/${meetingId}/attendance`,
            {
                headers: getAuthHeaders(),
            }
        );
        return response.data.data;
    },
};

export default meetingService;
