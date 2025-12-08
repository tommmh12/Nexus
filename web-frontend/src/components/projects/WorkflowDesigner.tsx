import React, { useEffect, useState } from "react";
import { GitBranch, Plus, Edit2, Trash2, Loader2 } from "lucide-react";
import { workflowService } from "../../services/projectService";
import { Button } from "../system/ui/Button";

interface Workflow {
  id: string;
  name: string;
  description?: string;
  isDefault: boolean;
  usageCount?: number;
  statuses?: WorkflowStatus[];
  createdByName?: string;
}

interface WorkflowStatus {
  id: string;
  name: string;
  color?: string;
  order: number;
}

export const WorkflowDesigner = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      const response = await workflowService.getWorkflows();
      if (response.success) {
        setWorkflows(response.data);
      }
    } catch (err: any) {
      console.error("Lỗi khi tải quy trình:", err);
      setError("Không thể tải danh sách quy trình");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (color?: string) => {
    if (!color) return "bg-slate-500";
    if (color.startsWith("#")) return `bg-[${color}]`;
    return color;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-slate-500">Đang tải quy trình...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600">{error}</p>
        <Button onClick={loadWorkflows} className="mt-4">
          Thử lại
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn space-y-6">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Thiết kế Quy trình (Workflows)
          </h1>
          <p className="text-slate-500 mt-1">
            Định nghĩa các luồng làm việc tự động cho từng phòng ban và dự án.
          </p>
        </div>
        <Button>
          <Plus size={18} className="mr-2" />
          Tạo quy trình
        </Button>
      </div>

      {workflows.length === 0 ? (
        <div className="bg-white rounded-xl border-2 border-dashed border-slate-200 p-12 text-center">
          <GitBranch size={48} className="mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">
            Chưa có quy trình nào
          </h3>
          <p className="text-slate-500 mb-6">
            Tạo quy trình làm việc đầu tiên để quản lý task hiệu quả hơn
          </p>
          <Button>
            <Plus size={18} className="mr-2" />
            Tạo quy trình đầu tiên
          </Button>
        </div>
      ) : (
        <div className="grid gap-6">
          {workflows.map((wf) => (
            <div
              key={wf.id}
              className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                      <GitBranch size={20} className="text-blue-600" />
                      {wf.name}
                    </h3>
                    {wf.isDefault && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                        Mặc định
                      </span>
                    )}
                  </div>
                  {wf.description && (
                    <p className="text-slate-500 text-sm mb-2">
                      {wf.description}
                    </p>
                  )}
                  <div className="flex gap-4 text-xs text-slate-500">
                    <span>{wf.usageCount || 0} dự án đang sử dụng</span>
                    {wf.createdByName && (
                      <span>Tạo bởi: {wf.createdByName}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                    <Edit2 size={16} />
                  </button>
                  {!wf.isDefault && (wf.usageCount || 0) === 0 && (
                    <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Workflow Steps */}
              <div>
                <h4 className="text-xs font-semibold text-slate-600 uppercase mb-3">
                  Các bước trong quy trình ({wf.statuses?.length || 0} bước)
                </h4>
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {wf.statuses && wf.statuses.length > 0 ? (
                    wf.statuses.map((status, idx) => (
                      <React.Fragment key={status.id}>
                        <div className="flex-shrink-0 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 min-w-[120px]">
                          <div className="flex items-center gap-2 mb-1">
                            <div
                              className={`w-2 h-2 rounded-full ${getStatusColor(
                                status.color
                              )}`}
                            ></div>
                            <span className="font-medium text-sm text-slate-900">
                              {status.name}
                            </span>
                          </div>
                          <span className="text-xs text-slate-500">
                            Bước {status.order + 1}
                          </span>
                        </div>
                        {idx < (wf.statuses?.length || 0) - 1 && (
                          <div className="flex-shrink-0 text-slate-300">→</div>
                        )}
                      </React.Fragment>
                    ))
                  ) : (
                    <div className="text-sm text-slate-400 italic">
                      Chưa có bước nào được định nghĩa
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
