import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 60 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book" }],
    avatar: { type: String, default: "" },
    uiLanguage: { type: String, enum: ["en", "ur", "ps"], default: "en" },
  },
  { timestamps: true }
);

// Hash the password before saving (only when it was changed)
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Compare a typed password with the stored hash
userSchema.methods.matchPassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

// Data that is safe to send to the frontend (no password)
userSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    avatar: this.avatar,
    uiLanguage: this.uiLanguage,
    createdAt: this.createdAt,
  };
};

export default mongoose.model("User", userSchema);