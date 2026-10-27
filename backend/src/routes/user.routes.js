import { Router } from "express";
import { getFavorites, getFavoriteIds, toggleFavorite } from "../controllers/user.controller.js";
import { protect } from "../middleware/auth.js";

const router = Router();

// Everything here needs a logged-in user
router.use(protect);

router.get("/favorites", getFavorites);
router.get("/favorites/ids", getFavoriteIds);
router.post("/favorites/:bookId", toggleFavorite);

export default router;