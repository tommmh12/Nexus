import React, { useState } from "react";
// TODO: Replace with API call
import { AlertRule } from "../../types";
import { Button } from "./ui/Button";
import {
  Bell,
  Edit2,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  Clock,
  Users,
  Save,
  X,
  Settings,
  Shield,
} from "lucide-react";

const AlertConfigModal = ({
  alert,
  onSave,
  onCancel,
}: {
  alert: AlertRule;
  onSave: (a: AlertRule) => void;
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState<AlertRule>(alert);

  const toggleReceiver = (role: "Admin" | "Manager" | "Employee") => {
    setFormData((prev) => ({
      ...prev,
      notifyTo: prev.notifyTo.includes(role)
        ? prev.notifyTo.filter((r) => r !== role)
        : [...prev.notifyTo, role],
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-900">
            Cấu hình Cảnh báo
          </h3>
          <button onClick={onCancel}>
            <X size={20} className="text-slate-400 hover:text-slate-600" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Tên cảnh báo
            </label>
            <p className="text-sm text-slate-900 bg-slate-50 p-2 rounded border border-slate-200">
              {formData.name}
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Ngưỡng cảnh báo (Threshold)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                className="w-24 bg-white border border-slate-200 rounded-md p-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                value={formData.threshold}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    threshold: parseInt(e.target.value),
                  })
                }
              />
              <span className="text-sm text-slate-600 font-medium">
                {formData.unit === "days"
                  ? "ngày trước hạn"
                  : formData.unit === "percent"
                  ? "% dung lượng"
                  : "lượt"}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Gửi thông báo đến
            </label>
            <div className="flex flex-wrap gap-2">
              {["Admin", "Manager", "Employee"].map((role) => (
                <button
                  key={role}
                  onClick={() => toggleReceiver(role as any)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    formData.notifyTo.includes(role as any)
                      ? "bg-brand-50 text-brand-700 border-brand-200"
                      : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-slate-100">
          <Button variant="ghost" onClick={onCancel}>
            Hủy
          </Button>
          <Button onClick={() => onSave(formData)}>
            <Save size={16} className="mr-2" /> Lưu cấu hình
          </Button>
        </div>
      </div>
    </div>
  );
};

export const AlertManager = () => {
  const [alerts, setAlerts] = useState<AlertRule[]>([]);
  const [editingAlert, setEditingAlert] = useState<AlertRule | null>(null);

  const toggleAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isEnabled: !a.isEnabled } : a))
    );
  };

  const handleSave = (updatedAlert: AlertRule) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === updatedAlert.id ? updatedAlert : a))
    );
    setEditingAlert(null);
  };

  const getIcon = (category: string) => {
    switch (category) {
      case "HR":
        return <Users size={24} />;
      case "Security":
        return <Shield size={24} />;
      case "System":
        return <Settings size={24} />;
      default:
        return <Bell size={24} />;
    }
  };

  const getColor = (category: string) => {
    switch (category) {
      case "HR":
        return "bg-purple-50 text-purple-600";
      case "Security":
        return "bg-red-50 text-red-600";
      case "System":
        return "bg-blue-50 text-blue-600";
      default:
        return "bg-slate-50 text-slate-600";
    }
  };

  return (
    <div className="animate-fadeIn h-full">
      {editingAlert && (
        <AlertConfigModal
          alert={editingAlert}
          onSave={handleSave}
          onCancel={() => setEditingAlert(null)}
        />
      )}

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">
          Quản lý Cảnh báo & Thông báo
        </h2>
        <p className="text-slate-500 mt-1">
          Thiết lập các ngưỡng cảnh báo tự động cho hệ thống và nhân sự.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`bg-white rounded-xl border p-6 transition-all ${
              alert.isEnabled
                ? "border-slate-200 shadow-sm"
                : "border-slate-100 opacity-75 grayscale-[0.5]"
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${getColor(alert.category)}`}>
                {getIcon(alert.category)}
              </div>
              <button
                onClick={() => toggleAlert(alert.id)}
                className={`text-3xl transition-colors ${
                  alert.isEnabled ? "text-green-500" : "text-slate-300"
                }`}
              >
                {alert.isEnabled ? (
                  <ToggleRight size={40} />
                ) : (
                  <ToggleLeft size={40} />
                )}
              </button>
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-2">
              {alert.name}
            </h3>
            <p className="text-sm text-slate-500 mb-6 min-h-[40px]">
              {alert.description}
            </p>

            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 mb-4">
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="text-slate-500">Ngưỡng:</span>
                <span className="font-bold text-slate-900 flex items-center gap-1">
                  <AlertTriangle size={14} className="text-amber-500" />
                  {alert.threshold}{" "}
                  {alert.unit === "percent"
                    ? "%"
                    : alert.unit === "days"
                    ? "ngày"
                    : ""}
                </span>
              </div>
              <div className="flex justify-between items-start text-sm">
                <span className="text-slate-500">Gửi đến:</span>
                <div className="text-right font-medium text-slate-700 max-w-[120px] leading-tight">
                  {alert.notifyTo.join(", ")}
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              fullWidth
              className="text-xs h-9"
              onClick={() => setEditingAlert(alert)}
              disabled={!alert.isEnabled}
            >
              <Edit2 size={14} className="mr-2" /> Cấu hình
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
