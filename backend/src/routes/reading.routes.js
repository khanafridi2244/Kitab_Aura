import { Router } from "express";
import { z } from "zod";
import { getReading, saveProgress } from "../controllers/reading.controller.js";
import { protect } from "../middleware/auth.js";
import validate from "../middleware/validate.js";

const router = Router();

const pageSchema = z.object({
  page: z.coerce.number("Page is required").int("Page must be a whole number").min(1, "Page must be at least 1").max(10000),
});

router.use(protect);

router.get("/:bookId", getReading);
router.put("/:bookId", validate(pageSchema), saveProgress);

export default router;