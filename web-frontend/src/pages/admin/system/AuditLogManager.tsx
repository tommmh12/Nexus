import React, { useState } from "react";
// TODO: Replace with API call
import { ActivityLog, ActivityType } from "../../types";
import { Button } from "../../../components/system/ui/Button";
import { Input } from "../../../components/system/ui/Input";
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
} from "lucide-react";

const ActivityDetailModal = ({
  log,
  onClose,
}: {
  log: ActivityLog;
  onClose: () => void;
}) => {
  const [showRaw, setShowRaw] = useState(false);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6"
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
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex gap-4 items-start">
            <div className="p-2 bg-white rounded border border-slate-200 shadow-sm">
              <Activity size={24} className="text-slate-500" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 text-lg">
                {log.content}
              </p>
              {log.target && (
                <p className="text-brand-600 font-medium">
                  Đối tượng: {log.target}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="block text-slate-500 text-xs uppercase font-bold mb-1">
                Người thực hiện
              </span>
              <span className="font-medium text-slate-800">
                {log.userName || log.userId}
              </span>
            </div>
            <div>
              <span className="block text-slate-500 text-xs uppercase font-bold mb-1">
                Thời gian
              </span>
              <span className="font-medium text-slate-800">
                {log.timestamp}
              </span>
            </div>
            <div>
              <span className="block text-slate-500 text-xs uppercase font-bold mb-1">
                Loại hành động
              </span>
              <span className="bg-slate-100 px-2 py-0.5 rounded text-xs font-mono">
                {log.type}
              </span>
            </div>
            <div>
              <span className="block text-slate-500 text-xs uppercase font-bold mb-1">
                IP Address
              </span>
              <span className="font-mono text-slate-700">
                {log.ipAddress || "---"}
              </span>
            </div>
          </div>

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
              <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg text-xs overflow-x-auto font-mono">
                {JSON.stringify(log.meta || {}, null, 2)}
              </pre>
            )}
          </div>
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

export const AuditLogManager = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);

  const handleDelete = (id: string) => {
    if (
      window.confirm(
        "Bạn có chắc chắn muốn xóa nhật ký này? Hành động này không thể hoàn tác."
      )
    ) {
      setLogs((prev) => prev.filter((l) => l.id !== id));
    }
  };

  const handleExport = () => {
    alert("Đang xuất dữ liệu ra file CSV...");
  };

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case "post_create":
        return <FileText size={16} className="text-blue-500" />;
      case "comment":
        return <MessageSquare size={16} className="text-orange-500" />;
      case "task_complete":
        return <CheckSquare size={16} className="text-green-500" />;
      case "login":
        return <LogIn size={16} className="text-slate-500" />;
      case "personnel_change":
        return <UserCog size={16} className="text-purple-500" />;
      case "data_backup":
        return <Database size={16} className="text-teal-500" />;
      case "system":
        return <Server size={16} className="text-gray-600" />;
      default:
        return <Activity size={16} className="text-slate-500" />;
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.userName &&
        log.userName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.target &&
        log.target.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = filterType === "all" || log.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="animate-fadeIn h-full">
      {selectedLog && (
        <ActivityDetailModal
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      )}

      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Nhật ký Hoạt động
          </h2>
          <p className="text-slate-500 mt-1">
            Theo dõi toàn bộ hành động của nhân viên trên hệ thống.
          </p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download size={16} className="mr-2" /> Xuất CSV
        </Button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search
              size={16}
              className="absolute left-3 top-2.5 text-slate-400"
            />
            <input
              type="text"
              placeholder="Tìm kiếm hành động, người dùng..."
              className="pl-9 pr-4 py-2 bg-slate-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-brand-500 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="relative">
            <select
              className="h-full pl-9 pr-8 py-2 bg-slate-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-brand-500 appearance-none outline-none cursor-pointer"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">Tất cả hành động</option>
              <option value="login">Đăng nhập (Login)</option>
              <option value="post_create">Đăng bài (Post)</option>
              <option value="comment">Bình luận (Comment)</option>
              <option value="task_complete">Công việc (Task)</option>
              <option value="personnel_change">Nhân sự (HR)</option>
              <option value="data_backup">Sao lưu (Backup)</option>
              <option value="system">Hệ thống (System)</option>
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

        <div className="flex items-center text-sm text-slate-500">
          <Calendar size={16} className="mr-2" />
          <span>Hiển thị: {filteredLogs.length} kết quả</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-12">
                Loại
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                Nội dung hành động
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                Người thực hiện
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                Thời gian
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                    {getActivityIcon(log.type)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-slate-900">
                    {log.content}
                  </p>
                  {log.target && (
                    <p className="text-xs text-brand-600 mt-0.5">
                      {log.target}
                    </p>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-slate-700 font-medium">
                    {log.userName || log.userId}
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    {log.ipAddress}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">
                  {log.timestamp}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded"
                      title="Xem chi tiết"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(log.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                      title="Xóa nhật ký"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredLogs.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-8 text-center text-slate-500 text-sm"
                >
                  Không tìm thấy nhật ký hoạt động phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
