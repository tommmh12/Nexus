// Alert Rule Service - API calls for alert configuration
const API_URL =
  (import.meta as any).env?.VITE_API_URL || "http://localhost:5000/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export interface AlertRule {
  id: string;
  name: string;
  description: string | null;
  category: "HR" | "System" | "Security";
  threshold: number;
  unit: "days" | "percent" | "count";
  notify_roles: string[];
  notify_departments: string[];
  notify_users: string[];
  is_enabled: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface DepartmentOption {
  id: string;
  name: string;
  code: string;
}

export interface UserOption {
  id: string;
  full_name: string;
  email: string;
  department_id: string | null;
  department_name: string | null;
}

export interface AlertHistory {
  id: string;
  rule_id: string;
  rule_name: string;
  category: string;
  message: string;
  priority: "low" | "normal" | "high" | "urgent";
  triggered_at: string;
  acknowledged: boolean;
  acknowledged_by?: string;
  acknowledged_at?: string;
}

export interface AlertStats {
  total_rules: number;
  enabled_rules: number;
  disabled_rules: number;
  by_category: { category: string; count: number }[];
  alerts_triggered_today: number;
  alerts_triggered_week: number;
}

export const alertRuleService = {
  // Get all alert rules
  async getRules(): Promise<AlertRule[]> {
    const response = await fetch(`${API_URL}/alert-rules`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch alert rules");
    const data = await response.json();
    return data.data || [];
  },

  // Get single rule by ID
  async getRuleById(id: string): Promise<AlertRule> {
    const response = await fetch(`${API_URL}/alert-rules/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch alert rule");
    const data = await response.json();
    return data.data;
  },

  // Create new rule
  async createRule(rule: {
    name: string;
    description?: string;
    category: "HR" | "System" | "Security";
    threshold: number;
    unit: "days" | "percent" | "count";
    notify_roles: string[];
    notify_departments?: string[];
    notify_users?: string[];
  }): Promise<AlertRule> {
    const response = await fetch(`${API_URL}/alert-rules`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(rule),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create alert rule");
    }
    const data = await response.json();
    return data.data;
  },

  // Update rule
  async updateRule(
    id: string,
    updates: {
      threshold?: number;
      notify_roles?: string[];
      notify_departments?: string[];
      notify_users?: string[];
      is_enabled?: boolean;
      description?: string;
    }
  ): Promise<AlertRule> {
    const response = await fetch(`${API_URL}/alert-rules/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error("Failed to update alert rule");
    const data = await response.json();
    return data.data;
  },

  // Toggle rule enabled/disabled
  async toggleRule(id: string): Promise<AlertRule> {
    const response = await fetch(`${API_URL}/alert-rules/${id}/toggle`, {
      method: "PATCH",
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to toggle alert rule");
    const data = await response.json();
    return data.data;
  },

  // Delete rule
  async deleteRule(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/alert-rules/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to delete alert rule");
  },

  // Get alert history
  async getHistory(params?: {
    rule_id?: string;
    category?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
  }): Promise<AlertHistory[]> {
    const searchParams = new URLSearchParams();
    if (params?.rule_id) searchParams.append("rule_id", params.rule_id);
    if (params?.category) searchParams.append("category", params.category);
    if (params?.start_date)
      searchParams.append("start_date", params.start_date);
    if (params?.end_date) searchParams.append("end_date", params.end_date);
    if (params?.limit) searchParams.append("limit", params.limit.toString());

    const response = await fetch(
      `${API_URL}/alert-rules/history?${searchParams}`,
      {
        headers: getAuthHeaders(),
      }
    );
    if (!response.ok) throw new Error("Failed to fetch alert history");
    const data = await response.json();
    return data.data || [];
  },

  // Get alert statistics
  async getStats(): Promise<AlertStats> {
    const response = await fetch(`${API_URL}/alert-rules/stats`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch alert stats");
    const data = await response.json();
    return data.data;
  },

  // Acknowledge an alert
  async acknowledgeAlert(alertId: string): Promise<void> {
    const response = await fetch(
      `${API_URL}/alert-rules/history/${alertId}/acknowledge`,
      {
        method: "POST",
        headers: getAuthHeaders(),
      }
    );
    if (!response.ok) throw new Error("Failed to acknowledge alert");
  },

  // Test an alert rule (trigger manually for testing)
  async testRule(
    id: string
  ): Promise<{ success: boolean; message: string; data?: any }> {
    const response = await fetch(`${API_URL}/alert-rules/${id}/test`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to test alert rule");
    return response.json();
  },

  // Trigger check for all alert rules
  async triggerCheck(): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_URL}/alert-rules/trigger-check`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to trigger alert check");
    return response.json();
  },

  // Get departments for alert targeting
  async getDepartments(): Promise<DepartmentOption[]> {
    const response = await fetch(`${API_URL}/alert-rules/departments`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch departments");
    const data = await response.json();
    return data.data || [];
  },

  // Get users for alert targeting
  async getUsers(departmentId?: string): Promise<UserOption[]> {
    const url = departmentId
      ? `${API_URL}/alert-rules/users?department_id=${departmentId}`
      : `${API_URL}/alert-rules/users`;
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch users");
    const data = await response.json();
    return data.data || [];
  },

  // Get my alerts (for current user)
  async getMyAlerts(): Promise<AlertRule[]> {
    const response = await fetch(`${API_URL}/alert-rules/my-alerts`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch my alerts");
    const data = await response.json();
    return data.data || [];
  },
};
