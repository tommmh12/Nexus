import React, { useState, useEffect, useMemo } from "react";
import {
  Users,
  Building2,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  CheckCircle,
  Clock,
  Search,
  Eye,
  X,
  MapPin,
  Badge,
} from "lucide-react";
import { Button } from "../../../components/system/ui/Button";

interface Employee {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  position?: string;
  role: string;
  status: string;
  joined_date?: string;
  address?: string;
}

interface DepartmentStats {
  totalEmployees: number;
  activeEmployees: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  activeProjects: number;
}

export const MyDepartment: React.FC = () => {
  const [department, setDepartment] = useState<any>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [stats, setStats] = useState<DepartmentStats>({
    totalEmployees: 0,
    activeEmployees: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    activeProjects: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Get current user
  const currentUser = useMemo(() => {
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        return JSON.parse(userData);
      }
    } catch {
      return null;
    }
    return null;
  }, []);

  useEffect(() => {
    loadDepartmentData();
  }, []);

  const loadDepartmentData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("accessToken");

      // Fetch manager stats (includes department info)
      const statsRes = await fetch("http://localhost:5000/api/manager/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        const data = statsData.data || statsData;

        setStats({
          totalEmployees: data.totalEmployees || 0,
          activeEmployees: data.activeEmployees || 0,
          totalTasks: data.totalTasks || 0,
          completedTasks: data.completedTasks || 0,
          pendingTasks: data.pendingTasks || 0,
          activeProjects: data.activeProjects || 0,
        });

        // Set department info from stats
        if (data.departmentName) {
          setDepartment({
            name: data.departmentName,
            code: data.departmentCode || "",
          });
        }
      }

      // Fetch team members
      const teamRes = await fetch(
        "http://localhost:5000/api/manager/employees",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (teamRes.ok) {
        const teamData = await teamRes.json();
        setEmployees(teamData.data || teamData);
      }
    } catch (error) {
      console.error("Error loading department data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter employees by search and status
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchesSearch =
        emp.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (emp.position || "").toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        filterStatus === "all" ||
        emp.status.toLowerCase() === filterStatus.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [employees, searchQuery, filterStatus]);

  // Count by status
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: employees.length };
    employees.forEach((emp) => {
      const status = emp.status.toLowerCase();
      counts[status] = (counts[status] || 0) + 1;
    });
    return counts;
  }, [employees]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <Building2 className="text-brand-600" />
            {department?.name || "Phòng ban của tôi"}
          </h1>
          <p className="text-slate-500 mt-1">
            Quản lý nhân viên trong phòng ban của bạn
          </p>
        </div>
        <div className="flex items-center gap-3">
          <img
            src={
              currentUser?.avatar_url ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                currentUser?.full_name || "M"
              )}&background=random`
            }
            alt=""
            className="w-10 h-10 rounded-full"
          />
          <div>
            <p className="text-sm font-medium text-slate-900">
              {currentUser?.full_name}
            </p>
            <p className="text-xs text-slate-500">Quản lý phòng ban</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {stats.totalEmployees}
              </p>
              <p className="text-xs text-slate-500">Tổng nhân viên</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {statusCounts["active"] || 0}
              </p>
              <p className="text-xs text-slate-500">Đang hoạt động</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {stats.activeProjects}
              </p>
              <p className="text-xs text-slate-500">Dự án đang chạy</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {stats.pendingTasks}
              </p>
              <p className="text-xs text-slate-500">Task đang làm</p>
            </div>
          </div>
        </div>
      </div>

      {/* Employee Management Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-slate-200">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, email, chức vụ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus("all")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filterStatus === "all"
                    ? "bg-brand-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Tất cả ({statusCounts.all || 0})
              </button>
              <button
                onClick={() => setFilterStatus("active")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filterStatus === "active"
                    ? "bg-green-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Hoạt động ({statusCounts.active || 0})
              </button>
              <button
                onClick={() => setFilterStatus("inactive")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filterStatus === "inactive"
                    ? "bg-slate-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Không hoạt động ({statusCounts.inactive || 0})
              </button>
            </div>
          </div>
        </div>

        {/* Employee List */}
        <div className="p-4">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            Danh sách nhân viên ({filteredEmployees.length})
          </h3>

          {filteredEmployees.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              <Users size={48} className="mx-auto mb-3 opacity-50" />
              <p>
                {searchQuery
                  ? "Không tìm thấy nhân viên phù hợp"
                  : "Chưa có nhân viên nào trong phòng ban"}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredEmployees.map((emp) => (
                <div
                  key={emp.id}
                  className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100 hover:border-brand-300 hover:shadow-md transition cursor-pointer group"
                  onClick={() => setSelectedEmployee(emp)}
                >
                  <img
                    src={
                      emp.avatar_url ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        emp.full_name
                      )}&background=random`
                    }
                    alt={emp.full_name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-white shadow"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-900 truncate group-hover:text-brand-600 transition">
                      {emp.full_name}
                    </h4>
                    <p className="text-sm text-slate-500 truncate">
                      {emp.position || emp.role}
                    </p>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {emp.email}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          emp.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {emp.status === "Active"
                          ? "Đang hoạt động"
                          : emp.status}
                      </span>
                    </div>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 transition p-2 rounded-full bg-brand-50 hover:bg-brand-100">
                    <Eye size={16} className="text-brand-600" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Employee Detail Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSelectedEmployee(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">
                Thông tin nhân viên
              </h3>
              <button
                onClick={() => setSelectedEmployee(null)}
                className="p-2 hover:bg-slate-100 rounded-full transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {/* Profile Header */}
              <div className="flex flex-col items-center text-center mb-6">
                <img
                  src={
                    selectedEmployee.avatar_url ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      selectedEmployee.full_name
                    )}&background=random&size=128`
                  }
                  alt={selectedEmployee.full_name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-brand-100 shadow-lg mb-4"
                />
                <h2 className="text-xl font-bold text-slate-900">
                  {selectedEmployee.full_name}
                </h2>
                <p className="text-slate-500">
                  {selectedEmployee.position || selectedEmployee.role}
                </p>
                <span
                  className={`mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    selectedEmployee.status === "Active"
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {selectedEmployee.status === "Active"
                    ? "Đang hoạt động"
                    : selectedEmployee.status}
                </span>
              </div>

              {/* Info Grid */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <Mail className="text-slate-400" size={20} />
                  <div>
                    <p className="text-xs text-slate-500">Email</p>
                    <p className="text-sm font-medium text-slate-900">
                      {selectedEmployee.email}
                    </p>
                  </div>
                </div>

                {selectedEmployee.phone && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Phone className="text-slate-400" size={20} />
                    <div>
                      <p className="text-xs text-slate-500">Số điện thoại</p>
                      <p className="text-sm font-medium text-slate-900">
                        {selectedEmployee.phone}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <Badge className="text-slate-400" size={20} />
                  <div>
                    <p className="text-xs text-slate-500">Vai trò</p>
                    <p className="text-sm font-medium text-slate-900">
                      {selectedEmployee.role}
                    </p>
                  </div>
                </div>

                {selectedEmployee.joined_date && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Calendar className="text-slate-400" size={20} />
                    <div>
                      <p className="text-xs text-slate-500">Ngày vào làm</p>
                      <p className="text-sm font-medium text-slate-900">
                        {new Date(
                          selectedEmployee.joined_date
                        ).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                  </div>
                )}

                {selectedEmployee.address && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <MapPin className="text-slate-400" size={20} />
                    <div>
                      <p className="text-xs text-slate-500">Địa chỉ</p>
                      <p className="text-sm font-medium text-slate-900">
                        {selectedEmployee.address}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-slate-200">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setSelectedEmployee(null)}
              >
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyDepartment;
