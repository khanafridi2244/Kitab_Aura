import { Router } from "express";
import { z } from "zod";
import {
  getPosts,
  getBlogCategories,
  getPostBySlug,
  adminList,
  adminGet,
  createPost,
  updatePost,
  setStatus,
  deletePost,
} from "../controllers/blog.controller.js";
import { protect, authorize } from "../middleware/auth.js";
import { uploadBlogImage } from "../middleware/upload.js";
import validate from "../middleware/validate.js";
import { BLOG_CATEGORIES } from "../models/BlogPost.js";

const router = Router();

const createSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(150, "Title is too long (max 150 characters)"),
  category: z.enum(BLOG_CATEGORIES, "Choose a valid category"),
  excerpt: z.string().max(300, "Excerpt is too long (max 300 characters)").optional(),
  content: z.string().max(50000, "Content is too long (max 50,000 characters)").optional(),
  status: z.enum(["draft", "published"], "Status must be draft or published").optional(),
  featuredImageUrl: z.string().trim().max(1000).optional(),
  seoTitle: z.string().trim().max(70, "SEO title is too long (max 70 characters)").optional(),
  seoDescription: z.string().trim().max(160, "SEO description is too long (max 160 characters)").optional(),
  removeImage: z.enum(["true", "false"], "Invalid value").optional(),
});
const updateSchema = createSchema.partial(); // every field optional when editing
const statusSchema = z.object({ status: z.enum(["draft", "published"], "Status must be draft or published") });

const admin = [protect, authorize("admin")];

// Public
router.get("/", getPosts);
router.get("/categories", getBlogCategories);

// Admin. These must stay above "/:slug"
router.get("/admin/list", ...admin, adminList);
router.get("/admin/:id", ...admin, adminGet);
router.post("/", ...admin, uploadBlogImage, validate(createSchema), createPost);
router.put("/:id", ...admin, uploadBlogImage, validate(updateSchema), updatePost);
router.patch("/:id/status", ...admin, validate(statusSchema), setStatus);
router.delete("/:id", ...admin, deletePost);

router.get("/:slug", getPostBySlug);

export default router;