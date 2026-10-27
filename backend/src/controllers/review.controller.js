import Book from "../models/Book.js";
import Review from "../models/Review.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

// Reviews only exist for published books
const ensurePublicBook = async (bookId) => {
  if (!(await Book.exists({ _id: bookId, status: "approved" }))) {
    throw new ApiError(404, "Book not found");
  }
};

// GET /api/books/:bookId/reviews (public) ?page=1&limit=10
export const getReviews = asyncHandler(async (req, res) => {
  const { bookId } = req.params;
  await ensurePublicBook(bookId);

  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));

  const [total, reviews] = await Promise.all([
    Review.countDocuments({ book: bookId }),
    Review.find({ book: bookId })
      .sort("-createdAt")
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("user", "name"),
  ]);

  res.json({ success: true, total, page, pages: Math.ceil(total / limit), reviews });
});

// GET /api/books/:bookId/reviews/mine (logged-in user's own review, or null)
export const getMyReview = asyncHandler(async (req, res) => {
  const review = await Review.findOne({ book: req.params.bookId, user: req.user._id }).populate("user", "name");
  res.json({ success: true, review });
});

// PUT /api/books/:bookId/reviews - creates the review, or updates it if the user already wrote one
export const saveReview = asyncHandler(async (req, res) => {
  const { bookId } = req.params;
  await ensurePublicBook(bookId);

  const { rating, comment = "" } = req.body;

  const review = await Review.findOneAndUpdate(
    { book: bookId, user: req.user._id },
    { $set: { rating, comment } },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
  ).populate("user", "name");

  await Review.recalculate(bookId);
  res.json({ success: true, review });
});

// DELETE /api/books/:bookId/reviews/:reviewId (the author or an admin)
export const deleteReview = asyncHandler(async (req, res) => {
  const { bookId, reviewId } = req.params;

  const review = await Review.findById(reviewId);
  if (!review || review.book.toString() !== bookId) throw new ApiError(404, "Review not found");

  if (!review.user.equals(req.user._id) && req.user.role !== "admin") {
    throw new ApiError(403, "You do not have permission");
  }

  await review.deleteOne();
  await Review.recalculate(bookId);
  res.json({ success: true, message: "Review deleted" });
});