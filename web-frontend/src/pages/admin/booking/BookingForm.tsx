import React, { useState } from "react";
import {
    X,
    Calendar,
    Clock,
    Users,
    FileText,
    Lock,
    Globe,
    Send,
    Loader2,
    CheckCircle2,
    MapPin,
    AlignLeft
} from "lucide-react";
import { Button } from "../../../components/system/ui/Button";
import { Input } from "../../../components/system/ui/Input";
import { bookingService } from "../../../services/bookingService";
import type { RoomAvailabilityInfo, BookingPurpose } from "../../../types/booking.types";
import { PURPOSE_OPTIONS } from "../../../types/booking.types";

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

export const BookingForm: React.FC<BookingFormProps> = ({
    room,
    selectedTime,
    onClose,
    onSuccess,
}) => {
    const [formData, setFormData] = useState({
        meetingTitle: "",
        purpose: "other" as BookingPurpose,
        description: "",
        isPrivate: false,
        participantIds: [] as string[],
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [resultMessage, setResultMessage] = useState<string>("");

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("vi-VN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const result = await bookingService.createBooking({
                roomId: room.roomId,
                bookingDate: selectedTime.date,
                startTime: selectedTime.start,
                endTime: selectedTime.end,
                meetingTitle: formData.meetingTitle,
                purpose: formData.purpose,
                description: formData.description || undefined,
                isPrivate: formData.isPrivate,
                participantIds: formData.participantIds.length > 0 ? formData.participantIds : undefined,
            });

            setResultMessage(result.message);
            setSuccess(true);

            // Auto close after 2 seconds
            setTimeout(() => {
                onSuccess();
            }, 2000);
        } catch (err: any) {
            console.error("Error creating booking:", err);
            setError(err.response?.data?.message || "Có lỗi xảy ra khi đặt phòng");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center animate-scaleIn">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle2 size={32} className="text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Đặt phòng thành công!</h3>
                    <p className="text-slate-600 text-sm mb-6">{resultMessage}</p>
                    <Button onClick={onSuccess} className="w-full">
                        Hoàn tất
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fadeIn p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scaleIn flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 bg-white flex items-center justify-between sticky top-0 z-10">
                    <div>
                        <h3 className="font-bold text-lg text-slate-900">Đặt phòng họp</h3>
                        <p className="text-xs text-slate-500">Điền thông tin chi tiết cuộc họp</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="overflow-y-auto p-6 scrollbar-hide">
                    {/* Room Summary Card */}
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-6 flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center justify-center text-lg font-bold text-brand-600 shrink-0">
                            {room.roomName.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-bold text-slate-900">{room.roomName}</h4>
                                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                        <MapPin size={12} /> {room.floorName} {' • '} <Users size={12} /> {room.capacity} người
                                    </p>
                                </div>
                                {room.requiresApproval && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full border border-amber-200 shrink-0">
                                        Cần duyệt
                                    </span>
                                )}
                            </div>

                            <div className="mt-3 grid grid-cols-2 gap-2">
                                <div className="bg-white px-3 py-2 rounded border border-slate-200 text-xs">
                                    <span className="text-slate-400 block mb-0.5">Ngày</span>
                                    <span className="font-semibold text-slate-700">{formatDate(selectedTime.date)}</span>
                                </div>
                                <div className="bg-white px-3 py-2 rounded border border-slate-200 text-xs">
                                    <span className="text-slate-400 block mb-0.5">Thời gian</span>
                                    <span className="font-semibold text-slate-700 text-brand-600">
                                        {selectedTime.start} - {selectedTime.end}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form Fields */}
                    <form id="booking-form" onSubmit={handleSubmit} className="space-y-5">
                        <Input
                            label="Tên cuộc họp"
                            value={formData.meetingTitle}
                            onChange={(e) => setFormData({ ...formData, meetingTitle: e.target.value })}
                            placeholder="Nhập tên cuộc họp..."
                            required
                            className="bg-white"
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                    Mục đích
                                </label>
                                <div className="relative">
                                    <select
                                        value={formData.purpose}
                                        onChange={(e) =>
                                            setFormData({ ...formData, purpose: e.target.value as BookingPurpose })
                                        }
                                        className="w-full bg-white border border-slate-200 rounded-lg pl-3 pr-8 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none appearance-none cursor-pointer hover:border-slate-300 transition-colors"
                                    >
                                        {PURPOSE_OPTIONS.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                    Tính riêng tư
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, isPrivate: !formData.isPrivate })}
                                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all ${formData.isPrivate
                                            ? "bg-slate-50 border-slate-200 hover:bg-slate-100"
                                            : "bg-white border-slate-200 hover:border-green-300"
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        {formData.isPrivate ? (
                                            <Lock size={16} className="text-slate-500" />
                                        ) : (
                                            <Globe size={16} className="text-green-500" />
                                        )}
                                        <span className={`text-sm ${formData.isPrivate ? 'text-slate-600' : 'text-slate-900 font-medium'}`}>
                                            {formData.isPrivate ? "Riêng tư" : "Công khai"}
                                        </span>
                                    </div>
                                    <div className={`w-8 h-4 rounded-full relative transition-colors ${formData.isPrivate ? 'bg-slate-300' : 'bg-green-500'}`}>
                                        <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${formData.isPrivate ? 'translate-x-4' : 'translate-x-0'}`} />
                                    </div>
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
                                <AlignLeft size={16} className="text-slate-400" />
                                Mô tả / Ghi chú
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Thêm nội dung chi tiết, agenda cuộc họp..."
                                rows={3}
                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none resize-none placeholder:text-slate-400 hover:border-slate-300 transition-colors"
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600 flex items-start gap-2 animate-shake">
                                <div className="mt-0.5"><XCircle size={14} /></div>
                                {error}
                            </div>
                        )}
                    </form>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3 sticky bottom-0">
                    <Button variant="outline" onClick={onClose} disabled={loading} className="border-slate-200 hover:bg-white text-slate-600">
                        Hủy bỏ
                    </Button>
                    <Button
                        type="submit"
                        form="booking-form"
                        disabled={loading || !formData.meetingTitle}
                        className="bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-200 px-6"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={18} className="animate-spin mr-2" />
                                Đang xử lý...
                            </>
                        ) : (
                            <>
                                <Send size={18} className="mr-2" />
                                Xác nhận đặt phòng
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};

// Helper Icon
const XCircle = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
);
