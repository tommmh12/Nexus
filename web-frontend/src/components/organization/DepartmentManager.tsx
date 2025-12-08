import React, { useState } from "react";
import { Department, EmployeeProfile } from "../../types";
// TODO: Replace with API call
import { Button } from "../system/ui/Button";
import { Input } from "../system/ui/Input";
import {
  Plus,
  MoreHorizontal,
  Building,
  Users,
  Target,
  ArrowLeft,
  Edit2,
  TrendingUp,
  Award,
  UserPlus,
  ArrowRightLeft,
  Trash2,
  X,
  Save,
  Search,
  Check,
} from "lucide-react";

// --- Types & Interfaces for Local Use ---
interface DepartmentFormProps {
  department?: Department | null;
  onSave: (dept: Department) => void;
  onCancel: () => void;
  users: EmployeeProfile[]; // Needed to select manager
}

interface TransferModalProps {
  user: EmployeeProfile;
  departments: Department[];
  onConfirm: (userId: string, targetDeptName: string) => void;
  onCancel: () => void;
}

interface AddMemberModalProps {
  department: Department;
  availableUsers: EmployeeProfile[];
  onConfirm: (userIds: string[]) => void;
  onCancel: () => void;
}

// --- Modals ---

const DepartmentFormModal = ({
  department,
  onSave,
  onCancel,
  users,
}: DepartmentFormProps) => {
  const [formData, setFormData] = useState<Partial<Department>>(
    department || {
      name: "",
      description: "",
      managerName: "",
      budget: "",
      kpiStatus: "On Track",
      memberCount: 0,
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // If manager selected, find avatar
    const manager = users.find((u) => u.fullName === formData.managerName);
    const managerAvatar = manager
      ? manager.avatarUrl
      : "https://ui-avatars.com/api/?name=" + formData.managerName;

    onSave({ ...formData, managerAvatar } as Department);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-900">
            {department ? "Chỉnh sửa Phòng ban" : "Thêm Phòng ban mới"}
          </h3>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Tên phòng ban"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Trưởng phòng
            </label>
            <select
              className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
              value={formData.managerName}
              onChange={(e) =>
                setFormData({ ...formData, managerName: e.target.value })
              }
            >
              <option value="">Chọn trưởng phòng...</option>
              {users.map((u) => (
                <option key={u.id} value={u.fullName}>
                  {u.fullName} ({u.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Mô tả nhiệm vụ
            </label>
            <textarea
              className="w-full bg-slate-50 border border-slate-200 rounded-md p-3 text-sm focus:ring-2 focus:ring-brand-500 outline-none h-24 resize-none"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Ngân sách (Budget)"
              value={formData.budget}
              onChange={(e) =>
                setFormData({ ...formData, budget: e.target.value })
              }
            />
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Trạng thái KPI
              </label>
              <select
                className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                value={formData.kpiStatus}
                onChange={(e) =>
                  setFormData({ ...formData, kpiStatus: e.target.value as any })
                }
              >
                <option value="On Track">On Track (Đúng tiến độ)</option>
                <option value="At Risk">At Risk (Rủi ro)</option>
                <option value="Behind">Behind (Chậm trễ)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={onCancel}>
              Hủy
            </Button>
            <Button type="submit">
              <Save size={16} className="mr-2" /> Lưu
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TransferModal = ({
  user,
  departments,
  onConfirm,
  onCancel,
}: TransferModalProps) => {
  const [targetDept, setTargetDept] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ArrowRightLeft size={20} className="text-brand-600" /> Điều chuyển
            Nhân sự
          </h3>
          <button onClick={onCancel}>
            <X size={20} className="text-slate-400 hover:text-slate-600" />
          </button>
        </div>

        <p className="text-sm text-slate-600 mb-4">
          Chọn phòng ban mới cho nhân viên{" "}
          <span className="font-bold text-slate-900">{user.fullName}</span>.
        </p>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Phòng ban đích
          </label>
          <select
            className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
            value={targetDept}
            onChange={(e) => setTargetDept(e.target.value)}
          >
            <option value="">Chọn phòng ban...</option>
            {departments
              .filter((d) => d.name !== user.department)
              .map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
          </select>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onCancel}>
            Hủy
          </Button>
          <Button
            disabled={!targetDept}
            onClick={() => onConfirm(user.id, targetDept)}
          >
            Xác nhận điều chuyển
          </Button>
        </div>
      </div>
    </div>
  );
};

const AddMemberModal = ({
  department,
  availableUsers,
  onConfirm,
  onCancel,
}: AddMemberModalProps) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const toggleUser = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  const filteredUsers = availableUsers.filter(
    (u) =>
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 flex flex-col max-h-[80vh]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-900">
            Thêm nhân sự vào {department.name}
          </h3>
          <button onClick={onCancel}>
            <X size={20} className="text-slate-400 hover:text-slate-600" />
          </button>
        </div>

        <div className="relative mb-4">
          <Search
            size={16}
            className="absolute left-3 top-2.5 text-slate-400"
          />
          <input
            type="text"
            placeholder="Tìm kiếm nhân viên..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto border border-slate-100 rounded-lg mb-4 p-2 space-y-1 custom-scrollbar">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((u) => (
              <div
                key={u.id}
                onClick={() => toggleUser(u.id)}
                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                  selectedIds.includes(u.id)
                    ? "bg-brand-50 border border-brand-200"
                    : "hover:bg-slate-50 border border-transparent"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded border flex items-center justify-center ${
                    selectedIds.includes(u.id)
                      ? "bg-brand-600 border-brand-600"
                      : "bg-white border-slate-300"
                  }`}
                >
                  {selectedIds.includes(u.id) && (
                    <Check size={14} className="text-white" />
                  )}
                </div>
                <img
                  src={u.avatarUrl}
                  className="w-8 h-8 rounded-full"
                  alt=""
                />
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {u.fullName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {u.department || "Chưa phân bổ"}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-sm text-slate-500 py-4">
              Không tìm thấy nhân sự phù hợp.
            </p>
          )}
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-slate-100">
          <span className="text-sm text-slate-500">
            Đã chọn:{" "}
            <span className="font-bold text-slate-900">
              {selectedIds.length}
            </span>
          </span>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onCancel}>
              Hủy
            </Button>
            <Button
              disabled={selectedIds.length === 0}
              onClick={() => onConfirm(selectedIds)}
            >
              Thêm nhân sự
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Detail View Component ---

const DepartmentDetailView = ({
  department,
  allUsers,
  allDepts,
  onBack,
  onEdit,
  onTransferUser,
  onAddMembers,
}: {
  department: Department;
  allUsers: EmployeeProfile[];
  allDepts: Department[];
  onBack: () => void;
  onEdit: () => void;
  onTransferUser: (userId: string, targetDept: string) => void;
  onAddMembers: (userIds: string[]) => void;
}) => {
  const [activeTab, setActiveTab] = useState<
    "overview" | "members" | "projects"
  >("members");
  const [transferUser, setTransferUser] = useState<EmployeeProfile | null>(
    null
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Filter Data
  const deptMembers = allUsers.filter(
    (u) =>
      u.department === department.name ||
      (department.id === "tech" && u.department === "Software Development") // Handle mock data discrepancy
  );

  // Users available to add (not in current dept)
  const availableToAdd = allUsers.filter(
    (u) =>
      u.department !== department.name &&
      !(department.id === "tech" && u.department === "Software Development")
  );

  const deptProjects: any[] = []; // TODO: Fetch from API
  const projectsFiltered = deptProjects.filter(
    (p) =>
      p.participatingDepartments.includes(department.name) ||
      (department.id === "tech" &&
        p.participatingDepartments.includes("Software Development"))
  );

  return (
    <div className="animate-fadeIn relative">
      {/* Inner Modals */}
      {transferUser && (
        <TransferModal
          user={transferUser}
          departments={allDepts}
          onConfirm={(uid, target) => {
            onTransferUser(uid, target);
            setTransferUser(null);
          }}
          onCancel={() => setTransferUser(null)}
        />
      )}

      {isAddModalOpen && (
        <AddMemberModal
          department={department}
          availableUsers={availableToAdd}
          onConfirm={(ids) => {
            onAddMembers(ids);
            setIsAddModalOpen(false);
          }}
          onCancel={() => setIsAddModalOpen(false)}
        />
      )}

      {/* Header */}
      <div className="mb-8">
        <Button
          variant="outline"
          onClick={onBack}
          className="mb-4 text-xs h-8 px-2"
        >
          <ArrowLeft size={16} className="mr-1" /> Quay lại danh sách
        </Button>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Building size={120} />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start">
            <div className="w-20 h-20 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 border border-brand-100 shadow-sm">
              <Building size={40} />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 mb-2">
                    {department.name}
                  </h1>
                  <p className="text-slate-500 max-w-2xl">
                    {department.description}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={onEdit}>
                    <Edit2 size={16} className="mr-2" /> Chỉnh sửa thông tin
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-6 mt-6">
                <div className="flex items-center gap-3 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                  <img
                    src={department.managerAvatar}
                    className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                    alt=""
                  />
                  <div>
                    <p className="text-xs text-slate-500">Trưởng phòng</p>
                    <p className="font-semibold text-slate-900 text-sm">
                      {department.managerName}
                    </p>
                  </div>
                  <button
                    onClick={onEdit}
                    className="ml-2 text-brand-600 text-xs hover:underline"
                  >
                    Thay đổi
                  </button>
                </div>
                <div className="w-px h-10 bg-slate-200 self-center"></div>
                <div className="self-center">
                  <p className="text-xs text-slate-500">Ngân sách (Năm)</p>
                  <p className="font-semibold text-slate-900">
                    {department.budget}
                  </p>
                </div>
                <div className="w-px h-10 bg-slate-200 self-center"></div>
                <div className="self-center">
                  <p className="text-xs text-slate-500">Trạng thái KPI</p>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold mt-1 ${
                      department.kpiStatus === "On Track"
                        ? "bg-green-100 text-green-700"
                        : department.kpiStatus === "At Risk"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    <Target size={12} />
                    {department.kpiStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6">
        {[
          { id: "overview", label: "Tổng quan" },
          { id: "members", label: `Nhân sự (${deptMembers.length})` },
          { id: "projects", label: `Dự án (${deptProjects.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-brand-600 text-brand-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center">
                <TrendingUp size={20} className="mr-2 text-brand-600" /> Hiệu
                suất KPI
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">Hoàn thành dự án</span>
                    <span className="font-bold text-slate-900">85%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: "85%" }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">Tuyển dụng</span>
                    <span className="font-bold text-slate-900">60%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{ width: "60%" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "members" && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-fadeIn">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-900">Danh sách Nhân sự</h3>
              <Button
                className="text-xs h-9"
                onClick={() => setIsAddModalOpen(true)}
              >
                <UserPlus size={16} className="mr-2" /> Thêm nhân sự
              </Button>
            </div>
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                    Nhân viên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                    Vị trí
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {deptMembers.length > 0 ? (
                  deptMembers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap flex items-center gap-3">
                        <img
                          src={u.avatarUrl}
                          className="w-8 h-8 rounded-full"
                          alt=""
                        />
                        <div>
                          <div className="font-medium text-slate-900">
                            {u.fullName}
                          </div>
                          <div className="text-xs text-slate-500">
                            {u.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {u.position}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            u.status === "Active"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          className="text-xs h-8 text-blue-600 hover:bg-blue-50"
                          onClick={() => setTransferUser(u)}
                        >
                          <ArrowRightLeft size={14} className="mr-1" /> Điều
                          chuyển
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-8 text-center text-slate-500 text-sm"
                    >
                      Chưa có nhân sự nào trong phòng ban này.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "projects" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
            {deptProjects.length > 0 ? (
              deptProjects.map((p) => (
                <div
                  key={p.id}
                  className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm hover:border-brand-300 transition-colors"
                >
                  <div className="flex justify-between mb-2">
                    <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
                      {p.code}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        p.status === "Done"
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 mb-2">{p.name}</h4>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 mb-3">
                    <div
                      className="bg-brand-600 h-1.5 rounded-full"
                      style={{ width: `${p.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>PM: {p.manager}</span>
                    <span>Deadline: {p.endDate}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-500">
                Không có dự án nào đang hoạt động.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const DepartmentManager = () => {
  const [view, setView] = useState<"list" | "detail">("list");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<EmployeeProfile[]>([]);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);

  const handleViewDetail = (dept: Department) => {
    setSelectedDept(dept);
    setView("detail");
  };

  const handleCreateClick = () => {
    setEditingDept(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (dept: Department, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingDept(dept);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Bạn có chắc chắn muốn xóa phòng ban này?")) {
      setDepartments((prev) => prev.filter((d) => d.id !== id));
    }
  };

  const handleSaveDept = (dept: Department) => {
    if (editingDept) {
      setDepartments((prev) => prev.map((d) => (d.id === dept.id ? dept : d)));
      if (selectedDept && selectedDept.id === dept.id) setSelectedDept(dept);
    } else {
      const newDept = { ...dept, id: `dept-${Date.now()}` };
      setDepartments((prev) => [...prev, newDept]);
    }
    setIsFormOpen(false);
  };

  const handleTransferUser = (userId: string, targetDeptName: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, department: targetDeptName } : u
      )
    );

    // Update counts (Mock logic)
    const oldDeptName = users.find((u) => u.id === userId)?.department;
    setDepartments((prev) =>
      prev.map((d) => {
        if (d.name === targetDeptName)
          return { ...d, memberCount: d.memberCount + 1 };
        if (d.name === oldDeptName)
          return { ...d, memberCount: Math.max(0, d.memberCount - 1) };
        return d;
      })
    );
  };

  const handleAddMembers = (userIds: string[]) => {
    if (!selectedDept) return;
    setUsers((prev) =>
      prev.map((u) =>
        userIds.includes(u.id) ? { ...u, department: selectedDept.name } : u
      )
    );

    setDepartments((prev) =>
      prev.map((d) =>
        d.id === selectedDept.id
          ? { ...d, memberCount: d.memberCount + userIds.length }
          : d
      )
    );
  };

  if (view === "detail" && selectedDept) {
    return (
      <>
        <DepartmentDetailView
          department={selectedDept}
          allUsers={users}
          allDepts={departments}
          onBack={() => setView("list")}
          onEdit={() => handleEditClick(selectedDept)}
          onTransferUser={handleTransferUser}
          onAddMembers={handleAddMembers}
        />
        {isFormOpen && (
          <DepartmentFormModal
            department={editingDept}
            onSave={handleSaveDept}
            onCancel={() => setIsFormOpen(false)}
            users={users}
          />
        )}
      </>
    );
  }

  return (
    <div className="animate-fadeIn relative">
      {isFormOpen && (
        <DepartmentFormModal
          department={editingDept}
          onSave={handleSaveDept}
          onCancel={() => setIsFormOpen(false)}
          users={users}
        />
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Danh sách Phòng ban
          </h1>
          <p className="text-slate-500 mt-1">
            Quản lý cơ cấu tổ chức và thông tin các khối phòng ban.
          </p>
        </div>
        <Button onClick={handleCreateClick}>
          <Plus size={18} className="mr-2" /> Thêm phòng ban
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {departments
          .filter((d) => !d.parentDeptId || d.parentDeptId === "bod")
          .map((dept) => (
            <div
              key={dept.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group cursor-pointer"
              onClick={() => handleViewDetail(dept)}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-slate-50 rounded-lg text-slate-600 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                    <Building size={24} />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleEditClick(dept, e)}
                      className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-brand-600"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={(e) => handleDelete(dept.id, e)}
                      className="p-1.5 hover:bg-red-50 rounded text-slate-500 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {dept.name}
                </h3>
                <p className="text-sm text-slate-500 mb-6 line-clamp-2 min-h-[40px]">
                  {dept.description}
                </p>

                <div className="flex items-center gap-3 mb-6 p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <img
                    src={dept.managerAvatar}
                    alt={dept.managerName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-xs text-slate-500">Trưởng phòng</p>
                    <p className="text-sm font-bold text-slate-900">
                      {dept.managerName}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                  <div>
                    <div className="flex items-center text-slate-500 mb-1">
                      <Users size={14} className="mr-1.5" />{" "}
                      <span className="text-xs">Nhân sự</span>
                    </div>
                    <span className="font-semibold text-slate-800">
                      {dept.memberCount}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center text-slate-500 mb-1">
                      <Target size={14} className="mr-1.5" />{" "}
                      <span className="text-xs">KPI Status</span>
                    </div>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        dept.kpiStatus === "On Track"
                          ? "bg-green-100 text-green-700"
                          : dept.kpiStatus === "At Risk"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {dept.kpiStatus}
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 rounded-b-xl flex justify-between items-center text-xs">
                <span className="text-slate-500">
                  Budget:{" "}
                  <span className="font-medium text-slate-700">
                    {dept.budget}
                  </span>
                </span>
                <button
                  className="text-brand-600 font-medium hover:underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewDetail(dept);
                  }}
                >
                  Chi tiết
                </button>
              </div>
            </div>
          ))}

        {/* Add New Card Placeholder */}
        <div
          onClick={handleCreateClick}
          className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-brand-400 hover:text-brand-600 hover:bg-brand-50/50 transition-all cursor-pointer min-h-[300px]"
        >
          <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center mb-4 group-hover:bg-white shadow-sm">
            <Plus size={28} />
          </div>
          <span className="font-medium text-lg">Thêm phòng ban</span>
        </div>
      </div>
    </div>
  );
};
