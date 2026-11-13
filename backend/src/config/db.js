import mongoose from "mongoose";

// In a serverless environment (Vercel) each function invocation may reuse the
// same Node.js module cache.  We store the connection promise globally so that
// concurrent requests share one connection instead of opening a new one every
// time the module is re-evaluated.
let cached = global._mongooseConnection;

if (!cached) {
  cached = global._mongooseConnection = { conn: null, promise: null };
}

export default async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI is not defined in environment variables");

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(uri, {
        // Keep the connection alive between serverless invocations
        bufferCommands: false,
        serverSelectionTimeoutMS: 10000, // fail fast if Atlas is unreachable
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
      })
      .then((m) => {
        console.log(`MongoDB connected: ${m.connection.host}`);
        return m;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
