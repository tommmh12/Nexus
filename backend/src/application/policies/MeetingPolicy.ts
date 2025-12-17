import { Request } from "express";
import { dbPool } from "../../infrastructure/database/connection.js";
import { RowDataPacket } from "mysql2";
import { createModuleLogger } from "../../infrastructure/logger.js";

const logger = createModuleLogger('MeetingPolicy');

/**
 * Meeting Permission Policy
 * 
 * Meetings have a creator (organizer) who has full control.
 * Participants can join but not modify.
 * Public meetings can be viewed/joined by anyone.
 */

// Table names as constants to prevent typos
const TABLES = {
    MEETINGS: 'online_meetings',
    PARTICIPANTS: 'online_meeting_participants',
} as const;

export interface MeetingInfo {
    meetingId: string;
    creatorId: string;
    status: string;
    accessMode: 'public' | 'private';
}

/**
 * Get meeting info with caching potential
 */
export async function getMeetingInfo(meetingId: string): Promise<MeetingInfo | null> {
    if (!meetingId || typeof meetingId !== 'string') {
        logger.warn({ meetingId }, 'Invalid meeting ID provided');
        return null;
    }

    const query = `
        SELECT id as meetingId, creator_id as creatorId, status, access_mode as accessMode
        FROM ${TABLES.MEETINGS}
        WHERE id = ? AND deleted_at IS NULL
    `;

    try {
        const [rows] = await dbPool.query<RowDataPacket[]>(query, [meetingId]);
        return rows.length > 0 ? rows[0] as MeetingInfo : null;
    } catch (error) {
        logger.error({ error, meetingId }, 'Failed to get meeting info');
        throw error;
    }
}

/**
 * Check if user is meeting creator
 */
export async function isCreator(userId: string, meetingId: string): Promise<boolean> {
    const meeting = await getMeetingInfo(meetingId);
    return meeting?.creatorId === userId;
}

/**
 * Check if user is participant (invited to the meeting)
 */
export async function isParticipant(userId: string, meetingId: string): Promise<boolean> {
    const query = `
        SELECT 1 FROM ${TABLES.PARTICIPANTS} 
        WHERE meeting_id = ? AND user_id = ?
    `;
    try {
        const [rows] = await dbPool.query<RowDataPacket[]>(query, [meetingId, userId]);
        return rows.length > 0;
    } catch (error) {
        logger.error({ error, meetingId, userId }, 'Failed to check participant status');
        throw error;
    }
}

/**
 * Policy: Can user view meeting?
 * - Admin: YES
 * - Creator: YES
 * - Participant: YES
 * - Public meeting: YES (anyone can view)
 */
export async function canView(
    userId: string,
    meetingId: string,
    userRole: string
): Promise<boolean> {
    // Admin bypass
    if (userRole.toLowerCase() === "admin") return true;

    const meeting = await getMeetingInfo(meetingId);
    if (!meeting) return false;

    // Creator always has access
    if (meeting.creatorId === userId) return true;

    // Public meetings can be viewed by anyone
    if (meeting.accessMode === 'public') return true;

    // Check if user is an invited participant
    return isParticipant(userId, meetingId);
}

/**
 * Policy: Can user manage (update/cancel/end) meeting?
 * - Admin: YES
 * - Creator: YES
 * - Others: NO
 */
export async function canManage(
    userId: string,
    meetingId: string,
    userRole: string
): Promise<boolean> {
    if (userRole.toLowerCase() === "admin") return true;
    return isCreator(userId, meetingId);
}

/**
 * Policy: Can user manage participants?
 * - Admin: YES  
 * - Creator: YES
 * - Others: NO
 */
export async function canManageParticipants(
    userId: string,
    meetingId: string,
    userRole: string
): Promise<boolean> {
    return canManage(userId, meetingId, userRole);
}

/**
 * Middleware factory for meeting authorization
 */
export function requireMeetingPermission(
    permissionCheck: (userId: string, meetingId: string, userRole: string) => Promise<boolean>
) {
    return async (req: Request, res: any, next: any) => {
        const userId = req.user?.userId;
        const userRole = req.user?.role || "";
        const meetingId = req.params.id;

        if (!userId) {
            logger.warn({ path: req.path }, 'Unauthorized access attempt - no user');
            return res.status(401).json({
                success: false,
                message: "Unauthorized - Authentication required",
            });
        }

        if (!meetingId) {
            return res.status(400).json({
                success: false,
                message: "Meeting ID is required",
            });
        }

        // Validate UUID format to prevent injection
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(meetingId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid meeting ID format",
            });
        }

        try {
            const hasPermission = await permissionCheck(userId, meetingId, userRole);
            if (!hasPermission) {
                logger.warn({ userId, meetingId, userRole }, 'Permission denied for meeting');
                return res.status(403).json({
                    success: false,
                    message: "Forbidden - You don't have permission to access this meeting",
                });
            }
            next();
        } catch (error) {
            logger.error({ error, userId, meetingId }, 'Error checking meeting permission');
            return res.status(500).json({
                success: false,
                message: "Error checking permissions",
            });
        }
    };
}
