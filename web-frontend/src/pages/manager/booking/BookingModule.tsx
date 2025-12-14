import React, { useState, useEffect } from "react";
import {
    Building2,
    Calendar,
    Clock,
    Users,
    MapPin,
    ChevronDown,
    LayoutGrid,
    List,
    MoreHorizontal,
    Search,
    Filter,
    ArrowRight,
    Briefcase
} from "lucide-react";
import { Button } from "../../../components/system/ui/Button";
import { floorService, roomService, bookingService } from "../../../services/bookingService";
import type {
    FloorPlan,
    RoomAvailabilityInfo,
    RoomDisplayStatus,
    RoomBooking,
} from "../../../types/booking.types";
import { getRoomDisplayStatus } from "../../../types/booking.types";
import { RoomDetailSidebar } from "./RoomDetailSidebar";
import { BookingForm } from "./BookingForm";

// --- Components ---

interface TimeSlot {
    hour: number;
    minute: number;
}

const formatTime = (hour: number, minute: number = 0): string => {
    return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
};

export const BookingModule = () => {
    // --- State ---
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

    // --- Effects ---
    useEffect(() => {
        loadFloors();
        loadUserBookings();
    }, []);

    useEffect(() => {
        if (selectedFloorId && selectedDate) {
            loadRoomAvailability();
        }
    }, [selectedFloorId, selectedDate]);

    // --- Data Loading ---
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

    // --- Handlers ---
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
        loadRoomAvailability();
        loadUserBookings();
    };

    // --- Render Helpers ---
    const selectedFloor = floors.find((f) => f.id === selectedFloorId);

    const getStatusConfig = (status: RoomDisplayStatus) => {
        switch (status) {
            case "available":
                return {
                    label: "Available",
                    statusColor: "bg-emerald-500",
                    bgColor: "bg-white",
                    borderColor: "border-emerald-500", // Left border
                    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-100 placeholder-emerald-100",
                    actionLabel: "Book Now"
                };
            case "booked":
                return {
                    label: "Occupied",
                    statusColor: "bg-rose-500",
                    bgColor: "bg-rose-50/30",
                    borderColor: "border-rose-500",
                    badgeClass: "bg-rose-50 text-rose-700 border-rose-100",
                    actionLabel: "View Details"
                };
            case "pending":
                return {
                    label: "Pending",
                    statusColor: "bg-amber-500",
                    bgColor: "bg-amber-50/30",
                    borderColor: "border-amber-500",
                    badgeClass: "bg-amber-50 text-amber-700 border-amber-100",
                    actionLabel: "Check Status"
                };
            case "maintenance":
                return {
                    label: "Maintenance",
                    statusColor: "bg-slate-500",
                    bgColor: "bg-slate-50",
                    borderColor: "border-slate-500",
                    badgeClass: "bg-slate-100 text-slate-600 border-slate-200",
                    actionLabel: "Unavailable"
                };
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-10 w-10 border-2 border-brand-600 border-t-transparent"></div>
                    <p className="text-slate-500 font-medium text-sm animate-pulse">Loading spaces...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 pb-10 font-sans">
            <div className="animate-fadeIn">
                {/* --- Hero Header --- */}
                <div className="bg-white border-b border-slate-200 -mx-6 px-8 py-6 mb-8 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 max-w-7xl mx-auto">
                        <div>
                            <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                                <span className="hover:text-brand-600 cursor-pointer transition-colors">Workspace</span>
                                <span className="text-slate-300">/</span>
                                <span className="text-slate-900 font-medium">Meeting Rooms</span>
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                                <Briefcase className="text-brand-600" strokeWidth={2.5} size={28} />
                                Book a Room
                            </h2>
                            <p className="text-slate-500 mt-1 max-w-xl">
                                Find and book the perfect space for your meetings. Filter by floor, time, or capacity.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex bg-slate-100/80 p-1 rounded-lg border border-slate-200/60">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${viewMode === 'grid'
                                        ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200'
                                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                                        }`}
                                >
                                    <LayoutGrid size={16} /> Grid
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${viewMode === 'list'
                                        ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200'
                                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                                        }`}
                                >
                                    <List size={16} /> List
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex flex-col lg:flex-row gap-8">

                        {/* --- Main Content Area --- */}
                        <div className="flex-1 min-w-0">

                            {/* Control Bar */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 mb-8 sticky top-4 z-20 backdrop-blur-xl bg-white/95 supports-[backdrop-filter]:bg-white/80">
                                <div className="flex flex-wrap items-center gap-2">
                                    {/* Floor Selector */}
                                    <div className="relative group min-w-[220px] flex-1 md:flex-none">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <MapPin className="text-brand-600" size={18} />
                                        </div>
                                        <select
                                            value={selectedFloorId}
                                            onChange={(e) => setSelectedFloorId(e.target.value)}
                                            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 hover:bg-slate-100 border-none rounded-lg text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-brand-500/20 cursor-pointer appearance-none transition-colors"
                                        >
                                            {floors.map((floor) => (
                                                <option key={floor.id} value={floor.id}>
                                                    {floor.name}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                                            <ChevronDown size={14} strokeWidth={2.5} />
                                        </div>
                                    </div>

                                    <div className="w-px h-8 bg-slate-200 mx-2 hidden md:block"></div>

                                    {/* Date Picker */}
                                    <div className="relative group min-w-[180px] flex-1 md:flex-none">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Calendar className="text-brand-600" size={18} />
                                        </div>
                                        <input
                                            type="date"
                                            value={selectedDate}
                                            onChange={(e) => setSelectedDate(e.target.value)}
                                            min={new Date().toISOString().split("T")[0]}
                                            className="w-full pl-10 pr-3 py-2.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-sm font-semibold text-slate-900 border-none focus:ring-2 focus:ring-brand-500/20 cursor-pointer transition-colors"
                                        />
                                    </div>

                                    {/* Time Range */}
                                    <div className="flex items-center gap-1 bg-slate-50 hover:bg-slate-100 rounded-lg p-1.5 flex-[2] md:flex-none transition-colors">
                                        <div className="px-2 text-slate-400">
                                            <Clock size={18} className="text-brand-600" />
                                        </div>
                                        <div className="flex items-center gap-2">
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
                                                        <option value={`${hour}:0`}>{formatTime(hour, 0)}</option>
                                                        <option value={`${hour}:30`}>{formatTime(hour, 30)}</option>
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
                                                        <option value={`${hour}:0`}>{formatTime(hour, 0)}</option>
                                                        <option value={`${hour}:30`}>{formatTime(hour, 30)}</option>
                                                    </React.Fragment>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Stats / Info Line */}
                            <div className="flex items-center justify-between mb-6 px-1">
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <span className="w-1.5 h-6 rounded-full bg-brand-600 inline-block"></span>
                                    {selectedFloor?.name || "All Rooms"}
                                </h3>
                                <div className="text-sm font-medium text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                                    {roomAvailability.length} Spaces Found
                                </div>
                            </div>

                            {/* Rooms Grid */}
                            {roomAvailability.length > 0 ? (
                                <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'} gap-5`}>
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
                                                    group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden
                                                    ${selectedRoom?.roomId === room.roomId ? 'ring-2 ring-brand-500 ring-offset-2' : ''}
                                                    flex flex-col
                                                `}
                                            >
                                                <div className="flex h-full">
                                                    {/* Left Status Stripe */}
                                                    <div className={`w-1.5 ${config?.statusColor}`}></div>

                                                    <div className="flex-1 p-5 flex flex-col">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <h4 className="font-bold text-slate-900 text-lg group-hover:text-brand-600 transition-colors">
                                                                {room.roomName}
                                                            </h4>
                                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border ${config?.badgeClass}`}>
                                                                {config?.label}
                                                            </span>
                                                        </div>

                                                        <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-4 opacity-80">{room.roomType}</p>

                                                        {/* Specs */}
                                                        <div className="flex items-center gap-4 text-sm text-slate-600 mb-5">
                                                            <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                                                                <Users size={14} className="text-slate-400" />
                                                                <span className="font-semibold">{room.capacity}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                                                                <MapPin size={14} className="text-slate-400" />
                                                                <span className="truncate max-w-[100px]">{room.floorName}</span>
                                                            </div>
                                                        </div>

                                                        <div className="mt-auto pt-4 border-t border-slate-100 border-dashed">
                                                            {(status === "booked" || status === "pending") && room.bookings.length > 0 ? (
                                                                <div className="bg-slate-50 rounded-lg p-2.5">
                                                                    <p className="text-xs text-slate-400 mb-1 font-medium uppercase tracking-wider">Current Meeting</p>
                                                                    <p className="text-xs font-bold text-slate-900 truncate mb-1">
                                                                        {room.bookings[0].meetingTitle}
                                                                    </p>
                                                                    <div className="flex justify-between items-center text-[10px] text-slate-500">
                                                                        <div className="flex items-center gap-1">
                                                                            <Clock size={10} />
                                                                            {room.bookings[0].startTime.substring(0, 5)} - {room.bookings[0].endTime.substring(0, 5)}
                                                                        </div>
                                                                        <div className="flex items-center gap-1">
                                                                            <div className="w-4 h-4 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold">
                                                                                {room.bookings[0].bookedBy.charAt(0)}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center justify-between group-hover:bg-slate-50 -mx-2 -my-1 px-2 py-1 rounded-lg transition-colors">
                                                                    <span className="text-xs font-medium text-slate-400 group-hover:text-slate-600">
                                                                        {room.equipment && room.equipment.length > 0
                                                                            ? `${room.equipment.length} Available Devices`
                                                                            : "Standard Setup"}
                                                                    </span>
                                                                    <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                                                        <ArrowRight size={14} strokeWidth={2.5} />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-200 border-dashed">
                                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                        <Search size={40} className="text-slate-300" />
                                    </div>
                                    <h3 className="text-slate-900 font-bold text-lg mb-2">No Rooms Found</h3>
                                    <p className="text-slate-500 text-center max-w-xs">
                                        We couldn't find any rooms matching your criteria. Try changing the floor or time.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* --- Right Sidebar (My Schedule) --- */}
                        <div className="w-full lg:w-80 space-y-6 lg:sticky lg:top-24 h-fit">
                            {/* Summary Widget */}
                            <div className="bg-gradient-to-br from-brand-600 to-brand-700 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>

                                <h3 className="font-bold text-lg mb-1 relative z-10">Hello, User</h3>
                                <p className="text-brand-100 text-sm mb-6 relative z-10">You have {userBookings.filter(b => b.status === 'approved').length} confirmed meetings.</p>

                                <div className="grid grid-cols-2 gap-3 relative z-10">
                                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                                        <p className="text-2xl font-bold">{userBookings.length}</p>
                                        <p className="text-[10px] uppercase tracking-wider text-brand-100 font-medium">Total</p>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                                        <p className="text-2xl font-bold">{floors.length}</p>
                                        <p className="text-[10px] uppercase tracking-wider text-brand-100 font-medium">Floors</p>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Bookings List */}
                            {userBookings.length > 0 && (
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                                        <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide flex items-center gap-2">
                                            <Calendar size={14} className="text-brand-600" />
                                            My Schedule
                                        </h3>
                                        <button className="text-xs text-brand-600 hover:text-brand-700 font-medium">View All</button>
                                    </div>
                                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                        {userBookings.slice(0, 5).map((booking) => (
                                            <div
                                                key={booking.id}
                                                className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer group last:border-0"
                                            >
                                                <div className="flex justify-between items-start mb-1.5">
                                                    <div className="flex-1 min-w-0 pr-2">
                                                        <p className="font-bold text-slate-800 text-sm truncate group-hover:text-brand-600 transition-colors">
                                                            {booking.meeting_title}
                                                        </p>
                                                    </div>
                                                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${booking.status === 'approved' ? 'bg-emerald-500' :
                                                        booking.status === 'pending' ? 'bg-amber-500' : 'bg-red-500'
                                                        }`}></div>
                                                </div>

                                                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                                                    <MapPin size={10} />
                                                    <span className="truncate">{booking.roomName}</span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                                        {booking.booking_date}
                                                    </span>
                                                    <span className="text-xs font-medium text-slate-400">
                                                        {booking.start_time.substring(0, 5)} - {booking.end_time.substring(0, 5)}
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
            </div>

            {/* --- Modals & Drawers --- */}
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
