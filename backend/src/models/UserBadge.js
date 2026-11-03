import mongoose from "mongoose";

// One record per badge a user has earned
const userBadgeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  badge: { type: String, required: true }, // the badge key, for example "book-explorer"
  awardedAt: { type: Date, default: Date.now },
});

// A user can earn each badge only once
userBadgeSchema.index({ user: 1, badge: 1 }, { unique: true });

export default mongoose.model("UserBadge", userBadgeSchema);