/**
 * Global Call Context
 * Handles incoming calls from anywhere in the app
 * Provides global socket connection for authenticated users
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useSocket } from "../hooks/useSocket";
import { IncomingCallModal } from "../components/chat/IncomingCallModal";
import { VideoCallModal } from "../components/chat/VideoCallModal";

interface IncomingCall {
  callId: string;
  callerId: string;
  callerName: string;
  roomName: string;
  token?: string; // Daily.co meeting token
  isVideoCall: boolean;
}

interface ActiveCall {
  callId: string;
  roomName: string;
  token?: string; // Daily.co meeting token
  recipientId: string;
  recipientName: string;
  isVideoCall: boolean;
}

type CallStatus = "idle" | "calling" | "connecting" | "active";

interface GlobalCallContextValue {
  isConnected: boolean;
  onlineUsers: Set<string>;
  incomingCall: IncomingCall | null;
  activeCall: ActiveCall | null;
  callStatus: CallStatus;
  startCall: (data: {
    recipientId: string;
    recipientName: string;
    isVideoCall: boolean;
  }) => { callId: string; roomName: string } | null;
  isInCall: boolean;
}

const GlobalCallContext = createContext<GlobalCallContextValue | null>(null);

export const useGlobalCall = () => {
  const context = useContext(GlobalCallContext);
  if (!context) {
    throw new Error("useGlobalCall must be used within GlobalCallProvider");
  }
  return context;
};

interface GlobalCallProviderProps {
  children: ReactNode;
  currentUserName: string;
}

export const GlobalCallProvider: React.FC<GlobalCallProviderProps> = ({
  children,
  currentUserName,
}) => {
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");

  // Pending room data - saved when room is ready but call not yet accepted
  const [pendingRoomData, setPendingRoomData] = useState<{
    callId: string;
    roomUrl: string;
    token?: string;
  } | null>(null);

  const {
    isConnected,
    onlineUsers,
    startCall: socketStartCall,
    acceptCall,
    declineCall,
    endCall,
    onIncomingCall,
    onCallAccepted,
    onCallDeclined,
    onCallEnded,
    onCallBusy,
    onNoAnswer,
    onRoomReady,
  } = useSocket();

  // Start a call from anywhere
  const startCall = useCallback(
    (data: {
      recipientId: string;
      recipientName: string;
      isVideoCall: boolean;
    }) => {
      if (!isConnected) {
        console.warn("❌ Cannot start call: socket not connected");
        return null;
      }

      const result = socketStartCall(data);
      if (result) {
        setCallStatus("calling");
        setActiveCall({
          callId: result.callId,
          roomName: "", // Wait for call:room_ready to get actual roomUrl
          recipientId: data.recipientId,
          recipientName: data.recipientName,
          isVideoCall: data.isVideoCall,
        });
      }
      return result;
    },
    [isConnected, socketStartCall]
  );

  // Handle accept call
  const handleAcceptCall = useCallback(() => {
    if (!incomingCall) return;
    acceptCall(incomingCall.callId);
    // Recipient already has roomName and token from incoming call
    // So set status to "active" immediately to show the call
    setCallStatus("active");
    setActiveCall({
      callId: incomingCall.callId,
      roomName: incomingCall.roomName || "",
      token: incomingCall.token, // Include token
      recipientId: incomingCall.callerId,
      recipientName: incomingCall.callerName,
      isVideoCall: incomingCall.isVideoCall,
    });
    setIncomingCall(null);
  }, [incomingCall, acceptCall]);

  // Handle decline call
  const handleDeclineCall = useCallback(() => {
    if (!incomingCall) return;
    declineCall(incomingCall.callId, incomingCall.callerId);
    setIncomingCall(null);
  }, [incomingCall, declineCall]);

  // Handle end call
  const handleEndCall = useCallback(() => {
    if (!activeCall) return;
    endCall(activeCall.callId, activeCall.recipientId);
    setActiveCall(null);
    setCallStatus("idle");
  }, [activeCall, endCall]);

  // Listen for call events globally
  useEffect(() => {
    // When room is ready (for caller), save as pending - DON'T join yet
    const unsubRoomReady = onRoomReady?.((data) => {
      console.log("🌐 [GlobalCall] Room ready (saved as pending):", data);
      setPendingRoomData({
        callId: data.callId,
        roomUrl: data.roomUrl,
        token: data.token,
      });
    });

    const unsub1 = onIncomingCall((data) => {
      console.log("🌐 [GlobalCall] Incoming call:", data);

      // Check if we're on the chat page - if so, let ChatManager handle it
      const currentPath = window.location.pathname;
      const isOnChatPage =
        currentPath.includes("/chat") ||
        currentPath.includes("/communication") ||
        currentPath.includes("/chat-manager");

      if (isOnChatPage) {
        console.log("🌐 [GlobalCall] On chat page, skipping global handler");
        return; // Let ChatManager handle it
      }

      // Only show incoming call if not already in a call
      if (callStatus === "idle" && !activeCall && !incomingCall) {
        setIncomingCall({
          callId: data.callId,
          callerId: data.callerId,
          callerName: data.callerName,
          roomName: data.roomUrl || "",
          token: data.token, // Include token
          isVideoCall: data.isVideoCall,
        });
      }
    });

    const unsub2 = onCallAccepted(() => {
      console.log(
        "🌐 [GlobalCall] Call accepted! Joining with pending data:",
        pendingRoomData
      );
      setCallStatus("active");
      // Now apply the pending room data
      if (pendingRoomData) {
        setActiveCall((prev) =>
          prev && prev.callId === pendingRoomData.callId
            ? {
                ...prev,
                roomName: pendingRoomData.roomUrl,
                token: pendingRoomData.token,
              }
            : prev
        );
        setPendingRoomData(null);
      }
    });

    const unsub3 = onCallDeclined(() => {
      console.log("🌐 [GlobalCall] Call declined");
      setActiveCall(null);
      setPendingRoomData(null);
      setCallStatus("idle");
    });

    const unsub4 = onCallEnded(() => {
      console.log("🌐 [GlobalCall] Call ended");
      setActiveCall(null);
      setPendingRoomData(null);
      setCallStatus("idle");
    });

    const unsub5 = onCallBusy(() => {
      console.log("🌐 [GlobalCall] User busy");
      setActiveCall(null);
      setPendingRoomData(null);
      setCallStatus("idle");
    });

    const unsub6 = onNoAnswer(() => {
      console.log("🌐 [GlobalCall] No answer");
      setActiveCall(null);
      setPendingRoomData(null);
      setCallStatus("idle");
    });

    return () => {
      unsubRoomReady?.();
      unsub1?.();
      unsub2?.();
      unsub3?.();
      unsub4?.();
      unsub5?.();
      unsub6?.();
    };
  }, [
    callStatus,
    activeCall,
    pendingRoomData,
    onRoomReady,
    onIncomingCall,
    onCallAccepted,
    onCallDeclined,
    onCallEnded,
    onCallBusy,
    onNoAnswer,
  ]);

  const value: GlobalCallContextValue = {
    isConnected,
    onlineUsers,
    incomingCall,
    activeCall,
    callStatus,
    startCall,
    isInCall: callStatus !== "idle" || !!activeCall,
  };

  // Check if on chat page (let ChatManager handle calls there)
  const isOnChatPage = () => {
    const currentPath = window.location.pathname;
    return (
      currentPath.includes("/chat") ||
      currentPath.includes("/communication") ||
      currentPath.includes("/chat-manager")
    );
  };

  return (
    <GlobalCallContext.Provider value={value}>
      {children}

      {/* Global Incoming Call Modal - Only show when NOT on chat page */}
      {!isOnChatPage() && (
        <IncomingCallModal
          isOpen={!!incomingCall}
          callerName={incomingCall?.callerName || ""}
          isVideoCall={incomingCall?.isVideoCall || false}
          onAccept={handleAcceptCall}
          onDecline={handleDeclineCall}
        />
      )}

      {/* Calling Modal - Show while waiting for room to be ready (NOT on chat page) */}
      {!isOnChatPage() &&
        activeCall &&
        !activeCall.roomName &&
        callStatus === "calling" && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 shadow-2xl text-center max-w-sm">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-white animate-pulse"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                Đang gọi...
              </h3>
              <p className="text-slate-500 mb-6">
                {activeCall.recipientName || "Người dùng"}
              </p>
              <div className="flex justify-center gap-2 mb-4">
                <div
                  className="w-2 h-2 bg-teal-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-teal-500 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-teal-500 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></div>
              </div>
              <button
                onClick={handleEndCall}
                className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-full font-medium transition-colors"
              >
                Hủy cuộc gọi
              </button>
            </div>
          </div>
        )}

      {/* Global Video Call Modal - Only show when call is ACTIVE and NOT on chat page */}
      {!isOnChatPage() &&
        activeCall &&
        activeCall.roomName &&
        callStatus === "active" && (
          <VideoCallModal
            isOpen={true}
            onClose={handleEndCall}
            roomName={activeCall.roomName}
            token={activeCall.token}
            displayName={currentUserName}
            otherUserName={activeCall.recipientName}
            isVideoCall={activeCall.isVideoCall}
            callStatus={callStatus}
            onCallEnd={handleEndCall}
          />
        )}
    </GlobalCallContext.Provider>
  );
};

export default GlobalCallProvider;
