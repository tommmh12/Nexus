import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "../../../components/system/ui/Button";
import { Input } from "../../../components/system/ui/Input";
import {
  ArrowLeft,
  Edit2,
  Plus,
  DollarSign,
  Clock,
  Flag,
  Calendar,
  MessageCircle,
  AlertCircle,
  CheckSquare,
  X,
  Send,
  Users,
  FileText,
  PieChart,
  Layers,
  Kanban,
  List,
  Paperclip,
  Download,
  Trash2,
  Check,
  User,
  Building,
  SendHorizontal,
  ThumbsUp,
  ThumbsDown,
  Image,
  Loader2,
  Search,
  GitBranch,
  Settings,
} from "lucide-react";
import { taskService, TaskDetail } from "../../../services/taskService";
import { reportService, ProjectReport } from "../../../services/reportService";
import { projectService, workflowService } from "../../../services/projectService";
import { authService } from "../../../services/authService";
import { CommentThread } from "../../../components/comments/CommentThread";
import {
  departmentService,
  Department,
} from "../../../services/departmentService";
import { userService, User as SystemUser } from "../../../services/userService";
import type { ProjectDocument } from "../../../types";

interface Project {
  id: string;
  code: string;
  name: string;
  description?: string;
  managerName?: string;
  manager_id?: string;
  workflow_id?: string;
  workflowName?: string;
  workflowStatuses?: { id: string; name: string; color?: string; order: number }[];
  status: string;
  priority: string;
  progress: number;
  taskCount?: number;
  completedTaskCount?: number;
  startDate?: string;
  endDate?: string;
  budget?: number;
  members?: Member[];
}

interface Member {
  id: string; // project_member id
  user_id: string;
  role: string;
  joined_at: string;
  userName: string;
  email: string;
  avatar_url?: string;
  departmentName?: string;
}

// --- Modals ---

const CreateTaskModal = ({
  project,
  departments,
  members,
  onClose,
  onSave,
}: {
  project: Project;
  departments: Department[];
  members: Member[];
  onClose: () => void;
  onSave: (task: Partial<TaskDetail>) => void;
}) => {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<ProjectDocument[]>([]);

  // Assignee Selection State
  const [selectedassigneeIds, setSelectedAssigneeIds] = useState<string[]>([]);
  const [memberSearchTerm, setMemberSearchTerm] = useState("");
  const [memberDeptFilter, setMemberDeptFilter] = useState("");

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles: ProjectDocument[] = Array.from(files).map((file: File) => ({
        name: file.name,
        url: URL.createObjectURL(file),
        date: new Date().toLocaleDateString("vi-VN"),
        type: "file",
        source: "Task",
        uploader: "Admin",
      }));
      setAttachedFiles([...attachedFiles, ...newFiles]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!title.trim()) {
      alert("❌ Vui lòng nhập tên công việc!");
      return;
    }

    if (selectedassigneeIds.length === 0) {
      alert("❌ Vui lòng chọn ít nhất một người thực hiện!");
      return;
    }

    if (!startDate) {
      alert("❌ Vui lòng chọn ngày bắt đầu!");
      return;
    }

    if (!dueDate) {
      alert("❌ Vui lòng chọn ngày kết thúc!");
      return;
    }

    // Check if due date is after start date
    if (new Date(dueDate) < new Date(startDate)) {
      alert("❌ Ngày kết thúc phải sau ngày bắt đầu!");
      return;
    }

    onSave({
      title,
      priority: priority as any,
      assigneeDepartment: "", // No longer mandatory
      assigneeIds: selectedassigneeIds,
      startDate,
      dueDate,
      description,
      status: project.workflowStatuses?.[0]?.name || "To Do",
      checklist: [],
      comments: [],
      tags: [],
      attachments: attachedFiles,
    });
  };

  const toggleAssignee = (userId: string) => {
    if (selectedassigneeIds.includes(userId)) {
      setSelectedAssigneeIds(prev => prev.filter(id => id !== userId));
    } else {
      setSelectedAssigneeIds(prev => [...prev, userId]);
    }
  };

  // Filter members
  const filteredMembers = members?.filter(m => {
    const nameMatch = m.userName.toLowerCase().includes(memberSearchTerm.toLowerCase());
    const deptMatch = memberDeptFilter ? m.departmentName === memberDeptFilter : true; // Assuming departmentName matches filter value
    // Note: m.departmentName might differ from departments.name slightly depending on data source, but usually consistent.
    // Better to match by ID if available, but Member interface relies on departmentName usually populated from backend query?
    // Let's check Member interface in ProjectDetailView.tsx:
    // interface Member { ... departmentName?: string; ... }
    return nameMatch && deptMatch;
  }) || [];

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fadeIn flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-900">Tạo công việc mới</h3>
          <button onClick={onClose}>
            <X size={20} className="text-slate-400 hover:text-slate-600" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.xlsx,.png,.jpg,.jpeg"
          />

          <Input
            label="Tên công việc"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          {/* Priority Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Độ ưu tiên
            </label>
            <select
              className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="Low">Thấp (Low)</option>
              <option value="Medium">Trung bình (Medium)</option>
              <option value="High">Cao (High)</option>
              <option value="Critical">Khẩn cấp (Critical)</option>
            </select>
          </div>

          {/* Assignees Section with Search & Filter */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Người thực hiện <span className="text-red-500">*</span> ({selectedassigneeIds.length})
            </label>

            <div className="flex gap-2 mb-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 text-slate-400" size={14} />
                <input
                  type="text"
                  placeholder="Tìm nhân viên..."
                  className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-md bg-slate-50 focus:bg-white transition-colors outline-none focus:ring-2 focus:ring-brand-500"
                  value={memberSearchTerm}
                  onChange={(e) => setMemberSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="w-1/3 text-sm border border-slate-200 rounded-md bg-slate-50 outline-none px-2 py-2"
                value={memberDeptFilter}
                onChange={(e) => setMemberDeptFilter(e.target.value)}
              >
                <option value="">Tất cả PB</option>
                {departments.map(d => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>

            <div className="border border-slate-200 rounded-lg p-2 max-h-40 overflow-y-auto bg-slate-50">
              {filteredMembers.length > 0 ? (
                <div className="space-y-1">
                  {filteredMembers.map(m => (
                    <label key={m.user_id} className="flex items-center gap-2 p-1.5 hover:bg-white rounded cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedassigneeIds.includes(m.user_id)}
                        onChange={() => toggleAssignee(m.user_id)}
                        className="rounded text-brand-600 focus:ring-brand-500"
                      />
                      <img src={m.avatar_url || "https://ui-avatars.com/api/?name=" + m.userName} className="w-6 h-6 rounded-full bg-slate-200 object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 truncate">{m.userName}</p>
                        <p className="text-[10px] text-slate-500 truncate">{m.departmentName || "Thành viên"}</p>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 p-4 text-center">Không tìm thấy thành viên nào.</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Ngày bắt đầu <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Hạn hoàn thành <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Mô tả
            </label>
            <textarea
              className="w-full bg-slate-50 border border-slate-200 rounded-md p-3 text-sm focus:ring-2 focus:ring-brand-500 outline-none h-24"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-semibold text-slate-700">
                Tài liệu đính kèm
              </label>
              <Button
                type="button"
                variant="outline"
                className="text-xs h-7 px-2"
                onClick={handleFileUpload}
              >
                <Plus size={12} className="mr-1" /> Upload
              </Button>
            </div>
            {attachedFiles.length > 0 ? (
              <div className="space-y-1">
                {attachedFiles.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-xs bg-slate-50 p-2 rounded border border-slate-100"
                  >
                    <Paperclip size={12} /> {f.name}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">Chưa có file nào.</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="ghost" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit">Tạo Task</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SubmitReportModal = ({
  project,
  departments,
  onClose,
  onSubmit,
}: {
  project: Project;
  departments: Department[];
  onClose: () => void;
  onSubmit: (r: Partial<ProjectReport>) => void;
}) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [deptId, setDeptId] = useState(departments[0]?.id || "");
  const [attachedFiles, setAttachedFiles] = useState<ProjectDocument[]>([]);
  const reportFileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = () => {
    reportFileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const selectedDept = departments.find((d) => d.id === deptId);
      const newFiles: ProjectDocument[] = Array.from(files).map((file) => ({
        name: file.name,
        url: URL.createObjectURL(file),
        date: new Date().toLocaleDateString("vi-VN"),
        type: file.type.startsWith("image/") ? "image" : "file",
        source: "Report",
        uploader: selectedDept?.name || "Unknown",
      }));
      setAttachedFiles([...attachedFiles, ...newFiles]);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <FileText size={20} className="text-brand-600" /> Nộp báo cáo tiến độ
        </h3>
        <input
          ref={reportFileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx,.xlsx,.png,.jpg,.jpeg"
        />
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Phòng ban báo cáo
            </label>
            <select
              className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5 text-sm"
              value={deptId}
              onChange={(e) => setDeptId(e.target.value)}
            >
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Tiêu đề báo cáo"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="VD: Báo cáo tuần 4..."
          />
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Nội dung chi tiết
            </label>
            <textarea
              className="w-full bg-slate-50 border border-slate-200 rounded-md p-3 text-sm h-32 focus:ring-2 focus:ring-brand-500 outline-none"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Mô tả các đầu việc đã hoàn thành, khó khăn gặp phải..."
            ></textarea>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-semibold text-slate-700">
                Minh chứng (Ảnh/File)
              </label>
              <Button
                type="button"
                variant="outline"
                className="text-xs h-7 px-2"
                onClick={handleFileUpload}
              >
                <Plus size={12} className="mr-1" /> Upload
              </Button>
            </div>
            {attachedFiles.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {attachedFiles.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-xs bg-slate-50 p-2 rounded border border-slate-100"
                  >
                    <Image size={12} /> {f.name}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">Chưa có file nào.</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={onClose}>
              Hủy
            </Button>
            <Button
              onClick={() =>
                onSubmit({
                  title,
                  content,
                  departmentId: deptId,
                  attachments: attachedFiles,
                })
              }
            >
              <SendHorizontal size={16} className="mr-2" /> Gửi báo cáo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReportReviewModal = ({
  report,
  onClose,
  onUpdateStatus,
}: {
  report: ProjectReport;
  onClose: () => void;
  onUpdateStatus: (
    id: string,
    status: "Approved" | "Rejected",
    feedback: string
  ) => void;
}) => {
  const [feedback, setFeedback] = useState(report.feedback || "");

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-900">Duyệt báo cáo</h3>
          <button onClick={onClose}>
            <X size={20} className="text-slate-400 hover:text-slate-600" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          <div className="mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {report.department}
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              {report.title}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Người gửi: {report.submittedBy} • {report.submittedDate}
            </p>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm text-slate-700 leading-relaxed mb-6">
            {report.content}
          </div>

          {report.attachments && report.attachments.length > 0 && (
            <div className="mb-6">
              <h4 className="text-xs font-bold text-slate-500 mb-2">
                Tài liệu đính kèm:
              </h4>
              <div className="space-y-1">
                {report.attachments.map((file, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-100 rounded text-sm"
                  >
                    <Paperclip size={14} className="text-slate-400" />{" "}
                    {file.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Phản hồi của Admin/PM
            </label>
            <textarea
              className="w-full bg-white border border-slate-200 rounded-md p-3 text-sm focus:ring-2 focus:ring-brand-500 outline-none h-24"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Nhập nhận xét hoặc lý do từ chối..."
            ></textarea>
          </div>
        </div>
        <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
          <Button
            variant="outline"
            className="text-red-600 hover:bg-red-50 border-red-200"
            onClick={() => onUpdateStatus(report.id, "Rejected", feedback)}
          >
            <ThumbsDown size={16} className="mr-2" /> Từ chối
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={() => onUpdateStatus(report.id, "Approved", feedback)}
          >
            <ThumbsUp size={16} className="mr-2" /> Phê duyệt
          </Button>
        </div>
      </div>
    </div>
  );
};

// --- Task Detail Drawer ---
const TaskDetailPanel = ({
  task,
  departments,
  members,
  onClose,
  onUpdate,
  onDelete,
  project,
}: {
  task: TaskDetail;
  departments: Department[];
  members: Member[];
  onClose: () => void;
  onUpdate: (updatedTask: TaskDetail) => void;
  onDelete: (taskId: string) => void;
  project: Project;
}) => {
  const [checklistText, setChecklistText] = useState("");
  const currentUser = authService.getStoredUser();

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [status, setStatus] = useState(task.status);
  const [priority, setPriority] = useState(task.priority);
  const [assigneeDept, setAssigneeDept] = useState(task.assigneeDepartment);
  const [assigneeIds, setAssigneeIds] = useState<string[]>(task.assignees?.map(a => a.id) || []);
  // Handle both snake_case (from DB) and camelCase (from frontend)
  const [startDate, setStartDate] = useState((task as any).start_date || task.startDate);
  const [dueDate, setDueDate] = useState((task as any).due_date || task.dueDate);

  // Permission Check
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user.role === "Admin" || user.role === "Manager";

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description);
    setStatus(task.status);
    setPriority(task.priority);
    setAssigneeDept(task.assigneeDepartment);
    setAssigneeIds(task.assignees?.map(a => a.id) || []);
    const start = (task as any).start_date || task.startDate;
    setStartDate(start ? new Date(start).toISOString().split('T')[0] : "");
    const due = (task as any).due_date || task.dueDate;
    setDueDate(due ? new Date(due).toISOString().split('T')[0] : "");
  }, [task]);

  const handleSave = async () => {
    try {
      const updated = await taskService.updateTask(task.id, {
        title,
        description,
        status,
        priority: priority as any,
        assigneeDepartment: assigneeDept,
        assigneeIds,
        startDate,
        dueDate,
      });
      onUpdate(updated);
      setIsEditing(false); // Disable edit mode after save
      alert("✅ Đã lưu thay đổi!");
    } catch (error) {
      console.error("Failed to save task", error);
      alert("❌ Lưu thất bại");
    }
  };

  const toggleAssignee = (userId: string) => {
    if (assigneeIds.includes(userId)) {
      setAssigneeIds(prev => prev.filter(id => id !== userId));
    } else {
      setAssigneeIds(prev => [...prev, userId]);
    }
  };

  const handleAddChecklist = async () => {
    if (!checklistText.trim()) return;
    try {
      await taskService.addChecklistItem(task.id, checklistText);
      const updatedTask = await taskService.getTaskById(task.id);
      onUpdate(updatedTask);
      setChecklistText("");
    } catch (e) {
      console.error("Failed to add checklist item", e);
    }
  };

  const handleToggleChecklist = async (itemId: string, currentStatus: boolean) => {
    try {
      await taskService.updateChecklistItem(itemId, { isCompleted: !currentStatus });
      const updatedTask = await taskService.getTaskById(task.id);
      onUpdate(updatedTask);
    } catch (e) {
      console.error("Failed to toggle checklist item", e);
    }
  };

  const handleDeleteChecklist = async (itemId: string) => {
    if (!confirm("Bạn có chắc muốn xóa mục này?")) return;
    try {
      await taskService.deleteChecklistItem(itemId);
      const updatedTask = await taskService.getTaskById(task.id);
      onUpdate(updatedTask);
    } catch (e) {
      console.error("Failed to delete checklist item", e);
    }
  };

  const handleDeleteTask = async () => {
    if (!confirm("Bạn có chắc muốn xóa task này? Hành động này không thể hoàn tác!")) return;
    try {
      await taskService.deleteTask(task.id);
      alert("✅ Đã xóa task!");
      onDelete(task.id); // Call onDelete callback to remove task from parent state
      onClose(); // Close the panel after deletion
    } catch (e) {
      console.error("Failed to delete task", e);
      alert("❌ Xóa task thất bại");
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[600px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-slate-200 flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
        <div className="flex-1 pr-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-mono font-bold text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
              {task.id.slice(0, 8)}
            </span>
            {isAdmin && isEditing ? (
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className={`px-2 py-0.5 rounded-full text-xs font-semibold border-none outline-none cursor-pointer ${priority === "Critical" ? "bg-red-100 text-red-700" :
                  priority === "High" ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"
                  }`}
              >
                <option value="Low">Low Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="High">High Priority</option>
                <option value="Critical">Critical Priority</option>
              </select>
            ) : (
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${priority === "Critical" ? "bg-red-100 text-red-700" :
                  priority === "High" ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"
                  }`}
              >
                {priority} Priority
              </span>
            )}

            {isAdmin && isEditing ? (
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border-none outline-none cursor-pointer"
              >
                {project.workflowStatuses && project.workflowStatuses.length > 0 ? (
                  project.workflowStatuses.map((ws: any) => (
                    <option key={ws.id || ws.name} value={ws.name}>{ws.name}</option>
                  ))
                ) : (
                  <>
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Review">Review</option>
                    <option value="Done">Done</option>
                  </>
                )}
              </select>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                {status}
              </span>
            )}
          </div>

          {isAdmin && isEditing ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xl font-bold text-slate-900 leading-snug w-full border-b border-transparent focus:border-brand-500 outline-none bg-transparent"
            />
          ) : (
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 leading-snug">
                {title}
              </h2>
              {isAdmin && !isEditing && (
                <button onClick={() => setIsEditing(true)} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-brand-600 transition-colors" title="Chỉnh sửa">
                  <Edit2 size={16} />
                </button>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={handleDeleteTask}
              className="p-2 hover:bg-red-50 rounded-full text-slate-400 hover:text-red-600 transition-colors"
              title="Xóa task"
            >
              <Trash2 size={18} />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Meta Controls */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">
              Người thực hiện
            </label>
            {isAdmin && isEditing ? (
              <div className="border border-slate-200 rounded-lg p-2 bg-slate-50 max-h-40 overflow-y-auto">
                {members && members.length > 0 ? (
                  <div className="space-y-1">
                    {members.map(m => (
                      <label key={m.user_id} className="flex items-center gap-2 p-1 hover:bg-white rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={assigneeIds.includes(m.user_id)}
                          onChange={() => toggleAssignee(m.user_id)}
                          className="rounded text-brand-600 focus:ring-brand-500"
                        />
                        <img src={m.avatar_url || "https://ui-avatars.com/api/?name=" + m.userName} className="w-6 h-6 rounded-full" />
                        <span className="text-sm text-slate-700">{m.userName}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 p-2">Chưa có thành viên nào trong dự án.</p>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 flex-wrap">
                {Array.isArray(task.assignees) && task.assignees.length > 0 ? (
                  task.assignees.map(a => (
                    <div key={a.id} title={a.name} className="relative">
                      <img src={a.avatarUrl || "https://ui-avatars.com/api/?name=" + a.name} className="w-8 h-8 rounded-full border-2 border-white" />
                    </div>
                  ))
                ) : (
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50">
                    <span className="text-xs text-slate-500">Chưa giao</span>
                  </div>
                )}
              </div>
            )}
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">
              Thời gian
            </label>
            {isAdmin && isEditing ? (
              <div className="flex items-center gap-2">
                <input type="date" value={startDate || ""} onChange={(e) => setStartDate(e.target.value)} className="text-xs border rounded p-1" />
                <span>-</span>
                <input type="date" value={dueDate || ""} onChange={(e) => setDueDate(e.target.value)} className="text-xs border rounded p-1" />
              </div>
            ) : (
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200 transition-colors">
                <div className="p-2 bg-slate-100 rounded text-slate-600">
                  <Calendar size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {(startDate && dueDate)
                      ? `${new Date(startDate).toLocaleDateString("vi-VN").slice(0, 5)} - ${new Date(dueDate).toLocaleDateString("vi-VN")}`
                      : "Chưa thiết lập"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
            <FileText size={16} className="text-slate-400" /> Mô tả công việc
          </h3>
          {isAdmin && isEditing ? (
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full min-h-[100px] p-3 text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
            />
          ) : (
            <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-600 leading-relaxed border border-slate-100">
              {description || "Chưa có mô tả."}
            </div>
          )}
        </div>

        {/* Attachments (Read-only for now or use existing logic if any) */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
            <Paperclip size={16} className="text-slate-400" /> Tài liệu đính kèm
          </h3>
          <p className="text-xs text-slate-400 italic">Không có tài liệu đính kèm.</p>
        </div>


        {/* Checklist */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CheckSquare size={16} className="text-brand-500" /> Checklist
            </h3>
            <span className="text-xs text-slate-500">
              {task.checklist?.filter((i) => i.isCompleted).length || 0}/
              {task.checklist?.length || 0} hoàn thành
            </span>
          </div>

          <div className="w-full bg-slate-100 h-1.5 rounded-full mb-4 overflow-hidden">
            <div
              className="bg-brand-500 h-full transition-all duration-500"
              style={{ width: `${task.checklist && task.checklist.length > 0 ? (task.checklist.filter(i => i.isCompleted).length / task.checklist.length) * 100 : 0}%` }}
            ></div>
          </div>

          {isAdmin && (
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Thêm việc cần làm..."
                className="flex-1 bg-white border border-slate-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                value={checklistText}
                onChange={(e) => setChecklistText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddChecklist()}
              />
              <button
                onClick={handleAddChecklist}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded"
              >
                <Plus size={16} />
              </button>
            </div>
          )}

          <div className="space-y-2">
            {task.checklist?.map((item) => (
              <div
                key={item.id}
                className="group flex items-start gap-3 p-2 hover:bg-slate-50 rounded transition-colors"
              >
                <button
                  type="button"
                  onClick={() => handleToggleChecklist(item.id, item.isCompleted)}
                  className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors ${item.isCompleted
                    ? "bg-brand-500 border-brand-500 text-white"
                    : "border-slate-300 hover:border-brand-500"
                    }`}
                >
                  {item.isCompleted && <Check size={10} strokeWidth={4} />}
                </button>
                <div className="flex-1">
                  <p className={`text-sm ${item.isCompleted ? "text-slate-400 line-through" : "text-slate-700"}`}>
                    {item.text}
                  </p>
                </div>
                {isAdmin && (
                  <button type="button" onClick={() => handleDeleteChecklist(item.id)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 p-1">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Comments */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <MessageCircle size={16} className="text-slate-400" /> Thảo luận
          </h3>

          <CommentThread
            type="task"
            id={task.id}
            currentUserId={currentUser?.id}
            canComment={true}
          />
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-slate-200 bg-white flex justify-end gap-3">
        {isAdmin && isEditing ? (
          <>
            <Button variant="outline" onClick={() => setIsEditing(false)}>Hủy</Button>
            <Button className="bg-brand-600 hover:bg-brand-700" onClick={handleSave}>
              Lưu thay đổi
            </Button>
          </>
        ) : (
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        )}
      </div>
    </div>
  );
};

export const ProjectDetailView = ({
  project,
  onBack,
}: {
  project: Project;
  onBack: () => void;
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // ==================== STATE MANAGEMENT ====================
  const [localProject, setLocalProject] = useState<Project>(project);
  const [tasks, setTasks] = useState<TaskDetail[]>([]);
  const [reports, setReports] = useState<ProjectReport[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [allDepartments, setAllDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Member Modal State
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<SystemUser[]>([]);
  const [memberSearchTerm, setMemberSearchTerm] = useState("");
  const [memberDepartmentFilter, setMemberDepartmentFilter] = useState("");

  // View State - Initialize from URL hash
  const getInitialTab = (): "overview" | "tasks" | "departments" | "files" | "reports" => {
    const hash = location.hash.replace("#", "");
    if (hash.startsWith("task-")) {
      return "tasks";
    }
    if (["overview", "tasks", "members", "files", "reports"].includes(hash)) {
      return hash as any;
    }
    return "overview";
  };

  const [activeTab, setActiveTab] = useState<
    "overview" | "tasks" | "members" | "files" | "reports"
  >(getInitialTab());
  const [taskViewMode, setTaskViewMode] = useState<"list" | "kanban">("list");

  // Modal State
  const [selectedTask, setSelectedTask] = useState<TaskDetail | null>(null);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showSubmitReport, setShowSubmitReport] = useState(false);
  const [reviewReport, setReviewReport] = useState<ProjectReport | null>(null);

  // File upload ref for files tab
  const projectFileInputRef = React.useRef<HTMLInputElement>(null);

  // Ref to track if update is from user action (to avoid infinite loop)
  const isUserActionRef = React.useRef(false);

  // ==================== URL HASH SYNC ====================
  // Read URL hash on mount and when tasks are loaded
  // ==================== URL HASH SYNC ====================
  // Read URL hash on mount and when tasks are loaded
  useEffect(() => {
    // Skip if the change was initiated by the user (to avoid loops)
    if (isUserActionRef.current) {
      isUserActionRef.current = false;
      return;
    }

    const hash = location.hash.replace("#", "");

    // Check for Task ID in hash
    if (hash.startsWith("task-") && tasks.length > 0) {
      const taskId = hash.replace("task-", "");
      const task = tasks.find((t) => t.id === taskId);
      if (task && (!selectedTask || selectedTask.id !== task.id)) {
        setSelectedTask(task);
        setActiveTab("tasks");
      }
      return;
    }

    // Check for Tab Name in hash
    if (hash && ["overview", "tasks", "members", "files", "reports"].includes(hash)) {
      if (activeTab !== hash) {
        setActiveTab(hash as any);
      }
      return;
    }

    // Default to overview if no valid hash - REMOVED to prevent reset during updates
    // if (!hash && activeTab !== "overview") {
    //   setActiveTab("overview");
    // }
  }, [location.hash, tasks, activeTab, selectedTask]);

  // Update URL hash when tab or task changes (from user action)
  useEffect(() => {
    if (!isUserActionRef.current) {
      return;
    }

    isUserActionRef.current = false; // Reset after processing

    let newHash = "";
    if (selectedTask) {
      newHash = `task-${selectedTask.id}`;
    } else if (activeTab !== "overview") {
      newHash = activeTab;
    }

    const currentHash = location.hash.replace("#", "");
    if (currentHash !== newHash) {
      if (newHash) {
        navigate(`${location.pathname}#${newHash}`, { replace: true });
      } else {
        navigate(`${location.pathname}`, { replace: true });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, selectedTask]);

  // ==================== LOAD DATA FROM API ====================
  // ==================== LOAD DATA FROM API ====================
  useEffect(() => {
    loadProjectData();
  }, [project.id]);

  useEffect(() => {
    if (showAddMemberModal) {
      userService.getAllUsers().then(users => setAvailableUsers(users)).catch(err => console.error("Failed to load users", err));
    }
  }, [showAddMemberModal]);

  // Helper functions for task detail
  const handleOpenTaskDetail = (task: TaskDetail) => {
    isUserActionRef.current = true;
    setSelectedTask(task);
    setActiveTab("tasks");
    // URL hash will be updated by useEffect
  };

  const handleCloseTaskDetail = () => {
    isUserActionRef.current = true;
    setSelectedTask(null);
    // URL hash will be updated by useEffect
  };

  const handleTabChange = (tabId: "overview" | "tasks" | "members" | "files" | "reports") => {
    isUserActionRef.current = true;
    setActiveTab(tabId);
    // Close task detail when switching tabs (except tasks tab)
    if (tabId !== "tasks" && selectedTask) {
      setSelectedTask(null);
    }
  };

  // ==================== ADMIN PERMISSION CHECK ====================
  // Check if current user is admin or project manager
  const currentUser = authService.getStoredUser();
  const isAdmin = currentUser && (
    currentUser.role === 'Admin' ||
    currentUser.role === 'Manager' ||
    localProject.manager_id === currentUser.id
  );

  // ==================== DRAG & DROP HANDLER ====================
  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { draggableId, source, destination } = result;

    // If dropped in the same column, do nothing (reordering within column not implemented)
    if (source.droppableId === destination.droppableId) return;

    const taskId = draggableId;
    const newStatusId = destination.droppableId;

    // Find status name for optimistic update
    const workflowStatuses = localProject.workflowStatuses || [];
    const newStatus = workflowStatuses.find(s => s.id === newStatusId || s.name === newStatusId);
    const newStatusName = newStatus?.name || newStatusId;

    // Optimistic update - immediately update UI
    setTasks(prevTasks =>
      prevTasks.map(t =>
        t.id === taskId
          ? { ...t, status: newStatusName }
          : t
      )
    );

    // Call API to persist change
    try {
      await taskService.updateTaskStatus(taskId, newStatusId);
      // Reload project to get updated progress
      await loadProjectData(true);
    } catch (error) {
      console.error("Failed to update task status:", error);
      // Revert on error
      await loadProjectData(true);
      alert("Không thể cập nhật trạng thái task. Vui lòng thử lại.");
    }
  };

  const loadProjectData = async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);

      // Load all departments for dropdown
      const allDepts = await departmentService.getAllDepartments();
      setAllDepartments(allDepts);

      // Load project details with departments
      // Load project details with departments
      const projectData = await projectService.getProjectById(project.id);
      if (projectData) {
        // const projectData = projectDetails.data; // Service now unwraps this

        // Resolve workflow ID (handle both camelCase and snake_case)
        const workflowId = projectData.workflowId || projectData.workflow_id;

        // Update local project with fresh data including dates
        // Convert snake_case from backend to camelCase for frontend
        const updatedProject: Project = {
          ...localProject,
          ...projectData,
          managerName: projectData.managerName || projectData.manager,
          manager_id: projectData.manager_id,
          workflow_id: workflowId,
          startDate: projectData.start_date || projectData.startDate,
          endDate: projectData.end_date || projectData.endDate,
          workflowName: projectData.workflowName || projectData.workflow_name,
        };

        // Load workflow statuses if project has workflow_id
        if (workflowId) {
          try {
            const workflowData = await workflowService.getWorkflowById(workflowId);
            if (workflowData && workflowData.statuses) {
              updatedProject.workflowStatuses = workflowData.statuses.map((s: any) => ({
                id: s.id,
                name: s.name,
                color: s.color,
                order: s.order
              }));
            }
          } catch (error) {
            console.warn("Could not load workflow statuses:", error);
          }
        }

        setLocalProject(updatedProject);

        // Map department IDs to full department objects
        if (projectData.members) {
          setMembers(projectData.members);
        }
      }

      // Load tasks for this project
      try {
        const projectTasks = await taskService.getTasksByProject(project.id);
        const tasksWithDefaults = projectTasks.map((task: any) => ({
          ...task,
          checklist: task.checklist || [],
          attachments: task.attachments || [],
          comments: task.comments || [],
        }));

        // If we have a selected task, we expect the UI to manage its state independently or via onUpdate, 
        // but background refreshes update the 'tasks' list.
        setTasks(tasksWithDefaults);
      } catch (error) {
        console.error("Lỗi tải tasks:", error);
        setTasks([]);
      }

      setReports([]);
    } catch (error) {
      console.error("Lỗi tải dữ liệu dự án:", error);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  // ==================== DERIVED DATA ====================
  const lateTasks = tasks.filter((t) => {
    const dueDate = new Date(t.dueDate);
    const today = new Date();
    return dueDate < today && t.status !== "Done";
  });

  // Aggregate all files: Task Attachments + Report Attachments
  const allFiles = [
    ...tasks.flatMap((t) => t.attachments || []),
    ...reports.flatMap((r) => r.attachments || []),
  ];

  // ==================== HANDLERS ====================
  const handleAddTask = async (newTaskData: Partial<TaskDetail>) => {
    try {
      const taskPayload = {
        ...newTaskData,
        projectId: project.id, // Keep as UUID string
        status: newTaskData.status || "To Do",
      };
      console.log("📤 Creating task with payload:", taskPayload);

      const createdTask = await taskService.createTask(taskPayload);

      // Ensure checklist is always an array
      const taskWithDefaults = {
        ...createdTask,
        checklist: createdTask.checklist || [],
        attachments: createdTask.attachments || [],
      };

      setTasks([taskWithDefaults, ...tasks]);
      setShowCreateTask(false);
      alert("✅ Tạo task thành công!");
    } catch (error: any) {
      console.error("Lỗi tạo task:", error);
      console.error("Error details:", error.response?.data);
      alert("❌ Có lỗi xảy ra khi tạo task: " + (error.response?.data?.message || error.message));
    }
  };

  const handleSubmitReport = async (reportData: Partial<ProjectReport>) => {
    try {
      const newReport = await reportService.createReport({
        ...reportData,
        projectId: project.id, // Keep as UUID string
        submittedBy: "Admin (You)", // TODO: Get from auth context
        submittedDate: new Date().toLocaleDateString("vi-VN"),
        status: "Pending",
      });
      setReports([newReport, ...reports]);
      setShowSubmitReport(false);
      alert("✅ Nộp báo cáo thành công!");
    } catch (error) {
      console.error("Lỗi nộp báo cáo:", error);
      alert("❌ Có lỗi xảy ra khi nộp báo cáo");
    }
  };

  const handleUpdateReportStatus = async (
    id: string,
    status: "Approved" | "Rejected",
    feedback: string
  ) => {
    try {
      const updatedReport = await reportService.reviewReport(
        id,
        status,
        feedback
      );
      setReports((prev) => prev.map((r) => (r.id === id ? updatedReport : r)));
      setReviewReport(null);
      alert(
        `✅ ${status === "Approved" ? "Phê duyệt" : "Từ chối"
        } báo cáo thành công!`
      );
    } catch (error) {
      console.error("Lỗi duyệt báo cáo:", error);
      alert("❌ Có lỗi xảy ra");
    }
  };



  const handleProjectFileUpload = () => {
    projectFileInputRef.current?.click();
  };

  const handleProjectFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // TODO: Upload files to server
      alert(`✅ Đã tải lên ${files.length} tệp tin!`);
      // For now, just log the files
      console.log("Files to upload:", Array.from(files));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-slate-500">Đang tải chi tiết dự án...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn relative">
      {/* Modals */}
      {selectedTask && (
        <>
          <div
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity"
            onClick={handleCloseTaskDetail}
          ></div>
          <TaskDetailPanel
            task={selectedTask}
            onClose={handleCloseTaskDetail}
            onUpdate={(updatedTask) => {
              setSelectedTask(updatedTask);
              setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
              // Reload project to update progress
              loadProjectData(true);
            }}
            onDelete={(taskId) => {
              // Remove task from tasks state
              setTasks(prev => prev.filter(t => t.id !== taskId));
              setSelectedTask(null);
              // Reload project to update progress
              loadProjectData(true);
            }}
            departments={allDepartments}
            members={members}
            project={localProject}
          />
        </>
      )}
      {showCreateTask && (
        <CreateTaskModal
          project={localProject}
          departments={allDepartments}
          members={members}
          onClose={() => setShowCreateTask(false)}
          onSave={handleAddTask}
        />
      )}
      {showSubmitReport && (
        <SubmitReportModal
          project={localProject}
          departments={allDepartments}
          onClose={() => setShowSubmitReport(false)}
          onSubmit={handleSubmitReport}
        />
      )}
      {reviewReport && (
        <ReportReviewModal
          report={reviewReport}
          onClose={() => setReviewReport(null)}
          onUpdateStatus={handleUpdateReportStatus}
        />
      )}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-xl">
              <h3 className="text-lg font-bold text-slate-900">Thêm thành viên</h3>
              <button onClick={() => setShowAddMemberModal(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500">
                <X size={20} />
              </button>
            </div>

            <div className="p-4 border-b border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4 bg-white">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Tìm theo tên hoặc email..."
                  value={memberSearchTerm}
                  onChange={e => setMemberSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>

              {/* Department Filter */}
              <select
                value={memberDepartmentFilter}
                onChange={e => setMemberDepartmentFilter(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white"
              >
                <option value="">Tất cả phòng ban</option>
                {allDepartments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50/50">
              {availableUsers
                .filter(u => {
                  const matchesName = (u.full_name || "").toLowerCase().includes(memberSearchTerm.toLowerCase()) || (u.email || "").toLowerCase().includes(memberSearchTerm.toLowerCase());
                  const matchesDept = memberDepartmentFilter ? u.department_id === memberDepartmentFilter : true;
                  // Check if already a member
                  // Check if already a member
                  const isNotMember = Array.isArray(members) && !members.find(m => m.user_id === u.id);
                  return matchesName && matchesDept && isNotMember;
                })
                .map(user => (
                  <div key={user.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:border-brand-300 hover:bg-brand-50 transition-all bg-white shadow-sm">
                    <div className="flex items-center gap-3">
                      <img src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.full_name}`} className="w-10 h-10 rounded-full bg-slate-200" alt="" />
                      <div>
                        <p className="font-bold text-slate-900">{user.full_name}</p>
                        <p className="text-xs text-slate-500">{user.email} • {allDepartments.find(d => d.id === user.department_id)?.name || "Chưa có phòng ban"}</p>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => {
                      projectService.addMember(project.id, user.id).then(newMembers => {
                        setMembers(newMembers);
                        // alert Removed to be less annoying, or maybe toast
                      }).catch(err => alert("Lỗi thêm thành viên: " + err));
                    }}>
                      <Plus size={14} className="mr-1" /> Thêm
                    </Button>
                  </div>
                ))
              }
              {availableUsers.length === 0 && <p className="text-center text-slate-500 py-8">Đang tải biểu mẫu...</p>}
            </div>

            <div className="p-4 border-t border-slate-200 flex justify-end">
              <Button variant="outline" onClick={() => setShowAddMemberModal(false)}>Đóng</Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-start gap-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="mt-1 p-2 h-10 w-10"
          >
            <ArrowLeft size={18} />
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-xs font-mono font-bold text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded">
                {localProject.code}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${localProject.status === "Done"
                  ? "bg-green-100 text-green-700"
                  : localProject.status === "Review"
                    ? "bg-purple-100 text-purple-700"
                    : localProject.status === "In Progress"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
              >
                {localProject.status}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900">
              {localProject.name}
            </h1>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Edit2 size={16} className="mr-2" /> Cấu hình
          </Button>
          <Button onClick={() => setShowCreateTask(true)}>
            <Plus size={16} className="mr-2" /> Thêm Task
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-8 overflow-x-auto">
        {[
          { id: "overview", label: "Tổng quan", icon: PieChart },
          { id: "tasks", label: "Công việc", icon: Layers },
          { id: "members", label: "Thành viên", icon: Users },
          { id: "files", label: "Tài liệu", icon: Paperclip },
          { id: "reports", label: "Báo cáo", icon: FileText },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id as any)}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === tab.id
              ? "border-brand-600 text-brand-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="min-h-[500px]">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-fadeIn">
            {/* Late Task Alert */}
            {lateTasks.length > 0 && (
              <div className="md:col-span-4 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-4">
                <div className="p-2 bg-red-100 text-red-600 rounded-full">
                  <AlertCircle size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-red-800 text-lg">
                    Cảnh báo rủi ro
                  </h3>
                  <p className="text-red-700 text-sm mt-1">
                    Có{" "}
                    <span className="font-bold">
                      {lateTasks.length} nhiệm vụ
                    </span>{" "}
                    đã quá hạn nhưng chưa hoàn thành. Vui lòng kiểm tra và đốc
                    thúc tiến độ.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button
                      className="text-xs font-bold text-red-700 hover:underline"
                      onClick={() => handleTabChange("tasks")}
                    >
                      Xem chi tiết nhiệm vụ
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Stats Cards */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
                Tiến độ tổng thể
              </div>
              <div className="flex items-end justify-between mb-2">
                <span className="text-3xl font-bold text-slate-900">
                  {localProject.progress}%
                </span>
                <span className="text-sm text-green-600 font-medium">
                  On track
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-brand-600 h-2 rounded-full"
                  style={{ width: `${localProject.progress}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
                Ngân sách (Budget)
              </div>
              <div className="flex items-center gap-2 mb-1">
                <DollarSign size={20} className="text-slate-400" />
                <span className="text-xl font-bold text-slate-900">
                  {localProject.budget}
                </span>
              </div>
              <div className="text-xs text-slate-400">Đã giải ngân: 45%</div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
                Thời gian (Timeline)
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <Clock size={14} className="text-green-500" /> Start:{" "}
                  {localProject.startDate
                    ? new Date(localProject.startDate).toLocaleDateString(
                      "vi-VN"
                    )
                    : "Chưa đặt"}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <Flag size={14} className="text-red-500" /> Deadline:{" "}
                  {localProject.endDate
                    ? new Date(localProject.endDate).toLocaleDateString("vi-VN")
                    : "Chưa đặt"}
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
                PM Phụ trách
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                  PM
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">
                    {localProject.managerName ||
                      localProject.manager ||
                      "Chưa có"}
                  </p>
                  <p className="text-xs text-slate-500">Project Manager</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="md:col-span-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm mt-4">
              <h3 className="text-lg font-bold text-slate-900 mb-4">
                Mô tả dự án
              </h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                {localProject.description}
              </p>
            </div>
          </div>
        )}

        {activeTab === "tasks" && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-fadeIn flex flex-col h-[600px]">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-slate-900">
                  Danh sách công việc
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-slate-200 text-xs font-bold text-slate-600">
                  {tasks.length}
                </span>
              </div>
              <div className="flex gap-2">
                <div className="flex bg-white border border-slate-200 rounded-md p-1">
                  <button
                    onClick={() => setTaskViewMode("kanban")}
                    className={`p-1.5 rounded transition-colors ${taskViewMode === "kanban"
                      ? "bg-slate-100 text-slate-900 shadow-sm"
                      : "text-slate-400 hover:bg-slate-50"
                      }`}
                    title="Kanban Board"
                  >
                    <Kanban size={18} />
                  </button>
                  <button
                    onClick={() => setTaskViewMode("list")}
                    className={`p-1.5 rounded transition-colors ${taskViewMode === "list"
                      ? "bg-slate-100 text-slate-900 shadow-sm"
                      : "text-slate-400 hover:bg-slate-50"
                      }`}
                    title="List View"
                  >
                    <List size={18} />
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Lọc task..."
                  className="text-sm border border-slate-300 rounded-md px-3 py-1.5 focus:ring-1 focus:ring-brand-500 outline-none"
                />
              </div>
            </div>

            {/* Task Content */}
            <div className="flex-1 overflow-auto bg-slate-50 p-4">
              {taskViewMode === "list" ? (
                <table className="min-w-full divide-y divide-slate-200 bg-white rounded-lg shadow-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-[40%]">
                        Tên công việc
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Phòng ban
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Mức độ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Tiến độ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {tasks.map((task) => {
                      const completedItems =
                        task.checklist?.filter((i) => i.isCompleted).length ||
                        0;
                      const totalItems = task.checklist?.length || 0;
                      const progress =
                        totalItems > 0
                          ? Math.round((completedItems / totalItems) * 100)
                          : 0;
                      const isLate =
                        new Date(task.dueDate) < new Date() &&
                        task.status !== "Done";

                      return (
                        <tr
                          key={task.id}
                          className="hover:bg-slate-50 transition-colors cursor-pointer group"
                          onClick={() => handleOpenTaskDetail(task)}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-start gap-3">
                              <div
                                className={`mt-1 flex-shrink-0 w-2 h-2 rounded-full ${task.priority === "Critical"
                                  ? "bg-red-500"
                                  : task.priority === "High"
                                    ? "bg-orange-500"
                                    : "bg-blue-500"
                                  }`}
                              ></div>
                              <div>
                                <p
                                  className={`text-sm font-semibold group-hover:text-brand-600 transition-colors ${isLate ? "text-red-600" : "text-slate-900"
                                    }`}
                                >
                                  {task.title}
                                </p>
                                <div className="flex gap-2 mt-1">
                                  <span className="text-xs font-mono text-slate-400">
                                    #{task.id}
                                  </span>
                                  <span
                                    className={`text-xs flex items-center gap-1 ${isLate
                                      ? "text-red-500 font-bold"
                                      : "text-slate-400"
                                      }`}
                                  >
                                    <Calendar size={10} /> {task.dueDate}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2.5 py-1 rounded-full text-xs font-medium border bg-slate-50 text-slate-700 border-slate-100">
                              {task.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Building size={14} className="text-slate-400" />{" "}
                              {task.assigneeDepartment}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-600 flex items-center gap-1">
                              {task.priority}
                            </div>
                          </td>
                          <td className="px-6 py-4 align-middle">
                            {totalItems > 0 ? (
                              <div className="w-full max-w-[120px]">
                                <div className="w-full bg-slate-100 rounded-full h-1.5">
                                  <div
                                    className={`h-1.5 rounded-full ${progress === 100
                                      ? "bg-green-500"
                                      : "bg-brand-500"
                                      }`}
                                    style={{ width: `${progress}%` }}
                                  ></div>
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 italic">
                                No checklist
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                // Kanban View with Drag-Drop
                localProject.workflowStatuses && localProject.workflowStatuses.length > 0 ? (
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <div className="flex gap-4 h-full overflow-x-auto pb-2">
                      {/* Dynamic columns based on project workflow */}
                      {localProject.workflowStatuses.map((wfStatus: any) => (
                        <Droppable key={wfStatus.id || wfStatus.name} droppableId={wfStatus.id || wfStatus.name} isDropDisabled={!isAdmin}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className={`min-w-[280px] w-[300px] bg-slate-100 rounded-lg flex flex-col transition-colors ${snapshot.isDraggingOver ? 'bg-blue-50 ring-2 ring-blue-300' : ''
                                }`}
                            >
                              <div className="p-3 font-bold text-slate-700 border-b border-slate-200 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${wfStatus.color || 'bg-slate-500'}`}></div>
                                  {wfStatus.name}
                                </div>
                                <span className="bg-white text-xs px-2 py-0.5 rounded-full">
                                  {tasks.filter((t) => t.status === wfStatus.name).length}
                                </span>
                              </div>
                              <div className="p-2 space-y-2 flex-1 min-h-[100px]">
                                {tasks
                                  .filter((t) => t.status === wfStatus.name)
                                  .map((task, index) => (
                                    <Draggable
                                      key={task.id}
                                      draggableId={task.id}
                                      index={index}
                                      isDragDisabled={!isAdmin}
                                    >
                                      {(dragProvided, dragSnapshot) => (
                                        <div
                                          ref={dragProvided.innerRef}
                                          {...dragProvided.draggableProps}
                                          {...dragProvided.dragHandleProps}
                                          onClick={() => handleOpenTaskDetail(task)}
                                          className={`bg-white p-3 rounded shadow-sm border cursor-pointer transition-all ${dragSnapshot.isDragging
                                            ? 'shadow-lg border-blue-300 rotate-2'
                                            : 'border-slate-200 hover:shadow-md'
                                            } ${!isAdmin ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'}`}
                                        >
                                          <p className="text-sm font-medium text-slate-900 mb-2">
                                            {task.title}
                                          </p>

                                          {/* Assignee & Dept Badge */}
                                          <div className="flex items-center gap-2 mb-2 bg-slate-50 p-1.5 rounded">
                                            <Building size={12} className="text-slate-400" />
                                            <div className="overflow-hidden">
                                              <p className="text-xs font-medium text-slate-700 truncate">
                                                {task.assigneeDepartment}
                                              </p>
                                            </div>
                                          </div>

                                          <div className="flex justify-between items-center mt-2">
                                            <span
                                              className={`text-[10px] px-1.5 py-0.5 rounded ${task.priority === "High" || task.priority === "Critical"
                                                ? "bg-orange-100 text-orange-700"
                                                : "bg-slate-100 text-slate-600"
                                                }`}
                                            >
                                              {task.priority}
                                            </span>
                                            <span className="text-[10px] text-slate-400">
                                              {task.dueDate}
                                            </span>
                                          </div>
                                        </div>
                                      )}
                                    </Draggable>
                                  ))}
                                {provided.placeholder}
                              </div>
                            </div>
                          )}
                        </Droppable>
                      ))}
                    </div>
                  </DragDropContext>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full min-h-[400px] border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                    <GitBranch size={48} className="text-slate-300 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">Chưa thiết lập Quy trình</h3>
                    <p className="text-slate-500 max-w-md text-center mb-6">
                      Dự án này chưa có quy trình làm việc (Workflow). Vui lòng chọn workflow cho dự án này để hiển thị bảng công việc.
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {activeTab === "members" && (
          <div className="animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                Thành viên tham gia
              </h3>
              <div className="flex items-center gap-3">
                <Button onClick={() => setShowAddMemberModal(true)}>
                  <Plus size={16} className="mr-2" /> Thêm thành viên
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.isArray(members) && members.map((member) => (
                <div
                  key={member.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm relative group flex items-center gap-4"
                >
                  <button
                    onClick={() => {
                      if (confirm("Xóa thành viên này?")) {
                        projectService.removeMember(project.id, member.user_id).then(newMembers => {
                          setMembers(newMembers);
                        });
                      }
                    }}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-slate-400 hover:text-red-600 bg-white hover:bg-red-50 rounded-full border border-slate-200 shadow-sm"
                  >
                    <Trash2 size={14} />
                  </button>

                  <img src={member.avatar_url || "https://ui-avatars.com/api/?name=" + member.userName} className="w-12 h-12 rounded-full bg-slate-100" />

                  <div>
                    <h4 className="font-bold text-slate-900">{member.userName}</h4>
                    <p className="text-xs text-slate-500">{member.departmentName || "Thành viên"}</p>
                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 border border-slate-200 mt-1 inline-block">{member.role}</span>
                  </div>
                </div>
              ))}
              {members.length === 0 && (
                <div className="col-span-3 text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-500">
                  Chưa có thành viên nào.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "files" && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm animate-fadeIn p-6">
            <input
              ref={projectFileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleProjectFileChange}
              accept=".pdf,.doc,.docx,.xlsx,.xls,.ppt,.pptx,.png,.jpg,.jpeg,.zip"
            />
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-900">
                Tài liệu dự án (Tổng hợp)
              </h3>
              <Button className="text-xs" onClick={handleProjectFileUpload}>
                <Plus size={16} className="mr-2" /> Upload File
              </Button>
            </div>
            {allFiles.length > 0 ? (
              <div className="space-y-2">
                {allFiles.map((doc, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-200 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded">
                        {doc.type === "image" ? (
                          <Image size={20} />
                        ) : (
                          <FileText size={20} />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {doc.name}
                        </p>
                        <div className="flex gap-2 text-xs text-slate-500">
                          <span>{doc.date}</span>
                          <span>•</span>
                          <span>
                            Nguồn: {doc.source} ({doc.uploader})
                          </span>
                        </div>
                      </div>
                    </div>
                    <button className="text-slate-400 hover:text-brand-600">
                      <Download size={18} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                <Paperclip size={32} className="mx-auto mb-2 opacity-50" />
                <p>Chưa có tài liệu nào.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "reports" && (
          <div className="animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-bold text-slate-900">
                  Báo cáo & Nghiệm thu
                </h3>
                <p className="text-sm text-slate-500">
                  Quản lý báo cáo tiến độ từ các phòng ban.
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="text-xs">
                  <Download size={16} className="mr-2" /> Xuất PDF
                </Button>
                <Button
                  className="text-xs"
                  onClick={() => setShowSubmitReport(true)}
                >
                  <Plus size={16} className="mr-2" /> Nộp báo cáo
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {reports.map((report) => (
                <div
                  key={report.id}
                  onClick={() => setReviewReport(report)}
                  className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-brand-300 transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold uppercase text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {report.department}
                        </span>
                        <span className="text-xs text-slate-400">
                          • {report.submittedDate}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-lg group-hover:text-brand-600 transition-colors">
                        {report.title}
                      </h4>
                      <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                        {report.content}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${report.status === "Approved"
                        ? "bg-green-50 text-green-700 border-green-100"
                        : report.status === "Rejected"
                          ? "bg-red-50 text-red-700 border-red-100"
                          : "bg-yellow-50 text-yellow-700 border-yellow-100"
                        }`}
                    >
                      {report.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <User size={14} /> Người nộp:{" "}
                        <span className="font-medium text-slate-700">
                          {report.submittedBy}
                        </span>
                      </div>
                      {report.attachments && report.attachments.length > 0 && (
                        <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                          <Paperclip size={12} /> {report.attachments.length}{" "}
                          file
                        </div>
                      )}
                    </div>
                    {report.feedback && (
                      <div className="text-xs text-slate-500 italic max-w-xs truncate">
                        "Feedback: {report.feedback}"
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {reports.length === 0 && (
                <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  <FileText size={40} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-500 font-medium">
                    Chưa có báo cáo nào được nộp.
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Các phòng ban vui lòng nộp báo cáo định kỳ tại đây.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
