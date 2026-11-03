import ReadingLog from "../models/ReadingLog.js";
import ReadingProgress from "../models/ReadingProgress.js";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import { dayKey, addDays, weekStartKey } from "../utils/dates.js";

// GET /api/activity - streaks, today's pages, weekly goal and the last 7 days
export const getActivity = asyncHandler(async (req, res) => {
  const today = dayKey();

  const [logs, totalAgg, booksCompleted] = await Promise.all([
    ReadingLog.find({ user: req.user._id }).sort("-date").limit(730).select("date pages").lean(),
    ReadingLog.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: null, pages: { $sum: "$pages" } } },
    ]),
    ReadingProgress.countDocuments({ user: req.user._id, status: "completed" }),
  ]);

  const pagesByDate = new Map(logs.map((l) => [l.date, l.pages]));

  // Current streak: counts back from today. If nothing was read yet today, yesterday keeps it alive
  let cursor = pagesByDate.has(today) ? today : addDays(today, -1);
  let current = 0;
  while (pagesByDate.has(cursor)) {
    current++;
    cursor = addDays(cursor, -1);
  }

  // Best streak: the longest run of consecutive days
  const ascending = logs.map((l) => l.date).reverse();
  let best = 0;
  let run = 0;
  ascending.forEach((d, i) => {
    run = i > 0 && d === addDays(ascending[i - 1], 1) ? run + 1 : 1;
    best = Math.max(best, run);
  });

  // This week (Monday to today)
  const weekStart = weekStartKey(today);
  const weekPages = logs
    .filter((l) => l.date >= weekStart && l.date <= today)
    .reduce((sum, l) => sum + l.pages, 0);
  const goal = req.user.weeklyGoal || 0;

  // Last 7 days, oldest first, with 0 for days without reading
  const last7 = [];
  for (let i = 6; i >= 0; i--) {
    const date = addDays(today, -i);
    last7.push({
      date,
      label: new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" }),
      pages: pagesByDate.get(date) || 0,
    });
  }

  res.json({
    success: true,
    activity: {
      today: { date: today, pages: pagesByDate.get(today) || 0 },
      streak: { current, best },
      week: {
        start: weekStart,
        pages: weekPages,
        goal,
        percent: goal ? Math.min(100, Math.round((weekPages / goal) * 100)) : null,
      },
      last7,
      totals: { pages: totalAgg[0]?.pages || 0, booksCompleted },
    },
  });
});

// PUT /api/activity/goal  { weeklyGoal } - pages per week, 0 removes the goal
export const setGoal = asyncHandler(async (req, res) => {
  const { weeklyGoal } = req.body;
  await User.updateOne({ _id: req.user._id }, { $set: { weeklyGoal } });
  res.json({ success: true, weeklyGoal });
});