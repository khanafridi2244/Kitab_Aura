import "dotenv/config";
import connectDB from "./config/db.js";

connectDB()
  .then(() => console.log("Database test passed"))
  .catch((err) => {
    console.error("Failed to connect:", err.message);
    process.exit(1);
  });