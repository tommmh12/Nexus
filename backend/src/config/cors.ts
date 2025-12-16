import cors from "cors";

// ============================================================
// CORS Configuration - Centralized allowed origins
// ============================================================
export const allowedOrigins: string[] = [
    // Production domains
    "https://studyplannerapp.io.vn",
    "https://www.studyplannerapp.io.vn",
    // Local development
    "http://localhost:3000",
    "http://localhost:5173",
];

export const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) {
            return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS not allowed for origin: ${origin}`));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};
