import mongoose from "mongoose";

export const BLOG_CATEGORIES = [
  "Book Reviews",
  "Pashto Literature",
  "Urdu Literature",
  "English Literature",
  "Reading Tips",
  "Famous Authors",
  "Education and Learning",
  "Literary News",
];

// "Education and Learning" -> "education-and-learning" (used in URLs)
export const categorySlug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const categoryFromSlug = (slug) => BLOG_CATEGORIES.find((c) => categorySlug(c) === slug);

const blogPostSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "Title is required"], trim: true, maxlength: 150 },
    slug: { type: String, required: true, unique: true, lowercase: true },
    excerpt: { type: String, trim: true, maxlength: 300, default: "" },
    content: { type: String, default: "", maxlength: 50000 }, // plain text, never HTML
    featuredImageUrl: { type: String, default: "" },
    featuredImagePublicId: { type: String, default: "" },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: String, enum: BLOG_CATEGORIES, required: [true, "Category is required"] },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    publishedAt: { type: Date },
    seoTitle: { type: String, trim: true, maxlength: 70, default: "" },
    seoDescription: { type: String, trim: true, maxlength: 160, default: "" },
  },
  { timestamps: true }
);

blogPostSchema.index({ status: 1, publishedAt: -1 });
blogPostSchema.index({ status: 1, category: 1, publishedAt: -1 });

export default mongoose.model("BlogPost", blogPostSchema);