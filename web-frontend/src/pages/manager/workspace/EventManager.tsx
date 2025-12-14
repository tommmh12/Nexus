import React, { useState, useEffect } from "react";
import { Button } from "../../../components/system/ui/Button";
import { Input } from "../../../components/system/ui/Input";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  Filter,
  Search,
  Edit2,
  Trash2,
  ArrowLeft,
  Save,
  X,
  CheckCircle2,
  Lock,
  Globe,
  AlertCircle,
  User,
  MoreHorizontal,
  ChevronDown,
  Award,
} from "lucide-react";

// --- Types ---
interface Attendee {
  id: string;
  name: string;
  avatar: string;
  department: string;
  joinedAt: string;
}

// Renamed to WorkspaceEvent to avoid conflict with global Event type
interface WorkspaceEvent {
  id: string;
  title: string;
  description: string;
  type: "Workshop" | "Seminar" | "Party" | "Training" | "Meeting";
  startDate: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endDate: string; // YYYY-MM-DD
  endTime: string; // HH:MM
  location: string;
  maxAttendees: number;
  currentAttendees: number;
  accessLevel: "Public" | "Private";
  allowedDepartments?: string[];
  status: "Upcoming" | "Ongoing" | "Ended";
  attendees: Attendee[];
  coverImage?: string;
}

const DEPARTMENTS_LIST = [
  "Ban Giám Đốc (Board of Directors)",
  "Khối Công Nghệ (Technology)",
  "Khối Marketing & Truyền thông",
  "Khối Kinh Doanh (Sales)",
  "Khối Hành chính Nhân sự",
];

// --- Mock Data ---
const MOCK_EVENTS: WorkspaceEvent[] = [
  {
    id: "evt-1",
    title: "Year End Party 2024: Night of Stars",
    description:
      "Đêm tiệc tất niên hoành tráng vinh danh những cá nhân xuất sắc nhất năm. Bao gồm tiệc mặn, ca nhạc và bốc thăm trúng thưởng.",
    type: "Party",
    startDate: "2024-12-25",
    startTime: "18:00",
    endDate: "2024-12-25",
    endTime: "22:00",
    location: "Gem Center, Quận 1",
    maxAttendees: 500,
    currentAttendees: 450,
    accessLevel: "Public",
    status: "Upcoming",
    coverImage:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=1000",
    attendees: [
      {
        id: "u1",
        name: "Nguyễn Văn An",
        avatar:
          "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=100&h=100",
        department: "CEO",
        joinedAt: "2024-11-01 09:00",
      },
      {
        id: "u2",
        name: "Trần Minh Đức",
        avatar:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100&h=100",
        department: "Technology",
        joinedAt: "2024-11-02 10:30",
      },
    ],
  },
  {
    id: "evt-2",
    title: "Workshop: Ứng dụng AI trong Marketing",
    description:
      "Chia sẻ kiến thức về cách sử dụng GenAI để tạo content, hình ảnh và tối ưu hóa chiến dịch quảng cáo.",
    type: "Workshop",
    startDate: "2024-11-20",
    startTime: "09:00",
    endDate: "2024-11-20",
    endTime: "11:30",
    location: "Phòng Training A, Tầng 3",
    maxAttendees: 50,
    currentAttendees: 48,
    accessLevel: "Private",
    allowedDepartments: [
      "Khối Marketing & Truyền thông",
      "Khối Kinh Doanh (Sales)",
    ],
    status: "Upcoming",
    coverImage:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1000",
    attendees: [],
  },
  {
    id: "evt-3",
    title: "Đào tạo Bảo mật Thông tin Q4",
    description:
      "Khóa đào tạo bắt buộc dành cho toàn bộ nhân viên khối kỹ thuật về các quy chuẩn bảo mật mới.",
    type: "Training",
    startDate: "2024-10-15",
    startTime: "14:00",
    endDate: "2024-10-15",
    endTime: "16:00",
    location: "Online (Zoom)",
    maxAttendees: 100,
    currentAttendees: 98,
    accessLevel: "Private",
    allowedDepartments: ["Khối Công Nghệ (Technology)"],
    status: "Ended",
    attendees: [
      {
        id: "u2",
        name: "Trần Minh Đức",
        avatar:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100&h=100",
        department: "Technology",
        joinedAt: "2024-10-10 10:30",
      },
    ],
  },
];

// --- Components ---

// 1. Event Form (Create/Edit)
const EventForm = ({
  event,
  onSave,
  onCancel,
}: {
  event?: WorkspaceEvent | null;
  onSave: (e: WorkspaceEvent) => void;
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState<Partial<WorkspaceEvent>>({
    title: "",
    description: "",
    type: "Workshop",
    startDate: new Date().toISOString().split("T")[0],
    startTime: "09:00",
    endDate: new Date().toISOString().split("T")[0],
    endTime: "10:00",
    location: "",
    maxAttendees: 50,
    currentAttendees: 0,
    accessLevel: "Public",
    allowedDepartments: [],
    status: "Upcoming",
    attendees: [],
    coverImage: "",
  });

  useEffect(() => {
    if (event) setFormData(event);
  }, [event]);

  const handleDeptToggle = (dept: string) => {
    const current = formData.allowedDepartments || [];
    if (current.includes(dept)) {
      setFormData({
        ...formData,
        allowedDepartments: current.filter((d) => d !== dept),
      });
    } else {
      setFormData({ ...formData, allowedDepartments: [...current, dept] });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as WorkspaceEvent);
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-fadeIn">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
        <h3 className="font-bold text-slate-900">
          {event ? "Chỉnh sửa Sự kiện" : "Tạo Sự kiện mới"}
        </h3>
        <button
          onClick={onCancel}
          className="text-slate-400 hover:text-slate-600"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <Input
              label="Tên sự kiện"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
              placeholder="Nhập tên sự kiện..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Loại sự kiện
            </label>
            <select
              className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value as any })
              }
            >
              <option value="Workshop">Workshop</option>
              <option value="Seminar">Seminar (Hội thảo)</option>
              <option value="Party">Party (Tiệc)</option>
              <option value="Training">Training (Đào tạo)</option>
              <option value="Meeting">Meeting (Họp lớn)</option>
            </select>
          </div>

          <div>
            <Input
              label="Địa điểm tổ chức"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              required
              placeholder="Phòng họp A, Zoom,..."
              icon={<MapPin size={18} />}
            />
          </div>

          {/* Time */}
          <div className="md:col-span-2 bg-blue-50/50 p-4 rounded-lg border border-blue-100 grid grid-cols-2 md:grid-cols-4 gap-4">
            <Input
              label="Ngày bắt đầu"
              type="date"
              value={formData.startDate}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
              required
            />
            <Input
              label="Giờ bắt đầu"
              type="time"
              value={formData.startTime}
              onChange={(e) =>
                setFormData({ ...formData, startTime: e.target.value })
              }
              required
            />
            <Input
              label="Ngày kết thúc"
              type="date"
              value={formData.endDate}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
              required
            />
            <Input
              label="Giờ kết thúc"
              type="time"
              value={formData.endTime}
              onChange={(e) =>
                setFormData({ ...formData, endTime: e.target.value })
              }
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Mô tả chi tiết
            </label>
            <textarea
              className="w-full bg-slate-50 border border-slate-200 rounded-md p-3 text-sm focus:ring-2 focus:ring-brand-500 outline-none h-24 resize-none"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Nội dung, agenda, yêu cầu tham gia..."
            ></textarea>
          </div>

          <div className="md:col-span-2 border-t border-slate-100 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Số lượng tham gia tối đa"
                type="number"
                value={formData.maxAttendees}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxAttendees: parseInt(e.target.value),
                  })
                }
                icon={<Users size={18} />}
              />

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Quyền tham gia (Access Level)
                </label>
                <div className="flex gap-4">
                  <label
                    className={`flex-1 cursor-pointer border rounded-lg p-3 flex items-center justify-center gap-2 transition-all ${
                      formData.accessLevel === "Public"
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-slate-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="access"
                      className="hidden"
                      checked={formData.accessLevel === "Public"}
                      onChange={() =>
                        setFormData({ ...formData, accessLevel: "Public" })
                      }
                    />
                    <Globe size={18} /> Public
                  </label>
                  <label
                    className={`flex-1 cursor-pointer border rounded-lg p-3 flex items-center justify-center gap-2 transition-all ${
                      formData.accessLevel === "Private"
                        ? "border-brand-500 bg-brand-50 text-brand-700"
                        : "border-slate-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="access"
                      className="hidden"
                      checked={formData.accessLevel === "Private"}
                      onChange={() =>
                        setFormData({ ...formData, accessLevel: "Private" })
                      }
                    />
                    <Lock size={18} /> Private
                  </label>
                </div>
              </div>
            </div>

            {formData.accessLevel === "Private" && (
              <div className="mt-4 bg-slate-50 p-4 rounded-lg border border-slate-200 animate-fadeIn">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-3">
                  Chọn phòng ban được phép:
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                  {DEPARTMENTS_LIST.map((dept) => (
                    <label
                      key={dept}
                      className="flex items-center gap-3 cursor-pointer hover:bg-white p-2 rounded transition-colors"
                    >
                      <div
                        className={`w-5 h-5 rounded border flex items-center justify-center ${
                          formData.allowedDepartments?.includes(dept)
                            ? "bg-brand-600 border-brand-600"
                            : "bg-white border-slate-300"
                        }`}
                      >
                        {formData.allowedDepartments?.includes(dept) && (
                          <CheckCircle2 size={14} className="text-white" />
                        )}
                      </div>
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={
                          formData.allowedDepartments?.includes(dept) || false
                        }
                        onChange={() => handleDeptToggle(dept)}
                      />
                      <span className="text-sm text-slate-700">{dept}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            <Input
              label="Ảnh bìa (URL)"
              value={formData.coverImage}
              onChange={(e) =>
                setFormData({ ...formData, coverImage: e.target.value })
              }
              placeholder="https://..."
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Hủy bỏ
          </Button>
          <Button type="submit">
            <Save size={18} className="mr-2" />{" "}
            {event ? "Lưu thay đổi" : "Tạo sự kiện"}
          </Button>
        </div>
      </form>
    </div>
  );
};

// 2. Event Detail (View & Register)
const EventDetail = ({
  event,
  onBack,
  onJoin,
  isJoined,
}: {
  event: WorkspaceEvent;
  onBack: () => void;
  onJoin: () => void;
  isJoined: boolean;
}) => {
  const isFull = event.currentAttendees >= event.maxAttendees;
  const isEnded = event.status === "Ended";
  const canJoin = !isFull && !isEnded && !isJoined;

  // Calculate percentage
  const progress =
    event.maxAttendees > 0
      ? Math.min(
          100,
          Math.round((event.currentAttendees / event.maxAttendees) * 100)
        )
      : 100;

  return (
    <div className="animate-fadeIn max-w-5xl mx-auto">
      <Button variant="outline" onClick={onBack} className="mb-4 text-xs h-8">
        <ArrowLeft size={16} className="mr-2" /> Quay lại danh sách
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="relative h-64 w-full bg-slate-200">
              {event.coverImage ? (
                <img
                  src={event.coverImage}
                  className="w-full h-full object-cover"
                  alt=""
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <Calendar size={48} />
                </div>
              )}
              <div className="absolute top-4 left-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                    event.status === "Ongoing"
                      ? "bg-green-500 text-white"
                      : event.status === "Ended"
                      ? "bg-slate-500 text-white"
                      : "bg-brand-500 text-white"
                  }`}
                >
                  {event.status === "Ongoing"
                    ? "Đang diễn ra"
                    : event.status === "Ended"
                    ? "Đã kết thúc"
                    : "Sắp diễn ra"}
                </span>
              </div>
            </div>

            <div className="p-8">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 mb-2">
                    {event.title}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} /> {event.startDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} /> {event.startTime} - {event.endTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={14} /> {event.location}
                    </span>
                  </div>
                </div>
              </div>

              <div className="prose prose-slate max-w-none mb-8 text-slate-600">
                {event.description}
              </div>

              {/* Registration Box */}
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-slate-900">Đăng ký tham gia</h3>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-brand-600">
                      {event.currentAttendees}
                    </span>
                    <span className="text-sm text-slate-500">
                      /{event.maxAttendees} người
                    </span>
                  </div>
                </div>

                <div className="w-full bg-slate-200 rounded-full h-2.5 mb-6">
                  <div
                    className={`h-2.5 rounded-full transition-all ${
                      isFull ? "bg-red-500" : "bg-brand-600"
                    }`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>

                <div className="flex gap-4">
                  {isJoined ? (
                    <Button
                      fullWidth
                      disabled
                      className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100 opacity-100"
                    >
                      <CheckCircle2 size={18} className="mr-2" /> Bạn đã đăng ký
                    </Button>
                  ) : (
                    <Button
                      fullWidth
                      onClick={onJoin}
                      disabled={!canJoin}
                      className={
                        isFull || isEnded
                          ? "bg-slate-100 text-slate-400 border-slate-200"
                          : "bg-brand-600 hover:bg-brand-700"
                      }
                    >
                      {isEnded
                        ? "Sự kiện đã kết thúc"
                        : isFull
                        ? "Đã hết chỗ"
                        : "Xác nhận tham gia"}
                    </Button>
                  )}
                </div>
                {event.accessLevel === "Private" && (
                  <p className="text-xs text-slate-500 mt-3 flex items-center justify-center gap-1">
                    <Lock size={12} /> Sự kiện nội bộ dành cho:{" "}
                    {event.allowedDepartments?.length} phòng ban
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar: Attendees */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[500px]">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-900">
                Người tham gia ({event.attendees.length})
              </h3>
              {isEnded && (
                <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded">
                  Chốt danh sách
                </span>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
              {event.attendees.length > 0 ? (
                <div className="space-y-1">
                  {event.attendees.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                      <img
                        src={user.avatar}
                        className="w-8 h-8 rounded-full border border-slate-200"
                        alt=""
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {user.department}
                        </p>
                      </div>
                      {isEnded && (
                        <Award size={14} className="text-yellow-500" />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <Users size={32} className="mb-2 opacity-50" />
                  <p className="text-sm">Chưa có ai đăng ký</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 3. Main Manager Component
export const EventManager = () => {
  const [events, setEvents] = useState<WorkspaceEvent[]>([]);
  const [view, setView] = useState<"list" | "detail" | "form">("list");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<"All" | "Week" | "Month">("All");

  // Derived state
  const selectedEvent = events.find((e) => e.id === selectedEventId);

  // Filter Logic Helpers
  const isDateInThisWeek = (dateStr: string) => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 (Sun) - 6 (Sat)
    // Calculate the difference to get to Monday (if currentDay is 0 (Sun), Monday was 6 days ago)
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;

    const monday = new Date(today);
    monday.setDate(today.getDate() + distanceToMonday);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    // Append time to date string to ensure it's treated as local time
    const eventDate = new Date(dateStr + "T00:00:00");

    return eventDate >= monday && eventDate <= sunday;
  };

  const isDateInThisMonth = (dateStr: string) => {
    const today = new Date();
    const eventDate = new Date(dateStr + "T00:00:00");
    return (
      eventDate.getMonth() === today.getMonth() &&
      eventDate.getFullYear() === today.getFullYear()
    );
  };

  const filteredEvents = events.filter((evt) => {
    if (timeFilter === "Week") return isDateInThisWeek(evt.startDate);
    if (timeFilter === "Month") return isDateInThisMonth(evt.startDate);
    return true;
  });

  // Handlers
  const handleSaveEvent = (evt: WorkspaceEvent) => {
    if (selectedEventId && view === "form") {
      // Update
      setEvents((prev) => prev.map((e) => (e.id === evt.id ? evt : e)));
    } else {
      // Create
      const newEvt = { ...evt, id: `evt-${Date.now()}` };
      setEvents((prev) => [newEvt, ...prev]);
    }
    setView("list");
    setSelectedEventId(null);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Xóa sự kiện này?")) {
      setEvents((prev) => prev.filter((e) => e.id !== id));
    }
  };

  const handleJoinEvent = () => {
    if (!selectedEvent) return;
    // Mock User Join with unique ID
    const mockUser: Attendee = {
      id: `u-me-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: "Tôi (Bạn)",
      avatar:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100&h=100",
      department: "Software Development",
      joinedAt: new Date().toISOString(),
    };

    const updatedEvent = {
      ...selectedEvent,
      currentAttendees: selectedEvent.currentAttendees + 1,
      attendees: [mockUser, ...selectedEvent.attendees],
    };

    setEvents((prev) =>
      prev.map((e) => (e.id === selectedEvent.id ? updatedEvent : e))
    );
  };

  const handleCreateClick = () => {
    setSelectedEventId(null);
    setView("form");
  };

  const handleEditClick = (e: React.MouseEvent, evt: WorkspaceEvent) => {
    e.stopPropagation();
    setSelectedEventId(evt.id);
    setView("form");
  };

  const handleViewDetail = (id: string) => {
    setSelectedEventId(id);
    setView("detail");
  };

  // Render
  return (
    <div className="animate-fadeIn h-full">
      {view === "list" && (
        <>
          <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Quản lý Sự kiện
              </h2>
              <p className="text-slate-500 mt-1">
                Tổ chức workshop, training và các hoạt động nội bộ.
              </p>
            </div>
            <Button onClick={handleCreateClick}>
              <Plus size={18} className="mr-2" /> Tạo sự kiện
            </Button>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm mb-6 flex gap-2">
            <button
              onClick={() => setTimeFilter("All")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                timeFilter === "All"
                  ? "bg-slate-100 text-slate-900 font-bold"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setTimeFilter("Week")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                timeFilter === "Week"
                  ? "bg-slate-100 text-slate-900 font-bold"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              Tuần này
            </button>
            <button
              onClick={() => setTimeFilter("Month")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                timeFilter === "Month"
                  ? "bg-slate-100 text-slate-900 font-bold"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              Tháng này
            </button>
          </div>

          {/* Event Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((evt) => (
              <div
                key={evt.id}
                onClick={() => handleViewDetail(evt.id)}
                className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group cursor-pointer overflow-hidden flex flex-col"
              >
                <div className="relative h-40 bg-slate-200 overflow-hidden">
                  <img
                    src={
                      evt.coverImage || "https://via.placeholder.com/400x200"
                    }
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-sm ${
                        evt.status === "Ended" ? "bg-slate-500" : "bg-brand-500"
                      }`}
                    >
                      {evt.status === "Ended" ? "Đã kết thúc" : evt.type}
                    </span>
                    {evt.accessLevel === "Private" && (
                      <span className="bg-slate-900/80 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                        <Lock size={10} /> Private
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-xs text-brand-600 font-bold uppercase tracking-wide flex items-center gap-1">
                      <Calendar size={12} /> {evt.startDate}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleEditClick(e, evt)}
                        className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-brand-600"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={(e) => handleDelete(evt.id, e)}
                        className="p-1.5 hover:bg-red-50 rounded text-slate-500 hover:text-red-600"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-slate-900 text-lg mb-2 line-clamp-2 leading-snug group-hover:text-brand-600 transition-colors">
                    {evt.title}
                  </h3>

                  <div className="space-y-1 mb-4 text-sm text-slate-500">
                    <p className="flex items-center gap-2">
                      <Clock size={14} /> {evt.startTime} - {evt.endTime}
                    </p>
                    <p className="flex items-center gap-2 line-clamp-1">
                      <MapPin size={14} /> {evt.location}
                    </p>
                  </div>

                  <div className="mt-auto pt-4 border-t border-slate-100">
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <span className="text-slate-500">Đã đăng ký</span>
                      <span
                        className={`font-bold ${
                          evt.currentAttendees >= evt.maxAttendees
                            ? "text-red-600"
                            : "text-slate-700"
                        }`}
                      >
                        {evt.currentAttendees}/{evt.maxAttendees}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${
                          evt.currentAttendees >= evt.maxAttendees
                            ? "bg-red-500"
                            : "bg-green-500"
                        }`}
                        style={{
                          width: `${Math.min(
                            100,
                            (evt.currentAttendees / evt.maxAttendees) * 100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {view === "form" && (
        <EventForm
          event={selectedEvent}
          onSave={handleSaveEvent}
          onCancel={() => setView("list")}
        />
      )}

      {view === "detail" && selectedEvent && (
        <EventDetail
          event={selectedEvent}
          onBack={() => setView("list")}
          onJoin={handleJoinEvent}
          isJoined={selectedEvent.attendees.some((a) => a.id.includes("u-me"))}
        />
      )}
    </div>
  );
};
