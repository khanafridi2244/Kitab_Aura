import { Router } from "express";
import {
  getStats,
  getExternalCategories,
  searchExternalBooks,
  getExternalBookDetails,
  importExternalBook,
} from "../controllers/admin.controller.js";
import { protect, authorize } from "../middleware/auth.js";

const router = Router();

// Every route in this file needs a logged-in admin
router.use(protect, authorize("admin"));

router.get("/stats", getStats);
router.get("/external-books/categories", getExternalCategories);
router.get("/external-books/search", searchExternalBooks);
router.get("/external-books/details", getExternalBookDetails);
router.post("/external-books/import", importExternalBook);

export default router;