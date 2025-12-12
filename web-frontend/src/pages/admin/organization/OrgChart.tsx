import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  departmentService,
  Department,
  DepartmentTreeNode,
} from "../../../services/departmentService";
import { Button } from "../../../components/system/ui/Button";
import { Input } from "../../../components/system/ui/Input";
import {
  Users,
  Download,
  Edit2,
  Plus,
  Trash2,
  ZoomIn,
  ZoomOut,
  Maximize,
  X,
  Save,
  ChevronRight,
  ChevronDown,
  Mail,
  Phone,
  Calendar,
  Building2,
  GitBranch,
  List,
  Network,
  Search,
  RefreshCw,
  User,
  Briefcase,
  AlertTriangle,
  Target,
  Crown,
  UserCircle,
  Eye,
  EyeOff,
} from "lucide-react";

// --- Types ---
type ViewMode = "tree" | "hierarchy";

interface Employee {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  position?: string;
  role: string;
  department_id?: string;
  status: string;
}

interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string;
  position: string;
  department: string;
  phone?: string;
  role?: string;
  status: "Active" | "Blocked";
}

// --- Helper Components ---

const UserProfileModal = ({
  user,
  onClose,
}: {
  user: UserProfile;
  onClose: () => void;
}) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-24 bg-gradient-to-r from-brand-600 to-brand-700">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        <div className="px-6 pb-6">
          <div className="relative -mt-12 mb-4 flex justify-between items-end">
            <img
              src={
                user.avatarUrl ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user.fullName
                )}&background=random`
              }
              alt={user.fullName}
              className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-white object-cover"
            />
            <span
              className={`mb-2 px-3 py-1 rounded-full text-xs font-bold ${
                user.status === "Active"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {user.status === "Active" ? "Đang hoạt động" : "Đã khóa"}
            </span>
          </div>

          <h2 className="text-2xl font-bold text-slate-900">{user.fullName}</h2>
          <p className="text-slate-500 font-medium">
            {user.position || "Nhân viên"}
          </p>
          {user.role && (
            <span
              className={`inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium ${
                user.role === "Admin"
                  ? "bg-purple-100 text-purple-700"
                  : user.role === "Manager"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              {user.role === "Admin"
                ? "Quản trị viên"
                : user.role === "Manager"
                ? "Trưởng phòng"
                : "Nhân viên"}
            </span>
          )}

          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-3 text-slate-600">
              <Mail size={18} className="text-slate-400" />
              <span>{user.email}</span>
            </div>
            {user.phone && (
              <div className="flex items-center gap-3 text-slate-600">
                <Phone size={18} className="text-slate-400" />
                <span>{user.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-slate-600">
              <Building2 size={18} className="text-slate-400" />
              <span>{user.department || "Chưa phân bổ"}</span>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100">
            <Button fullWidth variant="outline" onClick={onClose}>
              Đóng
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- CEO/Admin Node Component ---
const CEONode = ({
  admin,
  scale,
  onClick,
}: {
  admin: Employee;
  scale: number;
  onClick: (user: Employee) => void;
}) => {
  const isCompact = scale < 0.6;

  return (
    <div
      className={`
        bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl shadow-xl relative z-10 transition-all cursor-pointer group
        ${isCompact ? "p-3 w-40" : "p-5 w-80"}
        hover:shadow-2xl hover:-translate-y-1 hover:from-purple-500 hover:to-purple-600
      `}
      onClick={() => onClick(admin)}
    >
      {/* Crown Icon */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
        <div className="bg-yellow-400 rounded-full p-1.5 shadow-lg">
          <Crown size={16} className="text-yellow-800" />
        </div>
      </div>

      <div className="flex items-center gap-4 text-white">
        <img
          src={
            admin.avatar_url ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              admin.full_name
            )}&background=7c3aed&color=fff`
          }
          alt=""
          className={`rounded-full border-3 border-white/30 shadow-lg ${
            isCompact ? "w-10 h-10" : "w-16 h-16"
          }`}
        />
        <div className="overflow-hidden flex-1">
          <p
            className={`font-bold truncate ${
              isCompact ? "text-xs" : "text-lg"
            }`}
          >
            {admin.full_name}
          </p>
          {!isCompact && (
            <>
              <p className="text-purple-200 text-sm truncate">
                {admin.position || "Giám đốc / Quản trị viên"}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                  {admin.role}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Department Node with Employees ---
const DepartmentNode = ({
  dept,
  employees,
  scale,
  showEmployees,
  onToggleEmployees,
  onEmployeeClick,
  onEdit,
  onAddChild,
  onDelete,
}: {
  dept: DepartmentTreeNode;
  employees: Employee[];
  scale: number;
  showEmployees: boolean;
  onToggleEmployees: () => void;
  onEmployeeClick: (user: Employee) => void;
  onEdit: (dept: Department) => void;
  onAddChild: (dept: Department) => void;
  onDelete: (dept: Department) => void;
}) => {
  const isCompact = scale < 0.6;
  const hasChildren = dept.children.length > 0;
  const deptEmployees = employees.filter((e) => e.department_id === dept.id && e.role !== "Admin");
  const manager = employees.find((e) => e.id === dept.managerId);

  const getKpiColor = (status?: string) => {
    switch (status) {
      case "On Track":
        return "text-green-600 bg-green-50";
      case "At Risk":
        return "text-amber-600 bg-amber-50";
      case "Behind":
        return "text-red-600 bg-red-50";
      default:
        return "text-slate-600 bg-slate-50";
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Department Card */}
      <div
        className={`
          bg-white rounded-xl shadow-lg border-2 border-slate-200 relative z-10 transition-all group
          ${isCompact ? "p-2 w-40" : "p-4 w-72"}
          hover:border-blue-400 hover:shadow-xl hover:-translate-y-1
        `}
      >
        {/* Level indicator */}
        <div
          className={`absolute top-0 left-0 w-1.5 h-full rounded-l-xl ${
            dept.level === 0
              ? "bg-blue-500"
              : dept.level === 1
              ? "bg-emerald-500"
              : "bg-purple-500"
          }`}
        />

        {/* Action Buttons */}
        <div className="absolute -top-3 -right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddChild(dept);
            }}
            className="p-1.5 bg-green-500 text-white rounded-full shadow-md hover:bg-green-600 transition-colors"
            title="Thêm phòng ban con"
          >
            <Plus size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(dept);
            }}
            className="p-1.5 bg-blue-500 text-white rounded-full shadow-md hover:bg-blue-600 transition-colors"
            title="Chỉnh sửa"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(dept);
            }}
            className="p-1.5 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 transition-colors"
            title="Xóa"
          >
            <Trash2 size={14} />
          </button>
        </div>

        {/* Header with Manager */}
        <div className="flex items-center gap-3 pl-2">
          {!isCompact && manager && (
            <img
              src={
                manager.avatar_url ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  manager.full_name
                )}&background=random`
              }
              alt=""
              className="w-12 h-12 rounded-full border-2 border-blue-200 shadow cursor-pointer hover:ring-2 hover:ring-blue-300 transition-all"
              onClick={(e) => {
                e.stopPropagation();
                onEmployeeClick(manager);
              }}
            />
          )}
          {!isCompact && !manager && (
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50">
              <UserCircle size={24} className="text-slate-400" />
            </div>
          )}
          <div className="overflow-hidden flex-1">
            <p
              className={`font-bold text-slate-900 truncate ${
                isCompact ? "text-xs text-center" : "text-sm"
              }`}
              title={dept.name}
            >
              {dept.name}
            </p>
            {!isCompact && (
              <p className="text-xs text-blue-600 truncate">
                {manager?.full_name || "Chưa có trưởng phòng"}
              </p>
            )}
          </div>
        </div>

        {/* Stats */}
        {!isCompact && (
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100 pl-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleEmployees();
              }}
              className={`text-[11px] px-2 py-1 rounded-full flex items-center gap-1 transition-colors ${
                showEmployees
                  ? "bg-blue-100 text-blue-700"
                  : "bg-slate-100 text-slate-600 hover:bg-blue-50"
              }`}
            >
              <Users size={12} /> {deptEmployees.length}
              {showEmployees ? (
                <EyeOff size={10} />
              ) : (
                <Eye size={10} />
              )}
            </button>
            {hasChildren && (
              <span className="text-[11px] bg-brand-50 text-brand-700 px-2 py-1 rounded-full flex items-center gap-1">
                <GitBranch size={12} /> {dept.children.length}
              </span>
            )}
            {dept.kpiStatus && (
              <span
                className={`text-[11px] px-2 py-1 rounded-full ${getKpiColor(
                  dept.kpiStatus
                )}`}
              >
                {dept.kpiStatus}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Employees under this department */}
      {showEmployees && deptEmployees.length > 0 && (
        <>
          <div className="w-0.5 h-4 bg-slate-300" />
          <div className="flex flex-wrap justify-center gap-2 max-w-[350px] p-3 bg-slate-50 rounded-lg border border-slate-200">
            {deptEmployees.map((emp) => (
              <div
                key={emp.id}
                className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 shadow-sm border border-slate-100 cursor-pointer hover:border-blue-300 hover:shadow transition-all"
                onClick={() => onEmployeeClick(emp)}
                title={emp.full_name}
              >
                <img
                  src={
                    emp.avatar_url ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      emp.full_name
                    )}&background=random&size=32`
                  }
                  alt=""
                  className="w-8 h-8 rounded-full"
                />
                <div className="max-w-[120px]">
                  <p className="text-xs font-medium text-slate-800 truncate">
                    {emp.full_name}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">
                    {emp.position || "Nhân viên"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Children Departments */}
      {hasChildren && (
        <>
          <div className="w-0.5 h-6 bg-slate-300" />
          <div className="flex gap-6 relative">
            {dept.children.length > 1 && (
              <div
                className="absolute top-0 h-0.5 bg-slate-300"
                style={{
                  left: `calc(50% - ${(dept.children.length - 1) * (isCompact ? 80 : 140)}px)`,
                  right: `calc(50% - ${(dept.children.length - 1) * (isCompact ? 80 : 140)}px)`,
                }}
              />
            )}
            <div className="flex justify-center gap-6">
              {dept.children.map((child) => (
                <div key={child.id} className="relative pt-4">
                  <div className="absolute -top-0 left-1/2 -ml-px w-0.5 h-4 bg-slate-300" />
                  <DepartmentNode
                    dept={child}
                    employees={employees}
                    scale={scale}
                    showEmployees={showEmployees}
                    onToggleEmployees={onToggleEmployees}
                    onEmployeeClick={onEmployeeClick}
                    onEdit={onEdit}
                    onAddChild={onAddChild}
                    onDelete={onDelete}
                  />
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// --- Department Form Modal ---
const DeptFormModal = ({
  dept,
  parentDept,
  allDepartments,
  onSave,
  onClose,
  saving,
}: {
  dept?: Department;
  parentDept?: Department;
  allDepartments: Department[];
  onSave: (d: Partial<Department>) => void;
  onClose: () => void;
  saving: boolean;
}) => {
  const [formData, setFormData] = useState<Partial<Department>>({
    name: dept?.name || "",
    code: dept?.code || "",
    description: dept?.description || "",
    parentDepartmentId: parentDept?.id || dept?.parentDepartmentId || null,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const getValidParentOptions = () => {
    if (!dept) return allDepartments;
    const invalidIds = new Set<string>();
    const findChildren = (parentId: string) => {
      invalidIds.add(parentId);
      allDepartments
        .filter((d) => d.parentDepartmentId === parentId)
        .forEach((child) => findChildren(child.id));
    };
    findChildren(dept.id);
    return allDepartments.filter((d) => !invalidIds.has(d.id));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-brand-600 to-brand-700 px-6 py-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              {dept ? <Edit2 size={20} /> : <Plus size={20} />}
              {dept
                ? "Chỉnh sửa Phòng ban"
                : parentDept
                ? `Thêm phòng ban con`
                : "Thêm Phòng ban mới"}
            </h3>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Input
            label="Tên phòng ban"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            placeholder="VD: Phòng Nhân sự"
            required
          />

          <Input
            label="Mã phòng ban"
            value={formData.code || ""}
            onChange={(e) =>
              setFormData({ ...formData, code: e.target.value })
            }
            placeholder="VD: HR"
          />

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Phòng ban cha
            </label>
            <select
              className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
              value={formData.parentDepartmentId || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  parentDepartmentId: e.target.value || null,
                })
              }
            >
              <option value="">-- Không có (Phòng ban gốc) --</option>
              {getValidParentOptions().map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Mô tả
            </label>
            <textarea
              className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all resize-none"
              rows={3}
              value={formData.description || ""}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Mô tả về phòng ban..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={saving || !formData.name}>
              {saving ? (
                <RefreshCw size={16} className="mr-2 animate-spin" />
              ) : (
                <Save size={16} className="mr-2" />
              )}
              {dept ? "Lưu thay đổi" : "Tạo phòng ban"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Delete Confirmation Modal ---
const DeleteConfirmModal = ({
  dept,
  childCount,
  onConfirm,
  onCancel,
  deleting,
}: {
  dept: Department;
  childCount: number;
  onConfirm: () => void;
  onCancel: () => void;
  deleting: boolean;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
          <Trash2 size={24} className="text-red-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">Xác nhận xóa</h3>
          <p className="text-sm text-slate-500">Phòng ban: {dept.name}</p>
        </div>
      </div>

      {childCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex gap-2">
            <AlertTriangle
              size={20}
              className="text-amber-600 flex-shrink-0"
            />
            <p className="text-sm text-amber-800">
              Phòng ban này có <strong>{childCount}</strong> phòng ban con.
            </p>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={onCancel} disabled={deleting}>
          Hủy
        </Button>
        <Button
          onClick={onConfirm}
          disabled={deleting}
          className="bg-red-600 hover:bg-red-700"
        >
          {deleting ? (
            <RefreshCw size={16} className="mr-2 animate-spin" />
          ) : (
            <Trash2 size={16} className="mr-2" />
          )}
          Xóa
        </Button>
      </div>
    </div>
  </div>
);

// --- Main Component ---
export const OrgChart = () => {
  // Data State
  const [departments, setDepartments] = useState<Department[]>([]);
  const [treeData, setTreeData] = useState<DepartmentTreeNode[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // View State
  const [viewMode, setViewMode] = useState<ViewMode>("tree");
  const [searchTerm, setSearchTerm] = useState("");
  const [showEmployeesGlobal, setShowEmployeesGlobal] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Tree View State
  const [scale, setScale] = useState(0.75);
  const [position, setPosition] = useState({ x: 100, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Modal State
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [addingChildTo, setAddingChildTo] = useState<Department | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deletingDept, setDeletingDept] = useState<Department | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [deptData, userData] = await Promise.all([
        departmentService.getAllDepartments(),
        departmentService.getAllUsersForOrgChart(),
      ]);

      setDepartments(deptData);
      setEmployees(userData);

      const tree = departmentService.buildTree(deptData);
      setTreeData(tree);

      // Auto expand first level
      const firstLevelIds = tree.map((n) => n.id);
      setExpandedNodes(new Set(firstLevelIds));
    } catch (err: any) {
      setError(err.message || "Không thể tải dữ liệu");
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Get Admin/CEO
  const adminUser = employees.find((e) => e.role === "Admin");

  // Pan & Zoom Handlers
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.95 : 1.05;
      setScale((s) => Math.min(Math.max(0.3, s * delta), 2));
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // CRUD Handlers
  const handleSaveDept = async (data: Partial<Department>) => {
    try {
      setSaving(true);
      if (editingDept) {
        await departmentService.updateDepartment(editingDept.id, data as any);
      } else {
        await departmentService.createDepartment(data as any);
      }
      await fetchData();
      setEditingDept(null);
      setAddingChildTo(null);
      setShowAddModal(false);
    } catch (err: any) {
      alert(err.message || "Có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDept = async () => {
    if (!deletingDept) return;
    try {
      setDeleting(true);
      await departmentService.deleteDepartment(deletingDept.id);
      await fetchData();
      setDeletingDept(null);
    } catch (err: any) {
      alert(err.message || "Không thể xóa phòng ban");
    } finally {
      setDeleting(false);
    }
  };

  const handleEmployeeClick = (emp: Employee) => {
    const dept = departments.find((d) => d.id === emp.department_id);
    setSelectedUser({
      id: emp.id,
      fullName: emp.full_name,
      email: emp.email,
      avatarUrl:
        emp.avatar_url ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
          emp.full_name
        )}&background=random`,
      position: emp.position || "Nhân viên",
      department: dept?.name || "Chưa phân bổ",
      role: emp.role,
      status: emp.status === "Active" ? "Active" : "Blocked",
    });
  };

  const toggleExpand = (id: string) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    const allIds = new Set<string>();
    const collectIds = (nodes: DepartmentTreeNode[]) => {
      nodes.forEach((n) => {
        allIds.add(n.id);
        collectIds(n.children);
      });
    };
    collectIds(treeData);
    setExpandedNodes(allIds);
  };

  const collapseAll = () => {
    setExpandedNodes(new Set());
  };

  const getChildCount = (deptId: string): number => {
    let count = 0;
    const countChildren = (parentId: string) => {
      const children = departments.filter(
        (d) => d.parentDepartmentId === parentId
      );
      count += children.length;
      children.forEach((child) => countChildren(child.id));
    };
    countChildren(deptId);
    return count;
  };

  // Stats
  const stats = {
    total: departments.length,
    totalEmployees: employees.length,
    admins: employees.filter((e) => e.role === "Admin").length,
    managers: employees.filter((e) => e.role === "Manager").length,
  };

  return (
    <div className="animate-fadeIn h-full flex flex-col">
      {/* Modals */}
      {selectedUser && (
        <UserProfileModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
      {(editingDept || addingChildTo || showAddModal) && (
        <DeptFormModal
          dept={editingDept || undefined}
          parentDept={addingChildTo || undefined}
          allDepartments={departments}
          onSave={handleSaveDept}
          onClose={() => {
            setEditingDept(null);
            setAddingChildTo(null);
            setShowAddModal(false);
          }}
          saving={saving}
        />
      )}
      {deletingDept && (
        <DeleteConfirmModal
          dept={deletingDept}
          childCount={getChildCount(deletingDept.id)}
          onConfirm={handleDeleteDept}
          onCancel={() => setDeletingDept(null)}
          deleting={deleting}
        />
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center">
              <Network size={22} className="text-brand-600" />
            </div>
            Sơ đồ Tổ chức
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Cấu trúc: Giám đốc → Phòng ban → Nhân viên
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Toggle Employees */}
          <Button
            variant={showEmployeesGlobal ? "primary" : "outline"}
            onClick={() => setShowEmployeesGlobal(!showEmployeesGlobal)}
          >
            <Users size={18} className="mr-2" />
            {showEmployeesGlobal ? "Ẩn nhân viên" : "Hiện nhân viên"}
          </Button>

          <Button onClick={() => setShowAddModal(true)} variant="outline">
            <Plus size={18} className="mr-2" />
            Thêm mới
          </Button>

          <Button variant="outline" onClick={fetchData}>
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Crown size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.admins}</p>
              <p className="text-xs text-slate-500">Quản trị viên</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              <p className="text-xs text-slate-500">Phòng ban</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Briefcase size={20} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {stats.managers}
              </p>
              <p className="text-xs text-slate-500">Trưởng phòng</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Users size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {stats.totalEmployees}
              </p>
              <p className="text-xs text-slate-500">Tổng nhân sự</p>
            </div>
          </div>
        </div>
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw
              size={40}
              className="mx-auto text-brand-500 animate-spin mb-4"
            />
            <p className="text-slate-500">Đang tải dữ liệu...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle size={40} className="mx-auto text-red-500 mb-4" />
            <p className="text-slate-700 font-medium">{error}</p>
            <Button variant="outline" onClick={fetchData} className="mt-4">
              Thử lại
            </Button>
          </div>
        </div>
      )}

      {/* Tree View */}
      {!loading && !error && (
        <div
          className="flex-1 bg-slate-100 rounded-xl border border-slate-200 overflow-hidden relative shadow-inner select-none"
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          style={{ cursor: isDragging ? "grabbing" : "grab" }}
        >
          {/* Background Pattern */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(#475569 1px, transparent 1px)",
              backgroundSize: `${20 * scale}px ${20 * scale}px`,
              backgroundPosition: `${position.x}px ${position.y}px`,
            }}
          />

          {/* Zoom Controls */}
          <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-20">
            <button
              onClick={() => setScale((s) => Math.min(s + 0.1, 2))}
              className="p-2.5 bg-white rounded-lg shadow-md border border-slate-200 text-slate-600 hover:text-brand-600 hover:bg-slate-50 transition-colors"
              title="Phóng to"
            >
              <ZoomIn size={20} />
            </button>
            <button
              onClick={() => {
                setScale(0.75);
                setPosition({ x: 100, y: 50 });
              }}
              className="p-2.5 bg-white rounded-lg shadow-md border border-slate-200 text-slate-600 hover:text-brand-600 hover:bg-slate-50 transition-colors"
              title="Đặt lại"
            >
              <Maximize size={20} />
            </button>
            <button
              onClick={() => setScale((s) => Math.max(s - 0.1, 0.3))}
              className="p-2.5 bg-white rounded-lg shadow-md border border-slate-200 text-slate-600 hover:text-brand-600 hover:bg-slate-50 transition-colors"
              title="Thu nhỏ"
            >
              <ZoomOut size={20} />
            </button>
          </div>

          {/* Zoom Indicator */}
          <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full border border-slate-200 text-xs font-medium text-slate-600 shadow-sm">
            Zoom: {Math.round(scale * 100)}%
          </div>

          {/* Legend */}
          <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur p-3 rounded-lg border border-slate-200 shadow-sm">
            <p className="text-xs font-semibold text-slate-700 mb-2">Chú thích</p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <div className="w-3 h-3 bg-purple-600 rounded" />
                <span>Giám đốc/Admin</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <div className="w-3 h-3 bg-blue-500 rounded" />
                <span>Phòng ban cấp 1</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <div className="w-3 h-3 bg-emerald-500 rounded" />
                <span>Phòng ban cấp 2</span>
              </div>
            </div>
          </div>

          {/* Tree Content */}
          <div
            className="origin-top-left transition-transform duration-75 ease-out min-w-max min-h-max p-16"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            }}
          >
            <div className="flex flex-col items-center">
              {/* CEO/Admin at top */}
              {adminUser && (
                <>
                  <CEONode
                    admin={adminUser}
                    scale={scale}
                    onClick={handleEmployeeClick}
                  />
                  <div className="w-0.5 h-8 bg-slate-300" />
                </>
              )}

              {/* Departments */}
              <div className="flex gap-8 relative">
                {treeData.length > 1 && (
                  <div
                    className="absolute top-0 h-0.5 bg-slate-300"
                    style={{
                      left: `calc(50% - ${(treeData.length - 1) * 140}px)`,
                      right: `calc(50% - ${(treeData.length - 1) * 140}px)`,
                    }}
                  />
                )}
                <div className="flex justify-center gap-8">
                  {treeData.map((dept) => (
                    <div key={dept.id} className="relative pt-4">
                      {treeData.length > 1 && (
                        <div className="absolute -top-0 left-1/2 -ml-px w-0.5 h-4 bg-slate-300" />
                      )}
                      <DepartmentNode
                        dept={dept}
                        employees={employees}
                        scale={scale}
                        showEmployees={showEmployeesGlobal}
                        onToggleEmployees={() =>
                          setShowEmployeesGlobal(!showEmployeesGlobal)
                        }
                        onEmployeeClick={handleEmployeeClick}
                        onEdit={setEditingDept}
                        onAddChild={setAddingChildTo}
                        onDelete={setDeletingDept}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Empty state */}
              {treeData.length === 0 && (
                <div className="text-center py-12">
                  <Building2
                    size={48}
                    className="mx-auto text-slate-300 mb-4"
                  />
                  <p className="text-slate-500 mb-4">Chưa có phòng ban nào</p>
                  <Button onClick={() => setShowAddModal(true)}>
                    <Plus size={18} className="mr-2" />
                    Tạo phòng ban đầu tiên
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
