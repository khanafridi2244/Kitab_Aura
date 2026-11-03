import Book from "../models/Book.js";
import ReadingProgress, { percentOf } from "../models/ReadingProgress.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

const BOOK_FIELDS = "title author language coverUrl avgRating ratingsCount downloads pages";

const format = (record, totalPages) => ({
  status: record.status,
  page: record.page,
  percent: percentOf(record, totalPages),
  completedAt: record.completedAt || null,
  updatedAt: record.updatedAt,
});

// GET /api/library - the user's whole reading list, most recently touched first
export const getLibrary = asyncHandler(async (req, res) => {
  const records = await ReadingProgress.find({ user: req.user._id })
    .sort("-updatedAt")
    .populate({ path: "book", match: { status: "approved" }, select: BOOK_FIELDS });

  // A book that was deleted or un-approved comes back as null, so it is skipped
  const items = records
    .filter((r) => r.book)
    .map((r) => ({ book: r.book, ...format(r, r.book.pages) }));

  res.json({ success: true, count: items.length, items });
});

// GET /api/library/:bookId - the user's entry for one book, or null
export const getEntry = asyncHandler(async (req, res) => {
  const record = await ReadingProgress.findOne({ user: req.user._id, book: req.params.bookId });
  if (!record) return res.json({ success: true, entry: null });

  const book = await Book.findById(req.params.bookId).select("pages");
  res.json({ success: true, entry: format(record, book?.pages) });
});

// PUT /api/library/:bookId  { status } - put a book on a shelf (creates the entry if needed)
export const setStatus = asyncHandler(async (req, res) => {
  const { bookId } = req.params;
  const { status } = req.body;

  const book = await Book.findOne({ _id: bookId, status: "approved" }).select("pages");
  if (!book) throw new ApiError(404, "Book not found");

  const update =
    status === "completed"
      ? { $set: { status, completedAt: new Date() } }
      : { $set: { status }, $unset: { completedAt: "" } };

  const record = await ReadingProgress.findOneAndUpdate(
    { user: req.user._id, book: bookId },
    update,
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  res.json({ success: true, entry: format(record, book.pages) });
});

// DELETE /api/library/:bookId - remove from the list (this also forgets the saved page)
export const removeEntry = asyncHandler(async (req, res) => {
  await ReadingProgress.deleteOne({ user: req.user._id, book: req.params.bookId });
  res.json({ success: true, message: "Removed from your reading list" });
});