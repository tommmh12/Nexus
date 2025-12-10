// Frontend TypeScript types for Room Booking feature

// ===================== FLOOR PLANS =====================

export interface FloorPlan {
    id: string;
    floor_number: number;
    name: string;
    layout_image?: string;
    width: number;
    height: number;
    is_active: boolean;
    manager_id?: string;
    managerName?: string;
    totalRooms?: number;
    created_at: string;
    updated_at: string;
}

// ===================== MEETING ROOMS =====================

export type RoomType = 'standard' | 'vip' | 'training' | 'conference';
export type RoomStatus = 'active' | 'maintenance' | 'inactive';

export interface MeetingRoom {
    id: string;
    floor_id: string;
    name: string;
    capacity: number;
    room_type: RoomType;
    equipment: string[];
    images: string[];
    status: RoomStatus;
    requires_approval: boolean;
    position_x: number;
    position_y: number;
    description?: string;
    floorNumber?: number;
    floorName?: string;
    created_at: string;
    updated_at: string;
}

// ===================== BOOKINGS =====================

export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';
export type BookingPurpose = 'project_review' | 'brainstorm' | 'training' | 'one_on_one' | 'interview' | 'other';

export interface RoomBooking {
    id: string;
    room_id: string;
    user_id: string;
    userName?: string;
    userAvatar?: string;

    booking_date: string;
    start_time: string;
    end_time: string;

    meeting_title: string;
    purpose: BookingPurpose;
    description?: string;
    is_private: boolean;

    status: BookingStatus;
    approved_by?: string;
    approvedByName?: string;
    approved_at?: string;
    rejection_reason?: string;

    roomName?: string;
    roomCapacity?: number;
    roomType?: RoomType;
    floorNumber?: number;
    floorName?: string;

    participants?: BookingParticipant[];

    created_at: string;
    updated_at: string;
}

export interface BookingParticipant {
    id: string;
    booking_id: string;
    user_id: string;
    userName?: string;
    email?: string;
    userAvatar?: string;
    departmentName?: string;
    response_status: 'pending' | 'accepted' | 'declined';
    invited_at: string;
    responded_at?: string;
}

// ===================== REQUEST/RESPONSE DTOs =====================

export interface CreateFloorRequest {
    floorNumber: number;
    name: string;
    layoutImage?: string;
    width?: number;
    height?: number;
    isActive?: boolean;
    managerId?: string;
}

export interface CreateRoomRequest {
    floorId: string;
    name: string;
    capacity: number;
    roomType?: RoomType;
    equipment?: string[];
    images?: string[];
    status?: RoomStatus;
    requiresApproval?: boolean;
    positionX?: number;
    positionY?: number;
    description?: string;
}

export interface CreateBookingRequest {
    roomId: string;
    bookingDate: string;
    startTime: string;
    endTime: string;
    meetingTitle: string;
    purpose?: BookingPurpose;
    description?: string;
    isPrivate?: boolean;
    participantIds?: string[];
}

// ===================== ROOM AVAILABILITY =====================

export interface RoomAvailabilityInfo {
    roomId: string;
    roomName: string;
    capacity: number;
    roomType: RoomType;
    roomStatus: RoomStatus;
    requiresApproval: boolean;
    positionX: number;
    positionY: number;
    floorId: string;
    floorNumber: number;
    floorName: string;
    bookings: RoomBookingSlot[];
}

export interface RoomBookingSlot {
    bookingId: string;
    meetingTitle: string;
    startTime: string;
    endTime: string;
    status: BookingStatus;
    bookedBy: string;
}

// ===================== DISPLAY STATUS =====================

export type RoomDisplayStatus = 'available' | 'booked' | 'pending' | 'maintenance';

export const getRoomDisplayStatus = (
    room: RoomAvailabilityInfo,
    selectedTime?: { start: string; end: string }
): RoomDisplayStatus => {
    if (room.roomStatus === 'maintenance' || room.roomStatus === 'inactive') {
        return 'maintenance';
    }

    if (!selectedTime || room.bookings.length === 0) {
        return 'available';
    }

    // Check if any booking overlaps with selected time
    const hasOverlap = room.bookings.some(booking => {
        const bookingStart = booking.startTime;
        const bookingEnd = booking.endTime;
        const selStart = selectedTime.start;
        const selEnd = selectedTime.end;

        return (
            (selStart < bookingEnd && selEnd > bookingStart)
        );
    });

    if (!hasOverlap) {
        return 'available';
    }

    // Check status of overlapping booking
    const overlappingBooking = room.bookings.find(booking => {
        const bookingStart = booking.startTime;
        const bookingEnd = booking.endTime;
        const selStart = selectedTime.start;
        const selEnd = selectedTime.end;
        return selStart < bookingEnd && selEnd > bookingStart;
    });

    if (overlappingBooking?.status === 'pending') {
        return 'pending';
    }

    return 'booked';
};

// ===================== STATUS COLORS =====================

export const STATUS_COLORS: Record<RoomDisplayStatus, { bg: string; border: string; text: string }> = {
    available: {
        bg: 'from-emerald-500 to-green-600',
        border: 'border-green-700',
        text: 'text-white',
    },
    booked: {
        bg: 'from-red-500 to-rose-600',
        border: 'border-red-700',
        text: 'text-white',
    },
    pending: {
        bg: 'from-amber-400 to-yellow-500',
        border: 'border-amber-600',
        text: 'text-slate-900',
    },
    maintenance: {
        bg: 'from-gray-400 to-slate-500',
        border: 'border-gray-600',
        text: 'text-white',
    },
};

// ===================== PURPOSE OPTIONS =====================

export const PURPOSE_OPTIONS: { value: BookingPurpose; label: string }[] = [
    { value: 'project_review', label: 'Review dự án' },
    { value: 'brainstorm', label: 'Brainstorm' },
    { value: 'training', label: 'Training' },
    { value: 'one_on_one', label: 'Họp 1:1' },
    { value: 'interview', label: 'Phỏng vấn' },
    { value: 'other', label: 'Khác' },
];

// ===================== ROOM TYPE OPTIONS =====================

export const ROOM_TYPE_OPTIONS: { value: RoomType; label: string }[] = [
    { value: 'standard', label: 'Phòng tiêu chuẩn' },
    { value: 'vip', label: 'Phòng VIP' },
    { value: 'training', label: 'Phòng Training' },
    { value: 'conference', label: 'Phòng hội nghị' },
];

// ===================== EQUIPMENT OPTIONS =====================

export const EQUIPMENT_OPTIONS = [
    'TV',
    'Máy chiếu',
    'Video Conference',
    'Webcam',
    'Loa',
    'Mic',
    'Bảng trắng',
    'Điều hòa',
    'Máy in',
];
