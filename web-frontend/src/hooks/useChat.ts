import { useState, useEffect, useCallback } from 'react';
import { chatService } from '../services/chatService';

export interface ChatUser {
  id: string;
  name: string;
  avatar?: string;
  department?: string;
  online?: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  type: 'text' | 'image' | 'file';
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
}

interface UseChatReturn {
  conversations: Conversation[];
  messages: ChatMessage[];
  users: ChatUser[];
  loading: {
    conversations: boolean;
    messages: boolean;
    users: boolean;
  };
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  sendMessage: (content: string) => Promise<void>;
  searchUsers: (query: string) => Promise<void>;
  createConversation: (userId: string) => Promise<string>;
  refetch: () => void;
}

export const useChat = (): UseChatReturn => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState({
    conversations: true,
    messages: false,
    users: false,
  });
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    setLoading((prev) => ({ ...prev, conversations: true }));
    try {
      const data = await chatService.getConversations();
      const mapped: Conversation[] = (data || []).map((c: any) => ({
        id: c.id,
        type: c.isGroup ? 'group' : 'direct',
        name: c.name || c.otherUser?.name || 'Unknown',
        avatar: c.avatar || c.otherUser?.avatarUrl,
        lastMessage: c.lastMessage?.content || c.lastMessage,
        lastMessageTime: c.lastMessageTime || c.lastMessage?.createdAt,
        unreadCount: c.unreadCount || 0,
        online: c.otherUser?.isOnline || false,
        memberCount: c.memberCount,
        department: c.otherUser?.department,
      }));
      setConversations(mapped);
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading((prev) => ({ ...prev, conversations: false }));
    }
  }, []);

  // Fetch messages for active conversation
  const fetchMessages = useCallback(async (conversationId: string) => {
    setLoading((prev) => ({ ...prev, messages: true }));
    try {
      const data = await chatService.getMessages(conversationId);
      const currentUserId = localStorage.getItem('userId') || '';
      const mapped: ChatMessage[] = (data || []).map((m: any) => ({
        id: m.id,
        senderId: m.senderId === currentUserId ? 'me' : m.senderId,
        senderName: m.sender?.name || m.senderName || 'Unknown',
        senderAvatar: m.sender?.avatarUrl || m.senderAvatar,
        content: m.content || m.messageText,
        timestamp: m.createdAt || m.timestamp,
        status: m.isRead ? 'read' : 'delivered',
        type: m.messageType || 'text',
      }));
      setMessages(mapped.reverse()); // Reverse to show oldest first
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading((prev) => ({ ...prev, messages: false }));
    }
  }, []);

  // Search users
  const searchUsers = useCallback(async (query: string) => {
    setLoading((prev) => ({ ...prev, users: true }));
    try {
      const data = await chatService.searchUsers(query);
      const mapped: ChatUser[] = (data || []).map((u: any) => ({
        id: u.id,
        name: u.name || u.fullName,
        avatar: u.avatarUrl,
        department: u.department,
        online: u.isOnline,
      }));
      setUsers(mapped);
    } catch (err) {
      console.error('Error searching users:', err);
    } finally {
      setLoading((prev) => ({ ...prev, users: false }));
    }
  }, []);

  // Send message
  const sendMessage = useCallback(async (content: string) => {
    if (!activeConversationId || !content.trim()) return;

    try {
      await chatService.sendMessage({
        conversationId: activeConversationId,
        messageText: content,
        messageType: 'text',
      });
      // Refetch messages
      await fetchMessages(activeConversationId);
      // Update conversation list
      await fetchConversations();
    } catch (err) {
      console.error('Error sending message:', err);
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
  };
};
