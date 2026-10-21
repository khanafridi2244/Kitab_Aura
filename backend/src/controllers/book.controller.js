import Book, { LANGUAGES } from "../models/Book.js";
import Category from "../models/Category.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadBuffer, deleteFile } from "../utils/cloudinaryUpload.js";

const PUBLIC_FIELDS = "-pdfUrl -pdfPublicId -coverPublicId -rejectNote";
const CATEGORY_FIELDS = "name nameUrdu namePashto slug";

const SORTS = {
  newest: "-createdAt",
  oldest: "createdAt",
  popular: "-downloads",
  rating: "-avgRating",
  title: "title",
};

// POST /api/books (logged-in users)
export const createBook = asyncHandler(async (req, res) => {
  const pdfFile = req.files?.pdf?.[0];
  const coverFile = req.files?.cover?.[0];
  if (!pdfFile) throw new ApiError(400, "PDF file is required");

  if (!(await Category.exists({ _id: req.body.category }))) {
    throw new ApiError(400, "Category does not exist");
  }

  const uploaded = []; // public ids, so we can clean up if something fails
  try {
    const pdf = await uploadBuffer(pdfFile.buffer, { folder: "kitabaura/pdfs" });
    uploaded.push(pdf.public_id);

    let cover;
    if (coverFile) {
      cover = await uploadBuffer(coverFile.buffer, {
        folder: "kitabaura/covers",
        transformation: [{ width: 600, crop: "limit" }],
      });
      uploaded.push(cover.public_id);
    }

    const book = await Book.create({
      ...req.body,
      pages: req.body.pages ?? pdf.pages,
      pdfUrl: pdf.secure_url,
      pdfPublicId: pdf.public_id,
      coverUrl: cover?.secure_url || "",
      coverPublicId: cover?.public_id || "",
      uploadedBy: req.user._id,
      // admin uploads go live immediately, everyone else waits for approval
      status: req.user.role === "admin" ? "approved" : "pending",
    });

    res.status(201).json({
      success: true,
      message: book.status === "approved" ? "Book published" : "Book submitted for approval",
      book,
    });
  } catch (err) {
    await Promise.all(uploaded.map(deleteFile)); // do not leave orphan files on Cloudinary
    throw err;
  }
});

// GET /api/books (public, approved books only)
// ?q=search &language=pashto &category=<id> &minRating=4 &sort=popular &page=1 &limit=12
export const getBooks = asyncHandler(async (req, res) => {
  const { q, language, category, minRating, sort } = req.query;
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12));

  const filter = { status: "approved" };
  if (q) filter.$text = { $search: String(q) };
  if (language) {
    if (!LANGUAGES.includes(String(language).toLowerCase())) throw new ApiError(400, "Invalid language");
    filter.language = String(language).toLowerCase();
  }
  if (category) filter.category = category;
  if (minRating) filter.avgRating = { $gte: Number(minRating) || 0 };

  const [total, books] = await Promise.all([
    Book.countDocuments(filter),
    Book.find(filter)
      .select(`${PUBLIC_FIELDS} -description`)
      .populate("category", CATEGORY_FIELDS)
      .sort(SORTS[sort] || SORTS.newest)
      .skip((page - 1) * limit)
      .limit(limit),
  ]);

  res.json({ success: true, total, page, pages: Math.ceil(total / limit), count: books.length, books });
});

// GET /api/books/:id (public, approved books only)
export const getBookById = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id)
    .select(PUBLIC_FIELDS)
    .populate("category", CATEGORY_FIELDS)
    .populate("uploadedBy", "name");

  if (!book || book.status !== "approved") throw new ApiError(404, "Book not found");
  res.json({ success: true, book });
});

// GET /api/books/mine (my uploads with their status)
export const getMyBooks = asyncHandler(async (req, res) => {
  const books = await Book.find({ uploadedBy: req.user._id })
    .select("-pdfPublicId -coverPublicId")
    .populate("category", CATEGORY_FIELDS)
    .sort("-createdAt");
  res.json({ success: true, count: books.length, books });
});

// GET /api/books/pending (admin: the approval queue)
export const getPendingBooks = asyncHandler(async (req, res) => {
  const books = await Book.find({ status: "pending" })
    .populate("category", CATEGORY_FIELDS)
    .populate("uploadedBy", "name email")
    .sort("createdAt");
  res.json({ success: true, count: books.length, books });
});

// PATCH /api/books/:id/status (admin: approve or reject)
export const updateBookStatus = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) throw new ApiError(404, "Book not found");

  book.status = req.body.status;
  book.rejectNote = req.body.status === "rejected" ? req.body.rejectNote : "";
  await book.save();

  res.json({ success: true, message: `Book ${book.status}`, book });
});

// DELETE /api/books/:id (admin or the uploader)
export const deleteBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) throw new ApiError(404, "Book not found");

  const isOwner = book.uploadedBy.equals(req.user._id);
  if (!isOwner && req.user.role !== "admin") throw new ApiError(403, "You do not have permission");

  await Promise.all([deleteFile(book.pdfPublicId), deleteFile(book.coverPublicId)]);
  await book.deleteOne();
  res.json({ success: true, message: "Book deleted" });

// POST /api/books/:id/download (logged-in users)
// Counts the download and returns the PDF link
export const downloadBook = asyncHandler(async (req, res) => {
  const book = await Book.findOneAndUpdate(
    { _id: req.params.id, status: "approved" },
    { $inc: { downloads: 1 } }, // atomic, so two simultaneous downloads are both counted
    { new: true }
  ).select("title pdfUrl downloads");

  if (!book) throw new ApiError(404, "Book not found");
  res.json({ success: true, title: book.title, downloads: book.downloads, url: book.pdfUrl });
});

// PUT /api/books/:id (admin or the uploader)
export const updateBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) throw new ApiError(404, "Book not found");

  const isAdmin = req.user.role === "admin";
  if (!book.uploadedBy.equals(req.user._id) && !isAdmin) {
    throw new ApiError(403, "You do not have permission");
  }

  if (req.body.category && !(await Category.exists({ _id: req.body.category }))) {
    throw new ApiError(400, "Category does not exist");
  }

  const pdfFile = req.files?.pdf?.[0];
  const coverFile = req.files?.cover?.[0];
  const newFiles = []; // clean these up if saving fails
  const oldFiles = []; // delete these once the new ones are saved

  try {
    if (pdfFile) {
      const pdf = await uploadBuffer(pdfFile.buffer, { folder: "kitabaura/pdfs" });
      newFiles.push(pdf.public_id);
      oldFiles.push(book.pdfPublicId);
      book.pdfUrl = pdf.secure_url;
      book.pdfPublicId = pdf.public_id;
      if (req.body.pages === undefined && pdf.pages) book.pages = pdf.pages;
    }

    if (coverFile) {
      const cover = await uploadBuffer(coverFile.buffer, {
        folder: "kitabaura/covers",
        transformation: [{ width: 600, crop: "limit" }],
      });
      newFiles.push(cover.public_id);
      oldFiles.push(book.coverPublicId);
      book.coverUrl = cover.secure_url;
      book.coverPublicId = cover.public_id;
    }

    // Only these fields can be edited
    for (const field of ["title", "author", "language", "category", "description", "pages"]) {
      if (req.body[field] !== undefined) book[field] = req.body[field];
    }

    // An edit by a normal user goes back to the approval queue
    if (!isAdmin) {
      book.status = "pending";
      book.rejectNote = "";
    }

    await book.save();
    await Promise.all(oldFiles.map(deleteFile));

    res.json({
      success: true,
      message: isAdmin ? "Book updated" : "Book updated and sent for re-approval",
      book,
    });
  } catch (err) {
    await Promise.all(newFiles.map(deleteFile));
    throw err;
  }
});

});