import bcrypt from "bcryptjs";
import User from "../models/user.js";
import AppError from "../utils/AppError.js";
import catchAsync from "../utils/catchAsync.js";
import { responseSuccess } from "../utils/responseHandler.js";

const getAllUsers = catchAsync(async (req, res) => {
  const { page, limit, sortBy, sortOrder, role, isBlocked, search } = req.query;
  const filters = {};
  const options = {
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 5,
    sortBy: sortBy || "createdAt",
    sortOrder: sortOrder === "asc" ? 1 : -1,
  };

  // Build filters
  if (role) {
    filters.role = role;
  }

  if (isBlocked !== undefined) {
    filters.isBlocked = isBlocked === "true";
  }

  if (search) {
    filters.$or = [
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  // Calculate pagination
  const skip = (options.page - 1) * options.limit;

  // Build sort object
  const sort = {};
  sort[options.sortBy] = options.sortOrder;

  // Execute query
  const response = await User.find(filters).select("-password").sort(sort).skip(skip).limit(options.limit);

  responseSuccess(res, 200, "Lấy danh sách người dùng thành công", {
    data: response,
    page: response.page,
    limit: response.limit,
    total: response.total,
    totalPages: response.totalPages,
  });
});

const getUserById = catchAsync(async (req, res) => {
  const userId = req.params.id;

  const user = await User.findById(userId).select("-password");
  if (!user) throw new AppError(404, "Không tìm thấy người dùng");

  responseSuccess(res, 200, "Lấy thông tin người dùng thành công", user);
});

const getCurrentUser = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const user = await User.findById(userId).select("-password");
  if (!user) throw new AppError(404, "Không tìm thấy người dùng");

  responseSuccess(res, 200, "Lấy thông tin người dùng thành công", user);
});

const createUserByAdmin = catchAsync(async (req, res) => {
  const { email, password, firstName, lastName, phone, role = "customer" } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError(400, "Email Ä‘Ã£ Ä‘Æ°á»£c sá»­ dá»¥ng");
  }

  const userPassword = password || Math.random().toString(36).slice(-8);

  // Hash password
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(userPassword, saltRounds);

  const newUser = await User.create({
    email,
    password: hashedPassword,
    firstName,
    lastName,
    phone,
    role,
  });

  const userResponse = newUser.toObject();
  delete userResponse.password;

  responseSuccess(res, 201, "Tạo người dùng thành công", {
    user: userResponse,
    temporaryPassword: password ? undefined : userPassword,
  });
});

const updateUser = catchAsync(async (req, res) => {
  const userId = req.params.id;
  const { firstName, lastName, phone, gender, dateOfBirth, address } = req.body;

  const user = await User.findById(userId);
  if (!user) throw new AppError(404, "Không tìm thấy người dùng");

  const updateData = {};
  if (firstName) updateData.firstName = firstName;
  if (lastName) updateData.lastName = lastName;
  if (phone) updateData.phone = phone;
  if (gender) updateData.gender = gender;
  if (dateOfBirth) updateData.dateOfBirth = dateOfBirth;
  if (address) updateData.address = address;

  const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true }).select(
    "-password"
  );

  responseSuccess(res, 200, "Cập nhật thông tin người dùng thành công", updatedUser);
});

const updateUserByAdmin = catchAsync(async (req, res) => {
  const userId = req.params.id;
  const { email, firstName, lastName, phone, role, isBlocked, gender, dateOfBirth, address } = req.body;

  const user = await User.findById(userId);
  if (!user) throw new AppError(404, "Không tìm thấy người dùng");

  if (email && email !== user.email) {
    const existingUser = await User.findOne({ email, _id: { $ne: userId } });
    if (existingUser) throw new AppError(400, "Email đã được sử dụng bởi người dùng khác");
  }

  const updateData = {};
  if (email) updateData.email = email;
  if (firstName) updateData.firstName = firstName;
  if (lastName) updateData.lastName = lastName;
  if (phone) updateData.phone = phone;
  if (role) updateData.role = role;
  if (isBlocked !== undefined) updateData.isBlocked = isBlocked;
  if (gender) updateData.gender = gender;
  if (dateOfBirth) updateData.dateOfBirth = dateOfBirth;
  if (address) updateData.address = address;

  const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true }).select(
    "-password"
  );

  responseSuccess(res, 200, "Cập nhật người dùng thành công", updatedUser);
});

const deleteUser = catchAsync(async (req, res) => {
  const userId = req.params.id;

  const user = await User.findById(userId);
  if (!user) throw new AppError(404, "Không tìm thấy người dùng");

  // Không cho admin xóa chính mình
  if (userId === req.user._id.toString()) throw new AppError(400, "Không thể xóa tài khoản của chính mình");

  await User.findByIdAndDelete(userId);

  responseSuccess(res, 200, "Xóa người dùng thành công");
});

const changePassword = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(userId);
  if (!user) throw new AppError(404, "Không tìm thấy người dùng");

  // Verify current password
  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isCurrentPasswordValid) throw new AppError(400, "Mật khẩu hiện tại không đúng");

  // Hash new password
  const saltRounds = 10;
  user.password = await bcrypt.hash(newPassword, saltRounds);
  await user.save();

  responseSuccess(res, 200, "Đổi mật khẩu thành công");
});

const banUser = catchAsync(async (req, res) => {
  const userId = req.params.id;

  const user = await User.findById(userId);
  if (!user) throw new AppError(404, "Không tìm thấy người dùng");

  // Không cho admin chặn chính mình
  if (userId === req.user._id.toString()) throw new AppError(400, "Không thể chặn tài khoản của chính mình");

  // Cập nhật trạng thái chặn
  user.isBlocked = true;
  await user.save();

  const userResponse = user.toObject();
  delete userResponse.password;

  responseSuccess(res, 200, "Chặn người dùng thành công", userResponse);
});

const unbanUser = catchAsync(async (req, res) => {
  const userId = req.params.id;

  // TÃ¬m user
  const user = await User.findById(userId);
  if (!user) throw new AppError(404, "Không tìm thấy người dùng");

  // Cáº­p nháº­t tráº¡ng thÃ¡i bá» cháº·n
  user.isBlocked = false;
  await user.save();

  const userResponse = user.toObject();
  delete userResponse.password;

  responseSuccess(res, 200, "Bỏ chặn người dùng thành công", userResponse);
});

export default {
  getAllUsers,
  getUserById,
  getCurrentUser,
  createUserByAdmin,
  updateUser,
  updateUserByAdmin,
  deleteUser,
  changePassword,
  banUser,
  unbanUser,
};
