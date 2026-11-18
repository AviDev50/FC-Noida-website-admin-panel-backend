// import "dotenv/config";
// import express from "express";
// import session from "express-session";
// import path from "path";
// import { fileURLToPath } from "url";
// import cors from "cors";
// import authentication from "./middlewares/authentication.js";
// import adminRoutes from "./routes/webRoutes/dashboard.routes.js";
// import loginRoutes from "./routes/webRoutes/login.routes.js";
// import blogsRoutes from "./routes/webRoutes/blogsRoutes.js";
// import careerRoutes from "./routes/webRoutes/carrierRoutes.js";
// import employeesRoutes from "./routes/webRoutes/employeesRoutes.js";
// import enquiryRoutes from "./routes/webRoutes/equiryRoutes.js";
// import categoryRoutes from "./routes/webRoutes/categoryRoutes.js";
// import jobRequestRoutes from "./routes/webRoutes/jobRequestRoutes.js"
// import { createUser } from "./controllers/webController/SchoolenquiryController.js";
// import fcApiRoutes from "./routes/apiRoutes/fcApiRoutes.js";
// import schoolEnquiryRoutes from "./routes/webRoutes/schoolEnquiryRoutes.js"
// import jsonApiRoutes from "./routes/jsonapi.router.js"

// const app = express();
// app.use(cors());

// // dirname fix (ES module)
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // ---------------- VIEW ENGINE ----------------
// app.set("view engine", "ejs");
// app.set("views", path.join(__dirname, "views"));

// // ---------------- BODY PARSER ----------------
// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());

// //session

// app.use(
//   session({
//     secret: "superAdminSecretKey",
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//       httpOnly: true,
//       maxAge: 5 * 60 * 60 * 1000, // 5 hours 
//     },
//   })
// );

// app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// app.use("/public", express.static(path.join(process.cwd(), "public")));

// app.use(express.static(path.join(__dirname, "public")));

// // =====================API Routes============================
// app.use("/admin/api", fcApiRoutes);

// // ---------------- ROUTES ----------------
// app.use("/", loginRoutes);
// app.use("/admin", adminRoutes);
// app.use("/admin", blogsRoutes);
// app.use("/admin", careerRoutes);
// app.use("/admin", employeesRoutes);
// app.use("/admin", enquiryRoutes);
// app.use("/admin", categoryRoutes);

// //json api routes
// app.use("/adminJson", jsonApiRoutes)

// app.use("/admin", jobRequestRoutes);
// app.use("/admin",schoolEnquiryRoutes);
// app.post("/admin/create",createUser);
// // dashboard
// app.get("/", authentication, (req, res) => {
//   res.redirect("/admin/dashboard");
// });

// // ---------------- SERVER ----------------
// app.listen(3000, () => {
//   console.log("Server running at http://localhost:3000");
// });

import { PORT, FRONTEND_URLS } from "./config/env.js";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";
import authMiddleware from "./middlewares/auth.js";
import publicRoutes from "./routes/public.router.js";
import adminRoutes from "./routes/admin.router.js";
import { notFound, errorHandler } from "./middlewares/errorHandler.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } })); // images React se load honge
app.use(cors({ origin: FRONTEND_URLS }));
app.use(express.json({ limit: "2mb" }));

app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));
app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/api", publicRoutes);
app.use("/api/admin", authMiddleware, adminRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => console.log(`Server running on ${PORT}`));

process.on("unhandledRejection", (err) => console.error("Unhandled rejection:", err));