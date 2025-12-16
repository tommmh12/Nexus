import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  CalendarDays,
  Video,
  MessageSquare,
  Newspaper,
  FileText,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  ChevronDown,
  Search,
} from 'lucide-react';
import { notificationService } from '../services/notificationService';

// Import Employee Pages
import EmployeeDashboard from '../pages/employee/dashboard/EmployeeDashboard';
import MyTasksPage from '../pages/employee/tasks/MyTasksPage';
import { BookingModule as EmployeeBookingModule } from '../pages/employee/booking/BookingModule';
import EmployeeNewsModule from '../pages/employee/news/NewsModule';
import EmployeeChatManager from '../pages/employee/communication/ChatManager';
import EmployeeForumModule from '../pages/employee/forum/ForumModule';
import EmployeeProjectModule from '../pages/employee/projects/ProjectModule';
import EmployeeMeetingModule from '../pages/employee/workspace/OnlineMeetingModule';
import EmployeeUserProfile from '../pages/employee/account/UserProfile';
import NotificationsPage from '../pages/employee/notifications/NotificationsPage';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

interface EmployeeLayoutProps {
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string;
    department: string;
    role: string;
  };
  onLogout: () => void;
}

const EmployeeLayout: React.FC<EmployeeLayoutProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Get active page from URL
  const getActivePage = () => {
    const path = location.pathname.split('/').pop() || 'dashboard';
    return path;
  };

  const activePage = getActivePage();

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await notificationService.getNotifications();
        setNotifications((data || []).slice(0, 5));
        setUnreadCount((data || []).filter((n: any) => !n.isRead).length);
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };
    fetchNotifications();
  }, []);

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Trang chủ', icon: <LayoutDashboard size={20} /> },
    { id: 'tasks', label: 'Công việc', icon: <CheckSquare size={20} /> },
    { id: 'projects', label: 'Dự án', icon: <FolderKanban size={20} /> },
    { id: 'booking', label: 'Đặt phòng', icon: <CalendarDays size={20} /> },
    { id: 'meetings', label: 'Họp Online', icon: <Video size={20} /> },
    { id: 'chat', label: 'Tin nhắn', icon: <MessageSquare size={20} />, badge: 3 },
    { id: 'news', label: 'Tin tức', icon: <Newspaper size={20} /> },
    { id: 'forum', label: 'Diễn đàn', icon: <FileText size={20} /> },
  ];

  const handleNavigate = (id: string) => {
    navigate(`/employee/${id}`);
    setMobileMenuOpen(false);
  };

  const getTimeAgo = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays === 1) return 'Hôm qua';
    return `${diffDays} ngày trước`;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-slate-200 h-16">
        <div className="h-full px-4 lg:px-6 flex items-center justify-between">
          {/* Left: Logo & Nav */}
          <div className="flex items-center gap-8">
            {/* Logo */}
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => handleNavigate('dashboard')}
            >
              <div className="h-9 w-9 rounded-lg bg-teal-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <span className="hidden lg:block text-lg font-bold text-slate-900">NEXUS</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden xl:flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${activePage === item.id
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Search (Desktop) */}
            <div className="hidden md:block relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="w-64 h-9 pl-9 pr-4 bg-slate-100 border-0 rounded-lg text-sm focus:ring-2 focus:ring-teal-500/20 focus:bg-white transition-all"
              />
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className={`relative p-2 rounded-lg transition-colors ${notificationsOpen ? 'bg-teal-50 text-teal-600' : 'text-slate-500 hover:bg-slate-100'
                  }`}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
                )}
              </button>

              {notificationsOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)} />
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                      <h3 className="font-semibold text-slate-900">Thông báo</h3>
                      {unreadCount > 0 && (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                          {unreadCount} mới
                        </span>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center text-slate-400 text-sm">
                          Không có thông báo
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className={`px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0 ${!notif.isRead ? 'bg-teal-50/50' : ''
                              }`}
                          >
                            <div className="flex justify-between items-start gap-2 mb-1">
                              <h4 className={`text-sm ${!notif.isRead ? 'font-semibold' : 'font-medium'} text-slate-900`}>
                                {notif.title}
                              </h4>
                              <span className="text-[10px] text-slate-400 whitespace-nowrap">
                                {getTimeAgo(notif.createdAt)}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 line-clamp-2">{notif.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="px-4 py-2 border-t border-slate-100">
                      <button
                        onClick={() => {
                          setNotificationsOpen(false);
                          navigate('/employee/notifications');
                        }}
                        className="w-full text-center text-sm text-teal-600 hover:text-teal-700 font-medium py-1"
                      >
                        Xem tất cả
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <img
                  src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff`}
                  alt={user.name}
                  className="h-8 w-8 rounded-full object-cover"
                />
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-slate-900 leading-tight">{user.name}</p>
                  <p className="text-xs text-slate-500">{user.department}</p>
                </div>
                <ChevronDown size={16} className="hidden sm:block text-slate-400" />
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-100 sm:hidden">
                      <p className="font-medium text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.department}</p>
                    </div>
                    <button
                      onClick={() => {
                        handleNavigate('profile');
                        setUserMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <User size={16} /> Hồ sơ cá nhân
                    </button>
                    <button className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                      <Settings size={16} /> Cài đặt
                    </button>
                    <div className="border-t border-slate-100 my-1" />
                    <button
                      onClick={onLogout}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut size={16} /> Đăng xuất
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="xl:hidden absolute top-16 left-0 right-0 bg-white border-b border-slate-200 shadow-lg">
            <div className="p-4 grid grid-cols-2 gap-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activePage === item.id
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-slate-600 hover:bg-slate-50'
                    }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="pt-16 min-h-screen">
        {/* Chat page gets full width, other pages get max-width container */}
        {activePage === 'chat' ? (
          <div className="h-[calc(100vh-64px)]">
            <Routes>
              <Route path="chat" element={<EmployeeChatManager />} />
            </Routes>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Routes>
              <Route path="dashboard" element={<EmployeeDashboard />} />
              <Route path="tasks" element={<MyTasksPage />} />
              <Route path="tasks/:id" element={<MyTasksPage />} />
              <Route path="projects" element={<EmployeeProjectModule />} />
              <Route path="projects/:id" element={<EmployeeProjectModule />} />
              <Route path="booking" element={<EmployeeBookingModule />} />
              <Route path="meetings" element={<EmployeeMeetingModule />} />
              <Route path="news" element={<EmployeeNewsModule />} />
              <Route path="forum" element={<EmployeeForumModule />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="profile" element={<EmployeeUserProfile />} />
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </div>
        )}
      </main>
    </div>
  );
};

export default EmployeeLayout;
