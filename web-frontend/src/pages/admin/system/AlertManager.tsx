import React, { useState, useEffect, useCallback } from "react";
import {
  AlertRule,
  alertRuleService,
  DepartmentOption,
  UserOption,
} from "../../../services/alertRuleService";
import { Button } from "../../../components/system/ui/Button";
import {
  Bell,
  Edit2,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  Users,
  Save,
  X,
  Settings,
  Shield,
  Plus,
  Trash2,
  RefreshCw,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Zap,
  ChevronDown,
  Activity,
  Building2,
  UserCheck,
} from "lucide-react";

// Modal tạo/sửa Alert Rule
const AlertRuleModal = ({
  rule,
  isNew,
  onSave,
  onCancel,
  saving,
}: {
  rule: Partial<AlertRule> | null;
  isNew: boolean;
  onSave: (data: any) => void;
  onCancel: () => void;
  saving: boolean;
}) => {
  const [formData, setFormData] = useState({
    name: rule?.name || "",
    description: rule?.description || "",
    category: rule?.category || ("HR" as "HR" | "System" | "Security"),
    threshold: rule?.threshold || 7,
    unit: rule?.unit || ("days" as "days" | "percent" | "count"),
    notify_roles: rule?.notify_roles || (["Admin"] as string[]),
    notify_departments: rule?.notify_departments || ([] as string[]),
    notify_users: rule?.notify_users || ([] as string[]),
  });

  // State for departments and users options
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState("");

  // Fetch departments and users on mount
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoadingOptions(true);
        const [deptData, userData] = await Promise.all([
          alertRuleService.getDepartments(),
          alertRuleService.getUsers(),
        ]);
        setDepartments(deptData);
        setUsers(userData);
      } catch (error) {
        console.error("Error fetching options:", error);
      } finally {
        setLoadingOptions(false);
      }
    };
    fetchOptions();
  }, []);

  const toggleRole = (role: string) => {
    setFormData((prev) => ({
      ...prev,
      notify_roles: prev.notify_roles.includes(role)
        ? prev.notify_roles.filter((r) => r !== role)
        : [...prev.notify_roles, role],
    }));
  };

  const toggleDepartment = (deptId: string) => {
    setFormData((prev) => ({
      ...prev,
      notify_departments: prev.notify_departments.includes(deptId)
        ? prev.notify_departments.filter((d) => d !== deptId)
        : [...prev.notify_departments, deptId],
    }));
  };

  const toggleUser = (userId: string) => {
    setFormData((prev) => ({
      ...prev,
      notify_users: prev.notify_users.includes(userId)
        ? prev.notify_users.filter((u) => u !== userId)
        : [...prev.notify_users, userId],
    }));
  };

  // Filter users by search term
  const filteredUsers = users.filter(
    (u) =>
      u.full_name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-brand-600 to-brand-700 px-6 py-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              {isNew ? <Plus size={20} /> : <Edit2 size={20} />}
              {isNew ? "Tạo Quy tắc Cảnh báo Mới" : "Chỉnh sửa Quy tắc"}
            </h3>
            <button
              onClick={onCancel}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Tên quy tắc */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Tên quy tắc <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="VD: Hợp đồng sắp hết hạn"
              required
              disabled={!isNew}
            />
          </div>

          {/* Mô tả */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Mô tả
            </label>
            <textarea
              className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all resize-none"
              rows={2}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Mô tả chi tiết về quy tắc cảnh báo..."
            />
          </div>

          {/* Category */}
          {isNew && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Danh mục <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    value: "HR",
                    label: "Nhân sự",
                    icon: Users,
                    color: "purple",
                  },
                  {
                    value: "System",
                    label: "Hệ thống",
                    icon: Settings,
                    color: "blue",
                  },
                  {
                    value: "Security",
                    label: "Bảo mật",
                    icon: Shield,
                    color: "red",
                  },
                ].map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        category: cat.value as any,
                      })
                    }
                    className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                      formData.category === cat.value
                        ? cat.color === "purple"
                          ? "border-purple-500 bg-purple-50"
                          : cat.color === "blue"
                          ? "border-blue-500 bg-blue-50"
                          : "border-red-500 bg-red-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <cat.icon
                      size={20}
                      className={
                        formData.category === cat.value
                          ? cat.color === "purple"
                            ? "text-purple-600"
                            : cat.color === "blue"
                            ? "text-blue-600"
                            : "text-red-600"
                          : "text-slate-400"
                      }
                    />
                    <span
                      className={`text-xs font-medium ${
                        formData.category === cat.value
                          ? cat.color === "purple"
                            ? "text-purple-700"
                            : cat.color === "blue"
                            ? "text-blue-700"
                            : "text-red-700"
                          : "text-slate-600"
                      }`}
                    >
                      {cat.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Threshold & Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Ngưỡng <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={0}
                className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                value={formData.threshold}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    threshold: parseInt(e.target.value) || 0,
                  })
                }
                required
              />
            </div>
            {isNew && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Đơn vị <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                  value={formData.unit}
                  onChange={(e) =>
                    setFormData({ ...formData, unit: e.target.value as any })
                  }
                >
                  <option value="days">Ngày</option>
                  <option value="percent">Phần trăm (%)</option>
                  <option value="count">Số lượng</option>
                </select>
              </div>
            )}
          </div>

          {/* Notify Roles */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Gửi thông báo đến <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {["Admin", "Manager", "Employee"].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => toggleRole(role)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all ${
                    formData.notify_roles.includes(role)
                      ? "bg-brand-50 text-brand-700 border-brand-300"
                      : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {role === "Admin" && "Quản trị viên"}
                  {role === "Manager" && "Trưởng phòng"}
                  {role === "Employee" && "Nhân viên"}
                </button>
              ))}
            </div>
            {formData.notify_roles.length === 0 &&
              formData.notify_departments.length === 0 &&
              formData.notify_users.length === 0 && (
                <p className="text-xs text-red-500 mt-1">
                  Chọn ít nhất một nhóm, phòng ban hoặc nhân sự nhận thông báo
                </p>
              )}
          </div>

          {/* Notify Departments */}
          <div className="relative">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              <Building2 size={14} className="inline mr-1" />
              Phòng ban nhận thông báo
            </label>
            <div
              className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm cursor-pointer flex items-center justify-between hover:border-slate-300 transition-all"
              onClick={() => setShowDeptDropdown(!showDeptDropdown)}
            >
              <span className="text-slate-600">
                {formData.notify_departments.length > 0
                  ? `Đã chọn ${formData.notify_departments.length} phòng ban`
                  : "Chọn phòng ban..."}
              </span>
              <ChevronDown
                size={16}
                className={`text-slate-400 transition-transform ${
                  showDeptDropdown ? "rotate-180" : ""
                }`}
              />
            </div>
            {showDeptDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {loadingOptions ? (
                  <div className="p-3 text-center text-slate-500 text-sm">
                    Đang tải...
                  </div>
                ) : departments.length === 0 ? (
                  <div className="p-3 text-center text-slate-500 text-sm">
                    Không có phòng ban
                  </div>
                ) : (
                  departments.map((dept) => (
                    <div
                      key={dept.id}
                      className={`px-3 py-2 cursor-pointer flex items-center gap-2 hover:bg-slate-50 ${
                        formData.notify_departments.includes(dept.id)
                          ? "bg-brand-50"
                          : ""
                      }`}
                      onClick={() => toggleDepartment(dept.id)}
                    >
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center ${
                          formData.notify_departments.includes(dept.id)
                            ? "bg-brand-500 border-brand-500"
                            : "border-slate-300"
                        }`}
                      >
                        {formData.notify_departments.includes(dept.id) && (
                          <CheckCircle size={12} className="text-white" />
                        )}
                      </div>
                      <span className="text-sm text-slate-700">
                        {dept.name}
                      </span>
                      <span className="text-xs text-slate-400">
                        ({dept.code})
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
            {/* Selected departments tags */}
            {formData.notify_departments.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {formData.notify_departments.map((deptId) => {
                  const dept = departments.find((d) => d.id === deptId);
                  return (
                    <span
                      key={deptId}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full"
                    >
                      <Building2 size={10} />
                      {dept?.name || deptId}
                      <button
                        type="button"
                        onClick={() => toggleDepartment(deptId)}
                        className="hover:text-green-900"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* Notify Users */}
          <div className="relative">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              <UserCheck size={14} className="inline mr-1" />
              Nhân sự cụ thể nhận thông báo
            </label>
            <div
              className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm cursor-pointer flex items-center justify-between hover:border-slate-300 transition-all"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
            >
              <span className="text-slate-600">
                {formData.notify_users.length > 0
                  ? `Đã chọn ${formData.notify_users.length} nhân sự`
                  : "Chọn nhân sự..."}
              </span>
              <ChevronDown
                size={16}
                className={`text-slate-400 transition-transform ${
                  showUserDropdown ? "rotate-180" : ""
                }`}
              />
            </div>
            {showUserDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg">
                {/* Search input */}
                <div className="p-2 border-b border-slate-100">
                  <div className="relative">
                    <Search
                      size={14}
                      className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      placeholder="Tìm kiếm nhân sự..."
                      className="w-full pl-7 pr-3 py-1.5 text-sm border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500"
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {loadingOptions ? (
                    <div className="p-3 text-center text-slate-500 text-sm">
                      Đang tải...
                    </div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="p-3 text-center text-slate-500 text-sm">
                      Không tìm thấy nhân sự
                    </div>
                  ) : (
                    filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        className={`px-3 py-2 cursor-pointer flex items-center gap-2 hover:bg-slate-50 ${
                          formData.notify_users.includes(user.id)
                            ? "bg-brand-50"
                            : ""
                        }`}
                        onClick={() => toggleUser(user.id)}
                      >
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center ${
                            formData.notify_users.includes(user.id)
                              ? "bg-brand-500 border-brand-500"
                              : "border-slate-300"
                          }`}
                        >
                          {formData.notify_users.includes(user.id) && (
                            <CheckCircle size={12} className="text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm text-slate-700">
                            {user.full_name}
                          </div>
                          <div className="text-xs text-slate-400">
                            {user.email}
                            {user.department_name && ` • ${user.department_name}`}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
            {/* Selected users tags */}
            {formData.notify_users.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {formData.notify_users.map((userId) => {
                  const user = users.find((u) => u.id === userId);
                  return (
                    <span
                      key={userId}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                    >
                      <UserCheck size={10} />
                      {user?.full_name || userId}
                      <button
                        type="button"
                        onClick={() => toggleUser(userId)}
                        className="hover:text-blue-900"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={onCancel}>
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={
                saving ||
                !formData.name ||
                (formData.notify_roles.length === 0 &&
                  formData.notify_departments.length === 0 &&
                  formData.notify_users.length === 0)
              }
            >
              {saving ? (
                <RefreshCw size={16} className="mr-2 animate-spin" />
              ) : (
                <Save size={16} className="mr-2" />
              )}
              {isNew ? "Tạo quy tắc" : "Lưu thay đổi"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal xác nhận xóa
const DeleteConfirmModal = ({
  rule,
  onConfirm,
  onCancel,
  deleting,
}: {
  rule: AlertRule;
  onConfirm: () => void;
  onCancel: () => void;
  deleting: boolean;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 bg-red-100 rounded-full">
          <Trash2 size={24} className="text-red-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">Xóa quy tắc?</h3>
          <p className="text-sm text-slate-500">
            Hành động này không thể hoàn tác
          </p>
        </div>
      </div>

      <div className="bg-slate-50 rounded-lg p-4 mb-6">
        <p className="text-sm text-slate-700">
          Bạn có chắc muốn xóa quy tắc "{rule.name}"?
        </p>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={onCancel}>
          Hủy
        </Button>
        <button
          onClick={onConfirm}
          disabled={deleting}
          className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
        >
          {deleting ? (
            <RefreshCw size={16} className="mr-2 animate-spin" />
          ) : (
            <Trash2 size={16} className="mr-2" />
          )}
          Xóa
        </button>
      </div>
    </div>
  </div>
);

// Main Component
export const AlertManager = () => {
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);
  const [deletingRule, setDeletingRule] = useState<AlertRule | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    enabled: 0,
    disabled: 0,
    byCategory: { HR: 0, System: 0, Security: 0 },
  });

  // Fetch alert rules
  const fetchRules = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await alertRuleService.getRules();
      setRules(data);

      // Calculate stats
      const enabled = data.filter((r) => r.is_enabled).length;
      const byCategory = { HR: 0, System: 0, Security: 0 };
      data.forEach((r) => {
        if (byCategory[r.category] !== undefined) {
          byCategory[r.category]++;
        }
      });

      setStats({
        total: data.length,
        enabled,
        disabled: data.length - enabled,
        byCategory,
      });
    } catch (err) {
      console.error("Error fetching alert rules:", err);
      setError("Không thể tải danh sách quy tắc cảnh báo");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  // Toggle rule enabled/disabled
  const handleToggle = async (rule: AlertRule) => {
    try {
      const updated = await alertRuleService.toggleRule(rule.id);
      const newRules = rules.map((r) => (r.id === rule.id ? updated : r));
      setRules(newRules);
      // Recalculate stats from actual data
      const enabled = newRules.filter((r) => r.is_enabled).length;
      setStats((prev) => ({
        ...prev,
        enabled,
        disabled: newRules.length - enabled,
      }));
    } catch (err) {
      console.error("Error toggling rule:", err);
      setError("Không thể thay đổi trạng thái quy tắc");
    }
  };

  // Create new rule
  const handleCreate = async (data: any) => {
    try {
      setSaving(true);
      const newRule = await alertRuleService.createRule(data);
      setRules((prev) => [...prev, newRule]);
      setShowCreateModal(false);
      // Update stats
      setStats((prev) => ({
        ...prev,
        total: prev.total + 1,
        enabled: newRule.is_enabled ? prev.enabled + 1 : prev.enabled,
        disabled: !newRule.is_enabled ? prev.disabled + 1 : prev.disabled,
        byCategory: {
          ...prev.byCategory,
          [newRule.category]:
            prev.byCategory[newRule.category as keyof typeof prev.byCategory] +
            1,
        },
      }));
    } catch (err: any) {
      console.error("Error creating rule:", err);
      setError(err.message || "Không thể tạo quy tắc mới");
    } finally {
      setSaving(false);
    }
  };

  // Update rule
  const handleUpdate = async (data: any) => {
    if (!editingRule) return;
    try {
      setSaving(true);
      const updated = await alertRuleService.updateRule(editingRule.id, data);
      setRules((prev) =>
        prev.map((r) => (r.id === editingRule.id ? updated : r))
      );
      setEditingRule(null);
    } catch (err) {
      console.error("Error updating rule:", err);
      setError("Không thể cập nhật quy tắc");
    } finally {
      setSaving(false);
    }
  };

  // Delete rule
  const handleDelete = async () => {
    if (!deletingRule) return;
    try {
      setDeleting(true);
      await alertRuleService.deleteRule(deletingRule.id);
      setRules((prev) => prev.filter((r) => r.id !== deletingRule.id));
      // Update stats
      setStats((prev) => ({
        ...prev,
        total: prev.total - 1,
        enabled: deletingRule.is_enabled ? prev.enabled - 1 : prev.enabled,
        disabled: !deletingRule.is_enabled ? prev.disabled - 1 : prev.disabled,
        byCategory: {
          ...prev.byCategory,
          [deletingRule.category]:
            prev.byCategory[
              deletingRule.category as keyof typeof prev.byCategory
            ] - 1,
        },
      }));
      setDeletingRule(null);
    } catch (err) {
      console.error("Error deleting rule:", err);
      setError("Không thể xóa quy tắc");
    } finally {
      setDeleting(false);
    }
  };

  // Filter rules
  const filteredRules = rules.filter((rule) => {
    const matchesSearch =
      rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rule.description &&
        rule.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory =
      categoryFilter === "all" || rule.category === categoryFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "enabled" && rule.is_enabled) ||
      (statusFilter === "disabled" && !rule.is_enabled);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Helper functions
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "HR":
        return Users;
      case "Security":
        return Shield;
      case "System":
        return Settings;
      default:
        return Bell;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "HR":
        return {
          bg: "bg-purple-50",
          text: "text-purple-600",
          border: "border-purple-200",
          badge: "bg-purple-100 text-purple-700",
        };
      case "Security":
        return {
          bg: "bg-red-50",
          text: "text-red-600",
          border: "border-red-200",
          badge: "bg-red-100 text-red-700",
        };
      case "System":
        return {
          bg: "bg-blue-50",
          text: "text-blue-600",
          border: "border-blue-200",
          badge: "bg-blue-100 text-blue-700",
        };
      default:
        return {
          bg: "bg-slate-50",
          text: "text-slate-600",
          border: "border-slate-200",
          badge: "bg-slate-100 text-slate-700",
        };
    }
  };

  const getUnitLabel = (unit: string, threshold: number) => {
    switch (unit) {
      case "days":
        return `${threshold} ngày`;
      case "percent":
        return `${threshold}%`;
      case "count":
        return `${threshold} lần`;
      default:
        return threshold.toString();
    }
  };

  if (loading) {
    return (
      <div className="animate-fadeIn h-full flex items-center justify-center">
        <div className="text-center">
          <RefreshCw
            size={48}
            className="animate-spin text-brand-500 mx-auto mb-4"
          />
          <p className="text-slate-500">Đang tải cấu hình cảnh báo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn h-full overflow-auto">
      {/* Modals */}
      {showCreateModal && (
        <AlertRuleModal
          rule={null}
          isNew={true}
          onSave={handleCreate}
          onCancel={() => setShowCreateModal(false)}
          saving={saving}
        />
      )}

      {editingRule && (
        <AlertRuleModal
          rule={editingRule}
          isNew={false}
          onSave={handleUpdate}
          onCancel={() => setEditingRule(null)}
          saving={saving}
        />
      )}

      {deletingRule && (
        <DeleteConfirmModal
          rule={deletingRule}
          onConfirm={handleDelete}
          onCancel={() => setDeletingRule(null)}
          deleting={deleting}
        />
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl text-white">
                <Bell size={24} />
              </div>
              Cấu hình Cảnh báo
            </h2>
            <p className="text-slate-500 mt-1">
              Thiết lập các ngưỡng cảnh báo tự động cho hệ thống, nhân sự và bảo
              mật.
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus size={18} className="mr-2" />
              Tạo quy tắc mới
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  await alertRuleService.triggerCheck();
                  alert(
                    "Đã kích hoạt kiểm tra tất cả cảnh báo! Kiểm tra thông báo của bạn."
                  );
                } catch (err) {
                  console.error("Error triggering check:", err);
                  setError("Không thể kích hoạt kiểm tra cảnh báo");
                }
              }}
            >
              <Zap size={18} className="mr-2" />
              Kiểm tra ngay
            </Button>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <XCircle size={20} className="text-red-500" />
          <span className="text-red-700">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg">
              <Activity size={20} className="text-slate-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              <p className="text-xs text-slate-500">Tổng quy tắc</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {stats.enabled}
              </p>
              <p className="text-xs text-slate-500">Đang hoạt động</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg">
              <XCircle size={20} className="text-slate-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-400">
                {stats.disabled}
              </p>
              <p className="text-xs text-slate-500">Tạm tắt</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Zap size={20} className="text-amber-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                  {stats.byCategory.HR}
                </span>
                <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                  {stats.byCategory.System}
                </span>
                <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">
                  {stats.byCategory.Security}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Theo danh mục</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Tìm kiếm quy tắc..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-medium transition-colors ${
              showFilters
                ? "border-brand-500 bg-brand-50 text-brand-700"
                : "border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Filter size={18} />
            Bộ lọc
            <ChevronDown
              size={16}
              className={`transition-transform ${
                showFilters ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Refresh */}
          <button
            onClick={fetchRules}
            className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw size={18} />
            Làm mới
          </button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-slate-100">
            {/* Category Filter */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Danh mục
              </label>
              <select
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">Tất cả</option>
                <option value="HR">Nhân sự</option>
                <option value="System">Hệ thống</option>
                <option value="Security">Bảo mật</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Trạng thái
              </label>
              <select
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Tất cả</option>
                <option value="enabled">Đang bật</option>
                <option value="disabled">Đang tắt</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Rules Grid */}
      {filteredRules.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Bell size={48} className="text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 mb-4">
            {searchQuery || categoryFilter !== "all" || statusFilter !== "all"
              ? "Không tìm thấy quy tắc nào phù hợp"
              : "Chưa có quy tắc cảnh báo nào"}
          </p>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus size={16} className="mr-2" />
            Tạo quy tắc đầu tiên
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRules.map((rule) => {
            const colors = getCategoryColor(rule.category);
            const Icon = getCategoryIcon(rule.category);

            return (
              <div
                key={rule.id}
                className={`bg-white rounded-xl border transition-all hover:shadow-md ${
                  rule.is_enabled
                    ? "border-slate-200"
                    : "border-slate-100 opacity-75"
                }`}
              >
                {/* Card Header */}
                <div className="p-5 pb-4">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-xl ${colors.bg}`}>
                      <Icon size={24} className={colors.text} />
                    </div>
                    <button
                      onClick={() => handleToggle(rule)}
                      className={`text-3xl transition-colors ${
                        rule.is_enabled ? "text-green-500" : "text-slate-300"
                      }`}
                      title={rule.is_enabled ? "Nhấn để tắt" : "Nhấn để bật"}
                    >
                      {rule.is_enabled ? (
                        <ToggleRight size={36} />
                      ) : (
                        <ToggleLeft size={36} />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-bold text-slate-900">
                      {rule.name}
                    </h3>
                  </div>

                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors.badge}`}
                  >
                    {rule.category === "HR" && "Nhân sự"}
                    {rule.category === "System" && "Hệ thống"}
                    {rule.category === "Security" && "Bảo mật"}
                  </span>

                  {rule.description && (
                    <p className="text-sm text-slate-500 mt-3 line-clamp-2">
                      {rule.description}
                    </p>
                  )}
                </div>

                {/* Card Body - Threshold & Notify */}
                <div className="px-5 py-4 bg-slate-50 border-t border-slate-100">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Ngưỡng</p>
                      <p className="text-sm font-semibold text-slate-900 flex items-center gap-1">
                        <AlertTriangle size={14} className="text-amber-500" />
                        {getUnitLabel(rule.unit, rule.threshold)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Gửi đến</p>
                      <div className="flex flex-wrap gap-1">
                        {rule.notify_roles.map((role) => (
                          <span
                            key={role}
                            className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-xs text-slate-600"
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer - Actions */}
                <div className="px-5 py-3 border-t border-slate-100 flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingRule(rule)}
                      className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                      title="Chỉnh sửa"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => setDeletingRule(rule)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Xóa"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="text-xs text-slate-400">
                    {new Date(rule.updated_at).toLocaleDateString("vi-VN")}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Legend / Help */}
      <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-200">
        <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
          <Activity size={16} />
          Hướng dẫn sử dụng
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-600">
          <div className="flex items-start gap-2">
            <div className="p-1 bg-purple-100 rounded">
              <Users size={14} className="text-purple-600" />
            </div>
            <div>
              <span className="font-medium">Nhân sự:</span> Cảnh báo liên quan
              đến hợp đồng, sinh nhật, nghỉ phép...
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="p-1 bg-blue-100 rounded">
              <Settings size={14} className="text-blue-600" />
            </div>
            <div>
              <span className="font-medium">Hệ thống:</span> Cảnh báo về dự án,
              task, sao lưu dữ liệu...
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="p-1 bg-red-100 rounded">
              <Shield size={14} className="text-red-600" />
            </div>
            <div>
              <span className="font-medium">Bảo mật:</span> Cảnh báo đăng nhập
              bất thường, xâm nhập...
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
