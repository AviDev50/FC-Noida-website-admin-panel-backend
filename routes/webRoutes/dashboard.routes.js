import { Router } from "express";
import { getDashboard } from "../../controllers/webController/dashboard.controller.js";

const router = Router();

router.get("/dashboard", getDashboard);

export default router;
