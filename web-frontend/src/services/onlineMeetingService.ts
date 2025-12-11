import axios from "axios";
import {
    OnlineMeeting,
    OnlineMeetingDetails,
    CreateOnlineMeetingRequest,
    JitsiJoinConfig,
    UpdateMeetingStatusRequest,
    AddParticipantsRequest,
} from "../types/onlineMeeting.types";

const API_BASE_URL = "http://localhost:5000/api";

// Get auth token from localStorage
const getAuthHeaders = () => {
    const token = localStorage.getItem("accessToken");
    return {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    };
};

export const onlineMeetingService = {
    /**
     * Create a new online meeting
     */
    async createMeeting(data: CreateOnlineMeetingRequest): Promise<OnlineMeetingDetails> {
        const response = await axios.post(`${API_BASE_URL}/meetings`, data, {
            headers: getAuthHeaders(),
        });
        return response.data.data;
    },

    /**
     * Get all meetings accessible by current user
     */
    async getMeetings(): Promise<OnlineMeetingDetails[]> {
        const response = await axios.get(`${API_BASE_URL}/meetings`, {
            headers: getAuthHeaders(),
        });
        return response.data.data;
    },

    /**
     * Get meeting by ID
     */
    async getMeetingById(id: string): Promise<OnlineMeetingDetails> {
        const response = await axios.get(`${API_BASE_URL}/meetings/${id}`, {
            headers: getAuthHeaders(),
        });
        return response.data.data;
    },

    /**
     * Get Jitsi join token for a meeting
     * This validates access and returns JWT token
     */
    async getJoinToken(meetingId: string): Promise<JitsiJoinConfig> {
        const response = await axios.get(
            `${API_BASE_URL}/meetings/${meetingId}/join-token`,
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
    ): Promise<OnlineMeetingDetails> {
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
     * Update meeting status
     */
    async updateMeetingStatus(
        meetingId: string,
        data: UpdateMeetingStatusRequest
    ): Promise<OnlineMeetingDetails> {
        const response = await axios.patch(
            `${API_BASE_URL}/meetings/${meetingId}/status`,
            data,
            {
                headers: getAuthHeaders(),
            }
        );
        return response.data.data;
    },

    /**
     * Delete a meeting
     */
    async deleteMeeting(meetingId: string): Promise<void> {
        await axios.delete(`${API_BASE_URL}/meetings/${meetingId}`, {
            headers: getAuthHeaders(),
        });
    },
};
