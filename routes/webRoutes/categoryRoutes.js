import { Router } from "express";
import {
  createCategory,
  deleteCategory,
  getCategoryById,
  getCategoryList,
  showAddCategoryForm,
} from "../../controllers/webController/categoryController.js";

const router = Router();

// show catgory form
router.get("/category/addForm", showAddCategoryForm);

// create category

router.post("/category/add", createCategory);

// DELETE
router.get("/category/delete/:id", deleteCategory);

//get categoryByid

router.get("/Category/:id", getCategoryById);


//get category list
router.get("/category", getCategoryList);

export default router;
