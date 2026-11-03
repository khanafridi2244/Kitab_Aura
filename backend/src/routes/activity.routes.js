import { Router } from "express";
import { z } from "zod";
import { getActivity, setGoal } from "../controllers/activity.controller.js";
import { protect } from "../middleware/auth.js";
import validate from "../middleware/validate.js";

const router = Router();

const goalSchema = z.object({
  weeklyGoal: z.coerce
    .number("Goal must be a number")
    .int("Goal must be a whole number")
    .min(0, "Goal cannot be negative")
    .max(5000, "Goal is too high (max 5000 pages a week)"),
});

router.use(protect);

router.get("/", getActivity);
router.put("/goal", validate(goalSchema), setGoal);

export default router;