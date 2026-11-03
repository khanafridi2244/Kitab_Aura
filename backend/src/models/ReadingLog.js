import mongoose from "mongoose";

// One record per user per day: how many pages they read that day
const readingLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ }, // "YYYY-MM-DD"
  pages: { type: Number, default: 0, min: 0 },
});

readingLogSchema.index({ user: 1, date: 1 }, { unique: true });

// Add pages to today's record, creating it if needed
readingLogSchema.statics.addPages = async function (userId, pages, date) {
  const run = () => this.updateOne({ user: userId, date }, { $inc: { pages } }, { upsert: true });
  try {
    await run();
  } catch (err) {
    // Two requests created today's record at the same moment, the second one just retries
    if (err.code === 11000) await run();
    else throw err;
  }
};

export default mongoose.model("ReadingLog", readingLogSchema);