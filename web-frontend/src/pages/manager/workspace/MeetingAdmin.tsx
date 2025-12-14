import React, { useState, useEffect } from "react";
import { Button } from "../../../components/system/ui/Button";
import { Input } from "../../../components/system/ui/Input";
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  MapPin,
  Video,
  RefreshCw,
  Monitor,
  ArrowLeft,
  Copy,
  Check,
  Lock,
  Globe,
  Shield,
  Calendar,
  Clock,
} from "lucide-react";

interface MeetingRoom {
  id: string;
  name: string;
  capacity: number;
  status: "Available" | "Occupied" | "Maintenance";
  type: "Physical" | "Online";
  location?: string;
  meetingLink?: string;
  accessLevel: "Public" | "Private";
  allowedDepartments?: string[];
  scheduleDate?: string; // YYYY-MM-DD
  startTime?: string; // HH:MM
  endTime?: string; // HH:MM
}

const DEPARTMENTS_LIST = [
  "Ban Giám Đốc (Board of Directors)",
  "Khối Công Nghệ (Technology)",
  "Khối Marketing & Truyền thông",
  "Khối Kinh Doanh (Sales)",
  "Khối Hành chính Nhân sự",
];

const INITIAL_ROOMS: MeetingRoom[] = [
  {
    id: "1",
    name: "Họp Giao ban Tuần",
    capacity: 20,
    status: "Available",
    type: "Physical",
    location: "Tầng 12, Khu A",
    accessLevel: "Private",
    allowedDepartments: [
      "Ban Giám Đốc (Board of Directors)",
      "Khối Công Nghệ (Technology)",
    ],
    scheduleDate: "2024-11-20",
    startTime: "09:00",
    endTime: "10:30",
  },
  {
    id: "2",
    name: "Brainstorm Ý tưởng Tết",
    capacity: 8,
    status: "Occupied",
    type: "Physical",
    location: "Tầng 11, Khu B",
    accessLevel: "Public",
    scheduleDate: "2024-11-20",
    startTime: "14:00",
    endTime: "16:00",
  },
  {
    id: "3",
    name: "Review Doanh số Tháng 10",
    capacity: 100,
    status: "Available",
    type: "Online",
    meetingLink: "meet.nexus.com/sal-2024-win",
    accessLevel: "Private",
    allowedDepartments: ["Khối Kinh Doanh (Sales)"],
    scheduleDate: "2024-11-21",
    startTime: "10:00",
    endTime: "11:30",
  },
];

interface RoomFormProps {
  room?: MeetingRoom | null;
  onSave: (room: MeetingRoom) => void;
  onCancel: () => void;
}

const RoomForm = ({ room, onSave, onCancel }: RoomFormProps) => {
  const [formData, setFormData] = useState<Partial<MeetingRoom>>({
    name: "",
    capacity: 10,
    status: "Available",
    type: "Physical",
    location: "",
    meetingLink: "",
    accessLevel: "Public",
    allowedDepartments: [],
    scheduleDate: new Date().toISOString().split("T")[0],
    startTime: "09:00",
    endTime: "10:00",
  });

  useEffect(() => {
    if (room) {
      setFormData(room);
    } else {
      setFormData({
        name: "",
        capacity: 10,
        status: "Available",
        type: "Physical",
        location: "",
        meetingLink: "",
        accessLevel: "Public",
        allowedDepartments: [],
        scheduleDate: new Date().toISOString().split("T")[0],
        startTime: "09:00",
        endTime: "10:00",
      });
    }
  }, [room]);

  const generateLink = () => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    const segment = (len: number) =>
      Array.from(
        { length: len },
        () => chars[Math.floor(Math.random() * chars.length)]
      ).join("");
    const link = `meet.nexus.com/${segment(3)}-${segment(4)}-${segment(3)}`;
    setFormData((prev) => ({ ...prev, meetingLink: link }));
  };

  useEffect(() => {
    if (formData.type === "Online" && !formData.meetingLink) {
      generateLink();
    }
  }, [formData.type]);

  const handleDeptToggle = (dept: string) => {
    const currentDepts = formData.allowedDepartments || [];
    if (currentDepts.includes(dept)) {
      setFormData({
        ...formData,
        allowedDepartments: currentDepts.filter((d) => d !== dept),
      });
    } else {
      setFormData({ ...formData, allowedDepartments: [...currentDepts, dept] });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as MeetingRoom);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-fadeIn max-w-2xl mx-auto">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
        <h3 className="font-bold text-slate-900">
          {room ? "Chỉnh sửa Cuộc họp" : "Tạo Cuộc họp mới"}
        </h3>
        <button
          onClick={onCancel}
          className="text-slate-400 hover:text-slate-600"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <Input
          label="Tên cuộc họp / Phòng họp"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder={
            formData.type === "Physical"
              ? "Ví dụ: Họp Giao ban - Phòng A"
              : "Ví dụ: Weekly Sync - Online"
          }
          required
        />

        {/* Date & Time Selection */}
        <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
          <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
            <Calendar size={16} className="text-blue-600" /> Thời gian tổ chức
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Ngày diễn ra"
              type="date"
              value={formData.scheduleDate}
              onChange={(e) =>
                setFormData({ ...formData, scheduleDate: e.target.value })
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
              label="Giờ kết thúc"
              type="time"
              value={formData.endTime}
              onChange={(e) =>
                setFormData({ ...formData, endTime: e.target.value })
              }
              required
            />
          </div>
        </div>

        {/* Room Type Selection */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Hình thức tổ chức
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div
              onClick={() => setFormData({ ...formData, type: "Physical" })}
              className={`cursor-pointer border rounded-lg p-4 flex flex-col items-center justify-center gap-2 transition-all ${
                formData.type === "Physical"
                  ? "border-brand-500 bg-brand-50 text-brand-700 ring-1 ring-brand-500"
                  : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <MapPin size={24} />
              <span className="font-medium">Offline (Tại văn phòng)</span>
            </div>
            <div
              onClick={() => setFormData({ ...formData, type: "Online" })}
              className={`cursor-pointer border rounded-lg p-4 flex flex-col items-center justify-center gap-2 transition-all ${
                formData.type === "Online"
                  ? "border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500"
                  : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <Video size={24} />
              <span className="font-medium">Online (Trực tuyến)</span>
            </div>
          </div>
        </div>

        {formData.type === "Physical" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
            <Input
              label="Địa điểm / Số phòng"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              placeholder="Ví dụ: Tòa nhà B, Tầng 3"
              icon={<MapPin size={18} />}
              required
            />
            <Input
              label="Sức chứa (Người)"
              type="number"
              value={formData.capacity}
              onChange={(e) =>
                setFormData({ ...formData, capacity: parseInt(e.target.value) })
              }
              placeholder="20"
              icon={<Users size={18} />}
            />
          </div>
        ) : (
          <div className="animate-fadeIn p-4 bg-slate-50 rounded-lg border border-slate-100">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Đường dẫn họp (Tự động tạo)
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Monitor size={18} />
                </div>
                <input
                  className="w-full bg-white border border-slate-200 text-slate-600 text-sm rounded-md block py-2.5 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                  value={formData.meetingLink}
                  readOnly
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={generateLink}
                title="Tạo mã mới"
              >
                <RefreshCw size={18} />
              </Button>
            </div>
          </div>
        )}

        {/* Privacy / Access Level Selection */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Quyền truy cập (Access Level)
          </label>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div
              onClick={() =>
                setFormData({ ...formData, accessLevel: "Public" })
              }
              className={`cursor-pointer border rounded-lg p-3 flex items-center gap-3 transition-all ${
                formData.accessLevel === "Public"
                  ? "border-green-500 bg-green-50 text-green-700 ring-1 ring-green-500"
                  : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <div
                className={`p-2 rounded-full ${
                  formData.accessLevel === "Public"
                    ? "bg-green-200"
                    : "bg-slate-100"
                }`}
              >
                <Globe size={18} />
              </div>
              <div className="text-left">
                <span className="block font-medium text-sm">
                  Công khai (Public)
                </span>
                <span className="block text-xs opacity-75">
                  Tất cả nhân viên
                </span>
              </div>
            </div>

            <div
              onClick={() =>
                setFormData({ ...formData, accessLevel: "Private" })
              }
              className={`cursor-pointer border rounded-lg p-3 flex items-center gap-3 transition-all ${
                formData.accessLevel === "Private"
                  ? "border-slate-700 bg-slate-100 text-slate-900 ring-1 ring-slate-700"
                  : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <div
                className={`p-2 rounded-full ${
                  formData.accessLevel === "Private"
                    ? "bg-slate-300"
                    : "bg-slate-100"
                }`}
              >
                <Lock size={18} />
              </div>
              <div className="text-left">
                <span className="block font-medium text-sm">
                  Riêng tư (Private)
                </span>
                <span className="block text-xs opacity-75">
                  Chỉ định phòng ban
                </span>
              </div>
            </div>
          </div>

          {/* Department Selector (Only for Private) */}
          {formData.accessLevel === "Private" && (
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 animate-fadeIn">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-3">
                Chọn phòng ban được phép tham gia:
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                {DEPARTMENTS_LIST.map((dept) => (
                  <label
                    key={dept}
                    className="flex items-center gap-3 cursor-pointer hover:bg-white p-2 rounded transition-colors"
                  >
                    <div
                      className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                        formData.allowedDepartments?.includes(dept)
                          ? "bg-brand-600 border-brand-600"
                          : "bg-white border-slate-300"
                      }`}
                    >
                      {formData.allowedDepartments?.includes(dept) && (
                        <Check size={14} className="text-white" />
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
                    <span
                      className={`text-sm ${
                        formData.allowedDepartments?.includes(dept)
                          ? "text-brand-700 font-medium"
                          : "text-slate-600"
                      }`}
                    >
                      {dept}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Trạng thái hiện tại
          </label>
          <select
            className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value as any })
            }
          >
            <option value="Available">Sẵn sàng (Available)</option>
            <option value="Occupied">Đang bận (Occupied)</option>
            <option value="Maintenance">Đang bảo trì (Maintenance)</option>
          </select>
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Hủy bỏ
          </Button>
          <Button type="submit">
            <Save size={18} className="mr-2" /> Lưu & Thông báo
          </Button>
        </div>
      </form>
    </div>
  );
};

export const MeetingAdmin = () => {
  const [rooms, setRooms] = useState<MeetingRoom[]>(INITIAL_ROOMS);
  const [view, setView] = useState<"list" | "form">("list");
  const [editingRoom, setEditingRoom] = useState<MeetingRoom | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCreate = () => {
    setEditingRoom(null);
    setView("form");
  };

  const handleEdit = (room: MeetingRoom) => {
    setEditingRoom(room);
    setView("form");
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa phòng họp này không?")) {
      setRooms((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const handleSave = (roomData: MeetingRoom) => {
    if (editingRoom) {
      setRooms((prev) =>
        prev.map((r) => (r.id === roomData.id ? roomData : r))
      );
    } else {
      const newRoom = { ...roomData, id: Date.now().toString() };
      setRooms((prev) => [...prev, newRoom]);
    }
    setView("list");
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="animate-fadeIn h-full">
      {view === "list" ? (
        <>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Quản lý Lịch họp
              </h2>
              <p className="text-slate-500 mt-1">
                Danh sách các cuộc họp sắp tới và trạng thái phòng.
              </p>
            </div>
            <Button onClick={handleCreate}>
              <Plus size={18} className="mr-2" /> Tạo cuộc họp mới
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all group overflow-hidden flex flex-col"
              >
                <div className="p-5 flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <div
                      className={`p-2 rounded-lg ${
                        room.type === "Online"
                          ? "bg-blue-50 text-blue-600"
                          : "bg-orange-50 text-orange-600"
                      }`}
                    >
                      {room.type === "Online" ? (
                        <Video size={18} />
                      ) : (
                        <MapPin size={18} />
                      )}
                    </div>
                    <div className="flex gap-2">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-full flex items-center gap-1 border ${
                          room.accessLevel === "Public"
                            ? "bg-green-50 text-green-700 border-green-100"
                            : "bg-slate-100 text-slate-700 border-slate-200"
                        }`}
                      >
                        {room.accessLevel === "Public" ? (
                          <Globe size={10} />
                        ) : (
                          <Lock size={10} />
                        )}
                        {room.accessLevel === "Public" ? "Public" : "Private"}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                          room.status === "Available"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : room.status === "Occupied"
                            ? "bg-rose-50 text-rose-700 border-rose-100"
                            : "bg-gray-100 text-gray-600 border-gray-200"
                        }`}
                      >
                        {room.status}
                      </span>
                    </div>
                  </div>

                  <h3
                    className="text-lg font-bold text-slate-900 mb-2 truncate"
                    title={room.name}
                  >
                    {room.name}
                  </h3>

                  {/* Schedule Info */}
                  <div className="flex items-center gap-3 mb-3 text-sm bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                      <Calendar size={14} className="text-brand-600" />
                      {room.scheduleDate
                        ? new Date(room.scheduleDate).toLocaleDateString(
                            "vi-VN"
                          )
                        : "---"}
                    </div>
                    <div className="w-px h-4 bg-slate-300"></div>
                    <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                      <Clock size={14} className="text-brand-600" />
                      {room.startTime} - {room.endTime}
                    </div>
                  </div>

                  <div className="min-h-[40px]">
                    {room.type === "Physical" ? (
                      <div className="text-sm text-slate-500 space-y-1">
                        <p className="flex items-center gap-2">
                          <MapPin size={14} /> {room.location}
                        </p>
                        <p className="flex items-center gap-2">
                          <Users size={14} /> Sức chứa: {room.capacity} người
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded border border-slate-100 group-hover:border-blue-200 transition-colors">
                          <Monitor size={14} className="text-blue-500" />
                          <span className="text-xs font-mono text-slate-700 truncate flex-1">
                            {room.meetingLink}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(room.meetingLink || "", room.id);
                            }}
                            className="text-slate-400 hover:text-blue-600 transition-colors"
                          >
                            {copiedId === room.id ? (
                              <Check size={14} className="text-green-500" />
                            ) : (
                              <Copy size={14} />
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Private Access List */}
                  {room.accessLevel === "Private" &&
                    room.allowedDepartments &&
                    room.allowedDepartments.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">
                          Tham gia:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {room.allowedDepartments
                            .slice(0, 2)
                            .map((dept, i) => (
                              <span
                                key={i}
                                className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded truncate max-w-[120px]"
                              >
                                {dept.split("(")[0].trim()}
                              </span>
                            ))}
                          {room.allowedDepartments.length > 2 && (
                            <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                              +{room.allowedDepartments.length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                </div>

                <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex gap-2 mt-auto">
                  <Button
                    variant="outline"
                    className="flex-1 text-xs h-9 bg-white"
                    onClick={() => handleEdit(room)}
                  >
                    <Edit2 size={14} className="mr-2" /> Chi tiết
                  </Button>
                  <Button
                    variant="outline"
                    className="text-xs h-9 px-3 text-red-600 hover:bg-red-50 border-slate-200 bg-white"
                    onClick={() => handleDelete(room.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            ))}

            <div
              onClick={handleCreate}
              className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-brand-400 hover:text-brand-600 hover:bg-brand-50/30 transition-all cursor-pointer min-h-[220px]"
            >
              <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center mb-4 group-hover:bg-white transition-colors shadow-sm">
                <Plus size={28} />
              </div>
              <span className="font-medium text-lg">Đặt lịch họp mới</span>
              <span className="text-xs text-slate-400">
                Kiểm tra lịch trống & đặt phòng
              </span>
            </div>
          </div>
        </>
      ) : (
        <RoomForm
          room={editingRoom}
          onSave={handleSave}
          onCancel={() => setView("list")}
        />
      )}
    </div>
  );
};
