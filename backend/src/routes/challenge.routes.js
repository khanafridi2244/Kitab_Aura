import { Router } from "express";
import { getChallenges } from "../controllers/challenge.controller.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.get("/", protect, getChallenges);

export default router;