// Trang xem tất cả thông báo
import React, { useState, useEffect, useCallback } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Filter,
  RefreshCw,
  AlertTriangle,
  Info,
  MessageSquare,
  Calendar,
  Users,
  Shield,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
} from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type:
    | "info"
    | "success"
    | "warning"
    | "error"
    | "task"
    | "booking"
    | "project"
    | "comment"
    | "system_alert";
  category?: string;
  priority?: "low" | "normal" | "high" | "urgent";
  is_read: boolean;
  link?: string;
  created_at: string;
  read_at?: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const API_URL = "http://localhost:5000/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [filter, setFilter] = useState<{
    type: string;
    isRead: string;
    search: string;
  }>({
    type: "all",
    isRead: "all",
    search: "",
  });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (filter.type !== "all") params.append("type", filter.type);
      if (filter.isRead !== "all")
        params.append("is_read", filter.isRead === "read" ? "true" : "false");
      if (filter.search) params.append("search", filter.search);

      const response = await fetch(`${API_URL}/notifications?${params}`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();

      setNotifications(data.data || []);
      if (data.pagination) {
        setPagination((prev) => ({
          ...prev,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages,
        }));
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filter]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Mark as read
  const markAsRead = async (ids: string[]) => {
    try {
      await Promise.all(
        ids.map((id) =>
          fetch(`${API_URL}/notifications/${id}/read`, {
            method: "PUT",
            headers: getAuthHeaders(),
          })
        )
      );
      fetchNotifications();
      setSelectedIds(new Set());
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await fetch(`${API_URL}/notifications/read-all`, {
        method: "PUT",
        headers: getAuthHeaders(),
      });
      fetchNotifications();
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  // Delete notification
  const deleteNotification = async (ids: string[]) => {
    if (!confirm("Bạn có chắc muốn xóa thông báo đã chọn?")) return;
    try {
      await Promise.all(
        ids.map((id) =>
          fetch(`${API_URL}/notifications/${id}`, {
            method: "DELETE",
            headers: getAuthHeaders(),
          })
        )
      );
      fetchNotifications();
      setSelectedIds(new Set());
    } catch (error) {
      console.error("Error deleting notifications:", error);
    }
  };

  // Toggle selection
  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // Select all on current page
  const selectAll = () => {
    if (selectedIds.size === notifications.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(notifications.map((n) => n.id)));
    }
  };

  // Get icon for notification type
  const getIcon = (notification: Notification) => {
    const iconClass = "w-5 h-5";
    switch (notification.type) {
      case "warning":
      case "system_alert":
        return <AlertTriangle className={`${iconClass} text-amber-500`} />;
      case "error":
        return <AlertTriangle className={`${iconClass} text-red-500`} />;
      case "success":
        return <Check className={`${iconClass} text-green-500`} />;
      case "task":
        return <CheckCheck className={`${iconClass} text-blue-500`} />;
      case "booking":
        return <Calendar className={`${iconClass} text-purple-500`} />;
      case "project":
        return <Users className={`${iconClass} text-indigo-500`} />;
      case "comment":
        return <MessageSquare className={`${iconClass} text-cyan-500`} />;
      default:
        return <Info className={`${iconClass} text-gray-500`} />;
    }
  };

  // Get priority badge
  const getPriorityBadge = (priority?: string) => {
    if (!priority) return null;
    const colors: Record<string, string> = {
      urgent: "bg-red-100 text-red-700 border-red-200",
      high: "bg-orange-100 text-orange-700 border-orange-200",
      normal: "bg-blue-100 text-blue-700 border-blue-200",
      low: "bg-gray-100 text-gray-600 border-gray-200",
    };
    const labels: Record<string, string> = {
      urgent: "Khẩn cấp",
      high: "Cao",
      normal: "Bình thường",
      low: "Thấp",
    };
    return (
      <span
        className={`px-2 py-0.5 text-xs rounded-full border ${
          colors[priority] || colors.normal
        }`}
      >
        {labels[priority] || priority}
      </span>
    );
  };

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const notificationTypes = [
    { value: "all", label: "Tất cả loại" },
    { value: "info", label: "Thông tin" },
    { value: "success", label: "Thành công" },
    { value: "warning", label: "Cảnh báo" },
    { value: "error", label: "Lỗi" },
    { value: "task", label: "Công việc" },
    { value: "booking", label: "Đặt phòng" },
    { value: "project", label: "Dự án" },
    { value: "comment", label: "Bình luận" },
    { value: "system_alert", label: "Cảnh báo hệ thống" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Bell className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">
                    Tất cả thông báo
                  </h1>
                  <p className="text-sm text-gray-500">
                    Tổng cộng {pagination.total} thông báo
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => fetchNotifications()}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Làm mới"
                >
                  <RefreshCw
                    className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
                  />
                </button>
                <button
                  onClick={markAllAsRead}
                  className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-2"
                >
                  <CheckCheck className="w-4 h-4" />
                  Đánh dấu tất cả đã đọc
                </button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="p-4 bg-gray-50 border-b border-gray-100 flex flex-wrap gap-3 items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm thông báo..."
                value={filter.search}
                onChange={(e) => {
                  setFilter((prev) => ({ ...prev, search: e.target.value }));
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {filter.search && (
                <button
                  onClick={() => setFilter((prev) => ({ ...prev, search: "" }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            {/* Type filter */}
            <select
              value={filter.type}
              onChange={(e) => {
                setFilter((prev) => ({ ...prev, type: e.target.value }));
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              {notificationTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>

            {/* Read status filter */}
            <select
              value={filter.isRead}
              onChange={(e) => {
                setFilter((prev) => ({ ...prev, isRead: e.target.value }));
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="unread">Chưa đọc</option>
              <option value="read">Đã đọc</option>
            </select>
          </div>

          {/* Bulk actions */}
          {selectedIds.size > 0 && (
            <div className="p-3 bg-blue-50 border-b border-blue-100 flex items-center gap-4">
              <span className="text-sm text-blue-700">
                Đã chọn {selectedIds.size} thông báo
              </span>
              <button
                onClick={() => markAsRead(Array.from(selectedIds))}
                className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1"
              >
                <Check className="w-4 h-4" />
                Đánh dấu đã đọc
              </button>
              <button
                onClick={() => deleteNotification(Array.from(selectedIds))}
                className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                Xóa
              </button>
            </div>
          )}
        </div>

        {/* Notification List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-3" />
              <p className="text-gray-500">Đang tải thông báo...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Không có thông báo nào</p>
            </div>
          ) : (
            <>
              {/* Select all header */}
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={
                    selectedIds.size === notifications.length &&
                    notifications.length > 0
                  }
                  onChange={selectAll}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">Chọn tất cả</span>
              </div>

              {/* Notifications */}
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors ${
                      !notification.is_read ? "bg-blue-50/30" : ""
                    }`}
                  >
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedIds.has(notification.id)}
                      onChange={() => toggleSelection(notification.id)}
                      className="w-4 h-4 mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />

                    {/* Icon */}
                    <div
                      className={`p-2 rounded-lg ${
                        !notification.is_read ? "bg-blue-100" : "bg-gray-100"
                      }`}
                    >
                      {getIcon(notification)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3
                              className={`font-medium ${
                                !notification.is_read
                                  ? "text-gray-900"
                                  : "text-gray-700"
                              }`}
                            >
                              {notification.title}
                            </h3>
                            {!notification.is_read && (
                              <span className="w-2 h-2 rounded-full bg-blue-500" />
                            )}
                            {getPriorityBadge(notification.priority)}
                          </div>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs text-gray-400">
                              {formatDate(notification.created_at)}
                            </span>
                            {notification.category && (
                              <span className="text-xs text-gray-400 capitalize">
                                • {notification.category}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1">
                          {!notification.is_read && (
                            <button
                              onClick={() => markAsRead([notification.id])}
                              className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Đánh dấu đã đọc"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() =>
                              deleteNotification([notification.id])
                            }
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Link */}
                      {notification.link && (
                        <a
                          href={notification.link}
                          className="inline-flex items-center gap-1 mt-2 text-sm text-blue-600 hover:text-blue-700 hover:underline"
                        >
                          Xem chi tiết →
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="text-sm text-gray-600">
              Trang {pagination.page} / {pagination.totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    page: Math.max(1, prev.page - 1),
                  }))
                }
                disabled={pagination.page === 1}
                className="px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Trước
              </button>

              {/* Page numbers */}
              <div className="flex gap-1">
                {Array.from(
                  { length: Math.min(5, pagination.totalPages) },
                  (_, i) => {
                    let pageNum: number;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() =>
                          setPagination((prev) => ({ ...prev, page: pageNum }))
                        }
                        className={`w-9 h-9 text-sm font-medium rounded-lg transition-colors ${
                          pagination.page === pageNum
                            ? "bg-blue-600 text-white"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                )}
              </div>

              <button
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    page: Math.min(pagination.totalPages, prev.page + 1),
                  }))
                }
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                Sau
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
