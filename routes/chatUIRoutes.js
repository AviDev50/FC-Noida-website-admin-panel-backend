import express from "express";

import { addUser, getUsers } from "../controllers/chatUI.controller.js";

import multer from "multer";
import { upload } from "../config/upload.js";

const router = express.Router();

//ChatUI

router.post("/add", upload.single("img"), addUser);
router.get("/list", getUsers);

export default router;
