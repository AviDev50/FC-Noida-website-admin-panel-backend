import express from "express";
import cors from "cors";
import path from "path";
import helmet from "helmet";
import { fileURLToPath } from "url";
import authMiddleware from "./middlewares/auth.js";
import publicRoutes from "./routes/public.router.js";
import adminRoutes from "./routes/admin.router.js";
import { notFound, errorHandler } from "./middlewares/errorHandler.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

const PORT = 8000;

const allowedOrigins = [
  "https://fc-noida-website-admin-panel-fronte.vercel.app",
];

// Security headers
app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);

// CORS - Allow all origins
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    optionsSuccessStatus: 204,
  })
);

// Body parser
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// Uploads
app.use(
  "/uploads",
  express.static(path.join(__dirname, "public/uploads"))
);

// Health check
app.get("/health", (req, res) => {
  res.json({ ok: true, message: "Server running" });
});

// Routes
app.use("/api", publicRoutes);
app.use("/api/admin", authMiddleware, adminRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection:", err);
});
