import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  ChevronDown,
  LayoutGrid,
  List,
  Search,
  ArrowRight,
  Briefcase,
} from "lucide-react";
import { Button } from "../../../components/system/ui/Button";

// --- Types ---
interface FloorPlan {
  id: string;
  name: string;
}

interface RoomBooking {
  id: string;
  room_id: string;
  roomName: string;
  meeting_title: string;
  meetingTitle?: string;
  bookedBy: string;
  start_time: string;
  startTime: string;
  end_time: string;
  endTime: string;
  booking_date: string;
  status: "approved" | "pending" | "rejected";
}

interface RoomAvailabilityInfo {
  roomId: string;
  roomName: string;
  floorId: string;
  floorName: string;
  capacity: number;
  roomType: string;
  equipment: string[];
  bookings: RoomBooking[];
}

type RoomDisplayStatus = "available" | "booked" | "pending" | "maintenance";

interface TimeSlot {
  hour: number;
  minute: number;
}

// --- Mock Data ---
const MOCK_FLOORS: FloorPlan[] = [
  { id: "1", name: "Tầng 1 - Sảnh chính" },
  { id: "2", name: "Tầng 2 - Văn phòng" },
  { id: "3", name: "Tầng 3 - Phòng họp" },
  { id: "4", name: "Tầng 4 - Hội trường" },
];

const MOCK_ROOMS: RoomAvailabilityInfo[] = [
  {
    roomId: "1",
    roomName: "Phòng họp Alpha",
    floorId: "3",
    floorName: "Tầng 3",
    capacity: 10,
    roomType: "Meeting Room",
    equipment: ["Projector", "Whiteboard", "Video Conf"],
    bookings: [],
  },
  {
    roomId: "2",
    roomName: "Phòng họp Beta",
    floorId: "3",
    floorName: "Tầng 3",
    capacity: 6,
    roomType: "Small Meeting",
    equipment: ["TV Screen", "Whiteboard"],
    bookings: [
      {
        id: "b1",
        room_id: "2",
        roomName: "Phòng họp Beta",
        meeting_title: "Daily Standup",
        meetingTitle: "Daily Standup",
        bookedBy: "Nguyễn Văn A",
        start_time: "09:00",
        startTime: "09:00",
        end_time: "10:00",
        endTime: "10:00",
        booking_date: "2024-12-14",
        status: "approved",
      },
    ],
  },
  {
    roomId: "3",
    roomName: "Phòng họp Gamma",
    floorId: "3",
    floorName: "Tầng 3",
    capacity: 20,
    roomType: "Conference Room",
    equipment: ["Projector", "Microphone", "Video Conf", "Recording"],
    bookings: [],
  },
  {
    roomId: "4",
    roomName: "Phòng Focus",
    floorId: "2",
    floorName: "Tầng 2",
    capacity: 4,
    roomType: "Focus Room",
    equipment: ["TV Screen"],
    bookings: [],
  },
  {
    roomId: "5",
    roomName: "Hội trường lớn",
    floorId: "4",
    floorName: "Tầng 4",
    capacity: 100,
    roomType: "Auditorium",
    equipment: ["Stage", "Projector", "Sound System", "Microphones"],
    bookings: [
      {
        id: "b2",
        room_id: "5",
        roomName: "Hội trường lớn",
        meeting_title: "Town Hall Meeting",
        meetingTitle: "Town Hall Meeting",
        bookedBy: "HR Team",
        start_time: "14:00",
        startTime: "14:00",
        end_time: "16:00",
        endTime: "16:00",
        booking_date: "2024-12-14",
        status: "pending",
      },
    ],
  },
  {
    roomId: "6",
    roomName: "Phòng Training",
    floorId: "2",
    floorName: "Tầng 2",
    capacity: 30,
    roomType: "Training Room",
    equipment: ["Projector", "Computers", "Whiteboard"],
    bookings: [],
  },
];

const MOCK_USER_BOOKINGS: RoomBooking[] = [
  {
    id: "ub1",
    room_id: "1",
    roomName: "Phòng họp Alpha",
    meeting_title: "Sprint Planning",
    meetingTitle: "Sprint Planning",
    bookedBy: "Me",
    start_time: "10:00",
    startTime: "10:00",
    end_time: "11:30",
    endTime: "11:30",
    booking_date: "2024-12-15",
    status: "approved",
  },
  {
    id: "ub2",
    room_id: "3",
    roomName: "Phòng họp Gamma",
    meeting_title: "Client Demo",
    meetingTitle: "Client Demo",
    bookedBy: "Me",
    start_time: "14:00",
    startTime: "14:00",
    end_time: "15:00",
    endTime: "15:00",
    booking_date: "2024-12-16",
    status: "pending",
  },
];

// --- Helper Functions ---
const formatTime = (hour: number, minute: number = 0): string => {
  return `${hour.toString().padStart(2, "0")}:${minute
    .toString()
    .padStart(2, "0")}`;
};

const getRoomDisplayStatus = (
  room: RoomAvailabilityInfo
): RoomDisplayStatus => {
  if (room.bookings && room.bookings.length > 0) {
    const hasApproved = room.bookings.some((b) => b.status === "approved");
    const hasPending = room.bookings.some((b) => b.status === "pending");
    if (hasApproved) return "booked";
    if (hasPending) return "pending";
  }
  return "available";
};

// --- Sub Components ---
const RoomDetailSidebar: React.FC<{
  room: RoomAvailabilityInfo;
  selectedTime: { date: string; start: string; end: string };
  onClose: () => void;
  onBook: () => void;
}> = ({ room, selectedTime, onClose, onBook }) => {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose}></div>
      <div className="relative w-full sm:w-96 bg-white shadow-2xl p-6 animate-slideInRight overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {room.roomName}
            </h2>
            <p className="text-slate-500">{room.floorName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          <div className="aspect-video rounded-xl bg-slate-100 overflow-hidden">
            <img
              src={`https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80`}
              alt="Room"
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <h3 className="font-bold text-slate-900 mb-3">Tiện ích</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Users size={16} /> {room.capacity} Người
              </div>
              {room.equipment.map((eq, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-sm text-slate-600"
                >
                  ✓ {eq}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-slate-500">
                Thời gian chọn
              </span>
              <span className="text-sm font-bold text-slate-900">
                {selectedTime.date}, {selectedTime.start} - {selectedTime.end}
              </span>
            </div>
            <Button fullWidth onClick={onBook}>
              Đặt phòng
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const BookingForm: React.FC<{
  room: RoomAvailabilityInfo;
  selectedTime: { date: string; start: string; end: string };
  onClose: () => void;
  onSuccess: () => void;
}> = ({ room, selectedTime, onClose, onSuccess }) => {
  const [title, setTitle] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("✅ Đặt phòng thành công! (Mock)");
    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fadeIn">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-lg text-slate-900">
            Xác nhận đặt phòng
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-200 rounded-full"
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3 border border-blue-100">
            <div className="bg-white p-2 rounded-md shadow-sm">
              <MapPin size={20} className="text-blue-600" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900">{room.roomName}</h4>
              <div className="text-sm text-slate-600 flex items-center gap-2 mt-1">
                <Calendar size={14} /> {selectedTime.date}
                <Clock size={14} className="ml-2" /> {selectedTime.start} -{" "}
                {selectedTime.end}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Tiêu đề cuộc họp
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="VD: Weekly Sync"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-4">
            <Button variant="ghost" type="button" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit">Xác nhận đặt phòng</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Main Component ---
export const BookingModule = () => {
  const [floors] = useState<FloorPlan[]>(MOCK_FLOORS);
  const [selectedFloorId, setSelectedFloorId] = useState<string>("3");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [startTime, setStartTime] = useState<TimeSlot>({ hour: 9, minute: 0 });
  const [endTime, setEndTime] = useState<TimeSlot>({ hour: 10, minute: 0 });
  const [roomAvailability, setRoomAvailability] = useState<
    RoomAvailabilityInfo[]
  >([]);
  const [selectedRoom, setSelectedRoom] = useState<RoomAvailabilityInfo | null>(
    null
  );
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userBookings] = useState<RoomBooking[]>(MOCK_USER_BOOKINGS);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      const filtered = MOCK_ROOMS.filter((r) => r.floorId === selectedFloorId);
      setRoomAvailability(filtered.length > 0 ? filtered : MOCK_ROOMS);
      setLoading(false);
    }, 500);
  }, [selectedFloorId, selectedDate]);

  const handleRoomClick = (room: RoomAvailabilityInfo) => {
    setSelectedRoom(room);
  };

  const handleBookRoom = () => {
    if (selectedRoom) {
      setShowBookingForm(true);
    }
  };

  const handleBookingSuccess = () => {
    setShowBookingForm(false);
    setSelectedRoom(null);
  };

  const selectedFloor = floors.find((f) => f.id === selectedFloorId);

  const getStatusConfig = (status: RoomDisplayStatus) => {
    switch (status) {
      case "available":
        return {
          label: "Trống",
          statusColor: "bg-emerald-500",
          badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-100",
        };
      case "booked":
        return {
          label: "Đang họp",
          statusColor: "bg-rose-500",
          badgeClass: "bg-rose-50 text-rose-700 border-rose-100",
        };
      case "pending":
        return {
          label: "Chờ duyệt",
          statusColor: "bg-amber-500",
          badgeClass: "bg-amber-50 text-amber-700 border-amber-100",
        };
      case "maintenance":
        return {
          label: "Bảo trì",
          statusColor: "bg-slate-500",
          badgeClass: "bg-slate-100 text-slate-600 border-slate-200",
        };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-brand-600 border-t-transparent"></div>
          <p className="text-slate-500 font-medium text-sm animate-pulse">
            Đang tải không gian...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-10">
      <div className="animate-fadeIn">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 -mx-6 px-8 py-6 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                <Briefcase
                  className="text-brand-600"
                  strokeWidth={2.5}
                  size={28}
                />
                Đặt Phòng Họp
              </h2>
              <p className="text-slate-500 mt-1">
                Tìm kiếm và đặt không gian hoàn hảo cho cuộc họp của bạn.
              </p>
            </div>

            <div className="flex bg-slate-100/80 p-1 rounded-lg border border-slate-200/60">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                  viewMode === "grid"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <LayoutGrid size={16} /> Lưới
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                  viewMode === "list"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <List size={16} /> Danh sách
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Control Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 mb-8 sticky top-4 z-20">
              <div className="flex flex-wrap items-center gap-2">
                {/* Floor Selector */}
                <div className="relative min-w-[220px] flex-1 md:flex-none">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="text-brand-600" size={18} />
                  </div>
                  <select
                    value={selectedFloorId}
                    onChange={(e) => setSelectedFloorId(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 hover:bg-slate-100 border-none rounded-lg text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-brand-500/20 cursor-pointer appearance-none"
                  >
                    {floors.map((floor) => (
                      <option key={floor.id} value={floor.id}>
                        {floor.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                    <ChevronDown size={14} />
                  </div>
                </div>

                <div className="w-px h-8 bg-slate-200 mx-2 hidden md:block"></div>

                {/* Date Picker */}
                <div className="relative min-w-[180px] flex-1 md:flex-none">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="text-brand-600" size={18} />
                  </div>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-sm font-semibold text-slate-900 border-none focus:ring-2 focus:ring-brand-500/20 cursor-pointer"
                  />
                </div>

                {/* Time Range */}
                <div className="flex items-center gap-1 bg-slate-50 hover:bg-slate-100 rounded-lg p-1.5 flex-[2] md:flex-none">
                  <div className="px-2 text-slate-400">
                    <Clock size={18} className="text-brand-600" />
                  </div>
                  <select
                    value={`${startTime.hour}:${startTime.minute}`}
                    onChange={(e) => {
                      const [h, m] = e.target.value.split(":").map(Number);
                      setStartTime({ hour: h, minute: m });
                    }}
                    className="bg-transparent text-sm font-semibold text-slate-900 border-none focus:ring-0 cursor-pointer py-1"
                  >
                    {Array.from({ length: 18 }, (_, i) => i + 7).map((hour) => (
                      <React.Fragment key={hour}>
                        <option value={`${hour}:0`}>
                          {formatTime(hour, 0)}
                        </option>
                        <option value={`${hour}:30`}>
                          {formatTime(hour, 30)}
                        </option>
                      </React.Fragment>
                    ))}
                  </select>
                  <span className="text-slate-300">→</span>
                  <select
                    value={`${endTime.hour}:${endTime.minute}`}
                    onChange={(e) => {
                      const [h, m] = e.target.value.split(":").map(Number);
                      setEndTime({ hour: h, minute: m });
                    }}
                    className="bg-transparent text-sm font-semibold text-slate-900 border-none focus:ring-0 cursor-pointer py-1"
                  >
                    {Array.from({ length: 18 }, (_, i) => i + 7).map((hour) => (
                      <React.Fragment key={hour}>
                        <option value={`${hour}:0`}>
                          {formatTime(hour, 0)}
                        </option>
                        <option value={`${hour}:30`}>
                          {formatTime(hour, 30)}
                        </option>
                      </React.Fragment>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between mb-6 px-1">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="w-1.5 h-6 rounded-full bg-brand-600 inline-block"></span>
                {selectedFloor?.name || "Tất cả phòng"}
              </h3>
              <div className="text-sm font-medium text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                {roomAvailability.length} Không gian được tìm thấy
              </div>
            </div>

            {/* Rooms Grid */}
            {roomAvailability.length > 0 ? (
              <div
                className={`grid ${
                  viewMode === "grid"
                    ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                    : "grid-cols-1"
                } gap-5`}
              >
                {roomAvailability.map((room) => {
                  const status = getRoomDisplayStatus(room);
                  const config = getStatusConfig(status);

                  return (
                    <div
                      key={room.roomId}
                      onClick={() => handleRoomClick(room)}
                      className={`group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-all cursor-pointer overflow-hidden flex ${
                        selectedRoom?.roomId === room.roomId
                          ? "ring-2 ring-brand-500"
                          : ""
                      }`}
                    >
                      <div className={`w-1.5 ${config?.statusColor}`}></div>
                      <div className="flex-1 p-5">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-slate-900 text-lg group-hover:text-brand-600 transition-colors">
                            {room.roomName}
                          </h4>
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border ${config?.badgeClass}`}
                          >
                            {config?.label}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-4">
                          {room.roomType}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-slate-600 mb-5">
                          <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                            <Users size={14} className="text-slate-400" />
                            <span className="font-semibold">
                              {room.capacity}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                            <MapPin size={14} className="text-slate-400" />
                            <span>{room.floorName}</span>
                          </div>
                        </div>
                        <div className="mt-auto pt-4 border-t border-slate-100 border-dashed">
                          {(status === "booked" || status === "pending") &&
                          room.bookings.length > 0 ? (
                            <div className="bg-slate-50 rounded-lg p-2.5">
                              <p className="text-xs text-slate-400 mb-1 font-medium uppercase">
                                Cuộc họp hiện tại
                              </p>
                              <p className="text-xs font-bold text-slate-900 truncate">
                                {room.bookings[0].meetingTitle}
                              </p>
                              <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1">
                                <div className="flex items-center gap-1">
                                  <Clock size={10} />
                                  {room.bookings[0].startTime} -{" "}
                                  {room.bookings[0].endTime}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-slate-400">
                                {room.equipment.length} Thiết bị có sẵn
                              </span>
                              <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 opacity-0 group-hover:opacity-100 transition-all">
                                <ArrowRight size={14} />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-200 border-dashed">
                <Search size={40} className="text-slate-300 mb-4" />
                <h3 className="text-slate-900 font-bold text-lg mb-2">
                  Không tìm thấy phòng
                </h3>
                <p className="text-slate-500">
                  Vui lòng thử thay đổi tầng hoặc thời gian.
                </p>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="w-full lg:w-80 space-y-6 lg:sticky lg:top-24 h-fit">
            <div className="bg-gradient-to-br from-brand-600 to-brand-700 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
              <h3 className="font-bold text-lg mb-1 relative z-10">
                Xin chào!
              </h3>
              <p className="text-brand-100 text-sm mb-6 relative z-10">
                Bạn có{" "}
                {userBookings.filter((b) => b.status === "approved").length}{" "}
                cuộc họp đã xác nhận.
              </p>
              <div className="grid grid-cols-2 gap-3 relative z-10">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                  <p className="text-2xl font-bold">{userBookings.length}</p>
                  <p className="text-[10px] uppercase tracking-wider text-brand-100 font-medium">
                    Tổng số
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                  <p className="text-2xl font-bold">{floors.length}</p>
                  <p className="text-[10px] uppercase tracking-wider text-brand-100 font-medium">
                    Tầng
                  </p>
                </div>
              </div>
            </div>

            {userBookings.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide flex items-center gap-2">
                    <Calendar size={14} className="text-brand-600" />
                    Lịch của tôi
                  </h3>
                  <button className="text-xs text-brand-600 hover:text-brand-700 font-medium">
                    Xem tất cả
                  </button>
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  {userBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer last:border-0"
                    >
                      <div className="flex justify-between items-start mb-1.5">
                        <p className="font-bold text-slate-800 text-sm truncate">
                          {booking.meeting_title}
                        </p>
                        <div
                          className={`w-2 h-2 rounded-full mt-1.5 ${
                            booking.status === "approved"
                              ? "bg-emerald-500"
                              : booking.status === "pending"
                              ? "bg-amber-500"
                              : "bg-red-500"
                          }`}
                        ></div>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                        <MapPin size={10} />
                        <span>{booking.roomName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                          {booking.booking_date}
                        </span>
                        <span className="text-xs font-medium text-slate-400">
                          {booking.start_time} - {booking.end_time}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedRoom && !showBookingForm && (
        <RoomDetailSidebar
          room={selectedRoom}
          selectedTime={{
            date: selectedDate,
            start: formatTime(startTime.hour, startTime.minute),
            end: formatTime(endTime.hour, endTime.minute),
          }}
          onClose={() => setSelectedRoom(null)}
          onBook={handleBookRoom}
        />
      )}

      {showBookingForm && selectedRoom && (
        <BookingForm
          room={selectedRoom}
          selectedTime={{
            date: selectedDate,
            start: formatTime(startTime.hour, startTime.minute),
            end: formatTime(endTime.hour, endTime.minute),
          }}
          onClose={() => setShowBookingForm(false)}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
};

export default BookingModule;
