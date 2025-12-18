/**
 * Floating Chat Bubble Component
 * A floating button that appears on all pages for quick chat access
 * Shows unread message count and allows quick messaging/calling
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  MessageCircle,
  X,
  Search,
  Phone,
  Video,
  Send,
  ChevronLeft,
  User,
  Circle,
  Paperclip,
  Image,
} from "lucide-react";
import { useGlobalCall } from "../../contexts/GlobalCallContext";
import { chatService } from "../../services/chatService";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface Conversation {
  id: string;
  type: "direct" | "group";
  name: string;
  avatar?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  online?: boolean;
  participantId?: string;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  type?: "text" | "image" | "file";
}

interface FloatingChatBubbleProps {
  currentUserId: string;
  currentUserName: string;
}

export const FloatingChatBubble: React.FC<FloatingChatBubbleProps> = ({
  currentUserId,
  currentUserName,
}) => {
  const { isConnected, onlineUsers, startCall, isInCall } = useGlobalCall();

  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [totalUnread, setTotalUnread] = useState(0);
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch conversations
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
        participantId:
          c.other_user_id || c.participant2_id || c.participant1_id,
      }));
      setConversations(mapped);
      setTotalUnread(mapped.reduce((sum, c) => sum + c.unreadCount, 0));
    } catch (err) {
      console.error("Error fetching conversations:", err);
    }
  }, [onlineUsers]);

  // Fetch messages for a conversation
  const fetchMessages = useCallback(
    async (conversationId: string) => {
      setLoading(true);
      try {
        const response = await chatService.getMessages(conversationId, 30, 0);
        const rawData = response.data || response;
        const mapped: ChatMessage[] = (
          Array.isArray(rawData) ? rawData : []
        ).map((m: any) => ({
          id: m.id,
          senderId: m.sender_id === currentUserId ? "me" : m.sender_id,
          senderName: m.sender_name || "Unknown",
          content: m.is_recalled
            ? "Tin nhắn đã được thu hồi"
            : m.message_text || m.content,
          timestamp: m.created_at || m.timestamp,
          type: m.message_type || "text",
        }));
        setMessages(mapped);
      } catch (err) {
        console.error("Error fetching messages:", err);
      } finally {
        setLoading(false);
      }
    },
    [currentUserId]
  );

  // Load conversations when bubble opens
  useEffect(() => {
    if (isOpen) {
      fetchConversations();
    }
  }, [isOpen, fetchConversations]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      inputRef.current?.focus();
    }
  }, [selectedConversation]);

  // Handle sending message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      await chatService.sendMessage({
        conversationId: selectedConversation.id,
        messageText: newMessage.trim(),
      });
      setNewMessage("");
      // Refresh messages
      fetchMessages(selectedConversation.id);
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  // Handle starting a call
  const handleStartCall = (isVideoCall: boolean) => {
    if (
      !selectedConversation ||
      selectedConversation.type !== "direct" ||
      !selectedConversation.participantId
    ) {
      return;
    }

    startCall({
      recipientId: selectedConversation.participantId,
      recipientName: selectedConversation.name,
      isVideoCall,
    });
  };

  // Handle conversation selection
  const handleSelectConversation = (conv: Conversation) => {
    setSelectedConversation(conv);
    fetchMessages(conv.id);
  };

  // Format time
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút`;
    if (diffMins < 1440)
      return date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  // Filter conversations
  const filteredConversations = conversations.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 ${
          isOpen
            ? "bg-slate-600 hover:bg-slate-700"
            : "bg-gradient-to-br from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <>
            <MessageCircle className="w-6 h-6 text-white" />
            {totalUnread > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {totalUnread > 9 ? "9+" : totalUnread}
              </span>
            )}
          </>
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-500 to-teal-600 p-4 text-white">
            <div className="flex items-center justify-between">
              {selectedConversation ? (
                <>
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="p-1 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="flex-1 ml-2">
                    <h3 className="font-semibold truncate">
                      {selectedConversation.name}
                    </h3>
                    <p className="text-xs text-white/80">
                      {selectedConversation.online
                        ? "Đang hoạt động"
                        : "Ngoại tuyến"}
                    </p>
                  </div>
                  {selectedConversation.type === "direct" && !isInCall && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleStartCall(false)}
                        className="p-2 hover:bg-white/20 rounded-full transition-colors"
                        title="Gọi điện"
                      >
                        <Phone className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleStartCall(true)}
                        className="p-2 hover:bg-white/20 rounded-full transition-colors"
                        title="Gọi video"
                      >
                        <Video className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <MessageCircle className="w-5 h-5" />
                  <span className="flex-1 ml-2 font-semibold">Tin nhắn</span>
                  <div
                    className={`flex items-center gap-1 text-xs ${
                      isConnected ? "text-green-200" : "text-red-200"
                    }`}
                  >
                    <Circle
                      className={`w-2 h-2 fill-current ${
                        isConnected ? "text-green-300" : "text-red-300"
                      }`}
                    />
                    {isConnected ? "Online" : "Offline"}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Content */}
          {!selectedConversation ? (
            // Conversation List
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Search */}
              <div className="p-3 border-b border-slate-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Conversations */}
              <div className="flex-1 overflow-y-auto">
                {filteredConversations.length === 0 ? (
                  <div className="p-4 text-center text-slate-500 text-sm">
                    Chưa có cuộc hội thoại nào
                  </div>
                ) : (
                  filteredConversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => handleSelectConversation(conv)}
                      className="w-full p-3 flex items-center gap-3 hover:bg-slate-50 transition-colors border-b border-slate-50"
                    >
                      <div className="relative">
                        {conv.avatar ? (
                          <img
                            src={
                              conv.avatar.startsWith("http")
                                ? conv.avatar
                                : `${API_URL}${conv.avatar}`
                            }
                            alt={conv.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-medium">
                            {conv.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        {conv.online && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                        )}
                      </div>
                      <div className="flex-1 text-left overflow-hidden">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-slate-800 truncate">
                            {conv.name}
                          </span>
                          {conv.lastMessageTime && (
                            <span className="text-xs text-slate-400">
                              {formatTime(conv.lastMessageTime)}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 truncate">
                          {conv.lastMessage || "Chưa có tin nhắn"}
                        </p>
                      </div>
                      {conv.unreadCount > 0 && (
                        <span className="w-5 h-5 bg-teal-500 text-white text-xs rounded-full flex items-center justify-center">
                          {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                        </span>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          ) : (
            // Chat View
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                    Bắt đầu cuộc trò chuyện
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.senderId === "me" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] px-3 py-2 rounded-2xl ${
                          msg.senderId === "me"
                            ? "bg-teal-500 text-white rounded-br-md"
                            : "bg-white text-slate-800 rounded-bl-md shadow-sm"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {msg.content}
                        </p>
                        <p
                          className={`text-[10px] mt-1 ${
                            msg.senderId === "me"
                              ? "text-white/70"
                              : "text-slate-400"
                          }`}
                        >
                          {formatTime(msg.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-3 bg-white border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Nhập tin nhắn..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    className="flex-1 px-3 py-2 bg-slate-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="p-2 bg-teal-500 hover:bg-teal-600 disabled:bg-slate-300 text-white rounded-full transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default FloatingChatBubble;
