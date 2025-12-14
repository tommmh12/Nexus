
import React, { useState } from 'react';
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
  Menu,
  X,
  Bell,
  Search,
  Zap,
  Settings,
  LogOut,
  Check
} from 'lucide-react';
import { NavItem } from '../types';

interface NavbarProps {
  activePage: string;
  onNavigate: (pageId: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ activePage, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Trang chủ', icon: <LayoutDashboard size={18} /> },
    { id: 'my-tasks', label: 'Công việc', icon: <CheckSquare size={18} /> },
    { id: 'projects', label: 'Dự án', icon: <FolderKanban size={18} /> },
    { id: 'booking', label: 'Đặt phòng', icon: <CalendarDays size={18} /> },
    { id: 'meetings', label: 'Họp Online', icon: <Video size={18} /> },
    { id: 'chat', label: 'Tin nhắn', icon: <MessageSquare size={18} />, badge: 5 },
    { id: 'news', label: 'Tin tức', icon: <Newspaper size={18} /> },
    { id: 'forum', label: 'Diễn đàn', icon: <FileText size={18} /> },
  ];

  const notifications = [
    { id: 1, title: 'Dự án mới', message: 'Bạn đã được thêm vào dự án "Website Revamp"', time: '2 phút trước', unread: true },
    { id: 2, title: 'Nhắc nhở cuộc họp', message: 'Daily Standup sẽ bắt đầu sau 15 phút', time: '15 phút trước', unread: true },
    { id: 3, title: 'Hoàn thành công việc', message: 'Task "Thiết kế Homepage" đã được đánh dấu hoàn thành', time: '1 giờ trước', unread: false },
    { id: 4, title: 'Bình luận mới', message: 'Nguyễn Văn A đã bình luận về bài viết của bạn', time: '2 giờ trước', unread: false },
  ];

  const handleNavigate = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo Section */}
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNavigate('dashboard')}>
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-black/5">
                  <Zap size={20} className="text-white fill-white/20" />
                </div>
                <div className="hidden lg:flex flex-col">
                  <span className="text-lg font-bold tracking-tight text-slate-900 leading-none">NEXUS</span>
                  <span className="text-[10px] text-indigo-600 font-bold tracking-widest uppercase">Portal</span>
                </div>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden xl:flex items-center gap-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.id)}
                    className={`
                      relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                      ${activePage === item.id 
                        ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                    `}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3 sm:gap-5">
              {/* Search Bar (Hidden on mobile) */}
              <div className="hidden md:flex relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                <input 
                  type="text" 
                  placeholder="Tìm kiếm..." 
                  className="h-10 w-64 rounded-full border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 hover:border-slate-300 hover:bg-white"
                />
              </div>

              <div className="h-6 w-px bg-slate-200 hidden md:block"></div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <button 
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className={`relative p-2 rounded-full transition-colors ${notificationsOpen ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-100'}`}
                  >
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse"></span>
                  </button>

                  {/* Notification Dropdown */}
                  {notificationsOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)}></div>
                      <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                        <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-xl">
                            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                              Thông báo
                              <span className="bg-rose-100 text-rose-600 text-[10px] px-1.5 py-0.5 rounded-full">{notifications.filter(n => n.unread).length} mới</span>
                            </h3>
                            <button className="text-xs text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1">
                              <Check size={12} /> Đánh dấu đã đọc
                            </button>
                        </div>
                        <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                            {notifications.map(notif => (
                                <div key={notif.id} className={`px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0 transition-colors ${notif.unread ? 'bg-indigo-50/40' : ''}`}>
                                    <div className="flex justify-between items-start mb-1 gap-2">
                                        <h4 className={`text-sm leading-snug ${notif.unread ? 'font-bold text-slate-800' : 'font-medium text-slate-700'}`}>{notif.title}</h4>
                                        <span className="text-[10px] text-slate-400 whitespace-nowrap mt-0.5">{notif.time}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 line-clamp-2">{notif.message}</p>
                                    {notif.unread && (
                                      <div className="mt-2 flex gap-2">
                                         <button className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded transition-colors">Xem chi tiết</button>
                                      </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="px-4 py-3 border-t border-slate-100 text-center bg-slate-50/50 rounded-b-xl">
                             <button className="text-xs text-slate-500 hover:text-indigo-600 font-medium transition-colors">Xem tất cả thông báo</button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="relative group ml-1">
                  <button className="flex items-center gap-3 p-1 pl-2 pr-1 rounded-full hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all" onClick={() => handleNavigate('profile')}>
                    <div className="text-right hidden md:block">
                      <p className="text-sm font-bold text-slate-800 leading-none">Admin User</p>
                      <p className="text-[10px] text-slate-500 font-medium uppercase mt-0.5">Engineering</p>
                    </div>
                    <img 
                      src="https://picsum.photos/100/100" 
                      alt="Profile" 
                      className="h-9 w-9 rounded-full border-2 border-white object-cover shadow-sm ring-1 ring-slate-200 group-hover:scale-105 transition-transform"
                    />
                  </button>
                </div>
              </div>

              {/* Mobile Menu Button */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="xl:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden fixed inset-0 z-30 bg-slate-900/20 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}>
          <div 
            className="absolute top-16 left-0 w-full bg-white border-b border-slate-200 shadow-xl p-4 animate-in slide-in-from-top-5 duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="grid grid-cols-2 gap-3 mb-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all
                    ${activePage === item.id 
                      ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200' 
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}
                  `}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
            <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
               <button className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600">
                  <Settings size={18} /> Cài đặt
               </button>
               <button className="flex items-center gap-2 text-sm font-medium text-rose-500 hover:text-rose-600">
                  <LogOut size={18} /> Đăng xuất
               </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
