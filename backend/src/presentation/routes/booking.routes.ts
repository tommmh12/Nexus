import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import * as BookingController from "../controllers/BookingController.js";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// ===================== ROOM BOOKINGS =====================
router.get("/", BookingController.getBookings);
router.get("/pending", BookingController.getPendingBookings);
router.get("/:id", BookingController.getBookingById);
router.post("/", BookingController.createBooking);
router.put("/:id", BookingController.updateBooking);
router.delete("/:id", BookingController.deleteBooking);

// Approval workflow
router.put("/:id/approve", BookingController.approveBooking);
router.put("/:id/reject", BookingController.rejectBooking);
router.put("/:id/cancel", BookingController.cancelBooking);

// Participants
router.post("/:id/participants", BookingController.addParticipant);
router.delete("/:id/participants/:participantId", BookingController.removeParticipant);

export default router;
