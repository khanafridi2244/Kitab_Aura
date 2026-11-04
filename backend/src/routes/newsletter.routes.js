import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { subscribe, unsubscribe, listSubscribers } from "../controllers/newsletter.controller.js";
import { protect, authorize } from "../middleware/auth.js";
import validate from "../middleware/validate.js";

const router = Router();

// At most 10 attempts per hour per IP, so the form cannot be used to flood the database
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts, please try again later" },
});

const subscribeSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address").max(254, "Email is too long"),
  consent: z.literal(true, "Please agree to receive updates"),
});

const unsubscribeSchema = z.object({
  token: z.string().regex(/^[a-f0-9]{48}$/, "This unsubscribe link is not valid"),
});

router.post("/", limiter, validate(subscribeSchema), subscribe);
router.post("/unsubscribe", limiter, validate(unsubscribeSchema), unsubscribe);
router.get("/", protect, authorize("admin"), listSubscribers);

export default router;