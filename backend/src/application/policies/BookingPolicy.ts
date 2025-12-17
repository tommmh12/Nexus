import { Request } from "express";
import { dbPool } from "../../infrastructure/database/connection.js";
import { RowDataPacket } from "mysql2";

/**
 * Booking Permission Policy
 * 
 * Room bookings have a creator who owns the booking.
 * Approval is handled by managers/admins.
 */

export interface BookingInfo {
    bookingId: string;
    creatorId: string;
    status: string;
}

/**
 * Get booking info
 */
export async function getBookingInfo(bookingId: string): Promise<BookingInfo | null> {
    const query = `
    SELECT id as bookingId, user_id as creatorId, status
    FROM room_bookings
    WHERE id = ?
  `;

    const [rows] = await dbPool.query<RowDataPacket[]>(query, [bookingId]);
    return rows.length > 0 ? rows[0] as BookingInfo : null;
}

/**
 * Policy: Can user view booking?
 * - Admin: YES
 * - Manager: YES (view all)
 * - Creator: YES
 */
export async function canView(
    userId: string,
    bookingId: string,
    userRole: string
): Promise<boolean> {
    const role = userRole.toLowerCase();
    if (role === "admin" || role === "manager") return true;

    const booking = await getBookingInfo(bookingId);
    return booking?.creatorId === userId;
}

/**
 * Policy: Can user edit/cancel booking?
 * - Admin: YES
 * - Creator: YES (if not yet approved)
 */
export async function canEdit(
    userId: string,
    bookingId: string,
    userRole: string
): Promise<boolean> {
    if (userRole.toLowerCase() === "admin") return true;

    const booking = await getBookingInfo(bookingId);
    if (!booking) return false;

    // Creator can only edit pending bookings
    if (booking.creatorId === userId) {
        return booking.status === "pending" || booking.status === "Pending";
    }
    return false;
}

/**
 * Policy: Can user approve/reject booking?
 * - Admin: YES
 * - Manager: YES
 * - Others: NO
 */
export async function canApprove(
    _userId: string,
    _bookingId: string,
    userRole: string
): Promise<boolean> {
    const role = userRole.toLowerCase();
    return role === "admin" || role === "manager";
}

/**
 * Policy: Can user delete booking?
 * - Admin: YES
 * - Creator: YES
 */
export async function canDelete(
    userId: string,
    bookingId: string,
    userRole: string
): Promise<boolean> {
    if (userRole.toLowerCase() === "admin") return true;

    const booking = await getBookingInfo(bookingId);
    return booking?.creatorId === userId;
}

/**
 * Middleware factory for booking authorization
 */
export function requireBookingPermission(
    permissionCheck: (userId: string, bookingId: string, userRole: string) => Promise<boolean>
) {
    return async (req: Request, res: any, next: any) => {
        const userId = req.user?.userId;
        const userRole = req.user?.role || "";
        const bookingId = req.params.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized - Authentication required",
            });
        }

        if (!bookingId) {
            return res.status(400).json({
                success: false,
                message: "Booking ID is required",
            });
        }

        try {
            const hasPermission = await permissionCheck(userId, bookingId, userRole);
            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    message: "Forbidden - You don't have permission to access this booking",
                });
            }
            next();
        } catch (error) {
            console.error("Error checking booking permission:", error);
            return res.status(500).json({
                success: false,
                message: "Error checking permissions",
            });
        }
    };
}
