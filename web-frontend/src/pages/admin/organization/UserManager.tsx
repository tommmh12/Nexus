import React, { useState, useEffect } from "react";
import { EmployeeProfile, ActivityLog, ActivityType, Department } from "../../types";
// TODO: Replace with API call
import { Button } from "../../../components/system/ui/Button";
import { Input } from "../../../components/system/ui/Input";
import { departmentService } from "../../../services/departmentService";
import {
  Plus,
  Edit2,
  Trash2,
  ArrowLeft,
  Mail,
  Phone,
  Clock,
  Shield,
  Link as LinkIcon,
  CheckCircle2,
  Save,
  Key,
  User as UserIcon,
  Activity,
  MessageSquare,
  FileText,
  CheckSquare,
  LogIn,
} from "lucide-react";

export const UserManager = () => {
  const [view, setView] = useState<"list" | "detail" | "form">("list");
  const [users, setUsers] = useState<EmployeeProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<EmployeeProfile | null>(
    null
  );
  const [isEditing, setIsEditing] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);

  // Load departments on mount
  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const depts = await departmentService.getAllDepartments();
        setDepartments(depts);
      } catch (error) {
        console.error("Error loading departments:", error);
      }
    };
    loadDepartments();
  }, []);

  const handleViewDetail = (user: EmployeeProfile) => {
    setSelectedUser(user);
    setView("detail");
  };

  const handleCreate = () => {
    setSelectedUser(null);
    setIsEditing(false);
    setView("form");
  };

  const handleEdit = (user: EmployeeProfile) => {
    setSelectedUser(user);
    setIsEditing(true);
    setView("form");
  };

  const handleDelete = (id: string) => {
    if (
      window.confirm(
        "Bạn có chắc chắn muốn xóa nhân sự này không? Hành động này không thể hoàn tác."
      )
    ) {
      setUsers(users.filter((u) => u.id !== id));
      if (selectedUser?.id === id) setView("list");
    }
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Đã lưu thông tin nhân sự thành công!");
    setView("list");
  };

  // --- Sub-component: User List ---
  const UserListView = () => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-fadeIn">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Nhân viên
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Mã NV / Vị trí
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Vai trò
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <UserIcon size={48} className="text-slate-300 mb-4" />
                    <p className="text-sm font-medium text-slate-500 mb-1">
                      Chưa có nhân viên nào
                    </p>
                    <p className="text-xs text-slate-400 mb-4">
                      Bắt đầu bằng cách thêm nhân viên mới vào hệ thống
                    </p>
                    <Button onClick={handleCreate} size="sm">
                      <Plus size={16} className="mr-2" /> Thêm nhân viên đầu tiên
                    </Button>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr
                  key={u.id}
                  className="hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => handleViewDetail(u)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        className="h-10 w-10 rounded-full object-cover border border-slate-200"
                        src={u.avatarUrl}
                        alt=""
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-slate-900">
                          {u.fullName}
                        </div>
                        <div className="text-sm text-slate-500">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900 font-mono">
                      {u.employeeId}
                    </div>
                    <div className="text-xs text-slate-500">{u.position}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full border ${
                        u.role === "Admin"
                          ? "bg-purple-50 text-purple-700 border-purple-200"
                          : u.role === "Manager"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-slate-50 text-slate-700 border-slate-200"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        u.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          u.status === "Active" ? "bg-green-600" : "bg-red-600"
                        }`}
                      ></span>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div
                      className="flex justify-end gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => handleEdit(u)}
                        className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  // --- Helper Component: Activity Timeline ---
  const ActivityTimeline = ({ activities }: { activities: ActivityLog[] }) => {
    if (!activities || activities.length === 0) {
      return (
        <div className="text-center py-10 text-slate-400">
          <Activity size={32} className="mx-auto mb-2 opacity-50" />
          <p>Chưa có hoạt động nào được ghi nhận.</p>
        </div>
      );
    }

    const getActivityIcon = (type: ActivityType) => {
      switch (type) {
        case "post_create":
          return <FileText size={16} />;
        case "comment":
          return <MessageSquare size={16} />;
        case "task_complete":
          return <CheckSquare size={16} />;
        case "login":
          return <LogIn size={16} />;
        default:
          return <Activity size={16} />;
      }
    };

    const getActivityColor = (type: ActivityType) => {
      switch (type) {
        case "post_create":
          return "bg-blue-100 text-blue-600 border-blue-200";
        case "comment":
          return "bg-orange-100 text-orange-600 border-orange-200";
        case "task_complete":
          return "bg-green-100 text-green-600 border-green-200";
        case "login":
          return "bg-slate-100 text-slate-600 border-slate-200";
        default:
          return "bg-gray-100 text-gray-600 border-gray-200";
      }
    };

    return (
      <div className="relative pl-4 border-l border-slate-200 space-y-6">
        {activities.map((act) => (
          <div key={act.id} className="relative group">
            <div
              className={`absolute -left-[25px] top-1 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center ${getActivityColor(
                act.type
              )}`}
            >
              {getActivityIcon(act.type)}
            </div>
            <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm hover:border-brand-200 hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-1">
                <p className="text-sm font-semibold text-slate-900">
                  {act.content}
                </p>
                <span className="text-xs text-slate-400 whitespace-nowrap">
                  {act.timestamp}
                </span>
              </div>
              {act.target && (
                <p className="text-sm text-brand-600 font-medium mb-1">
                  "{act.target}"
                </p>
              )}
              <p className="text-xs text-slate-500 capitalize">
                {act.type.replace("_", " ")}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // --- Sub-component: User Detail Profile ---
  const UserProfileView = ({ user }: { user: EmployeeProfile }) => {
    const [activeTab, setActiveTab] = useState<
      "info" | "activity" | "security"
    >("info");
    const userActivities: ActivityLog[] = []; // TODO: Fetch from API

    return (
      <div className="animate-fadeIn">
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setView("list")}
            className="p-2 h-10 w-10"
          >
            <ArrowLeft size={18} />
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleDelete(user.id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            >
              <Trash2 size={16} className="mr-2" /> Xóa nhân sự
            </Button>
            <Button onClick={() => handleEdit(user)}>
              <Edit2 size={16} className="mr-2" /> Chỉnh sửa hồ sơ
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Panel: Identity Card */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center">
              <div className="relative inline-block mb-4">
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  className="w-32 h-32 rounded-full border-4 border-slate-100 object-cover mx-auto"
                />
                <div
                  className={`absolute bottom-1 right-1 w-6 h-6 rounded-full border-4 border-white ${
                    user.status === "Active" ? "bg-green-500" : "bg-red-500"
                  }`}
                ></div>
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                {user.fullName}
              </h2>
              <p className="text-slate-500 text-sm mb-4">
                {user.position} • {user.department}
              </p>

              <div className="flex justify-center gap-2">
                <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">
                  {user.role}
                </span>
                <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full font-mono">
                  {user.employeeId}
                </span>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100 space-y-3 text-left">
                <div className="flex items-center text-sm text-slate-600">
                  <Mail size={16} className="mr-3 text-slate-400" />{" "}
                  {user.email}
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <Phone size={16} className="mr-3 text-slate-400" />{" "}
                  {user.phone}
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <Clock size={16} className="mr-3 text-slate-400" /> Gia nhập:{" "}
                  {user.joinDate}
                </div>
              </div>
            </div>

            {/* Mini Stats */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {userActivities.length}
                </p>
                <p className="text-xs text-slate-500">Hoạt động</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {user.karmaPoints || 0}
                </p>
                <p className="text-xs text-slate-500">Karma Points</p>
              </div>
            </div>
          </div>

          {/* Right Panel: Detailed Tabs */}
          <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="flex border-b border-slate-200 bg-slate-50">
              <button
                onClick={() => setActiveTab("info")}
                className={`flex-1 py-4 text-sm font-medium border-b-2 ${
                  activeTab === "info"
                    ? "border-brand-600 text-brand-600 bg-white"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                Thông tin cá nhân
              </button>
              <button
                onClick={() => setActiveTab("activity")}
                className={`flex-1 py-4 text-sm font-medium border-b-2 ${
                  activeTab === "activity"
                    ? "border-brand-600 text-brand-600 bg-white"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                Lịch sử hoạt động
              </button>
              <button
                onClick={() => setActiveTab("security")}
                className={`flex-1 py-4 text-sm font-medium border-b-2 ${
                  activeTab === "security"
                    ? "border-brand-600 text-brand-600 bg-white"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                Tài khoản & Bảo mật
              </button>
            </div>

            <div className="p-6 flex-1 bg-slate-50/30">
              {/* Tab: Info */}
              {activeTab === "info" && (
                <div className="animate-fadeIn space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-4 rounded-lg border border-slate-200">
                      <p className="text-xs text-slate-500 font-bold uppercase mb-1">
                        Phòng ban
                      </p>
                      <p className="font-medium text-slate-900">
                        {user.department}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-slate-200">
                      <p className="text-xs text-slate-500 font-bold uppercase mb-1">
                        Chức danh
                      </p>
                      <p className="font-medium text-slate-900">
                        {user.position}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-slate-200">
                      <p className="text-xs text-slate-500 font-bold uppercase mb-1">
                        Quản lý trực tiếp
                      </p>
                      <p className="font-medium text-slate-900">
                        Trần Minh Đức
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-slate-200">
                      <p className="text-xs text-slate-500 font-bold uppercase mb-1">
                        Văn phòng làm việc
                      </p>
                      <p className="font-medium text-slate-900">
                        Tầng 12, Tòa nhà Nexus
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-slate-200">
                    <h3 className="font-bold text-slate-900 mb-4 flex items-center">
                      <LinkIcon size={18} className="mr-2 text-slate-500" /> Tài
                      khoản liên kết
                    </h3>
                    <div className="space-y-4">
                      {/* Google */}
                      <div className="flex items-center justify-between p-3 border border-slate-100 rounded-lg bg-slate-50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100">
                            <span className="font-bold text-blue-600">G</span>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-900">
                              Google Workspace
                            </div>
                            <div className="text-xs text-slate-500">
                              {user.linkedAccounts.find(
                                (a) => a.provider === "google"
                              )?.connected
                                ? "Đã kết nối"
                                : "Chưa kết nối"}
                            </div>
                          </div>
                        </div>
                        {user.linkedAccounts.find(
                          (a) => a.provider === "google"
                        )?.connected && (
                          <CheckCircle2 size={16} className="text-green-500" />
                        )}
                      </div>
                      {/* Microsoft */}
                      <div className="flex items-center justify-between p-3 border border-slate-100 rounded-lg bg-slate-50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100">
                            <span className="font-bold text-orange-600">M</span>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-900">
                              Microsoft 365
                            </div>
                            <div className="text-xs text-slate-500">
                              {user.linkedAccounts.find(
                                (a) => a.provider === "microsoft"
                              )?.connected
                                ? "Đã kết nối"
                                : "Chưa kết nối"}
                            </div>
                          </div>
                        </div>
                        {user.linkedAccounts.find(
                          (a) => a.provider === "microsoft"
                        )?.connected && (
                          <CheckCircle2 size={16} className="text-green-500" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Activity */}
              {activeTab === "activity" && (
                <div className="animate-fadeIn">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-slate-900">
                      Dòng thời gian hoạt động
                    </h3>
                    <div className="text-xs text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-full">
                      Hiển thị 10 hoạt động gần nhất
                    </div>
                  </div>
                  <ActivityTimeline activities={userActivities} />
                </div>
              )}

              {/* Tab: Security */}
              {activeTab === "security" && (
                <div className="animate-fadeIn space-y-6">
                  <div className="bg-white p-6 rounded-xl border border-slate-200">
                    <h3 className="font-bold text-slate-900 mb-4 flex items-center">
                      <Shield size={18} className="mr-2 text-brand-600" /> Trạng
                      thái bảo mật
                    </h3>
                    <div className="space-y-4 divide-y divide-slate-100">
                      <div className="flex justify-between items-center pt-2">
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            Xác thực 2 yếu tố (2FA)
                          </p>
                          <p className="text-xs text-slate-500">
                            Tăng cường bảo mật cho tài khoản.
                          </p>
                        </div>
                        <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">
                          Đã bật
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-4">
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            Đổi mật khẩu
                          </p>
                          <p className="text-xs text-slate-500">
                            Lần cuối: 30 ngày trước
                          </p>
                        </div>
                        <Button variant="outline" className="text-xs h-8">
                          Yêu cầu đổi
                        </Button>
                      </div>
                      <div className="flex justify-between items-center pt-4">
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            Phiên đăng nhập
                          </p>
                          <p className="text-xs text-slate-500">
                            Hiện có 2 phiên đang hoạt động.
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          className="text-xs h-8 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                        >
                          Đăng xuất tất cả
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Hàm tạo mã nhân viên tự động
  const generateEmployeeId = (deptCode: string): string => {
    if (!deptCode) return "";
    
    // Tạo 6 số random
    const randomNumbers = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Kiểm tra mã đã tồn tại chưa
    let employeeId = `${deptCode}-${randomNumbers}`;
    let attempts = 0;
    const maxAttempts = 100;
    
    while (users.some(u => u.employeeId === employeeId) && attempts < maxAttempts) {
      const newRandomNumbers = Math.floor(100000 + Math.random() * 900000).toString();
      employeeId = `${deptCode}-${newRandomNumbers}`;
      attempts++;
    }
    
    return employeeId;
  };

  // --- Sub-component: User Form (Add/Edit) ---
  const UserForm = () => {
    const [formData, setFormData] = useState({
      fullName: selectedUser?.fullName || "",
      email: selectedUser?.email || "",
      phone: selectedUser?.phone || "",
      employeeId: selectedUser?.employeeId || "",
      department: selectedUser?.department || "",
      position: selectedUser?.position || "",
      joinDate: selectedUser?.joinDate 
        ? new Date(selectedUser.joinDate.split("/").reverse().join("-")).toISOString().split("T")[0]
        : "",
      role: selectedUser?.role || "Employee",
      status: selectedUser?.status || "Active",
    });

    // Cập nhật formData khi selectedUser hoặc isEditing thay đổi
    useEffect(() => {
      if (selectedUser) {
        setFormData({
          fullName: selectedUser.fullName || "",
          email: selectedUser.email || "",
          phone: selectedUser.phone || "",
          employeeId: selectedUser.employeeId || "",
          department: selectedUser.department || "",
          position: selectedUser.position || "",
          joinDate: selectedUser.joinDate 
            ? new Date(selectedUser.joinDate.split("/").reverse().join("-")).toISOString().split("T")[0]
            : "",
          role: selectedUser.role || "Employee",
          status: selectedUser.status || "Active",
        });
      } else {
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          employeeId: "",
          department: "",
          position: "",
          joinDate: "",
          role: "Employee",
          status: "Active",
        });
      }
    }, [selectedUser, isEditing]);

    // Tự động tạo mã nhân viên khi chọn phòng ban (chỉ khi thêm mới)
    const handleDepartmentChange = (deptName: string) => {
      if (!isEditing && deptName) {
        const selectedDept = departments.find(d => d.name === deptName);
        if (selectedDept?.code) {
          const newEmployeeId = generateEmployeeId(selectedDept.code);
          setFormData(prev => ({ ...prev, department: deptName, employeeId: newEmployeeId }));
        } else {
          setFormData(prev => ({ ...prev, department: deptName }));
        }
      } else {
        setFormData(prev => ({ ...prev, department: deptName }));
      }
    };

    return (
      <div className="animate-fadeIn max-w-3xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setView("list")}
            className="p-2 h-10 w-10"
          >
            <ArrowLeft size={18} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {isEditing ? "Chỉnh sửa nhân sự" : "Thêm nhân sự mới"}
            </h1>
            <p className="text-slate-500 text-sm">
              Điền đầy đủ thông tin hồ sơ và thiết lập tài khoản.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSaveUser}
          className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
        >
          <div className="p-8 space-y-8">
            {/* Basic Info */}
            <div>
              <h3 className="font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                Thông tin cá nhân & Liên hệ
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Họ và tên"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                  placeholder="Ví dụ: Nguyễn Văn A"
                />
                <Input
                  label="Email công ty"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="name@company.com"
                />
                <Input
                  label="Số điện thoại"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="09xx..."
                />
                {isEditing && (
                  <Input
                    label="Mã nhân viên"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    placeholder="DEPT-123456"
                  />
                )}
                {!isEditing && formData.employeeId && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Mã nhân viên (Tự động tạo)
                    </label>
                    <div className="w-full bg-slate-100 border border-slate-200 rounded-md p-2.5 text-sm text-slate-600 font-mono">
                      {formData.employeeId}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Mã nhân viên được tạo tự động dựa trên mã phòng ban
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Job Info */}
            <div>
              <h3 className="font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                Thông tin công việc
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Phòng ban
                  </label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                    value={formData.department}
                    onChange={(e) => handleDepartmentChange(e.target.value)}
                    required
                  >
                    <option value="">Chọn phòng ban...</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.name}>
                        {dept.name} {dept.code ? `(${dept.code})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <Input
                  label="Chức danh / Vị trí"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  placeholder="Ví dụ: Senior Developer"
                />
                <Input
                  label="Ngày gia nhập"
                  type="date"
                  value={formData.joinDate}
                  onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                />
              </div>
            </div>

            {/* Account Settings */}
            <div>
              <h3 className="font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                Thiết lập tài khoản
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Vai trò hệ thống (Role)
                  </label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  >
                    <option value="Employee">Employee (Nhân viên)</option>
                    <option value="Manager">Manager (Quản lý)</option>
                    <option value="Admin">Admin (Quản trị viên)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Trạng thái tài khoản
                  </label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        checked={formData.status === "Active"}
                        onChange={() => setFormData({ ...formData, status: "Active" })}
                        className="mr-2 text-brand-600 focus:ring-brand-500"
                      />
                      <span className="text-sm text-slate-700">
                        Active (Hoạt động)
                      </span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        checked={formData.status === "Blocked"}
                        onChange={() => setFormData({ ...formData, status: "Blocked" })}
                        className="mr-2 text-brand-600 focus:ring-brand-500"
                      />
                      <span className="text-sm text-slate-700">
                        Blocked (Khóa)
                      </span>
                    </label>
                  </div>
                </div>
              {!isEditing && (
                <div className="md:col-span-2 bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-start gap-3">
                  <Key size={18} className="text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-blue-800">
                      Mật khẩu mặc định
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Mật khẩu ngẫu nhiên sẽ được gửi đến email của nhân sự sau
                      khi tạo thành công.
                    </p>
                  </div>
                </div>
              )}
              </div>
            </div>
          </div>

          <div className="bg-slate-50 px-8 py-4 border-t border-slate-200 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setView("list")}>
              Hủy bỏ
            </Button>
            <Button type="submit">
              <Save size={18} className="mr-2" />{" "}
              {isEditing ? "Lưu thay đổi" : "Tạo nhân sự"}
            </Button>
          </div>
        </form>
      </div>
    );
  };

  // Main Render Logic for Module
  return (
    <div className="w-full h-full">
      {view === "list" && (
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Danh sách Nhân sự
            </h1>
            <p className="text-slate-500 mt-1">
              Quản lý hồ sơ nhân viên và tài khoản hệ thống.
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus size={18} className="mr-2" /> Thêm nhân sự
          </Button>
        </div>
      )}

      {view === "list" && <UserListView />}
      {view === "detail" && selectedUser && (
        <UserProfileView user={selectedUser} />
      )}
      {view === "form" && <UserForm />}
    </div>
  );
};

// Compact Table used in Dashboard Overview
export const UserTableWidget = () => {
  const users: any[] = []; // TODO: Fetch from API
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-full">
      <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
        <h3 className="font-bold text-slate-900">Nhân sự mới gia nhập</h3>
        <Button variant="ghost" className="text-xs h-8">
          Xem tất cả
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Nhân viên
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Phòng ban
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Trạng thái
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {users.slice(0, 5).map((u) => (
              <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <img
                      className="h-8 w-8 rounded-full object-cover border border-slate-200"
                      src={u.avatarUrl}
                      alt=""
                    />
                    <div className="ml-3">
                      <div className="text-sm font-medium text-slate-900">
                        {u.fullName}
                      </div>
                      <div className="text-xs text-slate-500">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {u.department}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      u.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        u.status === "Active" ? "bg-green-600" : "bg-red-600"
                      }`}
                    ></span>
                    {u.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
