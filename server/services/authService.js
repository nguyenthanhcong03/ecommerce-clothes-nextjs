import User from "../models/user.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { sendEmail } from "./emailService.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import AppError from "../utils/AppError.js";

// Kiá»ƒm tra email Ä‘Ã£ tá»“n táº¡i hay chÆ°a
const checkEmailExists = async (email) => {
  const user = await User.findOne({ email });
  if (user) throw new AppError(400, "Email Ä‘Ã£ Ä‘Æ°á»£c sá»­ dá»¥ng");
  return email;
};

const registerUser = async (userData) => {
  const { password, email, phone, firstName, lastName } = userData;

  // Kiá»ƒm tra email Ä‘Ã£ tá»“n táº¡i
  const existedEmail = await User.findOne({ email });
  if (existedEmail) throw new AppError(400, "Email Ä‘Ã£ Ä‘Æ°á»£c sá»­ dá»¥ng");

  // Kiá»ƒm tra phonenumber Ä‘Ã£ tá»“n táº¡i
  const existedPhone = await User.findOne({ phone });
  if (existedPhone) throw new AppError(400, "Sá»‘ Ä‘iá»‡n thoáº¡i Ä‘Ã£ Ä‘Æ°á»£c sá»­ dá»¥ng");

  // MÃ£ hÃ³a máº­t kháº©u
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  // Táº¡o ngÆ°á»i dÃ¹ng má»›i
  const newUser = await User.create({
    email,
    phone,
    password: hashedPassword,
    firstName,
    lastName,
  });

  return newUser;
};

/**
 * ÄÄƒng nháº­p ngÆ°á»i dÃ¹ng
 */
const loginUser = async (userData) => {
  const { email, password } = userData;

  // TÃ¬m ngÆ°á»i dÃ¹ng
  const user = await User.findOne({ email });
  if (!user) throw new AppError(400, "ThÃ´ng tin Ä‘Äƒng nháº­p khÃ´ng há»£p lá»‡");

  // Kiá»ƒm tra máº­t kháº©u
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new AppError("ThÃ´ng tin Ä‘Äƒng nháº­p khÃ´ng há»£p lá»‡");

  // Kiá»ƒm tra tráº¡ng thÃ¡i tÃ i khoáº£n
  if (user.isBlocked) {
    throw new AppError(400, "TÃ i khoáº£n cá»§a báº¡n Ä‘Ã£ bá»‹ khÃ³a. Vui lÃ²ng liÃªn há»‡ quáº£n trá»‹ viÃªn.");
  }

  // Táº¡o tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  const response = {
    user: {
      _id: user._id,
      email: user.email,
      role: user.role,
      lastName: user.lastName,
      firstName: user.firstName,
    },
    accessToken,
    refreshToken,
  };

  return response;
};

/**
 * Xá»­ lÃ½ quÃªn máº­t kháº©u
 */
const forgotUserPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("KhÃ´ng tÃ¬m tháº¥y email");
  }

  // Táº¡o reset token
  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = Date.now() + 3600000; // Háº¿t háº¡n sau 1 giá»
  await user.save();

  // Gá»­i email reset
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
  const html = `
    <h1>Äáº·t láº¡i máº­t kháº©u</h1>
    <p>Nháº¥p vÃ o liÃªn káº¿t bÃªn dÆ°á»›i Ä‘á»ƒ Ä‘áº·t láº¡i máº­t kháº©u cá»§a báº¡n:</p>
    <a href="${resetUrl}">Äáº·t láº¡i máº­t kháº©u</a>
    <p>LiÃªn káº¿t nÃ y sáº½ háº¿t háº¡n sau 1 giá».</p>
  `;
  await sendEmail(email, "YÃªu cáº§u Ä‘áº·t láº¡i máº­t kháº©u", html);

  return true;
};

/**
 * XÃ¡c nháº­n Ä‘áº·t láº¡i máº­t kháº©u
 */
const confirmResetPassword = async (token, newPassword) => {
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new Error("Token Ä‘áº·t láº¡i khÃ´ng há»£p lá»‡ hoáº·c Ä‘Ã£ háº¿t háº¡n");
  }

  // MÃ£ hÃ³a máº­t kháº©u má»›i
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  return true;
};

/**
 * Thay Ä‘á»•i máº­t kháº©u
 */
const changeUserPassword = async (userId, oldPassword, newPassword) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("NgÆ°á»i dÃ¹ng khÃ´ng tá»“n táº¡i");
  }

  // Kiá»ƒm tra máº­t kháº©u cÅ©
  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    throw new Error("Máº­t kháº©u cÅ© khÃ´ng Ä‘Ãºng");
  }
  console.log("Ä‘Ãºng");

  // MÃ£ hÃ³a máº­t kháº©u má»›i
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  await user.save();

  return true;
};

/**
 * LÃ m má»›i access token
 */
const refreshUserToken = async (refreshToken) => {
  const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
  const user = await User.findById(decoded._id);
  if (!user) throw new AppError(404, "NgÆ°á»i dÃ¹ng khÃ´ng tá»“n táº¡i");

  // Táº¡o access token má»›i
  const newAccessToken = generateAccessToken(user);
  return newAccessToken;
};

/**
 * Láº¥y thÃ´ng tin ngÆ°á»i dÃ¹ng hiá»‡n táº¡i
 */
const getCurrentUserById = async (userId) => {
  const user = await User.findById(userId).select("-password -createdAt -updatedAt");
  if (!user) throw new AppError(404, "NgÆ°á»i dÃ¹ng khÃ´ng tá»“n táº¡i");
  return user;
};

export default {
  registerUser,
  loginUser,
  forgotUserPassword,
  confirmResetPassword,
  changeUserPassword,
  refreshUserToken,
  getCurrentUserById,
  checkEmailExists,
};
