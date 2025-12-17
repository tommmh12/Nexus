import { Request } from "express";
import { dbPool } from "../../infrastructure/database/connection.js";
import { RowDataPacket } from "mysql2";
import { getProjectMembership } from "./ProjectPolicy.js";

/**
 * Task Permission Policy
 * 
 * Centralized authorization logic for Task resources.
 * Tasks inherit some permissions from their parent Project.
 */

export interface TaskInfo {
    taskId: string;
    projectId: string;
    creatorId: string | null;
    assigneeIds: string[];
}

/**
 * Get task info including project and assignees
 */
export async function getTaskInfo(taskId: string): Promise<TaskInfo | null> {
    // Get task basic info
    const taskQuery = `
    SELECT 
      t.id as taskId,
      t.project_id as projectId,
      t.created_by as creatorId
    FROM tasks t
    WHERE t.id = ? AND t.deleted_at IS NULL
  `;

    const [taskRows] = await dbPool.query<RowDataPacket[]>(taskQuery, [taskId]);

    if (taskRows.length === 0) {
        return null;
    }

    const task = taskRows[0];

    // Get assignees
    const assigneeQuery = `
    SELECT user_id FROM task_assignees WHERE task_id = ?
  `;
    const [assigneeRows] = await dbPool.query<RowDataPacket[]>(assigneeQuery, [taskId]);

    return {
        taskId: task.taskId,
        projectId: task.projectId,
        creatorId: task.creatorId,
        assigneeIds: assigneeRows.map((r) => r.user_id),
    };
}

/**
 * Check if user is assigned to the task
 */
export function isAssignee(userId: string, taskInfo: TaskInfo): boolean {
    return taskInfo.assigneeIds.includes(userId);
}

/**
 * Policy: Can user view this task?
 * - Admin: YES
 * - Project Member: YES (any task in projects they belong to)
 * - Non-member: NO
 */
export async function canView(
    userId: string,
    taskId: string,
    userRole: string
): Promise<boolean> {
    if (userRole.toLowerCase() === "admin") return true;

    const taskInfo = await getTaskInfo(taskId);
    if (!taskInfo) return false;

    // Check if user is member of the project
    const membership = await getProjectMembership(userId, taskInfo.projectId);
    return membership !== null;
}

/**
 * Policy: Can user edit this task (update details, change status)?
 * - Admin: YES
 * - Project Manager: YES
 * - Task Assignee: YES
 * - Other Project Members: NO
 */
export async function canEdit(
    userId: string,
    taskId: string,
    userRole: string
): Promise<boolean> {
    if (userRole.toLowerCase() === "admin") return true;

    const taskInfo = await getTaskInfo(taskId);
    if (!taskInfo) return false;

    // Check project membership
    const membership = await getProjectMembership(userId, taskInfo.projectId);
    if (!membership) return false;

    // Project manager can edit any task
    if (membership.isManager || membership.role === "Manager") {
        return true;
    }

    // Assignee can edit their task
    return isAssignee(userId, taskInfo);
}

/**
 * Policy: Can user create tasks in this project?
 * - Admin: YES
 * - Project Manager: YES
 * - Others: NO
 */
export async function canCreate(
    userId: string,
    projectId: string,
    userRole: string
): Promise<boolean> {
    if (userRole.toLowerCase() === "admin") return true;

    const membership = await getProjectMembership(userId, projectId);
    if (!membership) return false;

    return membership.isManager || membership.role === "Manager";
}

/**
 * Policy: Can user delete this task?
 * - Admin: YES
 * - Project Manager: YES
 * - Others: NO
 */
export async function canDelete(
    userId: string,
    taskId: string,
    userRole: string
): Promise<boolean> {
    if (userRole.toLowerCase() === "admin") return true;

    const taskInfo = await getTaskInfo(taskId);
    if (!taskInfo) return false;

    const membership = await getProjectMembership(userId, taskInfo.projectId);
    if (!membership) return false;

    return membership.isManager || membership.role === "Manager";
}

/**
 * Policy: Can user assign/unassign people to this task?
 * - Admin: YES
 * - Project Manager: YES
 * - Others: NO
 */
export async function canAssign(
    userId: string,
    taskId: string,
    userRole: string
): Promise<boolean> {
    // Same as canDelete - only managers can assign
    return canDelete(userId, taskId, userRole);
}

/**
 * Express middleware factory for task authorization
 * 
 * Usage:
 * router.put("/:id", requireTaskPermission(canEdit), controller)
 */
export function requireTaskPermission(
    permissionCheck: (userId: string, taskId: string, userRole: string) => Promise<boolean>
) {
    return async (req: Request, res: any, next: any) => {
        const userId = req.user?.userId;
        const userRole = req.user?.role || "";
        const taskId = req.params.id || req.params.taskId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized - Authentication required",
            });
        }

        if (!taskId) {
            return res.status(400).json({
                success: false,
                message: "Task ID is required",
            });
        }

        try {
            const hasPermission = await permissionCheck(userId, taskId, userRole);

            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    message: "Forbidden - You don't have permission to access this task",
                });
            }

            next();
        } catch (error) {
            console.error("Error checking task permission:", error);
            return res.status(500).json({
                success: false,
                message: "Error checking permissions",
            });
        }
    };
}

/**
 * Express middleware for task creation authorization
 * Checks if user can create tasks in the specified project
 * 
 * Usage:
 * router.post("/", requireTaskCreatePermission, controller)
 */
export function requireTaskCreatePermission(req: Request, res: any, next: any) {
    return (async () => {
        const userId = req.user?.userId;
        const userRole = req.user?.role || "";
        const projectId = req.body.projectId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized - Authentication required",
            });
        }

        if (!projectId) {
            return res.status(400).json({
                success: false,
                message: "Project ID is required",
            });
        }

        try {
            const hasPermission = await canCreate(userId, projectId, userRole);

            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    message: "Forbidden - You don't have permission to create tasks in this project",
                });
            }

            next();
        } catch (error) {
            console.error("Error checking task create permission:", error);
            return res.status(500).json({
                success: false,
                message: "Error checking permissions",
            });
        }
    })();
}
