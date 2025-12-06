import mongoose from "mongoose";
import Review from "../models/review.js";
import Product from "../models/product.js";
import Order from "../models/order.js";
import AppError from "../utils/AppError.js";

/**
 * Đánh giá sản phẩm
 */
const createReview = async (reviewData) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { userId, productId, orderId } = reviewData;

    // Kiểm tra xem người dùng đã mua sản phẩm này chưa (thông qua orderId)
    const order = await Order.findOne({
      _id: orderId,
      userId: userId,
      status: "Delivered",
      "products.productId": productId,
    }).session(session);

    if (!order) {
      throw new AppError(400, "Bạn chưa mua sản phẩm này hoặc đơn hàng không hợp lệ");
    }

    // Kiểm tra xem sản phẩm đã được đánh giá chưa
    const productItem = order.products.find((item) => item.productId.toString() === productId && !item.isReviewed);

    if (!productItem) {
      throw new AppError(400, "Sản phẩm này đã được đánh giá hoặc không có trong đơn hàng");
    }

    // Tạo review mới
    const review = await Review.create([reviewData], { session });

    // Cập nhật trạng thái isReviewed cho sản phẩm trong đơn hàng
    await Order.updateOne(
      {
        _id: orderId,
        "products.productId": productId,
      },
      {
        $set: { "products.$.isReviewed": true },
      },
      { session }
    );

    // Cập nhật thông tin đánh giá trong sản phẩm
    await updateProductRatingStats(productId, session);

    await session.commitTransaction();
    session.endSession();

    return review[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

/**
 * Lấy tất cả đánh giá của một sản phẩm
 */
const getProductReviews = async (productId, options) => {
  const query = { productId };

  if (options.rating) {
    query.rating = options.rating;
  }

  const page = options.page || 1;
  const limit = options.limit || 10;
  const skip = (page - 1) * limit;

  const reviews = await Review.find(query)
    .sort(options.sort || "-createdAt")
    .skip(skip)
    .limit(limit)
    .populate(options.populate || "")
    .lean();

  const total = await Review.countDocuments(query);

  return {
    reviews,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Lấy tất cả đánh giá của người dùng hiện tại
 */
const getUserReviews = async (userId, options) => {
  const query = { userId };

  const page = options.page || 1;
  const limit = options.limit || 10;
  const skip = (page - 1) * limit;

  const reviews = await Review.find(query)
    .sort(options.sort || "-createdAt")
    .skip(skip)
    .limit(limit)
    .populate(options.populate || "")
    .lean();

  const total = await Review.countDocuments(query);

  return {
    reviews,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Phản hồi đánh giá (Admin)
 */
const replyToReview = async (reviewId, reply) => {
  // Validate reviewId
  if (!mongoose.Types.ObjectId.isValid(reviewId)) {
    throw new AppError(400, "ID đánh giá không hợp lệ");
  }

  const review = await Review.findByIdAndUpdate(reviewId, { reply }, { new: true }).populate(
    "userId",
    "firstName lastName avatar"
  );

  if (!review) {
    throw new AppError(404, "Không tìm thấy đánh giá");
  }

  return review;
};

/**
 * Cập nhật thông tin đánh giá trong sản phẩm
 */
const updateProductRatingStats = async (productId, session) => {
  const stats = await Review.aggregate([
    { $match: { productId: new mongoose.Types.ObjectId(productId) } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]).session(session);

  let averageRating = 0;
  let totalReviews = 0;

  if (stats.length > 0) {
    averageRating = Math.round(stats[0].averageRating * 10) / 10; // Làm tròn đến 1 chữ số thập phân
    totalReviews = stats[0].totalReviews;
  }

  await Product.findByIdAndUpdate(
    productId,
    {
      $set: {
        averageRating,
        totalReviews,
      },
    },
    { session }
  );
};

/**
 * Lấy các sản phẩm có thể được đánh giá từ một đơn hàng đã giao.
 */
const getReviewableProducts = async (userId, orderId) => {
  // Find the order and check if it's valid and delivered
  const order = await Order.findOne({
    _id: orderId,
    userId,
    status: "Delivered",
  }).populate({
    path: "products.productId",
    select: "name images averageRating totalReviews",
  });

  if (!order) {
    throw new AppError(404, "Đơn hàng không tồn tại hoặc chưa giao hàng thành công");
  }

  // Lọc các sản phẩm chưa được đánh giá.
  const reviewableProducts = order.products
    .filter((product) => !product.isReviewed)
    .map((product) => ({
      productId: product.productId._id,
      productInfo: {
        name: product.productId.name,
        image: product.snapshot.image,
        color: product.snapshot.color,
        size: product.snapshot.size,
        price: product.snapshot.price,
      },
      orderId: order._id,
      orderDate: order.createdAt,
      deliveredDate: order.statusUpdatedAt?.delivered || order.createdAt,
    }));

  return reviewableProducts;
};

/**
 * Get all reviews (Admin)
 */
const getAllReviews = async (options = {}) => {
  const reviews = await Review.find()
    .sort(options.sort)
    .populate(options.populate)
    .skip((options.page - 1) * options.limit)
    .limit(options.limit);

  const total = await Review.countDocuments();

  return {
    reviews,
    pagination: {
      page: options.page,
      limit: options.limit,
      total,
    },
  };
};

export default { createReview, getProductReviews, getUserReviews, replyToReview, getReviewableProducts, getAllReviews };
