/**
 * Meeting Controller
 * Thin controller layer - delegates to MeetingService
 * Handles request validation and response formatting
 */

import { Request, Response } from "express";
import { MeetingService } from "../../application/services/MeetingService.js";
import { MeetingRepository } from "../../infrastructure/repositories/MeetingRepository.js";
import { CreateMeetingDTO, JoinMeetingDTO } from "../../domain/entities/Meeting.js";
import { createModuleLogger } from "../../infrastructure/logger.js";

const logger = createModuleLogger('MeetingController');
const meetingService = new MeetingService(new MeetingRepository());
const meetingRepo = new MeetingRepository();

// =====================================================
// Create Meeting
// =====================================================

export const createMeeting = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const meetingData: CreateMeetingDTO = req.body;

        // Validate required fields
        if (!meetingData.title || !meetingData.scheduledStart) {
            return res.status(400).json({
                success: false,
                message: "Title and scheduled start time are required",
            });
        }

        const meeting = await meetingService.createMeeting(meetingData, userId);

        return res.status(201).json({
            success: true,
            data: meeting,
            message: "Meeting created successfully",
        });
    } catch (error: any) {
        logger.error({ error: error.message, body: req.body }, "Error creating meeting");

        // Return the actual error message for validation errors
        return res.status(400).json({
            success: false,
            message: error.message || "Error creating meeting",
        });
    }
};

// =====================================================
// Get Meetings
// =====================================================

export const getMeetings = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        const meetings = await meetingRepo.getAccessibleMeetings(userId);

        return res.json({
            success: true,
            data: meetings,
        });
    } catch (error: any) {
        logger.error({ error: error.message }, "Error getting meetings");
        return res.status(500).json({
            success: false,
            message: "Error fetching meetings",
        });
    }
};

// =====================================================
// Get Meeting by ID
// =====================================================

export const getMeetingById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user?.userId;

        const hasAccess = await meetingRepo.checkUserAccess(id, userId);
        if (!hasAccess) {
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }

        const meeting = await meetingRepo.getMeetingById(id);
        if (!meeting) {
            return res.status(404).json({
                success: false,
                message: "Meeting not found",
            });
        }

        return res.json({
            success: true,
            data: meeting,
        });
    } catch (error: any) {
        logger.error({ error: error.message }, "Error getting meeting");
        return res.status(500).json({
            success: false,
            message: "Error fetching meeting",
        });
    }
};

// =====================================================
// Join Meeting (POST - replaces GET join-token)
// =====================================================

export const joinMeeting = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user?.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const dto: JoinMeetingDTO = {
            clientInstanceId: req.body.clientInstanceId,
            deviceInfo: req.body.deviceInfo,
        };

        const joinResponse = await meetingService.joinMeeting(id, userId, dto);

        return res.json({
            success: true,
            data: joinResponse,
        });
    } catch (error: any) {
        logger.error({
            error: error.message,
            stack: error.stack,
            meetingId: req.params.id
        }, "Error joining meeting");
        console.error("Full join meeting error:", error);

        if (error.message === 'Meeting not found') {
            return res.status(404).json({
                success: false,
                message: "Meeting not found",
            });
        }

        if (error.message === 'Access denied') {
            return res.status(403).json({
                success: false,
                message: "Access denied to this meeting",
            });
        }

        if (error.message.includes('cancelled') || error.message.includes('ended')) {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message || "Error joining meeting",
        });
    }
};

// =====================================================
// Add Participants
// =====================================================

export const addParticipants = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { userIds } = req.body;
        const currentUserId = (req as any).user?.userId;

        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Participant list is required",
            });
        }

        const meeting = await meetingRepo.getMeetingById(id);
        if (!meeting) {
            return res.status(404).json({
                success: false,
                message: "Meeting not found",
            });
        }

        if (meeting.creatorId !== currentUserId) {
            return res.status(403).json({
                success: false,
                message: "Only meeting creator can add participants",
            });
        }

        await meetingRepo.addParticipants(id, userIds, currentUserId);
        const updatedMeeting = await meetingRepo.getMeetingById(id);

        res.json({
            success: true,
            data: updatedMeeting,
            message: "Participants added",
        });
    } catch (error: any) {
        logger.error({ error: error.message }, "Error adding participants");
        return res.status(500).json({
            success: false,
            message: "Error adding participants",
        });
    }
};

// =====================================================
// Remove Participant
// =====================================================

export const removeParticipant = async (req: Request, res: Response) => {
    try {
        const { id, userId } = req.params;
        const currentUserId = (req as any).user?.userId;

        const meeting = await meetingRepo.getMeetingById(id);
        if (!meeting) {
            return res.status(404).json({
                success: false,
                message: "Meeting not found",
            });
        }

        if (meeting.creatorId !== currentUserId) {
            return res.status(403).json({
                success: false,
                message: "Only meeting creator can remove participants",
            });
        }

        await meetingRepo.removeParticipant(id, userId);

        res.json({
            success: true,
            message: "Participant removed",
        });
    } catch (error: any) {
        logger.error({ error: error.message }, "Error removing participant");
        return res.status(500).json({
            success: false,
            message: "Error removing participant",
        });
    }
};

// =====================================================
// End Meeting
// =====================================================

export const endMeeting = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user?.userId;
        const { reason } = req.body;

        await meetingService.endMeeting(id, userId, reason);

        res.json({
            success: true,
            message: "Meeting ended",
        });
    } catch (error: any) {
        logger.error({ error: error.message }, "Error ending meeting");

        if (error.message.includes('creator')) {
            return res.status(403).json({
                success: false,
                message: error.message,
            });
        }

        if (error.message.includes('transition')) {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }

        return res.status(500).json({
            success: false,
            message: "Error ending meeting",
        });
    }
};

// =====================================================
// Cancel Meeting
// =====================================================

export const cancelMeeting = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user?.userId;
        const { reason } = req.body;

        await meetingService.cancelMeeting(id, userId, reason);

        res.json({
            success: true,
            message: "Meeting cancelled",
        });
    } catch (error: any) {
        logger.error({ error: error.message }, "Error cancelling meeting");

        if (error.message.includes('creator')) {
            return res.status(403).json({
                success: false,
                message: error.message,
            });
        }

        if (error.message.includes('transition')) {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }

        return res.status(500).json({
            success: false,
            message: "Error cancelling meeting",
        });
    }
};

// =====================================================
// Delete Meeting (soft delete)
// =====================================================

export const deleteMeeting = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user?.userId;

        const meeting = await meetingRepo.getMeetingById(id);
        if (!meeting) {
            return res.status(404).json({
                success: false,
                message: "Meeting not found",
            });
        }

        if (meeting.creatorId !== userId) {
            return res.status(403).json({
                success: false,
                message: "Only meeting creator can delete",
            });
        }

        await meetingRepo.deleteMeeting(id);

        res.json({
            success: true,
            message: "Meeting deleted",
        });
    } catch (error: any) {
        logger.error({ error: error.message }, "Error deleting meeting");
        return res.status(500).json({
            success: false,
            message: "Error deleting meeting",
        });
    }
};

// =====================================================
// Get Attendance Report
// =====================================================

export const getAttendanceReport = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user?.userId;

        const meeting = await meetingRepo.getMeetingById(id);
        if (!meeting) {
            return res.status(404).json({
                success: false,
                message: "Meeting not found",
            });
        }

        // Only creator can view attendance report
        if (meeting.creatorId !== userId) {
            return res.status(403).json({
                success: false,
                message: "Only meeting creator can view attendance report",
            });
        }

        const report = await meetingService.getAttendanceReport(id);

        res.json({
            success: true,
            data: report,
        });
    } catch (error: any) {
        logger.error({ error: error.message }, "Error getting attendance report");
        return res.status(500).json({
            success: false,
            message: "Error fetching attendance report",
        });
    }
};

// =====================================================
// Legacy: Get Join Token (deprecated, redirects to POST)
// Kept for backward compatibility warning
// =====================================================

export const getJoinTokenLegacy = async (_req: Request, res: Response) => {
    return res.status(405).json({
        success: false,
        message: "GET /join-token is deprecated. Use POST /join instead.",
        hint: "Send a POST request to /meetings/:id/join with { clientInstanceId?: string }",
    });
};
