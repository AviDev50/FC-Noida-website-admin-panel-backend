import express, { Router } from "express";
import db from "../../config/db.js";
import {getCareerJobs, getCotegoriesForApi, getEmployees,getBlogsByCategory,submitJobRequest } from "../../controllers/apiController/fcapi.js";
import { upload } from "../../config/upload.js";

const router = Router();

// get category
router.get("/Category", getCotegoriesForApi);

// get career

router.get("/career", getCareerJobs);

// get blogs

router.get("/blogs",getBlogsByCategory);


//get employees

router.get("/employees", getEmployees);


//category_id ke behalf pr blog get

//router.get("/getBlogByCategoryId", getBlogsByCategory);

//job request
router.post("/job-Request", upload.single("resume"), submitJobRequest);

export default router;
