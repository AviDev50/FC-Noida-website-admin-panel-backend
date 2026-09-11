import { Router } from "express";
import authentication from "../../middlewares/authentication.js";
import { createProfile, deleteEmployee, getEmployees, showAddEmployeeForm } from "../../controllers/webController/employeesController.js";
import { upload } from "../../config/upload.js";

const router = Router();

// GET employees list page
router.get("/employees", authentication, getEmployees);

// POST add new employee
router.post("/employees/add", upload.single("image"), createProfile);


// DELETE employee
router.get("/employees/delete/:id", deleteEmployee);



// show add form

router.get("/employees/add", showAddEmployeeForm);
export default router;
