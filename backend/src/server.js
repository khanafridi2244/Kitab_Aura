import "dotenv/config";
import app from "./app.js";
import connectDB from "./config/db.js";
import { seedDefaultBlogs } from "./utils/seedDefaultBlogs.js";

// Connect to MongoDB (cached for serverless reuse)
const dbReady = connectDB()
  .then(async () => {
    await seedDefaultBlogs().catch((e) =>
      console.error("Initial blog seed warning:", e.message)
    );
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
  });

const PORT = process.env.PORT || 5000;

// When running locally (not on Vercel), start the HTTP server normally.
// On Vercel the module is imported as a serverless function — app.listen()
// must NOT be called in that environment.
if (process.env.VERCEL !== "1") {
  dbReady.then(() => {
    app.listen(PORT, () =>
      console.log(`Server running on http://localhost:${PORT}`)
    );
  });
}

// Vercel needs the Express app exported as the default export.
export default app;
