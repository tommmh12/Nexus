import React, { useState, useEffect } from "react";
import { Button } from "../../../components/system/ui/Button";
import { Input } from "../../../components/system/ui/Input";
import {
    Video,
    Plus,
    Calendar,
    Clock,
    Users,
    Trash2,
    Globe,
    Lock,
    Play,
    X,
    Check,
    Search,
} from "lucide-react";
import { onlineMeetingService } from "../../../services/onlineMeetingService";
import { departmentService, Department } from "../../../services/departmentService";
import { userService, User } from "../../../services/userService";
import type {
    OnlineMeetingDetails,
    CreateOnlineMeetingRequest,
} from "../../../types/onlineMeeting.types";
import { useNavigate } from "react-router-dom";

export const OnlineMeetingModule = () => {
    const [meetings, setMeetings] = useState<OnlineMeetingDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<"list" | "create">("list");

    // Form state
    const [formData, setFormData] = useState<CreateOnlineMeetingRequest>({
        title: "",
        description: "",
        scheduledStart: "",
        scheduledEnd: "",
        accessMode: "private",
        participantIds: [],
    });

    // Department and user selection state
    const [departments, setDepartments] = useState<Department[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        if (view === "list") {
            loadMeetings();
        } else if (view === "create") {
            loadDepartmentsAndUsers();
        }
    }, [view]);

    const loadMeetings = async () => {
        try {
            setLoading(true);
            const data = await onlineMeetingService.getMeetings();
            setMeetings(data);
        } catch (error) {
            console.error("Error loading meetings:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadDepartmentsAndUsers = async () => {
        try {
            const [deptData, userData] = await Promise.all([
                departmentService.getAllDepartments(),
                userService.getAllUsers(),
            ]);
            setDepartments(deptData);
            setUsers(userData.filter(u => u.status === "Active"));
        } catch (error) {
            console.error("Error loading departments/users:", error);
        }
    };

    const handleCreateMeeting = async (e: React.FormEvent) => {
        e.preventDefault();

        // Collect participant IDs based on selected departments and users
        const participantIds = new Set<string>(selectedUsers);

        // Add all users from selected departments
        selectedDepartments.forEach(deptId => {
            users
                .filter(u => u.department_id === deptId)
                .forEach(u => participantIds.add(u.id));
        });

        try {
            await onlineMeetingService.createMeeting({
                ...formData,
                participantIds: Array.from(participantIds),
            });
            setView("list");
            // Reset form
            setFormData({
                title: "",
                description: "",
                scheduledStart: "",
                scheduledEnd: "",
                accessMode: "private",
                participantIds: [],
            });
            setSelectedDepartments([]);
            setSelectedUsers([]);
        } catch (error) {
            console.error("Error creating meeting:", error);
            alert("Lỗi khi tạo cuộc họp");
        }
    };

    const handleJoinMeeting = (meetingId: string) => {
        navigate(`/admin/online-meetings/${meetingId}/join`);
    };

    const handleDeleteMeeting = async (id: string) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa cuộc họp này?")) {
            try {
                await onlineMeetingService.deleteMeeting(id);
                loadMeetings();
            } catch (error) {
                console.error("Error deleting meeting:", error);
                alert("Lỗi khi xóa cuộc họp");
            }
        }
    };

    const toggleDepartment = (deptId: string) => {
        const isCurrentlySelected = selectedDepartments.includes(deptId);

        if (isCurrentlySelected) {
            // Uncheck department - remove it and all its users
            setSelectedDepartments(prev => prev.filter(id => id !== deptId));
            const usersInDept = users.filter(u => u.department_id === deptId).map(u => u.id);
            setSelectedUsers(prev => prev.filter(id => !usersInDept.includes(id)));
        } else {
            // Check department - add it and all its users
            setSelectedDepartments(prev => [...prev, deptId]);
            const usersInDept = users.filter(u => u.department_id === deptId).map(u => u.id);
            setSelectedUsers(prev => [...new Set([...prev, ...usersInDept])]);
        }
    };

    const toggleUser = (userId: string) => {
        setSelectedUsers(prev =>
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "scheduled":
                return "bg-blue-50 text-blue-700 border-blue-100";
            case "active":
                return "bg-green-50 text-green-700 border-green-100";
            case "ended":
                return "bg-gray-50 text-gray-700 border-gray-100";
            case "cancelled":
                return "bg-red-50 text-red-700 border-red-100";
            default:
                return "bg-slate-50 text-slate-700 border-slate-100";
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "scheduled":
                return "Đã lên lịch";
            case "active":
                return "Đang diễn ra";
            case "ended":
                return "Đã kết thúc";
            case "cancelled":
                return "Đã hủy";
            default:
                return status;
        }
    };

    const formatDateTime = (isoString: string) => {
        const date = new Date(isoString);
        return {
            date: date.toLocaleDateString("vi-VN"),
            time: date.toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
            }),
        };
    };

    const filteredUsers = users.filter(
        u =>
            u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (view === "create") {
        return (
            <div className="animate-fadeIn">
                <div className="flex items-center gap-3 mb-6">
                    <Button variant="ghost" onClick={() => setView("list")}>
                        <X size={20} className="mr-2" />
                        Quay lại
                    </Button>
                    <h2 className="text-2xl font-bold text-slate-900">
                        Tạo cuộc họp Online
                    </h2>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 max-w-3xl">
                    <form onSubmit={handleCreateMeeting} className="space-y-6">
                        <Input
                            label="Tên cuộc họp"
                            value={formData.title}
                            onChange={(e) =>
                                setFormData({ ...formData, title: e.target.value })
                            }
                            placeholder="Ví dụ: Weekly Sync Meeting"
                            required
                        />

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Mô tả
                            </label>
                            <textarea
                                className="w-full border border-slate-200 rounded-md p-3 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                                rows={3}
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                                placeholder="Thêm mô tả cho cuộc họp (tùy chọn)"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Thời gian bắt đầu"
                                type="datetime-local"
                                value={formData.scheduledStart}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        scheduledStart: e.target.value,
                                    })
                                }
                                required
                            />
                            <Input
                                label="Thời gian kết thúc (tùy chọn)"
                                type="datetime-local"
                                value={formData.scheduledEnd}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        scheduledEnd: e.target.value,
                                    })
                                }
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Quyền truy cập
                            </label>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div
                                    onClick={() => {
                                        setFormData({ ...formData, accessMode: "public" });
                                        // Clear selections when switching to public
                                        setSelectedDepartments([]);
                                        setSelectedUsers([]);
                                    }}
                                    className={`cursor-pointer border rounded-lg p-4 flex items-center gap-3 transition-all ${formData.accessMode === "public"
                                        ? "border-green-500 bg-green-50 text-green-700 ring-1 ring-green-500"
                                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                        }`}
                                >
                                    <Globe size={20} />
                                    <div className="text-left">
                                        <div className="font-medium text-sm">Công khai</div>
                                        <div className="text-xs opacity-75">
                                            Tất cả nhân viên
                                        </div>
                                    </div>
                                </div>

                                <div
                                    onClick={() =>
                                        setFormData({ ...formData, accessMode: "private" })
                                    }
                                    className={`cursor-pointer border rounded-lg p-4 flex items-center gap-3 transition-all ${formData.accessMode === "private"
                                        ? "border-slate-700 bg-slate-100 text-slate-900 ring-1 ring-slate-700"
                                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                        }`}
                                >
                                    <Lock size={20} />
                                    <div className="text-left">
                                        <div className="font-medium text-sm">Riêng tư</div>
                                        <div className="text-xs opacity-75">Chỉ người được mời</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Department and User Selection - Only for Private Mode */}
                        {formData.accessMode === "private" ? (
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                <label className="block text-sm font-bold text-slate-700 mb-3">
                                    Mời người tham gia
                                </label>

                                {/* Department Selection */}
                                <div className="mb-4">
                                    <p className="text-xs font-semibold text-slate-600 mb-2 uppercase">
                                        Chọn theo Phòng ban
                                    </p>
                                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto bg-white p-3 rounded-md border border-slate-200">
                                        {departments.map((dept) => (
                                            <label
                                                key={dept.id}
                                                className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-2 rounded transition-colors"
                                            >
                                                <div
                                                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedDepartments.includes(dept.id)
                                                            ? "bg-brand-600 border-brand-600"
                                                            : "bg-white border-slate-300"
                                                        }`}
                                                >
                                                    {selectedDepartments.includes(dept.id) && (
                                                        <Check size={12} className="text-white" />
                                                    )}
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    className="hidden"
                                                    checked={selectedDepartments.includes(dept.id)}
                                                    onChange={() => toggleDepartment(dept.id)}
                                                />
                                                <span className="text-sm text-slate-700">
                                                    {dept.name}
                                                </span>
                                                <span className="text-xs text-slate-400 ml-auto">
                                                    ({dept.memberCount} người)
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* User Selection */}
                                <div>
                                    <p className="text-xs font-semibold text-slate-600 mb-2 uppercase">
                                        Chọn từng Nhân viên
                                    </p>
                                    <div className="mb-2">
                                        <div className="relative">
                                            <Search
                                                size={16}
                                                className="absolute left-3 top-2.5 text-slate-400"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Tìm kiếm nhân viên..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="max-h-60 overflow-y-auto bg-white p-3 rounded-md border border-slate-200">
                                        {filteredUsers.length === 0 ? (
                                            <p className="text-sm text-slate-400 text-center py-4">
                                                Không tìm thấy nhân viên
                                            </p>
                                        ) : (
                                            <div className="space-y-1">
                                                {filteredUsers.map((user) => (
                                                    <label
                                                        key={user.id}
                                                        className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-2 rounded transition-colors"
                                                    >
                                                        <div
                                                            className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedUsers.includes(user.id)
                                                                    ? "bg-brand-600 border-brand-600"
                                                                    : "bg-white border-slate-300"
                                                                }`}
                                                        >
                                                            {selectedUsers.includes(user.id) && (
                                                                <Check size={12} className="text-white" />
                                                            )}
                                                        </div>
                                                        <input
                                                            type="checkbox"
                                                            className="hidden"
                                                            checked={selectedUsers.includes(user.id)}
                                                            onChange={() => toggleUser(user.id)}
                                                        />
                                                        <img
                                                            src={
                                                                user.avatar_url ||
                                                                `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`
                                                            }
                                                            alt=""
                                                            className="w-7 h-7 rounded-full border border-slate-200"
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-slate-700 truncate">
                                                                {user.full_name}
                                                            </p>
                                                            <p className="text-xs text-slate-400 truncate">
                                                                {user.department_name || "N/A"}
                                                            </p>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Summary */}
                                <div className="mt-3 pt-3 border-t border-blue-200">
                                    <p className="text-xs text-slate-600">
                                        <strong>Tổng:</strong>{" "}
                                        {selectedDepartments.length} phòng ban,{" "}
                                        {selectedUsers.length} nhân viên được chọn
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                                <div className="flex items-start gap-3">
                                    <Globe size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-semibold text-green-900 mb-1">
                                            Cuộc họp công khai
                                        </p>
                                        <p className="text-sm text-green-700">
                                            Tất cả nhân viên trong công ty đều có thể xem và tham gia cuộc họp này. Không cần mời từng người.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setView("list")}
                            >
                                Hủy
                            </Button>
                            <Button type="submit">
                                <Video size={18} className="mr-2" />
                                Tạo cuộc họp
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    // List View (same as before)
    return (
        <div className="animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                        Phòng họp Online
                    </h2>
                    <p className="text-slate-500 mt-1">
                        Tạo và tham gia cuộc họp video trực tuyến với Jitsi
                    </p>
                </div>
                <Button onClick={() => setView("create")}>
                    <Plus size={18} className="mr-2" />
                    Tạo cuộc họp mới
                </Button>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto"></div>
                    <p className="text-slate-500 mt-4">Đang tải...</p>
                </div>
            ) : meetings.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                    <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                        <Video size={40} className="text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                        Chưa có cuộc họp nào
                    </h3>
                    <p className="text-slate-500 mb-6">
                        Tạo cuộc họp đầu tiên để bắt đầu giao tiếp với đồng nghiệp
                    </p>
                    <Button onClick={() => setView("create")}>
                        <Plus size={18} className="mr-2" />
                        Tạo cuộc họp mới
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {meetings.map((meeting) => {
                        const start = formatDateTime(meeting.scheduledStart);
                        const canJoin =
                            meeting.status === "scheduled" || meeting.status === "active";

                        return (
                            <div
                                key={meeting.id}
                                className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all overflow-hidden flex flex-col"
                            >
                                <div className="p-5 flex-1">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                                                <Video size={18} />
                                            </div>
                                            <span
                                                className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${getStatusColor(
                                                    meeting.status
                                                )}`}
                                            >
                                                {getStatusLabel(meeting.status)}
                                            </span>
                                        </div>
                                        <span
                                            className={`px-2 py-0.5 text-[10px] font-bold rounded-full flex items-center gap-1 border ${meeting.accessMode === "public"
                                                ? "bg-green-50 text-green-700 border-green-100"
                                                : "bg-slate-100 text-slate-700 border-slate-200"
                                                }`}
                                        >
                                            {meeting.accessMode === "public" ? (
                                                <Globe size={10} />
                                            ) : (
                                                <Lock size={10} />
                                            )}
                                            {meeting.accessMode === "public"
                                                ? "Public"
                                                : "Private"}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2">
                                        {meeting.title}
                                    </h3>

                                    {meeting.description && (
                                        <p className="text-sm text-slate-500 mb-3 line-clamp-2">
                                            {meeting.description}
                                        </p>
                                    )}

                                    <div className="space-y-2 mb-3">
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <Calendar size={14} className="text-brand-600" />
                                            {start.date}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <Clock size={14} className="text-brand-600" />
                                            {start.time}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <Users size={14} className="text-brand-600" />
                                            {meeting.participants.length} người tham gia
                                        </div>
                                    </div>

                                    <div className="pt-3 border-t border-slate-100">
                                        <p className="text-xs text-slate-400 mb-1">
                                            Người tạo:
                                        </p>
                                        <p className="text-sm font-medium text-slate-700">
                                            {meeting.creatorName}
                                        </p>
                                    </div>
                                </div>

                                <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex gap-2">
                                    {canJoin && (
                                        <Button
                                            variant="primary"
                                            className="flex-1 text-xs h-9"
                                            onClick={() => handleJoinMeeting(meeting.id)}
                                        >
                                            <Play size={14} className="mr-2" />
                                            Tham gia
                                        </Button>
                                    )}
                                    <Button
                                        variant="outline"
                                        className="text-xs h-9 px-3 text-red-600 hover:bg-red-50 border-slate-200"
                                        onClick={() => handleDeleteMeeting(meeting.id)}
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
