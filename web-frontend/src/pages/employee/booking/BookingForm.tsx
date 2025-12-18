import React, { useState } from "react";
import {
  X,
  Building2,
  Clock,
  Users,
  Presentation,
  Eye,
  EyeOff,
  Send,
  CalendarCheck,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "../../../components/ui/Button";
import type { RoomAvailabilityInfo } from "../../../types/booking.types";
import {
  bookingService,
  CreateBookingRequest,
} from "../../../services/bookingService";

interface BookingFormProps {
  room: RoomAvailabilityInfo;
  selectedTime: {
    date: string;
    start: string;
    end: string;
  };
  onClose: () => void;
  onSuccess: () => void;
}

interface BookingFormData {
  meetingTitle: string;
  purpose: string;
  isPrivate: boolean;
  notes?: string;
}

export const BookingForm: React.FC<BookingFormProps> = ({
  room,
  selectedTime,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<BookingFormData>({
    meetingTitle: "",
    purpose: "",
    isPrivate: false,
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<BookingFormData>>({});

  const validate = (): boolean => {
    const newErrors: Partial<BookingFormData> = {};

    if (!formData.meetingTitle.trim()) {
      newErrors.meetingTitle = "Vui lòng nhập tên cuộc họp";
    } else if (formData.meetingTitle.length > 100) {
      newErrors.meetingTitle = "Tên cuộc họp không được quá 100 ký tự";
    }

    if (!formData.purpose.trim()) {
      newErrors.purpose = "Vui lòng chọn mục đích";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const bookingData: CreateBookingRequest = {
        roomId: room.roomId,
        bookingDate: selectedTime.date,
        startTime: selectedTime.start,
        endTime: selectedTime.end,
        meetingTitle: formData.meetingTitle,
        purpose: formData.purpose,
        visibility: formData.isPrivate ? "private" : "public",
        description: formData.notes,
      };

      await bookingService.createBooking(bookingData);
      alert("Đã gửi yêu cầu đặt phòng thành công!");
      onSuccess();
    } catch (error: any) {
      alert(error.message || "Có lỗi xảy ra khi đặt phòng");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTimeRange = (start: string, end: string) => {
    return `${start.substring(0, 5)} - ${end.substring(0, 5)}`;
  };

  const PURPOSES = [
    { value: "meeting", label: "Họp nội bộ", icon: "👥" },
    { value: "training", label: "Đào tạo", icon: "📚" },
    { value: "interview", label: "Phỏng vấn", icon: "🎯" },
    { value: "presentation", label: "Thuyết trình", icon: "📊" },
    { value: "workshop", label: "Workshop", icon: "🛠️" },
    { value: "other", label: "Khác", icon: "📌" },
  ];

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fadeIn p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden animate-scaleIn flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
              <CalendarCheck size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold">Đặt phòng họp</h2>
              <p className="text-teal-100 text-xs">
                Điền thông tin để hoàn tất yêu cầu
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Two-column layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel - Summary */}
          <div className="w-1/3 bg-slate-900 text-white p-6 hidden sm:flex flex-col">
            <div className="flex-1">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">
                Tóm tắt đặt phòng
              </h3>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                    <Building2 size={12} /> Phòng họp
                  </div>
                  <p className="text-lg font-bold">{room.roomName}</p>
                  <p className="text-xs text-slate-500">{room.floorName}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                    <CalendarCheck size={12} /> Ngày
                  </div>
                  <p className="text-sm font-medium">
                    {formatDate(selectedTime.date)}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                    <Clock size={12} /> Thời gian
                  </div>
                  <p className="text-xl font-bold font-mono">
                    {formatTimeRange(selectedTime.start, selectedTime.end)}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                    <Users size={12} /> Sức chứa
                  </div>
                  <p className="text-sm font-medium">{room.capacity} người</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                    <Presentation size={12} /> Thiết bị
                  </div>
                  <p className="text-sm font-medium">
                    {room.equipment?.join(", ") || "Cơ bản"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-700">
              <div className="flex items-start gap-2">
                <AlertCircle
                  size={14}
                  className="text-amber-400 shrink-0 mt-0.5"
                />
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Yêu cầu đặt phòng sẽ được gửi đến Admin để phê duyệt. Bạn sẽ
                  nhận được thông báo khi có kết quả.
                </p>
              </div>
            </div>
          </div>

          {/* Right Panel - Form */}
          <div className="flex-1 p-6 overflow-y-auto bg-slate-50">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Meeting Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                  Tên cuộc họp <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.meetingTitle}
                  onChange={(e) =>
                    setFormData({ ...formData, meetingTitle: e.target.value })
                  }
                  placeholder="VD: Họp planning sprint 24"
                  className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition ${
                    errors.meetingTitle
                      ? "border-rose-300 bg-rose-50"
                      : "border-slate-200 bg-white"
                  }`}
                />
                {errors.meetingTitle && (
                  <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.meetingTitle}
                  </p>
                )}
              </div>

              {/* Purpose */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                  Mục đích <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {PURPOSES.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, purpose: p.value })
                      }
                      className={`p-3 rounded-xl text-center transition-all text-xs font-medium border ${
                        formData.purpose === p.value
                          ? "bg-teal-50 border-teal-300 text-teal-700 ring-2 ring-teal-500/20"
                          : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      <span className="text-lg block mb-1">{p.icon}</span>
                      {p.label}
                    </button>
                  ))}
                </div>
                {errors.purpose && (
                  <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.purpose}
                  </p>
                )}
              </div>

              {/* Visibility Toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white">
                <div className="flex items-center gap-3">
                  {formData.isPrivate ? (
                    <EyeOff size={18} className="text-slate-400" />
                  ) : (
                    <Eye size={18} className="text-teal-500" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {formData.isPrivate
                        ? "Cuộc họp riêng tư"
                        : "Hiển thị công khai"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formData.isPrivate
                        ? "Chỉ người tham gia mới thấy chi tiết"
                        : "Mọi người có thể xem lịch này"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, isPrivate: !formData.isPrivate })
                  }
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    formData.isPrivate ? "bg-slate-400" : "bg-teal-500"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      formData.isPrivate ? "left-1" : "left-7"
                    }`}
                  />
                </button>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                  Ghi chú thêm
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="VD: Cần chuẩn bị máy chiếu, có khách..."
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-teal-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Đang gửi yêu cầu...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Gửi yêu cầu đặt phòng
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
