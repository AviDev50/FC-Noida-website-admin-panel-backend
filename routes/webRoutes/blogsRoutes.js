import express from "express";
import { showAddBlogForm, createBlog, deleteBlogs, getBlogsByCategory, updateBlogs,getBlogsWithCategory, showEditBlogForm, matkaapi } from "../../controllers/webController/blogsController.js";
import { upload } from "../../config/upload.js";
import authentication from "../../middlewares/authentication.js";
import multer from "multer";
const router = express.Router();

router.get("/blogs", authentication,getBlogsWithCategory);

router.get("/matkaapi",matkaapi);


// Show Add Blog Form
router.get("/blogs/add", showAddBlogForm);

// Create Blog
router.post("/blogs/add", upload.single("image"), createBlog); 

//delete 
router.post("/blogs/delete/:id",deleteBlogs)

//category_id ke behalf pr blog get 

router.get("/getBlogByCategoryId", getBlogsByCategory);

//  Get blog Edit form
router.get("/blogs/edit/:id", showEditBlogForm);

// update blog
router.post("/blogs/edit/:id", upload.single('image'), updateBlogs);


export default router;
