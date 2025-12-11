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
    AlignLeft,
    Briefcase,
    AlertCircle
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

    // --- Helpers ---
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("vi-VN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    // --- Handlers ---
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
            setError(err.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    // --- Render: Success State ---
    if (success) {
        return (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center animate-scaleIn border border-white/20">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-50 flex items-center justify-center ring-8 ring-emerald-50/50">
                        <CheckCircle2 size={40} className="text-emerald-500" strokeWidth={3} />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Booking Confirmed!</h3>
                    <p className="text-slate-600 text-sm mb-8 leading-relaxed">
                        {resultMessage || "Your room has been successfully booked. An invitation has been sent to all participants."}
                    </p>
                    <Button onClick={onSuccess} className="w-full bg-slate-900 text-white hover:bg-slate-800 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all">
                        Close
                    </Button>
                </div>
            </div>
        );
    }

    // --- Render: Form ---
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-fadeIn p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-scaleIn flex flex-col md:flex-row min-h-[500px]">

                {/* Visual Sidebar (Left) */}
                <div className="hidden md:flex md:w-1/3 bg-slate-900 text-white p-6 flex-col relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500 rounded-full blur-3xl opacity-20 -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500 rounded-full blur-3xl opacity-20 -ml-16 -mb-16"></div>

                    <div className="relative z-10">
                        <h3 className="text-xl font-bold mb-1">Booking Summary</h3>
                        <p className="text-slate-400 text-xs mb-8">Please review your booking details</p>

                        <div className="space-y-6">
                            <div>
                                <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">Room</p>
                                <div className="flex items-center gap-2">
                                    <MapPin size={16} className="text-brand-400" />
                                    <span className="font-semibold text-lg">{room.roomName}</span>
                                </div>
                                <p className="text-slate-400 text-xs mt-1 pl-6">{room.floorName}</p>
                            </div>

                            <div>
                                <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">Date</p>
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} className="text-brand-400" />
                                    <span className="font-medium text-sm">{formatDate(selectedTime.date)}</span>
                                </div>
                            </div>

                            <div>
                                <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">Time</p>
                                <div className="flex items-center gap-2">
                                    <Clock size={16} className="text-brand-400" />
                                    <span className="font-medium text-sm">{selectedTime.start} - {selectedTime.end}</span>
                                </div>
                            </div>

                            <div>
                                <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">Capacity</p>
                                <div className="flex items-center gap-2">
                                    <Users size={16} className="text-brand-400" />
                                    <span className="font-medium text-sm">Up to {room.capacity} people</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto relative z-10 pt-8">
                        {room.requiresApproval && (
                            <div className="bg-amber-900/30 border border-amber-700/50 rounded-lg p-3 flex gap-2">
                                <AlertCircle size={16} className="text-amber-500 shrink-0" />
                                <p className="text-xs text-amber-200">This room requires admin approval before confirmation.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Form (Right) */}
                <div className="flex-1 flex flex-col h-full bg-white">
                    {/* Header */}
                    <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">Book Meeting</h3>
                            <p className="text-xs text-slate-500 mt-1">Fill in the details for your reservation</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
                        <form id="booking-form" onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5 ">
                                        Meeting Title <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                            <Briefcase size={16} />
                                        </div>
                                        <input
                                            type="text"
                                            value={formData.meetingTitle}
                                            onChange={(e) => setFormData({ ...formData, meetingTitle: e.target.value })}
                                            placeholder="Eg. Weekly Sync..."
                                            required
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all placeholder:text-slate-400"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                            Purpose
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={formData.purpose}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, purpose: e.target.value as BookingPurpose })
                                                }
                                                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-8 py-2.5 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none appearance-none cursor-pointer transition-all"
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
                                            Visibility
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, isPrivate: !formData.isPrivate })}
                                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all ${formData.isPrivate
                                                ? "bg-slate-50 border-slate-200 text-slate-600"
                                                : "bg-emerald-50 border-emerald-200 text-emerald-700"
                                                }`}
                                        >
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                {formData.isPrivate ? (
                                                    <Lock size={14} className="shrink-0" />
                                                ) : (
                                                    <Globe size={14} className="shrink-0" />
                                                )}
                                                <span className="text-sm font-medium truncate">
                                                    {formData.isPrivate ? "Private" : "Public"}
                                                </span>
                                            </div>
                                            <div className={`w-8 h-4 rounded-full relative transition-colors shrink-0 ${formData.isPrivate ? 'bg-slate-300' : 'bg-emerald-500'}`}>
                                                <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${formData.isPrivate ? 'translate-x-4' : 'translate-x-0'}`} />
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Add agenda or details..."
                                        rows={4}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none resize-none placeholder:text-slate-400 transition-all"
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600 flex items-start gap-2 animate-shake">
                                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}
                        </form>
                    </div>

                    <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
                        <Button variant="outline" onClick={onClose} disabled={loading} className="border-slate-200 hover:bg-white text-slate-600 px-6">
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            form="booking-form"
                            disabled={loading || !formData.meetingTitle}
                            className="bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-500/30 px-8 rounded-lg"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin mr-2" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Send size={18} className="mr-2" />
                                    Confirm Booking
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
