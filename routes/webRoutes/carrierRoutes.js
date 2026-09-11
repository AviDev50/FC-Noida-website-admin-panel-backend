import { Router } from "express";
import { careerAdd, deleteCareerJob, getCareerJobs, showAddCareerForm, showEditCareerForm, updateCareerJob } from "../../controllers/webController/carrierController.js";
import authentication from "../../middlewares/authentication.js";

const router = Router();

// Add new career
router.post("/career/add",careerAdd);

// GET Career page with jobs
router.get("/career", getCareerJobs); 


//delete
router.post("/career/delete/:id", deleteCareerJob);


// Show add job form
router.get("/career/add", showAddCareerForm);

// Show edit form
router.get("/career/edit/:id", showEditCareerForm);

// update

router.post("/career/edit/:id", updateCareerJob);



export default router;
