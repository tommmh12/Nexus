import React, { useState } from "react";

// Mock user data for UI preview
const MOCK_USER_PROFILE = {
  id: "1",
  fullName: "Nguyễn Văn Bình",
  email: "binh.nguyen@company.com",
  phone: "0901234567",
  department: "Phòng Kỹ thuật",
  position: "Senior Developer",
  employeeId: "NV001234",
  joinDate: "2021-03-15",
  avatar: null,
  address: "123 Nguyễn Huệ, Quận 1, TP.HCM",
  dateOfBirth: "1995-06-20",
  gender: "male" as const,
  emergencyContact: {
    name: "Nguyễn Văn An",
    relationship: "Anh",
    phone: "0987654321",
  },
};

const MOCK_ACTIVITY_LOG = [
  {
    id: "1",
    action: "Đăng nhập",
    time: "10:30 hôm nay",
    device: "Chrome / Windows",
  },
  {
    id: "2",
    action: "Cập nhật thông tin cá nhân",
    time: "15:45 hôm qua",
    device: "Chrome / Windows",
  },
  {
    id: "3",
    action: "Đổi mật khẩu",
    time: "09:20, 12/06/2024",
    device: "Mobile App / iOS",
  },
  {
    id: "4",
    action: "Đăng nhập",
    time: "08:00, 12/06/2024",
    device: "Mobile App / iOS",
  },
];

const MOCK_SKILLS = [
  { name: "React", level: 90 },
  { name: "TypeScript", level: 85 },
  { name: "Node.js", level: 80 },
  { name: "PostgreSQL", level: 75 },
  { name: "Docker", level: 70 },
];

export default function UserProfile() {
  // Mock logout function for UI preview
  const logout = () => console.log("Logging out...");
  const [activeTab, setActiveTab] = useState<
    "profile" | "security" | "preferences" | "activity"
  >("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [editForm, setEditForm] = useState({
    phone: MOCK_USER_PROFILE.phone,
    address: MOCK_USER_PROFILE.address,
    emergencyContactName: MOCK_USER_PROFILE.emergencyContact.name,
    emergencyContactPhone: MOCK_USER_PROFILE.emergencyContact.phone,
    emergencyContactRelationship:
      MOCK_USER_PROFILE.emergencyContact.relationship,
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: true,
    weeklyReport: false,
    darkMode: false,
    language: "vi",
  });

  const handleSaveProfile = () => {
    console.log("Saving profile:", editForm);
    setIsEditing(false);
  };

  const handleChangePassword = () => {
    console.log("Changing password");
    setShowChangePassword(false);
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with Profile Card */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-900 rounded-2xl overflow-hidden">
        {/* Cover */}
        <div className="h-32 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

        {/* Profile Info */}
        <div className="px-6 pb-6 -mt-16">
          <div className="flex items-end gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center text-4xl font-bold border-4 border-white shadow-lg">
                {MOCK_USER_PROFILE.fullName.charAt(0)}
              </div>
              <button className="absolute bottom-2 right-2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:bg-gray-50">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
            </div>

            {/* Info */}
            <div className="flex-1 pb-2">
              <h1 className="text-2xl font-bold text-white">
                {MOCK_USER_PROFILE.fullName}
              </h1>
              <p className="text-slate-300">{MOCK_USER_PROFILE.position}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                <span className="flex items-center gap-1">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  {MOCK_USER_PROFILE.department}
                </span>
                <span className="flex items-center gap-1">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                    />
                  </svg>
                  {MOCK_USER_PROFILE.employeeId}
                </span>
                <span className="flex items-center gap-1">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Từ{" "}
                  {new Date(MOCK_USER_PROFILE.joinDate).toLocaleDateString(
                    "vi-VN"
                  )}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pb-2">
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                ✏️ Chỉnh sửa
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="flex border-b border-gray-100">
          {[
            { key: "profile", label: "Thông tin cá nhân", icon: "👤" },
            { key: "security", label: "Bảo mật", icon: "🔒" },
            { key: "preferences", label: "Tùy chọn", icon: "⚙️" },
            { key: "activity", label: "Hoạt động", icon: "📋" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex-1 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Main Content */}
        <div className="col-span-8">
          {activeTab === "profile" && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">
                Thông tin cá nhân
              </h3>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">
                    Họ và tên
                  </label>
                  <p className="font-medium text-gray-800">
                    {MOCK_USER_PROFILE.fullName}
                  </p>
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">
                    Email
                  </label>
                  <p className="font-medium text-gray-800">
                    {MOCK_USER_PROFILE.email}
                  </p>
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">
                    Số điện thoại
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.phone}
                      onChange={(e) =>
                        setEditForm({ ...editForm, phone: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="font-medium text-gray-800">
                      {MOCK_USER_PROFILE.phone}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">
                    Ngày sinh
                  </label>
                  <p className="font-medium text-gray-800">
                    {new Date(MOCK_USER_PROFILE.dateOfBirth).toLocaleDateString(
                      "vi-VN"
                    )}
                  </p>
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">
                    Giới tính
                  </label>
                  <p className="font-medium text-gray-800">
                    {MOCK_USER_PROFILE.gender === "male" ? "Nam" : "Nữ"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">
                    Phòng ban
                  </label>
                  <p className="font-medium text-gray-800">
                    {MOCK_USER_PROFILE.department}
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm text-gray-500 mb-1">
                    Địa chỉ
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.address}
                      onChange={(e) =>
                        setEditForm({ ...editForm, address: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="font-medium text-gray-800">
                      {MOCK_USER_PROFILE.address}
                    </p>
                  )}
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <h4 className="font-semibold text-gray-800 mb-4">
                  Liên hệ khẩn cấp
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">
                      Họ tên
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.emergencyContactName}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            emergencyContactName: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="font-medium text-gray-800">
                        {MOCK_USER_PROFILE.emergencyContact.name}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">
                      Mối quan hệ
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.emergencyContactRelationship}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            emergencyContactRelationship: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="font-medium text-gray-800">
                        {MOCK_USER_PROFILE.emergencyContact.relationship}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">
                      Số điện thoại
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.emergencyContactPhone}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            emergencyContactPhone: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="font-medium text-gray-800">
                        {MOCK_USER_PROFILE.emergencyContact.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Lưu thay đổi
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-4">
              {/* Change Password */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-800">🔐 Mật khẩu</h3>
                    <p className="text-sm text-gray-500">
                      Đổi mật khẩu định kỳ để bảo vệ tài khoản
                    </p>
                  </div>
                  <button
                    onClick={() => setShowChangePassword(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Đổi mật khẩu
                  </button>
                </div>
              </div>

              {/* Two-Factor Auth */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      🛡️ Xác thực 2 yếu tố
                    </h3>
                    <p className="text-sm text-gray-500">
                      Thêm lớp bảo mật cho tài khoản
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                    Chưa kích hoạt
                  </span>
                </div>
              </div>

              {/* Active Sessions */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-800 mb-4">
                  📱 Phiên đăng nhập
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">💻</span>
                      <div>
                        <p className="font-medium text-gray-800">
                          Chrome / Windows
                        </p>
                        <p className="text-sm text-gray-500">
                          Phiên hiện tại • TP.HCM
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                      Đang hoạt động
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">📱</span>
                      <div>
                        <p className="font-medium text-gray-800">
                          Mobile App / iOS
                        </p>
                        <p className="text-sm text-gray-500">
                          2 ngày trước • TP.HCM
                        </p>
                      </div>
                    </div>
                    <button className="text-red-500 hover:text-red-700 text-sm">
                      Đăng xuất
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "preferences" && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">
                Tùy chọn cá nhân
              </h3>

              <div className="space-y-6">
                {/* Notifications */}
                <div>
                  <h4 className="font-medium text-gray-800 mb-4">
                    🔔 Thông báo
                  </h4>
                  <div className="space-y-3">
                    {[
                      {
                        key: "emailNotifications",
                        label: "Thông báo qua Email",
                        desc: "Nhận thông báo quan trọng qua email",
                      },
                      {
                        key: "pushNotifications",
                        label: "Thông báo đẩy",
                        desc: "Nhận thông báo trên trình duyệt",
                      },
                      {
                        key: "weeklyReport",
                        label: "Báo cáo tuần",
                        desc: "Nhận báo cáo tổng hợp hàng tuần",
                      },
                    ].map((item) => (
                      <div
                        key={item.key}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-800">
                            {item.label}
                          </p>
                          <p className="text-sm text-gray-500">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={
                              preferences[
                                item.key as keyof typeof preferences
                              ] as boolean
                            }
                            onChange={(e) =>
                              setPreferences({
                                ...preferences,
                                [item.key]: e.target.checked,
                              })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Display */}
                <div>
                  <h4 className="font-medium text-gray-800 mb-4">
                    🎨 Hiển thị
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800">Chế độ tối</p>
                        <p className="text-sm text-gray-500">
                          Giao diện tối cho mắt
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.darkMode}
                          onChange={(e) =>
                            setPreferences({
                              ...preferences,
                              darkMode: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800">Ngôn ngữ</p>
                        <p className="text-sm text-gray-500">
                          Chọn ngôn ngữ hiển thị
                        </p>
                      </div>
                      <select
                        value={preferences.language}
                        onChange={(e) =>
                          setPreferences({
                            ...preferences,
                            language: e.target.value,
                          })
                        }
                        className="px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="vi">Tiếng Việt</option>
                        <option value="en">English</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "activity" && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">
                Lịch sử hoạt động
              </h3>
              <div className="space-y-4">
                {MOCK_ACTIVITY_LOG.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{log.action}</p>
                      <p className="text-sm text-gray-500">{log.device}</p>
                    </div>
                    <span className="text-sm text-gray-400">{log.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="col-span-4 space-y-4">
          {/* Quick Stats */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="font-semibold text-gray-800 mb-4">📊 Thống kê</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Ngày làm việc</span>
                <span className="font-bold text-gray-800">1,234 ngày</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Dự án tham gia</span>
                <span className="font-bold text-gray-800">15</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Task hoàn thành</span>
                <span className="font-bold text-gray-800">328</span>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="font-semibold text-gray-800 mb-4">💪 Kỹ năng</h3>
            <div className="space-y-3">
              {MOCK_SKILLS.map((skill) => (
                <div key={skill.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700">{skill.name}</span>
                    <span className="text-xs text-gray-500">
                      {skill.level}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all"
                      style={{ width: `${skill.level}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={() => logout?.()}
            className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Đăng xuất
          </button>
        </div>
      </div>

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">🔐 Đổi mật khẩu</h3>
              <button
                onClick={() => setShowChangePassword(false)}
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
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu hiện tại
                </label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      currentPassword: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      newPassword: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Xác nhận mật khẩu mới
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setShowChangePassword(false)}
                  className="flex-1 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleChangePassword}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Đổi mật khẩu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
