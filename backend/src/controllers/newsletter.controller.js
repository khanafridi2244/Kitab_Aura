import Subscriber from "../models/Subscriber.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

// POST /api/newsletter  { email, consent }
export const subscribe = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const existing = await Subscriber.findOne({ email }).select("active");

  if (!existing) {
    try {
      await Subscriber.create({ email });
    } catch (err) {
      if (err.code !== 11000) throw err; // two quick submissions, the other one already saved it
    }
  } else if (!existing.active) {
    existing.active = true; // they are coming back
    existing.consentAt = new Date();
    existing.unsubscribedAt = undefined;
    await existing.save();
  }

  // Always the same answer, so the form cannot be used to check whether an email is subscribed
  res.json({ success: true, message: "Thank you! You are subscribed." });
});

// POST /api/newsletter/unsubscribe  { token }
export const unsubscribe = asyncHandler(async (req, res) => {
  const subscriber = await Subscriber.findOne({ unsubscribeToken: req.body.token }).select("active");
  if (!subscriber) throw new ApiError(404, "This unsubscribe link is not valid");

  if (subscriber.active) {
    subscriber.active = false;
    subscriber.unsubscribedAt = new Date();
    await subscriber.save();
  }
  res.json({ success: true, message: "You have been unsubscribed." });
});

// GET /api/newsletter (admin) - active subscribers, newest first
export const listSubscribers = asyncHandler(async (req, res) => {
  const [count, subscribers] = await Promise.all([
    Subscriber.countDocuments({ active: true }),
    Subscriber.find({ active: true }).sort("-createdAt").limit(500).select("email createdAt"),
  ]);
  res.json({ success: true, count, subscribers });
});