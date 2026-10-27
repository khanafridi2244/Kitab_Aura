import mongoose from "mongoose";
import Book from "./Book.js";

const reviewSchema = new mongoose.Schema(
  {
    book: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be between 1 and 5"],
      max: [5, "Rating must be between 1 and 5"],
    },
    comment: { type: String, trim: true, maxlength: 1000, default: "" },
  },
  { timestamps: true }
);

// One review per user per book, enforced by the database itself
reviewSchema.index({ book: 1, user: 1 }, { unique: true });
reviewSchema.index({ book: 1, createdAt: -1 });

// Recount the average from the reviews, so the book's numbers can never drift out of sync
reviewSchema.statics.recalculate = async function (bookId) {
  const [agg] = await this.aggregate([
    { $match: { book: new mongoose.Types.ObjectId(bookId) } },
    { $group: { _id: "$book", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  await Book.findByIdAndUpdate(bookId, {
    avgRating: agg ? Math.round(agg.avg * 10) / 10 : 0,
    ratingsCount: agg ? agg.count : 0,
  });
};

export default mongoose.model("Review", reviewSchema);