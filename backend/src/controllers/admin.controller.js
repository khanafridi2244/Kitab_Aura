import mongoose from "mongoose";
import Book from "../models/Book.js";
import User from "../models/User.js";
import Category from "../models/Category.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import {
  searchInternetArchive,
  searchGoogleBooks,
  searchOpenLibrary,
  getArchiveItemDetails,
  SUPPORTED_EXTERNAL_CATEGORIES,
  findCategoryDef,
} from "../services/externalBooks.service.js";

const MONTHS_SHOWN = 6;

// GET /api/admin/stats (admin only)
export const getStats = asyncHandler(async (req, res) => {
  // First day of the month, 5 months ago (UTC, to match MongoDB's $year and $month)
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (MONTHS_SHOWN - 1), 1));

  // Independent queries run at the same time
  const [statusCounts, downloadsAgg, users, categories, languageAgg, monthlyAgg, topBooks] =
    await Promise.all([
      Book.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Book.aggregate([
        { $match: { status: "approved" } },
        { $group: { _id: null, total: { $sum: "$downloads" } } },
      ]),
      User.countDocuments(),
      Category.countDocuments(),
      Book.aggregate([
        { $match: { status: "approved" } },
        { $group: { _id: "$language", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Book.aggregate([
        { $match: { createdAt: { $gte: start } } },
        {
          $group: {
            _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
      ]),
      Book.find({ status: "approved" })
        .sort("-downloads")
        .limit(5)
        .select("title author language downloads"),
    ]);

  const byStatus = { approved: 0, pending: 0, rejected: 0 };
  statusCounts.forEach((s) => (byStatus[s._id] = s.count));

  // Fill months that have no uploads with 0, so the chart always shows 6 bars
  const monthly = [];
  for (let i = 0; i < MONTHS_SHOWN; i++) {
    const d = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + i, 1));
    const found = monthlyAgg.find(
      (m) => m._id.year === d.getUTCFullYear() && m._id.month === d.getUTCMonth() + 1
    );
    monthly.push({
      label: d.toLocaleString("en-US", { month: "short", timeZone: "UTC" }),
      count: found ? found.count : 0,
    });
  }

  res.json({
    success: true,
    stats: {
      books: { ...byStatus, total: byStatus.approved + byStatus.pending + byStatus.rejected },
      users,
      categories,
      downloads: downloadsAgg[0]?.total || 0,
      byLanguage: languageAgg.map((l) => ({ language: l._id, count: l.count })),
      monthly,
      topBooks,
    },
  });
});

// GET /api/admin/external-books/categories (admin only)
// Returns list of supported external categories with multi-language labels and query metadata
export const getExternalCategories = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    categories: SUPPORTED_EXTERNAL_CATEGORIES,
  });
});

// GET /api/admin/external-books/search (admin only)
// Query params: q, language (urdu|pashto|english|all), category (biography|novel|art-culture|business-management|children-s-books|computer-science|dictionaries|drama-plays|economics), source (archive|google|openlibrary), page, limit
export const searchExternalBooks = asyncHandler(async (req, res) => {
  const { q = "", language = "all", category = "", source = "archive", page = 1, limit = 16 } = req.query;

  let result;
  if (source === "google") {
    result = await searchGoogleBooks({ query: q, language, category, page, limit });
  } else if (source === "openlibrary") {
    result = await searchOpenLibrary({ query: q, language, category, page, limit });
  } else {
    // Default: Internet Archive (has full readable PDFs for Urdu, Pashto, English)
    result = await searchInternetArchive({ query: q, language, category, page, limit });
  }

  // Cross-reference with our existing books in MongoDB to see which books are already in the website library
  if (result.books && result.books.length > 0) {
    const titles = result.books.map((b) => b.title.trim());
    const extPublicIds = result.books.map((b) => `ext_${b.externalId}`);

    const existingBooks = await Book.find({
      $or: [
        { pdfPublicId: { $in: extPublicIds } },
        { title: { $in: titles } },
      ],
    }).select("_id title pdfPublicId");

    const existingMap = new Map();
    existingBooks.forEach((eb) => {
      if (eb.pdfPublicId) existingMap.set(eb.pdfPublicId, String(eb._id));
      if (eb.title) existingMap.set(eb.title.toLowerCase(), String(eb._id));
    });

    result.books = result.books.map((b) => {
      const byId = existingMap.get(`ext_${b.externalId}`);
      const byTitle = existingMap.get(b.title.toLowerCase());
      const existingId = byId || byTitle;
      return {
        ...b,
        alreadyImported: !!existingId,
        existingBookId: existingId || null,
      };
    });
  }

  res.json({
    success: true,
    source,
    language,
    category: result.category || category || null,
    categoryInfo: result.categoryInfo || null,
    ...result,
  });
});

// GET /api/admin/external-books/details?identifier=...
export const getExternalBookDetails = asyncHandler(async (req, res) => {
  const { identifier } = req.query;
  if (!identifier) throw new ApiError(400, "Identifier is required");

  const details = await getArchiveItemDetails(identifier);
  if (!details) throw new ApiError(404, "Could not resolve item details");

  res.json({ success: true, details });
});

// POST /api/admin/external-books/import (admin only)
// Body: { title, author, language, category, description, coverUrl, pdfUrl, pages, externalId }
export const importExternalBook = asyncHandler(async (req, res) => {
  const {
    title,
    author,
    language,
    category,
    description = "",
    coverUrl = "",
    pdfUrl,
    pages,
    externalId = "",
  } = req.body;

  if (!title?.trim()) throw new ApiError(400, "Title is required");
  if (!author?.trim()) throw new ApiError(400, "Author is required");
  if (!language?.trim()) throw new ApiError(400, "Language is required");
  if (!category) throw new ApiError(400, "Category is required");
  if (!pdfUrl?.trim()) throw new ApiError(400, "PDF URL is required");

  // Validate or resolve category (accepts ObjectId, slug, or name)
  let categoryDoc = null;
  if (mongoose.Types.ObjectId.isValid(category)) {
    categoryDoc = await Category.findById(category);
  }
  if (!categoryDoc) {
    categoryDoc = await Category.findOne({
      $or: [
        { slug: String(category).toLowerCase() },
        { name: new RegExp(`^${category}$`, "i") },
      ],
    });
  }
  if (!categoryDoc) {
    // Also try checking category aliases from SUPPORTED_EXTERNAL_CATEGORIES
    const def = findCategoryDef(category);
    if (def) {
      categoryDoc = await Category.findOne({
        $or: [
          { slug: def.key },
          { name: new RegExp(`^${def.label}$`, "i") },
        ],
      });
    }
  }

  if (!categoryDoc) {
    throw new ApiError(400, "Selected category does not exist in library");
  }

  const cleanLang = language.toLowerCase().trim();
  const validLanguages = ["pashto", "urdu", "english", "arabic", "persian"];
  if (!validLanguages.includes(cleanLang)) {
    throw new ApiError(400, `Invalid language. Must be one of: ${validLanguages.join(", ")}`);
  }

  const pdfPublicId = externalId ? `ext_${externalId}` : `ext_${Date.now()}`;

  // Check if already imported by publicId
  const existing = await Book.findOne({ pdfPublicId });
  if (existing) {
    return res.status(200).json({
      success: true,
      message: "This book is already in your library",
      book: existing,
      alreadyExisted: true,
    });
  }

  const book = await Book.create({
    title: title.trim().substring(0, 200),
    author: author.trim().substring(0, 100),
    language: cleanLang,
    category: categoryDoc._id,
    description: description.trim().substring(0, 3000),
    pages: pages ? Math.max(1, parseInt(pages, 10)) : undefined,
    coverUrl: coverUrl.trim(),
    coverPublicId: "",
    pdfUrl: pdfUrl.trim(),
    pdfPublicId,
    uploadedBy: req.user._id,
    status: "approved", // Admin-imported books are published immediately
  });

  const populated = await Book.findById(book._id).populate("category", "name nameUrdu namePashto slug");

  res.status(201).json({
    success: true,
    message: `"${book.title}" was added to the website library!`,
    book: populated,
  });
});
