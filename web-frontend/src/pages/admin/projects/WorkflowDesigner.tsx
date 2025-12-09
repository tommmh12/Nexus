import React, { useEffect, useState } from "react";
import { GitBranch, Plus, Edit2, Trash2, Loader2, X } from "lucide-react";
import { workflowService } from "../../../services/projectService";
import { Button } from "../../../components/system/ui/Button";
import { Input } from "../../../components/system/ui/Input";

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

// Create/Edit Workflow Modal
const WorkflowModal = ({
  workflow,
  onClose,
  onSave,
}: {
  workflow?: Workflow | null;
  onClose: () => void;
  onSave: (data: any) => void;
}) => {
  const [name, setName] = useState(workflow?.name || "");
  const [description, setDescription] = useState(workflow?.description || "");
  const [statuses, setStatuses] = useState<Omit<WorkflowStatus, "id">[]>(
    workflow?.statuses?.map((s) => ({
      name: s.name,
      color: s.color,
      order: s.order,
    })) || [
      { name: "To Do", color: "bg-slate-500", order: 0 },
      { name: "In Progress", color: "bg-blue-500", order: 1 },
      { name: "Done", color: "bg-green-500", order: 2 },
    ]
  );

  const handleAddStatus = () => {
    setStatuses([
      ...statuses,
      { name: "", color: "bg-slate-500", order: statuses.length },
    ]);
  };

  const handleRemoveStatus = (index: number) => {
    setStatuses(statuses.filter((_, i) => i !== index));
  };

  const handleStatusChange = (index: number, field: string, value: string) => {
    const updated = [...statuses];
    updated[index] = { ...updated[index], [field]: value };
    setStatuses(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, description, statuses });
  };

  const colorOptions = [
    { label: "Xám", value: "bg-slate-500" },
    { label: "Xanh dương", value: "bg-blue-500" },
    { label: "Xanh lá", value: "bg-green-500" },
    { label: "Vàng", value: "bg-yellow-500" },
    { label: "Cam", value: "bg-orange-500" },
    { label: "Đỏ", value: "bg-red-500" },
    { label: "Tím", value: "bg-purple-500" },
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-900">
            {workflow ? "Chỉnh sửa quy trình" : "Tạo quy trình mới"}
          </h3>
          <button onClick={onClose}>
            <X size={20} className="text-slate-400 hover:text-slate-600" />
          </button>
        </div>
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-6 overflow-y-auto flex-1"
        >
          <Input
            label="Tên quy trình"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Ví dụ: Software Development, Marketing Campaign..."
          />
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Mô tả
            </label>
            <textarea
              className="w-full bg-slate-50 border border-slate-200 rounded-md p-3 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Mô tả quy trình làm việc..."
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-semibold text-slate-700">
                Các bước trong quy trình ({statuses.length} bước)
              </label>
              <Button
                type="button"
                variant="outline"
                className="text-xs h-7"
                onClick={handleAddStatus}
              >
                <Plus size={12} className="mr-1" /> Thêm bước
              </Button>
            </div>
            <div className="space-y-3">
              {statuses.map((status, idx) => (
                <div
                  key={idx}
                  className="flex gap-2 items-start bg-slate-50 p-3 rounded-lg"
                >
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <Input
                      label={`Bước ${idx + 1}`}
                      value={status.name}
                      onChange={(e) =>
                        handleStatusChange(idx, "name", e.target.value)
                      }
                      required
                      placeholder="Tên trạng thái..."
                    />
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Màu sắc
                      </label>
                      <select
                        className="w-full bg-white border border-slate-200 rounded-md p-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                        value={status.color}
                        onChange={(e) =>
                          handleStatusChange(idx, "color", e.target.value)
                        }
                      >
                        {colorOptions.map((c) => (
                          <option key={c.value} value={c.value}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {statuses.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveStatus(idx)}
                      className="mt-7 p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy bỏ
            </Button>
            <Button type="submit">{workflow ? "Cập nhật" : "Tạo mới"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const WorkflowDesigner = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null);

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

  const handleCreateWorkflow = async (data: any) => {
    try {
      await workflowService.createWorkflow(data);
      await loadWorkflows();
      setShowCreateModal(false);
      alert("✅ Tạo quy trình thành công!");
    } catch (err: any) {
      console.error("Lỗi tạo quy trình:", err);
      alert("❌ Không thể tạo quy trình");
    }
  };

  const handleUpdateWorkflow = async (id: string, data: any) => {
    try {
      await workflowService.updateWorkflow(id, data);
      await loadWorkflows();
      setEditingWorkflow(null);
      alert("✅ Cập nhật quy trình thành công!");
    } catch (err: any) {
      console.error("Lỗi cập nhật quy trình:", err);
      alert("❌ Không thể cập nhật quy trình");
    }
  };

  const handleDeleteWorkflow = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa quy trình này?")) return;

    try {
      await workflowService.deleteWorkflow(id);
      await loadWorkflows();
      alert("✅ Xóa quy trình thành công!");
    } catch (err: any) {
      console.error("Lỗi xóa quy trình:", err);
      alert("❌ Không thể xóa quy trình");
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
      {showCreateModal && (
        <WorkflowModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateWorkflow}
        />
      )}
      {editingWorkflow && (
        <WorkflowModal
          workflow={editingWorkflow}
          onClose={() => setEditingWorkflow(null)}
          onSave={(data) => handleUpdateWorkflow(editingWorkflow.id, data)}
        />
      )}

      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Thiết kế Quy trình (Workflows)
          </h1>
          <p className="text-slate-500 mt-1">
            Định nghĩa các luồng làm việc tự động cho từng phòng ban và dự án.
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
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
          <Button onClick={() => setShowCreateModal(true)}>
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
                  <button
                    onClick={() => setEditingWorkflow(wf)}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  {!wf.isDefault && (wf.usageCount || 0) === 0 && (
                    <button
                      onClick={() => handleDeleteWorkflow(wf.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
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
