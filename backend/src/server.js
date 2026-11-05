import "dotenv/config";
import app from "./app.js";
import connectDB from "./config/db.js";
import { seedDefaultBlogs } from "./utils/seedDefaultBlogs.js";

const PORT = process.env.PORT || 5000;

connectDB()
  .then(async () => {
    await seedDefaultBlogs().catch((e) => console.error("Initial blog seed warning:", e.message));
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  });