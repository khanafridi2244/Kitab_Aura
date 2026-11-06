import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import sendEmail from "../utils/sendEmail.js";
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

// POST /api/auth/forgot-password
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email?.trim()) throw new ApiError(400, "Email is required");

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    // For privacy, don't disclose whether email exists
    return res.json({
      success: true,
      message: "If that email is registered, password reset instructions have been sent.",
    });
  }

  // Generate 20-byte token
  const resetToken = crypto.randomBytes(20).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpire = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save({ validateBeforeSave: false });

  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const resetUrl = `${clientUrl}/login?resetToken=${resetToken}`;

  const message = `You requested a password reset for your KitabAura account.\n\nPlease reset your password by clicking the link below:\n\n${resetUrl}\n\nThis link will expire in 1 hour.\nIf you did not request this, please ignore this email.`;

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0d8c4; border-radius: 8px;">
      <h2 style="color: #0f4c3a;">KitabAura Password Reset</h2>
      <p>You requested a password reset for your account (<strong>${user.email}</strong>).</p>
      <p>Click the button below to set a new password. This link is valid for 1 hour.</p>
      <div style="margin: 25px 0;">
        <a href="${resetUrl}" style="background-color: #0f4c3a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
          Reset My Password
        </a>
      </div>
      <p style="font-size: 12px; color: #5d6a63;">Or copy and paste this URL into your browser:<br/><a href="${resetUrl}" style="color: #0f4c3a;">${resetUrl}</a></p>
      <hr style="border: none; border-top: 1px solid #e0d8c4; margin: 20px 0;" />
      <p style="font-size: 12px; color: #5d6a63;">If you did not request this, you can safely ignore this email.</p>
    </div>
  `;

  const emailSent = await sendEmail({
    to: user.email,
    subject: "KitabAura - Password Reset Request",
    text: message,
    html,
  });

  res.json({
    success: true,
    message: "If that email is registered, password reset instructions have been sent.",
    resetToken: !emailSent ? resetToken : undefined,
    resetUrl: !emailSent ? resetUrl : undefined,
  });
});

// POST /api/auth/reset-password
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  if (!token?.trim()) throw new ApiError(400, "Reset token is required");
  if (!password || password.length < 8) throw new ApiError(400, "Password must be at least 8 characters");

  const hashedToken = crypto.createHash("sha256").update(token.trim()).digest("hex");
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  }).select("+password +resetPasswordToken +resetPasswordExpire");

  if (!user) throw new ApiError(400, "Invalid or expired reset token. Please request a new link.");

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendAuth(res, user);
});