import Book from "../models/Book.js";
import ReadingProgress, { percentOf } from "../models/ReadingProgress.js";
import ReadingLog from "../models/ReadingLog.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { dayKey } from "../utils/dates.js";
import { checkBadges } from "../services/challenges.js";

// Turning at most this many pages forward in one save counts as reading.
// A bigger jump (for example straight to the last page) is not counted
const MAX_STEP = 10;

// GET /api/reading/:bookId
// Gives a logged-in user the PDF link and the page they stopped at. Opening the reader marks the book as "reading"
export const getReading = asyncHandler(async (req, res) => {
  const book = await Book.findOne({ _id: req.params.bookId, status: "approved" }).select(
    "title author pdfUrl pages"
  );
  if (!book) throw new ApiError(404, "Book not found");

  // Atomic upsert: safe even if two requests arrive at the same moment
  const progress = await ReadingProgress.findOneAndUpdate(
    { user: req.user._id, book: book._id },
    { $setOnInsert: { page: 1, status: "reading" } },
    { upsert: true, new: true }
  );

  // A book on the "want to read" shelf moves to "reading" once it is opened
  if (progress.status === "want") {
    await ReadingProgress.updateOne({ _id: progress._id }, { $set: { status: "reading" } });
  }

  res.json({ success: true, book, lastPage: progress.page });
});

// PUT /api/reading/:bookId  { page }
export const saveProgress = asyncHandler(async (req, res) => {
  const { bookId } = req.params;

  const book = await Book.findOne({ _id: bookId, status: "approved" }).select("pages");
  if (!book) throw new ApiError(404, "Book not found");

  const { page } = req.body;
  const reachedEnd = !!book.pages && page >= book.pages;

  // A finished book stays finished, even if the user flips back to read it again
  const existing = await ReadingProgress.findOne({ user: req.user._id, book: bookId }).select("status page");
  const wasCompleted = existing?.status === "completed";
  const previousPage = existing?.page ?? 1;

  const set = { page, status: reachedEnd || wasCompleted ? "completed" : "reading" };
  if (reachedEnd && !wasCompleted) set.completedAt = new Date();

  const progress = await ReadingProgress.findOneAndUpdate(
    { user: req.user._id, book: bookId },
    { $set: set },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // Count the pages turned today (small forward steps only)
  const step = page - previousPage;
  const counted = step > 0 && step <= MAX_STEP;
  if (counted) {
    try {
      await ReadingLog.addPages(req.user._id, step, dayKey());
    } catch (err) {
      console.error("Reading log failed:", err.message); // never block saving the reader's place
    }
  }

  // Award any badge that was just earned
  let newBadges = [];
  if (counted || (reachedEnd && !wasCompleted)) {
    try {
      newBadges = await checkBadges(req.user._id);
    } catch (err) {
      console.error("Badge check failed:", err.message);
    }
  }

  res.json({
    success: true,
    page: progress.page,
    status: progress.status,
    percent: percentOf(progress, book.pages),
    newBadges,
  });
});