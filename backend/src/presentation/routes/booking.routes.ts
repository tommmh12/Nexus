import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import * as BookingController from "../controllers/BookingController.js";
import {
    requireBookingPermission,
    BookingPolicy,
} from "../../application/policies/index.js";
import { requireRole } from "../middlewares/rbac.middleware.js";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// ===================== ROOM BOOKINGS =====================
router.get("/", BookingController.getBookings);
router.get("/pending", requireRole("admin", "manager"), BookingController.getPendingBookings);
router.get(
    "/:id",
    requireBookingPermission(BookingPolicy.canView),
    BookingController.getBookingById
);
router.post("/", BookingController.createBooking);
router.put(
    "/:id",
    requireBookingPermission(BookingPolicy.canEdit),
    BookingController.updateBooking
);
router.delete(
    "/:id",
    requireBookingPermission(BookingPolicy.canDelete),
    BookingController.deleteBooking
);

// Approval workflow - manager/admin only
router.put(
    "/:id/approve",
    requireBookingPermission(BookingPolicy.canApprove),
    BookingController.approveBooking
);
router.put(
    "/:id/reject",
    requireBookingPermission(BookingPolicy.canApprove),
    BookingController.rejectBooking
);
router.put(
    "/:id/cancel",
    requireBookingPermission(BookingPolicy.canEdit),
    BookingController.cancelBooking
);

// Participants - booking owner only
router.post(
    "/:id/participants",
    requireBookingPermission(BookingPolicy.canEdit),
    BookingController.addParticipant
);
router.delete(
    "/:id/participants/:participantId",
    requireBookingPermission(BookingPolicy.canEdit),
    BookingController.removeParticipant
);

export default router;
