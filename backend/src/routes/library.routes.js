import { Router } from "express";
import { z } from "zod";
import { getLibrary, getEntry, setStatus, removeEntry } from "../controllers/library.controller.js";
import { protect } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { READING_STATUSES } from "../models/ReadingProgress.js";

const router = Router();

const statusSchema = z.object({
  status: z.enum(READING_STATUSES, "Status must be want, reading or completed"),
});

router.use(protect);

router.get("/", getLibrary);
router.get("/:bookId", getEntry);
router.put("/:bookId", validate(statusSchema), setStatus);
router.delete("/:bookId", removeEntry);

export default router;