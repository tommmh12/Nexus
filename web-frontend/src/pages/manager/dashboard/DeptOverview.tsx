import React, { useState, useEffect } from "react";
import {
  Users,
  Briefcase,
  CheckCircle,
  Clock,
  TrendingUp,
  Calendar,
  AlertCircle,
  UserCheck,
  FolderOpen,
  Target,
} from "lucide-react";

interface DepartmentStats {
  totalEmployees: number;
  activeEmployees: number;
  onLeave: number;
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  attendanceRate: number;
}

interface TeamMember {
  id: string;
  name: string;
  position: string;
  avatar?: string;
  status: "online" | "offline" | "busy" | "away";
  currentTask?: string;
}

interface RecentActivity {
  id: string;
  type: "task" | "project" | "attendance" | "leave";
  message: string;
  time: string;
  user: string;
}

export const DeptOverview: React.FC = () => {
  const [stats, setStats] = useState<DepartmentStats>({
    totalEmployees: 0,
    activeEmployees: 0,
    onLeave: 0,
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0,
    attendanceRate: 0,
  });
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [departmentName, setDepartmentName] = useState("Phòng ban của bạn");

  useEffect(() => {
    loadDepartmentData();
  }, []);

  const loadDepartmentData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("accessToken");

      // Fetch department stats
      const statsRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/manager/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("📊 Stats Response status:", statsRes.status);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        console.log("📊 Stats Data:", statsData);
        const data = statsData.data || statsData;
        // Map backend response to frontend interface
        setStats({
          totalEmployees: data.totalEmployees || 0,
          activeEmployees: data.totalEmployees || 0, // Assume all are active
          onLeave: data.onLeave || 0,
          totalProjects: data.activeProjects || 0,
          activeProjects: data.activeProjects || 0,
          completedProjects: data.completedProjects || 0,
          totalTasks: (data.completedTasks || 0) + (data.pendingTasks || 0),
          completedTasks: data.completedTasks || 0,
          pendingTasks: data.pendingTasks || 0,
          overdueTasks: data.overdueTasks || 0,
          attendanceRate: data.averageAttendance || data.attendanceRate || 0,
        });
        setDepartmentName(
          data.departmentName || statsData.departmentName || "Phòng ban của bạn"
        );
      } else {
        const errorData = await statsRes.json();
        console.error("❌ Stats API Error:", errorData);
      }

      // Fetch team members
      const teamRes = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/manager/employees`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (teamRes.ok) {
        const teamData = await teamRes.json();
        const employees = (teamData.data || teamData).slice(0, 6);
        // Map backend response to frontend interface
        setTeamMembers(
          employees.map((emp: any) => ({
            id: emp.id,
            name: emp.full_name || emp.name,
            position: emp.position || "Nhân viên",
            avatar: emp.avatar_url || emp.avatar,
            status: emp.status === "active" ? "online" : "offline",
            currentTask: emp.currentTask,
          }))
        );
      }

      // Fetch recent activities (mock for now)
      setRecentActivities([
        {
          id: "1",
          type: "task",
          message: "Hoàn thành task 'Báo cáo tháng 12'",
          time: "10 phút trước",
          user: "Nguyễn Văn A",
        },
        {
          id: "2",
          type: "project",
          message: "Dự án ABC chuyển sang giai đoạn Testing",
          time: "30 phút trước",
          user: "Trần Thị B",
        },
        {
          id: "3",
          type: "attendance",
          message: "Check-in lúc 8:30",
          time: "2 giờ trước",
          user: "Lê Văn C",
        },
        {
          id: "4",
          type: "leave",
          message: "Đã duyệt đơn xin nghỉ phép",
          time: "3 giờ trước",
          user: "Phạm Thị D",
        },
      ]);
    } catch (error) {
      console.error("❌ Error loading department data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard = ({
    icon: Icon,
    label,
    value,
    subValue,
    color,
    trend,
  }: {
    icon: any;
    label: string;
    value: string | number;
    subValue?: string;
    color: string;
    trend?: { value: number; up: boolean };
  }) => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div
          className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div
            className={`flex items-center text-sm ${trend.up ? "text-green-600" : "text-red-600"
              }`}
          >
            <TrendingUp
              className={`w-4 h-4 mr-1 ${!trend.up && "rotate-180"}`}
            />
            {trend.value}%
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-sm text-slate-500">{label}</p>
        {subValue && <p className="text-xs text-slate-400 mt-1">{subValue}</p>}
      </div>
    </div>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "busy":
        return "bg-red-500";
      case "away":
        return "bg-yellow-500";
      default:
        return "bg-slate-400";
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "task":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "project":
        return <FolderOpen className="w-4 h-4 text-blue-600" />;
      case "attendance":
        return <UserCheck className="w-4 h-4 text-purple-600" />;
      case "leave":
        return <Calendar className="w-4 h-4 text-orange-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-slate-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gradient-to-b from-slate-50 to-white min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Tổng quan Phòng ban
        </h1>
        <p className="text-slate-600">{departmentName}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={Users}
          label="Tổng nhân viên"
          value={stats.totalEmployees}
          subValue={`${stats.activeEmployees} đang hoạt động`}
          color="bg-blue-600"
        />
        <StatCard
          icon={FolderOpen}
          label="Dự án đang thực hiện"
          value={stats.activeProjects}
          subValue={`${stats.completedProjects} đã hoàn thành`}
          color="bg-purple-600"
        />
        <StatCard
          icon={Target}
          label="Công việc hoàn thành"
          value={`${stats.completedTasks}/${stats.totalTasks}`}
          subValue={`${stats.overdueTasks} quá hạn`}
          color="bg-green-600"
          trend={{ value: 12, up: true }}
        />
        <StatCard
          icon={UserCheck}
          label="Tỷ lệ chuyên cần"
          value={`${stats.attendanceRate}%`}
          subValue={`${stats.onLeave} đang nghỉ phép`}
          color="bg-orange-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Members */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Thành viên trong nhóm
            </h2>
            <span className="text-sm text-slate-500">
              {teamMembers.length} thành viên
            </span>
          </div>

          {teamMembers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-medium">
                      {member.avatar ? (
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        member.name.charAt(0)
                      )}
                    </div>
                    <div
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(
                        member.status
                      )}`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">
                      {member.name}
                    </p>
                    <p className="text-sm text-slate-500 truncate">
                      {member.position}
                    </p>
                  </div>
                  {member.currentTask && (
                    <div className="flex items-center text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      <Clock className="w-3 h-3 mr-1" />
                      Đang làm việc
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Chưa có thành viên</p>
            </div>
          )}
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">
            Hoạt động gần đây
          </h2>

          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-900">{activity.message}</p>
                  <p className="text-xs text-slate-500">
                    {activity.user} • {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Task Summary */}
      <div className="mt-6 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-6">
          Tình trạng công việc
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 rounded-lg bg-blue-50">
            <p className="text-3xl font-bold text-blue-600">
              {stats.totalTasks}
            </p>
            <p className="text-sm text-blue-700">Tổng công việc</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-green-50">
            <p className="text-3xl font-bold text-green-600">
              {stats.completedTasks}
            </p>
            <p className="text-sm text-green-700">Đã hoàn thành</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-yellow-50">
            <p className="text-3xl font-bold text-yellow-600">
              {stats.pendingTasks}
            </p>
            <p className="text-sm text-yellow-700">Đang thực hiện</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-red-50">
            <p className="text-3xl font-bold text-red-600">
              {stats.overdueTasks}
            </p>
            <p className="text-sm text-red-700">Quá hạn</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeptOverview;
