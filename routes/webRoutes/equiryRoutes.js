import express from "express";
import { createEnquiry, deleteEnquiries, getEnquiries } from "../../controllers/webController/enquriController.js";
import authentication from "../../middlewares/authentication.js";

const router = express.Router();

// POST Enquiry 
router.post("/enquiry", createEnquiry);

// GET Enquiries
router.get("/enquiries", authentication, getEnquiries);

//delete method---The GET method is used because the anchor (<a>) tag supports only the GET method, which is why it is used inside the EJS folder.

router.get("/enquiries/delete/:id",  deleteEnquiries);

export default router;
