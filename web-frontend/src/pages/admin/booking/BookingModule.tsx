import React, { useState, useEffect } from "react";
import {
    Building2,
    Calendar,
    Clock,
    Users,
    MapPin,
    ChevronLeft,
    ChevronRight,
    Info,
    CheckCircle2,
    XCircle,
    Hourglass,
    Wrench,
    Filter,
    Search,
    LayoutGrid,
    List,
    MoreHorizontal
} from "lucide-react";
import { Button } from "../../../components/system/ui/Button";
import { floorService, roomService, bookingService } from "../../../services/bookingService";
import type {
    FloorPlan,
    RoomAvailabilityInfo,
    RoomDisplayStatus,
    RoomBooking,
} from "../../../types/booking.types";
import { getRoomDisplayStatus, STATUS_COLORS } from "../../../types/booking.types";
import { RoomDetailSidebar } from "./RoomDetailSidebar";
import { BookingForm } from "./BookingForm";

interface TimeSlot {
    hour: number;
    minute: number;
}

const formatTime = (hour: number, minute: number = 0): string => {
    return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
};

export const BookingModule = () => {
    // State
    const [floors, setFloors] = useState<FloorPlan[]>([]);
    const [selectedFloorId, setSelectedFloorId] = useState<string>("");
    const [selectedDate, setSelectedDate] = useState<string>(
        new Date().toISOString().split("T")[0]
    );
    const [startTime, setStartTime] = useState<TimeSlot>({ hour: 9, minute: 0 });
    const [endTime, setEndTime] = useState<TimeSlot>({ hour: 10, minute: 0 });
    const [roomAvailability, setRoomAvailability] = useState<RoomAvailabilityInfo[]>([]);
    const [selectedRoom, setSelectedRoom] = useState<RoomAvailabilityInfo | null>(null);
    const [showBookingForm, setShowBookingForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [userBookings, setUserBookings] = useState<RoomBooking[]>([]);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Load floors on mount
    useEffect(() => {
        loadFloors();
        loadUserBookings();
    }, []);

    // Load room availability when floor or date changes
    useEffect(() => {
        if (selectedFloorId && selectedDate) {
            loadRoomAvailability();
        }
    }, [selectedFloorId, selectedDate]);

    const loadFloors = async () => {
        try {
            const data = await floorService.getFloors();
            setFloors(data);
            if (data.length > 0) {
                setSelectedFloorId(data[0].id);
            }
        } catch (error) {
            console.error("Error loading floors:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadRoomAvailability = async () => {
        try {
            const data = await roomService.getRoomAvailability(selectedDate, selectedFloorId);
            setRoomAvailability(data);
        } catch (error) {
            console.error("Error loading room availability:", error);
        }
    };

    const loadUserBookings = async () => {
        try {
            const data = await bookingService.getBookings();
            setUserBookings(data);
        } catch (error) {
            console.error("Error loading user bookings:", error);
        }
    };

    const handleRoomClick = (room: RoomAvailabilityInfo) => {
        // Always open sidebar for details or booking
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
        loadRoomAvailability();
        loadUserBookings();
    };

    const getStatusConfig = (status: RoomDisplayStatus) => {
        switch (status) {
            case "available":
                return {
                    icon: <CheckCircle2 size={16} />,
                    label: "Trống",
                    className: "bg-emerald-50 text-emerald-700 border-emerald-100",
                    dotClass: "bg-emerald-500"
                };
            case "booked":
                return {
                    icon: <XCircle size={16} />,
                    label: "Đang họp",
                    className: "bg-rose-50 text-rose-700 border-rose-100",
                    dotClass: "bg-rose-500"
                };
            case "pending":
                return {
                    icon: <Hourglass size={16} />,
                    label: "Chờ duyệt",
                    className: "bg-amber-50 text-amber-700 border-amber-100",
                    dotClass: "bg-amber-500"
                };
            case "maintenance":
                return {
                    icon: <Wrench size={16} />,
                    label: "Bảo trì",
                    className: "bg-slate-50 text-slate-700 border-slate-100",
                    dotClass: "bg-slate-500"
                };
        }
    };

    const selectedFloor = floors.find((f) => f.id === selectedFloorId);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
            </div>
        );
    }

    return (
        <div className="animate-fadeIn pb-10">
            {/* Header Section */}
            <div className="bg-white border-b border-slate-200 -mx-6 px-6 py-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Building2 className="text-brand-600" />
                        Đặt Phòng Họp
                    </h2>
                    <p className="text-sm text-slate-500 mt-0.5">
                        Quản lý và đặt lịch phòng họp chuyên nghiệp
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-brand-600' : 'text-slate-500 hover:text-slate-700'}`}
                            title="Lưới"
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-brand-600' : 'text-slate-500 hover:text-slate-700'}`}
                            title="Danh sách"
                        >
                            <List size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Filters Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1 mb-6">
                <div className="flex flex-wrap items-center gap-2 p-2">
                    {/* Floor Selector - Enterprise Style */}
                    <div className="relative group">
                        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer min-w-[200px]">
                            <MapPin size={16} className="text-brand-600" />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-slate-500 font-medium">Khu vực / Tầng</p>
                                <select
                                    value={selectedFloorId}
                                    onChange={(e) => setSelectedFloorId(e.target.value)}
                                    className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none cursor-pointer appearance-none -ml-1 mt-0.5"
                                >
                                    {floors.map((floor) => (
                                        <option key={floor.id} value={floor.id}>
                                            {floor.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <ChevronDownIcon />
                        </div>
                    </div>

                    <div className="w-px h-8 bg-slate-200 mx-1 hidden md:block"></div>

                    {/* Date Picker */}
                    <div className="relative group">
                        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer">
                            <Calendar size={16} className="text-brand-600" />
                            <div>
                                <p className="text-xs text-slate-500 font-medium">Ngày đặt</p>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    min={new Date().toISOString().split("T")[0]}
                                    className="bg-transparent text-sm font-semibold text-slate-900 outline-none cursor-pointer p-0 w-32 mt-0.5"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="w-px h-8 bg-slate-200 mx-1 hidden md:block"></div>

                    {/* Time Range */}
                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer">
                        <Clock size={16} className="text-brand-600" />
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Khung giờ</p>
                            <div className="flex items-center gap-1 mt-0.5">
                                <select
                                    value={`${startTime.hour}:${startTime.minute}`}
                                    onChange={(e) => {
                                        const [h, m] = e.target.value.split(":").map(Number);
                                        setStartTime({ hour: h, minute: m });
                                    }}
                                    className="bg-transparent text-sm font-semibold text-slate-900 outline-none cursor-pointer appearance-none"
                                >
                                    {Array.from({ length: 18 }, (_, i) => i + 7).map((hour) => (
                                        <React.Fragment key={hour}>
                                            <option value={`${hour}:0`}>{formatTime(hour, 0)}</option>
                                            <option value={`${hour}:30`}>{formatTime(hour, 30)}</option>
                                        </React.Fragment>
                                    ))}
                                </select>
                                <span className="text-slate-400 font-normal">-</span>
                                <select
                                    value={`${endTime.hour}:${endTime.minute}`}
                                    onChange={(e) => {
                                        const [h, m] = e.target.value.split(":").map(Number);
                                        setEndTime({ hour: h, minute: m });
                                    }}
                                    className="bg-transparent text-sm font-semibold text-slate-900 outline-none cursor-pointer appearance-none"
                                >
                                    {Array.from({ length: 18 }, (_, i) => i + 7).map((hour) => (
                                        <React.Fragment key={hour}>
                                            <option value={`${hour}:0`}>{formatTime(hour, 0)}</option>
                                            <option value={`${hour}:30`}>{formatTime(hour, 30)}</option>
                                        </React.Fragment>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Room Content */}
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Main Grid/List */}
                <div className="flex-1">
                    {/* Status Legend - Inline */}
                    <div className="flex items-center justify-end gap-3 mb-4 text-xs">
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-100">
                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Trống
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-rose-50 text-rose-700 rounded-md border border-rose-100">
                            <div className="w-2 h-2 rounded-full bg-rose-500"></div> Đang họp
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-50 text-amber-700 rounded-md border border-amber-100">
                            <div className="w-2 h-2 rounded-full bg-amber-500"></div> Chờ duyệt
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 min-h-[500px]">
                        <div className="mb-6 flex items-center justify-between">
                            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                                <Building2 size={20} className="text-brand-600" />
                                {selectedFloor?.name || "Danh sách phòng"}
                            </h3>
                            <div className="text-sm text-slate-500">
                                {roomAvailability.length} phòng khả dụng
                            </div>
                        </div>

                        <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'} gap-4`}>
                            {roomAvailability.map((room) => {
                                const status = getRoomDisplayStatus(room, {
                                    start: formatTime(startTime.hour, startTime.minute),
                                    end: formatTime(endTime.hour, endTime.minute),
                                });
                                const config = getStatusConfig(status);

                                return (
                                    <div
                                        key={room.roomId}
                                        onClick={() => handleRoomClick(room)}
                                        className={`
                                            group relative rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden
                                            ${selectedRoom?.roomId === room.roomId
                                                ? "ring-2 ring-brand-500 border-brand-200 shadow-md transform scale-[1.02]"
                                                : "border-slate-200 hover:border-brand-200 hover:shadow-lg hover:-translate-y-1 bg-white"
                                            }
                                        `}
                                    >
                                        {/* Status Strip */}
                                        <div className={`h-1.5 w-full ${config.dotClass}`}></div>

                                        <div className="p-4">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h4 className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                                                        {room.roomName}
                                                    </h4>
                                                    <p className="text-xs text-slate-500 mt-0.5 capitalize">{room.roomType}</p>
                                                </div>
                                                <div className={`px-2 py-1 rounded-md text-xs font-medium border flex items-center gap-1 ${config.className}`}>
                                                    {config.label}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                                                <div className="flex items-center gap-1.5" title="Sức chứa">
                                                    <Users size={14} className="text-slate-400" />
                                                    <span>{room.capacity}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5" title="Tầng">
                                                    <MapPin size={14} className="text-slate-400" />
                                                    <span>{room.floorName}</span>
                                                </div>
                                            </div>

                                            {/* Equipment Tags (Preview) */}
                                            {/* You would need equipment data in roomAvailability usually, assuming it's passing MeetingRoom */}

                                            {/* Active Meeting Info */}
                                            {(status === "booked" || status === "pending") && room.bookings.length > 0 && (
                                                <div className="mt-3 pt-3 border-t border-slate-100">
                                                    <div className="bg-slate-50 rounded-lg p-2 text-xs">
                                                        <p className="font-semibold text-slate-900 truncate">
                                                            {room.bookings[0].meetingTitle}
                                                        </p>
                                                        <p className="text-slate-500 mt-0.5 flex items-center gap-1">
                                                            <Clock size={10} />
                                                            {room.bookings[0].startTime.substring(0, 5)} - {room.bookings[0].endTime.substring(0, 5)}
                                                        </p>
                                                        <div className="flex items-center gap-1 mt-1.5">
                                                            <div className="w-4 h-4 rounded-full bg-brand-100 flex items-center justify-center text-[10px] font-bold text-brand-700">
                                                                {room.bookings[0].bookedBy.charAt(0)}
                                                            </div>
                                                            <span className="truncate text-slate-600">{room.bookings[0].bookedBy}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}

                            {roomAvailability.length === 0 && (
                                <div className="col-span-full py-16 text-center">
                                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                        <Building2 size={40} className="text-slate-300" />
                                    </div>
                                    <h3 className="text-slate-900 font-medium text-lg">Chưa có phòng họp</h3>
                                    <p className="text-slate-500 max-w-xs mx-auto mt-2">
                                        Tầng này chưa được cấu hình phòng họp nào. Vui lòng chọn tầng khác hoặc liên hệ Admin.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar / My Bookings */}
                <div className="w-full lg:w-96 flex flex-col gap-6 lg:sticky lg:top-24 h-fit">
                    {/* My Upcoming Bookings - Enhanced */}
                    {userBookings.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col max-h-[calc(100vh-8rem)]">
                            <div className="p-4 border-b border-slate-50 bg-slate-50/50 shrink-0">
                                <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm uppercase tracking-wide">
                                    <Calendar size={16} className="text-brand-600" />
                                    Lịch của tôi
                                </h3>
                            </div>
                            <div className="divide-y divide-slate-100 overflow-y-auto custom-scrollbar">
                                {userBookings.map((booking) => (
                                    <div
                                        key={booking.id}
                                        className="p-4 hover:bg-slate-50 transition-colors cursor-pointer group"
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <p className="font-semibold text-slate-900 text-sm line-clamp-1 group-hover:text-brand-600 transition-colors">
                                                {booking.meeting_title}
                                            </p>
                                            <span
                                                className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${booking.status === "approved"
                                                    ? "bg-green-100 text-green-700"
                                                    : booking.status === "pending"
                                                        ? "bg-amber-100 text-amber-700"
                                                        : "bg-red-100 text-red-700"
                                                    }`}
                                            >
                                                {booking.status === "approved" ? "Confirmed" : booking.status}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 mb-2 line-clamp-1">{booking.roomName}</p>
                                        <div className="flex items-center gap-2 text-xs text-slate-400">
                                            <span className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded">
                                                <Calendar size={10} />
                                                {booking.booking_date}
                                            </span>
                                            <span className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded">
                                                <Clock size={10} />
                                                {booking.start_time.substring(0, 5)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-3 border-t border-slate-50 text-center">
                                <button className="text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline">
                                    Xem tất cả
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Drawers */}
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
        </div>
    );
};

// Helper Icon
const ChevronDownIcon = () => (
    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-slate-400">
        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export default BookingModule;
