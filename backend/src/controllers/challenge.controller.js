import UserBadge from "../models/UserBadge.js";
import asyncHandler from "../utils/asyncHandler.js";
import { BADGES, CHALLENGES, awardBadges, gatherStats } from "../services/challenges.js";

// GET /api/challenges - progress on every challenge and badge
export const getChallenges = asyncHandler(async (req, res) => {
  const stats = await gatherStats(req.user._id);
  const newBadges = await awardBadges(req.user._id, stats); // viewing the page also awards anything earned

  const owned = await UserBadge.find({ user: req.user._id }).select("badge awardedAt").lean();
  const awardedAt = new Map(owned.map((o) => [o.badge, o.awardedAt]));

  const challenges = CHALLENGES.map((c) => {
    const value = c.value(stats);
    return {
      key: c.key,
      title: c.title,
      description: c.description,
      period: c.period,
      unit: c.unit,
      target: c.target,
      progress: Math.min(value, c.target),
      completed: value >= c.target,
    };
  });

  const badges = BADGES.map((b) => ({
    key: b.key,
    title: b.title,
    description: b.description,
    unit: b.unit,
    target: b.target,
    progress: Math.min(b.value(stats), b.target),
    earned: awardedAt.has(b.key),
    awardedAt: awardedAt.get(b.key) || null,
  }));

  res.json({ success: true, challenges, badges, newBadges });
});