
import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, X, Send, ChevronLeft, 
  Search, MoreVertical, Image as ImageIcon, 
  Paperclip, Smile, Minus, Circle
} from 'lucide-react';
import { Button } from './system/ui/Button';

interface ChatUser {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: 'online' | 'busy' | 'offline';
  lastMessage: string;
  time: string;
  unread: number;
}

const MOCK_CHAT_USERS: ChatUser[] = [
  { 
    id: 'u1', 
    name: 'Hoàng Minh', 
    role: 'Product Owner',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80', 
    status: 'online', 
    lastMessage: 'Deadline dự án dời sang thứ 6 nhé.', 
    time: '5p',
    unread: 2 
  },
  { 
    id: 'u2', 
    name: 'Ngọc Lan', 
    role: 'UI/UX Designer',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80', 
    status: 'busy', 
    lastMessage: 'Đang fix lại UI Dashboard, chờ xíu.', 
    time: '1h',
    unread: 0 
  },
  { 
    id: 'u3', 
    name: 'Tuấn Anh', 
    role: 'DevOps Engineer',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80', 
    status: 'offline', 
    lastMessage: 'Server bảo trì lúc 12h đêm nay.', 
    time: '3h',
    unread: 0 
  },
  { 
    id: 'u4', 
    name: 'Thảo Vy', 
    role: 'HR Manager',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80', 
    status: 'online', 
    lastMessage: 'Về việc team building tháng sau...', 
    time: '1d',
    unread: 1 
  },
  { 
    id: 'u5', 
    name: 'David Nguyễn', 
    role: 'Tech Lead',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', 
    status: 'online', 
    lastMessage: 'Code review xong chưa em?', 
    time: '2d',
    unread: 0 
  }
];

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'them';
  time: string;
}

export const QuickChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeUser, setActiveUser] = useState<ChatUser | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load initial dummy messages when opening a chat
  useEffect(() => {
    if (activeUser) {
      setMessages([
        { id: '1', text: `Chào ${activeUser.name.split(' ').pop()}, công việc thế nào rồi?`, sender: 'me', time: '10:00' },
        { id: '2', text: activeUser.lastMessage, sender: 'them', time: activeUser.time === '5p' ? '10:05' : 'Yesterday' }
      ]);
    }
  }, [activeUser]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMsg]);
    setInputText('');

    // Mock auto reply
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: "Ok, mình đã nhận được tin nhắn.",
        sender: 'them',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1500);
  };

  const filteredUsers = MOCK_CHAT_USERS.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'online': return 'bg-green-500';
      case 'busy': return 'bg-red-500';
      default: return 'bg-slate-400';
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full shadow-lg shadow-indigo-500/40 text-white flex items-center justify-center hover:scale-110 transition-transform duration-300 group"
      >
        <MessageCircle size={28} className="group-hover:rotate-12 transition-transform" />
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 border-2 border-white rounded-full text-[10px] font-bold flex items-center justify-center">3</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[380px] h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-fadeIn origin-bottom-right">
      {/* Header */}
      <div className="h-16 bg-gradient-to-r from-indigo-600 to-violet-600 p-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 text-white">
          {activeUser ? (
             <button onClick={() => setActiveUser(null)} className="hover:bg-white/10 p-1 rounded-full transition-colors">
               <ChevronLeft size={20} />
             </button>
          ) : (
             <MessageCircle size={20} />
          )}
          
          {activeUser ? (
             <div className="flex items-center gap-2">
                <div className="relative">
                   <img src={activeUser.avatar} className="w-8 h-8 rounded-full border border-white/30" alt="" />
                   <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-indigo-600 rounded-full ${getStatusColor(activeUser.status)}`}></div>
                </div>
                <div>
                   <h3 className="font-bold text-sm leading-tight">{activeUser.name}</h3>
                   <span className="text-[10px] opacity-80 block capitalize">{activeUser.status}</span>
                </div>
             </div>
          ) : (
             <h3 className="font-bold text-lg">Tin nhắn nhanh</h3>
          )}
        </div>
        
        <div className="flex items-center gap-1 text-white/80">
           <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <Minus size={18} />
           </button>
           <button onClick={() => { setActiveUser(null); setIsOpen(false); }} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X size={18} />
           </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-hidden bg-slate-50 flex flex-col">
        {activeUser ? (
           /* Chat View */
           <>
             <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                <div className="text-center text-xs text-slate-400 my-2">Hôm nay, {new Date().toLocaleDateString('vi-VN')}</div>
                {messages.map((msg) => (
                   <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm shadow-sm ${
                        msg.sender === 'me' 
                          ? 'bg-indigo-600 text-white rounded-br-none' 
                          : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                      }`}>
                         <p>{msg.text}</p>
                         <p className={`text-[10px] mt-1 text-right ${msg.sender === 'me' ? 'text-indigo-200' : 'text-slate-400'}`}>{msg.time}</p>
                      </div>
                   </div>
                ))}
                <div ref={messagesEndRef} />
             </div>

             <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
                <div className="flex gap-1 text-slate-400">
                   <button type="button" className="p-1.5 hover:bg-slate-100 rounded-full transition-colors"><ImageIcon size={18} /></button>
                   <button type="button" className="p-1.5 hover:bg-slate-100 rounded-full transition-colors"><Paperclip size={18} /></button>
                </div>
                <input 
                  type="text" 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Nhập tin nhắn..." 
                  className="flex-1 bg-slate-100 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                />
                <button 
                  type="submit" 
                  disabled={!inputText.trim()}
                  className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                >
                   <Send size={16} className="ml-0.5" />
                </button>
             </form>
           </>
        ) : (
           /* User List View */
           <>
              <div className="p-3 border-b border-slate-200 bg-white">
                 <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Tìm kiếm người dùng..." 
                      className="w-full bg-slate-100 border-none rounded-lg pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                    />
                 </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar">
                 {filteredUsers.length > 0 ? (
                   filteredUsers.map(user => (
                      <div 
                        key={user.id} 
                        onClick={() => setActiveUser(user)}
                        className="p-3 hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-3 border-b border-slate-100 last:border-0"
                      >
                         <div className="relative shrink-0">
                            <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                            <div className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full ${getStatusColor(user.status)}`}></div>
                         </div>
                         <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-0.5">
                               <h4 className="font-bold text-sm text-slate-900 truncate">{user.name}</h4>
                               <span className="text-[10px] text-slate-400">{user.time}</span>
                            </div>
                            <p className="text-xs text-slate-500 truncate">{user.lastMessage}</p>
                         </div>
                         {user.unread > 0 && (
                            <div className="shrink-0 w-5 h-5 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                               {user.unread}
                            </div>
                         )}
                      </div>
                   ))
                 ) : (
                   <div className="flex flex-col items-center justify-center h-full text-slate-400 p-4 text-center">
                      <Search size={32} className="mb-2 opacity-20" />
                      <p className="text-sm">Không tìm thấy người dùng nào</p>
                   </div>
                 )}
              </div>
              
              <div className="p-2 text-center text-[10px] text-slate-400 border-t border-slate-200 bg-white">
                 Nexus Quick Chat
              </div>
           </>
        )}
      </div>
    </div>
  );
};
