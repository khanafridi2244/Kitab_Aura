import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import mongoSanitize from "express-mongo-sanitize";
import authRoutes from "./routes/auth.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import bookRoutes from "./routes/book.routes.js";
import { notFound, errorHandler } from "./middleware/error.js";

const app = express();

app.use(helmet()); // safer HTTP headers
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
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
app.use("/api/books", bookRoutes);

// These two must stay last
app.use(notFound);
app.use(errorHandler);

export default app;