import axios from "axios";

// Assuming VITE_API_URL or similar is defined/used in other services. 
// Based on taskService.ts, it uses hardcoded "http://localhost:5000/api".
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getAuthHeader = () => {
    const token = localStorage.getItem("accessToken");
    return { Authorization: `Bearer ${token}` };
};

export interface Notification {
    id: string;
    userId: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    relatedId?: string;
    createdAt: string;
}

export const notificationService = {
    getNotifications: async (): Promise<Notification[]> => {
        const response = await axios.get(`${API_URL}/notifications`, {
            headers: getAuthHeader(),
        });
        return response.data.data || response.data;
    },

    markAsRead: async (notificationId: string) => {
        await axios.put(`${API_URL}/notifications/${notificationId}/read`, {}, {
            headers: getAuthHeader(),
        });
    },

    markAllAsRead: async () => {
        // Optional: Implement if backend supports it or loop through
    }
};
