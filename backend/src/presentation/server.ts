import express, { Application, Request, Response, NextFunction } from "express";
import { createServer } from "http";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import { initializeSocketServer } from "../infrastructure/websocket/socketServer.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import projectRoutes from "./routes/project.routes.js";
import workflowRoutes from "./routes/workflow.routes.js";
import settingsRoutes from "./routes/settings.routes.js";
import userRoutes from "./routes/user.routes.js";
import forumRoutes from "./routes/forum.routes.js";
import newsRoutes from "./routes/news.routes.js";

dotenv.config();

const app: Application = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

// Initialize WebSocket server
initializeSocketServer(httpServer);

// Middleware
app.use(helmet());

// CORS configuration from environment variables
const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((origin) => origin.trim())
  : ["http://localhost:3000", "http://localhost:5173"];

app.use(
  cors({
    origin: corsOrigins,
    credentials: process.env.CORS_CREDENTIALS === "true",
  })
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
app.use("/api/workflows", workflowRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/users", userRoutes);
app.use("/api/forum", forumRoutes);
app.use("/api/news", newsRoutes);

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

// Startup validation
if (process.env.NODE_ENV === "production") {
  const requiredEnvVars = ["JWT_SECRET", "DB_PASSWORD"];
  const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error("\n❌ ERROR: Missing required environment variables in production:");
    missingVars.forEach((varName) => console.error(`   - ${varName}`));
    console.error("\nServer startup aborted.\n");
    process.exit(1);
  }
}

// Start server
httpServer.listen(PORT, () => {
  console.log("\n========================================");
  console.log(`🚀 Nexus Backend API`);
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗 API URL: http://localhost:${PORT}`);
  console.log(`🔌 WebSocket Server: ws://localhost:${PORT}`);
  
  // Warn about missing JWT_SECRET in development
  if (process.env.NODE_ENV !== "production" && !process.env.JWT_SECRET) {
    console.log(`⚠️  WARNING: JWT_SECRET not set, using default (not secure for production)`);
  }
  
  console.log("========================================\n");
});

export default app;
