import { Router } from "express";
import { z } from "zod";
import {
  createRequest,
  getMyRequests,
  deleteMyRequest,
  getAllRequests,
  resolveRequest,
} from "../controllers/request.controller.js";
import { protect, authorize } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { LANGUAGES } from "../models/Book.js";

const router = Router();

const createSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title is too long"),
  author: z.string().trim().max(100, "Author name is too long").optional(),
  language: z.string().trim().toLowerCase().pipe(z.enum(LANGUAGES, "Choose a valid language")),
  note: z.string().trim().max(500, "Note is too long (max 500 characters)").optional(),
});

const resolveSchema = z
  .object({
    status: z.enum(["fulfilled", "declined"], "Status must be fulfilled or declined"),
    adminNote: z.string().trim().max(300, "Note is too long (max 300 characters)").optional(),
  })
  .refine((d) => d.status !== "declined" || d.adminNote, "Please give a reason when declining a request");

router.use(protect);

// Every logged-in user
router.get("/mine", getMyRequests);
router.post("/", validate(createSchema), createRequest);
router.delete("/:id", deleteMyRequest);

// Admin only
router.get("/", authorize("admin"), getAllRequests);
router.patch("/:id", authorize("admin"), validate(resolveSchema), resolveRequest);

export default router;