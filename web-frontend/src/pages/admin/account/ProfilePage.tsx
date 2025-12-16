import React, { useState, useEffect, useRef } from "react";
import {
  User,
  Mail,
  Phone,
  Building,
  Calendar,
  MapPin,
  Edit2,
  Camera,
  Save,
  X,
  Briefcase,
  Award,
  Clock,
  CheckCircle,
  Upload,
  Loader2,
} from "lucide-react";
import { Button } from "../../../components/system/ui/Button";
import { Input } from "../../../components/system/ui/Input";
import { authService } from "../../../services/authService";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  department?: string;
  position?: string;
  joinDate?: string;
  address?: string;
  avatarUrl?: string;
  role?: string;
  bio?: string;
}

interface ProfileStats {
  projectCount: number;
  taskCount: number;
  achievementCount: number;
}

export const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<ProfileStats>({
    projectCount: 0,
    taskCount: 0,
    achievementCount: 0,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadProfile();
    loadStats();
  }, []);

  const loadProfile = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      // Fetch fresh profile from API
      const response = await fetch(`${API_BASE}/users/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          const profile: UserProfile = {
            id: data.data.id,
            name: data.data.full_name,
            email: data.data.email,
            phone: data.data.phone || "",
            department: data.data.department_name || "Chưa phân bổ",
            position: data.data.position || "Nhân viên",
            joinDate: data.data.created_at
              ? new Date(data.data.created_at).toLocaleDateString("vi-VN")
              : "",
            address: data.data.address || "",
            avatarUrl:
              data.data.avatar_url ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                data.data.full_name
              )}&background=6366f1&color=fff`,
            role: data.data.role || "Employee",
            bio: data.data.bio || "",
          };
          setUser(profile);
          setFormData(profile);
          return;
        }
      }

      // Fallback to stored user if API fails
      const storedUser = authService.getStoredUser() as any;
      if (storedUser) {
        const profile: UserProfile = {
          id: storedUser.id || "1",
          name: storedUser.full_name || storedUser.name || "User",
          email: storedUser.email || "user@nexus.vn",
          phone: storedUser.phone || "",
          department:
            storedUser.department_name ||
            storedUser.department ||
            "Chưa phân bổ",
          position: storedUser.position || "Nhân viên",
          joinDate: storedUser.created_at
            ? new Date(storedUser.created_at).toLocaleDateString("vi-VN")
            : "",
          address: storedUser.address || "",
          avatarUrl:
            storedUser.avatar_url ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              storedUser.full_name || "User"
            )}&background=6366f1&color=fff`,
          role: storedUser.role || "Employee",
          bio: storedUser.bio || "",
        };
        setUser(profile);
        setFormData(profile);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      // Fetch real project count
      const projectsResponse = await fetch(`${API_BASE}/projects/my-projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      let projectCount = 0;
      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json();
        projectCount = Array.isArray(projectsData)
          ? projectsData.length
          : projectsData.data
            ? projectsData.data.length
            : 0;
      }

      // Fetch tasks count - could be from tasks API
      const tasksResponse = await fetch(`${API_BASE}/tasks/my-tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      let taskCount = 0;
      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json();
        taskCount = Array.isArray(tasksData)
          ? tasksData.filter((t: any) => t.status === "Completed").length
          : tasksData.data
            ? tasksData.data.filter((t: any) => t.status === "Completed").length
            : 0;
      }

      setStats({
        projectCount,
        taskCount,
        achievementCount: 0, // This could be fetched from achievements API if available
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const handleAvatarClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("❌ File quá lớn. Kích thước tối đa là 2MB");
      return;
    }

    // Validate file type
    if (
      !["image/jpeg", "image/png", "image/gif", "image/webp"].includes(
        file.type
      )
    ) {
      alert("❌ Chỉ cho phép upload file ảnh (JPEG, PNG, GIF, WebP)");
      return;
    }

    setUploadingAvatar(true);
    try {
      const token = localStorage.getItem("accessToken");
      const formDataUpload = new FormData();
      formDataUpload.append("avatar", file);

      const response = await fetch(`${API_BASE}/upload/avatar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataUpload,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Upload thất bại");
      }

      // Update local state with new avatar
      const newAvatarUrl = data.data.url;
      setUser((prev) => (prev ? { ...prev, avatarUrl: newAvatarUrl } : null));
      setFormData((prev) => ({ ...prev, avatarUrl: newAvatarUrl }));

      // Update stored user in localStorage
      const storedUser = authService.getStoredUser();
      if (storedUser) {
        const updatedUser = { ...storedUser, avatar_url: newAvatarUrl };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        // Dispatch custom event for same-tab updates
        window.dispatchEvent(new Event("userUpdated"));
      }

      alert("✅ Cập nhật avatar thành công!");
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      alert("❌ " + (error.message || "Có lỗi xảy ra khi upload avatar"));
    } finally {
      setUploadingAvatar(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Call real API to update profile
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${API_BASE}/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_name: formData.name,
          phone: formData.phone,
          position: formData.position,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Có lỗi xảy ra");
      }

      // Update local state with returned data
      if (data.data) {
        const updatedProfile: UserProfile = {
          id: data.data.id,
          name: data.data.full_name,
          email: data.data.email,
          phone: data.data.phone || "",
          department: data.data.department_name || user?.department,
          position: data.data.position || "",
          joinDate: data.data.created_at
            ? new Date(data.data.created_at).toLocaleDateString("vi-VN")
            : user?.joinDate,
          address: user?.address || "",
          avatarUrl: data.data.avatar_url || user?.avatarUrl,
          role: data.data.role,
          bio: user?.bio || "",
        };
        setUser(updatedProfile);
        setFormData(updatedProfile);

        // Update stored user in localStorage
        const storedUser = authService.getStoredUser();
        if (storedUser) {
          const updatedStoredUser = {
            ...storedUser,
            full_name: data.data.full_name,
            phone: data.data.phone,
            position: data.data.position,
            avatar_url: data.data.avatar_url,
          };
          localStorage.setItem("user", JSON.stringify(updatedStoredUser));
          // Dispatch custom event for same-tab updates
          window.dispatchEvent(new Event("userUpdated"));
        }
      }

      setIsEditing(false);
      alert("✅ Cập nhật thông tin thành công!");
    } catch (error: any) {
      console.error("Error saving profile:", error);
      alert("❌ " + (error.message || "Có lỗi xảy ra khi lưu thông tin"));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(user || {});
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-brand-600 border-t-transparent"></div>
          <p className="text-slate-500 font-medium text-sm">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Không tìm thấy thông tin người dùng</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Hồ sơ cá nhân</h1>
        <p className="text-slate-500 mt-1">
          Xem và chỉnh sửa thông tin cá nhân của bạn
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Cover & Avatar */}
        <div className="relative">
          <div className="h-32 bg-gradient-to-r from-brand-500 via-indigo-500 to-purple-500"></div>
          <div className="absolute -bottom-16 left-8">
            <div className="relative group">
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-32 h-32 rounded-2xl border-4 border-white shadow-lg object-cover"
              />
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleAvatarChange}
                className="hidden"
              />
              {/* Upload overlay */}
              {isEditing && (
                <button
                  onClick={handleAvatarClick}
                  disabled={uploadingAvatar}
                  className="absolute inset-0 bg-black/50 rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  {uploadingAvatar ? (
                    <Loader2 size={24} className="text-white animate-spin" />
                  ) : (
                    <>
                      <Camera size={24} className="text-white mb-1" />
                      <span className="text-white text-xs">Đổi ảnh</span>
                    </>
                  )}
                </button>
              )}
              {/* Camera button for quick access */}
              {isEditing && !uploadingAvatar && (
                <button
                  onClick={handleAvatarClick}
                  className="absolute bottom-2 right-2 p-2 bg-brand-600 text-white rounded-full hover:bg-brand-700 transition-colors shadow-lg"
                >
                  <Camera size={16} />
                </button>
              )}
              {uploadingAvatar && (
                <div className="absolute bottom-2 right-2 p-2 bg-brand-600 text-white rounded-full shadow-lg">
                  <Loader2 size={16} className="animate-spin" />
                </div>
              )}
            </div>
          </div>

          {/* Edit Button */}
          <div className="absolute top-4 right-4">
            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border-0"
              >
                <Edit2 size={16} className="mr-2" />
                Chỉnh sửa
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={handleCancel}
                  className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
                >
                  <X size={16} className="mr-1" />
                  Hủy
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-white text-brand-600 hover:bg-slate-50"
                >
                  {saving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-brand-600 border-t-transparent mr-2" />
                  ) : (
                    <Save size={16} className="mr-2" />
                  )}
                  Lưu
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* User Info */}
        <div className="pt-20 pb-8 px-8">
          <div className="flex items-center gap-3 mb-2">
            {isEditing ? (
              <input
                type="text"
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="text-2xl font-bold text-slate-900 border-b-2 border-brand-500 outline-none bg-transparent"
              />
            ) : (
              <h2 className="text-2xl font-bold text-slate-900">{user.name}</h2>
            )}
            <span className="px-3 py-1 bg-brand-100 text-brand-700 text-xs font-semibold rounded-full">
              {user.role}
            </span>
          </div>

          {isEditing ? (
            <input
              type="text"
              value={formData.position || ""}
              onChange={(e) =>
                setFormData({ ...formData, position: e.target.value })
              }
              placeholder="Chức vụ"
              className="text-slate-600 border-b border-slate-300 outline-none bg-transparent w-full max-w-xs"
            />
          ) : (
            <p className="text-slate-600">
              {user.position} • {user.department}
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 border-t border-b border-slate-100">
          <div className="px-8 py-6 text-center border-r border-slate-100">
            <div className="flex items-center justify-center gap-2 text-brand-600 mb-2">
              <Briefcase size={20} />
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {stats.projectCount}
            </p>
            <p className="text-xs text-slate-500">Dự án tham gia</p>
          </div>
          <div className="px-8 py-6 text-center border-r border-slate-100">
            <div className="flex items-center justify-center gap-2 text-green-600 mb-2">
              <CheckCircle size={20} />
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {stats.taskCount}
            </p>
            <p className="text-xs text-slate-500">Task hoàn thành</p>
          </div>
          <div className="px-8 py-6 text-center">
            <div className="flex items-center justify-center gap-2 text-amber-600 mb-2">
              <Award size={20} />
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {stats.achievementCount}
            </p>
            <p className="text-xs text-slate-500">Thành tích</p>
          </div>
        </div>

        {/* Details Form */}
        <div className="p-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">
            Thông tin chi tiết
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-slate-100 rounded-lg">
                <Mail size={20} className="text-slate-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500 mb-1">Email</p>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full text-sm font-medium text-slate-900 border-b border-slate-300 outline-none bg-transparent py-1"
                  />
                ) : (
                  <p className="text-sm font-medium text-slate-900">
                    {user.email}
                  </p>
                )}
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-slate-100 rounded-lg">
                <Phone size={20} className="text-slate-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500 mb-1">Số điện thoại</p>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full text-sm font-medium text-slate-900 border-b border-slate-300 outline-none bg-transparent py-1"
                  />
                ) : (
                  <p className="text-sm font-medium text-slate-900">
                    {user.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Department */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-slate-100 rounded-lg">
                <Building size={20} className="text-slate-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500 mb-1">Phòng ban</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.department || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value })
                    }
                    className="w-full text-sm font-medium text-slate-900 border-b border-slate-300 outline-none bg-transparent py-1"
                  />
                ) : (
                  <p className="text-sm font-medium text-slate-900">
                    {user.department}
                  </p>
                )}
              </div>
            </div>

            {/* Join Date */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-slate-100 rounded-lg">
                <Calendar size={20} className="text-slate-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500 mb-1">Ngày vào làm</p>
                <p className="text-sm font-medium text-slate-900">
                  {user.joinDate}
                </p>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start gap-4 md:col-span-2">
              <div className="p-3 bg-slate-100 rounded-lg">
                <MapPin size={20} className="text-slate-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500 mb-1">Địa chỉ</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.address || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="w-full text-sm font-medium text-slate-900 border-b border-slate-300 outline-none bg-transparent py-1"
                  />
                ) : (
                  <p className="text-sm font-medium text-slate-900">
                    {user.address}
                  </p>
                )}
              </div>
            </div>

            {/* Bio */}
            <div className="md:col-span-2">
              <p className="text-xs text-slate-500 mb-2">Giới thiệu bản thân</p>
              {isEditing ? (
                <textarea
                  value={formData.bio || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  rows={3}
                  className="w-full text-sm text-slate-700 border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Viết vài dòng giới thiệu về bản thân..."
                />
              ) : (
                <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-lg">
                  {user.bio}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
