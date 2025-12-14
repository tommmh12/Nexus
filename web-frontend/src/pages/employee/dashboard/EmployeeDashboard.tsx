import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  FolderKanban,
  CheckCircle,
  Clock,
  MessageSquare,
  Newspaper,
  Calendar,
  TrendingUp,
  ArrowRight,
  Briefcase,
  Zap,
  Coffee,
  Sun,
  RefreshCw,
} from "lucide-react";
import { dashboardService } from "../../../services/dashboardService";
import { newsService, NewsArticle } from "../../../services/newsService";
import { projectService } from "../../../services/projectService";
import { bookingService } from "../../../services/bookingService";

// Types for Employee Dashboard
interface DashboardStats {
  pendingTasks: number;
  meetingsToday: number;
  hoursLogged: number;
  projectCount: number;
  efficiency: number;
  totalProjects: number;
  totalNews: number;
}

interface TaskItem {
  id: string;
  title: string;
  project: string;
  due: string;
  priority: "Low" | "Medium" | "High" | "Critical";
}

interface ScheduleItem {
  id: string;
  title: string;
  time: string;
  type: string;
  status: "Done" | "Upcoming" | "InProgress";
}

const EmployeeDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for real data
  const [stats, setStats] = useState<DashboardStats>({
    pendingTasks: 0,
    meetingsToday: 0,
    hoursLogged: 0,
    projectCount: 0,
    efficiency: 0,
    totalProjects: 0,
    totalNews: 0,
  });
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [userName, setUserName] = useState("Nhân viên");

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get user info from localStorage
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        setUserName(user.fullName || user.name || "Nhân viên");
      }

      // Fetch data in parallel
      const [overviewRes, projectsRes, newsRes, bookingsRes] =
        await Promise.allSettled([
          dashboardService.getOverview(),
          projectService.getProjects(),
          newsService.getPublicArticles(5, 0),
          bookingService.getBookings({
            date: new Date().toISOString().split("T")[0],
          }),
        ]);

      // Process overview stats
      if (overviewRes.status === "fulfilled") {
        const data = overviewRes.value;
        setStats((prev) => ({
          ...prev,
          pendingTasks: data.pendingTasks || data.tasks?.pending || 0,
          meetingsToday: data.meetingsToday || data.meetings?.today || 0,
          hoursLogged: data.hoursLogged || 8,
          efficiency: data.efficiency || 85,
          totalProjects: data.totalProjects || data.projects?.total || 0,
          totalNews: data.totalNews || 0,
        }));
      }

      // Process projects for tasks
      if (projectsRes.status === "fulfilled") {
        const projects = projectsRes.value || [];
        setStats((prev) => ({ ...prev, projectCount: projects.length }));

        // Extract tasks from projects (sample implementation)
        const extractedTasks: TaskItem[] = [];
        projects.slice(0, 3).forEach((project: any) => {
          if (project.tasks && Array.isArray(project.tasks)) {
            project.tasks.slice(0, 2).forEach((task: any) => {
              extractedTasks.push({
                id: task.id,
                title: task.title || task.name,
                project: project.name || project.title,
                due: formatDueDate(task.dueDate),
                priority: task.priority || "Medium",
              });
            });
          }
        });

        if (extractedTasks.length > 0) {
          setTasks(extractedTasks.slice(0, 5));
        } else {
          // Fallback: show project info as tasks
          setTasks(
            projects.slice(0, 3).map((p: any) => ({
              id: p.id,
              title: `Dự án: ${p.name || p.title}`,
              project: p.department || "Công việc",
              due: formatDueDate(p.endDate),
              priority: p.priority || "Medium",
            }))
          );
        }
      }

      // Process news
      if (newsRes.status === "fulfilled") {
        const newsData = newsRes.value || [];
        setNews(newsData.slice(0, 3));
        setStats((prev) => ({ ...prev, totalNews: newsData.length }));
      }

      // Process bookings for schedule
      if (bookingsRes.status === "fulfilled") {
        const bookings = bookingsRes.value || [];
        const today = new Date().toDateString();

        const todayBookings: ScheduleItem[] = bookings
          .filter((b: any) => new Date(b.startTime).toDateString() === today)
          .map((b: any) => ({
            id: b.id,
            title: b.title || b.purpose || "Cuộc họp",
            time: `${formatTime(b.startTime)} - ${formatTime(b.endTime)}`,
            type: b.roomName || b.meetingType || "Phòng họp",
            status: (new Date(b.startTime) > new Date()
              ? "Upcoming"
              : "Done") as ScheduleItem["status"],
          }));

        setSchedule(todayBookings);
        setStats((prev) => ({ ...prev, meetingsToday: todayBookings.length }));
      }
    } catch (err: any) {
      console.error("Error fetching dashboard data:", err);
      setError("Không thể tải dữ liệu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Helper functions
  const formatDueDate = (dateStr: string | undefined) => {
    if (!dateStr) return "Không xác định";
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return `Hôm nay, ${date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }
    if (date.toDateString() === tomorrow.toDateString()) {
      return "Ngày mai";
    }
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "Vừa xong";
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays === 1) return "Hôm qua";
    return `${diffDays} ngày trước`;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-100 border-t-indigo-600 mx-auto mb-6"></div>
          <p className="text-slate-500 font-medium animate-pulse">
            Đang tải dữ liệu...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <RefreshCw size={16} /> Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* 1. Modern Welcome Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 p-8 md:p-10 text-white shadow-2xl shadow-indigo-500/30 transition-all hover:shadow-indigo-500/40">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-80 w-80 rounded-full bg-fuchsia-500/20 blur-3xl animate-pulse"></div>

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-white/10 flex items-center gap-1">
                <Sun size={12} className="text-amber-300" /> Employee Portal
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight leading-tight">
              {getGreeting()},{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200">
                {userName}!
              </span>
            </h1>
            <p className="text-indigo-100 text-base md:text-lg leading-relaxed opacity-90">
              Bạn có{" "}
              <span className="font-bold text-white border-b-2 border-white/30">
                {stats.projectCount} dự án
              </span>{" "}
              đang thực hiện và{" "}
              <span className="font-bold text-white border-b-2 border-white/30">
                {stats.meetingsToday} cuộc họp
              </span>{" "}
              trong hôm nay.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <button
                onClick={() => navigate("/employee/projects")}
                className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-indigo-50 hover:scale-105 transition-all flex items-center gap-2"
              >
                Xem dự án <ArrowRight size={16} />
              </button>
              <button className="bg-indigo-500/30 backdrop-blur-md text-white border border-white/20 px-6 py-3 rounded-xl font-bold text-sm hover:bg-indigo-500/40 transition-all flex items-center gap-2">
                <Coffee size={18} /> Check-in
              </button>
            </div>
          </div>

          <div className="flex gap-4 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
            <div className="glass bg-white/10 p-5 rounded-2xl border border-white/20 text-center min-w-[120px] backdrop-blur-md hover:bg-white/15 transition-colors cursor-pointer flex-1 lg:flex-none">
              <div className="text-3xl font-bold mb-1">
                {stats.projectCount}
              </div>
              <div className="text-xs text-indigo-100 uppercase font-semibold tracking-wider">
                Dự án
              </div>
            </div>
            <div className="glass bg-white/10 p-5 rounded-2xl border border-white/20 text-center min-w-[120px] backdrop-blur-md hover:bg-white/15 transition-colors cursor-pointer flex-1 lg:flex-none">
              <div className="text-3xl font-bold mb-1">
                {stats.meetingsToday}
              </div>
              <div className="text-xs text-indigo-100 uppercase font-semibold tracking-wider">
                Họp hôm nay
              </div>
            </div>
            <div className="glass bg-white/10 p-5 rounded-2xl border border-white/20 text-center min-w-[120px] backdrop-blur-md hover:bg-white/15 transition-colors cursor-pointer flex-1 lg:flex-none">
              <div className="text-3xl font-bold mb-1">{stats.totalNews}</div>
              <div className="text-xs text-indigo-100 uppercase font-semibold tracking-wider">
                Tin tức
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 2. Left Column (2/3) - Tasks & Quick Actions */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Action Grid */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Zap size={20} className="text-amber-500" fill="currentColor" />{" "}
              Truy cập nhanh
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                {
                  icon: Calendar,
                  color: "text-blue-600",
                  bg: "bg-blue-50",
                  label: "Đặt phòng họp",
                  path: "/employee/booking",
                },
                {
                  icon: FolderKanban,
                  color: "text-violet-600",
                  bg: "bg-violet-50",
                  label: "Dự án của tôi",
                  path: "/employee/projects",
                },
                {
                  icon: CheckCircle,
                  color: "text-emerald-600",
                  bg: "bg-emerald-50",
                  label: "Cuộc họp",
                  path: "/employee/meetings",
                },
                {
                  icon: MessageSquare,
                  color: "text-rose-600",
                  bg: "bg-rose-50",
                  label: "Tin nhắn",
                  path: "/employee/chat",
                },
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => navigate(item.path)}
                  className="flex flex-col items-center justify-center gap-3 p-6 bg-white border border-slate-100 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-xl hover:border-indigo-100 hover:-translate-y-1 transition-all group"
                >
                  <div
                    className={`w-14 h-14 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm`}
                  >
                    <item.icon size={28} />
                  </div>
                  <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Projects/Tasks Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                  <Briefcase size={20} />
                </div>
                Dự án của tôi
              </h2>
              <button
                onClick={() => navigate("/employee/projects")}
                className="text-sm font-semibold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                Xem tất cả
              </button>
            </div>

            <div className="p-6 grid gap-4">
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className="group flex items-center gap-4 p-5 bg-white border border-slate-100 rounded-2xl hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
                  >
                    <div
                      className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                        task.priority === "High" || task.priority === "Critical"
                          ? "bg-rose-500"
                          : task.priority === "Medium"
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                      }`}
                    ></div>

                    <div className="p-2 rounded-full border border-slate-200 text-slate-300 group-hover:text-emerald-500 group-hover:border-emerald-500 transition-colors bg-slate-50">
                      <CheckCircle size={20} />
                    </div>

                    <div className="flex-1">
                      <h4 className="font-bold text-slate-800 text-base group-hover:text-indigo-700 transition-colors mb-1">
                        {task.title}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                        <span className="flex items-center gap-1">
                          <FolderKanban size={12} /> {task.project}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold border ${
                          task.due.includes("Hôm nay")
                            ? "bg-rose-50 text-rose-600 border-rose-100"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        {task.due}
                      </span>
                      <span
                        className={`text-[10px] uppercase font-bold tracking-wider ${
                          task.priority === "High" ||
                          task.priority === "Critical"
                            ? "text-rose-500"
                            : task.priority === "Medium"
                            ? "text-amber-500"
                            : "text-emerald-500"
                        }`}
                      >
                        {task.priority === "High" ||
                        task.priority === "Critical"
                          ? "Cao"
                          : task.priority === "Medium"
                          ? "Trung bình"
                          : "Thấp"}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <FolderKanban size={48} className="mx-auto mb-3 opacity-30" />
                  <p>Chưa có dự án nào</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. Right Column (1/3) - Schedule & News */}
        <div className="space-y-8">
          {/* Today's Schedule */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-500/10 to-transparent rounded-bl-full"></div>

            <div className="flex items-center justify-between mb-6 relative z-10">
              <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <Clock size={20} className="text-indigo-600" /> Lịch trình
              </h2>
              <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded-md text-slate-600">
                Hôm nay
              </span>
            </div>

            <div className="space-y-4 relative z-10">
              {schedule.length > 0 ? (
                schedule.map((item, idx) => (
                  <div key={item.id} className="flex gap-4 group">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-3 h-3 rounded-full border-2 border-white ring-2 ${
                          item.status === "Upcoming"
                            ? "bg-emerald-500 ring-emerald-100"
                            : "bg-slate-300 ring-slate-100"
                        }`}
                      ></div>
                      {idx !== schedule.length - 1 && (
                        <div className="w-0.5 h-full bg-slate-100 my-1"></div>
                      )}
                    </div>
                    <div className="flex-1 bg-slate-50 rounded-xl p-4 border border-slate-100 group-hover:border-indigo-200 group-hover:bg-white group-hover:shadow-sm transition-all">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-slate-800 text-sm">
                          {item.title}
                        </h4>
                        {item.status === "Upcoming" && (
                          <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-slate-500 mb-2">
                        {item.time}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 bg-white px-2 py-1 rounded-md border border-slate-200 w-fit">
                        {item.type.includes("Online") ? (
                          <Activity size={12} className="text-blue-500" />
                        ) : (
                          <Briefcase size={12} className="text-amber-500" />
                        )}
                        {item.type}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-400">
                  <Clock size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Không có lịch họp hôm nay</p>
                </div>
              )}

              <button
                onClick={() => navigate("/employee/booking")}
                className="w-full mt-2 py-2.5 rounded-xl text-xs font-bold text-slate-500 border-2 border-dashed border-slate-200 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
              >
                + Đặt phòng họp
              </button>
            </div>
          </div>

          {/* Company News */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <Newspaper size={20} className="text-rose-500" /> Tin tức mới
              </h2>
              <TrendingUp size={16} className="text-slate-400" />
            </div>

            <div className="space-y-5">
              {news.length > 0 ? (
                news.map((article) => (
                  <div
                    key={article.id}
                    className="flex gap-3 group cursor-pointer"
                    onClick={() => navigate(`/employee/news`)}
                  >
                    <div className="w-16 h-16 rounded-xl bg-slate-100 flex-shrink-0 overflow-hidden relative">
                      <img
                        src={
                          article.coverImage ||
                          "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=100&q=80"
                        }
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        alt=""
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded mb-1 inline-block">
                        {article.category}
                      </span>
                      <h4 className="text-sm font-bold text-slate-800 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
                        {article.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        {getTimeAgo(article.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-400">
                  <Newspaper size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Chưa có tin tức mới</p>
                </div>
              )}
            </div>
            <button
              onClick={() => navigate("/employee/news")}
              className="w-full mt-6 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
            >
              Xem tất cả tin tức
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
