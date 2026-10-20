import { z } from "zod";
import { LANGUAGES } from "../models/Book.js";

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid category");

// Forms send empty fields as "", so treat "" as "not provided"
const optionalPages = z.preprocess(
  (v) => (v === "" || v === undefined ? undefined : v),
  z.coerce.number().int().min(1, "Pages must be at least 1").optional()
);

export const createBookSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title is too long"),
  author: z.string().trim().min(1, "Author is required").max(100, "Author name is too long"),
  language: z.string().trim().toLowerCase().pipe(z.enum(LANGUAGES, "Choose a valid language")),
  category: objectId,
  description: z.string().trim().max(3000, "Description is too long").optional(),
  pages: optionalPages,
});

// For editing: every field becomes optional
export const updateBookSchema = createBookSchema.partial();

// Admin approves or rejects an upload
export const statusSchema = z
  .object({
    status: z.enum(["approved", "rejected"], "Status must be approved or rejected"),
    rejectNote: z.string().trim().max(300, "Note is too long").optional(),
  })
  .refine((d) => d.status !== "rejected" || d.rejectNote, "Please give a reason when rejecting a book");