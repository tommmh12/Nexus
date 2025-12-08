import React, { useState } from "react";
import { User, Notification } from "../../../types";
// TODO: Replace with API call
import { Button } from "./system/ui/Button";
import {
  LogOut,
  LayoutDashboard,
  Settings,
  Bell,
  Search,
  Briefcase,
  MessageSquare,
  ShieldAlert,
  ChevronDown,
  ChevronRight,
  Building,
  Menu,
  FolderOpen,
  Users,
  FileText,
  Clock,
  ChevronLeft,
  PanelLeftClose,
  PanelLeftOpen,
  CalendarCheck,
  MessageCircle,
  Headphones,
  BellRing,
} from "lucide-react";

// Import Feature Modules
import { Overview } from "./dashboard/Overview";
import { ResourceManagement } from "./dashboard/ResourceManagement";
import { ProjectModule } from "./projects/ProjectModule";
// import { KanbanBoard } from './projects/KanbanBoard'; // Removed
import { WorkflowDesigner } from "./projects/WorkflowDesigner";
import { TaskSettings } from "./projects/TaskSettings";
import { DepartmentManager } from "./organization/DepartmentManager";
import { OrgChart } from "./organization/OrgChart";
import { UserManager, UserTableWidget } from "./organization/UserManager";
import { MeetingAdmin } from "./workspace/MeetingAdmin";
import { EventManager } from "./workspace/EventManager";
import { ForumModule, ForumManager } from "./forum/ForumModule";
import { NewsModule, NewsManager } from "./news/NewsModule";
import { ChatManager } from "./communication/ChatManager";
import { AuditLogManager } from "./system/AuditLogManager";
import { AlertManager } from "./system/AlertManager";
import { GeneralSettings } from "./system/GeneralSettings";

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

type MenuItem = {
  id: string;
  label: string;
  icon?: React.ElementType;
  badge?: number;
  badgeColor?: string;
  children?: MenuItem[];
};

const MENU_ITEMS: MenuItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    children: [
      { id: "overview", label: "Tổng quan hệ thống" },
      { id: "resources", label: "Tài nguyên & Hiệu suất" },
    ],
  },
  {
    id: "project-management",
    label: "Quản lý Dự án & Việc",
    icon: FolderOpen,
    children: [
      { id: "pm-projects", label: "Dự án (Projects)" },
      // { id: 'pm-board', label: 'Bảng công việc (Kanban)' }, // Removed as requested
      { id: "pm-workflows", label: "Thiết kế Quy trình" },
      { id: "pm-settings", label: "Cấu hình (Loại/Nhãn)" },
    ],
  },
  {
    id: "community",
    label: "Cộng đồng",
    icon: Users,
    children: [
      { id: "news-reader", label: "Bản tin Công ty" },
      {
        id: "forum-reader",
        label: "Diễn đàn Nội bộ",
        badge: 5,
        badgeColor: "bg-red-500",
      },
    ],
  },
  {
    id: "communication",
    label: "Giao tiếp & Hỗ trợ",
    icon: MessageCircle,
    children: [{ id: "chat-manager", label: "Quản trị Giao tiếp", badge: 3 }],
  },
  {
    id: "content-cms",
    label: "Quản trị Nội dung",
    icon: FileText,
    children: [
      { id: "cms-news", label: "Quản lý Bài viết & Tin tức" },
      { id: "cms-forum", label: "Kiểm duyệt Diễn đàn" },
    ],
  },
  {
    id: "organization",
    label: "Quản trị Tổ chức",
    icon: Building,
    children: [
      { id: "org-chart", label: "Sơ đồ tổ chức" },
      { id: "departments", label: "Danh sách Phòng ban" },
      { id: "users", label: "Danh sách Nhân sự" },
    ],
  },
  {
    id: "workspace",
    label: "Tiện ích Văn phòng",
    icon: Briefcase,
    children: [
      { id: "meeting-admin", label: "Quản trị Phòng họp" },
      { id: "event-manager", label: "Quản lý Sự kiện" },
    ],
  },
  {
    id: "moderation",
    label: "An toàn & Báo cáo",
    icon: ShieldAlert,
    children: [
      { id: "audit-logs", label: "Nhật ký hoạt động" },
      { id: "alert-manager", label: "Cấu hình Cảnh báo" },
    ],
  },
  {
    id: "system",
    label: "Hệ thống",
    icon: Settings,
    children: [{ id: "general-settings", label: "Cài đặt chung" }],
  },
];

// Content Management Wrapper Component
const ContentAdminDashboard = ({
  initialTab = "news",
}: {
  initialTab?: "news" | "forum";
}) => {
  const [activeTab, setActiveTab] = useState<"news" | "forum">(initialTab);

  return (
    <div className="h-full flex flex-col">
      <div className="flex border-b border-slate-200 bg-white px-6">
        <button
          onClick={() => setActiveTab("news")}
          className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "news"
              ? "border-brand-600 text-brand-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Quản lý Tin tức
        </button>
        <button
          onClick={() => setActiveTab("forum")}
          className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "forum"
              ? "border-brand-600 text-brand-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Kiểm duyệt Diễn đàn
        </button>
      </div>
      <div className="flex-1 p-6 overflow-y-auto">
        {activeTab === "news" ? <NewsManager /> : <ForumManager />}
      </div>
    </div>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [activeMenu, setActiveMenu] = useState<string>("overview");
  const [expandedMenus, setExpandedMenus] = useState<string[]>([
    "dashboard",
    "community",
    "workspace",
    "communication",
    "moderation",
    "system",
  ]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // New state for collapse
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const toggleMenu = (id: string) => {
    // If sidebar is collapsed and user clicks a parent item, expand sidebar first
    if (isSidebarCollapsed) {
      setIsSidebarCollapsed(false);
      setExpandedMenus((prev) => [...prev, id]);
      return;
    }

    setExpandedMenus((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const getBreadcrumb = () => {
    for (const group of MENU_ITEMS) {
      if (group.id === activeMenu) return group.label;
      if (group.children) {
        const child = group.children.find((c) => c.id === activeMenu);
        if (child) return `${group.label} / ${child.label}`;
      }
    }
    return "Dashboard";
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Content Renderer Switch
  const renderContent = () => {
    switch (activeMenu) {
      case "overview":
        return (
          <>
            <Overview />
            <div className="mt-8">
              <UserTableWidget />
            </div>
          </>
        );
      case "resources":
        return <ResourceManagement />;
      case "pm-projects":
        return <ProjectModule />;
      // case 'pm-board': return <KanbanBoard />; // Removed
      case "pm-workflows":
        return <WorkflowDesigner />;
      case "pm-settings":
        return <TaskSettings />;
      case "departments":
        return <DepartmentManager />;
      case "org-chart":
        return <OrgChart />;
      case "users":
        return <UserManager />;
      case "meeting-admin":
        return <MeetingAdmin />;
      case "event-manager":
        return <EventManager />;

      // Reader Views
      case "forum-reader":
        return <ForumModule />;
      case "news-reader":
        return <NewsModule />;

      // Admin Views
      case "cms-news":
        return <NewsManager />;
      case "cms-forum":
        return <ForumManager />;

      // Chat Module
      case "chat-manager":
        return <ChatManager />;

      // System & Safety
      case "audit-logs":
        return <AuditLogManager />;
      case "alert-manager":
        return <AlertManager />;
      case "general-settings":
        return <GeneralSettings />;

      default:
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-fadeIn">
            <div className="bg-slate-100 p-6 rounded-full mb-4">
              <Briefcase size={48} className="text-slate-300" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">
              Tính năng đang phát triển
            </h2>
            <p className="text-slate-500 mt-2 max-w-md">
              Module{" "}
              <span className="font-medium text-slate-800">
                {getBreadcrumb()}
              </span>{" "}
              đang được xây dựng. Vui lòng quay lại sau.
            </p>
            <Button className="mt-6" onClick={() => setActiveMenu("overview")}>
              Quay về Dashboard
            </Button>
          </div>
        );
    }
  };

  // Determine if we need to remove padding for full-width views (like CMS or Chat)
  const isFullWidthView = ["cms-news", "cms-forum", "chat-manager"].includes(
    activeMenu
  );

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 bg-slate-900 text-slate-300 transition-all duration-300 ease-in-out shadow-xl flex flex-col
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          ${isSidebarCollapsed ? "w-20" : "w-64"} 
          lg:relative lg:translate-x-0
        `}
      >
        {/* Sidebar Header */}
        <div
          className={`h-16 flex items-center ${
            isSidebarCollapsed ? "justify-center px-0" : "px-6"
          } bg-slate-950 border-b border-slate-800 transition-all duration-300`}
        >
          <div className="flex items-center gap-2 font-bold text-xl text-white tracking-tight overflow-hidden whitespace-nowrap">
            <div className="h-8 w-8 min-w-[32px] bg-brand-600 rounded-lg flex items-center justify-center">
              N
            </div>
            {!isSidebarCollapsed && (
              <span className="animate-fadeIn">
                NEXUS{" "}
                <span className="text-slate-500 font-normal text-sm ml-1">
                  ADMIN
                </span>
              </span>
            )}
          </div>
        </div>

        {/* Scrollable Menu Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 custom-scrollbar">
          <div className="mb-6">
            {!isSidebarCollapsed && (
              <p className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 animate-fadeIn">
                Main Menu
              </p>
            )}

            <nav className="space-y-1">
              {MENU_ITEMS.map((item) => (
                <div key={item.id}>
                  <button
                    onClick={() =>
                      item.children
                        ? toggleMenu(item.id)
                        : setActiveMenu(item.id)
                    }
                    className={`
                                w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                                ${
                                  activeMenu === item.id
                                    ? "bg-brand-600 text-white shadow-lg shadow-brand-900/20"
                                    : "hover:bg-slate-800 hover:text-white"
                                }
                                ${isSidebarCollapsed ? "justify-center" : ""}
                            `}
                    title={isSidebarCollapsed ? item.label : undefined}
                  >
                    <div className="flex items-center">
                      {item.icon && (
                        <item.icon
                          size={20}
                          className={`${!isSidebarCollapsed ? "mr-3" : ""} ${
                            activeMenu === item.id
                              ? "text-white"
                              : "text-slate-400"
                          }`}
                        />
                      )}
                      {!isSidebarCollapsed && <span>{item.label}</span>}
                    </div>

                    {!isSidebarCollapsed && (
                      <div className="flex items-center">
                        {item.badge && (
                          <span
                            className={`${
                              item.badgeColor || "bg-brand-500"
                            } text-white text-[10px] px-1.5 py-0.5 rounded-full mr-2`}
                          >
                            {item.badge}
                          </span>
                        )}
                        {item.children &&
                          (expandedMenus.includes(item.id) ? (
                            <ChevronDown size={14} className="text-slate-500" />
                          ) : (
                            <ChevronRight
                              size={14}
                              className="text-slate-500"
                            />
                          ))}
                      </div>
                    )}
                  </button>

                  {/* Submenu - Only show text if not collapsed */}
                  {item.children &&
                    expandedMenus.includes(item.id) &&
                    !isSidebarCollapsed && (
                      <div className="mt-1 ml-4 pl-3 border-l border-slate-700 space-y-1 animate-fadeIn">
                        {item.children.map((child) => (
                          <button
                            key={child.id}
                            onClick={() => setActiveMenu(child.id)}
                            className={`
                                            w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors
                                            ${
                                              activeMenu === child.id
                                                ? "text-brand-400 bg-slate-800/50"
                                                : "text-slate-400 hover:text-white hover:bg-slate-800/30"
                                            }
                                        `}
                          >
                            <span className="truncate">{child.label}</span>
                            {child.badge && (
                              <span
                                className={`${
                                  child.badgeColor || "text-slate-400"
                                } text-xs font-bold`}
                              >
                                {child.badge}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                </div>
              ))}
            </nav>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-4 pb-4 border-t border-slate-800 bg-slate-900">
          {/* Storage Widget - Hide when collapsed */}
          {!isSidebarCollapsed && (
            <div className="mx-4 mb-4 bg-slate-800/50 rounded-lg p-4 animate-fadeIn">
              <p className="text-xs text-slate-400 mb-2">Storage Usage</p>
              <div className="w-full bg-slate-700 rounded-full h-1.5 mb-2">
                <div
                  className="bg-brand-500 h-1.5 rounded-full"
                  style={{ width: "75%" }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-slate-300">
                <span>750GB</span>
                <span>1TB</span>
              </div>
            </div>
          )}

          {/* Collapse Toggle Button */}
          <div
            className={`flex ${
              isSidebarCollapsed ? "justify-center" : "justify-end px-4"
            }`}
          >
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-2 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title={isSidebarCollapsed ? "Mở rộng" : "Thu gọn"}
            >
              {isSidebarCollapsed ? (
                <PanelLeftOpen size={20} />
              ) : (
                <PanelLeftClose size={20} />
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-10">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 mr-4"
            >
              <Menu size={20} />
            </button>
            <div className="hidden sm:flex text-sm font-medium text-slate-500">
              <span className="text-slate-400 mr-2">Hệ thống</span> /{" "}
              <span className="text-slate-800 ml-2">{getBreadcrumb()}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <input
                className="pl-9 pr-4 py-1.5 bg-slate-100 border-none rounded-md text-sm focus:ring-2 focus:ring-brand-500 w-64 transition-all"
                placeholder="Tìm kiếm (Ctrl + K)"
              />
              <Search
                size={16}
                className="absolute left-3 top-2 text-slate-400"
              />
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-2 rounded-full relative transition-colors ${
                  showNotifications
                    ? "bg-blue-50 text-brand-600"
                    : "text-slate-400 hover:text-brand-600 hover:bg-blue-50"
                }`}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowNotifications(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 z-20 overflow-hidden animate-fadeIn">
                    <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <h3 className="font-bold text-slate-900 text-sm">
                        Thông báo
                      </h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllRead}
                          className="text-xs text-brand-600 font-medium hover:underline"
                        >
                          Đánh dấu đã đọc
                        </button>
                      )}
                    </div>
                    <div className="max-h-[350px] overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors ${
                              !notif.isRead ? "bg-blue-50/30" : ""
                            }`}
                          >
                            <div className="flex gap-3">
                              {notif.actorAvatar ? (
                                <img
                                  src={notif.actorAvatar}
                                  className="w-8 h-8 rounded-full border border-slate-100 flex-shrink-0"
                                  alt=""
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                                  <Bell size={14} className="text-slate-500" />
                                </div>
                              )}
                              <div>
                                <p className="text-sm text-slate-800 leading-snug">
                                  {notif.message}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs text-slate-400 flex items-center gap-1">
                                    <Clock size={10} /> {notif.timestamp}
                                  </span>
                                  {!notif.isRead && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-slate-500 text-sm">
                          Không có thông báo nào.
                        </div>
                      )}
                    </div>
                    <div className="p-2 border-t border-slate-100 text-center">
                      <button className="text-xs text-slate-500 hover:text-brand-600 font-medium w-full py-1">
                        Xem tất cả thông báo
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="h-6 w-px bg-slate-200 mx-1"></div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold text-slate-900">
                  {user.name}
                </p>
                <p className="text-xs text-slate-500">System Admin</p>
              </div>
              <div className="relative group">
                <button className="flex items-center gap-2">
                  <img
                    className="h-9 w-9 rounded-full object-cover ring-2 ring-slate-100 group-hover:ring-brand-200 transition-all"
                    src={user.avatarUrl}
                    alt={user.name}
                  />
                  <ChevronDown
                    size={14}
                    className="text-slate-400 group-hover:text-slate-600"
                  />
                </button>
                {/* Dropdown would go here */}
              </div>
              <Button
                variant="ghost"
                onClick={onLogout}
                className="text-red-500 hover:bg-red-50 hover:text-red-600"
              >
                <LogOut size={18} />
              </Button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main
          className={`flex-1 overflow-y-auto bg-slate-50 ${
            isFullWidthView ? "p-0" : "p-4 sm:p-6 lg:p-8"
          }`}
        >
          <div
            className={`mx-auto h-full ${isFullWidthView ? "" : "max-w-7xl"}`}
          >
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};
