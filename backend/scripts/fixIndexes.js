import "dotenv/config";
import mongoose from "mongoose";
import Book from "../src/models/Book.js";

try {
  await mongoose.connect(process.env.MONGO_URI);

  // Remove every old index (the default _id index is always kept)
  try {
    await Book.collection.dropIndexes();
    console.log("Old indexes dropped");
  } catch (err) {
    console.log("Nothing to drop:", err.message);
  }

  // Recreate the indexes from the current model
  await Book.syncIndexes();

  const indexes = await Book.collection.indexes();
  console.log(
    JSON.stringify(
      indexes.map((i) => ({
        name: i.name,
        default_language: i.default_language,
        language_override: i.language_override,
      })),
      null,
      2
    )
  );
} catch (err) {
  console.error("Error:", err.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}