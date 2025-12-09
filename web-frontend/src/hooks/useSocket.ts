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

    // User status events
    socket.on("user:online", (data: UserStatus) => {
      setOnlineUsers((prev) => new Set(prev).add(data.userId));
    });

    socket.on("user:offline", (data: UserStatus) => {
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
  };
};
