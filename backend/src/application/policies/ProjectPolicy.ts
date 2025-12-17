import { Request } from "express";
import { dbPool } from "../../infrastructure/database/connection.js";
import { RowDataPacket } from "mysql2";

/**
 * Project Permission Policy
 * 
 * Centralized authorization logic for Project resources.
 * All permission checks should go through this policy.
 */

export type ProjectRole = "Manager" | "Member";

export interface ProjectMembership {
    userId: string;
    projectId: string;
    role: ProjectRole;
    isManager: boolean; // true if user is project's manager_id
}

/**
 * Get user's membership info for a project
 */
export async function getProjectMembership(
    userId: string,
    projectId: string
): Promise<ProjectMembership | null> {
    const query = `
    SELECT 
      pm.user_id,
      pm.project_id,
      pm.role,
      (p.manager_id = ?) as isManager
    FROM projects p
    LEFT JOIN project_members pm ON p.id = pm.project_id AND pm.user_id = ?
    WHERE p.id = ? AND p.deleted_at IS NULL
  `;

    const [rows] = await dbPool.query<RowDataPacket[]>(query, [
        userId,
        userId,
        projectId,
    ]);

    if (rows.length === 0) {
        return null; // Project doesn't exist
    }

    const row = rows[0];

    // User is either a member or the manager
    if (!row.user_id && !row.isManager) {
        return null; // User has no access
    }

    return {
        userId,
        projectId,
        role: row.role || "Member",
        isManager: !!row.isManager,
    };
}

/**
 * Check if user is system admin
 */
export function isSystemAdmin(req: Request): boolean {
    const role = req.user?.role?.toLowerCase();
    return role === "admin";
}

/**
 * Policy: Can user view this project?
 * - Admin: YES
 * - Project Manager: YES
 * - Project Member: YES
 * - Non-member: NO
 */
export async function canView(
    userId: string,
    projectId: string,
    userRole: string
): Promise<boolean> {
    if (userRole.toLowerCase() === "admin") return true;

    const membership = await getProjectMembership(userId, projectId);
    return membership !== null;
}

/**
 * Policy: Can user edit this project (update details)?
 * - Admin: YES
 * - Project Manager: YES
 * - Project Member: NO
 */
export async function canEdit(
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
 * Policy: Can user delete this project?
 * - Admin: YES
 * - Project Manager: YES
 * - Others: NO
 */
export async function canDelete(
    userId: string,
    projectId: string,
    userRole: string
): Promise<boolean> {
    // Same as canEdit for now
    return canEdit(userId, projectId, userRole);
}

/**
 * Policy: Can user manage project members (add/remove)?
 * - Admin: YES
 * - Project Manager: YES
 * - Others: NO
 */
export async function canManageMembers(
    userId: string,
    projectId: string,
    userRole: string
): Promise<boolean> {
    // Same as canEdit for now
    return canEdit(userId, projectId, userRole);
}

/**
 * Express middleware factory for project authorization
 * 
 * Usage:
 * router.put("/:id", requireProjectPermission(canEdit), controller)
 */
export function requireProjectPermission(
    permissionCheck: (userId: string, projectId: string, userRole: string) => Promise<boolean>
) {
    return async (req: Request, res: any, next: any) => {
        const userId = req.user?.userId;
        const userRole = req.user?.role || "";
        const projectId = req.params.id;

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
            const hasPermission = await permissionCheck(userId, projectId, userRole);

            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    message: "Forbidden - You don't have permission to access this project",
                });
            }

            next();
        } catch (error) {
            console.error("Error checking project permission:", error);
            return res.status(500).json({
                success: false,
                message: "Error checking permissions",
            });
        }
    };
}
