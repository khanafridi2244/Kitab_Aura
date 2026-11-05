import mongoose from "mongoose";
import { LANGUAGES } from "./Book.js";

export const REQUEST_STATUSES = ["open", "fulfilled", "declined", "seeking_copy"];

const bookRequestSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: [true, "Title is required"], trim: true, maxlength: 200 },
    author: { type: String, trim: true, maxlength: 100, default: "" },
    language: { type: String, required: [true, "Language is required"], enum: LANGUAGES, lowercase: true },
    note: { type: String, trim: true, maxlength: 500, default: "" },

    status: { type: String, enum: REQUEST_STATUSES, default: "open" },
    adminNote: { type: String, trim: true, maxlength: 300, default: "" },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

bookRequestSchema.index({ user: 1, createdAt: -1 });
bookRequestSchema.index({ status: 1, createdAt: 1 });

export default mongoose.model("BookRequest", bookRequestSchema);