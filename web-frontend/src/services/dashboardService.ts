import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getAccessToken = () => localStorage.getItem("accessToken");

export const dashboardService = {
  async getOverview() {
    const token = getAccessToken();
    const response = await axios.get(`${API_URL}/dashboard/overview`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async getStats() {
    const token = getAccessToken();
    const response = await axios.get(`${API_URL}/dashboard/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};
