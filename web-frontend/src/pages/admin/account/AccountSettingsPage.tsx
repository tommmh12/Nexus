import React, { useState, useEffect, useCallback } from "react";
import {
  Settings,
  Bell,
  Globe,
  Moon,
  Sun,
  Monitor,
  Mail,
  MessageSquare,
  Shield,
  Smartphone,
  Save,
  CheckCircle,
  Clock,
  Calendar,
  FolderOpen,
  Users,
  Newspaper,
  MessageCircle,
  CalendarCheck,
  AlertTriangle,
  RefreshCw,
  BellOff,
} from "lucide-react";
import { Button } from "../../../components/system/ui/Button";
import {
  notificationSettingsService,
  NotificationSettings,
  NotificationSettingsUpdate,
} from "../../../services/notificationSettingsService";

const Toggle = ({
  enabled,
  onChange,
  disabled = false,
}: {
  enabled: boolean;
  onChange: () => void;
  disabled?: boolean;
}) => (
  <button
    onClick={onChange}
    disabled={disabled}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
      disabled ? "opacity-50 cursor-not-allowed" : ""
    } ${enabled ? "bg-brand-600" : "bg-slate-300"}`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow ${
        enabled ? "translate-x-6" : "translate-x-1"
      }`}
    />
  </button>
);

// Notification type group for UI
interface NotificationTypeItem {
  key: keyof NotificationSettings;
  label: string;
  description: string;
  icon: React.ElementType;
}

const notificationTypeGroups: {
  title: string;
  items: NotificationTypeItem[];
}[] = [
  {
    title: "Công việc & Dự án",
    items: [
      {
        key: "notify_on_task_assign",
        label: "Được giao task mới",
        description: "Khi bạn được giao một task mới",
        icon: CheckCircle,
      },
      {
        key: "notify_on_task_update",
        label: "Cập nhật task",
        description: "Khi task của bạn được cập nhật",
        icon: RefreshCw,
      },
      {
        key: "notify_on_task_complete",
        label: "Hoàn thành task",
        description: "Khi task được đánh dấu hoàn thành",
        icon: CheckCircle,
      },
      {
        key: "notify_on_project_update",
        label: "Cập nhật dự án",
        description: "Khi dự án bạn tham gia có thay đổi",
        icon: FolderOpen,
      },
    ],
  },
  {
    title: "Giao tiếp",
    items: [
      {
        key: "notify_on_comment",
        label: "Bình luận",
        description: "Khi có người bình luận bài viết của bạn",
        icon: MessageSquare,
      },
      {
        key: "notify_on_mention",
        label: "Được nhắc đến (@mention)",
        description: "Khi được @mention trong bài viết",
        icon: Users,
      },
      {
        key: "notify_on_chat_message",
        label: "Tin nhắn mới",
        description: "Khi nhận được tin nhắn chat",
        icon: MessageCircle,
      },
      {
        key: "notify_on_forum_reply",
        label: "Trả lời diễn đàn",
        description: "Khi bài đăng forum được trả lời",
        icon: MessageSquare,
      },
    ],
  },
  {
    title: "Cuộc họp & Đặt phòng",
    items: [
      {
        key: "notify_on_meeting",
        label: "Cuộc họp sắp diễn ra",
        description: "Nhắc nhở trước cuộc họp",
        icon: Calendar,
      },
      {
        key: "notify_on_meeting_invite",
        label: "Mời họp",
        description: "Khi được mời vào cuộc họp",
        icon: CalendarCheck,
      },
      {
        key: "notify_on_booking_status",
        label: "Trạng thái đặt phòng",
        description: "Khi yêu cầu đặt phòng được duyệt/từ chối",
        icon: CalendarCheck,
      },
    ],
  },
  {
    title: "Tin tức & Hệ thống",
    items: [
      {
        key: "notify_on_news",
        label: "Tin tức mới",
        description: "Khi có bài viết tin tức mới",
        icon: Newspaper,
      },
      {
        key: "notify_on_system_alert",
        label: "Cảnh báo hệ thống",
        description: "Thông báo bảo trì, lỗi hệ thống",
        icon: AlertTriangle,
      },
      {
        key: "notify_on_personnel_change",
        label: "Thay đổi nhân sự",
        description: "Khi có thay đổi nhân sự phòng ban",
        icon: Users,
      },
    ],
  },
];

export const AccountSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState("notifications");
  const [hasChanges, setHasChanges] = useState(false);

  // Display settings (local state)
  const [displaySettings, setDisplaySettings] = useState({
    language: "vi",
    theme: "system" as "light" | "dark" | "system",
    timezone: "Asia/Ho_Chi_Minh",
    dateFormat: "DD/MM/YYYY",
  });

  // Privacy settings (local state)
  const [privacySettings, setPrivacySettings] = useState({
    showOnlineStatus: true,
    showEmail: false,
    showPhone: false,
    allowSearchByEmail: true,
  });

  // Fetch settings on mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await notificationSettingsService.getSettings();
      if (result.success) {
        setSettings(result.data);
      }
    } catch (err: any) {
      console.error("Error fetching settings:", err);
      setError("Không thể tải cài đặt. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    setError(null);
    try {
      const updateData: NotificationSettingsUpdate = {
        email_enabled: settings.email_enabled,
        push_enabled: settings.push_enabled,
        sms_enabled: settings.sms_enabled,
        in_app_enabled: settings.in_app_enabled,
        notify_on_comment: settings.notify_on_comment,
        notify_on_mention: settings.notify_on_mention,
        notify_on_task_assign: settings.notify_on_task_assign,
        notify_on_task_update: settings.notify_on_task_update,
        notify_on_task_complete: settings.notify_on_task_complete,
        notify_on_project_update: settings.notify_on_project_update,
        notify_on_meeting: settings.notify_on_meeting,
        notify_on_meeting_invite: settings.notify_on_meeting_invite,
        notify_on_booking_status: settings.notify_on_booking_status,
        notify_on_news: settings.notify_on_news,
        notify_on_forum_reply: settings.notify_on_forum_reply,
        notify_on_chat_message: settings.notify_on_chat_message,
        notify_on_system_alert: settings.notify_on_system_alert,
        notify_on_personnel_change: settings.notify_on_personnel_change,
        dnd_enabled: settings.dnd_enabled,
        dnd_start_time: settings.dnd_start_time,
        dnd_end_time: settings.dnd_end_time,
        dnd_weekends_only: settings.dnd_weekends_only,
        email_digest_enabled: settings.email_digest_enabled,
        email_digest_frequency: settings.email_digest_frequency,
      };

      const result = await notificationSettingsService.updateSettings(
        updateData
      );
      if (result.success) {
        setSettings(result.data);
        setSaved(true);
        setHasChanges(false);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err: any) {
      console.error("Error saving settings:", err);
      setError("Không thể lưu cài đặt. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = <K extends keyof NotificationSettings>(
    key: K,
    value: NotificationSettings[K]
  ) => {
    if (!settings) return;
    setSettings((prev) => (prev ? { ...prev, [key]: value } : null));
    setHasChanges(true);
  };

  const updateDisplaySetting = <K extends keyof typeof displaySettings>(
    key: K,
    value: (typeof displaySettings)[K]
  ) => {
    setDisplaySettings((prev) => ({ ...prev, [key]: value }));
  };

  const updatePrivacySetting = <K extends keyof typeof privacySettings>(
    key: K,
    value: (typeof privacySettings)[K]
  ) => {
    setPrivacySettings((prev) => ({ ...prev, [key]: value }));
  };

  const sections = [
    { id: "notifications", label: "Thông báo", icon: Bell },
    { id: "display", label: "Hiển thị", icon: Monitor },
    { id: "privacy", label: "Quyền riêng tư", icon: Shield },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="animate-spin text-brand-600 mr-2" size={24} />
        <span className="text-slate-500">Đang tải cài đặt...</span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Cài đặt tài khoản
          </h1>
          <p className="text-slate-500 mt-1">
            Tùy chỉnh thông báo và trải nghiệm sử dụng của bạn
          </p>
        </div>
        <div className="flex gap-2">
          {hasChanges && (
            <span className="text-sm text-amber-600 flex items-center mr-2">
              <AlertTriangle size={14} className="mr-1" />
              Có thay đổi chưa lưu
            </span>
          )}
          <Button onClick={handleSave} disabled={saving || !hasChanges}>
            {saving ? (
              <>
                <RefreshCw size={18} className="mr-2 animate-spin" />
                Đang lưu...
              </>
            ) : saved ? (
              <>
                <CheckCircle size={18} className="mr-2" />
                Đã lưu!
              </>
            ) : (
              <>
                <Save size={18} className="mr-2" />
                Lưu thay đổi
              </>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-6">
        {/* Sidebar Navigation */}
        <div className="w-52 shrink-0">
          <nav className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 sticky top-6">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeSection === section.id
                    ? "bg-brand-50 text-brand-700"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <section.icon size={18} />
                {section.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {/* Notifications Section */}
          {activeSection === "notifications" && settings && (
            <>
              {/* Notification Channels */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-fadeIn">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                  <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <Bell size={20} className="text-brand-600" />
                    Kênh nhận thông báo
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Chọn cách bạn muốn nhận thông báo
                  </p>
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Bell size={20} className="text-slate-500" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          Thông báo trong ứng dụng
                        </p>
                        <p className="text-xs text-slate-500">
                          Hiển thị thông báo trên giao diện
                        </p>
                      </div>
                    </div>
                    <Toggle
                      enabled={settings.in_app_enabled}
                      onChange={() =>
                        updateSetting(
                          "in_app_enabled",
                          !settings.in_app_enabled
                        )
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Mail size={20} className="text-slate-500" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          Email
                        </p>
                        <p className="text-xs text-slate-500">
                          Nhận thông báo qua email
                        </p>
                      </div>
                    </div>
                    <Toggle
                      enabled={settings.email_enabled}
                      onChange={() =>
                        updateSetting("email_enabled", !settings.email_enabled)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Monitor size={20} className="text-slate-500" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          Push Notification
                        </p>
                        <p className="text-xs text-slate-500">
                          Thông báo đẩy trên trình duyệt
                        </p>
                      </div>
                    </div>
                    <Toggle
                      enabled={settings.push_enabled}
                      onChange={() =>
                        updateSetting("push_enabled", !settings.push_enabled)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Smartphone size={20} className="text-slate-500" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          SMS
                        </p>
                        <p className="text-xs text-slate-500">
                          Nhận tin nhắn SMS (chỉ thông báo quan trọng)
                        </p>
                      </div>
                    </div>
                    <Toggle
                      enabled={settings.sms_enabled}
                      onChange={() =>
                        updateSetting("sms_enabled", !settings.sms_enabled)
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Do Not Disturb */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-fadeIn">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                  <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <BellOff size={20} className="text-brand-600" />
                    Chế độ không làm phiền
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Tắt thông báo trong khoảng thời gian cụ thể
                  </p>
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Clock size={20} className="text-slate-500" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          Bật chế độ không làm phiền
                        </p>
                        <p className="text-xs text-slate-500">
                          Không nhận thông báo trong khoảng thời gian đã đặt
                        </p>
                      </div>
                    </div>
                    <Toggle
                      enabled={settings.dnd_enabled}
                      onChange={() =>
                        updateSetting("dnd_enabled", !settings.dnd_enabled)
                      }
                    />
                  </div>

                  {settings.dnd_enabled && (
                    <div className="pl-12 space-y-4">
                      <div className="flex gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1">
                            Từ
                          </label>
                          <input
                            type="time"
                            value={
                              settings.dnd_start_time?.slice(0, 5) || "22:00"
                            }
                            onChange={(e) =>
                              updateSetting(
                                "dnd_start_time",
                                e.target.value + ":00"
                              )
                            }
                            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1">
                            Đến
                          </label>
                          <input
                            type="time"
                            value={
                              settings.dnd_end_time?.slice(0, 5) || "07:00"
                            }
                            onChange={(e) =>
                              updateSetting(
                                "dnd_end_time",
                                e.target.value + ":00"
                              )
                            }
                            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
                          />
                        </div>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.dnd_weekends_only}
                          onChange={() =>
                            updateSetting(
                              "dnd_weekends_only",
                              !settings.dnd_weekends_only
                            )
                          }
                          className="rounded text-brand-600"
                        />
                        <span className="text-sm text-slate-700">
                          Chỉ áp dụng vào cuối tuần
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Email Digest */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-fadeIn">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                  <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <Mail size={20} className="text-brand-600" />
                    Email tổng hợp
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Nhận email tổng hợp thay vì từng thông báo riêng lẻ
                  </p>
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        Bật email tổng hợp
                      </p>
                      <p className="text-xs text-slate-500">
                        Gom nhiều thông báo vào 1 email
                      </p>
                    </div>
                    <Toggle
                      enabled={settings.email_digest_enabled}
                      onChange={() =>
                        updateSetting(
                          "email_digest_enabled",
                          !settings.email_digest_enabled
                        )
                      }
                    />
                  </div>

                  {settings.email_digest_enabled && (
                    <div className="pl-4">
                      <label className="block text-xs font-semibold text-slate-500 mb-2">
                        Tần suất
                      </label>
                      <select
                        value={settings.email_digest_frequency}
                        onChange={(e) =>
                          updateSetting(
                            "email_digest_frequency",
                            e.target.value as any
                          )
                        }
                        className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
                      >
                        <option value="daily">Hàng ngày</option>
                        <option value="weekly">Hàng tuần</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Notification Types */}
              {notificationTypeGroups.map((group) => (
                <div
                  key={group.title}
                  className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-fadeIn"
                >
                  <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                    <h2 className="text-lg font-semibold text-slate-900">
                      {group.title}
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      Tùy chọn loại thông báo muốn nhận
                    </p>
                  </div>

                  <div className="p-6 space-y-3">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isEnabled = settings[item.key] as boolean;
                      return (
                        <div
                          key={item.key}
                          className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                              <Icon size={20} className="text-slate-500" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900">
                                {item.label}
                              </p>
                              <p className="text-xs text-slate-500">
                                {item.description}
                              </p>
                            </div>
                          </div>
                          <Toggle
                            enabled={isEnabled}
                            onChange={() => updateSetting(item.key, !isEnabled)}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Display Section */}
          {activeSection === "display" && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-fadeIn">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Monitor size={20} className="text-brand-600" />
                  Cài đặt hiển thị
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Tùy chỉnh giao diện và ngôn ngữ
                </p>
              </div>

              <div className="p-6 space-y-6">
                {/* Language */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    <Globe size={16} className="inline mr-2" />
                    Ngôn ngữ
                  </label>
                  <select
                    value={displaySettings.language}
                    onChange={(e) =>
                      updateDisplaySetting("language", e.target.value)
                    }
                    className="w-full max-w-xs bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  >
                    <option value="vi">🇻🇳 Tiếng Việt</option>
                    <option value="en">🇺🇸 English</option>
                  </select>
                </div>

                {/* Theme */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Giao diện
                  </label>
                  <div className="flex gap-3">
                    {[
                      { value: "light" as const, label: "Sáng", icon: Sun },
                      { value: "dark" as const, label: "Tối", icon: Moon },
                      {
                        value: "system" as const,
                        label: "Tự động",
                        icon: Monitor,
                      },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() =>
                          updateDisplaySetting("theme", option.value)
                        }
                        className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                          displaySettings.theme === option.value
                            ? "border-brand-500 bg-brand-50 text-brand-700"
                            : "border-slate-200 hover:border-slate-300 text-slate-600"
                        }`}
                      >
                        <option.icon size={18} />
                        <span className="text-sm font-medium">
                          {option.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Timezone */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Múi giờ
                  </label>
                  <select
                    value={displaySettings.timezone}
                    onChange={(e) =>
                      updateDisplaySetting("timezone", e.target.value)
                    }
                    className="w-full max-w-xs bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  >
                    <option value="Asia/Ho_Chi_Minh">
                      (GMT+7) Hà Nội, TP.HCM
                    </option>
                    <option value="Asia/Bangkok">(GMT+7) Bangkok</option>
                    <option value="Asia/Singapore">(GMT+8) Singapore</option>
                  </select>
                </div>

                {/* Date Format */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Định dạng ngày
                  </label>
                  <select
                    value={displaySettings.dateFormat}
                    onChange={(e) =>
                      updateDisplaySetting("dateFormat", e.target.value)
                    }
                    className="w-full max-w-xs bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY (31/12/2024)</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY (12/31/2024)</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD (2024-12-31)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Privacy Section */}
          {activeSection === "privacy" && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-fadeIn">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Shield size={20} className="text-brand-600" />
                  Quyền riêng tư
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Kiểm soát thông tin hiển thị với người khác
                </p>
              </div>

              <div className="p-6 space-y-4">
                {[
                  {
                    key: "showOnlineStatus" as const,
                    label: "Hiển thị trạng thái online",
                    description: "Người khác có thể thấy khi bạn đang online",
                  },
                  {
                    key: "showEmail" as const,
                    label: "Hiển thị email",
                    description: "Email của bạn hiển thị trên hồ sơ công khai",
                  },
                  {
                    key: "showPhone" as const,
                    label: "Hiển thị số điện thoại",
                    description: "Số điện thoại hiển thị trên hồ sơ công khai",
                  },
                  {
                    key: "allowSearchByEmail" as const,
                    label: "Cho phép tìm kiếm qua email",
                    description:
                      "Người khác có thể tìm thấy bạn bằng địa chỉ email",
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {item.label}
                      </p>
                      <p className="text-xs text-slate-500">
                        {item.description}
                      </p>
                    </div>
                    <Toggle
                      enabled={privacySettings[item.key]}
                      onChange={() =>
                        updatePrivacySetting(
                          item.key,
                          !privacySettings[item.key]
                        )
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountSettingsPage;
