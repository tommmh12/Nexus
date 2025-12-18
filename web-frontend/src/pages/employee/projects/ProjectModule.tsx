import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  Search,
  FolderKanban,
  LayoutGrid,
  List,
  RefreshCw,
  AlertCircle,
  Clock,
  ChevronRight,
  ArrowLeft,
  Users,
  FileText,
  Kanban,
  ClipboardList,
  BarChart3,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useMyProjects } from "../../../hooks/useMyProjects";
import { Avatar } from "../../../components/ui/Avatar";
import { MyWorkTab } from "../../../components/projects/MyWorkTab";
import { SimpleKanbanBoard } from "../../../components/projects/SimpleKanbanBoard";
import { DocumentsTab } from "../../../components/projects/DocumentsTab";
import { MembersTab } from "../../../components/projects/MembersTab";
import { ReportsTab } from "../../../components/projects/ReportsTab";
import { authService } from "../../../services/authService";
import { taskService, TaskDetail } from "../../../services/taskService";
import { ProjectGridSkeleton } from "../../../components/ui/TaskSkeleton";
import { useSocket } from "../../../hooks/useSocket";

// --- Configuration ---
const THEME = {
  bg: "bg-gradient-to-br from-slate-50 via-white to-teal-50/30",
  card: "bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all border border-slate-100/50 backdrop-blur-sm",
  textPrimary: "text-slate-900",
  textSecondary: "text-slate-500",
  accent: "text-teal-600",
  buttonPrimary:
    "bg-gradient-to-r from-teal-600 to-teal-500 text-white hover:from-teal-700 hover:to-teal-600 rounded-xl font-semibold shadow-lg shadow-teal-500/25",
  buttonGhost:
    "bg-white/80 text-slate-600 hover:bg-white hover:shadow-md rounded-xl border border-slate-200/50",
};

type ViewMode = "grid" | "list";
type StatusFilter = "all" | "Active" | "Completed" | "OnHold";
type ProjectTab =
  | "overview"
  | "my-work"
  | "board"
  | "documents"
  | "reports"
  | "members";

const ProjectModule: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const { projects, loading, error, refetch, getProjectTasks } =
    useMyProjects();
  const { isConnected } = useSocket();
  const currentUser = authService.getStoredUser();

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  // Project Detail State
  const [activeTab, setActiveTab] = useState<ProjectTab>("my-work");
  const [projectTasks, setProjectTasks] = useState<TaskDetail[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);

  // Find active project if ID exists
  const activeProject = useMemo(
    () => (id ? projects.find((p) => p.id === id) : null),
    [id, projects]
  );

  // Initialize tab from URL hash
  useEffect(() => {
    const hash = location.hash.replace("#", "");
    if (
      hash &&
      ["overview", "my-work", "board", "documents", "members"].includes(hash)
    ) {
      setActiveTab(hash as ProjectTab);
    }
  }, [location.hash]);

  // Load tasks when project changes
  useEffect(() => {
    if (id && activeProject) {
      setLoadingTasks(true);
      getProjectTasks(id)
        .then((tasks) => setProjectTasks(tasks))
        .finally(() => setLoadingTasks(false));
    }
  }, [id, activeProject, getProjectTasks]);

  // Update URL when tab changes
  const handleTabChange = (tab: ProjectTab) => {
    setActiveTab(tab);
    navigate(`/employee/projects/${id}#${tab}`, { replace: true });
  };

  // Stats
  const stats = useMemo(
    () => ({
      total: projects.length,
      active: projects.filter((p) => p.status === "Active").length,
      completed: projects.filter((p) => p.status === "Completed").length,
    }),
    [projects]
  );

  // Filter
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch = p.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [projects, searchTerm, statusFilter]);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("vi-VN", { month: "short", day: "numeric" });

  // Calculate my task count for the project
  const myTaskCount = useMemo(() => {
    if (!currentUser) return 0;
    return projectTasks.filter(
      (t) =>
        t.assignees?.some((a) => a.id === currentUser.id) ||
        (t as any).assignee_ids?.includes(currentUser.id)
    ).length;
  }, [projectTasks, currentUser]);

  // Loading state with skeleton
  if (loading)
    return (
      <div className={`min-h-screen ${THEME.bg} p-6 font-sans text-slate-800`}>
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header skeleton */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="h-8 bg-slate-200 rounded w-48 animate-pulse mb-2" />
              <div className="h-4 bg-slate-100 rounded w-64 animate-pulse" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-24 bg-slate-200 rounded-xl animate-pulse" />
              <div className="h-10 w-10 bg-slate-200 rounded-xl animate-pulse" />
            </div>
          </div>
          {/* Filter skeleton */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="h-12 bg-slate-200 rounded-xl flex-1 animate-pulse" />
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-10 w-24 bg-slate-200 rounded-xl animate-pulse"
                />
              ))}
            </div>
          </div>
          {/* Grid skeleton */}
          <ProjectGridSkeleton count={6} />
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center py-20 text-red-500">
        <AlertCircle className="mb-2" size={32} />
        <p>{error}</p>
        <button onClick={() => refetch()} className="mt-4 underline">
          Thử lại
        </button>
      </div>
    );

  // --- DETAIL VIEW ---
  if (id && activeProject) {
    const tabs: {
      id: ProjectTab;
      label: string;
      icon: React.ReactNode;
      badge?: number;
    }[] = [
      { id: "overview", label: "Tổng quan", icon: <FolderKanban size={16} /> },
      {
        id: "my-work",
        label: "Việc của tôi",
        icon: <ClipboardList size={16} />,
        badge: myTaskCount,
      },
      { id: "board", label: "Bảng công việc", icon: <Kanban size={16} /> },
      { id: "documents", label: "Tài liệu", icon: <FileText size={16} /> },
      { id: "reports", label: "Báo cáo", icon: <BarChart3 size={16} /> },
      { id: "members", label: "Thành viên", icon: <Users size={16} /> },
    ];

    return (
      <div className={`min-h-screen ${THEME.bg} p-6 font-sans text-slate-800`}>
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Nav Back */}
          <button
            onClick={() => navigate("/employee/projects")}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium transition-colors"
          >
            <ArrowLeft size={20} /> Quay lại danh sách dự án
          </button>

          {/* Header Card */}
          <div className={`${THEME.card} p-6 lg:p-8`}>
            <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  {(() => {
                    // Determine display status - override with Completed if progress is 100%
                    const displayStatus =
                      activeProject.progress >= 100
                        ? "Completed"
                        : activeProject.status;

                    const statusConfig: Record<
                      string,
                      { bg: string; text: string; label: string }
                    > = {
                      Active: {
                        bg: "bg-brand-50 text-brand-600",
                        text: "Đang hoạt động",
                        label: "Active",
                      },
                      Completed: {
                        bg: "bg-green-50 text-green-600",
                        text: "Hoàn thành",
                        label: "Completed",
                      },
                      Planning: {
                        bg: "bg-amber-50 text-amber-600",
                        text: "Đang lên kế hoạch",
                        label: "Planning",
                      },
                      OnHold: {
                        bg: "bg-slate-100 text-slate-500",
                        text: "Tạm dừng",
                        label: "OnHold",
                      },
                    };

                    const config =
                      statusConfig[displayStatus] || statusConfig["Active"];

                    return (
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${config.bg}`}
                      >
                        {config.text}
                      </span>
                    );
                  })()}
                  {(activeProject.startDate || activeProject.endDate) && (
                    <span className="text-slate-400 text-sm font-medium flex items-center gap-1">
                      <Clock size={14} />
                      {activeProject.startDate
                        ? formatDate(activeProject.startDate)
                        : "N/A"}{" "}
                      -{" "}
                      {activeProject.endDate
                        ? formatDate(activeProject.endDate)
                        : "N/A"}
                    </span>
                  )}
                </div>
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2">
                  {activeProject.name}
                </h1>
                <p className="text-slate-500 max-w-2xl">
                  {activeProject.description || "Không có mô tả"}
                </p>
              </div>

              <div className="text-center lg:text-right">
                <div className="text-3xl font-bold text-brand-600">
                  {activeProject.progress}%
                </div>
                <div className="text-slate-400 text-sm font-medium uppercase">
                  Tiến độ
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="h-2 bg-slate-100 rounded-full mt-6 overflow-hidden">
              <div
                className="h-full bg-brand-500 rounded-full transition-all duration-500"
                style={{ width: `${activeProject.progress}%` }}
              />
            </div>

            {/* Members */}
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {activeProject.members.slice(0, 5).map((m) => (
                    <Avatar
                      key={m.id}
                      name={m.name}
                      src={m.avatarUrl}
                      size="sm"
                      className="border-2 border-white"
                    />
                  ))}
                  {activeProject.members.length > 5 && (
                    <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-xs font-bold text-slate-600">
                      +{activeProject.members.length - 5}
                    </div>
                  )}
                </div>
                <span className="text-slate-500 text-sm font-medium">
                  {activeProject.members.length} thành viên
                </span>
              </div>

              <div className="text-sm text-slate-500">
                <span className="font-medium text-slate-700">
                  {activeProject.taskCount || 0}
                </span>{" "}
                công việc •
                <span className="font-medium text-slate-700 ml-1">
                  {activeProject.completedTaskCount || 0}
                </span>{" "}
                đã xong
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl border border-slate-100 p-1.5 flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-brand-50 text-brand-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className={`ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold ${
                      activeTab === tab.id
                        ? "bg-brand-200 text-brand-800"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className={`${THEME.card} p-6`}>
            {activeTab === "overview" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-900">
                  Tổng quan dự án
                </h2>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-2xl font-bold text-slate-900">
                      {activeProject.taskCount || 0}
                    </div>
                    <div className="text-sm text-slate-500">Tổng công việc</div>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4">
                    <div className="text-2xl font-bold text-green-600">
                      {activeProject.completedTaskCount || 0}
                    </div>
                    <div className="text-sm text-slate-500">Đã hoàn thành</div>
                  </div>
                  <div className="bg-brand-50 rounded-xl p-4">
                    <div className="text-2xl font-bold text-brand-600">
                      {myTaskCount}
                    </div>
                    <div className="text-sm text-slate-500">Việc của tôi</div>
                  </div>
                  <div className="bg-orange-50 rounded-xl p-4">
                    <div className="text-2xl font-bold text-orange-600">
                      {activeProject.members.length}
                    </div>
                    <div className="text-sm text-slate-500">Thành viên</div>
                  </div>
                </div>

                <div className="pt-4">
                  <p className="text-slate-600 leading-relaxed">
                    {activeProject.description ||
                      "Dự án này chưa có mô tả chi tiết."}
                  </p>
                </div>
              </div>
            )}

            {activeTab === "my-work" && currentUser && (
              <MyWorkTab
                projectId={id}
                currentUserId={currentUser.id}
                onTaskClick={(task) => {
                  // TODO: Open task detail panel
                  console.log("Task clicked:", task);
                }}
              />
            )}

            {activeTab === "board" && currentUser && (
              <SimpleKanbanBoard
                projectId={id}
                currentUserId={currentUser.id}
                canDragTasks={false}
                onTaskClick={(task) => {
                  console.log("Task clicked from board:", task);
                }}
              />
            )}

            {activeTab === "documents" && (
              <DocumentsTab projectId={id} canUpload={true} canDelete={false} />
            )}

            {activeTab === "reports" && currentUser && (
              <ReportsTab
                projectId={id}
                currentUserId={currentUser.id}
                currentUserName={currentUser.full_name || currentUser.email}
                canSubmitReport={true}
                canReviewReports={false}
              />
            )}

            {activeTab === "members" && currentUser && (
              <MembersTab
                projectId={id}
                currentUserId={currentUser.id}
                canAddMembers={false}
                canRemoveMembers={false}
              />
            )}
          </div>
        </div>
      </div>
    );
  } else if (id && !activeProject && !loading) {
    // 404 Case
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
        <FolderKanban size={64} className="text-slate-300 mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Không tìm thấy dự án
        </h2>
        <p className="text-slate-500 mb-6">
          Dự án không tồn tại hoặc bạn không có quyền truy cập.
        </p>
        <button
          onClick={() => navigate("/employee/projects")}
          className={THEME.buttonPrimary + " px-6 py-3"}
        >
          Quay lại danh sách dự án
        </button>
      </div>
    );
  }

  // --- LIST VIEW ---
  return (
    <div className={`min-h-screen ${THEME.bg} p-6 font-sans text-slate-800`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/30">
              <FolderKanban className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 flex items-center gap-3">
                Dự án của tôi
                {/* Realtime connection indicator */}
                <span
                  className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
                    isConnected
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                      : "bg-slate-100 text-slate-400 border border-slate-200"
                  }`}
                >
                  {isConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
                  {isConnected ? "Live" : "Offline"}
                </span>
              </h1>
              <p className="text-slate-500 mt-0.5 font-medium">
                Bạn đang tham gia{" "}
                <span className="text-teal-600 font-bold">{stats.active}</span>{" "}
                dự án đang hoạt động
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white p-1.5 rounded-xl shadow-sm border border-slate-200/50 flex">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2.5 rounded-lg transition-all ${
                  viewMode === "grid"
                    ? "bg-teal-50 text-teal-600 shadow-sm"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <LayoutGrid size={20} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2.5 rounded-lg transition-all ${
                  viewMode === "list"
                    ? "bg-teal-50 text-teal-600 shadow-sm"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <List size={20} />
              </button>
            </div>
            <button
              onClick={() => refetch()}
              className={`${THEME.buttonGhost} p-3`}
            >
              <RefreshCw size={20} />
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100/50 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                <FolderKanban size={20} className="text-slate-500" />
              </div>
              <span className="text-2xl font-bold text-slate-900">
                {stats.total}
              </span>
            </div>
            <p className="text-sm text-slate-500 font-medium">Tổng dự án</p>
          </div>
          <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl p-5 shadow-lg shadow-teal-500/25 text-white">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Clock size={20} className="text-white" />
              </div>
              <span className="text-2xl font-bold">{stats.active}</span>
            </div>
            <p className="text-sm text-teal-100 font-medium">Đang hoạt động</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100/50 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <FolderKanban size={20} className="text-emerald-600" />
              </div>
              <span className="text-2xl font-bold text-emerald-600">
                {stats.completed}
              </span>
            </div>
            <p className="text-sm text-slate-500 font-medium">Hoàn thành</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100/50 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <Users size={20} className="text-amber-600" />
              </div>
              <span className="text-2xl font-bold text-slate-900">
                {projects.reduce((sum, p) => sum + p.members.length, 0)}
              </span>
            </div>
            <p className="text-sm text-slate-500 font-medium">Thành viên</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-200/50 flex items-center gap-2 flex-1">
            <div className="pl-3 text-slate-400">
              <Search size={20} />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm dự án..."
              className="flex-1 py-2.5 px-2 outline-none text-slate-700 placeholder:text-slate-400 font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">
            {[
              { value: "all", label: "Tất cả" },
              { value: "Active", label: "Đang làm" },
              { value: "Completed", label: "Xong" },
              { value: "OnHold", label: "Tạm dừng" },
            ].map((status) => (
              <button
                key={status.value}
                onClick={() => setStatusFilter(status.value as StatusFilter)}
                className={`px-5 py-2.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                  statusFilter === status.value
                    ? "bg-gradient-to-r from-teal-600 to-teal-500 text-white shadow-lg shadow-teal-500/25"
                    : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200/50 hover:border-teal-200"
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid View */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => navigate(`/employee/projects/${project.id}`)}
                className={`${THEME.card} p-5 cursor-pointer group flex flex-col h-full hover:border-teal-200`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold shadow-lg ${
                      project.status === "Active"
                        ? "bg-gradient-to-br from-teal-400 to-teal-600 text-white shadow-teal-500/30"
                        : project.status === "Completed"
                        ? "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-emerald-500/30"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {project.name.charAt(0)}
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      project.status === "Active"
                        ? "bg-teal-50 text-teal-600 border border-teal-200"
                        : project.status === "Completed"
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                        : "bg-slate-100 text-slate-500 border border-slate-200"
                    }`}
                  >
                    {project.status === "Active"
                      ? "🔥 Hoạt động"
                      : project.status === "Completed"
                      ? "✅ Xong"
                      : project.status}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-1.5 group-hover:text-teal-600 transition-colors line-clamp-1">
                  {project.name}
                </h3>
                <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1">
                  {project.description || "Chưa có mô tả"}
                </p>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs font-medium text-slate-500 mb-1.5">
                    <span>Tiến độ</span>
                    <span
                      className={`font-bold ${
                        project.progress >= 100
                          ? "text-emerald-600"
                          : "text-teal-600"
                      }`}
                    >
                      {project.progress}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        project.progress >= 100
                          ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
                          : "bg-gradient-to-r from-teal-400 to-teal-500"
                      }`}
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex -space-x-2">
                    {project.members.slice(0, 3).map((m) => (
                      <Avatar
                        key={m.id}
                        name={m.name}
                        src={m.avatarUrl}
                        size="sm"
                        className="border-2 border-white shadow-sm"
                      />
                    ))}
                    {project.members.length > 3 && (
                      <div className="w-7 h-7 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500">
                        +{project.members.length - 3}
                      </div>
                    )}
                  </div>
                  <div className="text-xs font-medium text-slate-400 flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg">
                    <Clock size={12} /> {formatDate(project.endDate)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* List View */}
        {viewMode === "list" && (
          <div className="space-y-3">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => navigate(`/employee/projects/${project.id}`)}
                className={`${THEME.card} p-5 flex items-center gap-5 cursor-pointer group hover:border-teal-200`}
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center font-bold text-white text-xl shadow-lg ${
                    project.status === "Active"
                      ? "bg-gradient-to-br from-teal-400 to-teal-600 shadow-teal-500/30"
                      : project.status === "Completed"
                      ? "bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-500/30"
                      : "bg-slate-300"
                  }`}
                >
                  {project.name.charAt(0)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-slate-900 truncate group-hover:text-teal-600 transition-colors">
                      {project.name}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        project.status === "Active"
                          ? "bg-teal-50 text-teal-600"
                          : project.status === "Completed"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {project.status === "Active"
                        ? "Hoạt động"
                        : project.status === "Completed"
                        ? "Xong"
                        : project.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 truncate">
                    {project.description || "Chưa có mô tả"}
                  </p>
                </div>

                <div className="hidden md:block w-40">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Tiến độ</span>
                    <span className="font-bold text-teal-600">
                      {project.progress}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-teal-400 to-teal-500 rounded-full"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                <div className="hidden sm:flex -space-x-2">
                  {project.members.slice(0, 3).map((m) => (
                    <Avatar
                      key={m.id}
                      name={m.name}
                      src={m.avatarUrl}
                      size="sm"
                      className="border-2 border-white shadow-sm"
                    />
                  ))}
                </div>

                <div className="p-2 rounded-xl bg-teal-50 text-teal-600 opacity-0 group-hover:opacity-100 transition-all">
                  <ChevronRight size={20} />
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredProjects.length === 0 && (
          <div className="text-center py-20 bg-white/50 rounded-3xl border border-dashed border-slate-200">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
              <FolderKanban size={40} className="text-slate-300" />
            </div>
            <h3 className="font-bold text-slate-700 mb-2 text-lg">
              Không tìm thấy dự án
            </h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              {searchTerm || statusFilter !== "all"
                ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
                : "Bạn chưa được gán vào dự án nào. Liên hệ quản lý để tham gia."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectModule;
