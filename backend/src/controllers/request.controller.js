import Book from "../models/Book.js";
import BookRequest, { REQUEST_STATUSES } from "../models/BookRequest.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import sendEmail from "../utils/sendEmail.js";
import { requestStatusEmail } from "../utils/emailTemplates.js";

const MAX_OPEN = 5; // open requests one user can have at the same time

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// POST /api/requests (logged-in users)
export const createRequest = asyncHandler(async (req, res) => {
  const { title, author = "", language, note = "" } = req.body;
  const titleMatch = new RegExp(`^${escapeRegex(title)}$`, "i");

  if (await Book.exists({ status: "approved", language, title: titleMatch })) {
    throw new ApiError(409, "This book is already in the library. Try searching for it on the Browse page.");
  }
  if (await BookRequest.exists({ user: req.user._id, status: "open", title: titleMatch })) {
    throw new ApiError(409, "You already have an open request for this book");
  }
  if ((await BookRequest.countDocuments({ user: req.user._id, status: "open" })) >= MAX_OPEN) {
    throw new ApiError(
      429,
      `You can have up to ${MAX_OPEN} open requests at a time. Wait for some to be answered, or cancel one.`
    );
  }

  const request = await BookRequest.create({ user: req.user._id, title, author, language, note });
  res.status(201).json({ success: true, request });
});

// GET /api/requests/mine (the user's own requests)
export const getMyRequests = asyncHandler(async (req, res) => {
  const requests = await BookRequest.find({ user: req.user._id }).sort("-createdAt").limit(100);
  res.json({ success: true, count: requests.length, requests });
});

// DELETE /api/requests/:id (cancel or remove one of your own requests)
export const deleteMyRequest = asyncHandler(async (req, res) => {
  const request = await BookRequest.findOne({ _id: req.params.id, user: req.user._id });
  if (!request) throw new ApiError(404, "Request not found");

  await request.deleteOne();
  res.json({ success: true, message: "Request removed" });
});

// GET /api/requests?status=open|fulfilled|declined (admin)
export const getAllRequests = asyncHandler(async (req, res) => {
  const status = REQUEST_STATUSES.includes(req.query.status) ? req.query.status : "open";

  const [requests, countAgg] = await Promise.all([
    BookRequest.find({ status })
      .sort(status === "open" ? "createdAt" : "-resolvedAt") // oldest open request first
      .limit(100)
      .populate("user", "name email"),
    BookRequest.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
  ]);

  const counts = { open: 0, fulfilled: 0, declined: 0 };
  countAgg.forEach((c) => (counts[c._id] = c.count));

  res.json({ success: true, counts, requests });
});

// PATCH /api/requests/:id  { status, adminNote } (admin)
export const resolveRequest = asyncHandler(async (req, res) => {
  const request = await BookRequest.findById(req.params.id).populate("user", "name email");
  if (!request) throw new ApiError(404, "Request not found");
  if (request.status !== "open") throw new ApiError(400, "This request was already answered");

  request.status = req.body.status;
  request.adminNote = req.body.adminNote || "";
  request.resolvedAt = new Date();
  await request.save();

  // Tell the requester. The response does not wait for the email
  if (request.user?.email) {
    void sendEmail({
      to: request.user.email,
      ...requestStatusEmail({
        name: request.user.name,
        title: request.title,
        status: request.status,
        note: request.adminNote,
      }),
    });
  }

  res.json({ success: true, request });
});