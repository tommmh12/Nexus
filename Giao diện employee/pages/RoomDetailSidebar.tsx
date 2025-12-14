
import React from 'react';
import { X, Users, MapPin, Video, Monitor, Wifi } from 'lucide-react';
import { RoomAvailabilityInfo } from '../types/booking.types';
import { Button } from '../components/system/ui/Button';

interface RoomDetailSidebarProps {
  room: RoomAvailabilityInfo;
  selectedTime: { date: string; start: string; end: string };
  onClose: () => void;
  onBook: () => void;
}

export const RoomDetailSidebar: React.FC<RoomDetailSidebarProps> = ({ room, selectedTime, onClose, onBook }) => {
  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-2xl p-6 z-50 animate-slideInRight overflow-y-auto border-l border-slate-200">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{room.roomName}</h2>
          <p className="text-slate-500">{room.floorName}</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full"><X size={20} /></button>
      </div>

      <div className="space-y-6">
        <div className="aspect-video rounded-xl bg-slate-100 overflow-hidden">
             <img src={`https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80`} alt="Room" className="w-full h-full object-cover" />
        </div>

        <div>
            <h3 className="font-bold text-slate-900 mb-3">Facilities</h3>
            <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm text-slate-600"><Users size={16}/> {room.capacity} People</div>
                <div className="flex items-center gap-2 text-sm text-slate-600"><Wifi size={16}/> High-speed Wifi</div>
                <div className="flex items-center gap-2 text-sm text-slate-600"><Monitor size={16}/> 4K Display</div>
                <div className="flex items-center gap-2 text-sm text-slate-600"><Video size={16}/> Video Conf</div>
            </div>
        </div>

        <div className="pt-6 border-t border-slate-100">
            <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-medium text-slate-500">Selected Slot</span>
                <span className="text-sm font-bold text-slate-900">{selectedTime.date}, {selectedTime.start} - {selectedTime.end}</span>
            </div>
            <Button fullWidth onClick={onBook}>Book Room</Button>
        </div>
      </div>
    </div>
  );
};
