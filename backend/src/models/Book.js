import mongoose from "mongoose";

export const LANGUAGES = ["pashto", "urdu", "english", "arabic", "persian"];

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "Title is required"], trim: true, maxlength: 200 },
    author: { type: String, required: [true, "Author is required"], trim: true, maxlength: 100 },
    language: { type: String, required: [true, "Language is required"], enum: LANGUAGES, lowercase: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: [true, "Category is required"] },
    description: { type: String, trim: true, maxlength: 3000, default: "" },
    pages: { type: Number, min: 1 },

    // Files live on Cloudinary, we only store the link and the id (needed for deleting later)
    coverUrl: { type: String, default: "" },
    coverPublicId: { type: String, default: "" },
    pdfUrl: { type: String, required: [true, "PDF file is required"] },
    pdfPublicId: { type: String, required: true },

    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    rejectNote: { type: String, default: "" },

    avgRating: { type: Number, default: 0 },
    ratingsCount: { type: Number, default: 0 },
    downloads: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Full-text search. "none" turns off English stemming, which works better for Pashto and Urdu text
bookSchema.index(
  { title: "text", author: "text", description: "text" },
  { default_language: "none" }
);

// Speeds up the common filters on the browse page
bookSchema.index({ status: 1, language: 1, category: 1 });
bookSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model("Book", bookSchema);