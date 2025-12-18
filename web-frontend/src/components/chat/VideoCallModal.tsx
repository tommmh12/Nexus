/**
 * Video Call Modal Component
 * For direct video calls (chat) - Uses Daily.co iframe directly
 * Clean, modern UI with smooth animations
 */

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  PhoneOff,
  Maximize2,
  Minimize2,
  ExternalLink,
  AlertCircle,
  RefreshCw,
  Video,
  Phone,
  Volume2,
} from "lucide-react";

interface VideoCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomUrl?: string;
  roomName?: string;
  token?: string;
  provider?: "DAILY";
  displayName: string;
  otherUserName: string;
  isVideoCall: boolean;
  callStatus?: "idle" | "calling" | "connecting" | "active";
  onCallEnd?: () => void;
}

export const VideoCallModal: React.FC<VideoCallModalProps> = ({
  isOpen,
  onClose,
  roomUrl: roomUrlProp,
  roomName,
  token,
  displayName,
  otherUserName,
  isVideoCall,
  callStatus = "active",
  onCallEnd,
}) => {
  // Compute room URL - add query params for user name and video settings
  const baseRoomUrl =
    roomUrlProp ||
    (roomName?.startsWith("https://")
      ? roomName
      : roomName
      ? `https://mma-e9.daily.co/${roomName}`
      : "");

  // Build iframe URL with preload parameters
  const buildIframeUrl = useCallback(() => {
    if (!baseRoomUrl) return "";

    const url = new URL(baseRoomUrl);

    // Add token if available (includes user name and permissions)
    if (token) {
      url.searchParams.set("t", token);
    }

    // IMPORTANT: Skip the prejoin/haircheck screen - join immediately
    url.searchParams.set("prejoinUI", "false");

    // Hide Daily.co's leave button (we have our own)
    url.searchParams.set("showLeaveButton", "false");

    // Start with video off for voice calls, on for video calls
    if (!isVideoCall) {
      url.searchParams.set("startVideoOff", "true");
    }

    // Start with audio on
    url.searchParams.set("startAudioOff", "false");

    console.log("[VideoCallModal] Built iframe URL:", url.toString());
    return url.toString();
  }, [baseRoomUrl, token, isVideoCall]);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [iframeKey, setIframeKey] = useState(0); // For forcing iframe reload

  // Timer for call duration
  useEffect(() => {
    if (!isOpen || isLoading) {
      setCallDuration(0);
      return;
    }

    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isLoading]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setError(null);
      setCallDuration(0);
    }
  }, [isOpen]);

  // Handle iframe load
  const handleIframeLoad = () => {
    console.log("[VideoCallModal] Iframe loaded successfully");
    setIsLoading(false);
    setError(null);
  };

  // Handle iframe error
  const handleIframeError = () => {
    console.error("[VideoCallModal] Iframe failed to load");
    setError("Không thể kết nối cuộc gọi");
    setIsLoading(false);
  };

  // Timeout for loading
  useEffect(() => {
    if (!isOpen || !baseRoomUrl) return;

    const timeout = setTimeout(() => {
      if (isLoading) {
        console.warn("[VideoCallModal] Load timeout - 30s");
        setError("Kết nối quá lâu. Vui lòng thử lại.");
        setIsLoading(false);
      }
    }, 30000);

    return () => clearTimeout(timeout);
  }, [isOpen, baseRoomUrl, isLoading]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleEndCall = () => {
    console.log("[VideoCallModal] End call clicked");
    onCallEnd?.();
    onClose();
  };

  const handleRetry = () => {
    console.log("[VideoCallModal] Retry clicked");
    setError(null);
    setIsLoading(true);
    setIframeKey((prev) => prev + 1); // Force iframe reload
  };

  const openInNewTab = () => {
    if (baseRoomUrl) {
      window.open(baseRoomUrl, "_blank");
    }
  };

  if (!isOpen) return null;

  const iframeUrl = buildIframeUrl();

  // Get initials for avatar
  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div
      className={`fixed z-[100] transition-all duration-300 ease-out ${
        isMinimized
          ? "bottom-4 right-4 w-80 h-52 shadow-2xl"
          : "inset-0 md:inset-4 lg:inset-8"
      }`}
    >
      {/* Backdrop with blur */}
      {!isMinimized && (
        <div
          className="absolute inset-0 -z-10 bg-black/70 backdrop-blur-md"
          onClick={() => setIsMinimized(true)}
        />
      )}

      {/* Modal Container */}
      <div
        className={`relative w-full h-full bg-gradient-to-b from-slate-900 to-slate-950 overflow-hidden flex flex-col transition-all duration-300 ${
          isMinimized
            ? "rounded-2xl cursor-pointer ring-2 ring-white/10 hover:ring-teal-500/50"
            : "md:rounded-2xl"
        }`}
        onClick={isMinimized ? () => setIsMinimized(false) : undefined}
      >
        {/* Header - Modern design */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 bg-gradient-to-r from-slate-800/90 to-slate-800/70 backdrop-blur-sm border-b border-white/5">
          <div className="flex items-center gap-3">
            {/* Avatar with gradient border */}
            <div className="relative">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-teal-400 via-teal-500 to-emerald-600 p-0.5">
                <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-white font-semibold text-sm">
                  {getInitials(otherUserName || "User")}
                </div>
              </div>
              {/* Online indicator */}
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-slate-800"></div>
            </div>

            <div>
              <div className="text-white font-semibold text-base">
                {otherUserName || "Người dùng"}
              </div>
              <div className="flex items-center gap-2 text-sm">
                {/* Call type icon */}
                {isVideoCall ? (
                  <Video size={14} className="text-teal-400" />
                ) : (
                  <Phone size={14} className="text-teal-400" />
                )}
                <span className="text-slate-400">
                  {isVideoCall ? "Video" : "Thoại"}
                </span>
                <span className="text-slate-600">•</span>
                {/* Duration with pulse animation when active */}
                <span
                  className={`font-mono ${
                    !isLoading ? "text-green-400" : "text-slate-400"
                  }`}
                >
                  {formatDuration(callDuration)}
                </span>
                {!isLoading && !error && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Control buttons */}
          <div className="flex items-center gap-1.5">
            {/* Open in new tab */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                openInNewTab();
              }}
              className="p-2.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-all duration-200"
              title="Mở trong tab mới"
            >
              <ExternalLink size={18} />
            </button>

            {/* Minimize/Maximize */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMinimized(!isMinimized);
              }}
              className="p-2.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-all duration-200"
              title={isMinimized ? "Phóng to" : "Thu nhỏ"}
            >
              {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
            </button>

            {/* End call button - larger and more prominent */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEndCall();
              }}
              className="ml-1 p-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-red-500/25"
              title="Kết thúc cuộc gọi"
            >
              <PhoneOff size={18} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 relative bg-slate-900 overflow-hidden">
          {/* Calling State - Waiting for recipient to answer */}
          {callStatus === "calling" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950 z-10">
              {/* Avatar with ripple animation */}
              <div className="relative mb-8">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-teal-400 via-teal-500 to-emerald-600 p-1">
                  <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-white font-bold text-3xl">
                    {getInitials(otherUserName || "User")}
                  </div>
                </div>
                {/* Multiple ripple effects */}
                <div className="absolute inset-0 rounded-full border-2 border-teal-500/40 animate-ping"></div>
                <div
                  className="absolute inset-[-8px] rounded-full border-2 border-teal-500/20 animate-ping"
                  style={{ animationDelay: "0.5s" }}
                ></div>
                <div
                  className="absolute inset-[-16px] rounded-full border-2 border-teal-500/10 animate-ping"
                  style={{ animationDelay: "1s" }}
                ></div>
              </div>

              <p className="text-white text-2xl font-semibold mb-2">
                {otherUserName || "Người dùng"}
              </p>
              <p className="text-teal-400 text-lg mb-6 flex items-center gap-2">
                {isVideoCall ? <Video size={20} /> : <Phone size={20} />}
                Đang gọi...
              </p>

              {/* Ringing indicator */}
              <div className="flex gap-2 mb-8">
                <div className="w-3 h-3 rounded-full bg-teal-500 animate-pulse"></div>
                <div
                  className="w-3 h-3 rounded-full bg-teal-500 animate-pulse"
                  style={{ animationDelay: "0.3s" }}
                ></div>
                <div
                  className="w-3 h-3 rounded-full bg-teal-500 animate-pulse"
                  style={{ animationDelay: "0.6s" }}
                ></div>
              </div>

              {/* Cancel call button */}
              <button
                onClick={handleEndCall}
                className="px-8 py-3 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center gap-3 transition-all duration-200 hover:scale-105 active:scale-95 font-medium shadow-lg shadow-red-500/30"
              >
                <PhoneOff size={20} />
                Hủy cuộc gọi
              </button>
            </div>
          )}

          {/* Loading State - Beautiful connecting animation */}
          {callStatus !== "calling" && isLoading && !error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950 z-10">
              {/* Avatar with pulse */}
              <div className="relative mb-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-400 via-teal-500 to-emerald-600 p-1 animate-pulse">
                  <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-white font-bold text-2xl">
                    {getInitials(otherUserName || "User")}
                  </div>
                </div>
                {/* Ripple effect */}
                <div className="absolute inset-0 rounded-full border-2 border-teal-500/50 animate-ping"></div>
              </div>

              <p className="text-white text-xl font-medium mb-2">
                Đang kết nối...
              </p>
              <p className="text-slate-400 text-sm flex items-center gap-2">
                <Volume2 size={16} className="animate-pulse" />
                Đang thiết lập cuộc gọi {isVideoCall ? "video" : "thoại"}
              </p>

              {/* Progress dots */}
              <div className="flex gap-1.5 mt-6">
                <div
                  className="w-2 h-2 rounded-full bg-teal-500 animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></div>
                <div
                  className="w-2 h-2 rounded-full bg-teal-500 animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></div>
                <div
                  className="w-2 h-2 rounded-full bg-teal-500 animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></div>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950 z-10">
              <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6 ring-4 ring-red-500/20">
                <AlertCircle className="w-10 h-10 text-red-500" />
              </div>
              <p className="text-white text-xl font-medium mb-2">{error}</p>
              <p className="text-slate-400 text-sm mb-6">
                Vui lòng kiểm tra kết nối mạng
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleRetry}
                  className="px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl flex items-center gap-2 transition-all duration-200 hover:scale-105 active:scale-95 font-medium"
                >
                  <RefreshCw size={18} />
                  Thử lại
                </button>
                <button
                  onClick={handleEndCall}
                  className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl flex items-center gap-2 transition-all duration-200 hover:scale-105 active:scale-95 font-medium"
                >
                  <PhoneOff size={18} />
                  Đóng
                </button>
              </div>
            </div>
          )}

          {/* Daily.co iframe - Full screen embed - Only show when NOT in calling state */}
          {callStatus !== "calling" && iframeUrl && (
            <iframe
              key={iframeKey}
              ref={iframeRef}
              src={iframeUrl}
              className={`w-full h-full border-0 transition-opacity duration-500 ${
                isLoading || error ? "opacity-0" : "opacity-100"
              }`}
              allow="camera; microphone; fullscreen; display-capture; autoplay"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              title="Video Call"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCallModal;
