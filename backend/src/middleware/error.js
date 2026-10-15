export const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Route not found: ${req.method} ${req.originalUrl}`));
};

export const errorHandler = (err, req, res, next) => {
  let status = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
  let message = err.message || "Server error";

  // Duplicate value (for example, an email that already exists)
  if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `${field} already exists`;
  }

  // Invalid MongoDB ID
  if (err.name === "CastError") {
    status = 400;
    message = "Invalid ID";
  }

  // Mongoose validation errors
  if (err.name === "ValidationError") {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(", ");
  }

  if (status >= 500) console.error(err);

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== "production" && status >= 500 ? { stack: err.stack } : {}),
  });
};