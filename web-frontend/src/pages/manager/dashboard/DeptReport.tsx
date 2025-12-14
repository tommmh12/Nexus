import React, { useState, useEffect } from "react";
import {
  FileText,
  Download,
  Calendar,
  Users,
  Briefcase,
  Clock,
  TrendingUp,
  Filter,
  Printer,
  Mail,
  CheckCircle,
} from "lucide-react";

interface ReportData {
  departmentName: string;
  period: string;
  generatedAt: string;
  summary: {
    totalEmployees: number;
    activeProjects: number;
    completedTasks: number;
    totalTasks: number;
    attendanceRate: number;
    avgWorkHours: number;
  };
  employeePerformance: {
    id: string;
    name: string;
    position: string;
    tasksCompleted: number;
    tasksTotal: number;
    attendanceRate: number;
    rating: number;
  }[];
  projectStatus: {
    id: string;
    name: string;
    status: string;
    progress: number;
    deadline: string;
    members: number;
  }[];
}

export const DeptReport: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [reportType, setReportType] = useState<
    "weekly" | "monthly" | "quarterly"
  >("monthly");
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [exportFormat, setExportFormat] = useState<"pdf" | "excel" | "csv">(
    "pdf"
  );

  const generateReport = async () => {
    setIsGenerating(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `http://localhost:5000/api/manager/reports/generate?type=${reportType}&startDate=${dateRange.start}&endDate=${dateRange.end}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setReportData(data.data || data);
      } else {
        // Mock data for demo
        setReportData({
          departmentName: "Phòng Phát triển Phần mềm",
          period: `${dateRange.start} - ${dateRange.end}`,
          generatedAt: new Date().toLocaleString("vi-VN"),
          summary: {
            totalEmployees: 15,
            activeProjects: 5,
            completedTasks: 142,
            totalTasks: 180,
            attendanceRate: 94.5,
            avgWorkHours: 8.2,
          },
          employeePerformance: [
            {
              id: "1",
              name: "Nguyễn Văn A",
              position: "Senior Developer",
              tasksCompleted: 25,
              tasksTotal: 28,
              attendanceRate: 98,
              rating: 4.8,
            },
            {
              id: "2",
              name: "Trần Thị B",
              position: "UI/UX Designer",
              tasksCompleted: 18,
              tasksTotal: 20,
              attendanceRate: 95,
              rating: 4.5,
            },
            {
              id: "3",
              name: "Lê Văn C",
              position: "Junior Developer",
              tasksCompleted: 15,
              tasksTotal: 18,
              attendanceRate: 92,
              rating: 4.2,
            },
            {
              id: "4",
              name: "Phạm Thị D",
              position: "QA Engineer",
              tasksCompleted: 22,
              tasksTotal: 25,
              attendanceRate: 96,
              rating: 4.6,
            },
          ],
          projectStatus: [
            {
              id: "1",
              name: "Dự án Portal Nội bộ",
              status: "In Progress",
              progress: 75,
              deadline: "2025-01-15",
              members: 8,
            },
            {
              id: "2",
              name: "App Mobile HR",
              status: "In Progress",
              progress: 45,
              deadline: "2025-02-28",
              members: 5,
            },
            {
              id: "3",
              name: "API Integration",
              status: "Completed",
              progress: 100,
              deadline: "2024-12-10",
              members: 3,
            },
          ],
        });
      }
    } catch (error) {
      console.error("Error generating report:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = async () => {
    if (!reportData) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `http://localhost:5000/api/manager/reports/export?format=${exportFormat}&type=${reportType}&startDate=${dateRange.start}&endDate=${dateRange.end}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `bao-cao-phong-ban-${reportType}-${dateRange.start}.${exportFormat}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      } else {
        alert("Chức năng xuất báo cáo đang được phát triển.");
      }
    } catch (error) {
      console.error("Error exporting report:", error);
      alert("Chức năng xuất báo cáo đang được phát triển.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSendEmail = async () => {
    alert("Chức năng gửi email báo cáo đang được phát triển.");
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "in progress":
        return "bg-blue-100 text-blue-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="p-8 bg-gradient-to-b from-slate-50 to-white min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Xuất Báo cáo Phòng ban
        </h1>
        <p className="text-slate-600">
          Tạo và xuất các báo cáo tổng hợp về hoạt động phòng ban
        </p>
      </div>

      {/* Filter Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Loại báo cáo
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="weekly">Tuần</option>
              <option value="monthly">Tháng</option>
              <option value="quarterly">Quý</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Từ ngày
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange({ ...dateRange, start: e.target.value })
              }
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Đến ngày
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange({ ...dateRange, end: e.target.value })
              }
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            onClick={generateReport}
            disabled={isGenerating}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Đang tạo...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                Tạo báo cáo
              </>
            )}
          </button>
        </div>
      </div>

      {/* Report Content */}
      {reportData ? (
        <div className="space-y-6 print:space-y-4" id="report-content">
          {/* Report Header */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 print:shadow-none print:border-none">
            <div className="flex items-center justify-between mb-4 print:mb-2">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {reportData.departmentName}
                </h2>
                <p className="text-slate-600">
                  Kỳ báo cáo: {reportData.period}
                </p>
                <p className="text-sm text-slate-500">
                  Ngày tạo: {reportData.generatedAt}
                </p>
              </div>
              <div className="flex gap-2 print:hidden">
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value as any)}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                >
                  <option value="pdf">PDF</option>
                  <option value="excel">Excel</option>
                  <option value="csv">CSV</option>
                </select>
                <button
                  onClick={handleExport}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                >
                  <Download className="w-4 h-4" />
                  Xuất file
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-sm"
                >
                  <Printer className="w-4 h-4" />
                  In
                </button>
                <button
                  onClick={handleSendEmail}
                  className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-sm"
                >
                  <Mail className="w-4 h-4" />
                  Gửi email
                </button>
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 print:shadow-none print:border-none">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Tổng quan
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Users className="w-6 h-6 mx-auto text-blue-600 mb-2" />
                <p className="text-2xl font-bold text-blue-600">
                  {reportData.summary.totalEmployees}
                </p>
                <p className="text-xs text-blue-700">Nhân viên</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Briefcase className="w-6 h-6 mx-auto text-purple-600 mb-2" />
                <p className="text-2xl font-bold text-purple-600">
                  {reportData.summary.activeProjects}
                </p>
                <p className="text-xs text-purple-700">Dự án</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <CheckCircle className="w-6 h-6 mx-auto text-green-600 mb-2" />
                <p className="text-2xl font-bold text-green-600">
                  {reportData.summary.completedTasks}/
                  {reportData.summary.totalTasks}
                </p>
                <p className="text-xs text-green-700">Task hoàn thành</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <TrendingUp className="w-6 h-6 mx-auto text-orange-600 mb-2" />
                <p className="text-2xl font-bold text-orange-600">
                  {reportData.summary.attendanceRate}%
                </p>
                <p className="text-xs text-orange-700">Tỷ lệ chuyên cần</p>
              </div>
              <div className="text-center p-4 bg-cyan-50 rounded-lg">
                <Clock className="w-6 h-6 mx-auto text-cyan-600 mb-2" />
                <p className="text-2xl font-bold text-cyan-600">
                  {reportData.summary.avgWorkHours}h
                </p>
                <p className="text-xs text-cyan-700">Giờ làm TB/ngày</p>
              </div>
              <div className="text-center p-4 bg-indigo-50 rounded-lg">
                <TrendingUp className="w-6 h-6 mx-auto text-indigo-600 mb-2" />
                <p className="text-2xl font-bold text-indigo-600">
                  {Math.round(
                    (reportData.summary.completedTasks /
                      reportData.summary.totalTasks) *
                      100
                  )}
                  %
                </p>
                <p className="text-xs text-indigo-700">Hiệu suất</p>
              </div>
            </div>
          </div>

          {/* Employee Performance */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 print:shadow-none print:border-none">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Hiệu suất Nhân viên
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-medium text-slate-700">
                      Nhân viên
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">
                      Vị trí
                    </th>
                    <th className="text-center py-3 px-4 font-medium text-slate-700">
                      Tasks
                    </th>
                    <th className="text-center py-3 px-4 font-medium text-slate-700">
                      Chuyên cần
                    </th>
                    <th className="text-center py-3 px-4 font-medium text-slate-700">
                      Đánh giá
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.employeePerformance.map((emp) => (
                    <tr
                      key={emp.id}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="py-3 px-4 font-medium text-slate-900">
                        {emp.name}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {emp.position}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-green-600 font-medium">
                          {emp.tasksCompleted}
                        </span>
                        /{emp.tasksTotal}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-1 rounded text-sm ${
                            emp.attendanceRate >= 95
                              ? "bg-green-100 text-green-700"
                              : emp.attendanceRate >= 90
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {emp.attendanceRate}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-yellow-500">★</span>
                          <span className="font-medium">{emp.rating}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Project Status */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 print:shadow-none print:border-none">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Tình trạng Dự án
            </h3>
            <div className="space-y-4">
              {reportData.projectStatus.map((project) => (
                <div
                  key={project.id}
                  className="p-4 border border-slate-200 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-slate-900">
                      {project.name}
                    </h4>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                        project.status
                      )}`}
                    >
                      {project.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-600 mb-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Deadline:{" "}
                      {new Date(project.deadline).toLocaleDateString("vi-VN")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {project.members} thành viên
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        project.progress === 100
                          ? "bg-green-600"
                          : project.progress >= 50
                          ? "bg-blue-600"
                          : "bg-yellow-600"
                      }`}
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1 text-right">
                    {project.progress}% hoàn thành
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <FileText className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            Chưa có báo cáo
          </h3>
          <p className="text-slate-600 mb-4">
            Chọn loại báo cáo và khoảng thời gian, sau đó nhấn "Tạo báo cáo"
          </p>
        </div>
      )}
    </div>
  );
};

export default DeptReport;
