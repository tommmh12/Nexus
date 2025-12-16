import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  LayoutGrid,
  List,
  RefreshCw,
  AlertCircle,
  Check,
  Search,
  ArrowRight
} from 'lucide-react';
import { useBooking } from '../../../hooks/useBooking';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';

// --- Configuration ---
const THEME = {
  bg: "bg-[#F8FAFC]",
  card: "bg-white rounded-[24px] shadow-sm hover:shadow-md transition-all border-0",
  textPrimary: "text-slate-900",
  textSecondary: "text-slate-500",
  accent: "text-teal-600",
  buttonPrimary: "bg-slate-900 text-white hover:bg-slate-800 rounded-xl",
  buttonGhost: "bg-transparent text-slate-500 hover:bg-slate-100 rounded-xl"
};

type ViewMode = 'grid' | 'list';
type RoomStatus = 'available' | 'booked' | 'pending';

interface TimeSlot {
  hour: number;
  minute: number;
}

export const BookingModule: React.FC = () => {
  const {
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
  } = useBooking();

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [startTime, setStartTime] = useState<TimeSlot>({ hour: 9, minute: 0 });
  const [endTime, setEndTime] = useState<TimeSlot>({ hour: 10, minute: 0 });
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingTitle, setBookingTitle] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  const formatTime = (hour: number, minute: number = 0): string => `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' });

  const getRoomStatus = (room: any): RoomStatus => {
    if (!room.bookings || room.bookings.length === 0) return 'available';
    const hasApproved = room.bookings.some((b: any) => b.status === 'approved');
    const hasPending = room.bookings.some((b: any) => b.status === 'pending');
    if (hasApproved) return 'booked';
    if (hasPending) return 'pending';
    return 'available';
  };

  const handleBookRoom = async () => {
    if (!selectedRoom || !bookingTitle.trim()) return;
    setBookingLoading(true);
    try {
      const bookingDate = new Date(selectedDate);
      const startDateTime = new Date(bookingDate);
      startDateTime.setHours(startTime.hour, startTime.minute, 0);
      const endDateTime = new Date(bookingDate);
      endDateTime.setHours(endTime.hour, endTime.minute, 0);

      await createBooking({
        roomId: selectedRoom.roomId,
        title: bookingTitle,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
      });

      setShowBookingForm(false);
      setSelectedRoom(null);
      setBookingTitle('');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Booking failed.');
    } finally {
      setBookingLoading(false);
    }
  };

  const timeOptions = Array.from({ length: 24 }, (_, i) => i + 7).filter((h) => h <= 22)
    .flatMap((hour) => [
      { value: `${hour}:0`, label: formatTime(hour, 0) },
      { value: `${hour}:30`, label: formatTime(hour, 30) },
    ]);

  if (error) return <div className="text-red-500 text-center py-20">{error}</div>;

  return (
    <div className={`min-h-screen ${THEME.bg} p-6 font-sans text-slate-800`}>
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <MapPin className="text-teal-600" /> Book a Room
            </h1>
            <p className="text-slate-500 mt-1 font-medium">Find the perfect space for your meeting.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-100 flex">
              <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>
                <LayoutGrid size={20} />
              </button>
              <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>
                <List size={20} />
              </button>
            </div>
            <button onClick={() => refetch()} className={`${THEME.buttonGhost} p-3`}>
              <RefreshCw size={20} />
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-2 rounded-[24px] shadow-sm flex flex-col lg:flex-row gap-4 lg:items-center">

          <div className="flex items-center gap-2 bg-slate-50 px-4 py-3 rounded-2xl flex-1 cursor-pointer hover:bg-slate-100 transition-colors">
            <MapPin className="text-slate-400" size={20} />
            <select
              value={selectedFloorId}
              onChange={e => setSelectedFloorId(e.target.value)}
              className="bg-transparent outline-none w-full font-bold text-slate-700 cursor-pointer"
            >
              <option value="">All Floors</option>
              {floors.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>

          <div className="w-px h-10 bg-slate-100 hidden lg:block"></div>

          <div className="flex items-center gap-2 bg-slate-50 px-4 py-3 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
            <Calendar className="text-slate-400" size={20} />
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="bg-transparent outline-none font-bold text-slate-700 cursor-pointer"
            />
          </div>

          <div className="w-px h-10 bg-slate-100 hidden lg:block"></div>

          <div className="flex items-center gap-2 bg-slate-50 px-4 py-3 rounded-2xl">
            <Clock className="text-slate-400" size={20} />
            <select
              value={`${startTime.hour}:${startTime.minute}`}
              onChange={e => {
                const [h, m] = e.target.value.split(':').map(Number);
                setStartTime({ hour: h, minute: m });
              }}
              className="bg-transparent outline-none font-bold text-slate-700 cursor-pointer"
            >
              {timeOptions.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <ArrowRight size={16} className="text-slate-300" />
            <select
              value={`${endTime.hour}:${endTime.minute}`}
              onChange={e => {
                const [h, m] = e.target.value.split(':').map(Number);
                setEndTime({ hour: h, minute: m });
              }}
              className="bg-transparent outline-none font-bold text-slate-700 cursor-pointer"
            >
              {timeOptions.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          <button className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-slate-900/10 hover:bg-slate-800 transition-all">
            Find Rooms
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Room Grid */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="font-bold text-slate-900 text-lg">Available Rooms ({rooms.length})</h3>

            {loading.rooms ? (
              <div className="text-center text-slate-400 py-10">Loading rooms...</div>
            ) : rooms.length === 0 ? (
              <div className="text-center text-slate-400 py-20 bg-white rounded-[24px]">No rooms found.</div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {rooms.map(room => {
                  const status = getRoomStatus(room);
                  return (
                    <div key={room.roomId} onClick={() => setSelectedRoom(room)} className={`${THEME.card} p-5 relative overflow-hidden group cursor-pointer border-l-4 ${status === 'available' ? 'border-l-emerald-500' : status === 'booked' ? 'border-l-red-500' : 'border-l-amber-500'}`}>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-bold text-lg text-slate-900 group-hover:text-teal-700 transition-colors">{room.roomName}</h4>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{room.roomType}</p>
                        </div>
                        {status === 'available' ? (
                          <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Free</span>
                        ) : (
                          <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Busy</span>
                        )}
                      </div>

                      <div className="flex gap-4 text-xs font-medium text-slate-500 mb-4">
                        <span className="flex items-center gap-1"><Users size={14} /> {room.capacity}</span>
                        <span className="flex items-center gap-1"><MapPin size={14} /> {room.floorName}</span>
                      </div>

                      {room.equipment?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {room.equipment.slice(0, 3).map((eq: string) => (
                            <span key={eq} className="bg-slate-50 text-slate-500 px-2 py-1 rounded text-[10px] uppercase font-bold">{eq}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-4">
                {rooms.map(room => (
                  <div key={room.roomId} onClick={() => setSelectedRoom(room)} className={`${THEME.card} p-4 flex items-center justify-between cursor-pointer group`}>
                    <div>
                      <h4 className="font-bold text-slate-900">{room.roomName}</h4>
                      <div className="text-xs text-slate-500 flex items-center gap-3">
                        <span>{room.floorName}</span>
                        <span>•</span>
                        <span>{room.capacity} People</span>
                      </div>
                    </div>
                    <button className="text-slate-400 group-hover:text-teal-600"><Check size={20} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar: My Bookings */}
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-[24px] p-6 text-white shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="font-bold text-lg mb-1">My Schedule</h3>
                <p className="text-slate-400 text-sm mb-6">You have {myBookings.filter(b => b.status === 'approved').length} confirmed meetings.</p>

                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/5">
                  <div className="text-3xl font-bold">{myBookings.length}</div>
                  <div className="text-xs font-bold uppercase tracking-wider text-white/60">Total Bookings</div>
                </div>
              </div>
              {/* Abstract shape */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
            </div>

            <div className="bg-white rounded-[24px] p-6 shadow-sm">
              <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Calendar className="text-teal-600" size={18} /> Upcoming
              </h4>
              <div className="space-y-4">
                {myBookings.length === 0 ? (
                  <div className="text-slate-400 text-sm text-center py-4">No upcoming bookings.</div>
                ) : myBookings.slice(0, 5).map(booking => (
                  <div key={booking.id} className="group border-b border-slate-50 last:border-0 pb-3 last:pb-0">
                    <div className="flex justify-between items-start mb-1">
                      <h5 className="font-bold text-slate-700 text-sm truncate max-w-[150px]">{booking.meeting_title || 'Meeting'}</h5>
                      <span className={`text-[10px] font-bold uppercase ${booking.status === 'approved' ? 'text-emerald-500' : 'text-amber-500'}`}>{booking.status}</span>
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-2">
                      <span>{formatDate(booking.booking_date)}</span>
                      <span>•</span>
                      <span>{booking.start_time}-{booking.end_time}</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                      <MapPin size={10} /> {booking.roomName}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Booking Modal */}
      {selectedRoom && !showBookingForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedRoom(null)}>
          <div className="bg-white w-full max-w-lg rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <div className="h-40 rounded-2xl bg-slate-100 mb-6 overflow-hidden">
              <img src={`https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80`} className="w-full h-full object-cover" alt="Room" />
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-2">{selectedRoom.roomName}</h2>
            <p className="text-slate-500 mb-6 flex items-center gap-4 text-sm font-medium">
              <span className="flex items-center gap-1"><Users size={16} /> {selectedRoom.capacity} People</span>
              <span className="flex items-center gap-1"><MapPin size={16} /> {selectedRoom.floorName}</span>
            </p>

            <div className="bg-slate-50 p-4 rounded-2xl mb-6">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Selected Time</h4>
              <div className="font-bold text-slate-900">
                {formatDate(selectedDate)} <span className="text-slate-300 mx-2">|</span> {formatTime(startTime.hour, startTime.minute)} - {formatTime(endTime.hour, endTime.minute)}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setSelectedRoom(null)} className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50">Cancel</button>
              <button
                onClick={() => setShowBookingForm(true)}
                disabled={getRoomStatus(selectedRoom) !== 'available'}
                className={`flex-1 ${THEME.buttonPrimary} py-3 shadow-lg shadow-slate-900/20 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {getRoomStatus(selectedRoom) === 'available' ? 'Book Room' : 'Unavailable'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showBookingForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Confirm Booking</h2>

            <div className="space-y-4 mb-8">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Meeting Title</label>
                <input
                  autoFocus
                  type="text"
                  className="w-full bg-slate-50 border-0 rounded-xl px-4 py-3 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-teal-500/20"
                  placeholder="e.g. Weekly Sync"
                  value={bookingTitle}
                  onChange={e => setBookingTitle(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowBookingForm(false)} className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50">Back</button>
              <button
                onClick={handleBookRoom}
                disabled={bookingLoading || !bookingTitle}
                className={`flex-1 ${THEME.buttonPrimary} py-3 shadow-lg shadow-slate-900/20`}
              >
                {bookingLoading ? 'Booking...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingModule;
