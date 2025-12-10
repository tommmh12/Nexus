import axios from "axios";
import type {
    FloorPlan,
    MeetingRoom,
    RoomBooking,
    CreateFloorRequest,
    CreateRoomRequest,
    CreateBookingRequest,
    RoomAvailabilityInfo,
} from "../types/booking.types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getAccessToken = () => localStorage.getItem("accessToken");

const authHeaders = () => ({
    headers: { Authorization: `Bearer ${getAccessToken()}` },
});

// ===================== FLOOR SERVICE =====================

export const floorService = {
    async getFloors(includeInactive = false): Promise<FloorPlan[]> {
        const response = await axios.get(
            `${API_URL}/floors?includeInactive=${includeInactive}`,
            authHeaders()
        );
        return response.data.data || response.data;
    },

    async getFloorById(id: string): Promise<FloorPlan> {
        const response = await axios.get(`${API_URL}/floors/${id}`, authHeaders());
        return response.data.data || response.data;
    },

    async createFloor(floorData: CreateFloorRequest): Promise<FloorPlan> {
        const response = await axios.post(`${API_URL}/floors`, floorData, authHeaders());
        return response.data.data || response.data;
    },

    async updateFloor(id: string, floorData: Partial<CreateFloorRequest>): Promise<FloorPlan> {
        const response = await axios.put(`${API_URL}/floors/${id}`, floorData, authHeaders());
        return response.data.data || response.data;
    },

    async deleteFloor(id: string): Promise<void> {
        await axios.delete(`${API_URL}/floors/${id}`, authHeaders());
    },

    async getRoomsByFloor(floorId: string): Promise<MeetingRoom[]> {
        const response = await axios.get(`${API_URL}/floors/${floorId}/rooms`, authHeaders());
        return response.data.data || response.data;
    },
};

// ===================== ROOM SERVICE =====================

export const roomService = {
    async getRooms(floorId?: string): Promise<MeetingRoom[]> {
        const url = floorId ? `${API_URL}/rooms?floorId=${floorId}` : `${API_URL}/rooms`;
        const response = await axios.get(url, authHeaders());
        return response.data.data || response.data;
    },

    async getRoomById(id: string): Promise<MeetingRoom> {
        const response = await axios.get(`${API_URL}/rooms/${id}`, authHeaders());
        return response.data.data || response.data;
    },

    async createRoom(roomData: CreateRoomRequest): Promise<MeetingRoom> {
        const response = await axios.post(`${API_URL}/rooms`, roomData, authHeaders());
        return response.data.data || response.data;
    },

    async updateRoom(id: string, roomData: Partial<CreateRoomRequest>): Promise<MeetingRoom> {
        const response = await axios.put(`${API_URL}/rooms/${id}`, roomData, authHeaders());
        return response.data.data || response.data;
    },

    async deleteRoom(id: string): Promise<void> {
        await axios.delete(`${API_URL}/rooms/${id}`, authHeaders());
    },

    async getRoomAvailability(date: string, floorId?: string): Promise<RoomAvailabilityInfo[]> {
        const url = floorId
            ? `${API_URL}/rooms/availability?date=${date}&floorId=${floorId}`
            : `${API_URL}/rooms/availability?date=${date}`;
        const response = await axios.get(url, authHeaders());
        return response.data.data || response.data;
    },

    async checkRoomAvailability(
        roomId: string,
        date: string,
        startTime: string,
        endTime: string,
        excludeBookingId?: string
    ): Promise<boolean> {
        let url = `${API_URL}/rooms/check-availability?roomId=${roomId}&date=${date}&startTime=${startTime}&endTime=${endTime}`;
        if (excludeBookingId) {
            url += `&excludeBookingId=${excludeBookingId}`;
        }
        const response = await axios.get(url, authHeaders());
        return response.data.data?.isAvailable || false;
    },
};

// ===================== BOOKING SERVICE =====================

export const bookingService = {
    async getBookings(filters?: {
        status?: string;
        date?: string;
        startDate?: string;
        endDate?: string;
        roomId?: string;
        all?: boolean;
    }): Promise<RoomBooking[]> {
        const params = new URLSearchParams();
        if (filters?.status) params.append("status", filters.status);
        if (filters?.date) params.append("date", filters.date);
        if (filters?.startDate) params.append("startDate", filters.startDate);
        if (filters?.endDate) params.append("endDate", filters.endDate);
        if (filters?.roomId) params.append("roomId", filters.roomId);
        if (filters?.all) params.append("all", "true");

        const response = await axios.get(
            `${API_URL}/bookings?${params.toString()}`,
            authHeaders()
        );
        return response.data.data || response.data;
    },

    async getBookingById(id: string): Promise<RoomBooking> {
        const response = await axios.get(`${API_URL}/bookings/${id}`, authHeaders());
        return response.data.data || response.data;
    },

    async getPendingBookings(): Promise<RoomBooking[]> {
        const response = await axios.get(`${API_URL}/bookings/pending`, authHeaders());
        return response.data.data || response.data;
    },

    async createBooking(bookingData: CreateBookingRequest): Promise<{ booking: RoomBooking; message: string }> {
        const response = await axios.post(`${API_URL}/bookings`, bookingData, authHeaders());
        return {
            booking: response.data.data,
            message: response.data.message,
        };
    },

    async updateBooking(id: string, bookingData: Partial<CreateBookingRequest>): Promise<RoomBooking> {
        const response = await axios.put(`${API_URL}/bookings/${id}`, bookingData, authHeaders());
        return response.data.data || response.data;
    },

    async approveBooking(id: string): Promise<RoomBooking> {
        const response = await axios.put(`${API_URL}/bookings/${id}/approve`, {}, authHeaders());
        return response.data.data || response.data;
    },

    async rejectBooking(id: string, reason?: string): Promise<RoomBooking> {
        const response = await axios.put(`${API_URL}/bookings/${id}/reject`, { reason }, authHeaders());
        return response.data.data || response.data;
    },

    async cancelBooking(id: string): Promise<void> {
        await axios.put(`${API_URL}/bookings/${id}/cancel`, {}, authHeaders());
    },

    async deleteBooking(id: string): Promise<void> {
        await axios.delete(`${API_URL}/bookings/${id}`, authHeaders());
    },

    // Participants
    async addParticipant(bookingId: string, userId: string): Promise<void> {
        await axios.post(`${API_URL}/bookings/${bookingId}/participants`, { userId }, authHeaders());
    },

    async removeParticipant(bookingId: string, participantId: string): Promise<void> {
        await axios.delete(
            `${API_URL}/bookings/${bookingId}/participants/${participantId}`,
            authHeaders()
        );
    },
};
