import express from "express";
const router = express.Router();

import {
  createUser,
  getUsers,
  deleteEnquiry
} from "../../controllers/webController/SchoolenquiryController.js";

// POST
router.post("/create", createUser);

//  GET
router.get("/all", getUsers);

//  DELETE
router.delete("/delete/:id", deleteEnquiry);

// For  Ui
router.get("/school-enquiry", (req, res) => {
  res.render("school-enquiry");
});

export default router;