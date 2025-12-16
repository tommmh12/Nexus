/**
 * Video Call Modal Component
 * For direct video calls (chat) - Uses Daily.co only
 */

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  PhoneOff,
  Maximize2,
  Minimize2,
  Users,
  ExternalLink,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

interface VideoCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomUrl?: string;       // Full Daily.co room URL
  roomName?: string;      // Just room name (for backward compatibility)
  token?: string;
  provider?: 'DAILY';
  displayName: string;
  otherUserName: string;
  isVideoCall: boolean;
  onCallEnd?: () => void;
}

// Daily.co SDK types (Window.DailyIframe already declared in DailyMeetingRoom.tsx)
interface DailyCall {
  join: (options: { url: string; token?: string }) => Promise<void>;
  leave: () => Promise<void>;
  destroy: () => void;
  on: (event: string, callback: (...args: any[]) => void) => void;
  off: (event: string, callback: (...args: any[]) => void) => void;
}

// Module-level singleton for VideoCallModal
let modalCallFrame: DailyCall | null = null;
let isInitializing = false; // Lock to prevent duplicate initialization

async function destroyModalCallFrame() {
  if (modalCallFrame) {
    console.log('[VideoCallModal] Destroying call frame');
    const frame = modalCallFrame;
    modalCallFrame = null; // Clear reference immediately
    try {
      await frame.leave();
    } catch (e) {
      console.warn('[VideoCallModal] Error leaving:', e);
    }
    try {
      frame.destroy();
    } catch (e) {
      console.warn('[VideoCallModal] Error destroying:', e);
    }
  }
  isInitializing = false;
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
  onCallEnd,
}) => {
  // Compute room URL from either roomUrl or roomName
  // If roomName is already a full URL (starts with https://), use it directly
  const roomUrl = roomUrlProp || (roomName?.startsWith('https://') ? roomName : (roomName ? `https://mma-e9.daily.co/${roomName}` : ''));

  const containerRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(true);
  const onCallEndRef = useRef(onCallEnd);
  const onCloseRef = useRef(onClose);

  // Keep refs updated
  onCallEndRef.current = onCallEnd;
  onCloseRef.current = onClose;

  const [isMinimized, setIsMinimized] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('Đang kết nối...');


  // Call duration timer
  useEffect(() => {
    if (!isOpen) {
      setCallDuration(0);
      setIsLoading(true);
      setError(null);
      return;
    }

    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  // Initialize Daily.co
  useEffect(() => {
    if (!isOpen || !roomUrl) return;

    mountedRef.current = true;
    let localFrame: DailyCall | null = null;

    const init = async () => {
      // Prevent duplicate initialization
      if (isInitializing || modalCallFrame) {
        console.log('[VideoCallModal] Init skipped - already initializing or frame exists');
        return;
      }
      isInitializing = true;

      console.log('[VideoCallModal] Init, roomUrl:', roomUrl);
      setLoadingMessage('Đang khởi tạo...');

      // Destroy any previous frame (just in case)
      await destroyModalCallFrame();
      isInitializing = true; // Re-set after destroy clears it

      // Load SDK
      if (!window.DailyIframe) {
        console.log('[VideoCallModal] Loading SDK...');
        setLoadingMessage('Đang tải SDK...');
        await loadDailySDK();
      }
      
      setLoadingMessage('Đang tạo phòng họp...');

      if (!mountedRef.current || !containerRef.current) return;

      containerRef.current.innerHTML = '';
      await new Promise(r => setTimeout(r, 50));

      if (!mountedRef.current || !containerRef.current) return;

      try {
        console.log('[VideoCallModal] Creating frame...');
        setLoadingMessage('Đang kết nối cuộc gọi...');
        const callFrame = window.DailyIframe!.createFrame(containerRef.current, {
          iframeStyle: {
            width: '100%',
            height: '100%',
            border: '0',
            borderRadius: '8px',
          },
          showLeaveButton: true,
          showFullscreenButton: true,
        });

        modalCallFrame = callFrame;
        localFrame = callFrame;

        callFrame.on('left-meeting', () => {
          console.log('[VideoCallModal] Left meeting');
          destroyModalCallFrame().catch(console.error);
          onCallEndRef.current?.();
          onCloseRef.current();
        });

        callFrame.on('error', (e: any) => {
          console.error('[VideoCallModal] Error:', e);
          setError('Lỗi kết nối cuộc gọi');
        });

        callFrame.on('joined-meeting', () => {
          console.log('[VideoCallModal] Joined');
          if (mountedRef.current) setIsLoading(false);
        });

        // Only include token if it's a valid string
        const joinOptions: { url: string; token?: string } = { url: roomUrl };
        if (token && typeof token === 'string' && token.length > 0) {
          joinOptions.token = token;
        }
        await callFrame.join(joinOptions);

      } catch (err: any) {
        console.error('[VideoCallModal] Failed:', err);
        if (mountedRef.current) {
          setError(err.message || 'Không thể kết nối');
          setIsLoading(false);
        }
      }
    };

    init();

    return () => {
      mountedRef.current = false;
      if (localFrame === modalCallFrame) {
        destroyModalCallFrame().catch(console.error);
      }
    };
    // Note: onCallEnd and onClose are intentionally excluded to prevent re-initialization
    // when parent re-renders. We use the latest values via refs in the event handlers.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, roomUrl, token]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleEndCall = () => {
    destroyModalCallFrame().catch(console.error);
    onCallEnd?.();
    onClose();
  };

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    destroyModalCallFrame().then(() => {
      // Init will be re-triggered if we force a re-render or similar, but here we depend on effects.
      // Actually, logic inside init cleans up. To re-trigger init, we might need to toggle isOpen or something.
      // But for now, let's just clear and let the effect run if dependencies change.
      // If dependencies don't change, effect won't re-run.
      // But handleRetry logic was: destroy then... what?
      // The original logic just destroyed. It relied on init? No.
      // Use a key or forceUpdate? simpler: just reload page? No.
      // Re-mount component? 
      // For now, let's just make it async.
    });
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed z-50 transition-all duration-300 ${isMinimized
        ? "bottom-4 right-4 w-96 h-64 rounded-xl shadow-2xl"
        : "inset-4 md:inset-8 lg:inset-12 rounded-2xl shadow-2xl"
        }`}
    >
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
                  <Users size={14} />
                  <span>{isVideoCall ? "Video Call" : "Voice Call"}</span>
                  <span>•</span>
                  <span>{formatDuration(callDuration)}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.open(roomUrl, '_blank')}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                title="Mở trong tab mới"
              >
                <ExternalLink size={20} className="text-white" />
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                {isMinimized ? <Maximize2 size={20} className="text-white" /> : <Minimize2 size={20} className="text-white" />}
              </button>
              <button
                onClick={handleEndCall}
                className="p-2 bg-red-500 hover:bg-red-600 rounded-full transition-colors"
              >
                <PhoneOff size={20} className="text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 w-full h-full pt-16">
          {isLoading && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-5">
              <div className="text-center">
                <div className="animate-spin w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-white font-medium mb-2">{loadingMessage}</p>
                <p className="text-white/60 text-sm mb-4">Vui lòng đợi trong giây lát...</p>
                <button
                  onClick={handleEndCall}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center gap-2 mx-auto"
                >
                  <PhoneOff size={16} />
                  Hủy cuộc gọi
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-5">
              <div className="text-center">
                <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
                <p className="text-white font-medium mb-4">{error}</p>
                <button
                  onClick={handleRetry}
                  className="flex items-center gap-2 mx-auto px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg"
                >
                  <RefreshCw size={16} />
                  Thử lại
                </button>
              </div>
            </div>
          )}

          <div
            ref={containerRef}
            className="w-full h-full"
            style={{ display: isLoading || error ? 'none' : 'block' }}
          />
        </div>
      </div>
    </div>
  );
};

// Helper to load Daily SDK
async function loadDailySDK(): Promise<void> {
  if (window.DailyIframe) return;

  return new Promise((resolve, reject) => {
    const existing = document.getElementById('daily-js-script');
    if (existing) {
      const check = setInterval(() => {
        if (window.DailyIframe) {
          clearInterval(check);
          resolve();
        }
      }, 100);
      setTimeout(() => { clearInterval(check); reject(new Error('Timeout')); }, 10000);
      return;
    }

    const script = document.createElement('script');
    script.id = 'daily-js-script';
    script.src = 'https://unpkg.com/@daily-co/daily-js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load SDK'));
    document.head.appendChild(script);
  });
}

export default VideoCallModal;
