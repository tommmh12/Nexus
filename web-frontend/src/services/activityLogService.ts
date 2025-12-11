const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

export interface ActivityLog {
  id: string;
  user_id: string | null;
  type: string;
  content: string;
  target?: string;
  ip_address?: string;
  meta?: {
    userAgent?: string;
    browser?: string;
    os?: string;
    device?: string;
    [key: string]: any;
  };
  created_at: string;
  user_name?: string;
  user_email?: string;
  user_avatar?: string;
}

export interface ActivityLogFilters {
  page?: number;
  limit?: number;
  type?: string;
  userId?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface ActivityStats {
  totalLogs: number;
  todayLogs: number;
  logsByType: { type: string; count: number }[];
  recentUsers: { user_id: string; user_name: string; count: number }[];
}

export interface AlertRule {
  id: string;
  name: string;
  description: string | null;
  category: "HR" | "System" | "Security";
  threshold: number;
  unit: "days" | "percent" | "count";
  notify_roles: string[];
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export const activityLogService = {
  // Get all activity logs with filters
  async getLogs(filters: ActivityLogFilters = {}) {
    const params = new URLSearchParams();
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());
    if (filters.type && filters.type !== "all")
      params.append("type", filters.type);
    if (filters.userId) params.append("userId", filters.userId);
    if (filters.search) params.append("search", filters.search);
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);

    const response = await fetch(
      `${API_URL}/activity-logs?${params.toString()}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.json();
  },

  // Get single log detail
  async getLogById(id: string) {
    const response = await fetch(`${API_URL}/activity-logs/${id}`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  // Get statistics
  async getStats(): Promise<{ success: boolean; data: ActivityStats }> {
    const response = await fetch(`${API_URL}/activity-logs/stats`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  // Get activity types
  async getTypes(): Promise<{
    success: boolean;
    data: { type: string; label: string }[];
  }> {
    const response = await fetch(`${API_URL}/activity-logs/types`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  // Delete single log
  async deleteLog(id: string) {
    const response = await fetch(`${API_URL}/activity-logs/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  // Delete multiple logs
  async deleteMultiple(ids: string[]) {
    const response = await fetch(`${API_URL}/activity-logs/delete-multiple`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ ids }),
    });
    return response.json();
  },

  // Export logs to CSV
  async exportLogs(filters: {
    type?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const params = new URLSearchParams();
    if (filters.type) params.append("type", filters.type);
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    params.append("format", "csv");

    const response = await fetch(
      `${API_URL}/activity-logs/export?${params.toString()}`,
      { headers: getAuthHeaders() }
    );

    // Download file
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `activity_logs_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

export const alertRuleService = {
  // Get all alert rules
  async getRules(): Promise<{ success: boolean; data: AlertRule[] }> {
    const response = await fetch(`${API_URL}/alert-rules`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  // Get single rule
  async getRuleById(
    id: string
  ): Promise<{ success: boolean; data: AlertRule }> {
    const response = await fetch(`${API_URL}/alert-rules/${id}`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  // Create new rule
  async createRule(data: {
    name: string;
    description?: string;
    category: "HR" | "System" | "Security";
    threshold: number;
    unit: "days" | "percent" | "count";
    notify_roles: string[];
  }): Promise<{ success: boolean; data: AlertRule }> {
    const response = await fetch(`${API_URL}/alert-rules`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Update rule
  async updateRule(
    id: string,
    data: {
      threshold?: number;
      notify_roles?: string[];
      is_enabled?: boolean;
      description?: string;
    }
  ): Promise<{ success: boolean; data: AlertRule }> {
    const response = await fetch(`${API_URL}/alert-rules/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Toggle enable/disable
  async toggleRule(id: string): Promise<{ success: boolean; data: AlertRule }> {
    const response = await fetch(`${API_URL}/alert-rules/${id}/toggle`, {
      method: "PATCH",
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  // Delete rule
  async deleteRule(id: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_URL}/alert-rules/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return response.json();
  },
};
