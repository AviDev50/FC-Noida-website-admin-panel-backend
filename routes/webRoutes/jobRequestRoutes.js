import express from "express";
import {deleteJobRequest, showJobRequestsForm } from "../../controllers/webController/jobRequest.controller.js";
import { upload } from "../../config/upload.js";


const router = express.Router();


//get job request
router.get("/jobRequest", showJobRequestsForm);

// DELETE
router.get("/jobRequest/delete/:job_request_id", deleteJobRequest);

export default router;
