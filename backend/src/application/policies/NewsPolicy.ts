import { Request } from "express";
import { dbPool } from "../../infrastructure/database/connection.js";
import { RowDataPacket } from "mysql2";

/**
 * News Permission Policy
 * 
 * News articles are authored content.
 * Only admin/managers can create/edit/delete.
 */

export interface ArticleInfo {
    articleId: string;
    authorId: string;
    status: string;
}

/**
 * Get article info
 */
export async function getArticleInfo(articleId: string): Promise<ArticleInfo | null> {
    const query = `
    SELECT id as articleId, author_id as authorId, status
    FROM news_articles
    WHERE id = ? AND deleted_at IS NULL
  `;

    const [rows] = await dbPool.query<RowDataPacket[]>(query, [articleId]);
    return rows.length > 0 ? rows[0] as ArticleInfo : null;
}

/**
 * Policy: Can user create news articles?
 * - Admin: YES
 * - Manager: YES
 */
export function canCreate(userRole: string): boolean {
    const role = userRole.toLowerCase();
    return role === "admin" || role === "manager";
}

/**
 * Policy: Can user edit news article?
 * - Admin: YES
 * - Author: YES
 */
export async function canEdit(
    userId: string,
    articleId: string,
    userRole: string
): Promise<boolean> {
    if (userRole.toLowerCase() === "admin") return true;

    const article = await getArticleInfo(articleId);
    return article?.authorId === userId;
}

/**
 * Policy: Can user delete news article?
 * - Admin: YES
 * - Author: YES
 */
export async function canDelete(
    userId: string,
    articleId: string,
    userRole: string
): Promise<boolean> {
    return canEdit(userId, articleId, userRole);
}

/**
 * Policy: Can user manage department access?
 * - Admin: YES only
 */
export function canManageDepartmentAccess(userRole: string): boolean {
    return userRole.toLowerCase() === "admin";
}

/**
 * Middleware factory for news authorization
 */
export function requireNewsPermission(
    permissionCheck: (userId: string, articleId: string, userRole: string) => Promise<boolean>
) {
    return async (req: Request, res: any, next: any) => {
        const userId = req.user?.userId;
        const userRole = req.user?.role || "";
        const articleId = req.params.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized - Authentication required",
            });
        }

        if (!articleId) {
            return res.status(400).json({
                success: false,
                message: "Article ID is required",
            });
        }

        try {
            const hasPermission = await permissionCheck(userId, articleId, userRole);
            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    message: "Forbidden - You don't have permission to access this article",
                });
            }
            next();
        } catch (error) {
            console.error("Error checking news permission:", error);
            return res.status(500).json({
                success: false,
                message: "Error checking permissions",
            });
        }
    };
}

/**
 * Simple role-based middleware for news creation
 */
export function requireNewsCreatePermission(req: Request, res: any, next: any) {
    const userRole = req.user?.role || "";

    if (!canCreate(userRole)) {
        return res.status(403).json({
            success: false,
            message: "Forbidden - Only admin/manager can create news articles",
        });
    }
    next();
}

/**
 * Admin-only middleware for department access management
 */
export function requireDepartmentAccessPermission(req: Request, res: any, next: any) {
    const userRole = req.user?.role || "";

    if (!canManageDepartmentAccess(userRole)) {
        return res.status(403).json({
            success: false,
            message: "Forbidden - Only admin can manage department access",
        });
    }
    next();
}
