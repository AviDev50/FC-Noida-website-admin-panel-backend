import { Router } from "express";
import rateLimit from "express-rate-limit";
import { uploadResume } from "../config/upload.js";
import { loginAdmin } from "../controllers/jsonapi/auth.controller.js";
import { createEnquiry, submitJobRequest, createSchoolUser } from "../controllers/jsonapi/enquiry.controller.js";
import { getPublishedBlogs, getPublishedBlogBySlug } from "../controllers/jsonapi/publicBlogs.controller.js";
import { createPgDemoRequest } from "../controllers/jsonapi/pgEnquiryController.js";



const router = Router();

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: { success: false, message: "Too many attempts, try later" } });
const formLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 20, message: { success: false, message: "Too many submissions" } });

router.post("/login", loginLimiter, loginAdmin);

router.post("/enquiries", formLimiter, createEnquiry);
router.post("/job-requests", formLimiter, uploadResume.single("resume"), submitJobRequest);
router.post("/school-inquiries", formLimiter, createSchoolUser);

router.get("/blogs", getPublishedBlogs);
router.get("/blogs/:slug", getPublishedBlogBySlug);

router.post("/pg-demo-requests", formLimiter, createPgDemoRequest);

export default router;