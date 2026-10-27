import Book from "../models/Book.js";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

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