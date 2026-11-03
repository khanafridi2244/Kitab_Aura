import { Router } from "express";
import { z } from "zod";
import {
  getFavorites,
  getFavoriteIds,
  toggleFavorite,
  getPreferences,
  updatePreferences,
  getRecommended,
} from "../controllers/user.controller.js";
import { protect } from "../middleware/auth.js";
import validate from "../middleware/validate.js";

const router = Router();

const LANGUAGES = ["pashto", "urdu", "english", "arabic", "persian"];

const preferencesSchema = z.object({
  preferredLanguages: z
    .array(z.enum(LANGUAGES, "Choose valid languages"))
    .max(5, "Too many languages")
    .transform((list) => [...new Set(list)]),
  interests: z
    .array(z.string().regex(/^[a-f\d]{24}$/i, "Invalid topic"))
    .max(20, "Choose up to 20 topics")
    .transform((list) => [...new Set(list)]),
});

// Everything here needs a logged-in user
router.use(protect);

router.get("/favorites", getFavorites);
router.get("/favorites/ids", getFavoriteIds);
router.post("/favorites/:bookId", toggleFavorite);

router.get("/preferences", getPreferences);
router.put("/preferences", validate(preferencesSchema), updatePreferences);

router.get("/recommended", getRecommended);

export default router;