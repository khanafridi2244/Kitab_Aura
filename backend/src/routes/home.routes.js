import { Router } from "express";
import { getHome, getPopular } from "../controllers/home.controller.js";

const router = Router();

router.get("/", getHome);
router.get("/popular", getPopular);

export default router;