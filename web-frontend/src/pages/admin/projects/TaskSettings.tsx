import React, { useEffect, useState } from "react";
import { Tag, Edit2, Plus, Loader2, Clock } from "lucide-react";
import { settingsService } from "../../../services/projectService";

interface Priority {
  name: string;
  color: string;
  slaHours: number;
}

interface TaskTag {
  name: string;
  color: string;
  usageCount: number;
}

export const TaskSettings = () => {
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [tags, setTags] = useState<TaskTag[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsService.getTaskSettings();
      if (response.success) {
        setPriorities(response.data.priorities);
        setTags(response.data.tags);
        setStatuses(response.data.statuses);
      }
    } catch (err: any) {
      console.error("Lỗi khi tải cấu hình:", err);
      setError("Không thể tải cấu hình");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-slate-500">Đang tải cấu hình...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Cấu hình chung (Task Settings)
        </h1>
        <p className="text-slate-500">
          Quản lý độ ưu tiên, nhãn dán và các trạng thái task trong hệ thống.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Priorities */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Clock size={18} className="text-slate-600" />
              Độ ưu tiên & SLA
            </h3>
            <span className="text-xs text-slate-500 italic">
              Hệ thống mặc định
            </span>
          </div>
          <div className="divide-y divide-slate-100">
            {priorities.length > 0 ? (
              priorities.map((p, idx) => (
                <div
                  key={idx}
                  className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${p.color}`}></div>
                    <div>
                      <div className="font-medium text-slate-900">{p.name}</div>
                      <div className="text-xs text-slate-500">
                        SLA: {p.slaHours} giờ
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-slate-400">
                Chưa có cấu hình ưu tiên
              </div>
            )}
          </div>
        </div>

        {/* Tags */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Tag size={18} className="text-slate-600" />
              Nhãn dán (Tags)
            </h3>
            <span className="text-xs text-slate-500 italic">
              Tự động từ tasks
            </span>
          </div>
          <div className="p-6">
            {tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, idx) => (
                  <div
                    key={idx}
                    className={`${tag.color} px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 hover:shadow transition-shadow`}
                  >
                    <Tag size={14} />
                    {tag.name}
                    <span className="bg-white bg-opacity-60 px-1.5 py-0.5 rounded text-xs">
                      {tag.usageCount}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                Chưa có nhãn nào được sử dụng
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Statuses */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-900">Trạng thái Task</h3>
          <span className="text-xs text-slate-500 italic">Từ workflows</span>
        </div>
        <div className="p-6">
          {statuses.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {statuses.map((status, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  {status}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              Chưa có trạng thái nào. Tạo workflow để định nghĩa trạng thái.
            </div>
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
              i
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">
              Về trang cấu hình
            </h4>
            <p className="text-sm text-blue-700">
              <strong>Độ ưu tiên & SLA:</strong> Giá trị mặc định của hệ thống
              (Critical, High, Medium, Low).
              <br />
              <strong>Nhãn dán:</strong> Được tạo tự động khi thêm tags vào
              tasks.
              <br />
              <strong>Trạng thái:</strong> Được lấy từ các workflows đã tạo.
              Truy cập <strong>Thiết kế Quy trình</strong> để quản lý.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
