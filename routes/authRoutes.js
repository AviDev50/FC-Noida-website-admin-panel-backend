import express from "express";
import { signup, login, getUsersList, getUserProfile } from "../controllers/authController.js";
import authMiddleware from "../middlewares/auth.js";


const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/users", getUsersList);
router.get("/profile", authMiddleware, getUserProfile);

export default router;
