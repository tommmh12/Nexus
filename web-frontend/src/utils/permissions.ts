// Permission utilities for role-based access control

export type UserRole = "admin" | "department-manager" | "employee";

export interface Permission {
  // Projects
  canCreateProject: boolean;
  canEditProject: boolean;
  canDeleteProject: boolean;
  canViewAllProjects: boolean;
  canManageProjectDepartments: boolean;

  // Departments
  canCreateDepartment: boolean;
  canEditDepartment: boolean;
  canDeleteDepartment: boolean;
  canViewAllDepartments: boolean;

  // Users
  canCreateUser: boolean;
  canEditUser: boolean;
  canDeleteUser: boolean;
  canViewAllUsers: boolean;

  // Tasks
  canCreateTask: boolean;
  canEditAnyTask: boolean;
  canDeleteAnyTask: boolean;
  canAssignTasks: boolean;

  // Workflows
  canCreateWorkflow: boolean;
  canEditWorkflow: boolean;
  canDeleteWorkflow: boolean;

  // System
  canAccessSystemSettings: boolean;
  canViewAuditLogs: boolean;
  canManageAlerts: boolean;

  // Communication
  canModerateChat: boolean;
  canModerateForum: boolean;

  // News & Content
  canCreateNews: boolean;
  canEditAnyNews: boolean;
  canDeleteAnyNews: boolean;

  // Workspace
  canManageMeetingRooms: boolean;
  canManageEvents: boolean;
}

/**
 * Get permissions based on user role
 */
export const getPermissions = (role: UserRole): Permission => {
  switch (role) {
    case "admin":
      return {
        // Projects - Full access
        canCreateProject: true,
        canEditProject: true,
        canDeleteProject: true,
        canViewAllProjects: true,
        canManageProjectDepartments: true,

        // Departments - Full access
        canCreateDepartment: true,
        canEditDepartment: true,
        canDeleteDepartment: true,
        canViewAllDepartments: true,

        // Users - Full access
        canCreateUser: true,
        canEditUser: true,
        canDeleteUser: true,
        canViewAllUsers: true,

        // Tasks - Full access
        canCreateTask: true,
        canEditAnyTask: true,
        canDeleteAnyTask: true,
        canAssignTasks: true,

        // Workflows - Full access
        canCreateWorkflow: true,
        canEditWorkflow: true,
        canDeleteWorkflow: true,

        // System - Full access
        canAccessSystemSettings: true,
        canViewAuditLogs: true,
        canManageAlerts: true,

        // Communication - Full access
        canModerateChat: true,
        canModerateForum: true,

        // News & Content - Full access
        canCreateNews: true,
        canEditAnyNews: true,
        canDeleteAnyNews: true,

        // Workspace - Full access
        canManageMeetingRooms: true,
        canManageEvents: true,
      };

    case "department-manager":
      return {
        // Projects - Can manage department projects
        canCreateProject: true,
        canEditProject: true,
        canDeleteProject: false, // Only admin can delete
        canViewAllProjects: false, // Only see department projects
        canManageProjectDepartments: true,

        // Departments - Can only view and edit own department
        canCreateDepartment: false,
        canEditDepartment: true, // Only own department
        canDeleteDepartment: false,
        canViewAllDepartments: true,

        // Users - Can manage department users
        canCreateUser: true, // In own department
        canEditUser: true, // In own department
        canDeleteUser: false,
        canViewAllUsers: true,

        // Tasks - Can manage department tasks
        canCreateTask: true,
        canEditAnyTask: true, // In own department
        canDeleteAnyTask: false,
        canAssignTasks: true, // In own department

        // Workflows - Limited access
        canCreateWorkflow: false,
        canEditWorkflow: false,
        canDeleteWorkflow: false,

        // System - No access
        canAccessSystemSettings: false,
        canViewAuditLogs: false,
        canManageAlerts: false,

        // Communication - Can moderate department chat
        canModerateChat: true, // In own department
        canModerateForum: false,

        // News & Content - Can create but not delete
        canCreateNews: true,
        canEditAnyNews: false, // Only own news
        canDeleteAnyNews: false,

        // Workspace - Limited access
        canManageMeetingRooms: true,
        canManageEvents: true, // Department events
      };

    case "employee":
      return {
        // Projects - Read-only
        canCreateProject: false,
        canEditProject: false,
        canDeleteProject: false,
        canViewAllProjects: false, // Only assigned projects
        canManageProjectDepartments: false,

        // Departments - Read-only
        canCreateDepartment: false,
        canEditDepartment: false,
        canDeleteDepartment: false,
        canViewAllDepartments: true,

        // Users - Read-only
        canCreateUser: false,
        canEditUser: false,
        canDeleteUser: false,
        canViewAllUsers: true,

        // Tasks - Can manage own tasks
        canCreateTask: false,
        canEditAnyTask: false,
        canDeleteAnyTask: false,
        canAssignTasks: false,

        // Workflows - Read-only
        canCreateWorkflow: false,
        canEditWorkflow: false,
        canDeleteWorkflow: false,

        // System - No access
        canAccessSystemSettings: false,
        canViewAuditLogs: false,
        canManageAlerts: false,

        // Communication - Basic access
        canModerateChat: false,
        canModerateForum: false,

        // News & Content - Read-only
        canCreateNews: false,
        canEditAnyNews: false,
        canDeleteAnyNews: false,

        // Workspace - Can view and book
        canManageMeetingRooms: false,
        canManageEvents: false,
      };

    default:
      // Default to employee permissions
      return getPermissions("employee");
  }
};

/**
 * Check if user has specific permission
 */
export const hasPermission = (
  role: UserRole,
  permission: keyof Permission
): boolean => {
  const permissions = getPermissions(role);
  return permissions[permission];
};

/**
 * Get role display name in Vietnamese
 */
export const getRoleDisplayName = (role: UserRole): string => {
  switch (role) {
    case "admin":
      return "Quản trị viên";
    case "department-manager":
      return "Quản lý phòng ban";
    case "employee":
      return "Nhân viên";
    default:
      return "Không xác định";
  }
};
