import Coupon from "../models/coupon.js";
import AppError from "../utils/AppError.js";
import catchAsync from "../utils/catchAsync.js";
import { responseSuccess } from "../utils/responseHandler.js";

const getCoupons = catchAsync(async (req, res) => {
  const { page = 1, limit = 5, search, isActive, code, startDate, endDate } = query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const filter = {};

  // Text search if provided
  if (search) {
    filter.$or = [{ code: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }];

    // Alternative: Use the text index if search term contains multiple words
    // if (search.includes(' ')) {
    //   filter.$text = { $search: search };
    // } else {
    //   filter.$or = [
    //     { name: { $regex: search, $options: 'i' } },
    //     { description: { $regex: search, $options: 'i' } }
    //   ];
    // }
  }

  if (isActive !== undefined) {
    filter.isActive = isActive === "true";
  }

  if (code) {
    filter.code = { $regex: new RegExp(code, "i") };
  }

  if (startDate) {
    if (!filter.startDate) filter.startDate = {};
    filter.startDate.$gte = new Date(startDate);
  }

  if (endDate) {
    if (!filter.endDate) filter.endDate = {};
    filter.endDate.$lte = new Date(endDate);
  }

  const coupons = await Coupon.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));

  const total = await Coupon.countDocuments(filter);

  const response = {
    data: coupons,
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(total / limit),
  };
  responseSuccess(res, 200, "Lấy danh sách mã giảm giá thành công", response);
});

const createCoupon = catchAsync(async (req, res) => {
  const couponData = req.body;
  if (new Date(couponData.startDate) > new Date(couponData.endDate)) {
    throw new AppError(400, "Ngày bắt đầu không được sau ngày kết thúc");
  }

  couponData.code = couponData.code.toUpperCase();

  // Kiểm tra coupon tồn tại
  const existingCoupon = await Coupon.findOne({ code: couponData.code });
  if (existingCoupon) throw new AppError(400, "Mã giảm giá đã tồn tại");

  const newCoupon = await Coupon.create(couponData);
  responseSuccess(res, 201, "Tạo mã giảm giá thành công", newCoupon);
});

const getCouponById = catchAsync(async (req, res) => {
  const couponId = req.params.id;
  const coupon = await Coupon.findById(couponId);
  if (!coupon) throw new AppError(404, "Mã giảm giá không tồn tại");
  responseSuccess(res, 200, "Lấy thông tin mã giảm giá thành công", coupon);
});

const validateCoupon = catchAsync(async (req, res) => {
  const { code } = req.params;
  const { orderTotal } = req.query;

  const coupon = await Coupon.findOne({
    code: code.toUpperCase(),
    isActive: true,
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() },
  });

  if (!coupon) throw new AppError(400, "Mã giảm giá không tồn tại hoặc đã hết hạn");

  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
    throw new AppError(400, "Mã giảm giá đã quá lượt sử dụng");
  }

  // Kiểm tra giá trị đơn hàng
  if (orderTotal && parseFloat(orderTotal) < coupon.minOrderValue) {
    throw new AppError(400, "Giá trị đơn hàng không đủ");
  }

  responseSuccess(res, 200, "Mã giảm giá hợp lệ", coupon);
});

const updateCoupon = catchAsync(async (req, res) => {
  const couponId = req.params.id;
  const updateData = req.body;
  if (updateData.startDate && updateData.endDate) {
    if (new Date(updateData.startDate) > new Date(updateData.endDate)) {
      throw new AppError(400, "Ngày bắt đầu không được sau ngày kết thúc");
    }
  }

  if (updateData.code) {
    updateData.code = updateData.code.toUpperCase();

    const existingCoupon = await Coupon.findOne({
      code: updateData.code,
      _id: { $ne: couponId },
    });

    if (existingCoupon) {
      throw new AppError(400, "Mã giảm giá đã tồn tại");
    }
  }

  const updatedCoupon = await Coupon.findByIdAndUpdate(couponId, updateData, { new: true, runValidators: true });
  responseSuccess(res, 200, "Cập nhật mã giảm giá thành công", updatedCoupon);
});

const deleteCoupon = catchAsync(async (req, res) => {
  const couponId = req.params.id;
  const coupon = await Coupon.findById(couponId);
  if (!coupon) {
    throw new AppError(404, "Không tìm thấy mã giảm giá");
  }

  if (coupon.usedCount > 0) {
    throw new AppError(400, "Không thể xóa mã giảm giá đã được sử dụng");
  }

  const result = await Coupon.findByIdAndDelete(couponId);

  responseSuccess(res, 200, "Đã xóa mã giảm giá thành công", result);
});

const toggleCouponStatus = catchAsync(async (req, res) => {
  const couponId = req.params.id;
  const { isActive } = req.body;

  if (isActive === undefined) {
    return res.status(400).json({
      success: false,
      message: "Vui lÃ²ng cung cáº¥p tráº¡ng thÃ¡i kÃ­ch hoáº¡t (isActive)",
    });
  }

  const updatedCoupon = await Coupon.findByIdAndUpdate(couponId, { isActive }, { new: true });

  if (!updatedCoupon) throw new AppError(404, "Không tìm thấy mã giảm giá");

  responseSuccess(res, 200, "Cập nhật trạng thái mã giảm giá thành công", updatedCoupon);
});

const getActiveCoupons = catchAsync(async (req, res) => {
  const now = new Date();
  // Lấy tất cả mã giảm giá đang hoạt động
  const coupons = await Coupon.find({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
  }).sort({ createdAt: -1 });

  // Lọc mã giảm giá còn lượt sử dụng
  const filteredCoupons = coupons.filter((coupon) => coupon.usageLimit === 0 || coupon.usedCount < coupon.usageLimit);

  responseSuccess(res, 200, "Lấy danh sách mã giảm giá hoạt động thành công", filteredCoupons);
});

export default {
  createCoupon,
  getCoupons,
  getCouponById,
  validateCoupon,
  updateCoupon,
  deleteCoupon,
  toggleCouponStatus,
  getActiveCoupons,
};
