/**
 * Meeting Routes
 * RESTful API endpoints for meeting management
 * 
 * BREAKING CHANGE: GET /join-token is now POST /join
 */

import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import * as MeetingController from "../controllers/MeetingController.js";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// =====================================================
// Core Meeting Operations
// =====================================================

// Create new meeting
router.post("/", MeetingController.createMeeting);

// Get all meetings accessible by user
router.get("/", MeetingController.getMeetings);

// Get meeting by ID (read-only, no side effects)
router.get("/:id", MeetingController.getMeetingById);

// =====================================================
// Join Meeting (POST - has side effects)
// =====================================================

// Join meeting and get room credentials
// Body: { clientInstanceId?: string, deviceInfo?: string }
// Returns: { roomUrl, token, meetingSessionId, provider }
router.post("/:id/join", MeetingController.joinMeeting);

// Legacy endpoint - returns 405 with migration instructions
router.get("/:id/join-token", MeetingController.getJoinTokenLegacy);

// =====================================================
// Participant Management
// =====================================================

// Add participants to meeting
router.post("/:id/participants", MeetingController.addParticipants);

// Remove participant from meeting
router.delete("/:id/participants/:userId", MeetingController.removeParticipant);

// =====================================================
// Meeting Lifecycle
// =====================================================

// End meeting (only creator)
router.post("/:id/end", MeetingController.endMeeting);

// Cancel meeting (only creator, only if scheduled)
router.post("/:id/cancel", MeetingController.cancelMeeting);

// Delete meeting (soft delete, only creator)
router.delete("/:id", MeetingController.deleteMeeting);

// =====================================================
// Reports
// =====================================================

// Get attendance report (only creator)
router.get("/:id/attendance", MeetingController.getAttendanceReport);

export default router;
