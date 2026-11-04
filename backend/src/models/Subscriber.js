import crypto from "crypto";
import mongoose from "mongoose";

const subscriberSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
    active: { type: Boolean, default: true },
    consentAt: { type: Date, default: Date.now },
    unsubscribedAt: { type: Date },
    // For the unsubscribe link in future emails. Hidden from normal queries
    unsubscribeToken: {
      type: String,
      default: () => crypto.randomBytes(24).toString("hex"),
      select: false,
      unique: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Subscriber", subscriberSchema);