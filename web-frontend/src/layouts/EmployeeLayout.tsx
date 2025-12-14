import React, { useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  CalendarDays,
  Video,
  MessageSquare,
  Newspaper,
  FileText,
  Zap,
  Bell,
  Settings,
  LogOut,
  Check,
  Menu,
  X,
  User,
  MessageCircle,
} from "lucide-react";

// Import Employee Pages
import {
  EmployeeDashboard,
  EmployeeBookingModule,
  EmployeeNewsModule,
  EmployeeChatManager,
  EmployeeForumModule,
  EmployeeProjectModule,
  EmployeeMeetingModule,
  EmployeeUserProfile,
} from "../pages/employee";

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

  // Get active page from URL
  const getActivePage = () => {
    const path = location.pathname.split("/").pop() || "dashboard";
    return path;
  };

  const activePage = getActivePage();

  const navItems: NavItem[] = [
    {
      id: "dashboard",
      label: "Trang chủ",
      icon: <LayoutDashboard size={18} />,
    },
    { id: "projects", label: "Dự án", icon: <FolderKanban size={18} /> },
    { id: "booking", label: "Đặt phòng", icon: <CalendarDays size={18} /> },
    { id: "meetings", label: "Họp Online", icon: <Video size={18} /> },
    {
      id: "chat",
      label: "Tin nhắn",
      icon: <MessageSquare size={18} />,
      badge: 5,
    },
    { id: "news", label: "Tin tức", icon: <Newspaper size={18} /> },
    { id: "forum", label: "Diễn đàn", icon: <FileText size={18} /> },
  ];

  const notifications = [
    {
      id: 1,
      title: "Dự án mới",
      message: 'Bạn đã được thêm vào dự án "Website Revamp"',
      time: "2 phút trước",
      unread: true,
    },
    {
      id: 2,
      title: "Nhắc nhở cuộc họp",
      message: "Daily Standup sẽ bắt đầu sau 15 phút",
      time: "15 phút trước",
      unread: true,
    },
    {
      id: 3,
      title: "Hoàn thành công việc",
      message: 'Task "Thiết kế Homepage" đã được đánh dấu hoàn thành',
      time: "1 giờ trước",
      unread: false,
    },
  ];

  const handleNavigate = (id: string) => {
    navigate(`/employee/${id}`);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen w-full bg-slate-50/50 text-slate-900 font-sans flex flex-col">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo Section */}
            <div className="flex items-center gap-8">
              <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => handleNavigate("dashboard")}
              >
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-black/5">
                  <Zap size={20} className="text-white fill-white/20" />
                </div>
                <div className="hidden lg:flex flex-col">
                  <span className="text-lg font-bold tracking-tight text-slate-900 leading-none">
                    NEXUS
                  </span>
                  <span className="text-[10px] text-indigo-600 font-bold tracking-widest uppercase">
                    Portal
                  </span>
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
                      ${
                        activePage === item.id
                          ? "bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }
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
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className={`relative p-2 rounded-full transition-colors ${
                    notificationsOpen
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  <Bell size={20} />
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse"></span>
                </button>

                {/* Notification Dropdown */}
                {notificationsOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setNotificationsOpen(false)}
                    ></div>
                    <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50">
                      <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                          Thông báo
                          <span className="bg-rose-100 text-rose-600 text-[10px] px-1.5 py-0.5 rounded-full">
                            {notifications.filter((n) => n.unread).length} mới
                          </span>
                        </h3>
                        <button className="text-xs text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1">
                          <Check size={12} /> Đánh dấu đã đọc
                        </button>
                      </div>
                      <div className="max-h-[350px] overflow-y-auto">
                        {notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className={`px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0 transition-colors ${
                              notif.unread ? "bg-indigo-50/40" : ""
                            }`}
                          >
                            <div className="flex justify-between items-start mb-1 gap-2">
                              <h4
                                className={`text-sm leading-snug ${
                                  notif.unread
                                    ? "font-bold text-slate-800"
                                    : "font-medium text-slate-700"
                                }`}
                              >
                                {notif.title}
                              </h4>
                              <span className="text-[10px] text-slate-400 whitespace-nowrap mt-0.5">
                                {notif.time}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 line-clamp-2">
                              {notif.message}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* User Profile */}
              <div className="relative">
                <div
                  className="flex items-center gap-3 pl-1 cursor-pointer group"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                      {user.name}
                    </p>
                    <p className="text-xs text-slate-500 font-medium uppercase">
                      {user.department}
                    </p>
                  </div>
                  <div className="relative">
                    <img
                      src={
                        user.avatarUrl ||
                        "https://ui-avatars.com/api/?name=" +
                          encodeURIComponent(user.name)
                      }
                      alt="Profile"
                      className="h-10 w-10 rounded-full border-2 border-white object-cover shadow-md group-hover:shadow-lg transition-all group-hover:scale-105"
                    />
                    <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white"></div>
                  </div>
                </div>

                {/* User Menu Dropdown */}
                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    ></div>
                    <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50">
                      <button
                        onClick={() => {
                          handleNavigate("profile");
                          setUserMenuOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <User size={16} /> Hồ sơ cá nhân
                      </button>
                      <button className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                        <Settings size={16} /> Cài đặt
                      </button>
                      <div className="border-t border-slate-100 my-1"></div>
                      <button
                        onClick={onLogout}
                        className="w-full px-4 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2"
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
            <div className="xl:hidden border-t border-slate-200 py-4 bg-white">
              <div className="grid grid-cols-2 gap-2">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.id)}
                    className={`
                      flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all
                      ${
                        activePage === item.id
                          ? "bg-indigo-50 text-indigo-700"
                          : "text-slate-600 hover:bg-slate-50"
                      }
                    `}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1920px] mx-auto p-4 sm:p-6 lg:p-8">
        <Routes>
          <Route path="dashboard" element={<EmployeeDashboard />} />
          <Route path="projects" element={<EmployeeProjectModule />} />
          <Route path="booking" element={<EmployeeBookingModule />} />
          <Route path="meetings" element={<EmployeeMeetingModule />} />
          <Route path="chat" element={<EmployeeChatManager />} />
          <Route path="news" element={<EmployeeNewsModule />} />
          <Route path="forum" element={<EmployeeForumModule />} />
          <Route path="profile" element={<EmployeeUserProfile />} />
          {/* Default redirect */}
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Routes>
      </main>

      {/* Quick Chat Floating Button */}
      <button
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full shadow-lg shadow-indigo-500/40 text-white flex items-center justify-center hover:scale-110 transition-transform duration-300 group"
        onClick={() => {
          /* Navigate to chat */
        }}
      >
        <MessageCircle
          size={28}
          className="group-hover:rotate-12 transition-transform"
        />
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 border-2 border-white rounded-full text-[10px] font-bold flex items-center justify-center">
          3
        </span>
      </button>
    </div>
  );
};

export default EmployeeLayout;
