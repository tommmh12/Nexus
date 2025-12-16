import { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search, Send, Paperclip, Phone, Video, MoreVertical, Plus,
  MessageCircle, Clock, AlertCircle, RefreshCw, Check, CheckCheck, Shield
} from 'lucide-react';
import { ChatUser, ChatMessage } from '../../hooks/useChat';
import { useSocket } from '../../hooks/useSocket';
import { chatService } from '../../services/chatService';
import { Avatar } from '../ui/Avatar';
import { Skeleton } from '../ui/Skeleton';
import { Modal } from '../ui/Modal';
import { VideoCallModal } from './VideoCallModal';
import { IncomingCallModal } from './IncomingCallModal';
import { MessageActions, EditMessageModal } from './MessageActions';
import { ConnectionStatus } from './ConnectionStatus';
import { ResizableSidebar } from './ResizableSidebar';

export type UserRole = 'admin' | 'department-manager' | 'employee';

export interface ChatManagerProps {
  userRole: UserRole;
  canModerate?: boolean;
}

interface Conversation {
  id: string;
  type: 'direct' | 'group';
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
  canModerateChat: role === 'admin' || role === 'department-manager',
});


// Helper to get current user info from localStorage
const getCurrentUser = (): { id: string; name: string } => {
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return {
        id: user.id || user.userId || '',
        name: user.full_name || user.fullName || user.name || 'You',
      };
    }
  } catch (e) {
    console.error('Error parsing user from localStorage:', e);
  }
  return { id: '', name: 'You' };
};

const getCurrentUserId = (): string => getCurrentUser().id;
const getCurrentUserName = (): string => getCurrentUser().name;

export default function ChatManager({ userRole, canModerate = false }: ChatManagerProps) {
  const permissions = getPermissions(userRole);
  const effectiveCanModerate = canModerate || permissions.canModerateChat;
  const currentUserId = getCurrentUserId();

  // State - MUST be declared before any useEffect
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState({ conversations: true, messages: false, users: false });
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'direct' | 'group'>('all');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [showModerationPanel, setShowModerationPanel] = useState(false);
  const [editModal, setEditModal] = useState<{ isOpen: boolean; messageId: string; currentText: string }>({ isOpen: false, messageId: '', currentText: '' });

  // Call state
  const [activeCall, setActiveCall] = useState<{ callId: string; roomName: string; recipientId: string; recipientName: string; isVideoCall: boolean } | null>(null);
  const [incomingCall, setIncomingCall] = useState<{ callId: string; callerId: string; callerName: string; roomName?: string; isVideoCall: boolean } | null>(null);
  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'connecting' | 'active'>('idle');

  const [searchParams] = useSearchParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Socket hook - REALTIME
  const {
    isConnected, onlineUsers,
    joinConversation, leaveConversation,
    sendMessage: socketSendMessage,
    onNewMessage, onMessagesRead, onMessageDeleted, onMessageEdited, onMessageRecalled,
    startCall, acceptCall, declineCall, endCall,
    onIncomingCall, onCallAccepted, onCallDeclined, onCallEnded, onCallBusy, onNoAnswer, onRoomReady,
    editMessage: socketEditMessage, recallMessage: socketRecallMessage,
    addReaction: socketAddReaction, removeReaction: socketRemoveReaction,
  } = useSocket();


  // Debug log
  useEffect(() => {
    console.log('🔑 Current User ID:', currentUserId);
  }, [currentUserId]);

  // ==================== DATA FETCHING ====================
  const fetchConversations = useCallback(async () => {
    try {
      const response = await chatService.getConversations();
      const rawData = response.data || response;
      const mapped: Conversation[] = (Array.isArray(rawData) ? rawData : []).map((c: any) => ({
        id: c.id,
        type: c.isGroup ? 'group' : 'direct',
        name: c.group_name || c.other_user_name || c.name || 'Unknown',
        avatar: c.group_avatar || c.other_user_avatar || c.avatar,
        lastMessage: c.last_message_text || c.lastMessage,
        lastMessageTime: c.last_message_time || c.lastMessageTime || c.created_at,
        unreadCount: c.unread_count || c.unreadCount || 0,
        online: c.other_user_status === 'online' || onlineUsers.has(c.other_user_id),
        memberCount: c.member_count,
        participantId: c.other_user_id || c.participant2_id || c.participant1_id,
      }));
      setConversations(mapped);
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(prev => ({ ...prev, conversations: false }));
    }
  }, [onlineUsers]);

  const fetchMessages = useCallback(async (conversationId: string) => {
    setLoading(prev => ({ ...prev, messages: true }));
    try {
      const response = await chatService.getMessages(conversationId, 50, 0);
      const rawData = response.data || response;
      const mapped: ChatMessage[] = (Array.isArray(rawData) ? rawData : []).map((m: any) => ({
        id: m.id,
        senderId: m.sender_id === currentUserId ? 'me' : m.sender_id,
        senderName: m.sender_name || 'Unknown',
        senderAvatar: m.sender_avatar,
        senderDepartment: m.sender_department,
        content: m.is_recalled ? 'Tin nhắn đã được thu hồi' : (m.message_text || m.content),
        timestamp: m.created_at || m.timestamp,
        status: m.is_read ? 'read' : 'delivered',
        type: m.message_type || 'text',
        editedAt: m.edited_at,
        isRecalled: m.is_recalled || false,
      }));
      setMessages(mapped.reverse());
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(prev => ({ ...prev, messages: false }));
    }
  }, [currentUserId]);

  const searchUsers = useCallback(async (query: string) => {
    setLoading(prev => ({ ...prev, users: true }));
    try {
      const response = await chatService.searchUsers(query);
      const rawData = response.data || response;
      setUsers((Array.isArray(rawData) ? rawData : []).map((u: any) => ({
        id: u.id,
        name: u.full_name || u.name,
        avatar: u.avatar_url,
        department: u.department_name || u.department,
        online: u.status === 'online' || onlineUsers.has(u.id),
      })));
    } catch (err) {
      console.error('Error searching users:', err);
    } finally {
      setLoading(prev => ({ ...prev, users: false }));
    }
  }, [onlineUsers]);


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
        senderId: isFromMe ? 'me' : msg.sender_id,
        senderName: msg.sender_name || 'Unknown',
        senderAvatar: msg.sender_avatar,
        content: msg.message_text || msg.content,
        timestamp: msg.created_at || new Date().toISOString(),
        status: isFromMe ? 'sent' : 'delivered',
        type: msg.message_type || 'text',
      };

      // Add message if it's for current conversation
      if (data.conversationId === activeConversationId) {
        setMessages(prev => {
          // Avoid duplicates by checking both id and tempId
          if (prev.some(m => m.id === newMessage.id)) return prev;
          
          // If this is our own message, replace the optimistic one
          if (isFromMe) {
            // Find and replace optimistic message (has tempId, status 'sending')
            const hasOptimistic = prev.some(m => m.status === 'sending' && m.content === newMessage.content);
            if (hasOptimistic) {
              return prev.map(m => 
                (m.status === 'sending' && m.content === newMessage.content) 
                  ? { ...newMessage, status: 'sent' } 
                  : m
              );
            }
          }
          
          return [...prev, newMessage];
        });
      }

      // Update conversation list
      setConversations(prev => prev.map(c => 
        c.id === data.conversationId 
          ? { 
              ...c, 
              lastMessage: newMessage.content, 
              lastMessageTime: newMessage.timestamp, 
              unreadCount: c.id === activeConversationId ? 0 : (isFromMe ? c.unreadCount : c.unreadCount + 1)
            }
          : c
      ));
    });

    // Listen for read receipts
    const unsubRead = onMessagesRead?.((data: any) => {
      if (data.conversationId === activeConversationId) {
        setMessages(prev => prev.map(m => m.senderId === 'me' ? { ...m, status: 'read' } : m));
      }
    });

    // Listen for deleted messages
    const unsubDeleted = onMessageDeleted?.((data: any) => {
      if (data.conversationId === activeConversationId) {
        setMessages(prev => prev.filter(m => m.id !== data.messageId));
      }
    });

    // Listen for edited messages
    const unsubEdited = onMessageEdited?.((data: any) => {
      if (data.conversationId === activeConversationId) {
        setMessages(prev => prev.map(m => m.id === data.messageId ? { ...m, content: data.newText, editedAt: data.editedAt } : m));
      }
    });

    // Listen for recalled messages
    const unsubRecalled = onMessageRecalled?.((data: any) => {
      if (data.conversationId === activeConversationId) {
        setMessages(prev => prev.map(m => m.id === data.messageId ? { ...m, content: 'Tin nhắn đã được thu hồi', isRecalled: true } : m));
      }
    });

    return () => {
      unsubNewMessage?.();
      unsubRead?.();
      unsubDeleted?.();
      unsubEdited?.();
      unsubRecalled?.();
    };
  }, [activeConversationId, currentUserId, onNewMessage, onMessagesRead, onMessageDeleted, onMessageEdited, onMessageRecalled]);


  // ==================== EFFECTS ====================
  // Initial load
  useEffect(() => {
    fetchConversations();
    searchUsers('');
  }, []);

  // Join/leave conversation room for realtime
  useEffect(() => {
    if (activeConversationId) {
      joinConversation(activeConversationId);
      fetchMessages(activeConversationId);
      chatService.markAsRead(activeConversationId).catch(console.error);
      // Reset unread count
      setConversations(prev => prev.map(c => c.id === activeConversationId ? { ...c, unreadCount: 0 } : c));
    }
    return () => {
      if (activeConversationId) leaveConversation(activeConversationId);
    };
  }, [activeConversationId, joinConversation, leaveConversation, fetchMessages]);

  // Handle deep link
  useEffect(() => {
    const targetUserId = searchParams.get('userId');
    if (targetUserId && conversations.length > 0) {
      const existing = conversations.find(c => c.participantId === targetUserId);
      if (existing) setActiveConversationId(existing.id);
      else {
        chatService.getOrCreateConversation(targetUserId).then(data => {
          setActiveConversationId(data.id);
          fetchConversations();
        }).catch(console.error);
      }
    }
  }, [searchParams, conversations]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ==================== HANDLERS ====================
  const handleSendMessage = async () => {
    console.log('📤 handleSendMessage called', { messageInput, activeConversationId, isConnected });
    
    if (!messageInput.trim() || !activeConversationId) {
      console.warn('❌ Cannot send: empty message or no conversation', { messageInput: messageInput.trim(), activeConversationId });
      return;
    }
    
    const tempId = crypto.randomUUID();
    const content = messageInput.trim();
    
    console.log('📨 Sending message:', { content, conversationId: activeConversationId, isConnected });
    
    // Optimistic UI - add message immediately
    const optimisticMsg: ChatMessage = {
      id: tempId,
      tempId,
      senderId: 'me',
      senderName: getCurrentUserName(),
      content,
      timestamp: new Date().toISOString(),
      status: 'sending',
      type: 'text',
    };
    setMessages(prev => [...prev, optimisticMsg]);
    setMessageInput('');

    // Send via socket (realtime)
    if (isConnected) {
      console.log('🔌 Sending via socket...');
      socketSendMessage({
        conversationId: activeConversationId,
        messageText: content,
        messageType: 'text',
      });

      // Update to sent after short delay
      setTimeout(() => {
        setMessages(prev => prev.map(m => m.tempId === tempId ? { ...m, status: 'sent' } : m));
      }, 300);
    } else {
      // Fallback to REST API if socket not connected
      console.warn('⚠️ Socket not connected, using REST API fallback');
      chatService.sendMessage({
        conversationId: activeConversationId,
        messageText: content,
        messageType: 'text',
      }).then(() => {
        console.log('✅ Message sent via REST API');
        setMessages(prev => prev.map(m => m.tempId === tempId ? { ...m, status: 'sent' } : m));
      }).catch(err => {
        console.error('❌ Failed to send message:', err);
        setMessages(prev => prev.map(m => m.tempId === tempId ? { ...m, status: 'failed' } : m));
      });
    }
  };

  const handleStartChat = async (user: ChatUser) => {
    try {
      const data = await chatService.getOrCreateConversation(user.id);
      setActiveConversationId(data.id);
      setShowNewChat(false);
      setUserSearchTerm('');
      fetchConversations();
    } catch (err) {
      console.error('Error starting chat:', err);
    }
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    if (diffDays === 1) return 'Hôm qua';
    if (diffDays < 7) return date.toLocaleDateString('vi-VN', { weekday: 'short' });
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  };


  // ==================== CALL HANDLERS ====================
  const activeConversation = conversations.find(c => c.id === activeConversationId);

  const handleStartCall = (isVideoCall: boolean) => {
    console.log('📞 handleStartCall', { 
      isVideoCall, 
      activeConversation, 
      isConnected,
      participantId: activeConversation?.participantId 
    });
    
    if (!activeConversation || activeConversation.type !== 'direct' || !activeConversation.participantId) {
      console.warn('❌ Cannot start call: invalid conversation', { activeConversation });
      return;
    }
    
    if (!isConnected) {
      console.warn('❌ Cannot start call: socket not connected');
      alert('Không thể gọi: Kết nối bị gián đoạn. Vui lòng thử lại.');
      return;
    }
    
    const result = startCall({ recipientId: activeConversation.participantId, recipientName: activeConversation.name, isVideoCall });
    console.log('📞 startCall result:', result);
    
    if (result) {
      setCallStatus('calling');
      setActiveCall({ callId: result.callId, roomName: result.roomName, recipientId: activeConversation.participantId, recipientName: activeConversation.name, isVideoCall });
    }
  };

  const handleAcceptCall = () => {
    if (!incomingCall) return;
    acceptCall(incomingCall.callId);
    setCallStatus('connecting');
    setActiveCall({ callId: incomingCall.callId, roomName: incomingCall.roomName || '', recipientId: incomingCall.callerId, recipientName: incomingCall.callerName, isVideoCall: incomingCall.isVideoCall });
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
    setCallStatus('idle');
  };

  // Call event listeners
  useEffect(() => {
    // When room is ready (for caller), update activeCall with roomUrl
    const unsubRoomReady = onRoomReady?.((data) => {
      console.log('📹 Room ready:', data);
      setActiveCall(prev => prev && prev.callId === data.callId ? { ...prev, roomName: data.roomUrl } : prev);
    });
    
    const unsub1 = onIncomingCall((data) => {
      console.log('📞 Incoming call:', data);
      setIncomingCall({ 
        callId: data.callId, 
        callerId: data.callerId, 
        callerName: data.callerName, 
        roomName: data.roomUrl || data.roomUrl?.split('/').pop(), // Use full roomUrl if available
        isVideoCall: data.isVideoCall 
      });
    });
    const unsub2 = onCallAccepted(() => setCallStatus('active'));
    const unsub3 = onCallDeclined(() => { setActiveCall(null); setCallStatus('idle'); });
    const unsub4 = onCallEnded(() => { setActiveCall(null); setCallStatus('idle'); });
    const unsub5 = onCallBusy(() => { setActiveCall(null); setCallStatus('idle'); });
    const unsub6 = onNoAnswer(() => { setActiveCall(null); setCallStatus('idle'); });
    return () => { unsubRoomReady?.(); unsub1?.(); unsub2?.(); unsub3?.(); unsub4?.(); unsub5?.(); unsub6?.(); };
  }, [onRoomReady, onIncomingCall, onCallAccepted, onCallDeclined, onCallEnded, onCallBusy, onNoAnswer]);

  const handleModerateDelete = async (messageId: string) => { console.log('Moderate delete:', messageId); };
  const handleReportMessage = async (messageId: string, reason: string) => { console.log('Report:', messageId, reason); };

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || conv.type === filterType;
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
                  <button onClick={() => setShowModerationPanel(!showModerationPanel)} className={`w-9 h-9 rounded-lg flex items-center justify-center ${showModerationPanel ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                    <Shield size={18} />
                  </button>
                )}
                <button onClick={() => setShowNewChat(true)} className="w-9 h-9 bg-teal-600 text-white rounded-lg flex items-center justify-center hover:bg-teal-700">
                  <Plus size={18} />
                </button>
              </div>
            </div>
            <div className="relative mb-4">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Tìm kiếm..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border-0 rounded-lg text-sm focus:ring-2 focus:ring-teal-500/30 outline-none" />
            </div>
            <div className="flex p-1 bg-slate-100 rounded-lg">
              {(['all', 'direct', 'group'] as const).map(type => (
                <button key={type} onClick={() => setFilterType(type)} className={`flex-1 py-2 text-xs font-semibold rounded-md ${filterType === type ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>
                  {type === 'all' ? 'Tất cả' : type === 'direct' ? 'Cá nhân' : 'Nhóm'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {loading.conversations ? (
              <div className="space-y-3 p-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="flex gap-3 p-3"><Skeleton className="w-12 h-12" rounded="full" /><div className="flex-1 space-y-2"><Skeleton className="w-3/4 h-4" /><Skeleton className="w-1/2 h-3" /></div></div>)}</div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center py-12 text-slate-400"><MessageCircle size={40} className="mx-auto mb-3 opacity-50" /><p>Không có cuộc trò chuyện</p></div>
            ) : (
              filteredConversations.map(conv => (
                <button key={conv.id} onClick={() => setActiveConversationId(conv.id)} className={`w-full p-3 flex gap-3 rounded-xl mb-1 ${activeConversationId === conv.id ? 'bg-teal-50 border-l-4 border-teal-500' : 'hover:bg-slate-50'}`}>
                  <Avatar name={conv.name} src={conv.avatar} size="md" status={conv.online ? 'online' : undefined} />
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex justify-between items-center mb-0.5">
                      <h4 className={`text-sm truncate ${activeConversationId === conv.id ? 'font-bold text-teal-700' : 'font-medium text-slate-800'}`}>{conv.name}</h4>
                      <span className="text-[10px] text-slate-400 ml-2">{formatTime(conv.lastMessageTime || '')}</span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">{conv.lastMessage || 'Chưa có tin nhắn'}</p>
                  </div>
                  {conv.unreadCount > 0 && <span className="self-center bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full">{conv.unreadCount}</span>}
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
                <Avatar name={activeConversation.name} src={activeConversation.avatar} size="md" status={activeConversation.online ? 'online' : undefined} />
                <div>
                  <h3 className="font-bold text-slate-900">{activeConversation.name}</h3>
                  <p className="text-xs text-slate-500">{activeConversation.online ? <span className="text-emerald-500 font-medium">● Online</span> : 'Offline'}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {activeConversation.type === 'direct' && (
                  <>
                    <button onClick={() => handleStartCall(false)} disabled={!isConnected} className={`p-2.5 rounded-lg ${isConnected ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`} title={!isConnected ? 'Đang kết nối...' : 'Gọi thoại'}><Phone size={18} /></button>
                    <button onClick={() => handleStartCall(true)} disabled={!isConnected} className={`p-2.5 rounded-lg ${isConnected ? 'bg-teal-50 text-teal-600 hover:bg-teal-100' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`} title={!isConnected ? 'Đang kết nối...' : 'Gọi video'}><Video size={18} /></button>
                  </>
                )}
                <button className="p-2.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200"><MoreVertical size={18} /></button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 bg-gradient-to-b from-slate-50 to-white">
              {loading.messages ? (
                <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div></div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4"><MessageCircle size={36} className="text-slate-300" /></div>
                  <p className="text-sm">Chưa có tin nhắn. Hãy bắt đầu cuộc trò chuyện!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map(msg => {
                    const isOwn = msg.senderId === 'me';
                    const canEdit = isOwn && !msg.isRecalled && msg.timestamp && (Date.now() - new Date(msg.timestamp).getTime() < 5 * 60 * 1000);
                    return (
                      <div key={msg.id || msg.tempId} className={`flex gap-3 group ${isOwn ? 'flex-row-reverse' : ''}`}>
                        {!isOwn && <div className="flex-shrink-0 self-end"><Avatar name={msg.senderName} src={msg.senderAvatar} size="sm" /></div>}
                        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[60%]`}>
                          {!isOwn && <span className="text-xs font-medium text-slate-500 mb-1 ml-1">{msg.senderName}</span>}
                          <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isOwn ? 'bg-teal-600 text-white rounded-br-md' : 'bg-slate-100 text-slate-800 rounded-bl-md'} ${msg.status === 'failed' ? 'opacity-60' : ''} ${msg.isRecalled ? 'italic opacity-60' : ''}`}>
                            {msg.content}
                            {msg.editedAt && !msg.isRecalled && <span className={`ml-2 text-[10px] ${isOwn ? 'text-teal-200' : 'text-slate-400'}`}>(đã sửa)</span>}
                          </div>
                          <div className={`flex items-center gap-1.5 mt-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
                            <span className="text-[10px] text-slate-400">{msg.status === 'sending' ? 'Đang gửi...' : formatTime(msg.timestamp)}</span>
                            {isOwn && (
                              <>
                                {msg.status === 'sending' && <Clock size={10} className="text-slate-400 animate-pulse" />}
                                {msg.status === 'sent' && <Check size={10} className="text-slate-400" />}
                                {msg.status === 'delivered' && <CheckCheck size={10} className="text-slate-400" />}
                                {msg.status === 'read' && <CheckCheck size={10} className="text-teal-500" />}
                                {msg.status === 'failed' && <button className="flex items-center gap-1 text-red-500 text-[10px]"><AlertCircle size={10} /> Thất bại <RefreshCw size={8} /></button>}
                              </>
                            )}
                          </div>
                          {msg.status !== 'sending' && msg.status !== 'failed' && (
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                              <MessageActions messageId={msg.id} conversationId={activeConversationId || ''} isOwnMessage={isOwn} canEdit={canEdit} canModerate={effectiveCanModerate} isRecalled={msg.isRecalled || false} reactions={msg.reactions || []}
                                onEdit={(id) => setEditModal({ isOpen: true, messageId: id, currentText: msg.content })}
                                onRecall={(id) => activeConversationId && socketRecallMessage(id, activeConversationId)}
                                onAddReaction={(id, emoji) => activeConversationId && socketAddReaction(id, activeConversationId, emoji)}
                                onRemoveReaction={(id, emoji) => activeConversationId && socketRemoveReaction(id, activeConversationId, emoji)}
                                onModerateDelete={effectiveCanModerate ? handleModerateDelete : undefined}
                                onReport={handleReportMessage}
                              />
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
              <div className="flex items-center gap-3">
                <button className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"><Paperclip size={20} /></button>
                <input type="text" value={messageInput} onChange={e => setMessageInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }} placeholder="Nhập tin nhắn..." className="flex-1 px-4 py-3 bg-slate-100 border-0 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/30 outline-none" />
                <button type="button" onClick={handleSendMessage} disabled={!messageInput.trim()} className="p-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed"><Send size={18} /></button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-slate-50">
            <div className="w-24 h-24 bg-white rounded-full shadow-sm flex items-center justify-center mb-6"><MessageCircle size={48} className="text-teal-500" /></div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Chọn cuộc trò chuyện</h3>
            <p className="text-slate-500 text-sm mb-6 text-center max-w-xs">Chọn một cuộc trò chuyện từ danh sách hoặc bắt đầu cuộc trò chuyện mới</p>
            <button onClick={() => setShowNewChat(true)} className="px-6 py-2.5 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700">Bắt đầu trò chuyện</button>
          </div>
        )}
      </div>

      {/* Modals */}
      <Modal isOpen={showNewChat} onClose={() => setShowNewChat(false)} title="Tin nhắn mới">
        <div className="p-5">
          <div className="relative mb-5">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input autoFocus type="text" placeholder="Tìm kiếm người dùng..." value={userSearchTerm} onChange={e => { setUserSearchTerm(e.target.value); searchUsers(e.target.value); }} className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border-0 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500/30" />
          </div>
          <div className="space-y-1 max-h-72 overflow-y-auto">
            {loading.users ? <div className="text-center text-slate-400 py-6">Đang tìm kiếm...</div> : users.length === 0 ? <div className="text-center text-slate-400 py-6">Không tìm thấy</div> : users.map(user => (
              <button key={user.id} onClick={() => handleStartChat(user)} className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg">
                <Avatar name={user.name} src={user.avatar} size="md" />
                <div className="text-left"><div className="font-medium text-slate-900 text-sm">{user.name}</div><div className="text-xs text-slate-500">{user.department || 'Nhân viên'}</div></div>
              </button>
            ))}
          </div>
        </div>
      </Modal>

      <IncomingCallModal isOpen={!!incomingCall} callerName={incomingCall?.callerName || ''} isVideoCall={incomingCall?.isVideoCall || false} onAccept={handleAcceptCall} onDecline={handleDeclineCall} />
      {/* Only render VideoCallModal when there's an active call with valid roomName */}
      {activeCall && activeCall.roomName && ['calling', 'connecting', 'active'].includes(callStatus) ? (
        <>
          {console.log('📹 Rendering VideoCallModal:', { activeCall, callStatus })}
          <VideoCallModal isOpen={true} onClose={handleEndCall} roomName={activeCall.roomName} displayName={getCurrentUserName()} otherUserName={activeCall.recipientName || ''} isVideoCall={activeCall.isVideoCall || false} onCallEnd={handleEndCall} />
        </>
      ) : null}
      <EditMessageModal isOpen={editModal.isOpen} currentText={editModal.currentText} onSave={(newText) => { if (activeConversationId && editModal.messageId) socketEditMessage(editModal.messageId, activeConversationId, newText); setEditModal({ isOpen: false, messageId: '', currentText: '' }); }} onClose={() => setEditModal({ isOpen: false, messageId: '', currentText: '' })} />
    </div>
  );
}

export { ChatManager };
