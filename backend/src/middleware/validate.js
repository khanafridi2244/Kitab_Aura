import ApiError from "../utils/ApiError.js";

// Usage: router.post("/register", validate(registerSchema), register)
export default (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const message = result.error.issues.map((i) => i.message).join(", ");
    return next(new ApiError(400, message));
  }

  req.body = result.data; // replace with the cleaned values
  next();
};