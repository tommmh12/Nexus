import React, { useState, useEffect } from "react";
import {
    ClipboardCheck,
    Clock,
    Calendar,
    MapPin,
    Users,
    CheckCircle,
    XCircle,
    Eye,
    MessageSquare,
    AlertTriangle,
    Loader2,
    Search,
    Filter,
    RefreshCw,
} from "lucide-react";
import { Button } from "../../../components/system/ui/Button";
import { bookingService } from "../../../services/bookingService";
import type { RoomBooking } from "../../../types/booking.types";

export const BookingApproval = () => {
    const [pendingBookings, setPendingBookings] = useState<RoomBooking[]>([]);
    const [allBookings, setAllBookings] = useState<RoomBooking[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"pending" | "all">("pending");
    const [selectedBooking, setSelectedBooking] = useState<RoomBooking | null>(null);
    const [rejectReason, setRejectReason] = useState("");
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
        setLoading(true);
        try {
            const [pending, all] = await Promise.all([
                bookingService.getPendingBookings(),
                bookingService.getBookings({ all: true }),
            ]);
            setPendingBookings(pending);
            setAllBookings(all);
        } catch (error) {
            console.error("Error loading bookings:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (bookingId: string) => {
        setActionLoading(bookingId);
        try {
            await bookingService.approveBooking(bookingId);
            await loadBookings();
        } catch (error) {
            console.error("Error approving booking:", error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async () => {
        if (!selectedBooking) return;

        setActionLoading(selectedBooking.id);
        try {
            await bookingService.rejectBooking(selectedBooking.id, rejectReason);
            setShowRejectModal(false);
            setSelectedBooking(null);
            setRejectReason("");
            await loadBookings();
        } catch (error) {
            console.error("Error rejecting booking:", error);
        } finally {
            setActionLoading(null);
        }
    };

    const openRejectModal = (booking: RoomBooking) => {
        setSelectedBooking(booking);
        setShowRejectModal(true);
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("vi-VN", {
            weekday: "short",
            day: "numeric",
            month: "numeric",
            year: "numeric",
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "approved":
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        <CheckCircle size={12} />
                        Đã duyệt
                    </span>
                );
            case "pending":
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                        <Clock size={12} />
                        Chờ duyệt
                    </span>
                );
            case "rejected":
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                        <XCircle size={12} />
                        Từ chối
                    </span>
                );
            case "cancelled":
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                        <XCircle size={12} />
                        Đã hủy
                    </span>
                );
            default:
                return null;
        }
    };

    const displayBookings = activeTab === "pending" ? pendingBookings : allBookings;
    const filteredBookings = displayBookings.filter(
        (b) =>
            b.meeting_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.roomName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.userName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
            </div>
        );
    }

    return (
        <div className="animate-fadeIn">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <ClipboardCheck className="text-brand-600" />
                        Quản lý Đặt phòng
                    </h2>
                    <p className="text-slate-500 mt-1">
                        Phê duyệt và quản lý các yêu cầu đặt phòng họp
                    </p>
                </div>
                <Button variant="outline" onClick={loadBookings}>
                    <RefreshCw size={16} />
                    Làm mới
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                            <Clock size={20} className="text-amber-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">{pendingBookings.length}</p>
                            <p className="text-sm text-slate-500">Chờ duyệt</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                            <CheckCircle size={20} className="text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">
                                {allBookings.filter((b) => b.status === "approved").length}
                            </p>
                            <p className="text-sm text-slate-500">Đã duyệt</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                            <XCircle size={20} className="text-red-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">
                                {allBookings.filter((b) => b.status === "rejected").length}
                            </p>
                            <p className="text-sm text-slate-500">Từ chối</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <Calendar size={20} className="text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">{allBookings.length}</p>
                            <p className="text-sm text-slate-500">Tổng cộng</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs & Search */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-200 px-4">
                    <div className="flex">
                        <button
                            onClick={() => setActiveTab("pending")}
                            className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === "pending"
                                    ? "border-brand-600 text-brand-600"
                                    : "border-transparent text-slate-500 hover:text-slate-700"
                                }`}
                        >
                            Chờ duyệt ({pendingBookings.length})
                        </button>
                        <button
                            onClick={() => setActiveTab("all")}
                            className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === "all"
                                    ? "border-brand-600 text-brand-600"
                                    : "border-transparent text-slate-500 hover:text-slate-700"
                                }`}
                        >
                            Tất cả ({allBookings.length})
                        </button>
                    </div>
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                        />
                    </div>
                </div>

                {/* Booking List */}
                <div className="divide-y divide-slate-100">
                    {filteredBookings.length === 0 ? (
                        <div className="p-12 text-center text-slate-400">
                            <ClipboardCheck size={48} className="mx-auto mb-3 opacity-50" />
                            <p>
                                {activeTab === "pending"
                                    ? "Không có yêu cầu nào đang chờ duyệt"
                                    : "Chưa có đặt phòng nào"}
                            </p>
                        </div>
                    ) : (
                        filteredBookings.map((booking) => (
                            <div
                                key={booking.id}
                                className="p-4 hover:bg-slate-50 transition-colors"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-medium text-slate-900">{booking.meeting_title}</h4>
                                            {getStatusBadge(booking.status)}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                                            <span className="flex items-center gap-1">
                                                <MapPin size={14} />
                                                {booking.roomName} · {booking.floorName}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar size={14} />
                                                {formatDate(booking.booking_date)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock size={14} />
                                                {booking.start_time} - {booking.end_time}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Users size={14} />
                                                {booking.userName}
                                            </span>
                                        </div>
                                        {booking.description && (
                                            <p className="mt-2 text-sm text-slate-600 line-clamp-1">
                                                {booking.description}
                                            </p>
                                        )}
                                        {booking.rejection_reason && (
                                            <div className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                                <AlertTriangle size={14} />
                                                Lý do từ chối: {booking.rejection_reason}
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    {booking.status === "pending" && (
                                        <div className="flex items-center gap-2">
                                            <Button
                                                size="sm"
                                                onClick={() => handleApprove(booking.id)}
                                                disabled={actionLoading === booking.id}
                                            >
                                                {actionLoading === booking.id ? (
                                                    <Loader2 size={14} className="animate-spin" />
                                                ) : (
                                                    <CheckCircle size={14} />
                                                )}
                                                Duyệt
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => openRejectModal(booking)}
                                                disabled={actionLoading === booking.id}
                                                className="text-red-600 border-red-200 hover:bg-red-50"
                                            >
                                                <XCircle size={14} />
                                                Từ chối
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Reject Modal */}
            {showRejectModal && selectedBooking && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-slideIn">
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Từ chối đặt phòng</h3>
                        <p className="text-sm text-slate-500 mb-4">
                            Bạn đang từ chối yêu cầu đặt phòng "{selectedBooking.meeting_title}" của{" "}
                            {selectedBooking.userName}
                        </p>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                Lý do từ chối (tùy chọn)
                            </label>
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Nhập lý do từ chối..."
                                rows={3}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none resize-none"
                            />
                        </div>

                        <div className="flex items-center justify-end gap-3">
                            <Button variant="outline" onClick={() => setShowRejectModal(false)}>
                                Hủy
                            </Button>
                            <Button
                                onClick={handleReject}
                                disabled={actionLoading !== null}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                {actionLoading ? (
                                    <Loader2 size={16} className="animate-spin mr-2" />
                                ) : (
                                    <XCircle size={16} className="mr-2" />
                                )}
                                Xác nhận từ chối
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingApproval;
