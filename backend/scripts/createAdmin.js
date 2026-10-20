import "dotenv/config";
import mongoose from "mongoose";
import User from "../src/models/User.js";

const { MONGO_URI, ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

try {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD in .env first");
  }

  await mongoose.connect(MONGO_URI);

  const email = ADMIN_EMAIL.toLowerCase();
  const existing = await User.findOne({ email });

  if (existing) {
    existing.role = "admin";
    await existing.save();
    console.log(`Existing user ${email} is now an admin`);
  } else {
    await User.create({
      name: ADMIN_NAME || "Admin",
      email,
      password: ADMIN_PASSWORD,
      role: "admin",
    });
    console.log(`Admin created: ${email}`);
  }
} catch (err) {
  console.error("Error:", err.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}