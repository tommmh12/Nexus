/**
 * Meeting Routes
 * RESTful API endpoints for meeting management
 * 
 * Features:
 * - Rate limiting for create/join operations
 * - Input validation middleware
 * - Permission-based access control
 * 
 * BREAKING CHANGE: GET /join-token is now POST /join
 */

import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import * as MeetingController from "../controllers/MeetingController.js";
import {
    requireMeetingPermission,
    MeetingPolicy,
} from "../../application/policies/index.js";
import {
    rateLimitJoin,
    rateLimitCreate,
    validateMeetingId,
    validateCreateMeeting,
} from "../middlewares/meeting.middleware.js";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// =====================================================
// Core Meeting Operations
// =====================================================

// Create new meeting - any authenticated user can create
// Rate limited to prevent spam
router.post("/", 
    rateLimitCreate,
    validateCreateMeeting,
    MeetingController.createMeeting
);

// Get all meetings accessible by user
router.get("/", MeetingController.getMeetings);

// Get meeting by ID - requires view permission (creator or participant)
router.get(
    "/:id",
    validateMeetingId,
    requireMeetingPermission(MeetingPolicy.canView),
    MeetingController.getMeetingById
);

// =====================================================
// Join Meeting (POST - has side effects)
// =====================================================

// Join meeting and get room credentials - requires view permission
// Rate limited to prevent token generation abuse
router.post(
    "/:id/join",
    validateMeetingId,
    rateLimitJoin,
    requireMeetingPermission(MeetingPolicy.canView),
    MeetingController.joinMeeting
);

// Legacy endpoint - returns 405 with migration instructions
router.get("/:id/join-token", MeetingController.getJoinTokenLegacy);

// =====================================================
// Participant Management
// =====================================================

// Add participants to meeting - creator only
router.post(
    "/:id/participants",
    validateMeetingId,
    requireMeetingPermission(MeetingPolicy.canManageParticipants),
    MeetingController.addParticipants
);

// Remove participant from meeting - creator only
router.delete(
    "/:id/participants/:userId",
    validateMeetingId,
    requireMeetingPermission(MeetingPolicy.canManageParticipants),
    MeetingController.removeParticipant
);

// =====================================================
// Meeting Lifecycle
// =====================================================

// End meeting (only creator)
router.post(
    "/:id/end",
    validateMeetingId,
    requireMeetingPermission(MeetingPolicy.canManage),
    MeetingController.endMeeting
);

// Cancel meeting (only creator, only if scheduled)
router.post(
    "/:id/cancel",
    validateMeetingId,
    requireMeetingPermission(MeetingPolicy.canManage),
    MeetingController.cancelMeeting
);

// Delete meeting (soft delete, only creator)
router.delete(
    "/:id",
    validateMeetingId,
    requireMeetingPermission(MeetingPolicy.canManage),
    MeetingController.deleteMeeting
);

// =====================================================
// Reports
// =====================================================

// Get attendance report (only creator)
router.get(
    "/:id/attendance",
    validateMeetingId,
    requireMeetingPermission(MeetingPolicy.canManage),
    MeetingController.getAttendanceReport
);

export default router;
