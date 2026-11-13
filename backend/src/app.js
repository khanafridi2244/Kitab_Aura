import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import mongoSanitize from "express-mongo-sanitize";
import authRoutes from "./routes/auth.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import bookRoutes from "./routes/book.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import userRoutes from "./routes/user.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import readingRoutes from "./routes/reading.routes.js";
import homeRoutes from "./routes/home.routes.js";
import libraryRoutes from "./routes/library.routes.js";
import activityRoutes from "./routes/activity.routes.js";
import challengeRoutes from "./routes/challenge.routes.js";
import requestRoutes from "./routes/request.routes.js";
import newsletterRoutes from "./routes/newsletter.routes.js";
import blogRoutes from "./routes/blog.routes.js";
import { notFound, errorHandler } from "./middleware/error.js";

const app = express();

// Vercel runs behind a proxy; needed for secure cookies
app.set("trust proxy", 1);

app.use(helmet());

// CLIENT_URL can hold one or more URLs separated by commas
const clientUrls = (process.env.CLIENT_URL || "")
  .split(",")
  .map((url) => url.trim().replace(/\/$/, ""))
  .filter(Boolean);

// Exact origins always allowed
const allowedOrigins = [
  "https://kitab-aurafrontend.vercel.app",
  "https://kitab-aurabackrend.vercel.app",
  ...clientUrls,
  "http://localhost:5173",
  "http://localhost:5174",
];

// Vercel generates preview-deployment URLs like:
//   kitab-aurafrontend-git-main-sikandars-projects-04a38874.vercel.app
// This regex allows ALL vercel.app preview URLs that belong to your project.
const vercelPreviewPattern = /^https:\/\/kitab-aura[a-z0-9-]*\.vercel\.app$/;

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (e.g. curl, Postman, mobile apps)
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.includes(origin) ||
        vercelPreviewPattern.test(origin)
      ) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(mongoSanitize());
if (process.env.NODE_ENV !== "production") app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({ success: true, message: "KitabAura API is running" });
});

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "KitabAura API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/books/:bookId/reviews", reviewRoutes); // must stay above the books line
app.use("/api/books", bookRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/reading", readingRoutes);
app.use("/api/home", homeRoutes);
app.use("/api/library", libraryRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/challenges", challengeRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/blog", blogRoutes);

// These two must stay last
app.use(notFound);
app.use(errorHandler);

export default app;