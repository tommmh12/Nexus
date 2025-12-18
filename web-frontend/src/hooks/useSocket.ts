import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

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
  roomUrl: string; // Daily.co URL
  token?: string; // Daily.co meeting token
  isVideoCall: boolean;
  provider?: "DAILY"; // Provider type
}

interface RoomReady {
  callId: string;
  roomUrl: string;
  roomName: string;
  token?: string; // Daily.co token
  provider?: "DAILY";
}

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const isInitialized = useRef(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    // Prevent multiple socket connections
    if (isInitialized.current && socketRef.current?.connected) {
      return;
    }

    // Disconnect existing socket if any
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    isInitialized.current = true;

    // Initialize socket connection
    socketRef.current = io(SOCKET_URL, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      forceNew: false,
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
      // Don't disconnect on HMR - only on actual unmount
      if (import.meta.hot) {
        // In development with HMR, keep connection alive
        console.log("🔄 HMR detected, keeping socket connection");
      } else {
        socket.disconnect();
        isInitialized.current = false;
      }
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
      if (socketRef.current && socketRef.current.connected) {
        console.log("🔌 Socket emitting send:message", data);
        socketRef.current.emit("send:message", data);
      } else {
        console.error("❌ Socket not available or not connected", {
          socketExists: !!socketRef.current,
          connected: socketRef.current?.connected,
        });
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

  // ==================== EDIT/RECALL/REACTION FUNCTIONS ====================

  // Edit message
  const editMessage = useCallback(
    (messageId: string, conversationId: string, newText: string) => {
      if (socketRef.current) {
        socketRef.current.emit("message:edit", {
          messageId,
          conversationId,
          newText,
        });
      }
    },
    []
  );

  // Recall message
  const recallMessage = useCallback(
    (messageId: string, conversationId: string) => {
      if (socketRef.current) {
        socketRef.current.emit("message:recall", { messageId, conversationId });
      }
    },
    []
  );

  // Add reaction
  const addReaction = useCallback(
    (messageId: string, conversationId: string, emoji: string) => {
      if (socketRef.current) {
        socketRef.current.emit("reaction:add", {
          messageId,
          conversationId,
          emoji,
        });
      }
    },
    []
  );

  // Remove reaction
  const removeReaction = useCallback(
    (messageId: string, conversationId: string, emoji: string) => {
      if (socketRef.current) {
        socketRef.current.emit("reaction:remove", {
          messageId,
          conversationId,
          emoji,
        });
      }
    },
    []
  );

  // Listen for edited messages
  const onMessageEdited = useCallback(
    (
      callback: (data: {
        messageId: string;
        conversationId: string;
        newText: string;
        editedAt: string;
      }) => void
    ) => {
      if (socketRef.current) {
        socketRef.current.on("message:edited", callback);
        return () => {
          socketRef.current?.off("message:edited", callback);
        };
      }
    },
    []
  );

  // Listen for recalled messages
  const onMessageRecalled = useCallback(
    (
      callback: (data: { messageId: string; conversationId: string }) => void
    ) => {
      if (socketRef.current) {
        socketRef.current.on("message:recalled", callback);
        return () => {
          socketRef.current?.off("message:recalled", callback);
        };
      }
    },
    []
  );

  // Listen for reaction added
  const onReactionAdded = useCallback(
    (
      callback: (data: {
        messageId: string;
        conversationId: string;
        userId: string;
        userName: string;
        emoji: string;
      }) => void
    ) => {
      if (socketRef.current) {
        socketRef.current.on("reaction:added", callback);
        return () => {
          socketRef.current?.off("reaction:added", callback);
        };
      }
    },
    []
  );

  // Listen for reaction removed
  const onReactionRemoved = useCallback(
    (
      callback: (data: {
        messageId: string;
        conversationId: string;
        userId: string;
        emoji: string;
      }) => void
    ) => {
      if (socketRef.current) {
        socketRef.current.on("reaction:removed", callback);
        return () => {
          socketRef.current?.off("reaction:removed", callback);
        };
      }
    },
    []
  );

  // ==================== CALL FUNCTIONS ====================

  // Start a call (video or audio)
  const startCall = useCallback(
    (data: {
      recipientId: string;
      recipientName: string;
      isVideoCall: boolean;
    }) => {
      console.log("📞 startCall called", {
        data,
        socketExists: !!socketRef.current,
        connected: socketRef.current?.connected,
      });

      if (socketRef.current && socketRef.current.connected) {
        const callId = `call-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        const roomName = `room-${callId}`;

        console.log("📞 Emitting call:start", { callId, roomName, ...data });
        socketRef.current.emit("call:start", {
          callId,
          recipientId: data.recipientId,
          recipientName: data.recipientName,
          roomName,
          isVideoCall: data.isVideoCall,
        });

        return { callId, roomName };
      }
      console.error(
        "❌ Cannot start call: socket not available or not connected"
      );
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

  // Listen for room ready (Daily.co room created with token)
  const onRoomReady = useCallback((callback: (data: RoomReady) => void) => {
    if (socketRef.current) {
      socketRef.current.on("call:room_ready", callback);
      return () => {
        socketRef.current?.off("call:room_ready", callback);
      };
    }
  }, []);

  // Listen for no answer (call timed out)
  const onNoAnswer = useCallback(
    (callback: (data: { callId: string }) => void) => {
      if (socketRef.current) {
        socketRef.current.on("call:no_answer", callback);
        return () => {
          socketRef.current?.off("call:no_answer", callback);
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
    onRoomReady,
    onNoAnswer,
    // Edit/Recall/Reaction functions
    editMessage,
    recallMessage,
    addReaction,
    removeReaction,
    onMessageEdited,
    onMessageRecalled,
    onReactionAdded,
    onReactionRemoved,
  };
};
