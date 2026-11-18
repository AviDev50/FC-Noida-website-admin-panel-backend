import { Router } from "express";
import { uploadImage } from "../config/upload.js";
import { logoutAdmin } from "../controllers/jsonapi/auth.controller.js";
import { getBlogsWithCategory, getBlogById, createBlog, updateBlogs, deleteBlogs } from "../controllers/jsonapi/blogs.controller.js";
import { getCareerJobs, careerAdd, updateCareerJob, deleteCareerJob } from "../controllers/jsonapi/career.controller.js";
import { getCategoryList, getCategoryById, createCategory, deleteCategory } from "../controllers/jsonapi/category.controller.js";
import { getEmployees, createProfile, deleteEmployee } from "../controllers/jsonapi/employee.controller.js";
import {
  getEnquiries, deleteEnquiries,
  showJobRequestsForm as getJobRequests, deleteJobRequest, downloadResume,
  getSchoolUsers, deleteSchoolEnquiry,
} from "../controllers/jsonapi/enquiry.controller.js";
import { getDashboard } from "../controllers/jsonapi/dashboard.controller.js";
import { getPgDemoRequests, deletePgDemoRequest } from "../controllers/jsonapi/pgEnquiryController.js";
const router = Router();

router.post("/logout", logoutAdmin);
router.get("/dashboard", getDashboard);

router.get("/blogs", getBlogsWithCategory);
router.get("/blogs/:id", getBlogById);
router.post("/blogs", uploadImage.single("image"), createBlog);
router.put("/blogs/:id", uploadImage.single("image"), updateBlogs);
router.delete("/blogs/:id", deleteBlogs);

router.get("/career", getCareerJobs);
router.post("/career", careerAdd);
router.put("/career/:id", updateCareerJob);
router.delete("/career/:id", deleteCareerJob);

router.get("/categories", getCategoryList);
router.get("/categories/:id", getCategoryById);
router.post("/categories", createCategory);
router.delete("/categories/:id", deleteCategory);

router.get("/employees", getEmployees);
router.post("/employees", uploadImage.single("image"), createProfile);
router.delete("/employees/:id", deleteEmployee);

router.get("/enquiries", getEnquiries);
router.delete("/enquiries/:id", deleteEnquiries);

router.get("/job-requests", getJobRequests);
router.get("/job-requests/:job_request_id/resume", downloadResume);
router.delete("/job-requests/:job_request_id", deleteJobRequest);

router.get("/school-inquiries", getSchoolUsers);
router.delete("/school-inquiries/:id", deleteSchoolEnquiry);


router.get("/pg-demo-requests", getPgDemoRequests);
router.delete("/pg-demo-requests/:id", deletePgDemoRequest);

export default router;