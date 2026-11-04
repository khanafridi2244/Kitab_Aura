import Book, { LANGUAGES } from "../models/Book.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { tzOffsetMs } from "../utils/dates.js";

const DAY_MS = 24 * 60 * 60 * 1000;
const ROW_SIZE = 10;
const COLLECTION_LANGUAGES = ["pashto", "urdu", "english"];
const COLLECTION_SIZE = 4;
const LIST_FIELDS = "title author language coverUrl avgRating ratingsCount downloads";
const PICK_FIELDS = `${LIST_FIELDS} description pages`;
const CATEGORY_FIELDS = "name nameUrdu namePashto slug";

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
  const offset = tzOffsetMs();
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

  const [pashto, urdu, trending, newest, ...collections] = await Promise.all([
    forLanguage("pashto"),
    forLanguage("urdu"),
    Book.find({ status: "approved" }).sort("-downloads -avgRating -createdAt").limit(ROW_SIZE).select(LIST_FIELDS),
    Book.find({ status: "approved" }).sort("-createdAt").limit(ROW_SIZE).select(LIST_FIELDS),
    ...COLLECTION_LANGUAGES.map((language) =>
      Book.find({ status: "approved", language })
        .sort("-downloads -avgRating -createdAt")
        .limit(COLLECTION_SIZE)
        .select(LIST_FIELDS)
    ),
  ]);

  const languages = Object.fromEntries(COLLECTION_LANGUAGES.map((l, i) => [l, collections[i]]));

  res.json({ success: true, daily: { bookOfTheDay, pashto, urdu }, trending, newest, languages });
});

const POPULAR_SORTS = {
  downloads: { sort: "-downloads -avgRating", extra: {} },
  rating: { sort: "-avgRating -ratingsCount", extra: { ratingsCount: { $gte: 1 } } },
  reviews: { sort: "-ratingsCount -avgRating", extra: { ratingsCount: { $gte: 1 } } },
};

// GET /api/home/popular (public) ?by=downloads|rating|reviews &language=pashto
export const getPopular = asyncHandler(async (req, res) => {
  const by = Object.hasOwn(POPULAR_SORTS, req.query.by) ? req.query.by : "downloads";
  const filter = { status: "approved", ...POPULAR_SORTS[by].extra };

  if (req.query.language) {
    const language = String(req.query.language).toLowerCase();
    if (!LANGUAGES.includes(language)) throw new ApiError(400, "Invalid language");
    filter.language = language;
  }

  const books = await Book.find(filter)
    .sort(POPULAR_SORTS[by].sort)
    .limit(20)
    .select(LIST_FIELDS)
    .populate("category", CATEGORY_FIELDS);

  res.json({ success: true, by, count: books.length, books });
});