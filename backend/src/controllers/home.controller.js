import Book from "../models/Book.js";
import asyncHandler from "../utils/asyncHandler.js";

const DAY_MS = 24 * 60 * 60 * 1000;
const ROW_SIZE = 6;
const LIST_FIELDS = "title author language coverUrl avgRating ratingsCount downloads";
const PICK_FIELDS = `${LIST_FIELDS} description pages`;
const CATEGORY_FIELDS = "name nameUrdu namePashto slug";

// Hours ahead of UTC that decide when "a new day" starts (Pakistan = 5). Change it with DAILY_TZ_OFFSET_HOURS in .env
const dayOffsetMs = () => {
  const raw = process.env.DAILY_TZ_OFFSET_HOURS;
  const hours = raw !== undefined && raw !== "" && Number.isFinite(Number(raw)) ? Number(raw) : 5;
  return hours * 60 * 60 * 1000;
};

// Picks one book for the day. The same day always gives the same book, so no extra storage is needed
const pick = async (base, dayNumber, startOfToday, excludeId) => {
  const filter = { ...base, status: "approved" };
  if (excludeId) filter._id = { $ne: excludeId };

  // Prefer books that existed before today, so approving a book during the day does not change the pick
  let pool = { ...filter, createdAt: { $lt: startOfToday } };
  let count = await Book.countDocuments(pool);
  if (count === 0) {
    pool = filter;
    count = await Book.countDocuments(pool);
  }
  if (count === 0) return null;

  const index = ((dayNumber % count) + count) % count;
  return Book.findOne(pool)
    .sort("_id") // a fixed order, so the index always points at the same book
    .skip(index)
    .select(PICK_FIELDS)
    .populate("category", CATEGORY_FIELDS);
};

// GET /api/home (public)
export const getHome = asyncHandler(async (req, res) => {
  const offset = dayOffsetMs();
  // ?shiftDays=1 previews tomorrow's picks while testing (ignored in production)
  const shift = process.env.NODE_ENV === "production" ? 0 : parseInt(req.query.shiftDays) || 0;
  const dayNumber = Math.floor((Date.now() + offset) / DAY_MS) + shift;
  const startOfToday = new Date(dayNumber * DAY_MS - offset);

  const bookOfTheDay = await pick({}, dayNumber, startOfToday);
  const exclude = bookOfTheDay?._id;

  // Avoid showing the Book of the Day twice, unless it is the only book in that language
  const forLanguage = async (language) =>
    (await pick({ language }, dayNumber, startOfToday, exclude)) ||
    (await pick({ language }, dayNumber, startOfToday));

  const [pashto, urdu, trending, newest] = await Promise.all([
    forLanguage("pashto"),
    forLanguage("urdu"),
    Book.find({ status: "approved" }).sort("-downloads -avgRating -createdAt").limit(ROW_SIZE).select(LIST_FIELDS),
    Book.find({ status: "approved" }).sort("-createdAt").limit(ROW_SIZE).select(LIST_FIELDS),
  ]);

  res.json({ success: true, daily: { bookOfTheDay, pashto, urdu }, trending, newest });
});