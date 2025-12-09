import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Send,
  Paperclip,
  Phone,
  Video,
  Check,
  CheckCheck,
  Circle,
  Image as ImageIcon,
  Smile,
  Info,
  Plus,
  Users,
  X,
  MessageCircle,
  FileText,
  Download,
} from "lucide-react";
import { chatService } from "../../../services/chatService";
import { useSocket } from "../../../hooks/useSocket";

// --- Types ---
interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  message_text?: string;
  message_type?: string;
  is_read: boolean;
  created_at: string;
  sender_name?: string;
  // Attachment fields
  attachment_id?: string;
  file_name?: string;
  file_path?: string;
  file_type?: string;
  file_size?: number;
  mime_type?: string;
}

interface Conversation {
  id: string;
  other_user_id: string;
  other_user_name: string;
  other_user_email: string;
  other_user_status: "online" | "offline" | "busy" | "away";
  other_user_last_seen?: string;
  last_message_text?: string;
  last_message_time?: string;
  last_message_sender_id?: string;
  unread_count: number;
  is_group?: boolean;
  member_count?: number;
}

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
  department_name?: string;
  status: "online" | "offline" | "busy" | "away";
}

export const ChatManager: React.FC = () => {
  const storedUser = localStorage.getItem("user");
  const currentUserId = storedUser ? JSON.parse(storedUser).id : "";

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  // New chat modal
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Group chat modal
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // User info sidebar
  const [showUserInfo, setShowUserInfo] = useState(false);

  // File upload preview
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviewUrls, setFilePreviewUrls] = useState<string[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const {
    isConnected,
    onlineUsers,
    joinConversation,
    leaveConversation,
    sendMessage: sendSocketMessage,
    startTyping,
    stopTyping,
    markAsRead,
    onNewMessage,
    onTyping,
    onStopTyping,
    onMessagesRead,
  } = useSocket();

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    const cleanupNewMessage = onNewMessage?.((data: any) => {
      const msg = data.message;
      if (activeConversation?.id === msg.conversation_id) {
        setMessages((prev) => [...prev, msg]);
        markAsRead(msg.conversation_id);
        scrollToBottom();
      }
      loadConversations();
    });

    const cleanupTyping = onTyping?.((data: any) => {
      if (activeConversation?.id === data.conversationId) {
        setTypingUsers((prev) => new Set(prev).add(data.userId));
      }
    });

    const cleanupStopTyping = onStopTyping?.((data: any) => {
      if (activeConversation?.id === data.conversationId) {
        setTypingUsers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(data.userId);
          return newSet;
        });
      }
    });

    const cleanupRead = onMessagesRead?.((data: any) => {
      if (activeConversation?.id === data.conversationId) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.sender_id === currentUserId ? { ...msg, is_read: true } : msg
          )
        );
      }
    });

    return () => {
      cleanupNewMessage?.();
      cleanupTyping?.();
      cleanupStopTyping?.();
      cleanupRead?.();
    };
  }, [
    activeConversation,
    onNewMessage,
    onTyping,
    onStopTyping,
    onMessagesRead,
  ]);

  useEffect(() => {
    setConversations((prev) =>
      prev.map((conv) => ({
        ...conv,
        other_user_status: onlineUsers.has(conv.other_user_id)
          ? "online"
          : "offline",
      }))
    );
  }, [onlineUsers]);

  useEffect(() => {
    if (activeConversation) {
      joinConversation(activeConversation.id);
      return () => {
        leaveConversation(activeConversation.id);
      };
    }
  }, [activeConversation, joinConversation, leaveConversation]);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [messages]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await chatService.getConversations();
      const groupsResponse = await chatService.getGroups();
      
      if (response.success) {
        const conversations = response.data;
        const groups = groupsResponse.success ? groupsResponse.data.map((g: any) => ({
          id: g.id,
          other_user_id: g.id,
          other_user_name: g.name,
          other_user_email: "",
          other_user_status: "offline",
          last_message_text: g.last_message,
          last_message_time: g.last_message_time,
          last_message_sender_id: "",
          unread_count: g.unread_count || 0,
          is_group: true,
          member_count: g.member_count
        })) : [];
        
        setConversations([...conversations, ...groups]);
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const response = await chatService.getMessages(conversationId);
      if (response.success) {
        console.log("📩 Messages loaded:", response.data);
        console.log("📎 First message with attachment:", response.data.find((m: any) => m.attachment_id));
        setMessages(response.data);
        scrollToBottom();
        markAsRead(conversationId);
        await chatService.markAsRead(conversationId);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const handleSelectConversation = async (conversation: Conversation) => {
    setActiveConversation(conversation);
    await loadMessages(conversation.id);
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !activeConversation || sending) return;

    try {
      setSending(true);
      sendSocketMessage({
        conversationId: activeConversation.id,
        recipientId: activeConversation.other_user_id,
        messageText: messageInput.trim(),
        messageType: "text",
      });
      setMessageInput("");
      stopTyping(activeConversation.id);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const handleTyping = (text: string) => {
    setMessageInput(text);
    if (!activeConversation) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (text.trim()) {
      startTyping(activeConversation.id);
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(activeConversation.id);
      }, 3000);
    } else {
      stopTyping(activeConversation.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatFullTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const shouldShowTimestamp = (currentMsg: Message, previousMsg: Message | null) => {
    if (!previousMsg) return true;
    
    const currentTime = new Date(currentMsg.created_at).getTime();
    const previousTime = new Date(previousMsg.created_at).getTime();
    const diff = currentTime - previousTime;
    
    // Show timestamp if more than 10 minutes apart
    return diff > 10 * 60 * 1000;
  };

  const shouldGroupMessages = (currentMsg: Message, previousMsg: Message | null) => {
    if (!previousMsg) return false;
    if (currentMsg.sender_id !== previousMsg.sender_id) return false;
    
    const currentTime = new Date(currentMsg.created_at).getTime();
    const previousTime = new Date(previousMsg.created_at).getTime();
    const diff = currentTime - previousTime;
    
    // Group if less than 10 minutes apart
    return diff <= 10 * 60 * 1000;
  };

  const formatLastMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Vừa xong";
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    return date.toLocaleDateString("vi-VN");
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.other_user_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Load available users for new chat
  const loadAvailableUsers = async (search?: string) => {
    try {
      setLoadingUsers(true);
      const response = await chatService.searchUsers(search);
      if (response.success) {
        setAvailableUsers(response.data);
      }
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Start new chat with user
  const handleStartChat = async (userId: string) => {
    try {
      const response = await chatService.getOrCreateConversation(userId);
      if (response.success) {
        setShowNewChatModal(false);
        setUserSearchQuery("");
        await loadConversations();

        // Find and select the conversation
        const conv = conversations.find((c) => c.other_user_id === userId);
        if (conv) {
          handleSelectConversation(conv);
        }
      }
    } catch (error) {
      console.error("Error starting chat:", error);
    }
  };

  // Open new chat modal
  const openNewChatModal = () => {
    setShowNewChatModal(true);
    loadAvailableUsers();
  };

  // Create group chat
  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedUsers.length === 0) {
      alert("Vui lòng nhập tên nhóm và chọn ít nhất 1 thành viên");
      return;
    }

    try {
      const response = await chatService.createGroup(groupName, selectedUsers);
      if (response.success) {
        setShowGroupModal(false);
        setGroupName("");
        setSelectedUsers([]);
        alert("Tạo nhóm thành công!");
        await loadConversations();
      }
    } catch (error) {
      console.error("Error creating group:", error);
      alert("Không thể tạo nhóm");
    }
  };

  // Toggle user selection for group
  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  // Open group modal
  const openGroupModal = () => {
    setShowGroupModal(true);
    loadAvailableUsers();
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles((prev) => [...prev, ...files]);

    // Create preview URLs for images
    const newPreviewUrls = files.map((file) => {
      if (file.type.startsWith("image/")) {
        return URL.createObjectURL(file);
      }
      return "";
    });
    setFilePreviewUrls((prev) => [...prev, ...newPreviewUrls]);
  };

  // Remove file from preview
  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // Send files
  const handleSendFiles = async () => {
    if (selectedFiles.length === 0 || !activeConversation) return;

    try {
      setSending(true);
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("conversationId", activeConversation.id);
        // Don't send file name as message text - let image display standalone
        formData.append("messageText", "");

        await chatService.uploadAttachment(formData);
      }

      // Clear files after sending
      setSelectedFiles([]);
      setFilePreviewUrls([]);
      
      // Reload messages and conversations
      await loadMessages(activeConversation.id);
      await loadConversations();
      scrollToBottom();
    } catch (error) {
      console.error("Error uploading files:", error);
      alert("Không thể gửi file");
    } finally {
      setSending(false);
    }
  };

  // Search users in modal
  useEffect(() => {
    if (showNewChatModal) {
      const timer = setTimeout(() => {
        loadAvailableUsers(userSearchQuery);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [userSearchQuery, showNewChatModal]);

  return (
    <div className="h-[calc(100vh-140px)] flex bg-slate-50 rounded-xl overflow-hidden border border-slate-200">
      {/* Left Sidebar */}
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-slate-900">Tin nhắn</h2>
            <div className="flex gap-2">
              <button
                onClick={openNewChatModal}
                className="p-2 hover:bg-brand-50 rounded-lg transition-colors group"
                title="Tin nhắn mới"
              >
                <MessageCircle
                  size={20}
                  className="text-slate-600 group-hover:text-brand-600"
                />
              </button>
              <button
                onClick={openGroupModal}
                className="p-2 hover:bg-brand-50 rounded-lg transition-colors group"
                title="Tạo nhóm"
              >
                <Users
                  size={20}
                  className="text-slate-600 group-hover:text-brand-600"
                />
              </button>
            </div>
          </div>
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs">
            <Circle
              size={8}
              className={`fill-current ${
                isConnected ? "text-green-500" : "text-red-500"
              }`}
            />
            <span className="text-slate-500">
              {isConnected ? "Đang kết nối" : "Mất kết nối"}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center">
              <div className="animate-spin w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full mx-auto"></div>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <Smile size={48} className="mx-auto mb-2 text-slate-300" />
              <p className="text-sm">Chưa có cuộc trò chuyện</p>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => handleSelectConversation(conv)}
                className={`p-4 cursor-pointer border-b border-slate-100 hover:bg-slate-50 ${
                  activeConversation?.id === conv.id
                    ? "bg-brand-50 border-l-4 border-l-brand-500"
                    : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold">
                      {conv.other_user_name.charAt(0).toUpperCase()}
                    </div>
                    <Circle
                      size={12}
                      className={`absolute bottom-0 right-0 fill-current border-2 border-white rounded-full ${
                        conv.other_user_status === "online"
                          ? "text-green-500"
                          : "text-slate-300"
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-slate-900 text-sm truncate">
                        {conv.other_user_name}
                      </h3>
                      {conv.last_message_time && (
                        <span className="text-xs text-slate-400">
                          {formatLastMessageTime(conv.last_message_time)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-500 truncate flex-1">
                        {conv.last_message_text || "Chưa có tin nhắn"}
                      </p>
                      {conv.unread_count > 0 && (
                        <span className="ml-2 bg-brand-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeConversation ? (
          <>
            <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold">
                    {activeConversation.other_user_name.charAt(0).toUpperCase()}
                  </div>
                  <Circle
                    size={10}
                    className={`absolute bottom-0 right-0 fill-current border-2 border-white rounded-full ${
                      activeConversation.other_user_status === "online"
                        ? "text-green-500"
                        : "text-slate-300"
                    }`}
                  />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">
                    {activeConversation.other_user_name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {activeConversation.other_user_status === "online"
                      ? "Đang hoạt động"
                      : "Không hoạt động"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-slate-100 rounded-full">
                  <Phone size={18} className="text-slate-600" />
                </button>
                <button className="p-2 hover:bg-slate-100 rounded-full">
                  <Video size={18} className="text-slate-600" />
                </button>
                <button
                  onClick={() => setShowUserInfo(!showUserInfo)}
                  className={`p-2 hover:bg-slate-100 rounded-full ${showUserInfo ? "bg-brand-50" : ""}`}
                >
                  <Info size={18} className={showUserInfo ? "text-brand-600" : "text-slate-600"} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-slate-50/30 overscroll-contain">
              {messages.map((msg, index) => {
                const isMe = msg.sender_id === currentUserId;
                const previousMsg = index > 0 ? messages[index - 1] : null;
                const showTime = shouldShowTimestamp(msg, previousMsg);
                const isGrouped = shouldGroupMessages(msg, previousMsg);

                return (
                  <div key={msg.id}>
                    {showTime && (
                      <div className="flex justify-center my-4">
                        <span className="text-xs text-slate-400 bg-white px-3 py-1 rounded-full shadow-sm">
                          {formatFullTime(msg.created_at)}
                        </span>
                      </div>
                    )}
                    <div
                      className={`flex ${isMe ? "justify-end" : "justify-start"} group ${isGrouped ? "mt-0.5" : "mt-3"}`}
                    >
                      <div
                        className={`max-w-lg ${isMe ? "items-end" : "items-start"} flex flex-col`}
                      >
                        {/* Render Image OUTSIDE bubble - standalone */}
                        {msg.attachment_id && msg.file_path && msg.file_type === 'image' ? (
                          <div className="mb-1">
                            <img
                              src={`http://localhost:5000/${msg.file_path.replace(/\\/g, '/')}`}
                              alt="Image"
                              className="max-w-sm rounded-xl shadow-md cursor-pointer hover:opacity-95 transition-opacity"
                              onClick={() => window.open(`http://localhost:5000/${msg.file_path.replace(/\\/g, '/')}`, '_blank')}
                            />
                            <div className={`flex items-center gap-1 mt-1 px-1 ${isMe ? "justify-end" : "justify-start"}`}>
                              <span className="text-[10px] text-slate-400">{formatTime(msg.created_at)}</span>
                              {isMe && (
                                msg.is_read ? (
                                  <CheckCheck size={12} className="text-slate-400" />
                                ) : (
                                  <Check size={12} className="text-slate-400" />
                                )
                              )}
                            </div>
                          </div>
                        ) : msg.message_text ? (
                          /* Text message in bubble (with or without attachment) */
                          <div
                            className={`px-3 py-2 rounded-2xl text-sm shadow-sm ${
                              isMe
                                ? "bg-blue-500 text-white rounded-br-none"
                                : "bg-white text-slate-800 border border-slate-200 rounded-bl-none"
                            }`}
                          >
                            {/* File attachment (non-image) */}
                            {msg.attachment_id && msg.file_path && msg.file_type !== 'image' && (
                              <div className="mb-2">
                                <a
                                  href={`http://localhost:5000/${msg.file_path.replace(/\\/g, '/')}`}
                                  download={msg.file_name}
                                  className={`flex items-center gap-2 p-2 rounded-lg border ${
                                    isMe ? 'bg-blue-400/30 border-blue-300' : 'bg-slate-50 border-slate-200'
                                  }`}
                                >
                                  <FileText size={20} className={isMe ? 'text-white' : 'text-slate-600'} />
                                  <div className="flex-1 min-w-0">
                                    <div className={`text-xs font-medium truncate ${isMe ? 'text-white' : 'text-slate-900'}`}>
                                      {msg.file_name}
                                    </div>
                                    {msg.file_size && (
                                      <div className={`text-[10px] ${isMe ? 'text-blue-100' : 'text-slate-500'}`}>
                                        {(msg.file_size / 1024 / 1024).toFixed(2)} MB
                                      </div>
                                    )}
                                  </div>
                                  <Download size={14} className={isMe ? 'text-white' : 'text-slate-400'} />
                                </a>
                              </div>
                            )}
                            
                            <div className="mb-0.5">{msg.message_text}</div>
                            <div className={`flex items-center gap-1 justify-end ${isMe ? "text-blue-100" : "text-slate-400"}`}>
                              <span className="text-[10px]">{formatTime(msg.created_at)}</span>
                              {isMe && (
                                msg.is_read ? (
                                  <CheckCheck size={12} className="text-blue-200" />
                                ) : (
                                  <Check size={12} className="text-blue-200" />
                                )
                              )}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}

              {typingUsers.size > 0 && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-4 py-2.5">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* File Preview Bar */}
            {selectedFiles.length > 0 && (
              <div className="px-4 py-2 bg-white border-t border-slate-200">
                <div className="flex items-center gap-2 overflow-x-auto">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="relative flex-shrink-0 group"
                    >
                      {file.type.startsWith("image/") ? (
                        <img
                          src={filePreviewUrls[index]}
                          alt={file.name}
                          className="w-20 h-20 object-cover rounded-lg border-2 border-brand-500"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-slate-100 rounded-lg border-2 border-brand-500 flex flex-col items-center justify-center p-2">
                          <Paperclip size={24} className="text-brand-600" />
                          <span className="text-[10px] text-slate-600 truncate w-full text-center mt-1">
                            {file.name.split(".").pop()?.toUpperCase()}
                          </span>
                        </div>
                      )}
                      <button
                        onClick={() => removeFile(index)}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={14} />
                      </button>
                      <div className="text-[10px] text-slate-500 truncate w-20 text-center mt-1">
                        {file.name}
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={handleSendFiles}
                    disabled={sending}
                    className="flex-shrink-0 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 text-sm font-medium"
                  >
                    Gửi {selectedFiles.length} file
                  </button>
                </div>
              </div>
            )}

            <div className="p-4 bg-white border-t border-slate-200">
              <div className="flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2 focus-within:ring-2 focus-within:ring-brand-500/20">
                <div className="flex gap-1 pb-2 pl-1">
                  <label
                    className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-slate-200 rounded-full cursor-pointer"
                    title="Đính kèm file"
                  >
                    <Paperclip size={20} />
                    <input
                      type="file"
                      className="hidden"
                      multiple
                      onChange={handleFileSelect}
                    />
                  </label>
                  <label
                    className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-slate-200 rounded-full cursor-pointer"
                    title="Gửi ảnh"
                  >
                    <ImageIcon size={20} />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      multiple
                      onChange={handleFileSelect}
                    />
                  </label>
                </div>
                <textarea
                  value={messageInput}
                  onChange={(e) => handleTyping(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Nhập tin nhắn... (Enter để gửi)"
                  className="flex-1 bg-transparent border-none outline-none text-sm py-2.5 max-h-32 resize-none"
                  rows={1}
                  disabled={sending}
                />
                <div className="pb-1 pr-1">
                  <button
                    className={`rounded-lg h-9 w-9 flex items-center justify-center ${
                      messageInput.trim() && !sending
                        ? "bg-brand-600 hover:bg-brand-700 text-white"
                        : "bg-slate-300 text-slate-500 cursor-not-allowed"
                    }`}
                    disabled={!messageInput.trim() || sending}
                    onClick={handleSendMessage}
                  >
                    <Send size={18} className="ml-0.5" />
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Smile size={48} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-600 mb-1">
              Chưa chọn hội thoại
            </h3>
            <p className="text-sm max-w-xs text-center">
              Chọn một người dùng từ danh sách bên trái để bắt đầu trò chuyện.
            </p>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Tin nhắn mới</h3>
              <button
                onClick={() => {
                  setShowNewChatModal(false);
                  setUserSearchQuery("");
                }}
                className="p-2 hover:bg-slate-100 rounded-full"
              >
                <X size={20} className="text-slate-600" />
              </button>
            </div>

            <div className="p-4 border-b border-slate-200">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Tìm kiếm người dùng..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {loadingUsers ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full mx-auto"></div>
                  <p className="text-sm text-slate-500 mt-2">Đang tải...</p>
                </div>
              ) : availableUsers.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-slate-500">
                    Không tìm thấy người dùng
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {availableUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleStartChat(user.id)}
                      className="w-full p-3 hover:bg-slate-50 rounded-lg transition-colors text-left flex items-center gap-3"
                    >
                      <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold">
                          {user.full_name.charAt(0).toUpperCase()}
                        </div>
                        <Circle
                          size={12}
                          className={`absolute bottom-0 right-0 fill-current border-2 border-white rounded-full ${
                            user.status === "online"
                              ? "text-green-500"
                              : "text-slate-300"
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-900 text-sm truncate">
                          {user.full_name}
                        </h4>
                        <p className="text-xs text-slate-500 truncate">
                          {user.email}
                        </p>
                        {user.department_name && (
                          <p className="text-xs text-slate-400 truncate">
                            {user.department_name}
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            user.role === "admin"
                              ? "bg-red-100 text-red-700"
                              : user.role === "manager"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {user.role}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Group Chat Modal */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Tạo nhóm mới</h3>
              <button
                onClick={() => {
                  setShowGroupModal(false);
                  setGroupName("");
                  setSelectedUsers([]);
                }}
                className="p-2 hover:bg-slate-100 rounded-full"
              >
                <X size={20} className="text-slate-600" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tên nhóm
                </label>
                <input
                  type="text"
                  placeholder="Nhập tên nhóm..."
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Thành viên ({selectedUsers.length} đã chọn)
                </label>
                <div className="relative mb-2">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Tìm kiếm thành viên..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>

                <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-lg">
                  {loadingUsers ? (
                    <div className="text-center py-8">
                      <div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full mx-auto"></div>
                      <p className="text-sm text-slate-500 mt-2">Đang tải...</p>
                    </div>
                  ) : availableUsers.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-sm text-slate-500">
                        Không tìm thấy người dùng
                      </p>
                    </div>
                  ) : (
                    <div>
                      {availableUsers.map((user) => {
                        const isSelected = selectedUsers.includes(user.id);
                        return (
                          <div
                            key={user.id}
                            onClick={() => toggleUserSelection(user.id)}
                            className={`p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0 flex items-center gap-3 ${
                              isSelected ? "bg-brand-50" : ""
                            }`}
                          >
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold">
                                {user.full_name.charAt(0).toUpperCase()}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-slate-900 text-sm truncate">
                                {user.full_name}
                              </h4>
                              <p className="text-xs text-slate-500 truncate">
                                {user.department_name || user.email}
                              </p>
                            </div>
                            <div className="flex-shrink-0">
                              {isSelected && (
                                <div className="w-5 h-5 bg-brand-600 rounded-full flex items-center justify-center">
                                  <Check size={14} className="text-white" />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowGroupModal(false);
                  setGroupName("");
                  setSelectedUsers([]);
                }}
                className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleCreateGroup}
                disabled={!groupName.trim() || selectedUsers.length === 0}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  !groupName.trim() || selectedUsers.length === 0
                    ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                    : "bg-brand-600 text-white hover:bg-brand-700"
                }`}
              >
                Tạo nhóm ({selectedUsers.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Info Sidebar */}
      {showUserInfo && activeConversation && (
        <div className="w-80 bg-white border-l border-slate-200 overflow-y-auto">
          <div className="p-6">
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-3xl font-bold">
                  {activeConversation.other_user_name.charAt(0).toUpperCase()}
                </div>
                <Circle
                  size={16}
                  className={`absolute bottom-1 right-1 fill-current border-4 border-white rounded-full ${
                    activeConversation.other_user_status === "online"
                      ? "text-green-500"
                      : "text-slate-300"
                  }`}
                />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">
                {activeConversation.other_user_name}
              </h3>
              <p className="text-sm text-slate-500 mb-4">
                {activeConversation.other_user_status === "online"
                  ? "Đang hoạt động"
                  : "Không hoạt động"}
              </p>

              <div className="flex gap-3 w-full">
                <button className="flex-1 flex flex-col items-center gap-2 p-3 hover:bg-slate-50 rounded-lg transition-colors">
                  <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center">
                    <Phone size={20} className="text-brand-600" />
                  </div>
                  <span className="text-xs text-slate-600">Gọi điện</span>
                </button>
                <button className="flex-1 flex flex-col items-center gap-2 p-3 hover:bg-slate-50 rounded-lg transition-colors">
                  <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center">
                    <Video size={20} className="text-brand-600" />
                  </div>
                  <span className="text-xs text-slate-600">Video</span>
                </button>
                <button className="flex-1 flex flex-col items-center gap-2 p-3 hover:bg-slate-50 rounded-lg transition-colors">
                  <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center">
                    <Send size={20} className="text-brand-600" />
                  </div>
                  <span className="text-xs text-slate-600">Email</span>
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 p-4">
            <h4 className="text-sm font-bold text-slate-700 mb-3">Thông tin liên hệ</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                  <Send size={16} className="text-slate-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Email</p>
                  <p className="text-sm text-slate-900">{activeConversation.other_user_email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                  <Phone size={16} className="text-slate-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Số điện thoại</p>
                  <p className="text-sm text-slate-900">Chưa có</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 p-4">
            <h4 className="text-sm font-bold text-slate-700 mb-3">Ảnh & Tập tin</h4>
            <div className="grid grid-cols-3 gap-2">
              {messages
                .filter(m => m.attachment_id && m.file_type === 'image')
                .slice(0, 6)
                .map((msg, idx) => (
                  <div 
                    key={idx} 
                    className="aspect-square bg-slate-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-90"
                    onClick={() => window.open(`http://localhost:5000/${msg.file_path?.replace(/\\/g, '/')}`, '_blank')}
                  >
                    <img 
                      src={`http://localhost:5000/${msg.file_path?.replace(/\\/g, '/')}`}
                      alt="Image"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              {messages.filter(m => m.attachment_id && m.file_type === 'image').length === 0 && (
                <div className="col-span-3 text-center text-xs text-slate-400 py-4">Chưa có ảnh nào</div>
              )}
            </div>
            {messages.filter(m => m.attachment_id && m.file_type === 'image').length > 6 && (
              <button className="w-full mt-3 text-sm text-brand-600 hover:text-brand-700 font-medium">
                Xem tất cả ({messages.filter(m => m.attachment_id && m.file_type === 'image').length})
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatManager;
