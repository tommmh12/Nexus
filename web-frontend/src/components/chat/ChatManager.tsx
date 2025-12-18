import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  Send,
  Paperclip,
  Phone,
  Video,
  MoreVertical,
  Plus,
  MessageCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Check,
  CheckCheck,
  Shield,
  X,
  Image as ImageIcon,
  FileText,
  Link as LinkIcon,
  ChevronRight,
  Bell,
  BellOff,
  Trash2,
  Users,
} from "lucide-react";
import { ChatUser, ChatMessage } from "../../hooks/useChat";
import { useSocket } from "../../hooks/useSocket";
import { chatService } from "../../services/chatService";
import { Avatar } from "../ui/Avatar";
import { Skeleton } from "../ui/Skeleton";
import { Modal } from "../ui/Modal";
import { VideoCallModal } from "./VideoCallModal";
import { IncomingCallModal } from "./IncomingCallModal";
import { MessageActions, EditMessageModal } from "./MessageActions";
import { ConnectionStatus } from "./ConnectionStatus";
import { ResizableSidebar } from "./ResizableSidebar";

export type UserRole = "admin" | "department-manager" | "employee";
export interface ChatManagerProps {
  userRole: UserRole;
  canModerate?: boolean;
}

interface Conversation {
  id: string;
  type: "direct" | "group";
  name: string;
  avatar?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  online?: boolean;
  memberCount?: number;
  participantId?: string;
}

const getPermissions = (role: UserRole) => ({
  canModerateChat: role === "admin" || role === "department-manager",
});

// Helper to get current user info from localStorage
const getCurrentUser = (): { id: string; name: string } => {
  try {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      return {
        id: user.id || user.userId || "",
        name: user.full_name || user.fullName || user.name || "You",
      };
    }
  } catch (e) {
    console.error("Error parsing user from localStorage:", e);
  }
  return { id: "", name: "You" };
};

const getCurrentUserId = (): string => getCurrentUser().id;
const getCurrentUserName = (): string => getCurrentUser().name;

export default function ChatManager({
  userRole,
  canModerate = false,
}: ChatManagerProps) {
  const permissions = getPermissions(userRole);
  const effectiveCanModerate = canModerate || permissions.canModerateChat;
  const currentUserId = getCurrentUserId();

  // State - MUST be declared before any useEffect
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState({
    conversations: true,
    messages: false,
    users: false,
  });
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "direct" | "group">(
    "all"
  );
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [showModerationPanel, setShowModerationPanel] = useState(false);
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    messageId: string;
    currentText: string;
  }>({ isOpen: false, messageId: "", currentText: "" });
  const [showInfoPanel, setShowInfoPanel] = useState(false);

  // Attachment state
  const [attachedFiles, setAttachedFiles] = useState<
    { file: File; preview: string; type: "image" | "file" }[]
  >([]);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Muted conversations
  const [mutedConversations, setMutedConversations] = useState<Set<string>>(
    new Set()
  );

  // Shared media for info panel
  const [sharedMedia, setSharedMedia] = useState<{
    images: string[];
    files: { name: string; url: string }[];
    links: string[];
  }>({ images: [], files: [], links: [] });

  // Message search within conversation
  const [messageSearchTerm, setMessageSearchTerm] = useState("");
  const [messageSearchActive, setMessageSearchActive] = useState(false);

  // Expand state for media sections
  const [expandedSection, setExpandedSection] = useState<
    "images" | "files" | "links" | null
  >(null);

  // Call state
  const [activeCall, setActiveCall] = useState<{
    callId: string;
    roomName: string;
    token?: string; // Daily.co meeting token
    recipientId: string;
    recipientName: string;
    isVideoCall: boolean;
  } | null>(null);
  const [incomingCall, setIncomingCall] = useState<{
    callId: string;
    callerId: string;
    callerName: string;
    roomName?: string;
    token?: string; // Daily.co meeting token
    isVideoCall: boolean;
  } | null>(null);
  const [callStatus, setCallStatus] = useState<
    "idle" | "calling" | "connecting" | "active"
  >("idle");

  // Pending room data - saved when room is ready but call not yet accepted
  const [pendingRoomData, setPendingRoomData] = useState<{
    callId: string;
    roomUrl: string;
    token?: string;
  } | null>(null);

  const [searchParams] = useSearchParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Socket hook - REALTIME
  const {
    isConnected,
    onlineUsers,
    joinConversation,
    leaveConversation,
    sendMessage: socketSendMessage,
    onNewMessage,
    onMessagesRead,
    onMessageDeleted,
    onMessageEdited,
    onMessageRecalled,
    startCall,
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
    editMessage: socketEditMessage,
    recallMessage: socketRecallMessage,
    addReaction: socketAddReaction,
    removeReaction: socketRemoveReaction,
  } = useSocket();

  // Debug log
  useEffect(() => {
    console.log("🔑 Current User ID:", currentUserId);
  }, [currentUserId]);

  // ==================== DATA FETCHING ====================
  const fetchConversations = useCallback(async () => {
    try {
      const response = await chatService.getConversations();
      const rawData = response.data || response;
      const mapped: Conversation[] = (
        Array.isArray(rawData) ? rawData : []
      ).map((c: any) => ({
        id: c.id,
        type: c.isGroup ? "group" : "direct",
        name: c.group_name || c.other_user_name || c.name || "Unknown",
        avatar: c.group_avatar || c.other_user_avatar || c.avatar,
        lastMessage: c.last_message_text || c.lastMessage,
        lastMessageTime:
          c.last_message_time || c.lastMessageTime || c.created_at,
        unreadCount: c.unread_count || c.unreadCount || 0,
        online:
          c.other_user_status === "online" || onlineUsers.has(c.other_user_id),
        memberCount: c.member_count,
        participantId:
          c.other_user_id || c.participant2_id || c.participant1_id,
      }));
      setConversations(mapped);
    } catch (err) {
      console.error("Error fetching conversations:", err);
    } finally {
      setLoading((prev) => ({ ...prev, conversations: false }));
    }
  }, [onlineUsers]);

  const fetchMessages = useCallback(
    async (conversationId: string) => {
      setLoading((prev) => ({ ...prev, messages: true }));
      try {
        const response = await chatService.getMessages(conversationId, 50, 0);
        const rawData = response.data || response;
        const mapped: ChatMessage[] = (
          Array.isArray(rawData) ? rawData : []
        ).map((m: any) => ({
          id: m.id,
          senderId: m.sender_id === currentUserId ? "me" : m.sender_id,
          senderName: m.sender_name || "Unknown",
          senderAvatar: m.sender_avatar,
          senderDepartment: m.sender_department,
          content: m.is_recalled
            ? "Tin nhắn đã được thu hồi"
            : m.message_text || m.content,
          timestamp: m.created_at || m.timestamp,
          status: m.is_read ? "read" : "delivered",
          type: m.message_type || "text",
          editedAt: m.edited_at,
          isRecalled: m.is_recalled || false,
        }));
        // Sort messages by timestamp ascending (oldest first, newest last at bottom)
        mapped.sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        setMessages(mapped);
      } catch (err) {
        console.error("Error fetching messages:", err);
      } finally {
        setLoading((prev) => ({ ...prev, messages: false }));
      }
    },
    [currentUserId]
  );

  const searchUsers = useCallback(
    async (query: string) => {
      setLoading((prev) => ({ ...prev, users: true }));
      try {
        const response = await chatService.searchUsers(query);
        const rawData = response.data || response;
        setUsers(
          (Array.isArray(rawData) ? rawData : []).map((u: any) => ({
            id: u.id,
            name: u.full_name || u.name,
            avatar: u.avatar_url,
            department: u.department_name || u.department,
            online: u.status === "online" || onlineUsers.has(u.id),
          }))
        );
      } catch (err) {
        console.error("Error searching users:", err);
      } finally {
        setLoading((prev) => ({ ...prev, users: false }));
      }
    },
    [onlineUsers]
  );

  // ==================== REALTIME MESSAGE HANDLING ====================
  useEffect(() => {
    // Listen for new messages
    const unsubNewMessage = onNewMessage((data: any) => {
      const msg = data.message;
      if (!msg) return;

      // Determine if this message is from current user
      const isFromMe = msg.sender_id === currentUserId;

      const newMessage: ChatMessage = {
        id: msg.id,
        senderId: isFromMe ? "me" : msg.sender_id,
        senderName: msg.sender_name || "Unknown",
        senderAvatar: msg.sender_avatar,
        content: msg.message_text || msg.content,
        timestamp: msg.created_at || new Date().toISOString(),
        status: isFromMe ? "sent" : "delivered",
        type: msg.message_type || "text",
      };

      // Add message if it's for current conversation
      if (data.conversationId === activeConversationId) {
        setMessages((prev) => {
          // Avoid duplicates by checking both id and tempId
          if (prev.some((m) => m.id === newMessage.id)) return prev;

          // If this is our own message, replace the optimistic one
          if (isFromMe) {
            // Find and replace optimistic message (has tempId, status 'sending')
            const hasOptimistic = prev.some(
              (m) => m.status === "sending" && m.content === newMessage.content
            );
            if (hasOptimistic) {
              return prev.map((m) =>
                m.status === "sending" && m.content === newMessage.content
                  ? { ...newMessage, status: "sent" }
                  : m
              );
            }
          }

          return [...prev, newMessage];
        });
      }

      // Update conversation list
      setConversations((prev) =>
        prev.map((c) =>
          c.id === data.conversationId
            ? {
                ...c,
                lastMessage: newMessage.content,
                lastMessageTime: newMessage.timestamp,
                unreadCount:
                  c.id === activeConversationId
                    ? 0
                    : isFromMe
                    ? c.unreadCount
                    : c.unreadCount + 1,
              }
            : c
        )
      );
    });

    // Listen for read receipts
    const unsubRead = onMessagesRead?.((data: any) => {
      if (data.conversationId === activeConversationId) {
        setMessages((prev) =>
          prev.map((m) => (m.senderId === "me" ? { ...m, status: "read" } : m))
        );
      }
    });

    // Listen for deleted messages
    const unsubDeleted = onMessageDeleted?.((data: any) => {
      if (data.conversationId === activeConversationId) {
        setMessages((prev) => prev.filter((m) => m.id !== data.messageId));
      }
    });

    // Listen for edited messages
    const unsubEdited = onMessageEdited?.((data: any) => {
      if (data.conversationId === activeConversationId) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === data.messageId
              ? { ...m, content: data.newText, editedAt: data.editedAt }
              : m
          )
        );
      }
    });

    // Listen for recalled messages
    const unsubRecalled = onMessageRecalled?.((data: any) => {
      if (data.conversationId === activeConversationId) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === data.messageId
              ? { ...m, content: "Tin nhắn đã được thu hồi", isRecalled: true }
              : m
          )
        );
      }
    });

    return () => {
      unsubNewMessage?.();
      unsubRead?.();
      unsubDeleted?.();
      unsubEdited?.();
      unsubRecalled?.();
    };
  }, [
    activeConversationId,
    currentUserId,
    onNewMessage,
    onMessagesRead,
    onMessageDeleted,
    onMessageEdited,
    onMessageRecalled,
  ]);

  // ==================== EFFECTS ====================
  // Initial load
  useEffect(() => {
    fetchConversations();
    searchUsers("");
  }, []);

  // Join/leave conversation room for realtime
  useEffect(() => {
    if (activeConversationId) {
      joinConversation(activeConversationId);
      fetchMessages(activeConversationId);
      chatService.markAsRead(activeConversationId).catch(console.error);
      // Reset unread count
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversationId ? { ...c, unreadCount: 0 } : c
        )
      );
    }
    return () => {
      if (activeConversationId) leaveConversation(activeConversationId);
    };
  }, [
    activeConversationId,
    joinConversation,
    leaveConversation,
    fetchMessages,
  ]);

  // Handle deep link
  useEffect(() => {
    const targetUserId = searchParams.get("userId");
    if (targetUserId && conversations.length > 0) {
      const existing = conversations.find(
        (c) => c.participantId === targetUserId
      );
      if (existing) setActiveConversationId(existing.id);
      else {
        chatService
          .getOrCreateConversation(targetUserId)
          .then((data) => {
            setActiveConversationId(data.id);
            fetchConversations();
          })
          .catch(console.error);
      }
    }
  }, [searchParams, conversations]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load muted conversations from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("mutedConversations");
    if (saved) {
      try {
        setMutedConversations(new Set(JSON.parse(saved)));
      } catch (e) {
        console.error("Error loading muted conversations:", e);
      }
    }
  }, []);

  // Extract shared media from messages
  useEffect(() => {
    if (messages.length > 0) {
      const images: string[] = [];
      const links: string[] = [];

      messages.forEach((msg) => {
        // Extract image URLs from content
        const imgMatches = msg.content.match(
          /https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp)/gi
        );
        if (imgMatches) images.push(...imgMatches);

        // Extract links
        const linkMatches = msg.content.match(/https?:\/\/[^\s]+/gi);
        if (linkMatches) {
          linkMatches.forEach((link) => {
            if (!link.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
              links.push(link);
            }
          });
        }

        // If message type is image
        if (msg.type === "image" && msg.content) {
          images.push(msg.content);
        }
      });

      setSharedMedia({
        images: [...new Set(images)],
        files: [],
        links: [...new Set(links)],
      });
    }
  }, [messages]);

  // ==================== HANDLERS ====================

  // File attachment handlers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const isImage = file.type.startsWith("image/");

      if (isImage) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setAttachedFiles((prev) => [
            ...prev,
            {
              file,
              preview: event.target?.result as string,
              type: "image",
            },
          ]);
        };
        reader.readAsDataURL(file);
      } else {
        setAttachedFiles((prev) => [
          ...prev,
          {
            file,
            preview: "",
            type: "file",
          },
        ]);
      }
    });

    // Reset input
    if (e.target) e.target.value = "";
  };

  const removeAttachment = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleMuteConversation = (conversationId: string) => {
    setMutedConversations((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(conversationId)) {
        newSet.delete(conversationId);
      } else {
        newSet.add(conversationId);
      }
      localStorage.setItem("mutedConversations", JSON.stringify([...newSet]));
      return newSet;
    });
  };

  const handleSendMessage = async () => {
    console.log("📤 handleSendMessage called", {
      messageInput,
      activeConversationId,
      isConnected,
      attachedFiles: attachedFiles.length,
    });

    if (
      (!messageInput.trim() && attachedFiles.length === 0) ||
      !activeConversationId
    ) {
      console.warn("❌ Cannot send: empty message or no conversation", {
        messageInput: messageInput.trim(),
        activeConversationId,
      });
      return;
    }

    const tempId = crypto.randomUUID();
    let content = messageInput.trim();
    let messageType = "text";

    // Handle file uploads first
    if (attachedFiles.length > 0) {
      setIsUploadingFile(true);
      const token = localStorage.getItem("accessToken");
      const API_BASE =
        (import.meta as any).env?.VITE_API_URL || "http://localhost:5000/api";

      for (const attachment of attachedFiles) {
        try {
          const formData = new FormData();
          formData.append("file", attachment.file);

          const response = await fetch(`${API_BASE}/chat/upload`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          });

          const result = await response.json();
          if (result.success && result.data?.url) {
            if (attachment.type === "image") {
              content = content
                ? `${content}\n${result.data.url}`
                : result.data.url;
              messageType = "image";
            } else {
              content = content
                ? `${content}\n[File: ${attachment.file.name}](${result.data.url})`
                : `[File: ${attachment.file.name}](${result.data.url})`;
            }
          }
        } catch (error) {
          console.error("Error uploading file:", error);
        }
      }
      setIsUploadingFile(false);
      setAttachedFiles([]);
    }

    if (!content) return;

    console.log("📨 Sending message:", {
      content,
      conversationId: activeConversationId,
      isConnected,
    });

    // Optimistic UI - add message immediately
    const optimisticMsg: ChatMessage = {
      id: tempId,
      tempId,
      senderId: "me",
      senderName: getCurrentUserName(),
      content,
      timestamp: new Date().toISOString(),
      status: "sending",
      type: messageType,
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    setMessageInput("");

    // Send via socket (realtime)
    if (isConnected) {
      console.log("🔌 Sending via socket...");
      socketSendMessage({
        conversationId: activeConversationId,
        messageText: content,
        messageType,
      });

      // Update to sent after short delay
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) => (m.tempId === tempId ? { ...m, status: "sent" } : m))
        );
      }, 300);
    } else {
      // Fallback to REST API if socket not connected
      console.warn("⚠️ Socket not connected, using REST API fallback");
      chatService
        .sendMessage({
          conversationId: activeConversationId,
          messageText: content,
          messageType,
        })
        .then(() => {
          console.log("✅ Message sent via REST API");
          setMessages((prev) =>
            prev.map((m) =>
              m.tempId === tempId ? { ...m, status: "sent" } : m
            )
          );
        })
        .catch((err) => {
          console.error("❌ Failed to send message:", err);
          setMessages((prev) =>
            prev.map((m) =>
              m.tempId === tempId ? { ...m, status: "failed" } : m
            )
          );
        });
    }
  };

  const handleStartChat = async (user: ChatUser) => {
    try {
      const data = await chatService.getOrCreateConversation(user.id);
      setActiveConversationId(data.id);
      setShowNewChat(false);
      setUserSearchTerm("");
      fetchConversations();
    } catch (err) {
      console.error("Error starting chat:", err);
    }
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays === 0)
      return date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    if (diffDays === 1) return "Hôm qua";
    if (diffDays < 7)
      return date.toLocaleDateString("vi-VN", { weekday: "short" });
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  // ==================== CALL HANDLERS ====================
  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId
  );

  const handleStartCall = (isVideoCall: boolean) => {
    console.log("📞 handleStartCall", {
      isVideoCall,
      activeConversation,
      isConnected,
      participantId: activeConversation?.participantId,
    });

    if (
      !activeConversation ||
      activeConversation.type !== "direct" ||
      !activeConversation.participantId
    ) {
      console.warn("❌ Cannot start call: invalid conversation", {
        activeConversation,
      });
      return;
    }

    if (!isConnected) {
      console.warn("❌ Cannot start call: socket not connected");
      alert("Không thể gọi: Kết nối bị gián đoạn. Vui lòng thử lại.");
      return;
    }

    const result = startCall({
      recipientId: activeConversation.participantId,
      recipientName: activeConversation.name,
      isVideoCall,
    });
    console.log("📞 startCall result:", result);

    if (result) {
      setCallStatus("calling");
      setActiveCall({
        callId: result.callId,
        roomName: "", // Don't set roomName yet - wait for call:room_ready
        recipientId: activeConversation.participantId,
        recipientName: activeConversation.name,
        isVideoCall,
      });
    }
  };

  const handleAcceptCall = () => {
    if (!incomingCall) return;
    acceptCall(incomingCall.callId);
    // B (recipient) already has roomName and token from incoming call
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
  };

  const handleDeclineCall = () => {
    if (!incomingCall) return;
    declineCall(incomingCall.callId, incomingCall.callerId);
    setIncomingCall(null);
  };

  const handleEndCall = () => {
    if (!activeCall) return;
    endCall(activeCall.callId, activeCall.recipientId);
    setActiveCall(null);
    setCallStatus("idle");
  };

  // Call event listeners
  useEffect(() => {
    // When room is ready (for caller), save pending data but DON'T join yet
    // Only join when recipient accepts the call
    const unsubRoomReady = onRoomReady?.((data) => {
      console.log("📹 Room ready (saved as pending):", data);
      // Save room data as pending - will be applied when call is accepted
      setPendingRoomData({
        callId: data.callId,
        roomUrl: data.roomUrl,
        token: data.token,
      });
    });

    const unsub1 = onIncomingCall((data) => {
      console.log("📞 Incoming call:", data);
      setIncomingCall({
        callId: data.callId,
        callerId: data.callerId,
        callerName: data.callerName,
        roomName: data.roomUrl || "",
        token: data.token, // Include token
        isVideoCall: data.isVideoCall,
      });
    });

    // When call is accepted, NOW update activeCall with room data
    const unsub2 = onCallAccepted(() => {
      console.log(
        "✅ Call accepted! Joining room with pending data:",
        pendingRoomData
      );
      setCallStatus("active");
      // Now apply the pending room data to activeCall
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
      setActiveCall(null);
      setPendingRoomData(null);
      setCallStatus("idle");
    });
    const unsub4 = onCallEnded(() => {
      setActiveCall(null);
      setPendingRoomData(null);
      setCallStatus("idle");
    });
    const unsub5 = onCallBusy(() => {
      setActiveCall(null);
      setPendingRoomData(null);
      setCallStatus("idle");
    });
    const unsub6 = onNoAnswer(() => {
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
    onRoomReady,
    onIncomingCall,
    onCallAccepted,
    onCallDeclined,
    onCallEnded,
    onCallBusy,
    onNoAnswer,
    pendingRoomData,
  ]);

  const handleModerateDelete = async (messageId: string) => {
    console.log("Moderate delete:", messageId);
  };
  const handleReportMessage = async (messageId: string, reason: string) => {
    console.log("Report:", messageId, reason);
  };

  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch = conv.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || conv.type === filterType;
    return matchesSearch && matchesType;
  });

  // ==================== RENDER ====================
  return (
    <div className="h-full min-h-[calc(100vh-64px)] flex bg-slate-50">
      <ConnectionStatus isConnected={isConnected} />

      {/* Sidebar */}
      <ResizableSidebar minWidth={320} maxWidth={480} defaultWidth={380}>
        <div className="w-full h-full flex flex-col bg-white border-r border-slate-200">
          <div className="p-5 border-b border-slate-100">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <MessageCircle className="text-teal-600" size={24} /> Tin nhắn
              </h2>
              <div className="flex gap-2">
                {effectiveCanModerate && (
                  <button
                    onClick={() => setShowModerationPanel(!showModerationPanel)}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      showModerationPanel
                        ? "bg-amber-500 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <Shield size={18} />
                  </button>
                )}
                <button
                  onClick={() => setShowNewChat(true)}
                  className="w-9 h-9 bg-teal-600 text-white rounded-lg flex items-center justify-center hover:bg-teal-700"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
            <div className="relative mb-4">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border-0 rounded-lg text-sm focus:ring-2 focus:ring-teal-500/30 outline-none"
              />
            </div>
            <div className="flex p-1 bg-slate-100 rounded-lg">
              {(["all", "direct", "group"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`flex-1 py-2 text-xs font-semibold rounded-md ${
                    filterType === type
                      ? "bg-white shadow-sm text-slate-900"
                      : "text-slate-500"
                  }`}
                >
                  {type === "all"
                    ? "Tất cả"
                    : type === "direct"
                    ? "Cá nhân"
                    : "Nhóm"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {loading.conversations ? (
              <div className="space-y-3 p-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex gap-3 p-3">
                    <Skeleton className="w-12 h-12" rounded="full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="w-3/4 h-4" />
                      <Skeleton className="w-1/2 h-3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <MessageCircle size={40} className="mx-auto mb-3 opacity-50" />
                <p>Không có cuộc trò chuyện</p>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setActiveConversationId(conv.id)}
                  className={`w-full p-3 flex gap-3 rounded-xl mb-1 ${
                    activeConversationId === conv.id
                      ? "bg-teal-50 border-l-4 border-teal-500"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <Avatar
                    name={conv.name}
                    src={conv.avatar}
                    size="md"
                    status={conv.online ? "online" : undefined}
                  />
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex justify-between items-center mb-0.5">
                      <h4
                        className={`text-sm truncate ${
                          activeConversationId === conv.id
                            ? "font-bold text-teal-700"
                            : "font-medium text-slate-800"
                        }`}
                      >
                        {conv.name}
                      </h4>
                      <span className="text-[10px] text-slate-400 ml-2">
                        {formatTime(conv.lastMessageTime || "")}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">
                      {conv.lastMessage || "Chưa có tin nhắn"}
                    </p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="self-center bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full">
                      {conv.unreadCount}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      </ResizableSidebar>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {activeConversation ? (
          <>
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <Avatar
                  name={activeConversation.name}
                  src={activeConversation.avatar}
                  size="md"
                  status={activeConversation.online ? "online" : undefined}
                />
                <div>
                  <h3 className="font-bold text-slate-900">
                    {activeConversation.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {activeConversation.online ? (
                      <span className="text-emerald-500 font-medium">
                        ● Online
                      </span>
                    ) : (
                      "Offline"
                    )}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {activeConversation.type === "direct" && (
                  <>
                    <button
                      onClick={() => handleStartCall(false)}
                      disabled={!isConnected}
                      className={`p-2.5 rounded-lg ${
                        isConnected
                          ? "bg-green-50 text-green-600 hover:bg-green-100"
                          : "bg-slate-100 text-slate-300 cursor-not-allowed"
                      }`}
                      title={!isConnected ? "Đang kết nối..." : "Gọi thoại"}
                    >
                      <Phone size={18} />
                    </button>
                    <button
                      onClick={() => handleStartCall(true)}
                      disabled={!isConnected}
                      className={`p-2.5 rounded-lg ${
                        isConnected
                          ? "bg-teal-50 text-teal-600 hover:bg-teal-100"
                          : "bg-slate-100 text-slate-300 cursor-not-allowed"
                      }`}
                      title={!isConnected ? "Đang kết nối..." : "Gọi video"}
                    >
                      <Video size={18} />
                    </button>
                  </>
                )}
                <button
                  onClick={() => setShowInfoPanel(!showInfoPanel)}
                  className={`p-2.5 rounded-lg transition-colors ${
                    showInfoPanel
                      ? "bg-teal-100 text-teal-600"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                  title="Thông tin cuộc trò chuyện"
                >
                  <MoreVertical size={18} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 bg-gradient-to-b from-slate-50 to-white">
              {loading.messages ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <MessageCircle size={36} className="text-slate-300" />
                  </div>
                  <p className="text-sm">
                    Chưa có tin nhắn. Hãy bắt đầu cuộc trò chuyện!
                  </p>
                </div>
              ) : (
                <div className="space-y-0.5">
                  {messages
                    .filter(
                      (msg) =>
                        !messageSearchTerm ||
                        msg.content
                          .toLowerCase()
                          .includes(messageSearchTerm.toLowerCase())
                    )
                    .map((msg, idx, filteredMsgs) => {
                      const isOwn = msg.senderId === "me";
                      const canEdit =
                        isOwn &&
                        !msg.isRecalled &&
                        msg.timestamp &&
                        Date.now() - new Date(msg.timestamp).getTime() <
                          5 * 60 * 1000;

                      // Check if message matches search
                      const isSearchMatch =
                        messageSearchTerm &&
                        msg.content
                          .toLowerCase()
                          .includes(messageSearchTerm.toLowerCase());

                      // Check if this message should be grouped with the previous one
                      const prevMsg = idx > 0 ? filteredMsgs[idx - 1] : null;
                      const isGrouped =
                        prevMsg &&
                        prevMsg.senderId === msg.senderId &&
                        msg.timestamp &&
                        prevMsg.timestamp &&
                        new Date(msg.timestamp).getTime() -
                          new Date(prevMsg.timestamp).getTime() <
                          60000; // Within 1 minute

                      // Check if next message is from same sender (to determine if we show time)
                      const nextMsg =
                        idx < filteredMsgs.length - 1
                          ? filteredMsgs[idx + 1]
                          : null;
                      const hasNextGrouped =
                        nextMsg &&
                        nextMsg.senderId === msg.senderId &&
                        msg.timestamp &&
                        nextMsg.timestamp &&
                        new Date(nextMsg.timestamp).getTime() -
                          new Date(msg.timestamp).getTime() <
                          60000;

                      return (
                        <div
                          key={msg.id || msg.tempId}
                          className={`flex gap-2 group ${
                            isOwn ? "flex-row-reverse" : ""
                          } ${isGrouped ? "mt-0.5" : "mt-3"} ${
                            isSearchMatch
                              ? "bg-yellow-50 -mx-2 px-2 py-1 rounded-lg"
                              : ""
                          }`}
                        >
                          {/* Avatar - only show on first message of group or for others' first messages */}
                          {!isOwn && (
                            <div className="flex-shrink-0 self-end w-8">
                              {!isGrouped && (
                                <Avatar
                                  name={msg.senderName}
                                  src={msg.senderAvatar}
                                  size="sm"
                                />
                              )}
                            </div>
                          )}
                          <div
                            className={`flex flex-col ${
                              isOwn ? "items-end" : "items-start"
                            } max-w-[60%]`}
                          >
                            {/* Name - only show on first message of group */}
                            {!isOwn && !isGrouped && (
                              <span className="text-xs font-medium text-slate-500 mb-0.5 ml-1">
                                {msg.senderName}
                              </span>
                            )}

                            {/* Message bubble with hover actions on same line */}
                            <div className="flex items-center gap-1 group/msg">
                              {isOwn && (
                                <div className="opacity-0 group-hover/msg:opacity-100 transition-opacity flex items-center gap-1">
                                  {msg.status !== "sending" &&
                                    msg.status !== "failed" && (
                                      <MessageActions
                                        messageId={msg.id}
                                        conversationId={
                                          activeConversationId || ""
                                        }
                                        isOwnMessage={isOwn}
                                        canEdit={canEdit}
                                        canModerate={effectiveCanModerate}
                                        isRecalled={msg.isRecalled || false}
                                        reactions={msg.reactions || []}
                                        onEdit={(id) =>
                                          setEditModal({
                                            isOpen: true,
                                            messageId: id,
                                            currentText: msg.content,
                                          })
                                        }
                                        onRecall={(id) =>
                                          activeConversationId &&
                                          socketRecallMessage(
                                            id,
                                            activeConversationId
                                          )
                                        }
                                        onAddReaction={(id, emoji) =>
                                          activeConversationId &&
                                          socketAddReaction(
                                            id,
                                            activeConversationId,
                                            emoji
                                          )
                                        }
                                        onRemoveReaction={(id, emoji) =>
                                          activeConversationId &&
                                          socketRemoveReaction(
                                            id,
                                            activeConversationId,
                                            emoji
                                          )
                                        }
                                        onModerateDelete={
                                          effectiveCanModerate
                                            ? handleModerateDelete
                                            : undefined
                                        }
                                        onReport={handleReportMessage}
                                      />
                                    )}
                                </div>
                              )}
                              <div
                                className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                                  isOwn
                                    ? "bg-teal-600 text-white"
                                    : "bg-slate-100 text-slate-800"
                                } ${
                                  !isGrouped && !isOwn ? "rounded-tl-md" : ""
                                } ${
                                  !isGrouped && isOwn ? "rounded-tr-md" : ""
                                } ${
                                  msg.status === "failed" ? "opacity-60" : ""
                                } ${msg.isRecalled ? "italic opacity-60" : ""}`}
                              >
                                {msg.content}
                                {msg.editedAt && !msg.isRecalled && (
                                  <span
                                    className={`ml-2 text-[10px] ${
                                      isOwn ? "text-teal-200" : "text-slate-400"
                                    }`}
                                  >
                                    (đã sửa)
                                  </span>
                                )}
                              </div>
                              {!isOwn && (
                                <div className="opacity-0 group-hover/msg:opacity-100 transition-opacity flex items-center gap-1">
                                  {msg.status !== "sending" &&
                                    msg.status !== "failed" && (
                                      <MessageActions
                                        messageId={msg.id}
                                        conversationId={
                                          activeConversationId || ""
                                        }
                                        isOwnMessage={isOwn}
                                        canEdit={canEdit}
                                        canModerate={effectiveCanModerate}
                                        isRecalled={msg.isRecalled || false}
                                        reactions={msg.reactions || []}
                                        onEdit={(id) =>
                                          setEditModal({
                                            isOpen: true,
                                            messageId: id,
                                            currentText: msg.content,
                                          })
                                        }
                                        onRecall={(id) =>
                                          activeConversationId &&
                                          socketRecallMessage(
                                            id,
                                            activeConversationId
                                          )
                                        }
                                        onAddReaction={(id, emoji) =>
                                          activeConversationId &&
                                          socketAddReaction(
                                            id,
                                            activeConversationId,
                                            emoji
                                          )
                                        }
                                        onRemoveReaction={(id, emoji) =>
                                          activeConversationId &&
                                          socketRemoveReaction(
                                            id,
                                            activeConversationId,
                                            emoji
                                          )
                                        }
                                        onModerateDelete={
                                          effectiveCanModerate
                                            ? handleModerateDelete
                                            : undefined
                                        }
                                        onReport={handleReportMessage}
                                      />
                                    )}
                                </div>
                              )}
                            </div>

                            {/* Time + status - only show on last message of group or when hovering */}
                            {(!hasNextGrouped ||
                              msg.status === "sending" ||
                              msg.status === "failed") && (
                              <div
                                className={`flex items-center gap-1 mt-0.5 ${
                                  isOwn ? "flex-row-reverse" : ""
                                }`}
                              >
                                <span className="text-[10px] text-slate-400">
                                  {msg.status === "sending"
                                    ? "Đang gửi..."
                                    : formatTime(msg.timestamp)}
                                </span>
                                {isOwn && (
                                  <>
                                    {msg.status === "sending" && (
                                      <Clock
                                        size={10}
                                        className="text-slate-400 animate-pulse"
                                      />
                                    )}
                                    {msg.status === "sent" && (
                                      <Check
                                        size={10}
                                        className="text-slate-400"
                                      />
                                    )}
                                    {msg.status === "delivered" && (
                                      <CheckCheck
                                        size={10}
                                        className="text-slate-400"
                                      />
                                    )}
                                    {msg.status === "read" && (
                                      <CheckCheck
                                        size={10}
                                        className="text-teal-500"
                                      />
                                    )}
                                    {msg.status === "failed" && (
                                      <button className="flex items-center gap-1 text-red-500 text-[10px]">
                                        <AlertCircle size={10} /> Thất bại{" "}
                                        <RefreshCw size={8} />
                                      </button>
                                    )}
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input */}
            <div className="px-6 py-4 border-t border-slate-200 bg-white">
              {/* Attachment Preview */}
              {attachedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3 p-2 bg-slate-50 rounded-lg">
                  {attachedFiles.map((attachment, index) => (
                    <div key={index} className="relative group">
                      {attachment.type === "image" ? (
                        <div className="relative">
                          <img
                            src={attachment.preview}
                            alt="Preview"
                            className="h-16 w-16 object-cover rounded-lg border border-slate-200"
                          />
                          <button
                            onClick={() => removeAttachment(index)}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-sm"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-slate-200">
                          <FileText size={16} className="text-slate-500" />
                          <span className="text-sm text-slate-700 max-w-[100px] truncate">
                            {attachment.file.name}
                          </span>
                          <button
                            onClick={() => removeAttachment(index)}
                            className="text-slate-400 hover:text-red-500"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Uploading indicator */}
              {isUploadingFile && (
                <div className="flex items-center gap-2 mb-2 text-sm text-teal-600">
                  <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                  Đang tải file...
                </div>
              )}

              <div className="flex items-center gap-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
                  title="Đính kèm file"
                >
                  <Paperclip size={20} />
                </button>
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 px-4 py-3 bg-slate-100 border-0 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/30 outline-none"
                  disabled={isUploadingFile}
                />
                <button
                  type="button"
                  onClick={handleSendMessage}
                  disabled={
                    (!messageInput.trim() && attachedFiles.length === 0) ||
                    isUploadingFile
                  }
                  className="p-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-slate-50">
            <div className="w-24 h-24 bg-white rounded-full shadow-sm flex items-center justify-center mb-6">
              <MessageCircle size={48} className="text-teal-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Chọn cuộc trò chuyện
            </h3>
            <p className="text-slate-500 text-sm mb-6 text-center max-w-xs">
              Chọn một cuộc trò chuyện từ danh sách hoặc bắt đầu cuộc trò chuyện
              mới
            </p>
            <button
              onClick={() => setShowNewChat(true)}
              className="px-6 py-2.5 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700"
            >
              Bắt đầu trò chuyện
            </button>
          </div>
        )}
      </div>

      {/* Info Panel Sidebar */}
      {showInfoPanel && activeConversation && (
        <div className="w-80 border-l border-slate-200 bg-white flex flex-col overflow-hidden">
          {/* Panel Header */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-900">
              Chi tiết cuộc trò chuyện
            </h3>
            <button
              onClick={() => setShowInfoPanel(false)}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500"
            >
              <X size={18} />
            </button>
          </div>

          {/* Profile Section */}
          <div className="p-6 text-center border-b border-slate-100">
            <Avatar
              name={activeConversation.name}
              src={activeConversation.avatar}
              size="xl"
              status={activeConversation.online ? "online" : undefined}
            />
            <h4 className="font-bold text-slate-900 mt-3 text-lg">
              {activeConversation.name}
            </h4>
            <p className="text-sm text-slate-500 mt-1">
              {activeConversation.online ? (
                <span className="text-emerald-500">● Đang hoạt động</span>
              ) : (
                "Không hoạt động"
              )}
            </p>
            {activeConversation.type === "group" &&
              activeConversation.memberCount && (
                <p className="text-xs text-slate-400 mt-1 flex items-center justify-center gap-1">
                  <Users size={12} /> {activeConversation.memberCount} thành
                  viên
                </p>
              )}
          </div>

          {/* Quick Actions */}
          <div className="p-4 border-b border-slate-100">
            <div className="flex justify-center gap-4">
              {activeConversation.type === "direct" && (
                <>
                  <button
                    onClick={() => handleStartCall(false)}
                    disabled={!isConnected}
                    className="flex flex-col items-center gap-1 p-3 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                      <Phone size={18} />
                    </div>
                    <span className="text-xs text-slate-600">Gọi thoại</span>
                  </button>
                  <button
                    onClick={() => handleStartCall(true)}
                    disabled={!isConnected}
                    className="flex flex-col items-center gap-1 p-3 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
                      <Video size={18} />
                    </div>
                    <span className="text-xs text-slate-600">Video</span>
                  </button>
                </>
              )}
              <button
                onClick={() =>
                  activeConversationId &&
                  toggleMuteConversation(activeConversationId)
                }
                className="flex flex-col items-center gap-1 p-3 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    activeConversationId &&
                    mutedConversations.has(activeConversationId)
                      ? "bg-red-50 text-red-600"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {activeConversationId &&
                  mutedConversations.has(activeConversationId) ? (
                    <Bell size={18} />
                  ) : (
                    <BellOff size={18} />
                  )}
                </div>
                <span className="text-xs text-slate-600">
                  {activeConversationId &&
                  mutedConversations.has(activeConversationId)
                    ? "Bật thông báo"
                    : "Tắt thông báo"}
                </span>
              </button>
              <button
                onClick={() => setMessageSearchActive(!messageSearchActive)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl hover:bg-slate-50 transition-colors ${
                  messageSearchActive ? "bg-teal-50" : ""
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    messageSearchActive
                      ? "bg-teal-100 text-teal-600"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <Search size={18} />
                </div>
                <span className="text-xs text-slate-600">Tìm kiếm</span>
              </button>
            </div>

            {/* Message Search Input */}
            {messageSearchActive && (
              <div className="px-4 pb-3">
                <div className="flex items-center bg-slate-100 rounded-lg px-3 py-2 gap-2">
                  <Search size={16} className="text-slate-400" />
                  <input
                    type="text"
                    value={messageSearchTerm}
                    onChange={(e) => setMessageSearchTerm(e.target.value)}
                    placeholder="Tìm tin nhắn trong cuộc trò chuyện..."
                    className="flex-1 bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400"
                    autoFocus
                  />
                  {messageSearchTerm && (
                    <button
                      onClick={() => setMessageSearchTerm("")}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                {messageSearchTerm && (
                  <div className="mt-2 text-xs text-slate-500">
                    {
                      messages.filter((m) =>
                        m.content
                          .toLowerCase()
                          .includes(messageSearchTerm.toLowerCase())
                      ).length
                    }{" "}
                    kết quả
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Media Section */}
          <div className="flex-1 overflow-y-auto">
            {/* Media Files */}
            <div className="p-4">
              {/* Media Images Section */}
              <div className="mb-3">
                <button
                  onClick={() =>
                    setExpandedSection(
                      expandedSection === "images" ? null : "images"
                    )
                  }
                  className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                      <ImageIcon size={18} />
                    </div>
                    <div className="text-left">
                      <span className="text-sm font-medium text-slate-800">
                        File phương tiện
                      </span>
                      <p className="text-xs text-slate-400">
                        {sharedMedia.images.length} ảnh đã chia sẻ
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    size={18}
                    className={`text-slate-400 transition-transform ${
                      expandedSection === "images" ? "rotate-90" : ""
                    }`}
                  />
                </button>
                {/* Image Grid or Empty State */}
                {expandedSection === "images" && (
                  <div className="mt-2 px-3">
                    {sharedMedia.images.length > 0 ? (
                      <div className="grid grid-cols-3 gap-1">
                        {sharedMedia.images.map((img, idx) => (
                          <div
                            key={idx}
                            className="relative aspect-square rounded-lg overflow-hidden bg-slate-100 cursor-pointer hover:opacity-90"
                            onClick={() => window.open(img, "_blank")}
                          >
                            <img
                              src={img}
                              alt=""
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-slate-400">
                        <ImageIcon
                          size={32}
                          className="mx-auto mb-2 opacity-50"
                        />
                        <p className="text-sm">Chưa có ảnh được chia sẻ</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Files Section */}
              <div className="mb-3">
                <button
                  onClick={() =>
                    setExpandedSection(
                      expandedSection === "files" ? null : "files"
                    )
                  }
                  className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                      <FileText size={18} />
                    </div>
                    <div className="text-left">
                      <span className="text-sm font-medium text-slate-800">
                        File đính kèm
                      </span>
                      <p className="text-xs text-slate-400">
                        {sharedMedia.files.length} tài liệu đã chia sẻ
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    size={18}
                    className={`text-slate-400 transition-transform ${
                      expandedSection === "files" ? "rotate-90" : ""
                    }`}
                  />
                </button>
                {/* Files List or Empty State */}
                {expandedSection === "files" && (
                  <div className="mt-2 px-3">
                    {sharedMedia.files.length > 0 ? (
                      <div className="space-y-2">
                        {sharedMedia.files.map((file, idx) => (
                          <a
                            key={idx}
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg hover:bg-slate-100"
                          >
                            <FileText size={16} className="text-amber-500" />
                            <span className="text-sm text-slate-700 truncate">
                              {file.name}
                            </span>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-slate-400">
                        <FileText
                          size={32}
                          className="mx-auto mb-2 opacity-50"
                        />
                        <p className="text-sm">Chưa có file được chia sẻ</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Links Section */}
              <div className="mb-3">
                <button
                  onClick={() =>
                    setExpandedSection(
                      expandedSection === "links" ? null : "links"
                    )
                  }
                  className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                      <LinkIcon size={18} />
                    </div>
                    <div className="text-left">
                      <span className="text-sm font-medium text-slate-800">
                        Liên kết
                      </span>
                      <p className="text-xs text-slate-400">
                        {sharedMedia.links.length} link đã chia sẻ
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    size={18}
                    className={`text-slate-400 transition-transform ${
                      expandedSection === "links" ? "rotate-90" : ""
                    }`}
                  />
                </button>
                {/* Links List or Empty State */}
                {expandedSection === "links" && (
                  <div className="mt-2 px-3">
                    {sharedMedia.links.length > 0 ? (
                      <div className="space-y-1">
                        {sharedMedia.links.map((link, idx) => (
                          <a
                            key={idx}
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-sm text-blue-600 hover:underline truncate p-2 bg-slate-50 rounded-lg hover:bg-slate-100"
                          >
                            {link}
                          </a>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-slate-400">
                        <LinkIcon
                          size={32}
                          className="mx-auto mb-2 opacity-50"
                        />
                        <p className="text-sm">Chưa có liên kết được chia sẻ</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Settings */}
            <div className="p-4 border-t border-slate-100">
              <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">
                Tùy chọn
              </h5>

              <button className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors text-left">
                <Bell size={18} className="text-slate-500" />
                <span className="text-sm text-slate-700">Bật thông báo</span>
              </button>

              <button className="w-full flex items-center gap-3 p-3 hover:bg-red-50 rounded-lg transition-colors text-left mt-1">
                <Trash2 size={18} className="text-red-500" />
                <span className="text-sm text-red-600">
                  Xóa cuộc trò chuyện
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <Modal
        isOpen={showNewChat}
        onClose={() => setShowNewChat(false)}
        title="Tin nhắn mới"
      >
        <div className="p-5">
          <div className="relative mb-5">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              autoFocus
              type="text"
              placeholder="Tìm kiếm người dùng..."
              value={userSearchTerm}
              onChange={(e) => {
                setUserSearchTerm(e.target.value);
                searchUsers(e.target.value);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border-0 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500/30"
            />
          </div>
          <div className="space-y-1 max-h-72 overflow-y-auto">
            {loading.users ? (
              <div className="text-center text-slate-400 py-6">
                Đang tìm kiếm...
              </div>
            ) : users.length === 0 ? (
              <div className="text-center text-slate-400 py-6">
                Không tìm thấy
              </div>
            ) : (
              users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleStartChat(user)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg"
                >
                  <Avatar name={user.name} src={user.avatar} size="md" />
                  <div className="text-left">
                    <div className="font-medium text-slate-900 text-sm">
                      {user.name}
                    </div>
                    <div className="text-xs text-slate-500">
                      {user.department || "Nhân viên"}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </Modal>

      <IncomingCallModal
        isOpen={!!incomingCall}
        callerName={incomingCall?.callerName || ""}
        isVideoCall={incomingCall?.isVideoCall || false}
        onAccept={handleAcceptCall}
        onDecline={handleDeclineCall}
      />

      {/* Calling Modal - Show while waiting for room to be ready */}
      {activeCall && !activeCall.roomName && callStatus === "calling" && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 shadow-2xl text-center max-w-sm">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center">
              {activeCall.isVideoCall ? (
                <Video className="w-10 h-10 text-white" />
              ) : (
                <Phone className="w-10 h-10 text-white animate-pulse" />
              )}
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

      {/* Only render VideoCallModal when there's an active call */}
      {/* For "calling" status: show "Đang gọi..." screen (no roomName needed) */}
      {/* For "active" status: show Daily.co iframe (needs roomName) */}
      {activeCall &&
      ["calling", "connecting", "active"].includes(callStatus) ? (
        <>
          {console.log("📹 Rendering VideoCallModal:", {
            activeCall,
            callStatus,
          })}
          <VideoCallModal
            isOpen={true}
            onClose={handleEndCall}
            roomName={activeCall.roomName}
            token={activeCall.token}
            displayName={getCurrentUserName()}
            otherUserName={activeCall.recipientName || ""}
            isVideoCall={activeCall.isVideoCall || false}
            callStatus={callStatus}
            onCallEnd={handleEndCall}
          />
        </>
      ) : null}
      <EditMessageModal
        isOpen={editModal.isOpen}
        currentText={editModal.currentText}
        onSave={(newText) => {
          if (activeConversationId && editModal.messageId)
            socketEditMessage(
              editModal.messageId,
              activeConversationId,
              newText
            );
          setEditModal({ isOpen: false, messageId: "", currentText: "" });
        }}
        onClose={() =>
          setEditModal({ isOpen: false, messageId: "", currentText: "" })
        }
      />
    </div>
  );
}

export { ChatManager };
