import { Router } from "express";
import { getStats } from "../controllers/admin.controller.js";
import { protect, authorize } from "../middleware/auth.js";

const router = Router();

// Every route in this file needs a logged-in admin
router.use(protect, authorize("admin"));

router.get("/stats", getStats);

export default router;