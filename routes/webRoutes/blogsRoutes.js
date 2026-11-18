import express from "express";
import {
//   getBlogs,
  getBlogById,
  createBlog,
  updateBlogs,
  deleteBlogs,
//   matkaapi,
} from "../../controllers/jsonapi/blogs.controller.js"; // Sahi controller path verify karein
import { upload } from "../../config/upload.js";
import authentication from "../../middlewares/authentication.js";

const router = express.Router();

// ================= BLOGS REST API =================

// 1. Get all blogs (supports ?category_id= & ?status= query params)
// router.get("/blogs", authentication, getBlogs);

// 2. Get single blog details by ID (Edit form pre-fill karne ke liye)
router.get("/blogs/:id", authentication, getBlogById);

// 3. Create new blog (Multipart file upload)
router.post("/blogs/add", authentication, upload.single("image"), createBlog);

// 4. Update blog (Multipart file upload)
router.post("/blogs/edit/:id", authentication, upload.single("image"), updateBlogs);

// 5. Delete blog
router.post("/blogs/delete/:id", authentication, deleteBlogs);

// ================= THIRD PARTY / UTILITY =================
// router.get("/matkaapi", matkaapi);

export default router;