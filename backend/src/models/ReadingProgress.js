import mongoose from "mongoose";

export const READING_STATUSES = ["want", "reading", "completed"];

const readingProgressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    book: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
    page: { type: Number, required: true, min: 1, default: 1 },
    // Records saved before this batch have no status, Mongoose reads them as "reading"
    status: { type: String, enum: READING_STATUSES, default: "reading" },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

// One record per user per book
readingProgressSchema.index({ user: 1, book: 1 }, { unique: true });
readingProgressSchema.index({ user: 1, updatedAt: -1 });

// Percent finished. null means we cannot tell (the book has no page count)
export const percentOf = (record, totalPages) => {
  if (record.status === "completed") return 100;
  if (record.status === "want") return 0;
  if (!totalPages) return null;
  return Math.min(100, Math.round((record.page / totalPages) * 100));
};

export default mongoose.model("ReadingProgress", readingProgressSchema);