// Manager pages barrel export - copy từ Admin nhưng loại bỏ các module hệ thống
export { Overview } from "./dashboard/Overview";
export { ResourceManagement } from "./dashboard/ResourceManagement";
export { ProjectModule } from "./projects/ProjectModule";
export { ProjectDetailView } from "./projects/ProjectDetailView";
export { WorkflowDesigner } from "./projects/WorkflowDesigner";
// export { TaskSettings } from "./projects/TaskSettings"; // Admin only - cấu hình hệ thống
export { KanbanBoard } from "./projects/KanbanBoard";
// export { DepartmentManager } from "./organization/DepartmentManager"; // Admin only - quản lý phòng ban
export { OrgChart } from "./organization/OrgChart"; // Manager có thể xem sơ đồ tổ chức
// export { UserManager, UserTableWidget } from "./organization/UserManager"; // Admin only - quản lý nhân sự toàn hệ thống
// export { MeetingAdmin } from "./workspace/MeetingAdmin"; // Admin only - quản trị phòng họp
export { EventManager } from "./workspace/EventManager";
export { BookingModule } from "./booking/BookingModule";
// export { BookingApproval } from "./booking/BookingApproval"; // Admin only - duyệt đặt phòng
// export { FloorManagement } from "./booking/FloorManagement"; // Admin only - quản lý tầng/phòng
export { ForumModule } from "./forum/ForumModule";
// export { ForumManager } from "./forum/ForumManager"; // Admin only - kiểm duyệt diễn đàn
export { NewsModule, NewsManager } from "./news/NewsModule";
export { ChatManager } from "./communication/ChatManager";
// System modules - Admin only
// export { AuditLogManager } from "./system/AuditLogManager";
// export { AlertManager } from "./system/AlertManager";
// export { GeneralSettings } from "./system/GeneralSettings";
