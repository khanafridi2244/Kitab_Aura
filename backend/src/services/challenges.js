import ReadingLog from "../models/ReadingLog.js";
import ReadingProgress from "../models/ReadingProgress.js";
import UserBadge from "../models/UserBadge.js";
import { dayKey, weekStartKey, tzOffsetMs } from "../utils/dates.js";

// Challenges repeat: they reset every day, week or month.
// To change a goal, edit the "target" number
export const CHALLENGES = [
  {
    key: "daily-pages",
    title: "20 pages today",
    description: "Read 20 pages today.",
    period: "day",
    unit: "pages",
    target: 20,
    value: (s) => s.todayPages,
  },
  {
    key: "weekly-days",
    title: "Read 5 days this week",
    description: "Read on 5 different days between Monday and Sunday.",
    period: "week",
    unit: "days",
    target: 5,
    value: (s) => s.weekDays,
  },
  {
    key: "monthly-book",
    title: "Finish a book this month",
    description: "Complete one book this month.",
    period: "month",
    unit: "books",
    target: 1,
    value: (s) => s.monthCompleted,
  },
  {
    key: "monthly-pashto",
    title: "Three Pashto books",
    description: "Complete three Pashto books this month.",
    period: "month",
    unit: "books",
    target: 3,
    value: (s) => s.monthPashtoCompleted,
  },
  {
    key: "monthly-authors",
    title: "Explore 5 new authors",
    description: "Start books by 5 authors you had not read before this month.",
    period: "month",
    unit: "authors",
    target: 5,
    value: (s) => s.monthNewAuthors,
  },
];

// Badges are earned once and kept forever
export const BADGES = [
  {
    key: "beginner-reader",
    title: "Beginner Reader",
    description: "Read your first 10 pages.",
    unit: "pages",
    target: 10,
    value: (s) => s.totalPages,
  },
  {
    key: "book-explorer",
    title: "Book Explorer",
    description: "Start reading 5 different books.",
    unit: "books",
    target: 5,
    value: (s) => s.libraryCount,
  },
  {
    key: "weekly-reader",
    title: "Weekly Reader",
    description: "Read on 5 different days in one week.",
    unit: "days",
    target: 5,
    value: (s) => s.weekDays,
  },
  {
    key: "reading-champion",
    title: "Reading Champion",
    description: "Finish 5 books.",
    unit: "books",
    target: 5,
    value: (s) => s.completedTotal,
  },
];

// Collects the numbers every challenge and badge is measured against
export async function gatherStats(userId) {
  const today = dayKey();
  const weekStart = weekStartKey(today);
  // The first moment of this month in the site's time zone, as a real Date
  const monthStart = new Date(Date.parse(`${today.slice(0, 8)}01T00:00:00Z`) - tzOffsetMs());

  const [todayLog, weekDays, totalAgg, records] = await Promise.all([
    ReadingLog.findOne({ user: userId, date: today }).select("pages").lean(),
    ReadingLog.countDocuments({
      user: userId,
      date: { $gte: weekStart, $lte: today },
      pages: { $gt: 0 },
    }),
    ReadingLog.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, pages: { $sum: "$pages" } } },
    ]),
    ReadingProgress.find({ user: userId, status: { $in: ["reading", "completed"] } })
      .select("status createdAt completedAt book")
      .populate({ path: "book", select: "language author" })
      .limit(1000)
      .lean(),
  ]);

  const library = records.filter((r) => r.book); // skips books that were deleted
  const completed = library.filter((r) => r.status === "completed");
  const monthDone = completed.filter((r) => r.completedAt && r.completedAt >= monthStart);

  // "New author" = an author whose book was started this month and none before this month
  // (a book counts as started when it was added to the library as "reading" or "completed")
  const authorOf = (r) => r.book.author.trim().toLowerCase();
  const knownBefore = new Set(library.filter((r) => r.createdAt < monthStart).map(authorOf));
  const newAuthors = new Set(
    library.filter((r) => r.createdAt >= monthStart).map(authorOf).filter((a) => !knownBefore.has(a))
  );

  return {
    todayPages: todayLog?.pages || 0,
    weekDays,
    totalPages: totalAgg[0]?.pages || 0,
    libraryCount: library.length,
    completedTotal: completed.length,
    monthCompleted: monthDone.length,
    monthPashtoCompleted: monthDone.filter((r) => r.book.language === "pashto").length,
    monthNewAuthors: newAuthors.size,
  };
}

// Gives the user every badge they have earned and do not have yet. Returns the new ones
export async function awardBadges(userId, stats) {
  const newly = [];

  for (const badge of BADGES) {
    if (badge.value(stats) < badge.target) continue;

    try {
      // upsert + $setOnInsert is atomic: only the request that creates the record reports it as new
      const result = await UserBadge.updateOne(
        { user: userId, badge: badge.key },
        { $setOnInsert: { awardedAt: new Date() } },
        { upsert: true }
      );
      if (result.upsertedCount === 1) newly.push({ key: badge.key, title: badge.title });
    } catch (err) {
      if (err.code !== 11000) throw err; // two requests raced to create it, the other one wins
    }
  }

  return newly;
}

// Convenience: measure and award in one go
export const checkBadges = async (userId) => awardBadges(userId, await gatherStats(userId));