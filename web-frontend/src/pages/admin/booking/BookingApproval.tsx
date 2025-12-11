import React, { useState, useEffect } from "react";
import {
    ClipboardCheck,
    Clock,
    Calendar,
    MapPin,
    Users,
    CheckCircle2,
    XCircle,
    Eye,
    MessageSquare,
    AlertTriangle,
    Loader2,
    Search,
    Filter,
    RefreshCw,
    MoreHorizontal,
    ArrowRight,
    Briefcase,
    ChevronDown
} from "lucide-react";
import { Button } from "../../../components/system/ui/Button";
import { bookingService } from "../../../services/bookingService";
import type { RoomBooking } from "../../../types/booking.types";

export const BookingApproval = () => {
    // --- State ---
    const [pendingBookings, setPendingBookings] = useState<RoomBooking[]>([]);
    const [allBookings, setAllBookings] = useState<RoomBooking[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"pending" | "all">("pending");
    const [selectedBooking, setSelectedBooking] = useState<RoomBooking | null>(null);
    const [rejectReason, setRejectReason] = useState("");
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    // --- Effects ---
    useEffect(() => {
        loadBookings();
    }, []);

    // --- Actions ---
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

    // --- Helpers ---
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("vi-VN", {
            weekday: "short",
            day: "numeric",
            month: "numeric",
            year: "numeric",
        });
    };

    const getStatusTheme = (status: string) => {
        switch (status) {
            case "approved":
                return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: <CheckCircle2 size={14} /> };
            case "pending":
                return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: <Clock size={14} /> };
            case "rejected":
                return { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", icon: <XCircle size={14} /> };
            case "cancelled":
                return { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200", icon: <XCircle size={14} /> };
            default:
                return { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200", icon: <Clock size={14} /> };
        }
    };

    const displayBookings = activeTab === "pending" ? pendingBookings : allBookings;
    const filteredBookings = displayBookings.filter(
        (b) =>
            b.meeting_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.roomName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.userName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // --- Render ---
    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-10 w-10 border-2 border-brand-600 border-t-transparent"></div>
                    <p className="text-slate-500 font-medium text-sm animate-pulse">Loading requests...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fadeIn min-h-screen bg-slate-50/50 pb-10">
            {/* --- Hero Header --- */}
            <div className="bg-white border-b border-slate-200 -mx-6 px-8 py-6 mb-8 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 max-w-7xl mx-auto">
                    <div>
                        <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                            <span className="hover:text-brand-600 cursor-pointer transition-colors">Admin</span>
                            <span className="text-slate-300">/</span>
                            <span className="text-slate-900 font-medium">Booking Requests</span>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                            <ClipboardCheck className="text-brand-600" strokeWidth={2.5} size={28} />
                            Request Management
                        </h2>
                        <p className="text-slate-500 mt-1">Review and manage workspace booking requests efficiently.</p>
                    </div>

                    <Button variant="outline" onClick={loadBookings} className="bg-white hover:bg-slate-50 border-slate-200 shadow-sm">
                        <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6">

                {/* --- Quick Stats --- */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: "Pending Review", value: pendingBookings.length, icon: Clock, color: "text-amber-600", bg: "bg-amber-100" },
                        { label: "Approved Today", value: allBookings.filter((b) => b.status === "approved").length, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-100" },
                        { label: "Rejected Today", value: allBookings.filter((b) => b.status === "rejected").length, icon: XCircle, color: "text-rose-600", bg: "bg-rose-100" },
                        { label: "Total Requests", value: allBookings.length, icon: Briefcase, color: "text-brand-600", bg: "bg-brand-100" }
                    ].map((stat, idx) => (
                        <div key={idx} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
                                    <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                                </div>
                                <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center ${stat.color}`}>
                                    <stat.icon size={20} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* --- Filter & List --- */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    {/* Control Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border-b border-slate-200 bg-slate-50/50">
                        <div className="flex bg-slate-200/50 p-1 rounded-lg self-start">
                            {[
                                { id: "pending", label: `Pending (${pendingBookings.length})` },
                                { id: "all", label: `All History (${allBookings.length})` }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${activeTab === tab.id
                                            ? "bg-white text-brand-700 shadow-sm ring-1 ring-slate-200"
                                            : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="relative w-full sm:w-72">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by title, room or user..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Request List */}
                    <div className="divide-y divide-slate-100">
                        {filteredBookings.length === 0 ? (
                            <div className="p-16 text-center">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                    <ClipboardCheck size={40} className="text-slate-300" />
                                </div>
                                <h3 className="text-slate-900 font-bold text-lg mb-1">No requests found</h3>
                                <p className="text-slate-500 text-sm">
                                    {activeTab === "pending"
                                        ? "You're all caught up! No pending requests."
                                        : "No booking history found matching your search."}
                                </p>
                            </div>
                        ) : (
                            filteredBookings.map((booking) => {
                                const theme = getStatusTheme(booking.status);
                                return (
                                    <div key={booking.id} className="group p-5 hover:bg-slate-50 transition-colors">
                                        <div className="flex flex-col md:flex-row md:items-start gap-5">
                                            {/* Status Icon */}
                                            <div className="hidden md:flex flex-col items-center gap-2 shrink-0 pt-1">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${theme.bg} ${theme.border} ${theme.text}`}>
                                                    {theme.icon}
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <h4 className="font-bold text-slate-900 text-lg group-hover:text-brand-600 transition-colors truncate pr-4">
                                                        {booking.meeting_title}
                                                    </h4>
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${theme.bg} ${theme.text} ${theme.border}`}>
                                                        {booking.status}
                                                    </span>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-sm text-slate-600 mb-3">
                                                    <span className="flex items-center gap-1.5 bg-white px-2 py-1 rounded border border-slate-200 shadow-sm">
                                                        <MapPin size={14} className="text-slate-400" />
                                                        <span className="font-medium">{booking.roomName}</span>
                                                        <span className="text-slate-300">|</span>
                                                        <span className="text-slate-500">{booking.floorName}</span>
                                                    </span>
                                                    <span className="flex items-center gap-1.5 bg-white px-2 py-1 rounded border border-slate-200 shadow-sm">
                                                        <Calendar size={14} className="text-slate-400" />
                                                        <span className="font-medium">{formatDate(booking.booking_date)}</span>
                                                    </span>
                                                    <span className="flex items-center gap-1.5 bg-white px-2 py-1 rounded border border-slate-200 shadow-sm">
                                                        <Clock size={14} className="text-slate-400" />
                                                        <span className="font-medium">{booking.start_time} - {booking.end_time}</span>
                                                    </span>
                                                    <span className="flex items-center gap-1.5 text-slate-500">
                                                        <Users size={14} />
                                                        Requested by <span className="font-semibold text-slate-900">{booking.userName || "Unknown"}</span>
                                                    </span>
                                                </div>

                                                {booking.description && (
                                                    <div className="flex gap-2">
                                                        <MessageSquare size={14} className="text-slate-400 mt-1 shrink-0" />
                                                        <p className="text-sm text-slate-600 line-clamp-2 italic bg-slate-50 p-2 rounded-lg border border-slate-100 w-full md:w-fit">
                                                            "{booking.description}"
                                                        </p>
                                                    </div>
                                                )}

                                                {booking.rejection_reason && (
                                                    <div className="mt-3 flex items-start gap-2 bg-red-50 text-red-700 text-sm p-3 rounded-lg border border-red-100">
                                                        <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                                                        <div>
                                                            <span className="font-bold block text-xs uppercase tracking-wide mb-1">Rejection Reason:</span>
                                                            {booking.rejection_reason}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            {booking.status === "pending" && (
                                                <div className="flex md:flex-col gap-2 shrink-0 mt-4 md:mt-0">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleApprove(booking.id)}
                                                        disabled={actionLoading === booking.id}
                                                        className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-200 w-full md:w-32 justify-center"
                                                    >
                                                        {actionLoading === booking.id ? (
                                                            <Loader2 size={16} className="animate-spin mr-2" />
                                                        ) : (
                                                            <CheckCircle2 size={16} className="mr-2" />
                                                        )}
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => openRejectModal(booking)}
                                                        disabled={actionLoading === booking.id}
                                                        className="text-slate-600 border-slate-300 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 w-full md:w-32 justify-center"
                                                    >
                                                        <XCircle size={16} className="mr-2" />
                                                        Reject
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* --- Reject Modal --- */}
            {showRejectModal && selectedBooking && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fadeIn p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-0 overflow-hidden animate-scaleIn">
                        <div className="bg-rose-50 px-6 py-4 border-b border-rose-100 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                                <AlertTriangle size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-rose-950">Reject Request</h3>
                                <p className="text-xs text-rose-700 font-medium">This action cannot be undone.</p>
                            </div>
                        </div>

                        <div className="p-6">
                            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                                You are about to reject the booking <strong>"{selectedBooking.meeting_title}"</strong> by <span className="font-semibold text-slate-900">{selectedBooking.userName}</span>.
                            </p>

                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-700">
                                    Reason for Rejection <span className="text-rose-500">*</span>
                                </label>
                                <textarea
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder="Please provide a valid reason for the user..."
                                    rows={4}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none resize-none transition-all placeholder:text-slate-400"
                                />
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end gap-3">
                            <Button variant="outline" onClick={() => setShowRejectModal(false)} className="border-slate-200 hover:bg-white text-slate-600">
                                Cancel
                            </Button>
                            <Button
                                onClick={handleReject}
                                disabled={actionLoading !== null || !rejectReason.trim()}
                                className="bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-200"
                            >
                                {actionLoading ? (
                                    <Loader2 size={16} className="animate-spin mr-2" />
                                ) : (
                                    <XCircle size={16} className="mr-2" />
                                )}
                                Confirm Rejection
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingApproval;
