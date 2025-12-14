
import React from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  FolderKanban, 
  CalendarDays, 
  Video, 
  MessageSquare, 
  Newspaper, 
  FileText, 
  UserCircle,
  LogOut,
  Zap
} from 'lucide-react';
import { NavItem } from '../types';

interface SidebarProps {
  activePage: string;
  onNavigate: (pageId: string) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate, isOpen, onCloseMobile }) => {
  
  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Trang chủ', icon: <LayoutDashboard size={20} /> },
    
    { id: 'my-tasks', label: 'Công việc của tôi', icon: <CheckSquare size={20} />, category: 'Productivity', badge: 3 },
    { id: 'projects', label: 'Dự án tham gia', icon: <FolderKanban size={20} />, category: 'Productivity' },
    
    { id: 'booking', label: 'Đặt phòng họp', icon: <CalendarDays size={20} />, category: 'Workspace' },
    { id: 'meetings', label: 'Họp trực tuyến', icon: <Video size={20} />, category: 'Workspace' },
    
    { id: 'news', label: 'Tin tức & Sự kiện', icon: <Newspaper size={20} />, category: 'Community' },
    { id: 'forum', label: 'Diễn đàn nội bộ', icon: <FileText size={20} />, category: 'Community' },
    { id: 'chat', label: 'Tin nhắn', icon: <MessageSquare size={20} />, category: 'Community', badge: 5 },

    { id: 'profile', label: 'Hồ sơ cá nhân', icon: <UserCircle size={20} />, category: 'Personal' },
  ];

  const groupedItems = navItems.reduce((acc, item) => {
    const category = item.category || 'Main';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, NavItem[]>);

  const categories = ['Main', 'Productivity', 'Workspace', 'Community', 'Personal'];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      <aside 
        className={`
          fixed left-0 top-0 z-50 h-screen text-slate-300 transition-all duration-500 ease-in-out border-r border-slate-700/50 flex flex-col glass-dark shadow-2xl
          ${isOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0 lg:w-24'}
        `}
      >
        {/* Logo Area - Fixed alignment */}
        <div className={`relative flex h-24 items-center shrink-0 transition-all duration-300 ${isOpen ? 'justify-start px-8' : 'justify-center px-6'}`}>
          <div className={`flex items-center gap-3 font-bold text-white transition-all duration-300 ${!isOpen && 'lg:scale-90'}`}>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 ring-1 ring-white/20">
              <Zap size={22} className="text-white fill-white/20" />
            </div>
            <div className={`flex flex-col ${isOpen ? 'opacity-100' : 'hidden lg:hidden'}`}>
                <span className="text-xl tracking-tight leading-none bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">NEXUS</span>
                <span className="text-[10px] text-indigo-300 font-medium tracking-widest uppercase">Employee Portal</span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-2 px-4 custom-scrollbar">
          {categories.map((cat) => {
            if (!groupedItems[cat]) return null;
            return (
              <div key={cat} className="mb-8">
                {isOpen && cat !== 'Main' && (
                  <h3 className="mb-3 px-4 text-[11px] font-bold uppercase tracking-widest text-slate-500 transition-opacity font-sans">
                    {cat}
                  </h3>
                )}
                <div className="space-y-1.5">
                  {groupedItems[cat].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        onNavigate(item.id);
                        if (window.innerWidth < 1024) onCloseMobile();
                      }}
                      className={`
                        group relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 overflow-hidden
                        ${activePage === item.id 
                          ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-900/40 ring-1 ring-white/10' 
                          : 'hover:bg-slate-800/50 hover:text-white text-slate-400'}
                        ${!isOpen && 'lg:justify-center lg:px-2'}
                      `}
                      title={!isOpen ? item.label : undefined}
                    >
                      {/* Active Indicator Glow */}
                      {activePage === item.id && (
                          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-20" />
                      )}

                      <span className={`relative z-10 transition-transform duration-300 ${activePage === item.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                        {item.icon}
                      </span>
                      
                      <span className={`relative z-10 flex-1 text-left whitespace-nowrap transition-all duration-300 ${!isOpen ? 'lg:hidden' : ''}`}>
                        {item.label}
                      </span>
                      
                      {item.badge && (isOpen || (!isOpen && window.innerWidth < 1024)) && (
                        <span className={`relative z-10 rounded-full px-2 py-0.5 text-[10px] font-bold border ${activePage === item.id ? 'bg-white text-indigo-600 border-white' : 'bg-rose-500 text-white border-rose-600'}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* User Mini Profile / Footer */}
        <div className="p-4 border-t border-slate-700/50 bg-slate-900/30">
           <button className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all border border-transparent hover:border-rose-500/20 ${!isOpen && 'lg:justify-center'}`}>
              <LogOut size={20} />
              <span className={`flex-1 text-left whitespace-nowrap ${!isOpen ? 'lg:hidden' : ''}`}>Đăng xuất</span>
           </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
