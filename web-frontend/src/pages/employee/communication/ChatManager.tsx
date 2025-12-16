import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Send,
  Paperclip,
  Phone,
  Video,
  MoreVertical,
  Plus,
  Users,
  X,
  Check,
  CheckCheck,
  MessageCircle
} from 'lucide-react';
import { useChat, Conversation, ChatUser } from '../../../hooks/useChat';
import { Avatar } from '../../../components/ui/Avatar';
import { Skeleton } from '../../../components/ui/Skeleton';
import { Modal } from '../../../components/ui/Modal';

// Theme Configuration
const THEME = {
  bg: "bg-[#F8FAFC]",
  card: "bg-white rounded-[24px] shadow-sm border-0",
  sidebarBg: "bg-white border-r border-slate-100",
  activeItem: "bg-teal-50 border-r-4 border-teal-500",
  hoverItem: "hover:bg-slate-50",
  messageOwn: "bg-teal-600 text-white rounded-tr-none shadow-md shadow-teal-900/10",
  messageOther: "bg-white text-slate-800 rounded-tl-none shadow-sm border border-slate-100",
  accentText: "text-teal-600",
};

export default function ChatManager() {
  const {
    conversations,
    messages,
    users,
    loading,
    activeConversationId,
    setActiveConversationId,
    sendMessage,
    searchUsers,
    createConversation,
  } = useChat();

  const [searchTerm, setSearchTerm] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'direct' | 'group'>('all');
  const [userSearchTerm, setUserSearchTerm] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();
  const targetUserId = searchParams.get('userId');

  // Handle deep link to chat with user
  useEffect(() => {
    if (targetUserId) {
      // Find existing conversation with this user (mock logic - in real app, might need API call)
      const existing = conversations.find(c => c.type === 'direct' && c.name === targetUserId); // Simplistic matching for now
      if (existing) {
        setActiveConversationId(existing.id);
      } else {
        // Attempt to create/find
        // In a real scenario, we'd fetch user details by ID then createConversation
        // For now, we utilize createConversation if we can
        createConversation(targetUserId).then(id => setActiveConversationId(id)).catch(err => console.error(err));
      }
    }
  }, [targetUserId, conversations, createConversation, setActiveConversationId]);

  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  // Filter conversations
  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch = conv.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || conv.type === filterType;
    return matchesSearch && matchesType;
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle send message
  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;
    try {
      await sendMessage(messageInput);
      setMessageInput('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  // Handle start new chat
  const handleStartChat = async (user: ChatUser) => {
    try {
      const conversationId = await createConversation(user.id);
      setActiveConversationId(conversationId);
      setShowNewChat(false);
      setUserSearchTerm('');
    } catch (err) {
      console.error('Error starting chat:', err);
    }
  };

  // Format time
  const formatTime = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    }
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) {
      return date.toLocaleDateString('vi-VN', { weekday: 'short' });
    }
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  };

  return (
    <div className={`h-[calc(100vh-100px)] flex flex-col lg:flex-row ${THEME.bg} p-6 gap-6 font-sans text-slate-800`}>

      {/* Sidebar - Conversations */}
      <div className={`w-full lg:w-96 flex flex-col ${THEME.card} overflow-hidden`}>
        {/* Header */}
        <div className="p-6 pb-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <MessageCircle className="text-teal-600" /> Messages
            </h2>
            <button
              onClick={() => setShowNewChat(true)}
              className="w-10 h-10 bg-slate-900 text-white rounded-xl shadow-lg shadow-slate-900/20 flex items-center justify-center hover:bg-slate-800 transition-all"
            >
              <Plus size={20} />
            </button>
          </div>

          <div className="relative mb-4">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-0 rounded-2xl font-medium text-slate-900 focus:ring-2 focus:ring-teal-500/20 outline-none"
            />
          </div>

          <div className="flex p-1 bg-slate-50 rounded-xl mb-4">
            {['all', 'direct', 'group'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type as any)}
                className={`flex-1 py-1.5 text-xs font-bold uppercase rounded-lg transition-all ${filterType === type ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
          {loading.conversations ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-4 p-3"><Skeleton className="w-12 h-12" rounded="full" /><div className="flex-1 space-y-2"><Skeleton className="w-3/4 h-4" /><Skeleton className="w-1/2 h-3" /></div></div>
            ))
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-10 text-slate-400">No conversations found.</div>
          ) : (
            filteredConversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => setActiveConversationId(conv.id)}
                className={`w-full p-4 flex gap-4 rounded-2xl transition-all group ${activeConversationId === conv.id ? 'bg-teal-50' : 'hover:bg-slate-50'}`}
              >
                <div className="relative">
                  <Avatar name={conv.name} src={conv.avatar} size="md" status={conv.type === 'direct' && conv.online ? 'online' : undefined} />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className={`text-sm truncate ${activeConversationId === conv.id ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>{conv.name}</h4>
                    <span className="text-[10px] font-bold text-slate-400">{formatTime(conv.lastMessageTime || '')}</span>
                  </div>
                  <p className={`text-sm truncate ${activeConversationId === conv.id ? 'text-teal-700 font-medium' : 'text-slate-500'}`}>
                    {conv.lastMessage || 'No messages yet'}
                  </p>
                </div>
                {conv.unreadCount > 0 && (
                  <div className="self-center bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">{conv.unreadCount}</div>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col ${THEME.card} overflow-hidden`}>
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white z-10">
              <div className="flex items-center gap-4">
                <Avatar name={activeConversation.name} src={activeConversation.avatar} size="md" status={activeConversation.type === 'direct' && activeConversation.online ? 'online' : undefined} />
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">{activeConversation.name}</h3>
                  <p className="text-xs font-medium text-slate-500 flex items-center gap-2">
                    {activeConversation.type === 'direct' ? (activeConversation.online ? <span className="text-emerald-500">Online</span> : 'Offline') : `${activeConversation.memberCount} members`}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-3 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"><Phone size={20} /></button>
                <button className="p-3 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"><Video size={20} /></button>
                <button className="p-3 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"><MoreVertical size={20} /></button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#F8FAFC]">
              {loading.messages ? (
                <div className="text-center text-slate-400">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center"><MessageCircle size={40} className="text-slate-300" /></div>
                  <p>No messages yet. Say hello!</p>
                </div>
              ) : (
                messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] ${msg.senderId === 'me' ? 'order-2' : 'order-1'}`}>
                      {msg.senderId !== 'me' && <p className="text-xs font-bold text-slate-400 mb-1 ml-1">{msg.senderName}</p>}

                      <div className={`px-6 py-3 text-sm leading-relaxed ${msg.senderId === 'me' ? THEME.messageOwn : THEME.messageOther} rounded-2xl`}>
                        {msg.content}
                      </div>

                      <div className={`flex items-center gap-1 mt-1 px-1 ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'}`}>
                        <span className="text-[10px] font-bold text-slate-400 opacity-70">{formatTime(msg.timestamp)}</span>
                        {msg.senderId === 'me' && (
                          msg.status === 'read' ? <CheckCheck size={12} className="text-teal-500" /> : <Check size={12} className="text-slate-400" />
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-100">
              <div className="bg-slate-50 p-2 rounded-[24px] flex items-center gap-2 border border-slate-100 focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-500/50 transition-all shadow-sm">
                <button className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-full transition-colors"><Paperclip size={20} /></button>
                <input
                  type="text"
                  value={messageInput}
                  onChange={e => setMessageInput(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 bg-transparent border-none outline-none text-slate-900 placeholder:text-slate-400 font-medium h-10"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  className="p-3 bg-slate-900 text-white rounded-full hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-slate-900/20 transition-all transform hover:scale-105 active:scale-95"
                >
                  <Send size={18} className={messageInput.trim() ? "translate-x-0.5" : ""} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#F8FAFC]">
            <div className="w-32 h-32 bg-white rounded-full shadow-sm flex items-center justify-center mb-6">
              <MessageCircle size={64} className="text-teal-500 opacity-80" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Select a Conversation</h3>
            <p className="text-slate-500 max-w-sm">Choose an existing conversation from the list or start a new one to begin messaging.</p>
            <button onClick={() => setShowNewChat(true)} className="mt-8 px-8 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-slate-800 transition-all">Start New Chat</button>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      <Modal isOpen={showNewChat} onClose={() => setShowNewChat(false)} title="New Message">
        <div className="p-6">
          <div className="relative mb-6">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              autoFocus
              type="text"
              placeholder="Search for people..."
              value={userSearchTerm}
              onChange={e => { setUserSearchTerm(e.target.value); searchUsers(e.target.value); }}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-0 rounded-xl font-medium text-slate-900 outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto">
            {loading.users ? (
              <div className="text-center text-slate-400 py-4">Searching...</div>
            ) : users.length === 0 ? (
              <div className="text-center text-slate-400 py-8">No users found.</div>
            ) : (
              users.map(user => (
                <button key={user.id} onClick={() => handleStartChat(user)} className="w-full flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors">
                  <Avatar name={user.name} src={user.avatar} size="md" />
                  <div className="text-left">
                    <div className="font-bold text-slate-900">{user.name}</div>
                    <div className="text-xs font-bold text-slate-500">{user.department || 'Employee'}</div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </Modal>

    </div>
  );
}
