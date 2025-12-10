import React from "react";
import {
    X,
    Users,
    MapPin,
    Tv,
    Monitor,
    Video,
    Mic,
    Speaker,
    Presentation,
    Thermometer,
    Printer,
    Calendar,
    Clock,
    CheckCircle2,
    AlertCircle,
    Info
} from "lucide-react";
import { Button } from "../../../components/system/ui/Button";
import type { RoomAvailabilityInfo } from "../../../types/booking.types";
import { getRoomDisplayStatus, STATUS_COLORS } from "../../../types/booking.types";

interface RoomDetailSidebarProps {
    room: RoomAvailabilityInfo;
    selectedTime: {
        date: string;
        start: string;
        end: string;
    };
    onClose: () => void;
    onBook: () => void;
}

const EQUIPMENT_ICONS: Record<string, React.ReactNode> = {
    TV: <Tv size={16} />,
    "Máy chiếu": <Presentation size={16} />,
    "Video Conference": <Video size={16} />,
    Webcam: <Monitor size={16} />,
    Loa: <Speaker size={16} />,
    Mic: <Mic size={16} />,
    "Bảng trắng": <Presentation size={16} />,
    "Điều hòa": <Thermometer size={16} />,
    "Máy in": <Printer size={16} />,
};

export const RoomDetailSidebar: React.FC<RoomDetailSidebarProps> = ({
    room,
    selectedTime,
    onClose,
    onBook,
}) => {
    const status = getRoomDisplayStatus(room, {
        start: selectedTime.start,
        end: selectedTime.end,
    });

    const isBookable = status === "available";

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("vi-VN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fadeIn p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scaleIn flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className={`px-6 py-4 flex items-center justify-between border-b ${status === 'available' ? 'bg-emerald-50 border-emerald-100' :
                    status === 'booked' ? 'bg-rose-50 border-rose-100' :
                        status === 'pending' ? 'bg-amber-50 border-amber-100' :
                            'bg-slate-50 border-slate-100'
                    }`}>
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${status === 'available' ? 'bg-emerald-500 text-white' :
                            status === 'booked' ? 'bg-rose-500 text-white' :
                                status === 'pending' ? 'bg-amber-500 text-white' :
                                    'bg-slate-500 text-white'
                            }`}>
                            {status === 'available' ? <CheckCircle2 size={20} /> :
                                status === 'booked' ? <X size={20} /> :
                                    status === 'pending' ? <Clock size={20} /> :
                                        <Info size={20} />}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">{room.roomName}</h3>
                            <p className={`text-xs font-semibold uppercase tracking-wider ${status === 'available' ? 'text-emerald-700' :
                                status === 'booked' ? 'text-rose-700' :
                                    status === 'pending' ? 'text-amber-700' :
                                        'text-slate-600'
                                }`}>
                                {status === 'available' ? 'Có thể đặt' :
                                    status === 'booked' ? 'Đã có người đặt' :
                                        status === 'pending' ? 'Chờ duyệt' : 'Bảo trì'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-black/5 transition-colors text-slate-500"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-brand-600 shrink-0">
                                <Users size={16} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900">{room.capacity}</p>
                                <p className="text-xs text-slate-500">Sức chứa</p>
                            </div>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-brand-600 shrink-0">
                                <MapPin size={16} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900 break-words" title={room.floorName}>{room.floorName}</p>
                                <p className="text-xs text-slate-500">Vị trí</p>
                            </div>
                        </div>
                    </div>

                    {/* Equipment */}
                    <div className="mb-6">
                        <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                            <Monitor size={16} className="text-slate-400" />
                            Thiết bị & Tiện nghi
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {["TV", "Máy chiếu", "Video Conference", "Bảng trắng", "Điều hòa"].map((eq) => (
                                <span
                                    key={eq}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-700 text-xs font-medium rounded-lg border border-slate-200"
                                >
                                    {EQUIPMENT_ICONS[eq] || <div className="w-1 h-1 rounded-full bg-slate-400"></div>}
                                    {eq}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Timeline / Schedule */}
                    <div>
                        <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                            <Calendar size={16} className="text-slate-400" />
                            Lịch đặt hôm nay ({formatDate(selectedTime.date)})
                        </h4>

                        {room.bookings.length > 0 ? (
                            <div className="space-y-3">
                                {room.bookings.map((booking) => (
                                    <div
                                        key={booking.bookingId}
                                        className={`relative pl-4 border-l-2 ${booking.status === "approved" ? "border-rose-400" : "border-amber-400"
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-bold text-slate-900">
                                                {booking.startTime} - {booking.endTime}
                                            </span>
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${booking.status === "approved" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                                                }`}>
                                                {booking.status === "approved" ? "Busy" : "Pending"}
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium text-slate-800">{booking.meetingTitle}</p>
                                        <p className="text-xs text-slate-500">{booking.bookedBy}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-sm">
                                Chưa có lịch đặt nào hôm nay
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Action */}
                <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                    <Button
                        onClick={onBook}
                        disabled={!isBookable}
                        className={`w-full py-2.5 shadow-lg ${isBookable ? 'bg-brand-600 hover:bg-brand-700 shadow-brand-200' : 'bg-slate-300 shadow-none cursor-not-allowed'}`}
                    >
                        {isBookable ? "Đặt phòng này ngay" : "Phòng không khả dụng"}
                    </Button>
                </div>
            </div>
        </div>
    );
};
