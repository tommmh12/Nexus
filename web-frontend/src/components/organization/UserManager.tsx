import React, { useState, useEffect, useMemo, useCallback } from "react";
import { EmployeeProfile, ActivityLog, ActivityType } from "../../types";
import { userService, UserData, CreateUserData } from "../../services/userService";
import { authService } from "../../services/authService";
import { Button } from "../system/ui/Button";
import { Input } from "../system/ui/Input";
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
  Activity,
  MessageSquare,
  FileText,
  CheckSquare,
  LogIn,
  Users,
  UserX,
  RotateCcw,
} from "lucide-react";

interface Department {
  id: string;
  name: string;
  code: string;
}

export const UserManager = () => {
  const [view, setView] = useState<"list" | "resigned" | "detail" | "form">("list");
  const [users, setUsers] = useState<EmployeeProfile[]>([]);
  const [resignedUsers, setResignedUsers] = useState<EmployeeProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<EmployeeProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);

  // Form state
  const [formData, setFormData] = useState<Partial<CreateUserData & { id?: string }>>({});

  // Memoized onChange handlers để tránh re-render
  const handleFullNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, fullName: e.target.value }));
  }, []);

  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, email: e.target.value }));
  }, []);

  const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, phone: e.target.value }));
  }, []);

  const handlePositionChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, position: e.target.value }));
  }, []);

  const handleDepartmentChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, departmentId: e.target.value }));
  }, []);

  const handleRoleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, role: e.target.value as any }));
  }, []);

  const handleStatusChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, status: e.target.value as any }));
  }, []);

  // Fetch departments
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
        const token = localStorage.getItem("accessToken");
        const response = await fetch(`${API_URL}/settings/departments`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (data.success) {
          setDepartments(data.data);
        }
      } catch (error) {
        console.error("Error fetching departments:", error);
        // Fallback departments
        setDepartments([
          { id: "1", name: "Phòng Công nghệ thông tin", code: "IT" },
          { id: "2", name: "Phòng Nhân sự", code: "HR" },
          { id: "3", name: "Phòng Tài chính - Kế toán", code: "FIN" },
          { id: "4", name: "Phòng Marketing", code: "MKT" },
        ]);
      }
    };
    fetchDepartments();
  }, []);

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAll();
      const mappedUsers: EmployeeProfile[] = data.map((u: UserData) => ({
        id: u.id,
        employeeId: u.employeeId,
        fullName: u.fullName,
        email: u.email,
        phone: u.phone || "",
        avatarUrl: u.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.employeeId}`,
        position: u.position || "",
        role: u.role,
        status: u.status,
        department: u.department || "N/A",
        departmentId: u.departmentId,
        joinDate: u.joinDate ? new Date(u.joinDate).toLocaleDateString("vi-VN") : "",
        karmaPoints: u.karmaPoints || 0,
        linkedAccounts: [],
      }));
      setUsers(mappedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch resigned users
  const fetchResignedUsers = async () => {
    try {
      const data = await userService.getResigned();
      const mappedUsers: EmployeeProfile[] = data.map((u: UserData) => ({
        id: u.id,
        employeeId: u.employeeId,
        fullName: u.fullName,
        email: u.email,
        phone: u.phone || "",
        avatarUrl: u.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.employeeId}`,
        position: u.position || "",
        role: u.role,
        status: u.status,
        department: u.department || "N/A",
        joinDate: u.joinDate ? new Date(u.joinDate).toLocaleDateString("vi-VN") : "",
        resignedDate: u.resignedDate ? new Date(u.resignedDate).toLocaleDateString("vi-VN") : "",
        karmaPoints: u.karmaPoints || 0,
        linkedAccounts: [],
      }));
      setResignedUsers(mappedUsers);
    } catch (error) {
      console.error("Error fetching resigned users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (view === "resigned") {
      fetchResignedUsers();
    }
  }, [view]);

  const handleViewDetail = (user: EmployeeProfile) => {
    setSelectedUser(user);
    setView("detail");
  };

  const handleCreate = () => {
    setSelectedUser(null);
    setIsEditing(false);
    setFormData({
      role: "Employee", // Set mặc định
      status: "Active", // Set mặc định
    });
    setView("form");
  };

  const handleEdit = (user: EmployeeProfile) => {
    setSelectedUser(user);
    setIsEditing(true);
    setFormData({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      position: user.position,
      departmentId: (user as any).departmentId,
      role: user.role,
      status: user.status,
    });
    setView("form");
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn cho nhân sự này nghỉ việc?")) {
      try {
        await userService.softDelete(id);
        alert("Đã chuyển nhân sự sang danh sách nghỉ việc");
        fetchUsers();
        if (selectedUser?.id === id) setView("list");
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Không thể xóa nhân sự");
      }
    }
  };

  const handleRestore = async (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn khôi phục nhân sự này?")) {
      try {
        await userService.restore(id);
        alert("Đã khôi phục nhân sự thành công");
        fetchResignedUsers();
        fetchUsers();
      } catch (error) {
        console.error("Error restoring user:", error);
        alert("Không thể khôi phục nhân sự");
      }
    }
  };

  const handleSaveUser = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Validation ở frontend với thông báo chi tiết
      // Đảm bảo role có giá trị mặc định nếu chưa được set
      const roleValue = formData.role || "Employee";
      
      const missingFields: string[] = [];
      if (!formData.fullName?.trim()) missingFields.push("Họ và tên");
      if (!formData.email?.trim()) missingFields.push("Email");
      if (!formData.departmentId?.trim()) missingFields.push("Phòng ban");
      if (!roleValue?.trim()) missingFields.push("Vai trò");

      if (missingFields.length > 0) {
        console.log("Validation failed - Missing fields:", missingFields);
        console.log("Current formData:", formData);
        alert(`Vui lòng điền đầy đủ thông tin bắt buộc:\n- ${missingFields.join("\n- ")}`);
        setSaving(false);
        return;
      }

      // Chuẩn bị dữ liệu để gửi
      const submitData: CreateUserData = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone?.trim() || undefined,
        position: formData.position?.trim() || undefined,
        departmentId: formData.departmentId,
        role: roleValue as "Admin" | "Manager" | "Employee",
        status: formData.status || "Active",
      };

      console.log("Submitting data:", submitData);

      if (isEditing && formData.id) {
        await userService.update(formData.id, submitData);
        alert("Cập nhật nhân sự thành công!");
      } else {
        const result = await userService.create(submitData);
        alert(`Tạo nhân sự thành công!\nMã NV: ${result.employeeId}\nMật khẩu tạm: ${result.temporaryPassword}`);
      }
      fetchUsers();
      setView("list");
    } catch (error: any) {
      console.error("Error saving user:", error);
      alert(error.response?.data?.message || "Không thể lưu thông tin nhân sự");
    } finally {
      setSaving(false);
    }
  }, [isEditing, formData]);

  // --- Sub-component: User List ---
  const UserListView = () => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-fadeIn">
      {loading ? (
        <div className="p-8 text-center text-slate-500">Đang tải...</div>
      ) : users.length === 0 ? (
        <div className="p-8 text-center text-slate-500">Chưa có nhân sự nào</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nhân viên</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Mã NV / Vị trí</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Vai trò</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => handleViewDetail(u)}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img className="h-10 w-10 rounded-full object-cover border border-slate-200" src={u.avatarUrl} alt="" />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-slate-900">{u.fullName}</div>
                        <div className="text-sm text-slate-500">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900 font-mono">{u.employeeId}</div>
                    <div className="text-xs text-slate-500">{u.position}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full border ${
                      u.role === "Admin" ? "bg-purple-50 text-purple-700 border-purple-200" :
                      u.role === "Manager" ? "bg-blue-50 text-blue-700 border-blue-200" :
                      "bg-slate-50 text-slate-700 border-slate-200"
                    }`}>{u.role}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      u.status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${u.status === "Active" ? "bg-green-600" : "bg-red-600"}`}></span>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => handleEdit(u)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(u.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  // --- Sub-component: Resigned Users List ---
  const ResignedListView = () => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-fadeIn">
      {resignedUsers.length === 0 ? (
        <div className="p-8 text-center text-slate-500">Không có nhân sự đã nghỉ việc</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nhân viên</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Mã NV / Vị trí</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Phòng ban</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Ngày nghỉ</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {resignedUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img className="h-10 w-10 rounded-full object-cover border border-slate-200 grayscale" src={u.avatarUrl} alt="" />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-slate-900">{u.fullName}</div>
                        <div className="text-sm text-slate-500">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900 font-mono">{u.employeeId}</div>
                    <div className="text-xs text-slate-500">{u.position}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{u.department}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">{(u as any).resignedDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleRestore(u.id)} className="inline-flex items-center gap-1 px-3 py-1.5 text-green-600 hover:bg-green-50 rounded border border-green-200">
                      <RotateCcw size={14} /> Khôi phục
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );


  // --- Sub-component: User Form (Add/Edit) ---
  const UserForm = useMemo(() => (
    <div className="animate-fadeIn max-w-3xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="outline" onClick={() => setView("list")} className="p-2 h-10 w-10">
          <ArrowLeft size={18} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isEditing ? "Chỉnh sửa nhân sự" : "Thêm nhân sự mới"}
          </h1>
          <p className="text-slate-500 text-sm">
            {isEditing ? "Cập nhật thông tin hồ sơ nhân sự." : "Điền đầy đủ thông tin hồ sơ và thiết lập tài khoản."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSaveUser} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-8 space-y-8">
          {/* Basic Info */}
          <div>
            <h3 className="font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Thông tin cá nhân & Liên hệ
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                key="fullName"
                label="Họ và tên *"
                value={formData.fullName || ""}
                onChange={handleFullNameChange}
                required
                placeholder="Ví dụ: Nguyễn Văn A"
              />
              <Input
                key="email"
                label="Email công ty *"
                type="email"
                value={formData.email || ""}
                onChange={handleEmailChange}
                required
                placeholder="name@company.com"
              />
              <Input
                key="phone"
                label="Số điện thoại"
                value={formData.phone || ""}
                onChange={handlePhoneChange}
                placeholder="09xx..."
              />
              {isEditing && selectedUser && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Mã nhân viên</label>
                  <div className="w-full bg-slate-100 border border-slate-200 rounded-md p-2.5 text-sm text-slate-600 font-mono">
                    {selectedUser.employeeId}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Mã nhân viên không thể thay đổi</p>
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
                <label className="block text-sm font-semibold text-slate-700 mb-2">Phòng ban *</label>
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.departmentId || ""}
                  onChange={handleDepartmentChange}
                  required
                >
                  <option value="">-- Chọn phòng ban --</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
                {!isEditing && formData.departmentId && (
                  <p className="text-xs text-blue-600 mt-1">
                    Mã NV sẽ được tạo tự động theo phòng ban
                  </p>
                )}
              </div>
              <Input
                key="position"
                label="Chức danh / Vị trí"
                value={formData.position || ""}
                onChange={handlePositionChange}
                placeholder="Ví dụ: Senior Developer"
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
                <label className="block text-sm font-semibold text-slate-700 mb-2">Vai trò hệ thống *</label>
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.role || "Employee"}
                  onChange={handleRoleChange}
                  required
                >
                  <option value="Employee">Employee (Nhân viên)</option>
                  <option value="Manager">Manager (Quản lý)</option>
                  <option value="Admin">Admin (Quản trị viên)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Trạng thái tài khoản</label>
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.status || "Active"}
                  onChange={handleStatusChange}
                >
                  <option value="Active">Active (Hoạt động)</option>
                  <option value="Blocked">Blocked (Khóa)</option>
                  <option value="Pending">Pending (Chờ duyệt)</option>
                </select>
              </div>
              {!isEditing && (
                <div className="md:col-span-2 bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-start gap-3">
                  <Key size={18} className="text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-blue-800">Mật khẩu & Mã nhân viên tự động</p>
                    <p className="text-xs text-blue-600 mt-1">
                      Mã nhân viên sẽ được tạo theo format: [Mã phòng ban] + [5 số ngẫu nhiên]<br />
                      Mật khẩu ngẫu nhiên sẽ được hiển thị sau khi tạo thành công.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-slate-50 px-8 py-4 border-t border-slate-200 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => setView("list")}>Hủy bỏ</Button>
          <Button type="submit" disabled={saving}>
            <Save size={18} className="mr-2" />
            {saving ? "Đang lưu..." : isEditing ? "Lưu thay đổi" : "Tạo nhân sự"}
          </Button>
        </div>
      </form>
    </div>
  ), [formData, isEditing, selectedUser, departments, saving, handleSaveUser]);

  // --- Sub-component: User Detail Profile ---
  const UserProfileView = ({ user }: { user: EmployeeProfile }) => {
    const [activeTab, setActiveTab] = useState<"info" | "activity" | "security">("info");
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [changingPassword, setChangingPassword] = useState(false);
    const [resettingPassword, setResettingPassword] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const userActivities: ActivityLog[] = [];

    // Lấy thông tin user hiện tại để check quyền
    useEffect(() => {
      const storedUser = authService.getStoredUser();
      setCurrentUser(storedUser);
    }, []);

    const isAdmin = currentUser?.role === "Admin";
    const isOwnProfile = currentUser?.id === user.id;

    const handleChangePassword = async () => {
      if (!newPassword || !confirmPassword) {
        alert("Vui lòng nhập đầy đủ thông tin");
        return;
      }

      if (newPassword.length < 6) {
        alert("Mật khẩu mới phải có ít nhất 6 ký tự");
        return;
      }

      if (newPassword !== confirmPassword) {
        alert("Mật khẩu xác nhận không khớp");
        return;
      }

      setChangingPassword(true);
      try {
        await userService.changePassword(user.id, currentPassword, newPassword);
        alert("Đổi mật khẩu thành công!");
        setShowChangePasswordModal(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } catch (error: any) {
        alert(error.response?.data?.message || "Không thể đổi mật khẩu");
      } finally {
        setChangingPassword(false);
      }
    };

    const handleResetPassword = async () => {
      if (!isAdmin) {
        alert("Chỉ quản trị viên mới được cấp lại mật khẩu");
        return;
      }

      if (!window.confirm(`Bạn có chắc chắn muốn cấp lại mật khẩu cho ${user.fullName}?`)) {
        return;
      }

      setResettingPassword(true);
      try {
        const result = await userService.resetPassword(user.id);
        alert(`Cấp lại mật khẩu thành công!\nMã NV: ${result.employeeId}\nMật khẩu tạm: ${result.temporaryPassword}\n\nVui lòng lưu lại mật khẩu này và cung cấp cho người dùng.`);
        setShowResetPasswordModal(false);
      } catch (error: any) {
        alert(error.response?.data?.message || "Không thể cấp lại mật khẩu");
      } finally {
        setResettingPassword(false);
      }
    };

    return (
      <div className="animate-fadeIn">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="outline" onClick={() => setView("list")} className="p-2 h-10 w-10">
            <ArrowLeft size={18} />
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
              <UserX size={16} className="mr-2" /> Cho nghỉ việc
            </Button>
            <Button onClick={() => handleEdit(user)}>
              <Edit2 size={16} className="mr-2" /> Chỉnh sửa
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Panel */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center">
              <div className="relative inline-block mb-4">
                <img src={user.avatarUrl} alt={user.fullName} className="w-32 h-32 rounded-full border-4 border-slate-100 object-cover mx-auto" />
                <div className={`absolute bottom-1 right-1 w-6 h-6 rounded-full border-4 border-white ${user.status === "Active" ? "bg-green-500" : "bg-red-500"}`}></div>
              </div>
              <h2 className="text-xl font-bold text-slate-900">{user.fullName}</h2>
              <p className="text-slate-500 text-sm mb-4">{user.position} • {user.department}</p>
              <div className="flex justify-center gap-2">
                <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">{user.role}</span>
                <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full font-mono">{user.employeeId}</span>
              </div>
              <div className="mt-6 pt-6 border-t border-slate-100 space-y-3 text-left">
                <div className="flex items-center text-sm text-slate-600"><Mail size={16} className="mr-3 text-slate-400" /> {user.email}</div>
                <div className="flex items-center text-sm text-slate-600"><Phone size={16} className="mr-3 text-slate-400" /> {user.phone || "Chưa cập nhật"}</div>
                <div className="flex items-center text-sm text-slate-600"><Clock size={16} className="mr-3 text-slate-400" /> Gia nhập: {user.joinDate || "N/A"}</div>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex border-b border-slate-200 bg-slate-50">
              <button onClick={() => setActiveTab("info")} className={`flex-1 py-4 text-sm font-medium border-b-2 ${activeTab === "info" ? "border-blue-600 text-blue-600 bg-white" : "border-transparent text-slate-500"}`}>
                Thông tin cá nhân
              </button>
              <button onClick={() => setActiveTab("security")} className={`flex-1 py-4 text-sm font-medium border-b-2 ${activeTab === "security" ? "border-blue-600 text-blue-600 bg-white" : "border-transparent text-slate-500"}`}>
                Tài khoản & Bảo mật
              </button>
            </div>
            <div className="p-6">
              {activeTab === "info" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-xs text-slate-500 font-bold uppercase mb-1">Phòng ban</p>
                    <p className="font-medium text-slate-900">{user.department}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-xs text-slate-500 font-bold uppercase mb-1">Chức danh</p>
                    <p className="font-medium text-slate-900">{user.position || "Chưa cập nhật"}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-xs text-slate-500 font-bold uppercase mb-1">Vai trò hệ thống</p>
                    <p className="font-medium text-slate-900">{user.role}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-xs text-slate-500 font-bold uppercase mb-1">Trạng thái</p>
                    <p className={`font-medium ${user.status === "Active" ? "text-green-600" : "text-red-600"}`}>{user.status}</p>
                  </div>
                </div>
              )}
              {activeTab === "security" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">Liên kết tài khoản Google</p>
                        <p className="text-xs text-slate-500">
                          {user.linkedAccounts && user.linkedAccounts.length > 0 
                            ? `Đã liên kết với ${user.linkedAccounts.length} tài khoản Google`
                            : "Chưa liên kết với tài khoản Google"}
                        </p>
                      </div>
                      {user.linkedAccounts && user.linkedAccounts.length > 0 ? (
                        <div className="flex items-center gap-2">
                          <svg className="h-5 w-5" viewBox="0 0 24 24">
                            <path
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                              fill="#4285F4"
                            />
                            <path
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                              fill="#34A853"
                            />
                            <path
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                              fill="#FBBC05"
                            />
                            <path
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                              fill="#EA4335"
                            />
                          </svg>
                          <span className="text-xs text-green-600 font-medium">Đã liên kết</span>
                        </div>
                      ) : null}
                    </div>
                    <Button 
                      variant="outline" 
                      className="text-xs h-8"
                      onClick={() => {
                        if (user.linkedAccounts && user.linkedAccounts.length > 0) {
                          if (window.confirm("Bạn có chắc chắn muốn hủy liên kết tài khoản Google?")) {
                            // TODO: Implement unlink Google account
                            alert("Tính năng hủy liên kết Google đang được phát triển");
                          }
                        } else {
                          // TODO: Implement link Google account
                          alert("Tính năng liên kết Google đang được phát triển");
                        }
                      }}
                    >
                      {user.linkedAccounts && user.linkedAccounts.length > 0 ? "Hủy liên kết" : "Liên kết"}
                    </Button>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {isAdmin ? "Cấp lại mật khẩu" : "Đổi mật khẩu"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {isAdmin 
                          ? "Cấp lại mật khẩu mới cho người dùng (chỉ Admin)"
                          : isOwnProfile 
                            ? "Đổi mật khẩu của bạn"
                            : "Bạn chỉ có thể đổi mật khẩu của chính mình"}
                      </p>
                    </div>
                    {isAdmin ? (
                      <Button 
                        variant="outline" 
                        className="text-xs h-8"
                        onClick={() => setShowResetPasswordModal(true)}
                      >
                        Cấp lại
                      </Button>
                    ) : isOwnProfile ? (
                      <Button 
                        variant="outline" 
                        className="text-xs h-8"
                        onClick={() => setShowChangePasswordModal(true)}
                      >
                        Đổi mật khẩu
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        className="text-xs h-8"
                        disabled
                      >
                        Không có quyền
                      </Button>
                    )}
                  </div>
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-slate-900">Đăng xuất tất cả phiên</p>
                      <p className="text-xs text-slate-500">Buộc đăng xuất khỏi tất cả thiết bị</p>
                    </div>
                    <Button variant="outline" className="text-xs h-8 text-red-600 border-red-200">Đăng xuất</Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Đổi mật khẩu */}
        {showChangePasswordModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowChangePasswordModal(false)}>
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-slate-900 mb-4">Đổi mật khẩu</h3>
              <div className="space-y-4">
                <Input
                  label="Mật khẩu hiện tại *"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  placeholder="Nhập mật khẩu hiện tại"
                />
                <Input
                  label="Mật khẩu mới *"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Tối thiểu 6 ký tự"
                />
                <Input
                  label="Xác nhận mật khẩu mới *"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Nhập lại mật khẩu mới"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowChangePasswordModal(false);
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleChangePassword}
                  disabled={changingPassword}
                >
                  {changingPassword ? "Đang xử lý..." : "Đổi mật khẩu"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Cấp lại mật khẩu (Admin) */}
        {showResetPasswordModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowResetPasswordModal(false)}>
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-slate-900 mb-4">Cấp lại mật khẩu</h3>
              <div className="mb-4">
                <p className="text-sm text-slate-600">
                  Bạn sắp cấp lại mật khẩu cho: <strong>{user.fullName}</strong>
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  Mật khẩu mới sẽ được tạo ngẫu nhiên và hiển thị sau khi xác nhận.
                </p>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="ghost"
                  onClick={() => setShowResetPasswordModal(false)}
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleResetPassword}
                  disabled={resettingPassword}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {resettingPassword ? "Đang xử lý..." : "Cấp lại mật khẩu"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Main Render
  return (
    <div className="w-full h-full">
      {(view === "list" || view === "resigned") && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {view === "list" ? "Danh sách Nhân sự" : "Nhân sự đã nghỉ việc"}
              </h1>
              <p className="text-slate-500 mt-1">
                {view === "list" ? "Quản lý hồ sơ nhân viên và tài khoản hệ thống." : "Danh sách nhân viên đã nghỉ việc, có thể khôi phục."}
              </p>
            </div>
            {view === "list" && (
              <Button onClick={handleCreate}>
                <Plus size={18} className="mr-2" /> Thêm nhân sự
              </Button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setView("list")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                view === "list" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Users size={16} /> Đang làm việc ({users.length})
            </button>
            <button
              onClick={() => setView("resigned")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                view === "resigned" ? "bg-red-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <UserX size={16} /> Đã nghỉ việc ({resignedUsers.length})
            </button>
          </div>
        </div>
      )}

      {view === "list" && <UserListView />}
      {view === "resigned" && <ResignedListView />}
      {view === "detail" && selectedUser && <UserProfileView user={selectedUser} />}
      {view === "form" && UserForm}
    </div>
  );
};

// UserTableWidget component for Dashboard overview
export const UserTableWidget = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await userService.getAll();
        // Show only the 5 most recent users
        const recentUsers = data.slice(0, 5);
        setUsers(recentUsers);
      } catch (error) {
        console.error("Error fetching users for widget:", error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
        <h2 className="text-lg font-bold text-slate-900">Nhân sự gần đây</h2>
        <p className="text-sm text-slate-500 mt-1">Danh sách 5 nhân sự mới nhất</p>
      </div>
      
      {loading ? (
        <div className="p-8 text-center text-slate-500">Đang tải...</div>
      ) : users.length === 0 ? (
        <div className="p-8 text-center text-slate-500">Chưa có nhân sự nào</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nhân viên</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Mã NV</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Vai trò</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img className="h-10 w-10 rounded-full object-cover border border-slate-200" src={u.avatarUrl} alt="" />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-slate-900">{u.fullName}</div>
                        <div className="text-sm text-slate-500">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900 font-mono">{u.employeeId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full border ${
                      u.role === "Admin" ? "bg-purple-50 text-purple-700 border-purple-200" :
                      u.role === "Manager" ? "bg-blue-50 text-blue-700 border-blue-200" :
                      "bg-slate-50 text-slate-700 border-slate-200"
                    }`}>{u.role}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      u.status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${u.status === "Active" ? "bg-green-600" : "bg-red-600"}`}></span>
                      {u.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserManager;
