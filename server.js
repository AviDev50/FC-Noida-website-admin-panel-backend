// server.js
import { PORT, FRONTEND_URLS } from "./config/env.js"; // sabse pehle: dotenv load + env validation
import express from "express";
import cors from "cors";
import helmet from "helmet";
import authMiddleware from "./middlewares/auth.js";
import publicRoutes from "./routes/public.router.js";
import adminRoutes from "./routes/admin.router.js";
import { notFound, errorHandler } from "./middlewares/errorHandler.js";
import { UPLOAD_DIR } from "./utils/files.js";

const app = express();

// Security headers (images doosre origin se load ho sakein)
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

// CORS: sirf whitelisted origins
app.use(
  cors({
    origin: FRONTEND_URLS,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  })
);

// Body parsers
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// Public uploads (blog/employee images). Resumes yahan se serve nahi hote.
app.use("/uploads", express.static(UPLOAD_DIR));

// Health check
app.get("/health", (req, res) => res.json({ ok: true }));

// Routes
app.use("/api", publicRoutes);
app.use("/api/admin", authMiddleware, adminRoutes);

// 404 + global error handler (hamesha last me)
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

process.on("unhandledRejection", (err) => console.error("Unhandled rejection:", err));