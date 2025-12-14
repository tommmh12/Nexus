
import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin } from 'lucide-react';
import { RoomAvailabilityInfo } from '../types/booking.types';
import { Button } from '../components/system/ui/Button';
import { Input } from '../components/system/ui/Input';

interface BookingFormProps {
  room: RoomAvailabilityInfo;
  selectedTime: { date: string; start: string; end: string };
  onClose: () => void;
  onSuccess: () => void;
}

export const BookingForm: React.FC<BookingFormProps> = ({ room, selectedTime, onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => onSuccess(), 500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fadeIn">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
           <h3 className="font-bold text-lg text-slate-900">Confirm Booking</h3>
           <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full"><X size={20} className="text-slate-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
           <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3 border border-blue-100">
              <div className="bg-white p-2 rounded-md shadow-sm">
                  <MapPin size={20} className="text-blue-600" />
              </div>
              <div>
                  <h4 className="font-bold text-slate-900">{room.roomName}</h4>
                  <div className="text-sm text-slate-600 flex items-center gap-2 mt-1">
                      <Calendar size={14} /> {selectedTime.date}
                      <Clock size={14} className="ml-2" /> {selectedTime.start} - {selectedTime.end}
                  </div>
              </div>
           </div>

           <Input label="Meeting Title" value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Weekly Sync" />
           
           <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-4">
               <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
               <Button type="submit">Confirm Booking</Button>
           </div>
        </form>
      </div>
    </div>
  );
};
