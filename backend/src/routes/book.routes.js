import { Router } from "express";
import {
  createBook,
  getBooks,
  getBookById,
  getMyBooks,
  getPendingBooks,
  updateBookStatus,
  deleteBook,
} from "../controllers/book.controller.js";
import { protect, authorize } from "../middleware/auth.js";
import { uploadBookFiles } from "../middleware/upload.js";
import validate from "../middleware/validate.js";
import { createBookSchema, statusSchema } from "../validators/book.validators.js";

const router = Router();

router.get("/", getBooks);

// These must come BEFORE "/:id", otherwise "mine" would be read as an id
router.get("/mine", protect, getMyBooks);
router.get("/pending", protect, authorize("admin"), getPendingBooks);

router.get("/:id", getBookById);

// Order matters: login check, then file parsing, then validation of the text fields
router.post("/", protect, uploadBookFiles, validate(createBookSchema), createBook);
router.patch("/:id/status", protect, authorize("admin"), validate(statusSchema), updateBookStatus);
router.delete("/:id", protect, deleteBook);

export default router;