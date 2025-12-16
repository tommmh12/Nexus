import { useState, useEffect, useCallback } from 'react';
import { floorService, roomService, bookingService } from '../services/bookingService';
import type { FloorPlan, RoomAvailabilityInfo, RoomBooking } from '../types/booking.types';

interface UseBookingReturn {
  floors: FloorPlan[];
  rooms: RoomAvailabilityInfo[];
  myBookings: RoomBooking[];
  loading: {
    floors: boolean;
    rooms: boolean;
    bookings: boolean;
  };
  error: string | null;
  selectedFloorId: string;
  selectedDate: string;
  setSelectedFloorId: (id: string) => void;
  setSelectedDate: (date: string) => void;
  refetch: () => void;
  createBooking: (data: any) => Promise<void>;
  cancelBooking: (id: string) => Promise<void>;
}

export const useBooking = (): UseBookingReturn => {
  const [floors, setFloors] = useState<FloorPlan[]>([]);
  const [rooms, setRooms] = useState<RoomAvailabilityInfo[]>([]);
  const [myBookings, setMyBookings] = useState<RoomBooking[]>([]);
  const [loading, setLoading] = useState({
    floors: true,
    rooms: true,
    bookings: true,
  });
  const [error, setError] = useState<string | null>(null);
  const [selectedFloorId, setSelectedFloorId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Fetch floors
  const fetchFloors = useCallback(async () => {
    setLoading((prev) => ({ ...prev, floors: true }));
    try {
      const data = await floorService.getFloors();
      setFloors(data || []);
      if (data && data.length > 0 && !selectedFloorId) {
        setSelectedFloorId(data[0].id);
      }
    } catch (err: any) {
      console.error('Error fetching floors:', err);
      setError(err.response?.data?.message || 'Không thể tải danh sách tầng');
    } finally {
      setLoading((prev) => ({ ...prev, floors: false }));
    }
  }, [selectedFloorId]);

  // Fetch rooms availability
  const fetchRooms = useCallback(async () => {
    if (!selectedDate) return;
    
    setLoading((prev) => ({ ...prev, rooms: true }));
    try {
      const data = await roomService.getRoomAvailability(selectedDate, selectedFloorId || undefined);
      setRooms(data || []);
    } catch (err: any) {
      console.error('Error fetching rooms:', err);
      // Don't set error for rooms, just show empty
    } finally {
      setLoading((prev) => ({ ...prev, rooms: false }));
    }
  }, [selectedDate, selectedFloorId]);

  // Fetch my bookings
  const fetchMyBookings = useCallback(async () => {
    setLoading((prev) => ({ ...prev, bookings: true }));
    try {
      const data = await bookingService.getBookings();
      setMyBookings(data || []);
    } catch (err: any) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading((prev) => ({ ...prev, bookings: false }));
    }
  }, []);

  // Create booking
  const createBooking = useCallback(async (data: any) => {
    try {
      await bookingService.createBooking(data);
      await fetchRooms();
      await fetchMyBookings();
    } catch (err: any) {
      console.error('Error creating booking:', err);
      throw err;
    }
  }, [fetchRooms, fetchMyBookings]);

  // Cancel booking
  const cancelBooking = useCallback(async (id: string) => {
    try {
      await bookingService.cancelBooking(id);
      await fetchMyBookings();
    } catch (err: any) {
      console.error('Error canceling booking:', err);
      throw err;
    }
  }, [fetchMyBookings]);

  // Refetch all
  const refetch = useCallback(() => {
    fetchFloors();
    fetchRooms();
    fetchMyBookings();
  }, [fetchFloors, fetchRooms, fetchMyBookings]);

  useEffect(() => {
    fetchFloors();
    fetchMyBookings();
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [selectedDate, selectedFloorId]);

  return {
    floors,
    rooms,
    myBookings,
    loading,
    error,
    selectedFloorId,
    selectedDate,
    setSelectedFloorId,
    setSelectedDate,
    refetch,
    createBooking,
    cancelBooking,
  };
};
