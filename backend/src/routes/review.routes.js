import { Router } from "express";
import { z } from "zod";
import { getReviews, getMyReview, saveReview, deleteReview } from "../controllers/review.controller.js";
import { protect } from "../middleware/auth.js";
import validate from "../middleware/validate.js";

// mergeParams lets this router read :bookId from the path it is mounted on
const router = Router({ mergeParams: true });

const reviewSchema = z.object({
  rating: z.coerce
    .number("Rating is required")
    .int("Rating must be a whole number")
    .min(1, "Rating must be between 1 and 5")
    .max(5, "Rating must be between 1 and 5"),
  comment: z.string().trim().max(1000, "Comment is too long (max 1000 characters)").optional(),
});

router.get("/", getReviews);
router.get("/mine", protect, getMyReview);
router.put("/", protect, validate(reviewSchema), saveReview);
router.delete("/:reviewId", protect, deleteReview);

export default router;