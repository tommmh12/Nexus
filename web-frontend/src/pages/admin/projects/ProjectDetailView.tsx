import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { taskService, TaskDetail } from "../../../services/taskService";
import { reportService, ProjectReport } from "../../../services/reportService";
import { projectService } from "../../../services/projectService";
import {
  departmentService,
  Department,
} from "../../../services/departmentService";
import type { ProjectDocument } from "../../../../types";

interface Project {
  id: string;
  code: string;
  name: string;
  description?: string;
  managerName?: string;
  workflowName?: string;
  status: string;
  priority: string;
  progress: number;
  taskCount?: number;
  completedTaskCount?: number;
  startDate?: string;
  endDate?: string;
  budget?: number;
}

// --- Modals ---

const CreateTaskModal = ({
  project,
  departments,
  onClose,
  onSave,
}: {
  project: Project;
  departments: Department[];
  onClose: () => void;
  onSave: (task: Partial<TaskDetail>) => void;
}) => {
  const [title, setTitle] = useState("");
  const [assigneeDept, setAssigneeDept] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<ProjectDocument[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles: ProjectDocument[] = Array.from(files).map((file) => ({
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
    onSave({
      title,
      priority: priority as any,
      assigneeDepartment: assigneeDept,
      startDate,
      dueDate,
      description,
      status: "To Do",
      checklist: [],
      comments: [],
      tags: [],
      attachments: attachedFiles,
    });
  };

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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Phòng ban thực hiện
              </label>
              <select
                className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                value={assigneeDept}
                onChange={(e) => setAssigneeDept(e.target.value)}
                required
              >
                <option value="">Chọn phòng ban...</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.name}>
                    {dept.name} ({dept.memberCount} người)
                  </option>
                ))}
              </select>
            </div>
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Ngày bắt đầu"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
            <Input
              label="Hạn hoàn thành"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
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
  onClose,
}: {
  task: TaskDetail;
  onClose: () => void;
}) => {
  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[600px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-slate-200 flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
        <div className="flex-1 pr-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-mono font-bold text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
              {task.id}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                task.priority === "Critical"
                  ? "bg-red-100 text-red-700"
                  : task.priority === "High"
                  ? "bg-orange-100 text-orange-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {task.priority} Priority
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              {task.status}
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 leading-snug">
            {task.title}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600"
        >
          <X size={20} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Meta Controls */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">
              Phòng ban thực hiện
            </label>
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200 transition-colors">
              <div className="p-2 bg-slate-100 rounded text-slate-600">
                <Building size={16} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {task.assigneeDepartment}
                </p>
              </div>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">
              Thời gian
            </label>
            <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200 transition-colors">
              <Calendar size={16} className="text-slate-400" />
              <span className="text-sm font-medium text-slate-900">
                {task.startDate} - {task.dueDate}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-2">
            Mô tả công việc
          </h3>
          <div className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">
            {task.description}
          </div>
        </div>

        {/* Attachments */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-2">
            Tài liệu đính kèm
          </h3>
          {task.attachments && task.attachments.length > 0 ? (
            <div className="space-y-2">
              {task.attachments.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="p-2 bg-blue-50 text-blue-600 rounded">
                    {file.type === "image" ? (
                      <Image size={16} />
                    ) : (
                      <FileText size={16} />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {file.date} • {file.uploader}
                    </p>
                  </div>
                  <Download
                    size={16}
                    className="text-slate-400 hover:text-slate-600"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic">
              Không có tài liệu đính kèm.
            </p>
          )}
        </div>

        {/* Checklist (To Do) */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CheckSquare size={16} className="text-brand-600" /> Checklist
            </h3>
            <span className="text-xs text-slate-500">
              {task.checklist?.filter((i) => i.isCompleted).length || 0}/
              {task.checklist?.length || 0} hoàn thành
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-1.5 mb-4">
            <div
              className="bg-brand-600 h-1.5 rounded-full transition-all duration-500"
              style={{
                width: `${
                  (task.checklist?.length || 0) > 0
                    ? ((task.checklist?.filter((i) => i.isCompleted).length ||
                        0) /
                        (task.checklist?.length || 1)) *
                      100
                    : 0
                }%`,
              }}
            ></div>
          </div>

          <div className="space-y-2">
            {task.checklist?.map((item) => (
              <label
                key={item.id}
                className="flex items-start gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer group"
              >
                <div className="relative flex items-center mt-0.5">
                  <input
                    type="checkbox"
                    defaultChecked={item.isCompleted}
                    className="peer h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                  />
                  <div className="absolute inset-0 bg-white/50 hidden peer-disabled:block"></div>
                </div>
                <span className="text-sm text-slate-700 peer-checked:text-slate-400 peer-checked:line-through transition-colors">
                  {item.text}
                </span>
              </label>
            ))}
            <button className="flex items-center gap-2 text-sm text-slate-500 hover:text-brand-600 font-medium p-2 mt-2">
              <Plus size={16} /> Thêm việc cần làm
            </button>
          </div>
        </div>

        {/* Comments */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <MessageCircle size={16} className="text-slate-400" /> Thảo luận
          </h3>

          <div className="space-y-4 mb-4">
            {task.comments.map((c) => (
              <div key={c.id} className="flex gap-3">
                <img
                  src={c.userAvatar}
                  className="w-8 h-8 rounded-full flex-shrink-0"
                  alt=""
                />
                <div className="flex-1 bg-slate-50 p-3 rounded-lg rounded-tl-none border border-slate-100">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-slate-900">
                      {c.userName}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {c.timestamp}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700">{c.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Viết bình luận..."
              className="w-full pl-4 pr-10 py-3 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none shadow-sm"
            />
            <button className="absolute right-2 top-2 p-1 text-brand-600 hover:bg-brand-50 rounded">
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-slate-200 bg-white flex justify-end gap-3">
        <Button variant="outline" onClick={onClose}>
          Đóng
        </Button>
        <Button className="bg-brand-600 hover:bg-brand-700">
          Lưu thay đổi
        </Button>
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
  // ==================== STATE MANAGEMENT ====================
  const [localProject, setLocalProject] = useState<Project>(project);
  const [tasks, setTasks] = useState<TaskDetail[]>([]);
  const [reports, setReports] = useState<ProjectReport[]>([]);
  const [projectDepartments, setProjectDepartments] = useState<Department[]>(
    []
  );
  const [allDepartments, setAllDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  // View State
  const [activeTab, setActiveTab] = useState<
    "overview" | "tasks" | "departments" | "files" | "reports"
  >("overview");
  const [taskViewMode, setTaskViewMode] = useState<"list" | "kanban">("list");

  // Modal State
  const [selectedTask, setSelectedTask] = useState<TaskDetail | null>(null);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showSubmitReport, setShowSubmitReport] = useState(false);
  const [reviewReport, setReviewReport] = useState<ProjectReport | null>(null);

  // File upload ref for files tab
  const projectFileInputRef = React.useRef<HTMLInputElement>(null);

  // ==================== LOAD DATA FROM API ====================
  useEffect(() => {
    loadProjectData();
  }, [project.id]);

  const loadProjectData = async () => {
    try {
      setLoading(true);

      // Load all departments for dropdown
      const allDepts = await departmentService.getAllDepartments();
      setAllDepartments(allDepts);

      // Load project details with departments
      const projectDetails = await projectService.getProjectById(project.id);
      if (projectDetails && projectDetails.success) {
        const projectData = projectDetails.data;

        // Update local project with fresh data including dates
        // Convert snake_case from backend to camelCase for frontend
        setLocalProject({
          ...localProject,
          ...projectData,
          managerName: projectData.managerName || projectData.manager,
          startDate: projectData.start_date || projectData.startDate,
          endDate: projectData.end_date || projectData.endDate,
          workflowName: projectData.workflowName || projectData.workflow_name,
        });

        // Map department IDs to full department objects
        if (projectData.departments) {
          const projDepts = projectData.departments
            .map((pd: any) => allDepts.find((d) => d.id === pd.department_id))
            .filter(Boolean);
          setProjectDepartments(projDepts);
        }
      }

      // Load tasks for this project
      try {
        const projectTasks = await taskService.getTasksByProject(project.id);
        const tasksWithDefaults = projectTasks.map((task: any) => ({
          ...task,
          checklist: task.checklist || [],
          attachments: task.attachments || [],
        }));
        setTasks(tasksWithDefaults);
      } catch (error) {
        console.error("Lỗi tải tasks:", error);
        setTasks([]);
      }

      setReports([]);
    } catch (error) {
      console.error("Lỗi tải dữ liệu dự án:", error);
    } finally {
      setLoading(false);
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
      const createdTask = await taskService.createTask({
        ...newTaskData,
        projectId: project.id, // Keep as UUID string
      });

      // Ensure checklist is always an array
      const taskWithDefaults = {
        ...createdTask,
        checklist: createdTask.checklist || [],
        attachments: createdTask.attachments || [],
      };

      setTasks([taskWithDefaults, ...tasks]);
      setShowCreateTask(false);
      alert("✅ Tạo task thành công!");
    } catch (error) {
      console.error("Lỗi tạo task:", error);
      alert("❌ Có lỗi xảy ra khi tạo task");
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
        `✅ ${
          status === "Approved" ? "Phê duyệt" : "Từ chối"
        } báo cáo thành công!`
      );
    } catch (error) {
      console.error("Lỗi duyệt báo cáo:", error);
      alert("❌ Có lỗi xảy ra");
    }
  };

  const handleAddDepartment = async (departmentId: string) => {
    try {
      await projectService.updateProject(project.id, {
        departments: [...projectDepartments.map((d) => d.id), departmentId],
      });

      await loadProjectData();
      alert("✅ Thêm phòng ban thành công!");
    } catch (error) {
      console.error("Lỗi thêm phòng ban:", error);
      alert("❌ Có lỗi xảy ra");
    }
  };

  const handleRemoveDepartment = async (departmentId: string) => {
    if (!confirm("Bạn có chắc muốn xóa phòng ban này khỏi dự án?")) return;

    try {
      await projectService.updateProject(project.id, {
        departments: projectDepartments
          .filter((d) => d.id !== departmentId)
          .map((d) => d.id),
      });

      await loadProjectData();
      alert("✅ Xóa phòng ban thành công!");
    } catch (error) {
      console.error("Lỗi xóa phòng ban:", error);
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
            onClick={() => setSelectedTask(null)}
          ></div>
          <TaskDetailPanel
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
          />
        </>
      )}
      {showCreateTask && (
        <CreateTaskModal
          project={localProject}
          departments={projectDepartments}
          onClose={() => setShowCreateTask(false)}
          onSave={handleAddTask}
        />
      )}
      {showSubmitReport && (
        <SubmitReportModal
          project={localProject}
          departments={projectDepartments}
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
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  localProject.status === "Done"
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
          { id: "departments", label: "Phòng ban", icon: Users },
          { id: "files", label: "Tài liệu", icon: Paperclip },
          { id: "reports", label: "Báo cáo", icon: FileText },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === tab.id
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
                      onClick={() => setActiveTab("tasks")}
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
                    className={`p-1.5 rounded transition-colors ${
                      taskViewMode === "kanban"
                        ? "bg-slate-100 text-slate-900 shadow-sm"
                        : "text-slate-400 hover:bg-slate-50"
                    }`}
                    title="Kanban Board"
                  >
                    <Kanban size={18} />
                  </button>
                  <button
                    onClick={() => setTaskViewMode("list")}
                    className={`p-1.5 rounded transition-colors ${
                      taskViewMode === "list"
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
                          onClick={() => setSelectedTask(task)}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-start gap-3">
                              <div
                                className={`mt-1 flex-shrink-0 w-2 h-2 rounded-full ${
                                  task.priority === "Critical"
                                    ? "bg-red-500"
                                    : task.priority === "High"
                                    ? "bg-orange-500"
                                    : "bg-blue-500"
                                }`}
                              ></div>
                              <div>
                                <p
                                  className={`text-sm font-semibold group-hover:text-brand-600 transition-colors ${
                                    isLate ? "text-red-600" : "text-slate-900"
                                  }`}
                                >
                                  {task.title}
                                </p>
                                <div className="flex gap-2 mt-1">
                                  <span className="text-xs font-mono text-slate-400">
                                    #{task.id}
                                  </span>
                                  <span
                                    className={`text-xs flex items-center gap-1 ${
                                      isLate
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
                                    className={`h-1.5 rounded-full ${
                                      progress === 100
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
                // Kanban View
                <div className="flex gap-4 h-full overflow-x-auto pb-2">
                  {["To Do", "In Progress", "Done"].map((status) => (
                    <div
                      key={status}
                      className="min-w-[280px] w-[300px] bg-slate-100 rounded-lg flex flex-col"
                    >
                      <div className="p-3 font-bold text-slate-700 border-b border-slate-200 flex justify-between">
                        {status}
                        <span className="bg-white text-xs px-2 py-0.5 rounded-full">
                          {tasks.filter((t) => t.status === status).length}
                        </span>
                      </div>
                      <div className="p-2 space-y-2 overflow-y-auto flex-1 custom-scrollbar">
                        {tasks
                          .filter((t) => t.status === status)
                          .map((task) => (
                            <div
                              key={task.id}
                              onClick={() => setSelectedTask(task)}
                              className="bg-white p-3 rounded shadow-sm border border-slate-200 cursor-pointer hover:shadow-md transition-all"
                            >
                              <p className="text-sm font-medium text-slate-900 mb-2">
                                {task.title}
                              </p>

                              {/* Assignee & Dept Badge */}
                              <div className="flex items-center gap-2 mb-2 bg-slate-50 p-1.5 rounded">
                                <Building
                                  size={12}
                                  className="text-slate-400"
                                />
                                <div className="overflow-hidden">
                                  <p className="text-xs font-medium text-slate-700 truncate">
                                    {task.assigneeDepartment}
                                  </p>
                                </div>
                              </div>

                              <div className="flex justify-between items-center mt-2">
                                <span
                                  className={`text-[10px] px-1.5 py-0.5 rounded ${
                                    task.priority === "High" ||
                                    task.priority === "Critical"
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
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "departments" && (
          <div className="animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                Các phòng ban tham gia dự án
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-500">
                  {projectDepartments.length} phòng ban
                </span>
                <select
                  className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white hover:bg-slate-50"
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddDepartment(e.target.value);
                      e.target.value = "";
                    }
                  }}
                >
                  <option value="">+ Thêm phòng ban</option>
                  {allDepartments
                    .filter(
                      (d) => !projectDepartments.find((pd) => pd.id === d.id)
                    )
                    .map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projectDepartments.map((dept) => (
                <div
                  key={dept.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm relative group"
                >
                  <button
                    onClick={() => handleRemoveDepartment(dept.id)}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-slate-400 hover:text-red-600 bg-white hover:bg-red-50 rounded-full border border-slate-200 shadow-sm"
                    title="Xóa khỏi dự án"
                  >
                    <Trash2 size={14} />
                  </button>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-brand-50 text-brand-600 rounded-lg">
                      <Users size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{dept.name}</h4>
                      <p className="text-xs text-slate-500">
                        {dept.memberCount} nhân sự
                      </p>
                    </div>
                  </div>
                  <div className="border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center text-xs font-bold text-brand-600">
                        {dept.managerName?.charAt(0) || "M"}
                      </div>
                      <span className="text-sm font-medium text-slate-700">
                        QL: {dept.managerName || "Chưa có"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {dept.description}
                    </p>
                  </div>
                </div>
              ))}
              {projectDepartments.length === 0 && (
                <div className="col-span-3 text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-500">
                  Chưa có phòng ban nào tham gia dự án này. Nhấn "Thêm phòng
                  ban" để mời phòng ban tham gia.
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
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        report.status === "Approved"
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
