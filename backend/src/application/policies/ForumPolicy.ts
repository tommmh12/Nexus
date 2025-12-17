import { Request } from "express";
import { dbPool } from "../../infrastructure/database/connection.js";
import { RowDataPacket } from "mysql2";

/**
 * Forum Permission Policy
 * 
 * Forum posts are owned by their creators.
 * Category management is admin-only.
 * Moderation is admin/manager.
 */

export interface PostInfo {
    postId: string;
    authorId: string;
    status: string;
}

/**
 * Get post info
 */
export async function getPostInfo(postId: string): Promise<PostInfo | null> {
    const query = `
    SELECT id as postId, author_id as authorId, status
    FROM forum_posts
    WHERE id = ? AND deleted_at IS NULL
  `;

    const [rows] = await dbPool.query<RowDataPacket[]>(query, [postId]);
    return rows.length > 0 ? rows[0] as PostInfo : null;
}

/**
 * Policy: Can user edit post?
 * - Admin: YES
 * - Author: YES
 */
export async function canEdit(
    userId: string,
    postId: string,
    userRole: string
): Promise<boolean> {
    if (userRole.toLowerCase() === "admin") return true;

    const post = await getPostInfo(postId);
    return post?.authorId === userId;
}

/**
 * Policy: Can user delete post?
 * - Admin: YES
 * - Manager: YES (moderation)
 * - Author: YES
 */
export async function canDelete(
    userId: string,
    postId: string,
    userRole: string
): Promise<boolean> {
    const role = userRole.toLowerCase();
    if (role === "admin" || role === "manager") return true;

    const post = await getPostInfo(postId);
    return post?.authorId === userId;
}

/**
 * Policy: Can user moderate (hide/unhide) posts?
 * - Admin: YES
 * - Manager: YES
 */
export async function canModerate(
    _userId: string,
    _postId: string,
    userRole: string
): Promise<boolean> {
    const role = userRole.toLowerCase();
    return role === "admin" || role === "manager";
}

/**
 * Middleware factory for forum post authorization
 */
export function requireForumPermission(
    permissionCheck: (userId: string, postId: string, userRole: string) => Promise<boolean>
) {
    return async (req: Request, res: any, next: any) => {
        const userId = req.user?.userId;
        const userRole = req.user?.role || "";
        const postId = req.params.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized - Authentication required",
            });
        }

        if (!postId) {
            return res.status(400).json({
                success: false,
                message: "Post ID is required",
            });
        }

        try {
            const hasPermission = await permissionCheck(userId, postId, userRole);
            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    message: "Forbidden - You don't have permission to access this post",
                });
            }
            next();
        } catch (error) {
            console.error("Error checking forum permission:", error);
            return res.status(500).json({
                success: false,
                message: "Error checking permissions",
            });
        }
    };
}
