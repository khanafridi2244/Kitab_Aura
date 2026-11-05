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

app.use(helmet()); // safer HTTP headers
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:5173",
  "http://localhost:5173",
  "http://localhost:5174",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (e.g. mobile apps, curl)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
    credentials: true, // allow the refresh cookie
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(mongoSanitize()); // blocks NoSQL injection like {"$gt": ""}
if (process.env.NODE_ENV !== "production") app.use(morgan("dev"));

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