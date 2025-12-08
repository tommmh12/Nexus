
import React, { useState, useEffect, useRef } from 'react';
import { 
    Search, Send, Paperclip, MoreVertical, 
    Phone, Video, Check, CheckCheck, Circle,
    Image as ImageIcon, Smile, Info, X, FileText, Download,
    ChevronRight, ChevronDown, Clock, MapPin, Mail
} from 'lucide-react';
import { Button } from '../ui/Button';
import { MOCK_USERS } from '../../data/mockData';

// --- Types ---
interface Attachment {
    type: 'image' | 'file';
    url: string;
    name: string;
    size?: string;
}

interface Message {
    id: string;
    senderId: string; // 'admin' or user_id
    text?: string;
    attachments?: Attachment[];
    timestamp: string; // ISO string
    isRead: boolean;
}

interface Conversation {
    id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    userStatus: 'online' | 'offline' | 'busy';
    lastMessage: string;
    lastUpdated: string;
    unreadCount: number;
    messages: Message[];
}

// --- Mock Data ---
const CURRENT_ADMIN_ID = 'admin';

const MOCK_CONVERSATIONS: Conversation[] = [
    {
        id: 'c1',
        userId: 'u001',
        userName: 'Nguyễn Thị Hoa',
        userAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=100&h=100',
        userStatus: 'online',
        lastMessage: 'Em gửi lại file báo cáo nhé ạ.',
        lastUpdated: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 mins ago
        unreadCount: 2,
        messages: [
            { id: 'm1', senderId: 'u001', text: 'Chào anh, cho em hỏi về quy trình duyệt budget Q4 ạ.', timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), isRead: true },
            { id: 'm2', senderId: 'admin', text: 'Chào Hoa, em xem trong thư mục Shared Drive > Finance nhé.', timestamp: new Date(Date.now() - 1000 * 60 * 55).toISOString(), isRead: true },
            { 
                id: 'm2_img', 
                senderId: 'admin', 
                timestamp: new Date(Date.now() - 1000 * 60 * 54).toISOString(), 
                isRead: true,
                attachments: [{ type: 'image', url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=600', name: 'process_chart.png' }]
            },
            { id: 'm3', senderId: 'u001', text: 'Dạ em thấy rồi ạ. Cảm ơn anh.', timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(), isRead: false },
            { 
                id: 'm4', 
                senderId: 'u001', 
                text: 'Em gửi lại file báo cáo nhé ạ.', 
                timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), 
                isRead: false,
                attachments: [{ type: 'file', url: '#', name: 'Bao_cao_Q4_Final.pdf', size: '2.4 MB' }]
            },
        ]
    },
    {
        id: 'c2',
        userId: 'u002',
        userName: 'Trần Văn Nam',
        userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100&h=100',
        userStatus: 'busy',
        lastMessage: 'Server staging đang bị lỗi 502 anh ơi.',
        lastUpdated: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        unreadCount: 1,
        messages: [
            { id: 'm1', senderId: 'u002', text: 'Server staging đang bị lỗi 502 anh ơi.', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), isRead: false },
        ]
    },
    {
        id: 'c3',
        userId: 'u004',
        userName: 'Lê Văn B',
        userAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=100&h=100',
        userStatus: 'offline',
        lastMessage: 'Đã nhận, thanks anh!',
        lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        unreadCount: 0,
        messages: [
            { id: 'm1', senderId: 'admin', text: 'File design banner sự kiện chốt chưa em?', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(), isRead: true },
            { id: 'm2', senderId: 'u004', text: 'Đã nhận, thanks anh!', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), isRead: true },
        ]
    }
];

// --- Helper Functions ---
const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 1000 * 60) return 'Vừa xong';
    if (diff < 1000 * 60 * 60) return `${Math.floor(diff / (1000 * 60))} phút trước`;
    if (diff < 1000 * 60 * 60 * 24) return formatTime(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
};

const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// --- Sub-component: Info Panel (Right Sidebar) ---
const ChatInfoPanel = ({ conversation, onClose, onSearch }: { conversation: Conversation, onClose: () => void, onSearch: (term: string) => void }) => {
    const [activeTab, setActiveTab] = useState<'media' | 'files'>('media');
    const [searchTerm, setSearchTerm] = useState('');
    
    // Get full user profile from Mock Data
    const fullProfile = MOCK_USERS.find(u => u.id === conversation.userId);

    // Extract media and files
    const allAttachments = conversation.messages.flatMap(m => m.attachments || []);
    const images = allAttachments.filter(a => a.type === 'image');
    const files = allAttachments.filter(a => a.type === 'file');

    return (
        <div className="w-80 border-l border-slate-200 bg-white flex flex-col h-full animate-fadeIn">
            {/* Header */}
            <div className="h-16 px-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-bold text-slate-800">Thông tin hội thoại</h3>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"><X size={20}/></button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
                {/* Mini Profile */}
                <div className="text-center">
                    <div className="relative inline-block mb-3">
                        <img src={conversation.userAvatar} alt="" className="w-24 h-24 rounded-full object-cover border-4 border-slate-50 shadow-sm" />
                        <span className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white ${
                            conversation.userStatus === 'online' ? 'bg-green-500' : 
                            conversation.userStatus === 'busy' ? 'bg-red-500' : 'bg-slate-400'
                        }`}></span>
                    </div>
                    <h2 className="text-lg font-bold text-slate-900">{conversation.userName}</h2>
                    <p className="text-sm text-slate-500">{fullProfile?.position || 'Nhân viên'}</p>
                    <p className="text-xs text-brand-600 font-medium">{fullProfile?.department || 'Nexus Corp'}</p>
                
                    <div className="mt-4 flex justify-center gap-4">
                        <button className="flex flex-col items-center gap-1 text-slate-500 hover:text-brand-600 transition-colors">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"><Phone size={16}/></div>
                            <span className="text-[10px]">Gọi điện</span>
                        </button>
                        <button className="flex flex-col items-center gap-1 text-slate-500 hover:text-brand-600 transition-colors">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"><Video size={16}/></div>
                            <span className="text-[10px]">Video</span>
                        </button>
                        <button className="flex flex-col items-center gap-1 text-slate-500 hover:text-brand-600 transition-colors">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"><Mail size={16}/></div>
                            <span className="text-[10px]">Email</span>
                        </button>
                    </div>
                </div>

                <div className="border-t border-slate-100 pt-4">
                    <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-3 text-slate-600">
                            <Mail size={16} className="text-slate-400"/>
                            <span className="truncate">{fullProfile?.email || 'email@nexus.com'}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-600">
                            <Phone size={16} className="text-slate-400"/>
                            <span>{fullProfile?.phone || '09xx xxx xxx'}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-600">
                            <MapPin size={16} className="text-slate-400"/>
                            <span>Tầng 12, Nexus HQ</span>
                        </div>
                    </div>
                </div>

                {/* Search in Chat */}
                <div className="border-t border-slate-100 pt-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tìm trong đoạn chat</h4>
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Nhập từ khóa..." 
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                onSearch(e.target.value);
                            }}
                        />
                        <Search size={16} className="absolute left-3 top-2.5 text-slate-400"/>
                    </div>
                </div>

                {/* Media & Files */}
                <div className="border-t border-slate-100 pt-4">
                    <div className="flex gap-4 mb-3">
                        <button 
                            className={`text-sm font-medium pb-1 border-b-2 transition-colors ${activeTab === 'media' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500'}`}
                            onClick={() => setActiveTab('media')}
                        >
                            Ảnh ({images.length})
                        </button>
                        <button 
                            className={`text-sm font-medium pb-1 border-b-2 transition-colors ${activeTab === 'files' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500'}`}
                            onClick={() => setActiveTab('files')}
                        >
                            Tập tin ({files.length})
                        </button>
                    </div>

                    <div className="min-h-[100px]">
                        {activeTab === 'media' && (
                            <div className="grid grid-cols-3 gap-2">
                                {images.map((img, idx) => (
                                    <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-slate-200 cursor-pointer hover:opacity-90">
                                        <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                                {images.length === 0 && <p className="col-span-3 text-center text-xs text-slate-400 py-4">Chưa có ảnh nào.</p>}
                            </div>
                        )}

                        {activeTab === 'files' && (
                            <div className="space-y-2">
                                {files.map((file, idx) => (
                                    <div key={idx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors cursor-pointer group">
                                        <div className="p-2 bg-blue-50 text-blue-600 rounded">
                                            <FileText size={16}/>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium text-slate-900 truncate">{file.name}</p>
                                            <p className="text-[10px] text-slate-500">{file.size}</p>
                                        </div>
                                        <Download size={14} className="text-slate-400 hover:text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity"/>
                                    </div>
                                ))}
                                {files.length === 0 && <p className="text-center text-xs text-slate-400 py-4">Chưa có tập tin nào.</p>}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Main Component ---
export const ChatManager = () => {
    const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
    const [activeConvId, setActiveConvId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [chatSearchQuery, setChatSearchQuery] = useState('');
    const [messageInput, setMessageInput] = useState('');
    const [showInfoPanel, setShowInfoPanel] = useState(false);
    
    // Refs for real file inputs
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Derived state
    const activeConversation = conversations.find(c => c.id === activeConvId);
    const filteredConversations = conversations.filter(c => 
        c.userName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Filter messages inside active chat
    const displayMessages = activeConversation?.messages.filter(m => {
        if (!chatSearchQuery) return true;
        return m.text?.toLowerCase().includes(chatSearchQuery.toLowerCase()) || 
               m.attachments?.some(a => a.name.toLowerCase().includes(chatSearchQuery.toLowerCase()));
    });

    // Auto scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [activeConversation?.messages, activeConvId]);

    // Handlers
    const handleSelectConversation = (id: string) => {
        setActiveConvId(id);
        setShowInfoPanel(false); // Reset panel on change
        setChatSearchQuery(''); // Reset search
        // Mark as read mock logic
        setConversations(prev => prev.map(c => 
            c.id === id ? { ...c, unreadCount: 0 } : c
        ));
    };

    const handleSendMessage = () => {
        if (!messageInput.trim() || !activeConvId) return;

        const newMessage: Message = {
            id: `new-${Date.now()}`,
            senderId: CURRENT_ADMIN_ID,
            text: messageInput.trim(),
            timestamp: new Date().toISOString(),
            isRead: false
        };

        setConversations(prev => prev.map(c => {
            if (c.id === activeConvId) {
                return {
                    ...c,
                    messages: [...c.messages, newMessage],
                    lastMessage: newMessage.text || 'Sent an attachment',
                    lastUpdated: newMessage.timestamp
                };
            }
            return c;
        }));

        setMessageInput('');
    };

    // Generic file/image change handler
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, type: 'file' | 'image') => {
        const file = event.target.files?.[0];
        if (!file || !activeConvId) return;

        // Create Object URL for preview
        const objectUrl = URL.createObjectURL(file);

        const newMessage: Message = {
            id: `new-${type}-${Date.now()}`,
            senderId: CURRENT_ADMIN_ID,
            timestamp: new Date().toISOString(),
            isRead: false,
            attachments: [{
                type: type,
                name: file.name,
                url: objectUrl, // Use local blob URL
                size: formatFileSize(file.size)
            }]
        };

        const snippet = type === 'image' ? 'Đã gửi một ảnh' : 'Đã gửi một tập tin';
        updateConversationWithMsg(newMessage, snippet);

        // Reset input value so we can select same file again if needed
        event.target.value = '';
    };

    const updateConversationWithMsg = (msg: Message, snippet: string) => {
        setConversations(prev => prev.map(c => {
            if (c.id === activeConvId) {
                return {
                    ...c,
                    messages: [...c.messages, msg],
                    lastMessage: snippet,
                    lastUpdated: msg.timestamp
                };
            }
            return c;
        }));
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="h-[calc(100vh-140px)] bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex animate-fadeIn">
            {/* Hidden Inputs for File/Image Upload */}
            <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                onChange={(e) => handleFileSelect(e, 'file')} 
            />
            <input 
                type="file" 
                ref={imageInputRef} 
                style={{ display: 'none' }} 
                accept="image/*"
                onChange={(e) => handleFileSelect(e, 'image')} 
            />

            {/* Left Sidebar: Conversation List */}
            <div className="w-80 border-r border-slate-200 flex flex-col bg-slate-50 flex-shrink-0">
                {/* Search Header */}
                <div className="p-4 border-b border-slate-200 bg-white">
                    <h2 className="text-lg font-bold text-slate-900 mb-3">Tin nhắn</h2>
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm nhân sự..." 
                            className="w-full bg-slate-100 border-none rounded-lg pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {filteredConversations.map(conv => (
                        <div 
                            key={conv.id}
                            onClick={() => handleSelectConversation(conv.id)}
                            className={`p-4 flex gap-3 cursor-pointer transition-colors hover:bg-slate-100 ${
                                activeConvId === conv.id ? 'bg-white border-l-4 border-l-brand-600 shadow-sm' : 'border-l-4 border-l-transparent'
                            }`}
                        >
                            <div className="relative flex-shrink-0">
                                <img src={conv.userAvatar} alt="" className="w-12 h-12 rounded-full object-cover border border-slate-200" />
                                <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                                    conv.userStatus === 'online' ? 'bg-green-500' : 
                                    conv.userStatus === 'busy' ? 'bg-red-500' : 'bg-slate-400'
                                }`}></span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className={`text-sm font-semibold truncate ${conv.unreadCount > 0 ? 'text-slate-900' : 'text-slate-700'}`}>
                                        {conv.userName}
                                    </h4>
                                    <span className={`text-[10px] ${conv.unreadCount > 0 ? 'text-brand-600 font-bold' : 'text-slate-400'}`}>
                                        {formatRelativeTime(conv.lastUpdated)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className={`text-xs truncate max-w-[140px] ${conv.unreadCount > 0 ? 'text-slate-900 font-medium' : 'text-slate-500'}`}>
                                        {conv.messages[conv.messages.length - 1]?.senderId === CURRENT_ADMIN_ID && 'Bạn: '}
                                        {conv.lastMessage}
                                    </p>
                                    {conv.unreadCount > 0 && (
                                        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 h-4 min-w-[16px] flex items-center justify-center rounded-full">
                                            {conv.unreadCount}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredConversations.length === 0 && (
                        <div className="p-8 text-center text-slate-400 text-sm">
                            Không tìm thấy kết quả nào.
                        </div>
                    )}
                </div>
            </div>

            {/* Right Side: Chat Detail */}
            <div className="flex-1 flex flex-col bg-white min-w-0">
                {activeConversation ? (
                    <>
                        {/* Header */}
                        <div className="h-16 px-6 border-b border-slate-200 flex justify-between items-center bg-white flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <img src={activeConversation.userAvatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                                    <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                                        activeConversation.userStatus === 'online' ? 'bg-green-500' : 
                                        activeConversation.userStatus === 'busy' ? 'bg-red-500' : 'bg-slate-400'
                                    }`}></span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 text-sm">{activeConversation.userName}</h3>
                                    <p className="text-xs text-slate-500">
                                        {activeConversation.userStatus === 'online' ? 'Đang hoạt động' : 
                                         activeConversation.userStatus === 'busy' ? 'Đang bận' : 'Vắng mặt'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2 text-slate-400">
                                <button className="p-2 hover:bg-slate-100 rounded-full transition-colors"><Phone size={20} /></button>
                                <button className="p-2 hover:bg-slate-100 rounded-full transition-colors"><Video size={20} /></button>
                                <div className="w-px h-6 bg-slate-200 mx-1 self-center"></div>
                                <button 
                                    className={`p-2 rounded-full transition-colors ${showInfoPanel ? 'bg-brand-50 text-brand-600' : 'hover:bg-slate-100'}`}
                                    onClick={() => setShowInfoPanel(!showInfoPanel)}
                                >
                                    <Info size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 custom-scrollbar">
                            {displayMessages && displayMessages.length > 0 ? displayMessages.map((msg, idx) => {
                                const isMe = msg.senderId === CURRENT_ADMIN_ID;
                                const showAvatar = !isMe && (idx === 0 || activeConversation.messages[idx - 1]?.senderId !== msg.senderId);

                                return (
                                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group`}>
                                        {!isMe && (
                                            <div className="w-8 flex-shrink-0 mr-2 flex items-end">
                                                {showAvatar ? (
                                                    <img src={activeConversation.userAvatar} className="w-8 h-8 rounded-full" alt="" />
                                                ) : <div className="w-8" />}
                                            </div>
                                        )}
                                        
                                        <div className={`max-w-[70%]`}>
                                            {/* Render Attachments */}
                                            {msg.attachments?.map((att, i) => (
                                                <div key={i} className={`mb-1 overflow-hidden ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                                                    {att.type === 'image' ? (
                                                        <img src={att.url} alt={att.name} className="max-w-full rounded-lg border border-slate-200 shadow-sm max-h-60 object-cover" />
                                                    ) : (
                                                        <div className={`flex items-center gap-3 p-3 rounded-lg border shadow-sm ${isMe ? 'bg-brand-50 border-brand-100' : 'bg-white border-slate-200'}`}>
                                                            <div className="p-2 bg-white rounded-full border border-slate-100 shadow-sm">
                                                                <FileText size={20} className="text-brand-600"/>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-slate-900 truncate max-w-[150px]">{att.name}</p>
                                                                <p className="text-xs text-slate-500">{att.size}</p>
                                                            </div>
                                                            <a href={att.url} download={att.name} className="text-slate-400 hover:text-brand-600"><Download size={16}/></a>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}

                                            {/* Render Text */}
                                            {msg.text && (
                                                <div 
                                                    className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                                                        isMe 
                                                        ? 'bg-brand-600 text-white rounded-br-none' 
                                                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                                                    }`}
                                                >
                                                    {msg.text}
                                                </div>
                                            )}
                                            
                                            <div className={`text-[10px] mt-1 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                {formatTime(msg.timestamp)}
                                                {isMe && (
                                                    msg.isRead ? <CheckCheck size={12} className="text-brand-500"/> : <Check size={12}/>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            }) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                    <p className="text-sm italic">Không tìm thấy tin nhắn phù hợp.</p>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-slate-200 flex-shrink-0">
                            <div className="flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2 focus-within:ring-2 focus-within:ring-brand-500/20 focus-within:border-brand-500 transition-all">
                                <div className="flex gap-1 pb-2 pl-1">
                                    <button 
                                        className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-slate-200 rounded-full transition-colors"
                                        onClick={() => fileInputRef.current?.click()}
                                        title="Gửi tập tin"
                                    >
                                        <Paperclip size={20} />
                                    </button>
                                    <button 
                                        className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-slate-200 rounded-full transition-colors"
                                        onClick={() => imageInputRef.current?.click()}
                                        title="Gửi hình ảnh"
                                    >
                                        <ImageIcon size={20} />
                                    </button>
                                </div>
                                <textarea 
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Nhập tin nhắn... (Enter để gửi)"
                                    className="flex-1 bg-transparent border-none outline-none text-sm py-2.5 max-h-32 min-h-[44px] resize-none custom-scrollbar text-slate-800 placeholder:text-slate-400"
                                    rows={1}
                                />
                                <div className="pb-1 pr-1">
                                    <Button 
                                        className={`rounded-lg h-9 w-9 p-0 flex items-center justify-center transition-all ${
                                            messageInput.trim() ? 'bg-brand-600 hover:bg-brand-700' : 'bg-slate-300 cursor-not-allowed'
                                        }`}
                                        disabled={!messageInput.trim()}
                                        onClick={handleSendMessage}
                                    >
                                        <Send size={18} className="ml-0.5" />
                                    </Button>
                                </div>
                            </div>
                            <div className="text-center mt-2">
                                <p className="text-[10px] text-slate-400">
                                    Nhấn <span className="font-bold">Enter</span> để gửi, <span className="font-bold">Shift + Enter</span> để xuống dòng.
                                </p>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/30">
                        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <Smile size={48} className="text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-600 mb-1">Chưa chọn hội thoại</h3>
                        <p className="text-sm max-w-xs text-center">Chọn một người dùng từ danh sách bên trái để bắt đầu trò chuyện.</p>
                    </div>
                )}
            </div>

            {/* Info Panel (Right Sidebar) */}
            {activeConversation && showInfoPanel && (
                <ChatInfoPanel 
                    conversation={activeConversation} 
                    onClose={() => setShowInfoPanel(false)}
                    onSearch={(term) => setChatSearchQuery(term)}
                />
            )}
        </div>
    );
};
