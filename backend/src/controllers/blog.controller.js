import BlogPost, { BLOG_CATEGORIES, categoryFromSlug, categorySlug } from "../models/BlogPost.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import slugify from "../utils/slugify.js";
import { uploadBuffer, deleteFile } from "../utils/cloudinaryUpload.js";

const LIST_FIELDS = "title slug excerpt featuredImageUrl category author publishedAt status updatedAt";
const RESERVED_SLUGS = new Set(["categories", "admin", "latest", "new"]); // would clash with routes
const MIN_CONTENT_TO_PUBLISH = 20;

// Removes control characters, keeps line breaks and tabs
const cleanText = (text = "") =>
  // eslint-disable-next-line no-control-regex
  String(text).replace(/\r\n/g, "\n").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");

const readingMinutes = (content = "") =>
  Math.max(1, Math.ceil(content.trim().split(/\s+/).filter(Boolean).length / 200));

// A unique, readable URL name for a new post
const makeSlug = async (title) => {
  let base = slugify(title) || "post";
  if (RESERVED_SLUGS.has(base)) base += "-post";
  let slug = base;
  let n = 2;
  while (await BlogPost.exists({ slug })) slug = `${base}-${n++}`;
  return slug;
};

const uploadImage = (file) =>
  uploadBuffer(file.buffer, {
    folder: "kitabaura/blog",
    transformation: [{ width: 1600, crop: "limit", quality: "auto" }],
  });

// A post needs an excerpt and real content before it can go public
const assertPublishable = ({ excerpt, content }) => {
  if (!excerpt?.trim() || (content || "").trim().length < MIN_CONTENT_TO_PUBLISH) {
    throw new ApiError(400, "Add an excerpt and some article content before publishing");
  }
};

/* ---------------- Public ---------------- */

// GET /api/blog ?category=reading-tips &page=1 &limit=9 (published posts only)
export const getPosts = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(24, Math.max(1, parseInt(req.query.limit) || 9));

  const filter = { status: "published" };
  if (req.query.category) {
    const name = categoryFromSlug(String(req.query.category));
    if (!name) throw new ApiError(400, "Invalid category");
    filter.category = name;
  }

  const [total, posts] = await Promise.all([
    BlogPost.countDocuments(filter),
    BlogPost.find(filter)
      .sort("-publishedAt")
      .skip((page - 1) * limit)
      .limit(limit)
      .select(LIST_FIELDS)
      .populate("author", "name"),
  ]);

  res.json({ success: true, total, page, pages: Math.ceil(total / limit), count: posts.length, posts });
});

// GET /api/blog/categories - every category with its number of published posts
export const getBlogCategories = asyncHandler(async (req, res) => {
  const agg = await BlogPost.aggregate([
    { $match: { status: "published" } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
  ]);
  const counts = new Map(agg.map((a) => [a._id, a.count]));

  const categories = BLOG_CATEGORIES.map((name) => ({
    name,
    slug: categorySlug(name),
    count: counts.get(name) || 0,
  }));
  res.json({ success: true, categories });
});

// GET /api/blog/:slug (a published post, with its content)
export const getPostBySlug = asyncHandler(async (req, res) => {
  const post = await BlogPost.findOne({ slug: req.params.slug, status: "published" }).populate("author", "name");
  if (!post) throw new ApiError(404, "Article not found");

  res.json({ success: true, post: { ...post.toObject(), readingMinutes: readingMinutes(post.content) } });
});

/* ---------------- Admin ---------------- */

// GET /api/blog/admin/list ?status=draft|published
export const adminList = asyncHandler(async (req, res) => {
  const status = ["draft", "published"].includes(req.query.status) ? req.query.status : null;

  const [posts, countAgg] = await Promise.all([
    BlogPost.find(status ? { status } : {}).sort("-updatedAt").limit(200).select(LIST_FIELDS),
    BlogPost.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
  ]);

  const counts = { draft: 0, published: 0 };
  countAgg.forEach((c) => (counts[c._id] = c.count));
  res.json({ success: true, counts, posts });
});

// GET /api/blog/admin/:id (any status, for the editor)
export const adminGet = asyncHandler(async (req, res) => {
  const post = await BlogPost.findById(req.params.id);
  if (!post) throw new ApiError(404, "Post not found");
  res.json({ success: true, post });
});

// POST /api/blog (multipart: fields plus an optional "image")
export const createPost = asyncHandler(async (req, res) => {
  const { title, category, status = "draft" } = req.body;
  const excerpt = cleanText(req.body.excerpt).trim();
  const content = cleanText(req.body.content);
  if (status === "published") assertPublishable({ excerpt, content });

  let image;
  try {
    if (req.file) image = await uploadImage(req.file);

    const featuredImageUrl = image?.secure_url || req.body.featuredImageUrl?.trim() || "";

    const post = await BlogPost.create({
      title,
      category,
      excerpt,
      content,
      slug: await makeSlug(title),
      seoTitle: req.body.seoTitle || "",
      seoDescription: req.body.seoDescription || "",
      author: req.user._id,
      status,
      publishedAt: status === "published" ? new Date() : undefined,
      featuredImageUrl,
      featuredImagePublicId: image?.public_id || "",
    });

    res.status(201).json({ success: true, post });
  } catch (err) {
    if (image) await deleteFile(image.public_id); // do not leave an orphan file on Cloudinary
    throw err;
  }
});

// PUT /api/blog/:id (multipart; send only the fields that changed)
export const updatePost = asyncHandler(async (req, res) => {
  const post = await BlogPost.findById(req.params.id);
  if (!post) throw new ApiError(404, "Post not found");

  const b = req.body;
  if (b.title !== undefined) post.title = b.title; // the URL name (slug) stays the same
  if (b.category !== undefined) post.category = b.category;
  if (b.excerpt !== undefined) post.excerpt = cleanText(b.excerpt).trim();
  if (b.content !== undefined) post.content = cleanText(b.content);
  if (b.seoTitle !== undefined) post.seoTitle = b.seoTitle;
  if (b.seoDescription !== undefined) post.seoDescription = b.seoDescription;

  const nextStatus = b.status ?? post.status;
  if (nextStatus === "published") {
    assertPublishable(post);
    if (!post.publishedAt) post.publishedAt = new Date();
  }
  post.status = nextStatus;

  const oldImageId = post.featuredImagePublicId;
  const replacing = !!req.file || b.removeImage === "true";
  let newImage;

  try {
    if (req.file) {
      newImage = await uploadImage(req.file);
      post.featuredImageUrl = newImage.secure_url;
      post.featuredImagePublicId = newImage.public_id;
    } else if (b.featuredImageUrl !== undefined) {
      post.featuredImageUrl = b.featuredImageUrl.trim();
      if (!b.featuredImageUrl.trim()) post.featuredImagePublicId = "";
    } else if (b.removeImage === "true") {
      post.featuredImageUrl = "";
      post.featuredImagePublicId = "";
    }
    await post.save();
  } catch (err) {
    if (newImage) await deleteFile(newImage.public_id);
    throw err;
  }

  if (replacing && oldImageId) await deleteFile(oldImageId); // only after the new data is safely saved
  res.json({ success: true, post });
});

// PATCH /api/blog/:id/status  { status }
export const setStatus = asyncHandler(async (req, res) => {
  const post = await BlogPost.findById(req.params.id);
  if (!post) throw new ApiError(404, "Post not found");

  if (req.body.status === "published") {
    assertPublishable(post);
    if (!post.publishedAt) post.publishedAt = new Date();
  }
  post.status = req.body.status;
  await post.save();

  res.json({ success: true, post });
});

// DELETE /api/blog/:id
export const deletePost = asyncHandler(async (req, res) => {
  const post = await BlogPost.findById(req.params.id);
  if (!post) throw new ApiError(404, "Post not found");

  await deleteFile(post.featuredImagePublicId);
  await post.deleteOne();
  res.json({ success: true, message: "Post deleted" });
});