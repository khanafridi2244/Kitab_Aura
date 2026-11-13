import express from "express";
import "dotenv/config";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import connectDB from "./config/db.js";
import { seedDefaultBlogs } from "./utils/seedDefaultBlogs.js";

// ── Route imports ─────────────────────────────────────────────────────────────
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

// ── 1. Connect to MongoDB (cached for serverless reuse) ───────────────────────
connectDB()
  .then(() =>
    seedDefaultBlogs().catch((e) =>
      console.error("Initial blog seed warning:", e.message)
    )
  )
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
  });

// ── 2. App setup ──────────────────────────────────────────────────────────────
const app = express();
const isProduction = process.env.NODE_ENV === "production";

// Vercel runs behind a proxy; needed for secure cookies and correct IP detection
app.set("trust proxy", 1);

// ── 3. Security headers ───────────────────────────────────────────────────────
app.use(helmet());

// ── 4. CORS Configuration ─────────────────────────────────────────────────────
// Fixed origins always allowed (no trailing slash)
const defaultAllowedOrigins = [
  "https://kitab-aurafrontend.vercel.app",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
];

// Extra origins can be injected via env var (comma-separated)
const envAllowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((o) => o.trim())
  : [];

const allowedOrigins = [
  ...new Set([...defaultAllowedOrigins, ...envAllowedOrigins]),
].map((o) => o.replace(/\/$/, ""));

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (Postman, curl, mobile apps, server-side)
    if (!origin) return callback(null, true);

    const cleanOrigin = origin.replace(/\/$/, "");

    // Allow whitelisted exact origins
    const isWhitelisted = allowedOrigins.includes(cleanOrigin);

    // Allow ALL Vercel deployments (including preview URLs) for this project:
    //   e.g. kitab-aurafrontend-git-main-sikandars-projects-04a38874.vercel.app
    const isVercelPreview = /^https:\/\/kitab-aura[a-z0-9-]*\.vercel\.app$/.test(cleanOrigin);

    // Allow any localhost / 127.0.0.1 origin in any environment
    const isLocal =
      cleanOrigin.includes("localhost") || cleanOrigin.includes("127.0.0.1");

    if (isWhitelisted || isVercelPreview || isLocal) {
      callback(null, true);
    } else {
      console.warn(`[CORS Blocked] Origin: ${origin}`);
      callback(new Error(`CORS error: Origin ${origin} not allowed`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
  ],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // handle pre-flight for all routes

// ── 5. Body parsers ───────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(mongoSanitize());

// ── 6. Logging (dev only) ─────────────────────────────────────────────────────
if (!isProduction) {
  app.use(morgan("dev"));
}

// ── 7. Rate limiting ──────────────────────────────────────────────────────────
// Auth endpoints: max 20 attempts per 15 min (brute-force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts. Please try again in 15 minutes." },
});

// General API: max 200 requests per 15 min per IP
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests. Please slow down." },
});

app.use("/api/", generalLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// ── 8. Health check ───────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ success: true, message: "KitabAura API is running" });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "KitabAura API is running",
    env: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ── 9. API Routes ─────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/books/:bookId/reviews", reviewRoutes); // must stay above /api/books
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

// ── 10. Error handling (must stay last) ──────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── 11. Start server ──────────────────────────────────────────────────────────
// On Vercel (serverless) app.listen() must NOT be called — the app is exported
// directly as the request handler.  Locally it starts the HTTP server as normal.
const PORT = process.env.PORT || 5000;

if (process.env.VERCEL !== "1") {
  app.listen(PORT, () =>
    console.log(
      `🚀 KitabAura Server running on http://localhost:${PORT} [${process.env.NODE_ENV}]`
    )
  );
}

// Vercel uses this export as the serverless function handler
export default app;
