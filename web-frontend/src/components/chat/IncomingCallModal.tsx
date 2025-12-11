import React, { useEffect, useState } from "react";
import { Phone, Video, PhoneOff, X, User } from "lucide-react";

interface IncomingCallModalProps {
  isOpen: boolean;
  callerName: string;
  callerAvatar?: string;
  isVideoCall: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export const IncomingCallModal: React.FC<IncomingCallModalProps> = ({
  isOpen,
  callerName,
  callerAvatar,
  isVideoCall,
  onAccept,
  onDecline,
}) => {
  const [ringDuration, setRingDuration] = useState(0);

  // Ring duration counter
  useEffect(() => {
    if (!isOpen) {
      setRingDuration(0);
      return;
    }

    const timer = setInterval(() => {
      setRingDuration((prev) => prev + 1);
    }, 1000);

    // Auto decline after 30 seconds
    const autoDecline = setTimeout(() => {
      onDecline();
    }, 30000);

    return () => {
      clearInterval(timer);
      clearTimeout(autoDecline);
    };
  }, [isOpen, onDecline]);

  // Play ringtone
  useEffect(() => {
    if (!isOpen) return;

    // Create audio element for ringtone
    const audio = new Audio("/assets/sounds/ringtone.mp3");
    audio.loop = true;
    audio.volume = 0.5;

    // Try to play - may fail due to browser autoplay policy
    audio.play().catch(() => {
      console.log("Ringtone autoplay blocked by browser");
    });

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 shadow-2xl max-w-sm w-full mx-4 animate-pulse-slow">
        {/* Close button */}
        <button
          onClick={onDecline}
          className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <X size={20} className="text-white/70" />
        </button>

        {/* Call type indicator */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full">
            {isVideoCall ? (
              <Video size={18} className="text-brand-400" />
            ) : (
              <Phone size={18} className="text-green-400" />
            )}
            <span className="text-white/90 text-sm font-medium">
              {isVideoCall ? "Cuộc gọi video" : "Cuộc gọi thoại"}
            </span>
          </div>
        </div>

        {/* Caller info */}
        <div className="text-center mb-8">
          {/* Avatar with pulsing ring effect */}
          <div className="relative inline-block mb-4">
            {/* Pulsing rings */}
            <div className="absolute inset-0 animate-ping">
              <div className="w-28 h-28 rounded-full bg-brand-500/30" />
            </div>
            <div
              className="absolute inset-0 animate-ping"
              style={{ animationDelay: "0.5s" }}
            >
              <div className="w-28 h-28 rounded-full bg-brand-500/20" />
            </div>

            {/* Avatar */}
            <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
              {callerAvatar ? (
                <img
                  src={callerAvatar}
                  alt={callerName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                callerName.charAt(0).toUpperCase()
              )}
            </div>
          </div>

          <h2 className="text-white text-2xl font-bold mb-1">{callerName}</h2>
          <p className="text-white/60 text-sm">
            Đang gọi đến... ({ringDuration}s)
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-center gap-6">
          {/* Decline button */}
          <div className="text-center">
            <button
              onClick={onDecline}
              className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-all hover:scale-105 shadow-lg shadow-red-500/30"
            >
              <PhoneOff size={28} className="text-white" />
            </button>
            <span className="text-white/70 text-xs mt-2 block">Từ chối</span>
          </div>

          {/* Accept button */}
          <div className="text-center">
            <button
              onClick={onAccept}
              className="w-16 h-16 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition-all hover:scale-105 shadow-lg shadow-green-500/30 animate-bounce"
            >
              {isVideoCall ? (
                <Video size={28} className="text-white" />
              ) : (
                <Phone size={28} className="text-white" />
              )}
            </button>
            <span className="text-white/70 text-xs mt-2 block">Trả lời</span>
          </div>
        </div>

        {/* Tips */}
        <p className="text-center text-white/40 text-xs mt-6">
          Cuộc gọi sẽ tự động kết thúc sau 30 giây nếu không có phản hồi
        </p>
      </div>

      {/* CSS for custom animation */}
      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.85; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default IncomingCallModal;
