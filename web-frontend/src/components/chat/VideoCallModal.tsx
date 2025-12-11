import React, { useEffect, useRef, useState } from "react";
import {
  X,
  PhoneOff,
  Maximize2,
  Minimize2,
  Users,
  ExternalLink,
} from "lucide-react";

interface VideoCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomName: string;
  displayName: string;
  otherUserName: string;
  isVideoCall: boolean; // true = video, false = audio only
  onCallEnd?: () => void;
}

export const VideoCallModal: React.FC<VideoCallModalProps> = ({
  isOpen,
  onClose,
  roomName,
  displayName,
  otherUserName,
  isVideoCall,
  onCallEnd,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Build Jitsi URL with config to skip prejoin
  const buildJitsiUrl = () => {
    const baseUrl = "https://meet.jit.si";
    const room = `nexus-${roomName}`;

    // URL config parameters to bypass prejoin
    const configParams = [
      `config.prejoinPageEnabled=false`,
      `config.startWithAudioMuted=false`,
      `config.startWithVideoMuted=${!isVideoCall}`,
      `config.disableDeepLinking=true`,
      `config.enableWelcomePage=false`,
      `config.enableClosePage=false`,
      `config.disableInviteFunctions=true`,
      `config.requireDisplayName=false`,
      `config.enableInsecureRoomNameWarning=false`,
      `interfaceConfig.SHOW_JITSI_WATERMARK=false`,
      `interfaceConfig.SHOW_WATERMARK_FOR_GUESTS=false`,
      `interfaceConfig.SHOW_BRAND_WATERMARK=false`,
      `interfaceConfig.SHOW_POWERED_BY=false`,
      `interfaceConfig.MOBILE_APP_PROMO=false`,
      `interfaceConfig.HIDE_INVITE_MORE_HEADER=true`,
      `userInfo.displayName="${encodeURIComponent(displayName)}"`,
    ].join("&");

    return `${baseUrl}/${room}#${configParams}`;
  };

  // Call duration timer
  useEffect(() => {
    if (!isOpen) {
      setCallDuration(0);
      setIsLoading(true);
      return;
    }

    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  // Handle iframe load
  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleEndCall = () => {
    onCallEnd?.();
    onClose();
  };

  const openInNewTab = () => {
    window.open(buildJitsiUrl(), "_blank");
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed z-50 transition-all duration-300 ${
        isMinimized
          ? "bottom-4 right-4 w-96 h-64 rounded-xl shadow-2xl"
          : "inset-4 md:inset-8 lg:inset-12 rounded-2xl shadow-2xl"
      }`}
    >
      {/* Overlay when not minimized */}
      {!isMinimized && (
        <div
          className="fixed inset-0 bg-black/60 -z-10"
          onClick={() => setIsMinimized(true)}
        />
      )}

      <div className="relative w-full h-full bg-slate-900 rounded-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold">
                {otherUserName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-white font-semibold">{otherUserName}</h3>
                <div className="flex items-center gap-2 text-white/70 text-sm">
                  <span className="flex items-center gap-1">
                    <Users size={14} />
                    {isVideoCall ? "Video Call" : "Voice Call"}
                  </span>
                  <span>•</span>
                  <span>{formatDuration(callDuration)}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={openInNewTab}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                title="Mở trong tab mới"
              >
                <ExternalLink size={20} className="text-white" />
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                title={isMinimized ? "Phóng to" : "Thu nhỏ"}
              >
                {isMinimized ? (
                  <Maximize2 size={20} className="text-white" />
                ) : (
                  <Minimize2 size={20} className="text-white" />
                )}
              </button>
              <button
                onClick={handleEndCall}
                className="p-2 bg-red-500 hover:bg-red-600 rounded-full transition-colors"
                title="Kết thúc cuộc gọi"
              >
                <PhoneOff size={20} className="text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Jitsi IFrame */}
        <div className="flex-1 w-full h-full pt-16">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-5">
              <div className="text-center max-w-md px-6">
                <div className="animate-spin w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-white font-medium text-lg mb-2">
                  Đang kết nối cuộc gọi...
                </p>
                <div className="bg-amber-500/20 border border-amber-500/50 rounded-lg p-3 mt-4">
                  <p className="text-amber-200 text-sm">
                    💡 <strong>Lưu ý:</strong> Khi Jitsi hiển thị, nhấn nút
                    <span className="bg-blue-500 text-white px-2 py-0.5 rounded mx-1 text-xs font-bold">
                      Join meeting
                    </span>
                    để tham gia cuộc gọi
                  </p>
                </div>
              </div>
            </div>
          )}
          <iframe
            ref={iframeRef}
            src={buildJitsiUrl()}
            className="w-full h-full border-0"
            allow="camera; microphone; fullscreen; display-capture; autoplay; clipboard-write"
            onLoad={handleIframeLoad}
          />
        </div>

        {/* Bottom tip when minimized */}
        {isMinimized && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
            <p className="text-white/60 text-xs text-center">
              Nhấn để phóng to • Cuộc gọi đang diễn ra
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoCallModal;
