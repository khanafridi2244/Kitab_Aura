import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Category name is required"], unique: true, trim: true, maxlength: 50 },
    nameUrdu: { type: String, trim: true, default: "" },
    namePashto: { type: String, trim: true, default: "" },
    slug: { type: String, unique: true, lowercase: true },
  },
  { timestamps: true }
);

// Build the slug from the English name: "Islamic Studies" -> "islamic-studies"
categorySchema.pre("validate", function () {
  if (this.isModified("name")) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }
});

export default mongoose.model("Category", categorySchema);