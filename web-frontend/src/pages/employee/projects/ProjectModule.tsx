import React, { useState } from "react";

// Mock data for UI preview
const MOCK_TASKS = [
  {
    id: "1",
    title: "Hoàn thành báo cáo tháng 6",
    description: "Tổng hợp và hoàn thành báo cáo hiệu suất công việc tháng 6",
    project: "Portal Nội bộ",
    projectColor: "blue",
    priority: "high" as const,
    status: "in-progress" as const,
    dueDate: "2024-06-20",
    progress: 65,
    assignedBy: "Nguyễn Văn An",
    tags: ["report", "monthly"],
  },
  {
    id: "2",
    title: "Review code module Chat",
    description: "Kiểm tra và review code cho module chat realtime",
    project: "Portal Nội bộ",
    projectColor: "blue",
    priority: "medium" as const,
    status: "pending" as const,
    dueDate: "2024-06-22",
    progress: 0,
    assignedBy: "Trần Thị Bình",
    tags: ["review", "code"],
  },
  {
    id: "3",
    title: "Thiết kế mockup trang Dashboard",
    description: "Tạo mockup UI cho trang dashboard mới",
    project: "Website Marketing",
    projectColor: "green",
    priority: "high" as const,
    status: "in-progress" as const,
    dueDate: "2024-06-18",
    progress: 80,
    assignedBy: "Lê Hoàng Cường",
    tags: ["design", "ui"],
  },
  {
    id: "4",
    title: "Viết tài liệu API endpoints",
    description: "Tạo tài liệu kỹ thuật cho các API mới",
    project: "Portal Nội bộ",
    projectColor: "blue",
    priority: "low" as const,
    status: "completed" as const,
    dueDate: "2024-06-15",
    progress: 100,
    assignedBy: "Phạm Văn Dũng",
    tags: ["docs", "api"],
  },
  {
    id: "5",
    title: "Fix bug đăng nhập mobile",
    description: "Sửa lỗi không đăng nhập được trên ứng dụng mobile",
    project: "Mobile App",
    projectColor: "purple",
    priority: "high" as const,
    status: "in-progress" as const,
    dueDate: "2024-06-17",
    progress: 40,
    assignedBy: "Nguyễn Văn An",
    tags: ["bug", "mobile"],
  },
];

const MOCK_PROJECTS = [
  {
    id: "1",
    name: "Portal Nội bộ",
    color: "blue",
    taskCount: 12,
    progress: 68,
  },
  {
    id: "2",
    name: "Website Marketing",
    color: "green",
    taskCount: 8,
    progress: 45,
  },
  { id: "3", name: "Mobile App", color: "purple", taskCount: 5, progress: 30 },
];

const statusConfig = {
  pending: {
    label: "Chờ xử lý",
    color: "bg-gray-100 text-gray-700",
    icon: "⏳",
  },
  "in-progress": {
    label: "Đang thực hiện",
    color: "bg-blue-100 text-blue-700",
    icon: "🔄",
  },
  completed: {
    label: "Hoàn thành",
    color: "bg-green-100 text-green-700",
    icon: "✅",
  },
  overdue: { label: "Quá hạn", color: "bg-red-100 text-red-700", icon: "⚠️" },
};

const priorityConfig = {
  high: { label: "Cao", color: "text-red-500", dot: "bg-red-500" },
  medium: {
    label: "Trung bình",
    color: "text-yellow-500",
    dot: "bg-yellow-500",
  },
  low: { label: "Thấp", color: "text-green-500", dot: "bg-green-500" },
};

export default function ProjectModule() {
  const [viewMode, setViewMode] = useState<"list" | "board" | "calendar">(
    "list"
  );
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterProject, setFilterProject] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTask, setSelectedTask] = useState<
    (typeof MOCK_TASKS)[0] | null
  >(null);
  const [showProjectDetail, setShowProjectDetail] = useState<
    (typeof MOCK_PROJECTS)[0] | null
  >(null);

  const filteredTasks = MOCK_TASKS.filter((task) => {
    const matchesSearch = task.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || task.status === filterStatus;
    const matchesProject =
      filterProject === "all" || task.project === filterProject;
    return matchesSearch && matchesStatus && matchesProject;
  });

  // Stats
  const stats = {
    total: MOCK_TASKS.length,
    pending: MOCK_TASKS.filter((t) => t.status === "pending").length,
    inProgress: MOCK_TASKS.filter((t) => t.status === "in-progress").length,
    completed: MOCK_TASKS.filter((t) => t.status === "completed").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">📋 Công việc của tôi</h1>
            <p className="text-indigo-100">
              Quản lý và theo dõi tiến độ các task được giao
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex bg-white/10 rounded-lg p-1">
              {[
                { key: "list", icon: "☰", label: "List" },
                { key: "board", icon: "▦", label: "Board" },
                { key: "calendar", icon: "📅", label: "Calendar" },
              ].map((mode) => (
                <button
                  key={mode.key}
                  onClick={() => setViewMode(mode.key as typeof viewMode)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    viewMode === mode.key
                      ? "bg-white text-indigo-600"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  {mode.icon}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          {[
            {
              label: "Tổng task",
              value: stats.total,
              icon: "📊",
              color: "bg-white/10",
            },
            {
              label: "Chờ xử lý",
              value: stats.pending,
              icon: "⏳",
              color: "bg-yellow-500/20",
            },
            {
              label: "Đang làm",
              value: stats.inProgress,
              icon: "🔄",
              color: "bg-blue-500/20",
            },
            {
              label: "Hoàn thành",
              value: stats.completed,
              icon: "✅",
              color: "bg-green-500/20",
            },
          ].map((stat) => (
            <div key={stat.label} className={`${stat.color} rounded-xl p-4`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{stat.icon}</span>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-white/80">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Sidebar - Projects */}
        <div className="col-span-3">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="font-semibold text-gray-800 mb-4">📁 Dự án</h3>
            <div className="space-y-2">
              <button
                onClick={() => setFilterProject("all")}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                  filterProject === "all"
                    ? "bg-indigo-50 text-indigo-700"
                    : "hover:bg-gray-50 text-gray-600"
                }`}
              >
                <span className="font-medium">Tất cả dự án</span>
                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                  {MOCK_TASKS.length}
                </span>
              </button>
              {MOCK_PROJECTS.map((project) => (
                <button
                  key={project.id}
                  onClick={() => setFilterProject(project.name)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                    filterProject === project.name
                      ? "bg-indigo-50 text-indigo-700"
                      : "hover:bg-gray-50 text-gray-600"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={`w-3 h-3 rounded-full bg-${project.color}-500`}
                      style={{
                        backgroundColor:
                          project.color === "blue"
                            ? "#3b82f6"
                            : project.color === "green"
                            ? "#22c55e"
                            : "#a855f7",
                      }}
                    ></span>
                    <span className="font-medium text-sm">{project.name}</span>
                  </span>
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                    {project.taskCount}
                  </span>
                </button>
              ))}
            </div>

            {/* Project Progress */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <h4 className="text-sm font-medium text-gray-500 mb-3">
                Tiến độ dự án
              </h4>
              {MOCK_PROJECTS.map((project) => (
                <div key={project.id} className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700">
                      {project.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {project.progress}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${project.progress}%`,
                        backgroundColor:
                          project.color === "blue"
                            ? "#3b82f6"
                            : project.color === "green"
                            ? "#22c55e"
                            : "#a855f7",
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content - Tasks */}
        <div className="col-span-9">
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm task..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                <svg
                  className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="pending">Chờ xử lý</option>
                <option value="in-progress">Đang thực hiện</option>
                <option value="completed">Hoàn thành</option>
              </select>
            </div>
          </div>

          {/* Task List */}
          {viewMode === "list" && (
            <div className="space-y-3">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer border-l-4"
                  style={{
                    borderLeftColor:
                      task.priority === "high"
                        ? "#ef4444"
                        : task.priority === "medium"
                        ? "#eab308"
                        : "#22c55e",
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            statusConfig[task.status].color
                          }`}
                        >
                          {statusConfig[task.status].icon}{" "}
                          {statusConfig[task.status].label}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">
                          {task.project}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-800 mb-1">
                        {task.title}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-1">
                        {task.description}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-sm text-gray-500 mb-1">
                        📅 {task.dueDate}
                      </p>
                      <div className="flex items-center gap-1">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            priorityConfig[task.priority].dot
                          }`}
                        ></span>
                        <span
                          className={`text-xs ${
                            priorityConfig[task.priority].color
                          }`}
                        >
                          {priorityConfig[task.priority].label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {task.status !== "pending" && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500">Tiến độ</span>
                        <span className="text-xs font-medium text-gray-700">
                          {task.progress}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full transition-all"
                          style={{ width: `${task.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  <div className="flex items-center gap-2 mt-3">
                    {task.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                    <span className="ml-auto text-xs text-gray-400">
                      Giao bởi: {task.assignedBy}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Board View */}
          {viewMode === "board" && (
            <div className="grid grid-cols-3 gap-4">
              {["pending", "in-progress", "completed"].map((status) => (
                <div key={status} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        statusConfig[status as keyof typeof statusConfig].color
                      }`}
                    >
                      {statusConfig[status as keyof typeof statusConfig].icon}{" "}
                      {statusConfig[status as keyof typeof statusConfig].label}
                    </span>
                    <span className="text-xs text-gray-400">
                      ({filteredTasks.filter((t) => t.status === status).length}
                      )
                    </span>
                  </div>
                  <div className="space-y-3">
                    {filteredTasks
                      .filter((t) => t.status === status)
                      .map((task) => (
                        <div
                          key={task.id}
                          onClick={() => setSelectedTask(task)}
                          className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                        >
                          <h4 className="font-medium text-gray-800 text-sm mb-2">
                            {task.title}
                          </h4>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              {task.project}
                            </span>
                            <span
                              className={`w-2 h-2 rounded-full ${
                                priorityConfig[task.priority].dot
                              }`}
                            ></span>
                          </div>
                          {task.progress > 0 && (
                            <div className="h-1 bg-gray-100 rounded-full overflow-hidden mt-2">
                              <div
                                className="h-full bg-indigo-500 rounded-full"
                                style={{ width: `${task.progress}%` }}
                              ></div>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Calendar View Placeholder */}
          {viewMode === "calendar" && (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">📅</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Calendar View
              </h3>
              <p className="text-gray-500">
                Xem lịch công việc theo ngày/tuần/tháng
              </p>
              <p className="text-sm text-gray-400 mt-2">
                (Tính năng đang phát triển)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded text-xs font-medium ${
                    statusConfig[selectedTask.status].color
                  }`}
                >
                  {statusConfig[selectedTask.status].icon}{" "}
                  {statusConfig[selectedTask.status].label}
                </span>
                <span className="text-sm text-gray-500">
                  {selectedTask.project}
                </span>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <svg
                  className="w-5 h-5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                {selectedTask.title}
              </h2>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Độ ưu tiên</p>
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        priorityConfig[selectedTask.priority].dot
                      }`}
                    ></span>
                    <span
                      className={`font-medium ${
                        priorityConfig[selectedTask.priority].color
                      }`}
                    >
                      {priorityConfig[selectedTask.priority].label}
                    </span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Hạn chót</p>
                  <p className="font-medium text-gray-800">
                    📅 {selectedTask.dueDate}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Giao bởi</p>
                  <p className="font-medium text-gray-800">
                    {selectedTask.assignedBy}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Tiến độ</p>
                  <p className="font-medium text-gray-800">
                    {selectedTask.progress}%
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-2">Mô tả</h4>
                <p className="text-gray-600">{selectedTask.description}</p>
              </div>

              {/* Progress Update */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-2">
                  Cập nhật tiến độ
                </h4>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={selectedTask.progress}
                    className="flex-1"
                    readOnly
                  />
                  <span className="font-medium text-indigo-600">
                    {selectedTask.progress}%
                  </span>
                </div>
              </div>

              {/* Tags */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedTask.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-indigo-50 text-indigo-600 text-sm rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <button className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors">
                  Cập nhật tiến độ
                </button>
                <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors">
                  Thêm bình luận
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
