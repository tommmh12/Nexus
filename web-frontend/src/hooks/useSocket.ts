import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000";

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  message_text?: string;
  message_type?: string;
  is_read: boolean;
  created_at: string;
  sender_name?: string;
}

interface TypingStatus {
  conversationId: string;
  userId: string;
  isTyping: boolean;
}

interface UserStatus {
  userId: string;
  status: "online" | "offline" | "busy" | "away";
  timestamp: string;
}

// Call related interfaces
interface CallData {
  callId: string;
  callerId: string;
  callerName: string;
  recipientId: string;
  recipientName: string;
  roomName: string;
  isVideoCall: boolean;
  timestamp: string;
}

interface IncomingCall {
  callId: string;
  callerId: string;
  callerName: string;
  roomName: string;
  isVideoCall: boolean;
}

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    // Initialize socket connection
    socketRef.current = io(SOCKET_URL, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    const socket = socketRef.current;

    // Connection events
    socket.on("connect", () => {
      console.log("✅ Socket connected");
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
      setIsConnected(false);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    // Receive full list of online users when connecting
    socket.on("users:online_list", (data: { userIds: string[] }) => {
      console.log("👥 Received online users list:", data.userIds);
      setOnlineUsers(new Set(data.userIds));
    });

    // User status events
    socket.on("user:online", (data: UserStatus) => {
      console.log("🟢 User online:", data.userId);
      setOnlineUsers((prev) => new Set(prev).add(data.userId));
    });

    socket.on("user:offline", (data: UserStatus) => {
      console.log("🔴 User offline:", data.userId);
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(data.userId);
        return newSet;
      });
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  // Join conversation room
  const joinConversation = useCallback((conversationId: string) => {
    if (socketRef.current) {
      socketRef.current.emit("join:conversation", { conversationId });
    }
  }, []);

  // Leave conversation room
  const leaveConversation = useCallback((conversationId: string) => {
    if (socketRef.current) {
      socketRef.current.emit("leave:conversation", { conversationId });
    }
  }, []);

  // Send message
  const sendMessage = useCallback(
    (data: {
      conversationId?: string;
      recipientId?: string;
      messageText: string;
      messageType?: string;
    }) => {
      if (socketRef.current) {
        socketRef.current.emit("send:message", data);
      }
    },
    []
  );

  // Typing indicators
  const startTyping = useCallback((conversationId: string) => {
    if (socketRef.current) {
      socketRef.current.emit("typing:start", { conversationId });
    }
  }, []);

  const stopTyping = useCallback((conversationId: string) => {
    if (socketRef.current) {
      socketRef.current.emit("typing:stop", { conversationId });
    }
  }, []);

  // Mark as read
  const markAsRead = useCallback((conversationId: string) => {
    if (socketRef.current) {
      socketRef.current.emit("message:read", { conversationId });
    }
  }, []);

  // Delete message
  const deleteMessage = useCallback(
    (messageId: string, conversationId: string) => {
      if (socketRef.current) {
        socketRef.current.emit("message:delete", { messageId, conversationId });
      }
    },
    []
  );

  // Listen for new messages
  const onNewMessage = useCallback((callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on("message:new", callback);
      return () => {
        socketRef.current?.off("message:new", callback);
      };
    }
  }, []);

  // Listen for typing events
  const onTyping = useCallback((callback: (data: TypingStatus) => void) => {
    if (socketRef.current) {
      socketRef.current.on("typing:start", callback);
      return () => {
        socketRef.current?.off("typing:start", callback);
      };
    }
  }, []);

  const onStopTyping = useCallback((callback: (data: TypingStatus) => void) => {
    if (socketRef.current) {
      socketRef.current.on("typing:stop", callback);
      return () => {
        socketRef.current?.off("typing:stop", callback);
      };
    }
  }, []);

  // Listen for read receipts
  const onMessagesRead = useCallback((callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on("messages:read", callback);
      return () => {
        socketRef.current?.off("messages:read", callback);
      };
    }
  }, []);

  // Listen for deleted messages
  const onMessageDeleted = useCallback((callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on("message:deleted", callback);
      return () => {
        socketRef.current?.off("message:deleted", callback);
      };
    }
  }, []);

  // ==================== CALL FUNCTIONS ====================

  // Start a call (video or audio)
  const startCall = useCallback(
    (data: {
      recipientId: string;
      recipientName: string;
      isVideoCall: boolean;
    }) => {
      if (socketRef.current) {
        const callId = `call-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        const roomName = `room-${callId}`;

        socketRef.current.emit("call:start", {
          callId,
          recipientId: data.recipientId,
          recipientName: data.recipientName,
          roomName,
          isVideoCall: data.isVideoCall,
        });

        return { callId, roomName };
      }
      return null;
    },
    []
  );

  // Accept incoming call
  const acceptCall = useCallback((callId: string) => {
    if (socketRef.current) {
      socketRef.current.emit("call:accept", { callId });
    }
  }, []);

  // Decline incoming call
  const declineCall = useCallback((callId: string, callerId: string) => {
    if (socketRef.current) {
      socketRef.current.emit("call:decline", { callId, callerId });
    }
  }, []);

  // End active call
  const endCall = useCallback((callId: string, recipientId: string) => {
    if (socketRef.current) {
      socketRef.current.emit("call:end", { callId, recipientId });
    }
  }, []);

  // Listen for incoming calls
  const onIncomingCall = useCallback(
    (callback: (data: IncomingCall) => void) => {
      if (socketRef.current) {
        socketRef.current.on("call:incoming", callback);
        return () => {
          socketRef.current?.off("call:incoming", callback);
        };
      }
    },
    []
  );

  // Listen for call accepted
  const onCallAccepted = useCallback(
    (
      callback: (data: {
        callId: string;
        recipientId: string;
        roomName: string;
      }) => void
    ) => {
      if (socketRef.current) {
        socketRef.current.on("call:accepted", callback);
        return () => {
          socketRef.current?.off("call:accepted", callback);
        };
      }
    },
    []
  );

  // Listen for call declined
  const onCallDeclined = useCallback(
    (callback: (data: { callId: string; recipientId: string }) => void) => {
      if (socketRef.current) {
        socketRef.current.on("call:declined", callback);
        return () => {
          socketRef.current?.off("call:declined", callback);
        };
      }
    },
    []
  );

  // Listen for call ended
  const onCallEnded = useCallback(
    (callback: (data: { callId: string }) => void) => {
      if (socketRef.current) {
        socketRef.current.on("call:ended", callback);
        return () => {
          socketRef.current?.off("call:ended", callback);
        };
      }
    },
    []
  );

  // Listen for call busy (recipient is in another call)
  const onCallBusy = useCallback(
    (callback: (data: { callId: string; recipientId: string }) => void) => {
      if (socketRef.current) {
        socketRef.current.on("call:busy", callback);
        return () => {
          socketRef.current?.off("call:busy", callback);
        };
      }
    },
    []
  );

  return {
    socket: socketRef.current,
    isConnected,
    onlineUsers,
    joinConversation,
    leaveConversation,
    sendMessage,
    startTyping,
    stopTyping,
    markAsRead,
    deleteMessage,
    onNewMessage,
    onTyping,
    onStopTyping,
    onMessagesRead,
    onMessageDeleted,
    // Call functions
    startCall,
    acceptCall,
    declineCall,
    endCall,
    onIncomingCall,
    onCallAccepted,
    onCallDeclined,
    onCallEnded,
    onCallBusy,
  };
};
