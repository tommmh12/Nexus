import React, { useEffect, useState } from "react";
import {
  Users,
  Activity,
  FolderKanban,
  CheckCircle,
  Clock,
  MessageSquare,
  Newspaper,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { dashboardService } from "../../services/dashboardService";

interface DashboardStats {
  totalUsers: number;
  totalProjects: number;
  totalTasks: number;
  totalDepartments: number;
  activeProjects: number;
  completedTasks: number;
  pendingTasks: number;
  totalForumPosts: number;
  totalNewsArticles: number;
  upcomingEvents: number;
}

interface RecentActivity {
  id: string;
  userName: string;
  userAvatar: string;
  type: string;
  content: string;
  createdAt: string;
}

interface Project {
  id: string;
  code: string;
  name: string;
  status: string;
  priority: string;
  progress: number;
  managerName: string;
  departmentName?: string;
}

interface ProjectsByDepartment {
  [departmentName: string]: Project[];
}

interface Task {
  id: string;
  title: string;
  projectName: string;
  status: string;
  priority: string;
  dueDate: string;
}

export const Overview = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(
    []
  );
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsByDepartment, setProjectsByDepartment] =
    useState<ProjectsByDepartment>({});
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await dashboardService.getOverview();
      if (response.success) {
        setStats(response.data.stats);
        setRecentActivities(response.data.recentActivities);
        setProjects(response.data.projectsProgress);
        setProjectsByDepartment(response.data.projectsByDepartment || {});
        setTasks(response.data.tasksSummary);
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-500">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical":
        return "text-red-600 bg-red-50";
      case "High":
        return "text-orange-600 bg-orange-50";
      case "Medium":
        return "text-yellow-600 bg-yellow-50";
      case "Low":
        return "text-green-600 bg-green-50";
      default:
        return "text-slate-600 bg-slate-50";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Done":
        return "text-green-600 bg-green-50";
      case "In Progress":
        return "text-blue-600 bg-blue-50";
      case "Planning":
        return "text-purple-600 bg-purple-50";
      default:
        return "text-slate-600 bg-slate-50";
    }
  };

  return (
    <div className="animate-fadeIn">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Tổng quan hệ thống
        </h1>
        <p className="text-slate-500 mt-1">
          Cập nhật lúc: {new Date().toLocaleTimeString("vi-VN")}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-500 text-sm font-medium">
              Tổng nhân sự
            </span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Users size={20} />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mb-1">
            {stats?.totalUsers || 0}
          </div>
          <div className="text-xs text-slate-500 font-medium">
            {stats?.totalDepartments || 0} phòng ban
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-500 text-sm font-medium">Dự án</span>
            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
              <FolderKanban size={20} />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mb-1">
            {stats?.totalProjects || 0}
          </div>
          <div className="text-xs text-green-600 font-medium">
            {stats?.activeProjects || 0} đang thực hiện
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-500 text-sm font-medium">Tasks</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <CheckCircle size={20} />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mb-1">
            {stats?.totalTasks || 0}
          </div>
          <div className="text-xs text-slate-500 font-medium">
            <div className="flex justify-between mt-2">
              <span className="text-green-600">
                {stats?.completedTasks || 0} hoàn thành
              </span>
              <span className="text-orange-600">
                {stats?.pendingTasks || 0} đang làm
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-500 text-sm font-medium">
              Hoạt động
            </span>
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
              <Activity size={20} />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mb-1">
            {stats?.totalForumPosts || 0}
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Bài viết diễn đàn
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <Newspaper className="text-blue-600" size={24} />
            <TrendingUp className="text-blue-500" size={18} />
          </div>
          <div className="text-2xl font-bold text-blue-900">
            {stats?.totalNewsArticles || 0}
          </div>
          <div className="text-sm text-blue-700 mt-1">Tin tức đã đăng</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="text-green-600" size={24} />
            <Clock className="text-green-500" size={18} />
          </div>
          <div className="text-2xl font-bold text-green-900">
            {stats?.upcomingEvents || 0}
          </div>
          <div className="text-sm text-green-700 mt-1">Sự kiện sắp tới</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <MessageSquare className="text-purple-600" size={24} />
            <Activity className="text-purple-500" size={18} />
          </div>
          <div className="text-2xl font-bold text-purple-900">
            {recentActivities.length}
          </div>
          <div className="text-sm text-purple-700 mt-1">Hoạt động gần đây</div>
        </div>
      </div>

      {/* Projects and Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Active Projects */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
            <FolderKanban size={18} className="mr-2 text-slate-400" />
            Dự án đang thực hiện
          </h3>
          <div className="space-y-4">
            {projects.slice(0, 5).map((project) => (
              <div
                key={project.id}
                className="border-l-4 border-blue-500 pl-4 py-2 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-slate-500">
                        {project.code}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(
                          project.status
                        )}`}
                      >
                        {project.status}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(
                          project.priority
                        )}`}
                      >
                        {project.priority}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-900">
                      {project.name}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Quản lý: {project.managerName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-medium text-slate-600">
                    {project.progress}%
                  </span>
                </div>
              </div>
            ))}
            {projects.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <FolderKanban size={48} className="mx-auto mb-2 opacity-50" />
                <p>Chưa có dự án nào</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
            <Activity size={18} className="mr-2 text-slate-400" />
            Hoạt động gần đây
          </h3>
          <div className="space-y-4">
            {recentActivities.slice(0, 8).map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 hover:bg-slate-50 p-2 rounded transition-colors"
              >
                <img
                  src={
                    activity.userAvatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      activity.userName
                    )}`
                  }
                  alt={activity.userName}
                  className="w-10 h-10 rounded-full flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-900">
                    <span className="font-medium">{activity.userName}</span>{" "}
                    <span className="text-slate-600">{activity.content}</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {new Date(activity.createdAt).toLocaleString("vi-VN")}
                  </p>
                </div>
              </div>
            ))}
            {recentActivities.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <Activity size={48} className="mx-auto mb-2 opacity-50" />
                <p>Chưa có hoạt động nào</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Projects by Department */}
      {Object.keys(projectsByDepartment).length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
          <h3 className="font-semibold text-slate-900 mb-6 flex items-center">
            <FolderKanban size={18} className="mr-2 text-slate-400" />
            Dự án theo Phòng ban
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.entries(projectsByDepartment).map(
              ([deptName, deptProjects]) => (
                <div
                  key={deptName}
                  className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <h4 className="font-semibold text-slate-800 mb-3 pb-2 border-b border-slate-200 flex items-center justify-between">
                    <span>{deptName}</span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      {deptProjects.length} dự án
                    </span>
                  </h4>
                  <div className="space-y-3">
                    {deptProjects.map((project: Project) => (
                      <div
                        key={project.id}
                        className="border-l-4 border-blue-500 pl-3 py-2 hover:bg-slate-50 transition-colors rounded-r"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                {project.code}
                              </span>
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(
                                  project.status
                                )}`}
                              >
                                {project.status}
                              </span>
                              {project.priority && (
                                <span
                                  className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(
                                    project.priority
                                  )}`}
                                >
                                  {project.priority}
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-medium text-slate-900">
                              {project.name}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              Quản lý: {project.managerName || "Chưa có"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-100 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full transition-all"
                              style={{ width: `${project.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-medium text-slate-600">
                            {project.progress}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Tasks Summary */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
          <CheckCircle size={18} className="mr-2 text-slate-400" />
          Tasks cần xử lý
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase">
                  Task
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase">
                  Dự án
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase">
                  Trạng thái
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase">
                  Ưu tiên
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase">
                  Hạn
                </th>
              </tr>
            </thead>
            <tbody>
              {tasks.slice(0, 10).map((task) => (
                <tr
                  key={task.id}
                  className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <td className="py-3 px-4">
                    <p className="text-sm font-medium text-slate-900">
                      {task.title}
                    </p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-sm text-slate-600">{task.projectName}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                        task.status
                      )}`}
                    >
                      {task.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(
                        task.priority
                      )}`}
                    >
                      {task.priority}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-sm text-slate-600">
                      {task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString("vi-VN")
                        : "-"}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {tasks.length === 0 && (
            <div className="text-center py-8 text-slate-400">
              <CheckCircle size={48} className="mx-auto mb-2 opacity-50" />
              <p>Chưa có task nào</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
