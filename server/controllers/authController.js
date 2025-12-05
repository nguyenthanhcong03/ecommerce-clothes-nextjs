import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import AppError from "../utils/AppError.js";
import catchAsync from "../utils/catchAsync.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import { responseSuccess } from "../utils/responseHandler.js";
import { sendEmail } from "../utils/sendEmail.js";

const register = catchAsync(async (req, res) => {
  const { password, email, phone, firstName, lastName } = req.body;

  // Kiểm tra email đã tồn tại
  const existingUser = await User.exists({ email });
  if (existingUser) throw new AppError(400, "Email đã được sử dụng");

  // Hash password
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Tạo user mới
  const newUser = await User.create({
    email,
    password: hashedPassword,
    firstName,
    lastName,
    phone,
  });

  // Loại bỏ password
  const userResponse = newUser.toObject();
  delete userResponse.password;

  responseSuccess(res, 201, "Đăng ký tài khoản thành công", userResponse);
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  console.log("email :>> ", email);
  // Tìm user và bao gồm password để verify
  const user = await User.findOne({ email });
  if (!user) throw new AppError(401, "Email hoặc mật khẩu không chính xác");

  // Kiểm tra user có bị block không
  if (user.isBlocked) throw new AppError(403, "Tài khoản đã bị khóa");

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) throw new AppError(401, "Email hoặc mật khẩu không chính xác");

  const userPayload = { _id: user._id.toString(), role: user.role };

  // Tạo tokens
  const accessToken = generateAccessToken(userPayload);
  const refreshToken = generateRefreshToken(userPayload);

  // Lưu accessToken vào cookie
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    // secure: true,
    // sameSite: "Strict",
    maxAge: process.env.ACCESS_TOKEN_COOKIE_EXPIRES,
  });

  // Lưu refreshToken vào cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    // secure: true,
    // sameSite: "Strict",
    maxAge: process.env.REFRESH_TOKEN_COOKIE_EXPIRES,
  });

  // Loáº¡i bá» password khá»i response
  const userResponse = user.toObject();
  delete userResponse.password;

  responseSuccess(res, 200, "Đăng nhập thành công", {
    user: userResponse,
    accessToken,
    refreshToken,
  });
});

const getCurrentUser = catchAsync(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId).select("-password");
  if (!user) throw new AppError(404, "Không tìm thấy người dùng");

  responseSuccess(res, 200, "Lấy thông tin người dùng thành công", user);
});

const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new AppError(400, "Email là bắt buộc");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError(404, "Không tìm thấy tài khoản với email này");
  }

  // Tạo reset token
  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenExpiry = Date.now() + 10 * 60 * 1000; // 10 phút

  // Lưu token vào database (cần thêm field resetToken và resetTokenExpiry vào User model)
  user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  user.resetPasswordExpires = resetTokenExpiry;
  await user.save();

  // Gửi email
  const resetUrl = `${process.env.CLIENT_URL}/auth/reset-password?token=${resetToken}`;
  const message = `
    <h2>Đặt lại mật khẩu</h2>
    <p>Bạn đã yêu cầu đặt lại mật khẩu. Vui lòng click vào link dưới đây:</p>
    <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Đặt lại mật khẩu</a>
    <p>Link sẽ hết hạn sau 10 phút.</p>
  `;

  await sendEmail(user.email, "Đặt lại mật khẩu", message);

  responseSuccess(res, 200, "Đã gửi liên kết đặt lại mật khẩu đến email của bạn");
});

const confirmForgotPassword = catchAsync(async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    throw new AppError(400, "Token và mật khẩu mới là bắt buộc");
  }

  if (newPassword.length < 6) {
    throw new AppError(400, "Mật khẩu phải có ít nhất 6 ký tự");
  }

  // Hash token để so sánh
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  // Tìm user với token và chưa hết hạn
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError(400, "Token không hợp lệ hoặc đã hết hạn");
  }

  // Hash password mới
  const saltRounds = 10;
  user.password = await bcrypt.hash(newPassword, saltRounds);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();

  responseSuccess(res, 200, "Đặt lại mật khẩu thành công");
});

const changePassword = catchAsync(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  // Tìm user với password
  const user = await User.findById(req.user._id);
  if (!user) throw new AppError(404, "Không tìm thấy người dùng");

  // Verify old password
  const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
  if (!isOldPasswordValid) throw new AppError(400, "Mật khẩu cũ không đúng");

  // Hash new password
  const saltRounds = 10;
  user.password = await bcrypt.hash(newPassword, saltRounds);
  await user.save();

  responseSuccess(res, 200, "Đổi mật khẩu thành công");
});

const logout = catchAsync(async (req, res) => {
  // Xoá cookie
  res.clearCookie("accessToken", {
    httpOnly: true,
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
  });
  responseSuccess(res, 200, "Đăng xuất thành công");
});

const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) throw new AppError(401, "Không tìm thấy refresh token");
  // Verify refresh token
  const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

  // Tìm user
  const user = await User.findById(decoded._id);
  if (!user) throw new AppError(401, "Token không hợp lệ");

  // Tạo access token mới
  const userPayload = { _id: user._id.toString(), role: user.role };
  const newAccessToken = generateAccessToken(userPayload);

  // LÆ°u accessToken vÃ o cookie
  res.cookie("accessToken", newAccessToken, {
    httpOnly: true,
    maxAge: process.env.ACCESS_TOKEN_COOKIE_EXPIRES,
    // sameSite: "Strict", // Quan trá»ng náº¿u frontend/backend khÃ¡c domain
    // secure: true, // Báº¯t buá»™c náº¿u dÃ¹ng sameSite: "None"
  });

  responseSuccess(res, 200, "Làm mới token thành công", newAccessToken);
});

/**
 * Kiểm tra email đã tồn tại hay chưa
 */
const checkEmailExists = catchAsync(async (req, res) => {
  const { email } = req.params;
  const existingUser = await User.exists({ email });
  const emailExists = !!existingUser;

  responseSuccess(res, 200, "Kiểm tra email thành công", { emailExists });
});

export default {
  register,
  login,
  forgotPassword,
  changePassword,
  confirmForgotPassword,
  logout,
  refreshToken,
  getCurrentUser,
  checkEmailExists,
};
