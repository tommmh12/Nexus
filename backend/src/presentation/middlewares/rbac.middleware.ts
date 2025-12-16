import { Request, Response, NextFunction } from "express";
import { UserRole } from "./auth.middleware.js";

/**
 * RBAC Middleware - Role-Based Access Control
 * 
 * Usage examples:
 * - router.delete("/:id", requireRole("admin"), deleteUser)
 * - router.put("/:id", requireRole("admin", "manager"), updateUser)
 * - router.get("/profile", requireOwner(getUserIdFromParams), getProfile)
 */

// Type for resource owner ID getter function
type GetResourceOwnerId = (req: Request) => Promise<string> | string;

/**
 * Middleware that requires user to have one of the specified roles
 * @param roles - Allowed roles (variadic)
 */
export const requireRole = (...roles: UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        // User must be authenticated first
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized - Authentication required",
            });
        }

        const userRole = req.user.role;

        // Normalize role to lowercase for case-insensitive comparison
        const normalizedUserRole = userRole?.toLowerCase() as UserRole;

        // Check if user has one of the required roles
        if (!normalizedUserRole || !roles.includes(normalizedUserRole)) {
            console.log(`RBAC denied: userRole=${userRole}, normalizedRole=${normalizedUserRole}, allowedRoles=${roles.join(',')}`);
            return res.status(403).json({
                success: false,
                message: "Forbidden - Insufficient permissions",
            });
        }

        next();
    };
};

/**
 * Middleware that requires user to be the owner of the resource OR be an admin
 * @param getResourceOwnerId - Function to get the owner ID of the resource
 */
export const requireOwner = (getResourceOwnerId: GetResourceOwnerId) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        // User must be authenticated first
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized - Authentication required",
            });
        }

        try {
            const resourceOwnerId = await getResourceOwnerId(req);
            const userId = req.user.userId;
            const userRole = req.user.role;

            // Normalize role to lowercase
            const normalizedRole = userRole?.toLowerCase();

            // Admin can access any resource
            if (normalizedRole === "admin") {
                return next();
            }

            // User can only access their own resources
            if (userId !== resourceOwnerId) {
                return res.status(403).json({
                    success: false,
                    message: "Forbidden - You can only access your own resources",
                });
            }

            next();
        } catch (error) {
            console.error("Error in requireOwner middleware:", error);
            return res.status(500).json({
                success: false,
                message: "Error checking resource ownership",
            });
        }
    };
};

/**
 * Middleware that requires user to be owner OR have one of the specified roles
 * Useful for routes where managers can access their department members' resources
 * @param roles - Allowed roles that bypass ownership check
 * @param getResourceOwnerId - Function to get the owner ID of the resource
 */
export const requireOwnerOrRole = (
    roles: UserRole[],
    getResourceOwnerId: GetResourceOwnerId
) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized - Authentication required",
            });
        }

        const userRole = req.user.role;

        // Normalize role to lowercase for case-insensitive comparison
        const normalizedRole = userRole?.toLowerCase() as UserRole;

        // If user has one of the allowed roles, skip ownership check
        if (normalizedRole && roles.includes(normalizedRole)) {
            return next();
        }

        // Otherwise, check ownership
        try {
            const resourceOwnerId = await getResourceOwnerId(req);
            if (req.user.userId === resourceOwnerId) {
                return next();
            }

            return res.status(403).json({
                success: false,
                message: "Forbidden - Insufficient permissions",
            });
        } catch (error) {
            console.error("Error in requireOwnerOrRole middleware:", error);
            return res.status(500).json({
                success: false,
                message: "Error checking permissions",
            });
        }
    };
};

/**
 * Helper: Get user ID from request params
 * Usage: requireOwner(getUserIdFromParams)
 */
export const getUserIdFromParams = (req: Request): string => {
    return req.params.id || req.params.userId || "";
};
