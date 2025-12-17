// Project Module Shared Types
// These types are used by both Admin and Employee project views

import { TaskDetail } from '../services/taskService';
import { ProjectReport } from '../services/reportService';
import { Department } from '../services/departmentService';

// ==================== PROJECT TYPES ====================

export interface ProjectMember {
    id: string; // project_member id
    user_id: string;
    role: string;
    joined_at: string;
    userName: string;
    email: string;
    avatar_url?: string;
    departmentName?: string;
}

export interface ProjectData {
    id: string;
    code: string;
    name: string;
    description?: string;
    managerName?: string;
    manager_id?: string;
    workflow_id?: string;
    workflowName?: string;
    workflowStatuses?: {
        id: string;
        name: string;
        color?: string;
        order: number;
    }[];
    status: string;
    priority: string;
    progress: number;
    taskCount?: number;
    completedTaskCount?: number;
    startDate?: string;
    endDate?: string;
    budget?: number;
    members?: ProjectMember[];
}

// ==================== CAPABILITY TYPES ====================

export interface ProjectCapabilities {
    // Project Management
    canEditProject: boolean;
    canDeleteProject: boolean;

    // Task Management
    canViewAllTasks: boolean;
    canViewMyTasks: boolean;
    canCreateTask: boolean;
    canUpdateTaskStatus: boolean;
    canDeleteTask: boolean;
    canDragTasks: boolean;

    // Board
    canViewBoard: boolean;

    // Documents
    canViewDocuments: boolean;
    canUploadDocuments: boolean;
    canDeleteDocuments: boolean;

    // Reports
    canViewReports: boolean;
    canSubmitReport: boolean;
    canReviewReports: boolean;

    // Members
    canViewMembers: boolean;
    canAddMembers: boolean;
    canRemoveMembers: boolean;
}

// Factory function to create capabilities based on role
export function createCapabilities(
    role: 'Admin' | 'Manager' | 'Employee',
    options?: {
        isProjectOwner?: boolean;
        isProjectMember?: boolean;
    }
): ProjectCapabilities {
    const { isProjectOwner = false, isProjectMember = false } = options || {};

    const isAdminOrManager = role === 'Admin' || role === 'Manager';
    const hasFullAccess = role === 'Admin' || isProjectOwner;

    return {
        // Project Management
        canEditProject: hasFullAccess,
        canDeleteProject: role === 'Admin',

        // Task Management
        canViewAllTasks: isAdminOrManager,
        canViewMyTasks: true, // Everyone can see their own tasks
        canCreateTask: isAdminOrManager,
        canUpdateTaskStatus: true, // Assignees can update status
        canDeleteTask: isAdminOrManager,
        canDragTasks: isAdminOrManager,

        // Board
        canViewBoard: true, // Everyone can view (read-only for employees)

        // Documents
        canViewDocuments: true,
        canUploadDocuments: true, // Everyone in project can upload
        canDeleteDocuments: isAdminOrManager,

        // Reports
        canViewReports: true,
        canSubmitReport: true, // Everyone can submit reports
        canReviewReports: isAdminOrManager,

        // Members
        canViewMembers: true,
        canAddMembers: hasFullAccess,
        canRemoveMembers: hasFullAccess,
    };
}

// ==================== TAB TYPES ====================

export type ProjectTab =
    | 'overview'
    | 'my-work'
    | 'tasks'
    | 'board'
    | 'documents'
    | 'reports'
    | 'members';

// Get available tabs based on capabilities
export function getAvailableTabs(capabilities: ProjectCapabilities): ProjectTab[] {
    const tabs: ProjectTab[] = ['overview'];

    // My Work tab is always available (shows user's own tasks)
    tabs.push('my-work');

    // All Tasks tab only for Admin/Manager
    if (capabilities.canViewAllTasks) {
        tabs.push('tasks');
    }

    // Board is available if can view
    if (capabilities.canViewBoard) {
        tabs.push('board');
    }

    // Documents always available
    if (capabilities.canViewDocuments) {
        tabs.push('documents');
    }

    // Reports always available
    if (capabilities.canViewReports) {
        tabs.push('reports');
    }

    // Members always available
    if (capabilities.canViewMembers) {
        tabs.push('members');
    }

    return tabs;
}

// ==================== VIEW STATE TYPES ====================

export interface ProjectDetailState {
    project: ProjectData | null;
    tasks: TaskDetail[];
    myTasks: TaskDetail[]; // Filtered for current user
    reports: ProjectReport[];
    members: ProjectMember[];
    departments: Department[];
    loading: boolean;
    error: string | null;
}

// ==================== PROPS TYPES ====================

export interface UnifiedProjectDetailViewProps {
    projectId: string;
    capabilities: ProjectCapabilities;
    currentUserId: string;
    onBack: () => void;
}
