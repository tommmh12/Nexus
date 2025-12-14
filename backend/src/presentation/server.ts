import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { createServer } from "http";
import authRoutes from "./routes/auth.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import projectRoutes from "./routes/project.routes.js";
import taskRoutes from "./routes/task.routes.js";
import reportRoutes from "./routes/report.routes.js";
import workflowRoutes from "./routes/workflow.routes.js";
import settingsRoutes from "./routes/settings.routes.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import chatRoutes from "./routes/chat.routes.js";
import userRoutes from "./routes/user.routes.js";
import newsRoutes from "./routes/news.routes.js";
import forumRoutes from "./routes/forum.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import floorRoutes from "./routes/floor.routes.js";
import roomRoutes from "./routes/room.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import onlineMeetingRoutes from "./routes/onlineMeeting.routes.js";
import activityLogRoutes from "./routes/activityLog.routes.js";
import alertRuleRoutes from "./routes/alertRule.routes.js";
import managerRoutes from "./routes/manager.routes.js";
import { SocketManager } from "../infrastructure/socket/SocketManager.js";
import { alertSchedulerService } from "../application/services/AlertSchedulerService.js";

dotenv.config();

const app: Application = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false,
  })
);
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
  })
);
app.use(morgan("dev"));

// Upload routes MUST be before json body parser to handle multipart/form-data correctly
app.use("/api/upload", uploadRoutes);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Nexus API is running",
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/workflows", workflowRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/users", userRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/forum", forumRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/comments", commentRoutes);
// Note: uploadRoutes is registered earlier (before body parser)
app.use("/api/floors", floorRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/meetings", onlineMeetingRoutes);
app.use("/api/activity-logs", activityLogRoutes);
app.use("/api/alert-rules", alertRuleRoutes);
app.use("/api/manager", managerRoutes);

// Serve uploaded files with CORS
app.use(
  "/uploads",
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
  }),
  express.static("uploads")
);

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Error:", err);
  res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
});

// Initialize Socket.IO
const socketManager = new SocketManager(httpServer);

// Start server
httpServer.listen(PORT, () => {
  console.log("\n========================================");
  console.log(`🚀 Nexus Backend API`);
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗 API URL: http://localhost:${PORT}`);
  console.log(`💬 Socket.IO enabled for realtime chat`);
  console.log("========================================\n");

  // Start Alert Scheduler (check every 30 minutes)
  alertSchedulerService.start(30 * 60 * 1000);
});

export default app;
