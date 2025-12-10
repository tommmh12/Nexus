import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Plus,
  Building,
  Clock,
  MoreHorizontal,
  Loader2,
  ArrowLeft,
  DollarSign,
  Check,
  GitBranch,
  UploadCloud,
  Users,
  Edit2,
  Trash2,
  X,
} from "lucide-react";
import {
  projectService,
  workflowService,
} from "../../../services/projectService";
import {
  departmentService,
  Department,
} from "../../../services/departmentService";
import { authService } from "../../../services/authService";
import { Button } from "../../../components/system/ui/Button";
import { Input } from "../../../components/system/ui/Input";
import { ProjectDetailView } from "./ProjectDetailView";

interface Project {
  id: string;
  code: string;
  name: string;
  description?: string;
  managerName?: string;
  workflowName?: string;
  workflowId?: string;
  status: string;
  priority: string;
  progress: number;
  taskCount?: number;
  completedTaskCount?: number;
  startDate?: string;
  endDate?: string;
  budget?: number;
}

interface Workflow {
  id: string;
  name: string;
  description?: string;
}

// ==================== WIZARD 3 BƯỚC TẠO DỰ ÁN ====================
const CreateProjectWizard = ({
  departments,
  workflows,
  onCancel,
  onSave,
}: {
  departments: Department[];
  workflows: Workflow[];
  onCancel: () => void;
  onSave: (data: any) => void;
}) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    priority: "Medium",
    startDate: "",
    endDate: "",
    budget: "",
    workflowId: "",
    departmentIds: [] as string[],
  });

  useEffect(() => {
    const fetchCode = async () => {
      try {
        const code = await projectService.generateProjectCode();
        setFormData(prev => ({ ...prev, code }));
      } catch (err) {
        console.error("Failed to generate code", err);
      }
    };
    fetchCode();
  }, []);

  const handleDeptToggle = (deptId: string) => {
    const current = formData.departmentIds;
    if (current.includes(deptId)) {
      setFormData({
        ...formData,
        departmentIds: current.filter((id) => id !== deptId),
      });
    } else {
      setFormData({ ...formData, departmentIds: [...current, deptId] });
    }
  };

  const nextStep = () => {
    if (step === 1) {
      if (!formData.code || !formData.name) {
        alert("Vui lòng nhập Mã và Tên dự án!");
        return;
      }
    }
    setStep(step + 1);
  };
  const prevStep = () => setStep(step - 1);

  return (
    <div className="animate-fadeIn max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Button variant="outline" onClick={onCancel} className="p-2 h-10 w-10">
          <ArrowLeft size={18} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Khởi tạo Dự án mới
          </h1>
          <p className="text-slate-500 text-sm">
            Bước {step}/3:{" "}
            {step === 1
              ? "Thông tin cơ bản"
              : step === 2
                ? "Cấu hình & Nguồn lực"
                : "Tài liệu khởi tạo"}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 h-2 rounded-full mb-8 overflow-hidden">
        <div
          className="bg-blue-600 h-full transition-all duration-300"
          style={{ width: `${(step / 3) * 100}%` }}
        ></div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden p-8 min-h-[500px] flex flex-col">
        <div className="flex-1">
          {/* BƯỚC 1: THÔNG TIN CƠ BẢN */}
          {step === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Tên dự án *"
                  placeholder="Ví dụ: Nâng cấp hệ thống CRM"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
                <Input
                  label="Mã dự án (Tự động)"
                  value={formData.code}
                  readOnly
                  className="bg-slate-100 text-slate-500 cursor-not-allowed"
                />
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Mô tả dự án
                  </label>
                  <textarea
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px]"
                    placeholder="Mô tả mục tiêu và phạm vi dự án..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  ></textarea>
                </div>
                <Input
                  label="Ngày bắt đầu"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                />
                <Input
                  label="Ngày kết thúc (Dự kiến)"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                />
                <Input
                  label="Ngân sách dự kiến (VNĐ)"
                  placeholder="0"
                  type="number"
                  icon={<DollarSign size={16} />}
                  value={formData.budget}
                  onChange={(e) =>
                    setFormData({ ...formData, budget: e.target.value })
                  }
                />
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Độ ưu tiên
                  </label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value })
                    }
                  >
                    <option value="Low">Thấp (Low)</option>
                    <option value="Medium">Trung bình (Medium)</option>
                    <option value="High">Cao (High)</option>
                    <option value="Critical">Khẩn cấp (Critical)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* BƯỚC 2: CẤU HÌNH & NGUỒN LỰC */}
          {step === 2 && (
            <div className="space-y-8 animate-fadeIn">
              {/* Chọn Workflow */}
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                  <GitBranch size={20} /> Quy trình áp dụng (Workflow)
                </h3>
                <p className="text-sm text-blue-700 mb-4">
                  Chọn quy trình làm việc chuẩn sẽ áp dụng cho các nhiệm vụ
                  trong dự án này. Các bước trong Kanban Board sẽ tự động được
                  tạo theo quy trình này.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {workflows.map((wf) => (
                    <label
                      key={wf.id}
                      className={`cursor-pointer border rounded-lg p-4 flex items-start gap-3 transition-all ${formData.workflowId === wf.id
                        ? "bg-white border-blue-500 ring-2 ring-blue-200"
                        : "bg-white/50 border-blue-200 hover:bg-white"
                        }`}
                    >
                      <input
                        type="radio"
                        name="workflow"
                        className="mt-1 text-blue-600 focus:ring-blue-500"
                        checked={formData.workflowId === wf.id}
                        onChange={() =>
                          setFormData({ ...formData, workflowId: wf.id })
                        }
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-slate-700 block">
                          {wf.name}
                        </span>
                        {wf.description && (
                          <span className="text-xs text-slate-500 mt-1 block">
                            {wf.description}
                          </span>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Chọn Phòng ban */}
              <div>
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Users size={20} /> Phòng ban tham gia
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                  Chọn các phòng ban sẽ tham gia dự án.
                  <span className="font-semibold text-blue-600"> Tất cả nhân viên</span> thuộc phòng ban đã chọn sẽ được thêm vào dự án.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-1">
                  {departments.map((dept) => (
                    <label
                      key={dept.id}
                      className={`cursor-pointer border rounded-lg p-3 flex items-center gap-3 hover:bg-slate-50 transition-colors ${formData.departmentIds.includes(String(dept.id))
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200"
                        }`}
                    >
                      <div
                        className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${formData.departmentIds.includes(String(dept.id))
                          ? "bg-blue-600 border-blue-600"
                          : "bg-white border-slate-300"
                          }`}
                      >
                        {formData.departmentIds.includes(String(dept.id)) && (
                          <Check size={14} className="text-white" />
                        )}
                      </div>
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={formData.departmentIds.includes(
                          String(dept.id)
                        )}
                        onChange={() => handleDeptToggle(String(dept.id))}
                      />
                      <div className="flex-1 min-w-0">
                        <span className="block text-sm font-medium text-slate-700 truncate">
                          {dept.name}
                        </span>
                        <span className="text-xs text-slate-500">
                          {dept.memberCount} nhân sự
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* BƯỚC 3: TÀI LIỆU KHỞI TẠO */}
          {step === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-10 flex flex-col items-center justify-center text-slate-500">
                <UploadCloud size={48} className="mb-4 text-slate-300" />
                <p className="font-medium text-lg text-slate-700">
                  Upload tài liệu
                </p>
                <p className="text-sm mb-4 text-center">
                  Tính năng upload file sẽ được bổ sung sau.
                  <br />
                  Bạn có thể thêm tài liệu vào dự án sau khi tạo xong.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>💡 Gợi ý:</strong> Nhấn "Hoàn tất" để tạo dự án. Bạn
                  có thể thêm tài liệu, tạo công việc và phân công sau trong
                  trang chi tiết dự án.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="pt-6 mt-6 border-t border-slate-100 flex justify-between">
          {step > 1 ? (
            <Button variant="outline" onClick={prevStep}>
              ← Quay lại
            </Button>
          ) : (
            <div></div>
          )}

          <div className="flex gap-3">
            <Button variant="ghost" onClick={onCancel}>
              Hủy bỏ
            </Button>
            {step < 3 ? (
              <Button onClick={nextStep}>Tiếp tục →</Button>
            ) : (
              <Button onClick={() => onSave(formData)}>
                <Check size={18} className="mr-2" /> Hoàn tất tạo dự án
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== EDIT PROJECT MODAL ====================
const EditProjectModal = ({
  project,
  departments,
  workflows,
  onCancel,
  onSave,
}: {
  project: Project;
  departments: Department[];
  workflows: Workflow[];
  onCancel: () => void;
  onSave: (data: any) => void;
}) => {
  const formatDateForInput = (dateString: string | undefined) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      return date.toISOString().split("T")[0];
    } catch {
      return "";
    }
  };

  const [formData, setFormData] = useState({
    name: project.name || "",
    code: project.code || "",
    description: project.description || "",
    priority: project.priority || "Medium",
    status: project.status || "Planning",
    startDate: formatDateForInput(project.startDate),
    endDate: formatDateForInput(project.endDate),
    budget: project.budget?.toString() || "",
    workflowId: project.workflowId || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Chỉnh sửa dự án</h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Mã dự án <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                placeholder="VD: CRM-2025"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tên dự án <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="VD: Nâng cấp hệ thống CRM"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Mô tả
            </label>
            <textarea
              className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Mô tả ngắn gọn về dự án..."
            />
          </div>

          {/* Status & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Trạng thái
              </label>
              <select
                className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
              >
                <option value="Planning">Planning</option>
                <option value="In Progress">In Progress</option>
                <option value="Review">Review</option>
                <option value="Done">Done</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Độ ưu tiên
              </label>
              <select
                className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value })
                }
              >
                <option value="Low">Thấp</option>
                <option value="Medium">Trung bình</option>
                <option value="High">Cao</option>
                <option value="Critical">Khẩn cấp</option>
              </select>
            </div>
          </div>

          {/* Dates & Budget */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Ngày bắt đầu
              </label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Ngày kết thúc
              </label>
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Ngân sách (VNĐ)
              </label>
              <Input
                type="number"
                value={formData.budget}
                onChange={(e) =>
                  setFormData({ ...formData, budget: e.target.value })
                }
                placeholder="100000000"
              />
            </div>
          </div>

          {/* Workflow */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Quy trình công việc
            </label>
            <select
              className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
              value={formData.workflowId}
              onChange={(e) =>
                setFormData({ ...formData, workflowId: e.target.value })
              }
            >
              <option value="">-- Chọn workflow --</option>
              {workflows.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button type="button" variant="ghost" onClick={onCancel}>
              Hủy
            </Button>
            <Button type="submit">
              <Check size={18} className="mr-2" />
              Lưu thay đổi
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==================== MAIN COMPONENT ====================
export const ProjectModule = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Extract role prefix from URL (/admin, /manager, /employee)
  const rolePrefix = "/" + location.pathname.split("/")[1];

  const [view, setView] = useState<"list" | "create" | "detail">("list");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Handle URL-based view
  useEffect(() => {
    if (id) {
      // Load project by ID from URL
      const project = projects.find((p) => p.id === id);
      if (project) {
        setSelectedProject(project);
        setView("detail");
      } else if (projects.length > 0) {
        // Project not found, redirect to list
        navigate(`${rolePrefix}/pm-projects`);
      }
    } else {
      setView("list");
      setSelectedProject(null);
    }
  }, [id, projects, navigate]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [projectsRes, deptsData, workflowsRes] = await Promise.all([
        projectService.getProjects(),
        departmentService.getAllDepartments(),
        workflowService.getWorkflows(),
      ]);

      if (Array.isArray(projectsRes) || (projectsRes as any).success) {
        // Handle both wrapped and unwrapped for safety
        const projectList = Array.isArray(projectsRes) ? projectsRes : (projectsRes as any).data;

        // Map snake_case from backend to camelCase for frontend
        const mappedProjects = projectList.map((p: any) => ({
          ...p,
          workflowName: p.workflowName || p.workflow_name,
          workflowId: p.workflowId || p.workflow_id,
          managerName: p.managerName || p.manager_name,
          startDate: p.startDate || p.start_date,
          endDate: p.endDate || p.end_date,
        }));
        setProjects(mappedProjects);
      }
      setDepartments(deptsData);

      if (Array.isArray(workflowsRes) || (workflowsRes as any).success) {
        setWorkflows(Array.isArray(workflowsRes) ? workflowsRes : (workflowsRes as any).data);
      }
    } catch (err: any) {
      console.error("Lỗi tải dữ liệu:", err);
      setError("Không thể tải dữ liệu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (formData: any) => {
    try {
      // Get current user to set as manager
      const currentUser = authService.getStoredUser();

      const response = await projectService.createProject({
        name: formData.name,
        code: formData.code,
        description: formData.description,
        workflowId: formData.workflowId, // Keep as string (UUID)
        priority: formData.priority,
        startDate: formData.startDate,
        endDate: formData.endDate,
        budget: Number(formData.budget) || 0,
        managerId: currentUser?.id, // Set creator as manager
        departments: formData.departmentIds, // Keep as string array (UUIDs)
      });

      if (response && (response.id || response.success)) {
        await loadData();
        setView("list");
        alert("✅ Tạo dự án thành công!");
      }
    } catch (error: any) {
      console.error("Lỗi tạo dự án:", error);
      alert(
        "❌ Có lỗi xảy ra: " + (error.response?.data?.message || error.message)
      );
    }
  };

  const handleUpdateProject = async (formData: any) => {
    if (!editingProject) return;

    try {
      const response = await projectService.updateProject(editingProject.id, {
        name: formData.name,
        code: formData.code,
        description: formData.description,
        workflowId: formData.workflowId, // Keep as string (UUID)
        priority: formData.priority,
        status: formData.status,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        budget: Number(formData.budget) || null,
      });

      if (response && (response.id || response.success)) {
        await loadData();
        setEditingProject(null);
        alert("✅ Cập nhật dự án thành công!");
      }
    } catch (error: any) {
      console.error("Lỗi cập nhật dự án:", error);
      alert(
        "❌ Có lỗi xảy ra: " + (error.response?.data?.message || error.message)
      );
    }
  };

  const handleProjectClick = (project: Project) => {
    navigate(`${rolePrefix}/pm-projects/${project.id}`);
  };

  const handleBackToList = () => {
    navigate(`${rolePrefix}/pm-projects`);
    loadData(); // Reload để cập nhật thay đổi
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Done":
        return "bg-green-100 text-green-700";
      case "Review":
        return "bg-purple-100 text-purple-700";
      case "In Progress":
        return "bg-blue-100 text-blue-700";
      case "Planning":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical":
        return "text-red-600";
      case "High":
        return "text-orange-600";
      case "Medium":
        return "text-blue-600";
      case "Low":
        return "text-green-600";
      default:
        return "text-slate-600";
    }
  };

  const handleDeleteProject = async (
    projectId: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    if (!confirm("Bạn có chắc muốn xóa dự án này?")) return;

    try {
      await projectService.deleteProject(projectId);
      await loadData();
      alert("✅ Xóa dự án thành công!");
    } catch (error) {
      console.error("Lỗi xóa dự án:", error);
      alert("❌ Có lỗi xảy ra");
    }
  };

  const handleEditProject = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProject(project);
    setOpenMenuId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-slate-500">Đang tải dự án...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600">{error}</p>
        <Button onClick={loadData} className="mt-4">
          Thử lại
        </Button>
      </div>
    );
  }

  // VIEW: Wizard tạo dự án
  if (view === "create") {
    return (
      <CreateProjectWizard
        departments={departments}
        workflows={workflows}
        onCancel={() => setView("list")}
        onSave={handleCreateProject}
      />
    );
  }

  // VIEW: Chi tiết dự án
  if (view === "detail" && selectedProject) {
    return (
      <ProjectDetailView project={selectedProject} onBack={handleBackToList} />
    );
  }

  // VIEW: Danh sách dự án
  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Dự án (Projects)
          </h1>
          <p className="text-slate-500 mt-1">
            Quản lý và theo dõi tiến độ các dự án đang hoạt động.
          </p>
        </div>
        <Button onClick={() => setView("create")}>
          <Plus size={18} className="mr-2" /> Tạo dự án mới
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white rounded-xl border-2 border-dashed border-slate-200 p-12 text-center">
          <Building size={48} className="mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">
            Chưa có dự án nào
          </h3>
          <p className="text-slate-500 mb-6">
            Bắt đầu bằng cách tạo dự án đầu tiên của bạn
          </p>
          <Button onClick={() => setView("create")}>
            <Plus size={18} className="mr-2" /> Tạo dự án đầu tiên
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => handleProjectClick(project)}
              className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-blue-300"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-2 flex-wrap">
                  <span
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold ${getStatusColor(
                      project.status
                    )}`}
                  >
                    {project.status}
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold ${getPriorityColor(
                      project.priority
                    )} bg-slate-50`}
                  >
                    {project.priority}
                  </span>
                </div>
                <div className="relative">
                  <button
                    className="text-slate-400 hover:text-slate-600 p-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(
                        openMenuId === project.id ? null : project.id
                      );
                    }}
                  >
                    <MoreHorizontal size={18} />
                  </button>

                  {openMenuId === project.id && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(null);
                        }}
                      />
                      <div className="absolute right-0 top-8 z-20 bg-white rounded-lg shadow-lg border border-slate-200 py-1 min-w-[150px]">
                        <button
                          onClick={(e) => handleEditProject(project, e)}
                          className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <Edit2 size={14} /> Chỉnh sửa
                        </button>
                        <button
                          onClick={(e) => handleDeleteProject(project.id, e)}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <Trash2 size={14} /> Xóa
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <span className="text-xs font-mono text-slate-500">
                  {project.code}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {project.name}
                </h3>
                {project.description && (
                  <p className="text-sm text-slate-500 line-clamp-2 mb-2">
                    {project.description}
                  </p>
                )}
                <p className="text-sm text-slate-600 flex items-center gap-1">
                  <Building size={14} />
                  {project.managerName || "Chưa có quản lý"}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-500">
                    Tiến độ ({project.completedTaskCount || 0}/
                    {project.taskCount || 0} tasks)
                  </span>
                  <span className="font-semibold text-slate-700">
                    {project.progress}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${project.status === "Done" ? "bg-green-500" : "bg-blue-600"
                      }`}
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <div className="text-xs text-slate-500">
                  {project.workflowName || "Chưa có quy trình"}
                </div>
                {project.endDate && (
                  <div className="flex items-center text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded">
                    <Clock size={12} className="mr-1" />
                    {new Date(project.endDate).toLocaleDateString("vi-VN")}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Add Project Card */}
          <div
            onClick={() => setView("create")}
            className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all cursor-pointer min-h-[280px]"
          >
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <Plus size={24} />
            </div>
            <span className="font-medium">Thêm dự án mới</span>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {editingProject && (
        <EditProjectModal
          project={editingProject}
          departments={departments}
          workflows={workflows}
          onCancel={() => setEditingProject(null)}
          onSave={handleUpdateProject}
        />
      )}
    </div>
  );
};
