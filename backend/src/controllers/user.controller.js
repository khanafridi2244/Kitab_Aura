import Book from "../models/Book.js";
import Category from "../models/Category.js";
import ReadingProgress from "../models/ReadingProgress.js";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

const LIST_FIELDS = "title author language coverUrl avgRating ratingsCount downloads category";
const RECOMMEND_COUNT = 6;

// GET /api/users/favorites/ids - just the ids (used to colour the heart button)
export const getFavoriteIds = (req, res) => {
  res.json({ success: true, ids: req.user.favorites.map(String) });
};

// GET /api/users/favorites - full book cards
export const getFavorites = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: "favorites",
    match: { status: "approved" }, // a book that was un-approved or deleted drops out of the list
    select: "title author language coverUrl avgRating ratingsCount downloads",
  });

  res.json({ success: true, count: user.favorites.length, books: user.favorites });
});

// POST /api/users/favorites/:bookId - add if missing, remove if already saved
export const toggleFavorite = asyncHandler(async (req, res) => {
  const { bookId } = req.params;

  if (!(await Book.exists({ _id: bookId, status: "approved" }))) {
    throw new ApiError(404, "Book not found");
  }

  const already = req.user.favorites.some((id) => id.equals(bookId));

  // $addToSet and $pull are atomic and never create duplicates
  await User.updateOne(
    { _id: req.user._id },
    already ? { $pull: { favorites: bookId } } : { $addToSet: { favorites: bookId } }
  );

  res.json({ success: true, favorited: !already });
});

// GET /api/users/preferences
export const getPreferences = (req, res) => {
  res.json({
    success: true,
    preferredLanguages: req.user.preferredLanguages,
    interests: req.user.interests.map(String),
  });
};

// PUT /api/users/preferences  { preferredLanguages: [...], interests: [categoryIds] }
export const updatePreferences = asyncHandler(async (req, res) => {
  const { preferredLanguages, interests } = req.body;

  if (interests.length && (await Category.countDocuments({ _id: { $in: interests } })) !== interests.length) {
    throw new ApiError(400, "One of the chosen topics does not exist");
  }

  await User.updateOne({ _id: req.user._id }, { $set: { preferredLanguages, interests } });
  res.json({ success: true, preferredLanguages, interests });
});

// GET /api/users/recommended
// Scores books by the user's chosen languages and topics, plus what they have read or saved
export const getRecommended = asyncHandler(async (req, res) => {
  const me = req.user;

  const library = await ReadingProgress.find({ user: me._id }).select("book").lean();
  const libraryIds = library.map((r) => r.book);
  const excluded = [...libraryIds, ...me.favorites]; // never recommend what they already have

  const history = await Book.find({ _id: { $in: excluded } }).select("language category").lean();

  // Languages and topics with weights: chosen ones count 3, each book in their history counts 1
  const langScore = new Map();
  const catScore = new Map();
  const bump = (map, key, n) => {
    if (key) map.set(String(key), (map.get(String(key)) || 0) + n);
  };
  me.preferredLanguages.forEach((l) => bump(langScore, l, 3));
  me.interests.forEach((c) => bump(catScore, c, 3));
  history.forEach((b) => {
    bump(langScore, b.language, 1);
    bump(catScore, b.category, 1);
  });

  const base = { status: "approved", uploadedBy: { $ne: me._id } };
  const signals = [];
  if (langScore.size) signals.push({ language: { $in: [...langScore.keys()] } });
  if (catScore.size) signals.push({ category: { $in: [...catScore.keys()] } });

  let picked = [];
  if (signals.length) {
    const candidates = await Book.find({ ...base, _id: { $nin: excluded }, $or: signals })
      .sort("-avgRating -downloads")
      .limit(40)
      .select(LIST_FIELDS)
      .lean();

    picked = candidates
      .map((b) => ({
        b,
        score:
          (langScore.get(b.language) || 0) +
          (catScore.get(String(b.category)) || 0) +
          b.avgRating / 5 +
          Math.min(b.downloads, 100) / 100,
      }))
      .sort((x, y) => y.score - x.score)
      .slice(0, RECOMMEND_COUNT)
      .map((x) => x.b);
  }

  const usedSignals = picked.length > 0;

  // Not enough matches (or no signals at all): fill up with popular books
  if (picked.length < RECOMMEND_COUNT) {
    const fill = await Book.find({ ...base, _id: { $nin: [...excluded, ...picked.map((b) => b._id)] } })
      .sort("-downloads -avgRating -createdAt")
      .limit(RECOMMEND_COUNT - picked.length)
      .select(LIST_FIELDS)
      .lean();
    picked = [...picked, ...fill];
  }

  const hasPrefs = me.preferredLanguages.length > 0 || me.interests.length > 0;
  const basis = !usedSignals ? "popular" : hasPrefs ? "preferences" : "activity";

  res.json({ success: true, basis, books: picked });
});