const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

export interface NotificationSettings {
  id: string;
  user_id: string;
  // Kênh thông báo
  email_enabled: boolean;
  push_enabled: boolean;
  sms_enabled: boolean;
  in_app_enabled: boolean;
  // Loại thông báo
  notify_on_comment: boolean;
  notify_on_mention: boolean;
  notify_on_task_assign: boolean;
  notify_on_task_update: boolean;
  notify_on_task_complete: boolean;
  notify_on_project_update: boolean;
  notify_on_meeting: boolean;
  notify_on_meeting_invite: boolean;
  notify_on_booking_status: boolean;
  notify_on_news: boolean;
  notify_on_forum_reply: boolean;
  notify_on_chat_message: boolean;
  notify_on_system_alert: boolean;
  notify_on_personnel_change: boolean;
  // Do Not Disturb
  dnd_enabled: boolean;
  dnd_start_time: string;
  dnd_end_time: string;
  dnd_weekends_only: boolean;
  // Email digest
  email_digest_enabled: boolean;
  email_digest_frequency: "daily" | "weekly" | "never";
  created_at: string;
  updated_at: string;
}

export interface NotificationSettingsUpdate {
  email_enabled?: boolean;
  push_enabled?: boolean;
  sms_enabled?: boolean;
  in_app_enabled?: boolean;
  notify_on_comment?: boolean;
  notify_on_mention?: boolean;
  notify_on_task_assign?: boolean;
  notify_on_task_update?: boolean;
  notify_on_task_complete?: boolean;
  notify_on_project_update?: boolean;
  notify_on_meeting?: boolean;
  notify_on_meeting_invite?: boolean;
  notify_on_booking_status?: boolean;
  notify_on_news?: boolean;
  notify_on_forum_reply?: boolean;
  notify_on_chat_message?: boolean;
  notify_on_system_alert?: boolean;
  notify_on_personnel_change?: boolean;
  dnd_enabled?: boolean;
  dnd_start_time?: string;
  dnd_end_time?: string;
  dnd_weekends_only?: boolean;
  email_digest_enabled?: boolean;
  email_digest_frequency?: "daily" | "weekly" | "never";
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  related_id?: string;
  category?: string;
  priority?: "low" | "normal" | "high" | "urgent";
  link?: string;
  actor_id?: string;
  actor_name?: string;
  actor_avatar?: string;
  expires_at?: string;
  created_at: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byCategory: { category: string; count: number }[];
  byType: { type: string; count: number }[];
}

export const notificationSettingsService = {
  // Lấy cài đặt thông báo của người dùng hiện tại
  async getSettings(): Promise<{
    success: boolean;
    data: NotificationSettings;
  }> {
    const response = await fetch(`${API_URL}/notifications/settings`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  // Cập nhật cài đặt thông báo
  async updateSettings(settings: NotificationSettingsUpdate): Promise<{
    success: boolean;
    data: NotificationSettings;
    message: string;
  }> {
    const response = await fetch(`${API_URL}/notifications/settings`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(settings),
    });
    return response.json();
  },

  // Lấy thông báo với phân trang
  async getNotifications(
    options: {
      limit?: number;
      offset?: number;
      unreadOnly?: boolean;
      category?: string;
      type?: string;
    } = {}
  ): Promise<{
    success: boolean;
    data: Notification[];
    pagination: { total: number; unreadCount: number };
  }> {
    const params = new URLSearchParams();
    if (options.limit) params.append("limit", options.limit.toString());
    if (options.offset) params.append("offset", options.offset.toString());
    if (options.unreadOnly) params.append("unreadOnly", "true");
    if (options.category) params.append("category", options.category);
    if (options.type) params.append("type", options.type);

    const response = await fetch(
      `${API_URL}/notifications?${params.toString()}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.json();
  },

  // Lấy thống kê thông báo
  async getStats(): Promise<{ success: boolean; data: NotificationStats }> {
    const response = await fetch(`${API_URL}/notifications/stats`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  // Đánh dấu đã đọc một thông báo
  async markAsRead(notificationId: string): Promise<{ success: boolean }> {
    const response = await fetch(
      `${API_URL}/notifications/${notificationId}/read`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
      }
    );
    return response.json();
  },

  // Đánh dấu đã đọc tất cả
  async markAllAsRead(
    category?: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_URL}/notifications/read-all`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ category }),
    });
    return response.json();
  },

  // Xóa thông báo
  async deleteNotification(
    notificationId: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_URL}/notifications/${notificationId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  // Xóa tất cả thông báo đã đọc
  async deleteAllRead(): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_URL}/notifications`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return response.json();
  },
};

// Mapping loại thông báo sang tiếng Việt
export const notificationTypeLabels: Record<string, string> = {
  comment: "Bình luận",
  upvote: "Thích bài viết",
  mention: "Được nhắc đến",
  system: "Hệ thống",
  task_assign: "Giao task",
  task_update: "Cập nhật task",
  task_complete: "Hoàn thành task",
  project_update: "Cập nhật dự án",
  meeting: "Cuộc họp",
  meeting_invite: "Mời họp",
  booking_status: "Đặt phòng",
  news: "Tin tức",
  forum_reply: "Trả lời diễn đàn",
  chat_message: "Tin nhắn",
  personnel_change: "Thay đổi nhân sự",
  alert: "Cảnh báo",
};

// Mapping category sang tiếng Việt
export const notificationCategoryLabels: Record<string, string> = {
  general: "Chung",
  task: "Công việc",
  project: "Dự án",
  communication: "Giao tiếp",
  meeting: "Cuộc họp",
  news: "Tin tức",
  system: "Hệ thống",
};
