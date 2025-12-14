
export interface FloorPlan {
  id: string;
  name: string;
}

export interface RoomBooking {
  id: string;
  room_id: string;
  roomName: string;
  meeting_title: string;
  meetingTitle?: string;
  bookedBy: string;
  start_time: string;
  startTime: string;
  end_time: string;
  endTime: string;
  booking_date: string;
  status: 'approved' | 'pending' | 'rejected';
}

export interface RoomAvailabilityInfo {
  roomId: string;
  roomName: string;
  floorId: string;
  floorName: string;
  capacity: number;
  roomType: string;
  equipment: string[];
  bookings: RoomBooking[];
}

export type RoomDisplayStatus = 'available' | 'booked' | 'pending' | 'maintenance';

export const getRoomDisplayStatus = (room: RoomAvailabilityInfo, timeSlot: { start: string, end: string }): RoomDisplayStatus => {
  // Simple logic stub: if any booking overlaps with timeSlot, it's booked.
  // In a real app, this would compare time ranges.
  if (room.bookings && room.bookings.length > 0) return 'booked';
  return 'available';
};
