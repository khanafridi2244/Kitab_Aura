import Book from "../models/Book.js";
import User from "../models/User.js";
import Category from "../models/Category.js";
import asyncHandler from "../utils/asyncHandler.js";

const MONTHS_SHOWN = 6;

// GET /api/admin/stats (admin only)
export const getStats = asyncHandler(async (req, res) => {
  // First day of the month, 5 months ago (UTC, to match MongoDB's $year and $month)
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (MONTHS_SHOWN - 1), 1));

  // Independent queries run at the same time
  const [statusCounts, downloadsAgg, users, categories, languageAgg, monthlyAgg, topBooks] =
    await Promise.all([
      Book.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Book.aggregate([
        { $match: { status: "approved" } },
        { $group: { _id: null, total: { $sum: "$downloads" } } },
      ]),
      User.countDocuments(),
      Category.countDocuments(),
      Book.aggregate([
        { $match: { status: "approved" } },
        { $group: { _id: "$language", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Book.aggregate([
        { $match: { createdAt: { $gte: start } } },
        {
          $group: {
            _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
      ]),
      Book.find({ status: "approved" })
        .sort("-downloads")
        .limit(5)
        .select("title author language downloads"),
    ]);

  const byStatus = { approved: 0, pending: 0, rejected: 0 };
  statusCounts.forEach((s) => (byStatus[s._id] = s.count));

  // Fill months that have no uploads with 0, so the chart always shows 6 bars
  const monthly = [];
  for (let i = 0; i < MONTHS_SHOWN; i++) {
    const d = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + i, 1));
    const found = monthlyAgg.find(
      (m) => m._id.year === d.getUTCFullYear() && m._id.month === d.getUTCMonth() + 1
    );
    monthly.push({
      label: d.toLocaleString("en-US", { month: "short", timeZone: "UTC" }),
      count: found ? found.count : 0,
    });
  }

  res.json({
    success: true,
    stats: {
      books: { ...byStatus, total: byStatus.approved + byStatus.pending + byStatus.rejected },
      users,
      categories,
      downloads: downloadsAgg[0]?.total || 0,
      byLanguage: languageAgg.map((l) => ({ language: l._id, count: l.count })),
      monthly,
      topBooks,
    },
  });
});