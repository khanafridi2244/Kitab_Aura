import Category from "../models/Category.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import Book from "../models/Book.js";

// GET /api/categories (public)
// GET /api/categories (public)  ?counts=true adds the number of published books in each category
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort("name").lean();

  if (req.query.counts === "true") {
    const agg = await Book.aggregate([
      { $match: { status: "approved" } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);
    const byId = new Map(agg.map((a) => [String(a._id), a.count]));
    categories.forEach((c) => {
      c.bookCount = byId.get(String(c._id)) || 0;
    });

    // Aggregate sub-disciplines into Education parent category
    const educationCat = categories.find((c) => c.slug === "education");
    if (educationCat) {
      const subSlugs = ["computer-science", "mathematics", "textbooks", "science"];
      const subCats = categories.filter((c) => subSlugs.includes(c.slug));
      const subCount = subCats.reduce((sum, c) => sum + (c.bookCount || 0), 0);
      educationCat.bookCount = (educationCat.bookCount || 0) + subCount;
    }
  }

  res.json({ success: true, count: categories.length, categories });
});

// POST /api/categories (admin)
export const createCategory = asyncHandler(async (req, res) => {
  const { name, nameUrdu, namePashto } = req.body;
  const category = await Category.create({ name, nameUrdu, namePashto });
  res.status(201).json({ success: true, category });
});

// PUT /api/categories/:id (admin)
export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new ApiError(404, "Category not found");

  const { name, nameUrdu, namePashto } = req.body;
  if (name !== undefined) category.name = name;
  if (nameUrdu !== undefined) category.nameUrdu = nameUrdu;
  if (namePashto !== undefined) category.namePashto = namePashto;

  await category.save(); // saving (not findByIdAndUpdate) keeps the slug in sync
  res.json({ success: true, category });
});

// DELETE /api/categories/:id (admin)
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new ApiError(404, "Category not found");

  if (await Book.exists({ category: category._id })) {
    throw new ApiError(400, "Cannot delete a category that still has books");
  }

  await category.deleteOne();
  res.json({ success: true, message: "Category deleted" });
});