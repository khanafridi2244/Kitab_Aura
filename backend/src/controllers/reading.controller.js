import Book from "../models/Book.js";
import ReadingProgress from "../models/ReadingProgress.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

// GET /api/reading/:bookId
// Gives a logged-in user the PDF link and the page they stopped at (reading is not counted as a download)
export const getReading = asyncHandler(async (req, res) => {
  const book = await Book.findOne({ _id: req.params.bookId, status: "approved" }).select(
    "title author pdfUrl pages"
  );
  if (!book) throw new ApiError(404, "Book not found");

  const progress = await ReadingProgress.findOne({ user: req.user._id, book: book._id }).select("page");

  res.json({ success: true, book, lastPage: progress?.page || 1 });
});

// PUT /api/reading/:bookId  { page }
export const saveProgress = asyncHandler(async (req, res) => {
  const { bookId } = req.params;

  if (!(await Book.exists({ _id: bookId, status: "approved" }))) {
    throw new ApiError(404, "Book not found");
  }

  const progress = await ReadingProgress.findOneAndUpdate(
    { user: req.user._id, book: bookId },
    { $set: { page: req.body.page } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  res.json({ success: true, page: progress.page });
});