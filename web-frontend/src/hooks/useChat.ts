import { useState, useEffect, useCallback } from 'react';
import { chatService } from '../services/chatService';

export interface ChatUser {
  id: string;
  name: string;
  avatar?: string;
  department?: string;
  online?: boolean;
}

// Message status for optimistic UI
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface ChatMessage {
  id: string;
  tempId?: string; // For optimistic UI - temporary ID before server confirms
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  senderDepartment?: string; // For clear identity in group chats
  content: string;
  timestamp: string;
  status: MessageStatus;
  type: 'text' | 'image' | 'file';
  // Edit/Recall support
  editedAt?: string;
  isRecalled?: boolean;
  // Attachments
  attachments?: {
    id: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    url: string;
  }[];
  // Reactions
  reactions?: {
    emoji: string;
    count: number;
    users: { userId: string; userName: string }[];
    hasReacted: boolean;
  }[];
}

export interface Conversation {
  id: string;
  type: 'direct' | 'group';
  name: string;
  avatar?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  online?: boolean;
  memberCount?: number;
  department?: string;
  participantId?: string; // For direct chats - the other user's ID (for calls)
}

interface UseChatReturn {
  conversations: Conversation[];
  messages: ChatMessage[];
  users: ChatUser[];
  loading: {
    conversations: boolean;
    messages: boolean;
    users: boolean;
    loadingMore: boolean;
  };
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  sendMessage: (content: string) => Promise<void>;
  searchUsers: (query: string) => Promise<void>;
  createConversation: (userId: string) => Promise<string>;
  refetch: () => void;
  loadMoreMessages: () => Promise<void>;
  hasMoreMessages: boolean;
}

export const useChat = (): UseChatReturn => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState({
    conversations: true,
    messages: false,
    users: false,
    loadingMore: false,
  });
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messageOffset, setMessageOffset] = useState(0);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const MESSAGE_LIMIT = 50;

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    setLoading((prev) => ({ ...prev, conversations: true }));
    try {
      const response = await chatService.getConversations();
      // Handle both { success: true, data: [] } and direct [] formats
      const rawData = response.data || response;
      const mapped: Conversation[] = (Array.isArray(rawData) ? rawData : []).map((c: any) => ({
        id: c.id,
        type: c.isGroup ? 'group' : 'direct',
        // Map snake_case fields from SQL query
        name: c.group_name || c.other_user_name || c.name || 'Unknown',
        avatar: c.group_avatar || c.other_user_avatar || c.avatar,
        lastMessage: c.last_message_text || c.lastMessage,
        lastMessageTime: c.last_message_time || c.lastMessageTime || c.created_at,
        unreadCount: c.unread_count || c.unreadCount || 0,
        online: c.other_user_status === 'online',
        memberCount: c.member_count,
        department: c.other_user_department,
        participantId: c.other_user_id || c.participant2_id || c.participant1_id,
      }));
      setConversations(mapped);
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading((prev) => ({ ...prev, conversations: false }));
    }
  }, []);

  // Map raw message data to ChatMessage
  const mapMessage = useCallback((m: any, currentUserId: string): ChatMessage => ({
    id: m.id,
    senderId: m.sender_id === currentUserId ? 'me' : m.sender_id,
    senderName: m.sender_name || m.sender?.name || 'Unknown',
    senderAvatar: m.sender_avatar || m.sender?.avatarUrl,
    senderDepartment: m.sender_department || m.sender?.department,
    content: m.is_recalled ? 'Tin nhắn này đã được thu hồi' : (m.message_text || m.content),
    timestamp: m.created_at || m.timestamp,
    status: m.is_read ? 'read' : 'delivered',
    type: m.message_type || m.type || 'text',
    editedAt: m.edited_at,
    isRecalled: m.is_recalled || false,
  }), []);

  // Fetch messages for active conversation
  const fetchMessages = useCallback(async (conversationId: string, reset = true) => {
    setLoading((prev) => ({ ...prev, messages: true }));
    try {
      const response = await chatService.getMessages(conversationId, MESSAGE_LIMIT, 0);
      const currentUserId = localStorage.getItem('userId') || '';
      const rawData = response.data || response;
      const mapped: ChatMessage[] = (Array.isArray(rawData) ? rawData : []).map((m: any) => mapMessage(m, currentUserId));
      
      // Reset offset and hasMore when fetching fresh
      if (reset) {
        setMessageOffset(MESSAGE_LIMIT);
        setHasMoreMessages(mapped.length >= MESSAGE_LIMIT);
      }
      
      // Merge with existing messages preserving pending ones
      setMessages(prev => {
        const pendingMessages = prev.filter(m => m.status === 'sending' || m.status === 'failed');
        return [...mapped.reverse(), ...pendingMessages];
      });
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading((prev) => ({ ...prev, messages: false }));
    }
  }, [mapMessage]);

  // Load more messages (pagination)
  const loadMoreMessages = useCallback(async () => {
    if (!activeConversationId || loading.loadingMore || !hasMoreMessages) return;
    
    setLoading((prev) => ({ ...prev, loadingMore: true }));
    try {
      const response = await chatService.getMessages(activeConversationId, MESSAGE_LIMIT, messageOffset);
      const currentUserId = localStorage.getItem('userId') || '';
      const rawData = response.data || response;
      const mapped: ChatMessage[] = (Array.isArray(rawData) ? rawData : []).map((m: any) => mapMessage(m, currentUserId));
      
      if (mapped.length < MESSAGE_LIMIT) {
        setHasMoreMessages(false);
      }
      
      setMessageOffset(prev => prev + MESSAGE_LIMIT);
      
      // Prepend older messages
      setMessages(prev => [...mapped.reverse(), ...prev]);
    } catch (err) {
      console.error('Error loading more messages:', err);
    } finally {
      setLoading((prev) => ({ ...prev, loadingMore: false }));
    }
  }, [activeConversationId, loading.loadingMore, hasMoreMessages, messageOffset, mapMessage]);

  // Search users
  const searchUsers = useCallback(async (query: string) => {
    setLoading((prev) => ({ ...prev, users: true }));
    try {
      const response = await chatService.searchUsers(query);
      const rawData = response.data || response;
      const mapped: ChatUser[] = (Array.isArray(rawData) ? rawData : []).map((u: any) => ({
        id: u.id,
        // Map snake_case fields from SQL query
        name: u.full_name || u.name || u.fullName,
        avatar: u.avatar_url || u.avatarUrl,
        department: u.department_name || u.department,
        online: u.status === 'online' || u.isOnline,
      }));
      setUsers(mapped);
    } catch (err) {
      console.error('Error searching users:', err);
    } finally {
      setLoading((prev) => ({ ...prev, users: false }));
    }
  }, []);

  // Send message with optimistic UI
  const sendMessage = useCallback(async (content: string) => {
    if (!activeConversationId || !content.trim()) return;

    const tempId = crypto.randomUUID();
    const currentUserName = localStorage.getItem('userName') || 'You';

    // Create optimistic message - show immediately
    const pendingMessage: ChatMessage = {
      id: tempId,
      tempId,
      senderId: 'me',
      senderName: currentUserName,
      content: content.trim(),
      timestamp: new Date().toISOString(),
      status: 'sending',
      type: 'text',
    };

    // Show immediately with "sending" status
    setMessages(prev => [...prev, pendingMessage]);

    try {
      await chatService.sendMessage({
        conversationId: activeConversationId,
        messageText: content,
        messageType: 'text',
      });

      // Update to sent status (server confirmed)
      setMessages(prev => prev.map(m =>
        m.tempId === tempId ? { ...m, status: 'sent' as MessageStatus } : m
      ));

      // Refetch to get the real message ID and update conversation list
      await fetchMessages(activeConversationId);
      await fetchConversations();
    } catch (err) {
      console.error('Error sending message:', err);
      // Mark as failed
      setMessages(prev => prev.map(m =>
        m.tempId === tempId ? { ...m, status: 'failed' as MessageStatus } : m
      ));
      throw err;
    }
  }, [activeConversationId, fetchMessages, fetchConversations]);

  // Create conversation
  const createConversation = useCallback(async (userId: string): Promise<string> => {
    try {
      const data = await chatService.getOrCreateConversation(userId);
      await fetchConversations();
      return data.id;
    } catch (err) {
      console.error('Error creating conversation:', err);
      throw err;
    }
  }, [fetchConversations]);

  // Refetch all
  const refetch = useCallback(() => {
    fetchConversations();
    if (activeConversationId) {
      fetchMessages(activeConversationId);
    }
  }, [fetchConversations, fetchMessages, activeConversationId]);

  // Initial fetch
  useEffect(() => {
    fetchConversations();
    searchUsers('');
  }, []);

  // Fetch messages when active conversation changes
  useEffect(() => {
    if (activeConversationId) {
      fetchMessages(activeConversationId);
      // Mark as read
      chatService.markAsRead(activeConversationId).catch(console.error);
    } else {
      setMessages([]);
    }
  }, [activeConversationId, fetchMessages]);

  return {
    conversations,
    messages,
    users,
    loading,
    activeConversationId,
    setActiveConversationId,
    sendMessage,
    searchUsers,
    createConversation,
    refetch,
    loadMoreMessages,
    hasMoreMessages,
  };
};
