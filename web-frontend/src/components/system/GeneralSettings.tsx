import React, { useState } from "react";
// TODO: Replace with API call
import { BackupFile, SystemConfig } from "../../types";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import {
  Save,
  Database,
  Cloud,
  RefreshCw,
  Server,
  Mail,
  MessageSquare,
  Download,
  Clock,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  FileArchive,
  Globe,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";

export const GeneralSettings = () => {
  const [activeTab, setActiveTab] = useState<"general" | "services" | "backup">(
    "general"
  );

  // Config State - Fully Controlled
  const [config, setConfig] = useState<
    SystemConfig & {
      systemName: string;
      adminEmail: string;
      emailPassword?: string;
      smsApiKey?: string;
    }
  >({
    systemName: "Nexus Internal Portal",
    adminEmail: "admin@nexus.com",
    maintenanceMode: false,
    language: "vi",
    theme: "light",
    emailService: {
      provider: "smtp",
      host: "smtp.gmail.com",
      port: "587",
      user: "system@nexus.com",
      isEnabled: true,
    },
    emailPassword: "password123", // Mock password state
    smsService: {
      provider: "twilio",
      apiKey: "sk_test_****************",
      isEnabled: false,
    },
  });

  // Backup State
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [isBackingUp, setIsBackingUp] = useState(false);

  const handleCreateBackup = () => {
    setIsBackingUp(true);
    setTimeout(() => {
      const newBackup: BackupFile = {
        id: `bk-${Date.now()}`,
        fileName: `backup_manual_${new Date()
          .toISOString()
          .slice(0, 10)
          .replace(/-/g, "")}.sql`,
        size: "4.2 GB",
        createdAt: new Date().toLocaleString("vi-VN"),
        type: "Full",
        status: "Success",
      };
      setBackups((prev) => [newBackup, ...prev]);
      setIsBackingUp(false);
      alert("Sao lưu dữ liệu thành công!");
    }, 2500);
  };

  const handleRestore = (fileName: string) => {
    if (
      window.confirm(
        `Bạn có chắc chắn muốn khôi phục dữ liệu từ bản sao lưu: ${fileName}? Hệ thống sẽ tạm dừng trong quá trình này.`
      )
    ) {
      alert("Đang tiến hành khôi phục...");
    }
  };

  const handleSaveConfig = () => {
    console.log("Saving config:", config);
    // API Call would go here
    alert("Đã lưu cấu hình hệ thống thành công.");
  };

  return (
    <div className="animate-fadeIn h-full flex flex-col">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">
        Cài đặt Hệ thống
      </h2>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 flex overflow-hidden">
        {/* Sidebar Tabs */}
        <div className="w-64 bg-slate-50 border-r border-slate-200 p-4 hidden md:block">
          <div className="space-y-1">
            <button
              onClick={() => setActiveTab("general")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "general"
                  ? "bg-white shadow text-brand-600"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Globe size={18} /> Cài đặt chung
            </button>
            <button
              onClick={() => setActiveTab("services")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "services"
                  ? "bg-white shadow text-brand-600"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Server size={18} /> Dịch vụ & Thông báo
            </button>
            <button
              onClick={() => setActiveTab("backup")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "backup"
                  ? "bg-white shadow text-brand-600"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Database size={18} /> Sao lưu & Dữ liệu
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto">
          {/* --- GENERAL TAB --- */}
          {activeTab === "general" && (
            <div className="max-w-2xl space-y-8 animate-fadeIn">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                  Thông tin chung
                </h3>
                <div className="space-y-4">
                  <Input
                    label="Tên hệ thống"
                    value={config.systemName}
                    onChange={(e) =>
                      setConfig({ ...config, systemName: e.target.value })
                    }
                  />
                  <Input
                    label="Email liên hệ Admin"
                    value={config.adminEmail}
                    onChange={(e) =>
                      setConfig({ ...config, adminEmail: e.target.value })
                    }
                  />
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Ngôn ngữ mặc định
                    </label>
                    <select
                      className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                      value={config.language}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          language: e.target.value as any,
                        })
                      }
                    >
                      <option value="vi">Tiếng Việt</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                  Chế độ Bảo trì
                </h3>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex gap-3">
                    <div className="p-2 bg-amber-100 text-amber-600 rounded h-fit">
                      <AlertTriangle size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-amber-800">
                        Maintenance Mode
                      </h4>
                      <p className="text-sm text-amber-700">
                        Khi bật, chỉ Admin mới có thể truy cập hệ thống. Người
                        dùng sẽ thấy trang bảo trì.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setConfig({
                        ...config,
                        maintenanceMode: !config.maintenanceMode,
                      })
                    }
                    className={`text-3xl transition-colors ${
                      config.maintenanceMode
                        ? "text-green-500"
                        : "text-slate-300"
                    }`}
                  >
                    {config.maintenanceMode ? (
                      <ToggleRight size={48} />
                    ) : (
                      <ToggleLeft size={48} />
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-4">
                <Button onClick={handleSaveConfig}>
                  <Save size={18} className="mr-2" /> Lưu cài đặt
                </Button>
              </div>
            </div>
          )}

          {/* --- SERVICES TAB --- */}
          {activeTab === "services" && (
            <div className="max-w-3xl space-y-8 animate-fadeIn">
              {/* Email Service */}
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                      <Mail size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">
                        Email Service (SMTP)
                      </h3>
                      <p className="text-sm text-slate-500">
                        Cấu hình gửi email thông báo tự động.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setConfig({
                        ...config,
                        emailService: {
                          ...config.emailService,
                          isEnabled: !config.emailService.isEnabled,
                        },
                      })
                    }
                    className={`text-3xl transition-colors ${
                      config.emailService.isEnabled
                        ? "text-green-500"
                        : "text-slate-300"
                    }`}
                  >
                    {config.emailService.isEnabled ? (
                      <ToggleRight size={40} />
                    ) : (
                      <ToggleLeft size={40} />
                    )}
                  </button>
                </div>

                <div
                  className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-opacity ${
                    !config.emailService.isEnabled
                      ? "opacity-50 pointer-events-none"
                      : ""
                  }`}
                >
                  <div className="md:col-span-2">
                    <Input
                      label="SMTP Host"
                      value={config.emailService.host}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          emailService: {
                            ...config.emailService,
                            host: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                  <Input
                    label="Port"
                    value={config.emailService.port}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        emailService: {
                          ...config.emailService,
                          port: e.target.value,
                        },
                      })
                    }
                  />
                  <Input
                    label="Username"
                    value={config.emailService.user}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        emailService: {
                          ...config.emailService,
                          user: e.target.value,
                        },
                      })
                    }
                  />
                  <div className="md:col-span-2">
                    <Input
                      label="Password / App Password"
                      type="password"
                      value={config.emailPassword}
                      onChange={(e) =>
                        setConfig({ ...config, emailPassword: e.target.value })
                      }
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              {/* SMS Service */}
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                      <MessageSquare size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">
                        SMS Service
                      </h3>
                      <p className="text-sm text-slate-500">
                        Gửi tin nhắn OTP và cảnh báo khẩn cấp.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setConfig({
                        ...config,
                        smsService: {
                          ...config.smsService,
                          isEnabled: !config.smsService.isEnabled,
                        },
                      })
                    }
                    className={`text-3xl transition-colors ${
                      config.smsService.isEnabled
                        ? "text-green-500"
                        : "text-slate-300"
                    }`}
                  >
                    {config.smsService.isEnabled ? (
                      <ToggleRight size={40} />
                    ) : (
                      <ToggleLeft size={40} />
                    )}
                  </button>
                </div>

                <div
                  className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-opacity ${
                    !config.smsService.isEnabled
                      ? "opacity-50 pointer-events-none"
                      : ""
                  }`}
                >
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Provider
                    </label>
                    <select
                      className="w-full bg-white border border-slate-200 rounded-md p-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                      value={config.smsService.provider}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          smsService: {
                            ...config.smsService,
                            provider: e.target.value as any,
                          },
                        })
                      }
                    >
                      <option value="twilio">Twilio</option>
                      <option value="viettel">Viettel SMS Brandname</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <Input
                      label="API Key"
                      type="password"
                      value={config.smsService.apiKey}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          smsService: {
                            ...config.smsService,
                            apiKey: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveConfig}>
                  <Save size={18} className="mr-2" /> Lưu cấu hình
                </Button>
              </div>
            </div>
          )}

          {/* --- BACKUP TAB --- */}
          {activeTab === "backup" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-blue-900 text-lg mb-1 flex items-center gap-2">
                    <Cloud size={20} /> Trạng thái sao lưu
                  </h3>
                  <p className="text-sm text-blue-700">
                    Sao lưu tự động: <strong>Mỗi ngày lúc 02:00 AM</strong>
                  </p>
                </div>
                <Button onClick={handleCreateBackup} disabled={isBackingUp}>
                  {isBackingUp ? (
                    <RefreshCw size={18} className="mr-2 animate-spin" />
                  ) : (
                    <Database size={18} className="mr-2" />
                  )}
                  {isBackingUp ? "Đang sao lưu..." : "Tạo bản sao lưu ngay"}
                </Button>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                  <h3 className="font-bold text-slate-900">Lịch sử Sao lưu</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-white">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">
                          Tên tập tin
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">
                          Loại
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">
                          Dung lượng
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">
                          Thời gian
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">
                          Trạng thái
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase">
                          Hành động
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {backups.map((bk) => (
                        <tr key={bk.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 flex items-center gap-3">
                            <FileArchive size={20} className="text-slate-400" />
                            <span className="text-sm font-mono text-slate-700">
                              {bk.fileName}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {bk.type}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {bk.size}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {bk.createdAt}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-1 rounded text-xs font-bold ${
                                bk.status === "Success"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {bk.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                className="p-1.5 text-slate-400 hover:text-brand-600"
                                title="Tải xuống"
                              >
                                <Download size={18} />
                              </button>
                              <button
                                className="p-1.5 text-slate-400 hover:text-red-600"
                                title="Khôi phục"
                                onClick={() => handleRestore(bk.fileName)}
                              >
                                <RotateCcw size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
