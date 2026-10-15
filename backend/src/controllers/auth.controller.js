import jwt from "jsonwebtoken";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  signAccessToken,
  signRefreshToken,
  refreshCookieOptions,
} from "../utils/generateToken.js";

// Sends both tokens: refresh token in a cookie, access token in JSON
const sendAuth = (res, user, status = 200) => {
  res.cookie("refreshToken", signRefreshToken(user._id), refreshCookieOptions());
  res.status(status).json({
    success: true,
    accessToken: signAccessToken(user._id),
    user: user.toSafeObject(),
  });
};

// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (await User.findOne({ email })) {
    throw new ApiError(409, "Email already registered");
  }

  // role is never taken from the request, so everyone starts as "user"
  const user = await User.create({ name, email, password });
  sendAuth(res, user, 201);
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.matchPassword(password))) {
    throw new ApiError(401, "Invalid email or password");
  }

  sendAuth(res, user);
});

// POST /api/auth/refresh - get a new access token using the refresh cookie
export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) throw new ApiError(401, "Refresh token missing");

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw new ApiError(401, "Refresh token invalid or expired");
  }

  const user = await User.findById(decoded.id);
  if (!user) throw new ApiError(401, "User no longer exists");

  res.json({
    success: true,
    accessToken: signAccessToken(user._id),
    user: user.toSafeObject(),
  });
});

// POST /api/auth/logout
export const logout = (req, res) => {
  const { maxAge, ...options } = refreshCookieOptions();
  res.clearCookie("refreshToken", options);
  res.json({ success: true, message: "Logged out" });
};

// GET /api/auth/me
export const getMe = (req, res) => {
  res.json({ success: true, user: req.user.toSafeObject() });
};