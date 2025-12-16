import React, { useState, useEffect, useMemo } from "react";
import {
  Routes,
  Route,
  NavLink,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";
import type { User as UserType, Notification } from "../types";
import { notificationService } from "../services/notificationService";
import { newsService } from "../services/newsService";
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
  UserCircle,
  Key,
  HelpCircle,
  Newspaper,
  User,
} from "lucide-react";

// Stable components for routes to prevent remounting
const OverviewPage = () => (
  <>
    <Overview />
    <div className="mt-8">
      <UserTableWidget />
    </div>
  </>
);

// Import Feature Modules from pages/admin
import { Overview } from "../pages/admin/dashboard/Overview";
import { ResourceManagement } from "../pages/admin/dashboard/ResourceManagement";
import { ProjectModule } from "../pages/admin/projects/ProjectModule";
// import { KanbanBoard } from '../pages/admin/projects/KanbanBoard'; // Removed
import { WorkflowDesigner } from "../pages/admin/projects/WorkflowDesigner";
import { TaskSettings } from "../pages/admin/projects/TaskSettings";
import { DepartmentManager } from "../pages/admin/organization/DepartmentManager";
import { OrgChart } from "../pages/admin/organization/OrgChart";
import {
  UserManager,
  UserTableWidget,
} from "../pages/admin/organization/UserManager";
import { MeetingAdmin } from "../pages/admin/workspace/MeetingAdmin";
import { EventManager } from "../pages/admin/workspace/EventManager";
import { OnlineMeetingModule } from "../pages/admin/workspace/OnlineMeetingModule";
import { BookingModule } from "../pages/admin/booking/BookingModule";
import { BookingApproval } from "../pages/admin/booking/BookingApproval";
import { FloorManagement } from "../pages/admin/booking/FloorManagement";
import { ForumModule } from "../pages/admin/forum/ForumModule";
import { ForumManager } from "../pages/admin/forum/ForumManager";
import { NewsModule, NewsManager } from "../pages/admin/news/NewsModule";
import { ChatManager } from "../pages/admin/communication/ChatManager";
import { AuditLogManager } from "../pages/admin/system/AuditLogManager";
import { AlertManager } from "../pages/admin/system/AlertManager";
import { GeneralSettings } from "../pages/admin/system/GeneralSettings";
import NotificationsPage from "../pages/NotificationsPage";
// Account Pages
import { ProfilePage } from "../pages/admin/account/ProfilePage";
import { ChangePasswordPage } from "../pages/admin/account/ChangePasswordPage";
import { AccountSettingsPage } from "../pages/admin/account/AccountSettingsPage";
// Manager Dashboard Pages
import { DeptOverview } from "../pages/manager/dashboard/DeptOverview";
import { DeptReport } from "../pages/manager/dashboard/DeptReport";
import { MyDepartment } from "../pages/manager/organization/MyDepartment";
// Employee Pages
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

interface DashboardProps {
  user: UserType;
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
      { id: "online-meetings", label: "Phòng họp Online (Jitsi)" },
      { id: "room-booking", label: "Đặt phòng họp" },
      { id: "booking-approval", label: "Duyệt đặt phòng", badge: 0 },
      { id: "floor-management", label: "Quản lý Tầng/Phòng" },
      { id: "meeting-admin", label: "Quản trị Phòng họp (cũ)" },
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

// Function to filter menu items based on user role
const getFilteredMenuItems = (
  role: string,
  hasDeptNewsAccess: boolean = false
): MenuItem[] => {
  // Menu groups that Admin can access but Manager cannot
  const adminOnlyGroups = ["content-cms", "moderation", "system"];

  // Menu items within groups that are admin-only
  const adminOnlyItems: Record<string, string[]> = {
    organization: ["departments", "users"], // Manager chỉ xem sơ đồ tổ chức và phòng ban của mình
    workspace: ["floor-management", "meeting-admin", "booking-approval"], // Manager không quản lý phòng
    "project-management": ["pm-settings"], // Manager không cấu hình hệ thống
    community: hasDeptNewsAccess ? [] : ["news-reader"], // Manager xem bản tin nếu phòng ban được phép
  };

  // Additional menu items for Manager that don't exist in admin menu
  const managerExtraItems: Record<string, MenuItem[]> = {
    organization: [{ id: "my-department", label: "Phòng ban của tôi" }],
  };

  // Manager-specific dashboard items (thay thế dashboard của Admin)
  const managerDashboardItems = [
    { id: "dept-overview", label: "Tổng quan Phòng ban" },
    { id: "dept-report", label: "Xuất báo cáo Phòng ban" },
  ];

  if (role === "admin") {
    return MENU_ITEMS;
  }

  if (role === "manager" || role === "department-manager") {
    return MENU_ITEMS.filter((group) => {
      // Loại bỏ toàn bộ group admin-only
      if (adminOnlyGroups.includes(group.id)) {
        return false;
      }
      return true;
    })
      .map((group) => {
        // Thay thế dashboard items cho Manager
        if (group.id === "dashboard") {
          return {
            ...group,
            children: managerDashboardItems,
          };
        }
        // Lọc các children items trong group và thêm extra items cho Manager
        let filteredChildren = group.children || [];

        // Lọc bỏ admin-only items
        if (adminOnlyItems[group.id] && group.children) {
          filteredChildren = group.children.filter(
            (child) => !adminOnlyItems[group.id].includes(child.id)
          );
        }

        // Thêm extra items cho Manager
        if (managerExtraItems[group.id]) {
          filteredChildren = [
            ...filteredChildren,
            ...managerExtraItems[group.id],
          ];
        }

        return {
          ...group,
          children: filteredChildren,
        };
      })
      .filter((group) => {
        // Loại bỏ group nếu không còn children nào
        return !group.children || group.children.length > 0;
      });
  }

  // Employee role - chỉ xem các chức năng cơ bản
  if (role === "employee") {
    const employeeMenuItems: MenuItem[] = [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        children: [{ id: "emp-dashboard", label: "Trang chủ" }],
      },
      {
        id: "community",
        label: "Cộng đồng",
        icon: Users,
        children: [
          { id: "emp-news", label: "Bản tin Công ty" },
          { id: "emp-forum", label: "Diễn đàn Nội bộ" },
        ],
      },
      {
        id: "communication",
        label: "Giao tiếp",
        icon: MessageCircle,
        children: [{ id: "emp-chat", label: "Tin nhắn" }],
      },
      {
        id: "workspace",
        label: "Công việc",
        icon: Briefcase,
        children: [
          { id: "emp-tasks", label: "Công việc của tôi" },
          { id: "emp-booking", label: "Đặt phòng họp" },
          { id: "emp-meetings", label: "Họp Online" },
        ],
      },
      {
        id: "account",
        label: "Tài khoản",
        icon: User,
        children: [{ id: "emp-profile", label: "Hồ sơ cá nhân" }],
      },
    ];
    return employeeMenuItems;
  }

  return MENU_ITEMS;
};

// Function to check if a route is allowed for a role
const isRouteAllowed = (route: string, role: string): boolean => {
  // Admin có thể truy cập tất cả
  if (role === "admin") return true;

  // Routes chỉ dành cho Admin
  const adminOnlyRoutes = [
    "audit-logs",
    "alert-manager",
    "general-settings",
    "departments",
    "users",
    "floor-management",
    "meeting-admin",
    "booking-approval",
    "pm-settings",
    "news-manager",
    "forum-manager",
    "content-admin",
  ];

  // Routes dành cho Manager và Admin
  const managerAllowedRoutes = [
    "dept-overview",
    "dept-report",
    "overview",
    "resources",
    "pm-projects",
    "pm-workflows",
    "my-department",
    "org-chart",
    "online-meetings",
    "room-booking",
    "event-manager",
    "chat",
    "forum",
    "news",
    "news-reader", // Allow if department has access
    "forum-reader",
    "chat-manager",
    "notifications",
    "profile",
    "change-password",
    "account-settings",
  ];

  // Routes dành cho Employee
  const employeeAllowedRoutes = [
    "emp-dashboard",
    "emp-news",
    "emp-forum",
    "emp-chat",
    "emp-tasks",
    "emp-booking",
    "emp-meetings",
    "emp-profile",
    "notifications",
  ];

  if (role === "manager" || role === "department-manager") {
    // Manager không được truy cập routes admin-only
    if (adminOnlyRoutes.includes(route)) return false;
    return true; // Cho phép các routes còn lại
  }

  if (role === "employee") {
    return employeeAllowedRoutes.includes(route);
  }

  return false;
};

// RoleGuard Component - redirects if route not allowed
const RoleGuard: React.FC<{
  route: string;
  role: string;
  children: React.ReactNode;
}> = ({ route, role, children }) => {
  const navigate = useNavigate();
  const rolePrefix =
    role === "admin"
      ? "/admin"
      : role === "department-manager" || role === "manager"
        ? "/manager"
        : "/employee";

  React.useEffect(() => {
    if (!isRouteAllowed(route, role)) {
      console.log(`🚫 Access denied to ${route} for role ${role}`);
      // Redirect to appropriate default page
      let defaultPage = "overview";
      if (role === "manager" || role === "department-manager") {
        defaultPage = "dept-overview";
      } else if (role === "employee") {
        defaultPage = "emp-dashboard";
      }
      navigate(`${rolePrefix}/${defaultPage}`, { replace: true });
    }
  }, [route, role, navigate, rolePrefix]);

  if (!isRouteAllowed(route, role)) {
    return null; // Don't render while redirecting
  }

  return <>{children}</>;
};

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
          className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${activeTab === "news"
            ? "border-brand-600 text-brand-600"
            : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
        >
          Quản lý Tin tức
        </button>
        <button
          onClick={() => setActiveTab("forum")}
          className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${activeTab === "forum"
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
  const navigate = useNavigate();
  const location = useLocation();
  console.log(
    "📊 Dashboard rendering - pathname:",
    location.pathname,
    "full location:",
    location
  );

  // Current user state - can be updated when localStorage changes
  const [currentUser, setCurrentUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        return {
          ...user,
          name: parsed.full_name || parsed.name || user.name,
          avatarUrl: parsed.avatar_url || user.avatarUrl,
        };
      } catch {
        return user;
      }
    }
    return user;
  });

  // Listen for storage changes (when avatar is updated in ProfilePage)
  useEffect(() => {
    const handleStorageChange = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          setCurrentUser((prev) => ({
            ...prev,
            name: parsed.full_name || parsed.name || prev.name,
            avatarUrl: parsed.avatar_url || prev.avatarUrl,
          }));
        } catch (e) {
          console.error("Error parsing stored user:", e);
        }
      }
    };

    // Listen for storage event from other tabs
    window.addEventListener("storage", handleStorageChange);

    // Also listen for custom event for same-tab updates
    window.addEventListener("userUpdated", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("userUpdated", handleStorageChange);
    };
  }, []);

  // Determine role-based prefix (case-insensitive)
  const userRole = user?.role?.toLowerCase() || "employee";
  const rolePrefix =
    userRole === "admin"
      ? "/admin"
      : userRole === "department-manager" || userRole === "manager"
        ? "/manager"
        : "/employee";

  // State for department news access (for Manager)
  const [hasDeptNewsAccess, setHasDeptNewsAccess] = useState(false);

  // Check if manager's department has news access
  useEffect(() => {
    const checkDeptNewsAccess = async () => {
      if (userRole === "manager" || userRole === "department-manager") {
        try {
          // Get department ID from user object or localStorage
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            const parsed = JSON.parse(storedUser);
            const deptId = parsed.department_id || parsed.departmentId;
            if (deptId) {
              const hasAccess = await newsService.checkDepartmentAccess(deptId);
              setHasDeptNewsAccess(hasAccess);
              console.log("📰 Department news access:", hasAccess);
            }
          }
        } catch (error) {
          console.error("Error checking department news access:", error);
        }
      }
    };

    checkDeptNewsAccess();
  }, [userRole]);

  console.log("👤 User role:", user.role, "rolePrefix:", rolePrefix);

  // Get filtered menu items based on role and department news access
  const filteredMenuItems = React.useMemo(() => {
    return getFilteredMenuItems(userRole, hasDeptNewsAccess);
  }, [userRole, hasDeptNewsAccess]);

  // State
  const [activeMenu, setActiveMenu] = useState<string>("overview");

  // Handle redirect to correct dashboard based on role
  useEffect(() => {
    const currentPath = location.pathname;
    const isBasePath =
      currentPath === rolePrefix || currentPath === `${rolePrefix}/`;
    const isOverviewPath = currentPath === `${rolePrefix}/overview`;

    // Employee và Manager không được vào /overview
    const shouldRedirect =
      isBasePath ||
      (isOverviewPath &&
        (userRole === "manager" ||
          userRole === "department-manager" ||
          userRole === "employee"));

    if (shouldRedirect) {
      // Manager được redirect về dept-overview, Employee về emp-dashboard, Admin về overview
      let defaultPage = "overview";
      if (userRole === "manager" || userRole === "department-manager") {
        defaultPage = "dept-overview";
      } else if (userRole === "employee") {
        defaultPage = "emp-dashboard";
      }
      console.log("🔀 Redirecting to", defaultPage, "userRole:", userRole);
      navigate(defaultPage, { replace: true });
    }
  }, [userRole, rolePrefix, location.pathname, navigate]); // Added location.pathname and navigate

  // Sync activeMenu with URL changes
  React.useEffect(() => {
    console.log("🔄 Dashboard useEffect running");
    const pathParts = location.pathname.split("/").filter(Boolean);
    const section =
      pathParts.length >= 2 ? pathParts[pathParts.length - 1] : "overview";

    // Use functional update to access current value without adding to deps
    setActiveMenu((current) => {
      console.log(
        "setActiveMenu check - current:",
        current,
        "section:",
        section
      );
      if (current !== section) {
        console.log("✏️ Updating activeMenu from", current, "to", section);
        return section;
      }
      console.log("✅ No update needed");
      return current;
    });
  }, [location.pathname]); // Only depend on pathname

  // Route guard - check permission for current route
  React.useEffect(() => {
    const pathParts = location.pathname.split("/").filter(Boolean);
    const currentRoute =
      pathParts.length >= 2 ? pathParts[pathParts.length - 1] : "overview";

    // Skip check for project detail routes (contains UUID)
    const isDetailRoute = pathParts.some((part) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        part
      )
    );
    if (isDetailRoute) return;

    if (!isRouteAllowed(currentRoute, userRole)) {
      console.log(`🚫 Access denied: ${currentRoute} for role ${userRole}`);
      const defaultPage =
        userRole === "manager" || userRole === "department-manager"
          ? "dept-overview"
          : "overview";
      navigate(`${rolePrefix}/${defaultPage}`, { replace: true });
    }
  }, [location.pathname, userRole, rolePrefix, navigate]);

  const [expandedMenus, setExpandedMenus] = useState<string[]>([
    "dashboard",
    "project-management",
    "community",
    "content-cms",
    "organization",
    "workspace",
    "communication",
    "moderation",
    "system",
  ]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // New state for collapse
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false); // NEW: Alert dropdown state
  const [showUserDropdown, setShowUserDropdown] = useState(false); // NEW: User dropdown state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [alertRules, setAlertRules] = useState<any[]>([]); // NEW: Alert rules for current user
  const [unreadAlertCount, setUnreadAlertCount] = useState(0); // NEW: Unread alert count

  // Fetch alert rules for current user
  useEffect(() => {
    const fetchAlertRules = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/alert-rules/my-alerts`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setAlertRules(data.data.rules || []);
            setUnreadAlertCount(
              data.data.rules?.filter((r: any) => r.is_enabled).length || 0
            );
          }
        }
      } catch (error) {
        console.error("Failed to fetch alert rules", error);
      }
    };

    fetchAlertRules();
    const interval = setInterval(fetchAlertRules, 60000); // Poll every 60s
    return () => clearInterval(interval);
  }, []);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await notificationService.getNotifications();
        // data interface might differ slightly, let's map if needed or use as is
        setNotifications(
          data.map((n: any) => ({
            id: n.id,
            userId: n.user_id,
            type: n.type,
            title: n.title,
            message: n.message,
            isRead: n.is_read || n.isRead,
            relatedId: n.related_id,
            createdAt: n.created_at,
            timestamp: new Date(n.created_at).toLocaleString("vi-VN"),
            actorAvatar: null, // or fetch actor info
          }))
        );
      } catch (error) {
        console.error("Failed to fetch notifications", error);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

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

  // Determine if we need to remove padding for full-width views (like CMS or Chat)
  const isFullWidthView = ["cms-news", "cms-forum", "chat-manager"].includes(
    activeMenu
  );

  return (
    <div className="h-screen bg-slate-50 flex font-sans overflow-hidden">
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
          className={`h-16 flex items-center ${isSidebarCollapsed ? "justify-center px-0" : "px-6"
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
              {filteredMenuItems.map((item) => (
                <div key={item.id}>
                  <button
                    onClick={() =>
                      item.children
                        ? toggleMenu(item.id)
                        : navigate(`${rolePrefix}/${item.id}`)
                    }
                    className={`
                                w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                                ${activeMenu === item.id
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
                          className={`${!isSidebarCollapsed ? "mr-3" : ""} ${activeMenu === item.id
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
                            className={`${item.badgeColor || "bg-brand-500"
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
                            onClick={() =>
                              navigate(`${rolePrefix}/${child.id}`)
                            }
                            className={`
                                            w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors
                                            ${activeMenu === child.id
                                ? "text-brand-400 bg-slate-800/50"
                                : "text-slate-400 hover:text-white hover:bg-slate-800/30"
                              }
                                        `}
                          >
                            <span className="truncate">{child.label}</span>
                            {child.badge && (
                              <span
                                className={`${child.badgeColor || "text-slate-400"
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
          {/* Collapse Toggle Button */}
          <div
            className={`flex ${isSidebarCollapsed ? "justify-center" : "justify-end px-4"
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
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8">
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

            {/* Alert Bell - Cảnh báo hệ thống */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowAlerts(!showAlerts);
                  setShowNotifications(false);
                }}
                className={`p-2 rounded-full relative transition-colors ${showAlerts
                  ? "bg-amber-50 text-amber-600"
                  : "text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                  }`}
                title="Cảnh báo hệ thống"
              >
                <ShieldAlert size={20} />
                {unreadAlertCount > 0 && (
                  <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full ring-2 ring-white animate-pulse"></span>
                )}
              </button>

              {/* Alert Dropdown */}
              {showAlerts && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowAlerts(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 z-20 overflow-hidden animate-fadeIn">
                    <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-amber-50">
                      <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <ShieldAlert size={16} className="text-amber-600" />
                        Cảnh báo hệ thống
                      </h3>
                      {unreadAlertCount > 0 && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-600 rounded-full">
                          {unreadAlertCount} mới
                        </span>
                      )}
                    </div>
                    <div className="max-h-[350px] overflow-y-auto">
                      {alertRules.length > 0 ? (
                        alertRules.map((rule) => (
                          <div
                            key={rule.id}
                            className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer ${rule.is_enabled ? "bg-amber-50/50" : ""
                              }`}
                            onClick={() => {
                              setShowAlerts(false);
                              navigate(`${rolePrefix}/alert-manager`);
                            }}
                          >
                            <div className="flex gap-3">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${rule.is_enabled
                                  ? "bg-amber-100"
                                  : "bg-slate-100"
                                  }`}
                              >
                                <ShieldAlert
                                  size={14}
                                  className={
                                    rule.is_enabled
                                      ? "text-amber-600"
                                      : "text-slate-500"
                                  }
                                />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p
                                    className={`text-sm leading-snug ${rule.is_enabled
                                      ? "text-slate-900 font-medium"
                                      : "text-slate-500"
                                      }`}
                                  >
                                    {rule.name}
                                  </p>
                                  <span
                                    className={`px-1.5 py-0.5 text-[10px] rounded ${rule.category === "HR"
                                      ? "bg-blue-100 text-blue-700"
                                      : rule.category === "System"
                                        ? "bg-purple-100 text-purple-700"
                                        : "bg-red-100 text-red-700"
                                      }`}
                                  >
                                    {rule.category}
                                  </span>
                                </div>
                                {rule.description && (
                                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                                    {rule.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-2 mt-1">
                                  <span
                                    className={`text-xs px-1.5 py-0.5 rounded ${rule.is_enabled
                                      ? "bg-green-100 text-green-700"
                                      : "bg-slate-100 text-slate-500"
                                      }`}
                                  >
                                    {rule.is_enabled
                                      ? "🟢 Đang hoạt động"
                                      : "⚫ Tắt"}
                                  </span>
                                  <span className="text-xs text-slate-400">
                                    {rule.threshold}{" "}
                                    {rule.unit === "days"
                                      ? "ngày"
                                      : rule.unit === "percent"
                                        ? "%"
                                        : "lần"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-slate-500 text-sm">
                          <ShieldAlert
                            size={32}
                            className="mx-auto mb-2 text-slate-300"
                          />
                          Không có cảnh báo nào.
                        </div>
                      )}
                    </div>
                    <div className="p-2 border-t border-slate-100 text-center">
                      <button
                        onClick={() => {
                          setShowAlerts(false);
                          navigate(`${rolePrefix}/alert-manager`);
                        }}
                        className="text-xs text-slate-500 hover:text-amber-600 font-medium w-full py-1"
                      >
                        Quản lý cảnh báo
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowAlerts(false);
                }}
                className={`p-2 rounded-full relative transition-colors ${showNotifications
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
                            className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors ${!notif.isRead ? "bg-blue-50/30" : ""
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
                      <button
                        onClick={() => {
                          setShowNotifications(false);
                          navigate(`${rolePrefix}/notifications`);
                        }}
                        className="text-xs text-slate-500 hover:text-brand-600 font-medium w-full py-1"
                      >
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
                  {currentUser.name}
                </p>
                <p className="text-xs text-slate-500">
                  {currentUser.role || "System Admin"}
                </p>
              </div>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 group"
                >
                  <img
                    className={`h-9 w-9 rounded-full object-cover ring-2 transition-all ${showUserDropdown
                      ? "ring-brand-300"
                      : "ring-slate-100 group-hover:ring-brand-200"
                      }`}
                    src={
                      currentUser.avatarUrl ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        currentUser.name
                      )}&background=6366f1&color=fff`
                    }
                    alt={currentUser.name}
                  />
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${showUserDropdown
                      ? "rotate-180 text-brand-600"
                      : "text-slate-400 group-hover:text-slate-600"
                      }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {showUserDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowUserDropdown(false)}
                    ></div>
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 z-20 overflow-hidden animate-fadeIn">
                      {/* User Info Header */}
                      <div className="px-4 py-4 bg-gradient-to-r from-brand-50 to-indigo-50 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <img
                            className="h-12 w-12 rounded-full object-cover ring-2 ring-white shadow"
                            src={
                              currentUser.avatarUrl ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                currentUser.name
                              )}&background=6366f1&color=fff`
                            }
                            alt={currentUser.name}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">
                              {currentUser.name}
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                              {currentUser.email || "admin@nexus.vn"}
                            </p>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-brand-100 text-brand-700 mt-1">
                              {currentUser.role || "Admin"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <button
                          onClick={() => {
                            setShowUserDropdown(false);
                            navigate(`${rolePrefix}/profile`);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <UserCircle size={18} className="text-slate-400" />
                          <span>Xem hồ sơ cá nhân</span>
                        </button>

                        <button
                          onClick={() => {
                            setShowUserDropdown(false);
                            navigate(`${rolePrefix}/account-settings`);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <Settings size={18} className="text-slate-400" />
                          <span>Cài đặt tài khoản</span>
                        </button>

                        <button
                          onClick={() => {
                            setShowUserDropdown(false);
                            navigate(`${rolePrefix}/change-password`);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <Key size={18} className="text-slate-400" />
                          <span>Đổi mật khẩu</span>
                        </button>

                        <div className="border-t border-slate-100 my-2"></div>

                        <button
                          onClick={() => {
                            setShowUserDropdown(false);
                            navigate(`${rolePrefix}/help`);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <HelpCircle size={18} className="text-slate-400" />
                          <span>Trợ giúp & Hỗ trợ</span>
                        </button>
                      </div>

                      {/* Logout Button */}
                      <div className="px-3 py-3 bg-slate-50 border-t border-slate-100">
                        <button
                          onClick={() => {
                            setShowUserDropdown(false);
                            onLogout();
                          }}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <LogOut size={16} />
                          <span>Đăng xuất</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main
          className={`flex-1 overflow-y-auto bg-slate-50 ${isFullWidthView ? "p-0" : "p-4 sm:p-6 lg:p-8"
            }`}
        >
          <div
            className={`mx-auto h-full ${isFullWidthView ? "" : "max-w-7xl"}`}
          >
            <Routes>
              {/* Dashboard Routes - Admin only */}
              <Route
                path="overview"
                element={
                  userRole === "employee" ? (
                    <Navigate to="emp-dashboard" replace />
                  ) : userRole === "manager" ||
                    userRole === "department-manager" ? (
                    <Navigate to="dept-overview" replace />
                  ) : (
                    <OverviewPage />
                  )
                }
              />
              <Route path="resources" element={<ResourceManagement />} />
              {/* Manager Dashboard Routes */}
              <Route path="dept-overview" element={<DeptOverview />} />
              <Route path="dept-report" element={<DeptReport />} />
              {/* Employee Dashboard Routes */}
              <Route path="emp-dashboard" element={<EmployeeDashboard />} />
              <Route path="emp-booking" element={<EmployeeBookingModule />} />
              <Route path="emp-news" element={<EmployeeNewsModule />} />
              <Route path="emp-chat" element={<EmployeeChatManager />} />
              <Route path="emp-forum" element={<EmployeeForumModule />} />
              <Route path="emp-tasks" element={<EmployeeProjectModule />} />
              <Route path="emp-meetings" element={<EmployeeMeetingModule />} />
              <Route path="emp-profile" element={<EmployeeUserProfile />} />

              {/* Project Management Routes */}
              <Route path="pm-projects" element={<ProjectModule />} />
              <Route path="pm-projects/:id" element={<ProjectModule />} />
              <Route path="pm-workflows" element={<WorkflowDesigner />} />
              <Route path="pm-settings" element={<TaskSettings />} />

              {/* Organization Routes */}
              <Route path="departments" element={<DepartmentManager />} />
              <Route path="org-chart" element={<OrgChart />} />
              <Route path="my-department" element={<MyDepartment />} />
              <Route path="users" element={<UserManager />} />

              {/* Workspace Routes */}
              <Route path="online-meetings" element={<OnlineMeetingModule />} />
              <Route path="room-booking" element={<BookingModule />} />
              <Route path="booking-approval" element={<BookingApproval />} />
              <Route path="floor-management" element={<FloorManagement />} />
              <Route path="meeting-admin" element={<MeetingAdmin />} />
              <Route path="meeting-admin/:id" element={<MeetingAdmin />} />
              <Route path="event-manager" element={<EventManager />} />

              {/* Community Routes */}
              <Route path="forum-reader" element={<ForumModule />} />
              <Route path="news-reader" element={<NewsModule />} />

              {/* Content Management Routes */}
              <Route path="cms-news" element={<NewsManager />} />
              <Route path="cms-forum" element={<ForumManager />} />

              {/* Communication Routes */}
              <Route path="chat-manager" element={<ChatManager />} />

              {/* System & Safety Routes */}
              <Route path="audit-logs" element={<AuditLogManager />} />
              <Route path="alert-manager" element={<AlertManager />} />
              <Route path="notifications" element={<NotificationsPage />} />

              {/* Settings Routes */}
              <Route path="general-settings" element={<GeneralSettings />} />

              {/* Account Routes */}
              <Route path="profile" element={<ProfilePage />} />
              <Route path="change-password" element={<ChangePasswordPage />} />
              <Route
                path="account-settings"
                element={<AccountSettingsPage />}
              />
              <Route
                path="help"
                element={
                  <div className="max-w-4xl mx-auto animate-fadeIn">
                    <div className="mb-8">
                      <h1 className="text-2xl font-bold text-slate-900">
                        Trợ giúp & Hỗ trợ
                      </h1>
                      <p className="text-slate-500 mt-1">
                        Tìm câu trả lời cho các thắc mắc thường gặp
                      </p>
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                      <div className="text-center py-12">
                        <div className="w-20 h-20 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <HelpCircle size={40} className="text-brand-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-slate-900 mb-2">
                          Cần hỗ trợ?
                        </h2>
                        <p className="text-slate-500 max-w-md mx-auto mb-6">
                          Liên hệ với đội ngũ IT Support qua email hoặc hotline
                          để được hỗ trợ nhanh nhất.
                        </p>
                        <div className="flex justify-center gap-4">
                          <a
                            href="mailto:support@nexus.vn"
                            className="px-6 py-3 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors"
                          >
                            📧 support@nexus.vn
                          </a>
                          <a
                            href="tel:19001234"
                            className="px-6 py-3 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                          >
                            📞 1900 1234
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                }
              />

              {/* Default/Not Found */}
              <Route
                path="*"
                element={
                  <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-fadeIn">
                    <div className="bg-slate-100 p-6 rounded-full mb-4">
                      <Briefcase size={48} className="text-slate-300" />
                    </div>
                    <h2 className="text-xl font-semibold text-slate-900">
                      Tính năng đang phát triển
                    </h2>
                    <p className="text-slate-500 mt-2 max-w-md">
                      Module đang được xây dựng. Vui lòng quay lại sau.
                    </p>
                    <Button
                      className="mt-6"
                      onClick={() => navigate(`${rolePrefix}/overview`)}
                    >
                      Quay về Dashboard
                    </Button>
                  </div>
                }
              />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};
