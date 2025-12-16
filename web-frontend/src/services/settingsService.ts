import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/api$/, '/api/settings') || "http://localhost:5000/api/settings";

interface EmailConfig {
  host: string;
  port: number;
  user: string;
}

interface EmailConfigResponse {
  success: boolean;
  data: {
    config: EmailConfig | null;
    isEnabled: boolean;
  };
}

export const settingsService = {
  // Get email configuration
  getEmailConfig: async (): Promise<EmailConfigResponse> => {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_URL}/email`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Update email configuration
  updateEmailConfig: async (config: {
    host: string;
    port: string;
    user: string;
    password?: string;
    enabled: boolean;
  }) => {
    const token = localStorage.getItem("token");
    const response = await axios.put(`${API_URL}/email`, config, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Test email
  testEmail: async (to: string) => {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `${API_URL}/email/test`,
      { to },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },
};
