import React, { useState, useEffect } from "react";
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
    ToggleLeft,
    ToggleRight,
} from "lucide-react";
import { Button } from "../../../components/system/ui/Button";
import { authService } from "../../../services/authService";

interface AccountSettings {
    // Notification Settings
    emailNotifications: boolean;
    pushNotifications: boolean;
    smsNotifications: boolean;
    notifyOnComment: boolean;
    notifyOnMention: boolean;
    notifyOnTaskAssign: boolean;
    notifyOnMeeting: boolean;

    // Display Settings
    language: string;
    theme: "light" | "dark" | "system";
    timezone: string;
    dateFormat: string;

    // Privacy Settings
    showOnlineStatus: boolean;
    showEmail: boolean;
    showPhone: boolean;
    allowSearchByEmail: boolean;
}

const Toggle = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
    <button
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? "bg-brand-600" : "bg-slate-300"
            }`}
    >
        <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow ${enabled ? "translate-x-6" : "translate-x-1"
                }`}
        />
    </button>
);

export const AccountSettingsPage: React.FC = () => {
    const [settings, setSettings] = useState<AccountSettings>({
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        notifyOnComment: true,
        notifyOnMention: true,
        notifyOnTaskAssign: true,
        notifyOnMeeting: true,
        language: "vi",
        theme: "system",
        timezone: "Asia/Ho_Chi_Minh",
        dateFormat: "DD/MM/YYYY",
        showOnlineStatus: true,
        showEmail: false,
        showPhone: false,
        allowSearchByEmail: true,
    });

    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);
    const [activeSection, setActiveSection] = useState("notifications");

    const handleSave = async () => {
        setLoading(true);
        try {
            // TODO: API call to save settings
            // await userService.updateSettings(settings);

            await new Promise(resolve => setTimeout(resolve, 1000));
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            console.error("Error saving settings:", error);
            alert("❌ Có lỗi xảy ra khi lưu cài đặt");
        } finally {
            setLoading(false);
        }
    };

    const updateSetting = <K extends keyof AccountSettings>(key: K, value: AccountSettings[K]) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const sections = [
        { id: "notifications", label: "Thông báo", icon: Bell },
        { id: "display", label: "Hiển thị", icon: Monitor },
        { id: "privacy", label: "Quyền riêng tư", icon: Shield },
    ];

    return (
        <div className="max-w-4xl mx-auto animate-fadeIn">
            {/* Header */}
            <div className="mb-8 flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Cài đặt tài khoản</h1>
                    <p className="text-slate-500 mt-1">Tùy chỉnh trải nghiệm sử dụng của bạn</p>
                </div>
                <Button onClick={handleSave} disabled={loading}>
                    {loading ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
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

            <div className="flex gap-6">
                {/* Sidebar Navigation */}
                <div className="w-48 shrink-0">
                    <nav className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 sticky top-6">
                        {sections.map((section) => (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeSection === section.id
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
                <div className="flex-1">
                    {/* Notifications Section */}
                    {activeSection === "notifications" && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-fadeIn">
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                    <Bell size={20} className="text-brand-600" />
                                    Cài đặt thông báo
                                </h2>
                                <p className="text-sm text-slate-500 mt-1">Quản lý cách bạn nhận thông báo</p>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Notification Channels */}
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-700 mb-4">Kênh nhận thông báo</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <Mail size={20} className="text-slate-500" />
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900">Email</p>
                                                    <p className="text-xs text-slate-500">Nhận thông báo qua email</p>
                                                </div>
                                            </div>
                                            <Toggle
                                                enabled={settings.emailNotifications}
                                                onChange={() => updateSetting("emailNotifications", !settings.emailNotifications)}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <Bell size={20} className="text-slate-500" />
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900">Push Notification</p>
                                                    <p className="text-xs text-slate-500">Thông báo đẩy trên trình duyệt</p>
                                                </div>
                                            </div>
                                            <Toggle
                                                enabled={settings.pushNotifications}
                                                onChange={() => updateSetting("pushNotifications", !settings.pushNotifications)}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <Smartphone size={20} className="text-slate-500" />
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900">SMS</p>
                                                    <p className="text-xs text-slate-500">Nhận tin nhắn SMS</p>
                                                </div>
                                            </div>
                                            <Toggle
                                                enabled={settings.smsNotifications}
                                                onChange={() => updateSetting("smsNotifications", !settings.smsNotifications)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Notification Events */}
                                <div className="border-t border-slate-100 pt-6">
                                    <h3 className="text-sm font-semibold text-slate-700 mb-4">Thông báo khi</h3>
                                    <div className="space-y-3">
                                        {[
                                            { key: "notifyOnComment" as const, label: "Có người bình luận bài viết của tôi" },
                                            { key: "notifyOnMention" as const, label: "Được nhắc đến (@mention)" },
                                            { key: "notifyOnTaskAssign" as const, label: "Được giao task mới" },
                                            { key: "notifyOnMeeting" as const, label: "Cuộc họp sắp diễn ra" },
                                        ].map((item) => (
                                            <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={settings[item.key]}
                                                    onChange={() => updateSetting(item.key, !settings[item.key])}
                                                    className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
                                                />
                                                <span className="text-sm text-slate-700">{item.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Display Section */}
                    {activeSection === "display" && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-fadeIn">
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                    <Monitor size={20} className="text-brand-600" />
                                    Cài đặt hiển thị
                                </h2>
                                <p className="text-sm text-slate-500 mt-1">Tùy chỉnh giao diện và ngôn ngữ</p>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Language */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        <Globe size={16} className="inline mr-2" />
                                        Ngôn ngữ
                                    </label>
                                    <select
                                        value={settings.language}
                                        onChange={(e) => updateSetting("language", e.target.value)}
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
                                            { value: "system" as const, label: "Tự động", icon: Monitor },
                                        ].map((option) => (
                                            <button
                                                key={option.value}
                                                onClick={() => updateSetting("theme", option.value)}
                                                className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${settings.theme === option.value
                                                        ? "border-brand-500 bg-brand-50 text-brand-700"
                                                        : "border-slate-200 hover:border-slate-300 text-slate-600"
                                                    }`}
                                            >
                                                <option.icon size={18} />
                                                <span className="text-sm font-medium">{option.label}</span>
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
                                        value={settings.timezone}
                                        onChange={(e) => updateSetting("timezone", e.target.value)}
                                        className="w-full max-w-xs bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                                    >
                                        <option value="Asia/Ho_Chi_Minh">(GMT+7) Hà Nội, TP.HCM</option>
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
                                        value={settings.dateFormat}
                                        onChange={(e) => updateSetting("dateFormat", e.target.value)}
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
                                <p className="text-sm text-slate-500 mt-1">Kiểm soát thông tin hiển thị với người khác</p>
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
                                        description: "Người khác có thể tìm thấy bạn bằng địa chỉ email",
                                    },
                                ].map((item) => (
                                    <div key={item.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">{item.label}</p>
                                            <p className="text-xs text-slate-500">{item.description}</p>
                                        </div>
                                        <Toggle
                                            enabled={settings[item.key]}
                                            onChange={() => updateSetting(item.key, !settings[item.key])}
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
