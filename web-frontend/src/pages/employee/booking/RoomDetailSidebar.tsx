import React from "react";
import {
  X,
  Users,
  MapPin,
  Tv,
  Monitor,
  Video,
  Presentation,
  Thermometer,
  Calendar,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Button } from "../../../components/ui/Button";
import type { RoomAvailabilityInfo } from "../../../types/booking.types";
import { getRoomDisplayStatus } from "../../../types/booking.types";

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
  TV: <Tv size={14} />,
  "Máy chiếu": <Presentation size={14} />,
  "Video Conference": <Video size={14} />,
  Webcam: <Monitor size={14} />,
  "Bảng trắng": <Presentation size={14} />,
  "Điều hòa": <Thermometer size={14} />,
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

  const getStatusTheme = () => {
    switch (status) {
      case "available":
        return {
          bg: "bg-emerald-50",
          border: "border-emerald-100",
          text: "text-emerald-700",
          label: "Có thể đặt",
        };
      case "booked":
        return {
          bg: "bg-rose-50",
          border: "border-rose-100",
          text: "text-rose-700",
          label: "Đã được đặt",
        };
      case "pending":
        return {
          bg: "bg-amber-50",
          border: "border-amber-100",
          text: "text-amber-700",
          label: "Chờ duyệt",
        };
      default:
        return {
          bg: "bg-slate-50",
          border: "border-slate-100",
          text: "text-slate-600",
          label: "Không khả dụng",
        };
    }
  };

  const theme = getStatusTheme();

  return (
    <div
      className="fixed inset-0 z-[9999] flex justify-end bg-slate-900/20 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md h-full shadow-2xl animate-slideInRight flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`px-6 py-6 border-b flex items-start justify-between ${theme.bg} ${theme.border}`}
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${theme.text} bg-white/50 border-current opacity-80`}
              >
                {theme.label}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 leading-tight mb-1">
              {room.roomName}
            </h3>
            <div className="flex items-center gap-1.5 text-slate-500 text-sm">
              <MapPin size={14} />
              <span>{room.floorName}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-2 -mt-2 rounded-full hover:bg-black/5 transition-colors text-slate-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Key Stats */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-teal-600">
                <Users size={20} />
              </div>
              <div>
                <span className="block text-lg font-bold text-slate-900">
                  {room.capacity}
                </span>
                <span className="text-xs text-slate-500 uppercase font-bold tracking-wide">
                  Sức chứa
                </span>
              </div>
            </div>
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-teal-600">
                <Tv size={20} />
              </div>
              <div>
                <span className="block text-lg font-bold text-slate-900">
                  {room.equipment?.length || 0}
                </span>
                <span className="text-xs text-slate-500 uppercase font-bold tracking-wide">
                  Thiết bị
                </span>
              </div>
            </div>
          </div>

          {/* Equipment List */}
          <div className="mb-8">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Monitor size={14} className="text-slate-400" />
              Tiện nghi
            </h4>
            <div className="flex flex-wrap gap-2">
              {[
                "TV",
                "Máy chiếu",
                "Video Conference",
                "Bảng trắng",
                "Điều hòa",
              ].map((eq) => (
                <span
                  key={eq}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-white text-slate-700 text-xs font-medium rounded-lg border border-slate-200 shadow-sm"
                >
                  {EQUIPMENT_ICONS[eq] || (
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                  )}
                  {eq}
                </span>
              ))}
            </div>
          </div>

          <div className="h-px bg-slate-100 mx-4 mb-8"></div>

          {/* Schedule */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Calendar size={14} className="text-slate-400" />
              Lịch ({formatDate(selectedTime.date)})
            </h4>

            {room.bookings.length > 0 ? (
              <div className="space-y-0 text-sm relative">
                <div className="absolute top-2 bottom-2 left-[7px] w-px bg-slate-200"></div>
                {room.bookings.map((booking) => (
                  <div
                    key={booking.bookingId}
                    className="relative pl-6 pb-6 last:pb-0"
                  >
                    <div
                      className={`absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm z-10 ${
                        booking.status === "approved"
                          ? "bg-rose-500"
                          : "bg-amber-500"
                      }`}
                    ></div>

                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs font-bold text-slate-500">
                          {booking.startTime.substring(0, 5)} -{" "}
                          {booking.endTime.substring(0, 5)}
                        </span>
                        {booking.status === "pending" && (
                          <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold">
                            Chờ duyệt
                          </span>
                        )}
                      </div>
                      <p className="font-bold text-slate-900 mb-0.5">
                        {booking.meetingTitle}
                      </p>
                      <p className="text-xs text-slate-500">
                        Bởi{" "}
                        <span className="font-medium text-slate-700">
                          {booking.bookedBy}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-2 text-slate-300 shadow-sm">
                  <Calendar size={20} />
                </div>
                <p className="text-slate-500 text-sm font-medium">
                  Không có lịch đặt hôm nay
                </p>
                <p className="text-xs text-slate-400">
                  Hãy là người đầu tiên đặt phòng này!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
          <Button
            onClick={onBook}
            disabled={!isBookable}
            className={`w-full py-4 text-sm font-bold uppercase tracking-wider shadow-lg transition-all rounded-xl flex items-center justify-center gap-2 ${
              isBookable
                ? "bg-teal-600 hover:bg-teal-700 text-white shadow-teal-500/30"
                : "bg-slate-300 shadow-none cursor-not-allowed text-slate-500"
            }`}
          >
            {isBookable ? (
              <>
                Đặt phòng này <ArrowRight size={16} />
              </>
            ) : (
              <>
                <X size={16} /> Không khả dụng
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
