import React, { useState, useEffect, useCallback } from "react";
import {
  activityLogService,
  ActivityLog,
  ActivityStats,
} from "../../../services/activityLogService";
import { Button } from "../../../components/system/ui/Button";
import {
  Search,
  Filter,
  Trash2,
  Eye,
  FileText,
  MessageSquare,
  CheckSquare,
  LogIn,
  Activity,
  UserCog,
  Database,
  Calendar,
  X,
  ChevronDown,
  ChevronRight,
  Server,
  Download,
  RefreshCw,
  Clock,
  TrendingUp,
  Users,
  AlertTriangle,
  Shield,
  Folder,
  CalendarCheck,
  ChevronLeft,
  Settings,
  LogOut,
  Key,
  Briefcase,
  MessageCircle,
  Newspaper,
  Upload,
} from "lucide-react";

// Helper function to get activity icon
const getActivityIcon = (type: string, size: number = 16) => {
  const iconMap: Record<string, { icon: React.ElementType; color: string }> = {
    login: { icon: LogIn, color: "text-green-500" },
    logout: { icon: LogOut, color: "text-slate-500" },
    login_failed: { icon: AlertTriangle, color: "text-red-500" },
    password_change: { icon: Key, color: "text-amber-500" },
    profile_update: { icon: UserCog, color: "text-blue-500" },
    post_create: { icon: FileText, color: "text-blue-500" },
    post_update: { icon: FileText, color: "text-blue-400" },
    post_delete: { icon: FileText, color: "text-red-400" },
    comment: { icon: MessageSquare, color: "text-orange-500" },
    task_create: { icon: CheckSquare, color: "text-green-500" },
    task_update: { icon: CheckSquare, color: "text-blue-500" },
    task_complete: { icon: CheckSquare, color: "text-green-600" },
    project_create: { icon: Folder, color: "text-purple-500" },
    project_update: { icon: Folder, color: "text-purple-400" },
    project_delete: { icon: Folder, color: "text-red-400" },
    personnel_change: { icon: Users, color: "text-purple-500" },
    user_create: { icon: Users, color: "text-green-500" },
    user_update: { icon: UserCog, color: "text-blue-500" },
    user_delete: { icon: Users, color: "text-red-500" },
    department_create: { icon: Briefcase, color: "text-indigo-500" },
    department_update: { icon: Briefcase, color: "text-indigo-400" },
    booking_create: { icon: CalendarCheck, color: "text-teal-500" },
    booking_approve: { icon: CalendarCheck, color: "text-green-500" },
    booking_reject: { icon: CalendarCheck, color: "text-red-500" },
    booking_cancel: { icon: CalendarCheck, color: "text-slate-500" },
    meeting_create: { icon: Calendar, color: "text-blue-500" },
    meeting_join: { icon: Calendar, color: "text-green-500" },
    news_create: { icon: Newspaper, color: "text-blue-500" },
    news_publish: { icon: Newspaper, color: "text-green-500" },
    forum_post: { icon: MessageCircle, color: "text-orange-500" },
    forum_moderate: { icon: Shield, color: "text-amber-500" },
    chat_create: { icon: MessageSquare, color: "text-blue-500" },
    file_upload: { icon: Upload, color: "text-teal-500" },
    settings_change: { icon: Settings, color: "text-slate-600" },
    security_alert: { icon: Shield, color: "text-red-600" },
    data_backup: { icon: Database, color: "text-teal-500" },
    system: { icon: Server, color: "text-gray-600" },
  };

  const config = iconMap[type] || { icon: Activity, color: "text-slate-500" };
  const IconComponent = config.icon;

  return <IconComponent size={size} className={config.color} />;
};

// Type label mapping
const typeLabels: Record<string, string> = {
  login: "Đăng nhập",
  logout: "Đăng xuất",
  login_failed: "Đăng nhập thất bại",
  password_change: "Đổi mật khẩu",
  profile_update: "Cập nhật hồ sơ",
  post_create: "Tạo bài viết",
  post_update: "Cập nhật bài viết",
  post_delete: "Xóa bài viết",
  comment: "Bình luận",
  task_create: "Tạo task",
  task_update: "Cập nhật task",
  task_complete: "Hoàn thành task",
  task_delete: "Xóa task",
  project_create: "Tạo dự án",
  project_update: "Cập nhật dự án",
  project_delete: "Xóa dự án",
  personnel_change: "Thay đổi nhân sự",
  user_create: "Tạo người dùng",
  user_update: "Cập nhật người dùng",
  user_delete: "Xóa người dùng",
  department_create: "Tạo phòng ban",
  department_update: "Cập nhật phòng ban",
  department_delete: "Xóa phòng ban",
  booking_create: "Đặt phòng",
  booking_approve: "Duyệt đặt phòng",
  booking_reject: "Từ chối đặt phòng",
  booking_cancel: "Hủy đặt phòng",
  meeting_create: "Tạo cuộc họp",
  meeting_join: "Tham gia cuộc họp",
  meeting_end: "Kết thúc cuộc họp",
  news_create: "Tạo tin tức",
  news_update: "Cập nhật tin tức",
  news_publish: "Xuất bản tin tức",
  forum_post: "Đăng bài diễn đàn",
  forum_moderate: "Kiểm duyệt diễn đàn",
  chat_create: "Tạo cuộc trò chuyện",
  file_upload: "Tải lên file",
  file_delete: "Xóa file",
  settings_change: "Thay đổi cài đặt",
  security_alert: "Cảnh báo bảo mật",
  permission_change: "Thay đổi quyền",
  data_backup: "Sao lưu dữ liệu",
  data_restore: "Khôi phục dữ liệu",
  system: "Hệ thống",
};

// Modal chi tiết hoạt động
const ActivityDetailModal = ({
  log,
  onClose,
}: {
  log: ActivityLog;
  onClose: () => void;
}) => {
  const [showRaw, setShowRaw] = useState(false);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-900">
            Chi tiết Hoạt động
          </h3>
          <button onClick={onClose}>
            <X size={20} className="text-slate-400 hover:text-slate-600" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Header với icon */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex gap-4 items-start">
            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
              {getActivityIcon(log.type, 28)}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-900 text-lg">
                {log.content}
              </p>
              {log.target && (
                <p className="text-brand-600 font-medium mt-1">
                  Đối tượng: {log.target}
                </p>
              )}
            </div>
          </div>

          {/* Thông tin chi tiết */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-slate-50 p-3 rounded-lg">
              <span className="block text-slate-500 text-xs uppercase font-bold mb-1">
                Người thực hiện
              </span>
              <div className="flex items-center gap-2">
                {log.user_avatar ? (
                  <img
                    src={log.user_avatar}
                    alt=""
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center">
                    <Users size={16} className="text-brand-600" />
                  </div>
                )}
                <div>
                  <span className="font-medium text-slate-800 block">
                    {log.user_name || "Hệ thống"}
                  </span>
                  {log.user_email && (
                    <span className="text-xs text-slate-500">
                      {log.user_email}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg">
              <span className="block text-slate-500 text-xs uppercase font-bold mb-1">
                Thời gian
              </span>
              <span className="font-medium text-slate-800 flex items-center gap-2">
                <Clock size={16} className="text-slate-400" />
                {formatDate(log.created_at)}
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg">
              <span className="block text-slate-500 text-xs uppercase font-bold mb-1">
                Loại hành động
              </span>
              <span className="bg-slate-200 px-2 py-1 rounded text-xs font-mono inline-flex items-center gap-1">
                {getActivityIcon(log.type, 12)}
                {typeLabels[log.type] || log.type}
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg">
              <span className="block text-slate-500 text-xs uppercase font-bold mb-1">
                IP Address
              </span>
              <span className="font-mono text-slate-700">
                {log.ip_address || "Không xác định"}
              </span>
            </div>
          </div>

          {/* Meta data */}
          {log.meta && Object.keys(log.meta).length > 0 && (
            <div className="border-t border-slate-100 pt-4">
              <button
                onClick={() => setShowRaw(!showRaw)}
                className="flex items-center text-xs font-bold text-slate-500 hover:text-brand-600 mb-2"
              >
                {showRaw ? (
                  <ChevronDown size={14} className="mr-1" />
                ) : (
                  <ChevronRight size={14} className="mr-1" />
                )}
                Dữ liệu kỹ thuật (Meta Data)
              </button>

              {showRaw && (
                <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg text-xs overflow-x-auto font-mono">
                  {JSON.stringify(log.meta, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-6">
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
};

// Stats Card Component
const StatsCard = ({
  icon: Icon,
  label,
  value,
  trend,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  trend?: string;
  color: string;
}) => (
  <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
    <div className="flex items-center gap-3">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        {trend && <p className="text-xs text-green-600">{trend}</p>}
      </div>
    </div>
  </div>
);

export const AuditLogManager = () => {
  // State
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const [selectedLogs, setSelectedLogs] = useState<string[]>([]);
  const [activityTypes, setActivityTypes] = useState<
    { type: string; label: string }[]
  >([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });

  // Fetch data
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const result = await activityLogService.getLogs({
        page: pagination.page,
        limit: pagination.limit,
        type: filterType !== "all" ? filterType : undefined,
        search: searchQuery || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });

      setLogs(result.data || []);
      setPagination((prev) => ({
        ...prev,
        total: result.pagination?.total || 0,
        totalPages: result.pagination?.totalPages || 0,
      }));
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  }, [
    pagination.page,
    pagination.limit,
    filterType,
    searchQuery,
    startDate,
    endDate,
  ]);

  const fetchStats = async () => {
    try {
      const result = await activityLogService.getStats();
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchTypes = async () => {
    try {
      const result = await activityLogService.getTypes();
      if (result.success) {
        setActivityTypes(result.data);
      }
    } catch (error) {
      console.error("Error fetching types:", error);
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchStats();
    fetchTypes();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Handlers
  const handleDelete = async (id: string) => {
    if (
      window.confirm(
        "Bạn có chắc chắn muốn xóa nhật ký này? Hành động này không thể hoàn tác."
      )
    ) {
      try {
        await activityLogService.deleteLog(id);
        await fetchLogs();
        await fetchStats();
      } catch (error) {
        console.error("Error deleting log:", error);
        alert("Không thể xóa nhật ký");
      }
    }
  };

  const handleDeleteMultiple = async () => {
    if (selectedLogs.length === 0) return;
    if (
      window.confirm(
        `Bạn có chắc chắn muốn xóa ${selectedLogs.length} nhật ký?`
      )
    ) {
      try {
        await activityLogService.deleteMultiple(selectedLogs);
        setSelectedLogs([]);
        await fetchLogs();
        await fetchStats();
      } catch (error) {
        console.error("Error deleting logs:", error);
        alert("Không thể xóa nhật ký");
      }
    }
  };

  const handleExport = async () => {
    try {
      await activityLogService.exportLogs({
        type: filterType !== "all" ? filterType : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
    } catch (error) {
      console.error("Error exporting logs:", error);
      alert("Không thể xuất dữ liệu");
    }
  };

  const handleRefresh = () => {
    fetchLogs();
    fetchStats();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchLogs();
  };

  const toggleSelectLog = (id: string) => {
    setSelectedLogs((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedLogs.length === logs.length) {
      setSelectedLogs([]);
    } else {
      setSelectedLogs(logs.map((l) => l.id));
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="animate-fadeIn h-full">
      {selectedLog && (
        <ActivityDetailModal
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      )}

      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Nhật ký Hoạt động
          </h2>
          <p className="text-slate-500 mt-1">
            Theo dõi và giám sát toàn bộ hành động trên hệ thống.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw
              size={16}
              className={`mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Làm mới
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download size={16} className="mr-2" /> Xuất CSV
          </Button>
          {selectedLogs.length > 0 && (
            <Button variant="danger" onClick={handleDeleteMultiple}>
              <Trash2 size={16} className="mr-2" /> Xóa ({selectedLogs.length})
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatsCard
            icon={Activity}
            label="Tổng hoạt động"
            value={stats.totalLogs.toLocaleString()}
            color="bg-blue-500"
          />
          <StatsCard
            icon={Clock}
            label="Hôm nay"
            value={stats.todayLogs.toLocaleString()}
            trend={`+${Math.round(
              (stats.todayLogs / Math.max(stats.totalLogs, 1)) * 100
            )}%`}
            color="bg-green-500"
          />
          <StatsCard
            icon={Users}
            label="Người dùng hoạt động"
            value={stats.recentUsers.length}
            color="bg-purple-500"
          />
          <StatsCard
            icon={TrendingUp}
            label="Loại hoạt động"
            value={stats.logsByType.length}
            color="bg-amber-500"
          />
        </div>
      )}

      {/* Filters */}
      <form
        onSubmit={handleSearch}
        className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6"
      >
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Tìm kiếm
            </label>
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-2.5 text-slate-400"
              />
              <input
                type="text"
                placeholder="Tìm theo nội dung, người dùng..."
                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 w-full outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="w-48">
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Loại hành động
            </label>
            <div className="relative">
              <select
                className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 appearance-none outline-none cursor-pointer"
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
              >
                <option value="all">Tất cả</option>
                {activityTypes.map((t) => (
                  <option key={t.type} value={t.type}>
                    {t.label}
                  </option>
                ))}
              </select>
              <Filter
                size={16}
                className="absolute left-3 top-2.5 text-slate-400 pointer-events-none"
              />
              <ChevronDown
                size={14}
                className="absolute right-3 top-3 text-slate-400 pointer-events-none"
              />
            </div>
          </div>

          <div className="w-40">
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Từ ngày
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="w-40">
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Đến ngày
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <Button type="submit">
            <Search size={16} className="mr-2" /> Tìm kiếm
          </Button>
        </div>
      </form>

      {/* Pagination info */}
      <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
        <div className="flex items-center gap-4">
          <span>
            Hiển thị {logs.length} / {pagination.total.toLocaleString()} kết quả
          </span>
          {selectedLogs.length > 0 && (
            <span className="text-brand-600 font-medium">
              Đã chọn {selectedLogs.length} mục
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span>Số dòng:</span>
          <select
            className="bg-white border border-slate-200 rounded px-2 py-1 text-sm"
            value={pagination.limit}
            onChange={(e) =>
              setPagination((prev) => ({
                ...prev,
                limit: parseInt(e.target.value),
                page: 1,
              }))
            }
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={200}>200</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-4 text-left w-10">
                  <input
                    type="checkbox"
                    checked={
                      selectedLogs.length === logs.length && logs.length > 0
                    }
                    onChange={toggleSelectAll}
                    className="rounded text-brand-600"
                  />
                </th>
                <th className="px-4 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-12">
                  Loại
                </th>
                <th className="px-4 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Nội dung hành động
                </th>
                <th className="px-4 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-48">
                  Người thực hiện
                </th>
                <th className="px-4 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-36">
                  IP Address
                </th>
                <th className="px-4 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-44">
                  Thời gian
                </th>
                <th className="px-4 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider w-24">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <RefreshCw
                        className="animate-spin text-brand-600 mb-2"
                        size={32}
                      />
                      <span className="text-slate-500">
                        Đang tải dữ liệu...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    <Activity
                      size={48}
                      className="mx-auto mb-4 text-slate-300"
                    />
                    <p className="text-lg font-medium">
                      Không tìm thấy nhật ký hoạt động
                    </p>
                    <p className="text-sm">
                      Thử thay đổi bộ lọc để xem kết quả khác
                    </p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.id}
                    className={`hover:bg-slate-50 transition-colors ${
                      selectedLogs.includes(log.id) ? "bg-brand-50" : ""
                    }`}
                  >
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedLogs.includes(log.id)}
                        onChange={() => toggleSelectLog(log.id)}
                        className="rounded text-brand-600"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div
                        className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center cursor-pointer hover:bg-slate-200"
                        title={typeLabels[log.type] || log.type}
                      >
                        {getActivityIcon(log.type, 20)}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-medium text-slate-900">
                        {log.content}
                      </p>
                      {log.target && (
                        <p className="text-xs text-brand-600 mt-0.5">
                          {log.target}
                        </p>
                      )}
                      <span className="inline-block mt-1 text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        {typeLabels[log.type] || log.type}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {log.user_avatar ? (
                          <img
                            src={log.user_avatar}
                            alt=""
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                            <Users size={14} className="text-slate-500" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm text-slate-700 font-medium">
                            {log.user_name || "Hệ thống"}
                          </p>
                          {log.user_email && (
                            <p className="text-xs text-slate-400">
                              {log.user_email}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs text-slate-500 font-mono">
                        {log.ip_address || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-500">
                      {formatDate(log.created_at)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(log.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa nhật ký"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
            <div className="text-sm text-slate-500">
              Trang {pagination.page} / {pagination.totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === 1}
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                }
              >
                <ChevronLeft size={16} className="mr-1" />
                Trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === pagination.totalPages}
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                }
              >
                Sau
                <ChevronRight size={16} className="ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Activity by Type Stats */}
      {stats && stats.logsByType.length > 0 && (
        <div className="mt-6 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            Phân bố theo loại hoạt động
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {stats.logsByType.slice(0, 12).map((item) => (
              <div
                key={item.type}
                className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100"
                onClick={() => {
                  setFilterType(item.type);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
              >
                {getActivityIcon(item.type, 18)}
                <div>
                  <p className="text-xs text-slate-500 truncate">
                    {typeLabels[item.type] || item.type}
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    {item.count.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Most Active Users Today */}
      {stats && stats.recentUsers.length > 0 && (
        <div className="mt-6 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            Người dùng hoạt động nhiều nhất hôm nay
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {stats.recentUsers.map((user, index) => (
              <div
                key={user.user_id}
                className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg"
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center">
                    <Users size={18} className="text-brand-600" />
                  </div>
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {user.user_name || "N/A"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {user.count} hoạt động
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
