import express from "express";
import { showLogin, loginAdmin, logoutAdmin } from "../../controllers/webController/login.controller.js";

const router = express.Router();

// 🔹 LOGIN PAGE (GET)
router.get("/login", showLogin);

// 🔹 LOGIN SUBMIT (POST)
router.post("/login", loginAdmin);

// 🔹 LOGOUT
router.get("/logout", logoutAdmin);

export default router;
