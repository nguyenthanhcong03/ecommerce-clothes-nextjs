import reviewService from "../services/reviewService.js";
import catchAsync from "../utils/catchAsync.js";
import { responseSuccess } from "../utils/responseHandler.js";

// Tạo mới đánh giá sản phẩm
const createReview = catchAsync(async (req, res) => {
  const { productId, orderId, rating, comment } = req.body;
  const userId = req.user._id;

  const review = await reviewService.createReview({
    userId,
    productId,
    orderId,
    rating,
    comment: comment || "",
  });

  res.status(201).json({
    success: true,
    data: review,
  });
});

// Lấy đánh giá của sản phẩm
const getProductReviews = catchAsync(async (req, res) => {
  const { productId } = req.params;
  const { rating, page = 1, limit = 10, sort = "-createdAt" } = req.query;

  const options = {
    rating: rating ? parseInt(rating, 10) : undefined,
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort,
    populate: {
      path: "userId",
      select: "firstName lastName avatar",
    },
  };

  const reviews = await reviewService.getProductReviews(productId, options);

  responseSuccess(res, 200, "Lấy đánh giá sản phẩm thành công", reviews);
});

// Lấy đánh giá của người dùng
const getUserReviews = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const { page = 1, limit = 10 } = req.query;

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort: "-createdAt",
    populate: {
      path: "productId",
      select: "name images",
    },
  };

  const reviews = await reviewService.getUserReviews(userId, options);

  res.status(200).json({
    success: true,
    data: reviews,
  });
});

// Trả lời đánh giá (admin)
const replyToReview = catchAsync(async (req, res) => {
  const { reviewId } = req.params;
  const { reply } = req.body;

  const review = await reviewService.replyToReview(reviewId, reply);

  res.status(200).json({
    success: true,
    data: review,
  });
});

// Lấy danh sách sản phẩm có thể đánh giá
const getReviewableProducts = catchAsync(async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user._id;

  const reviewableProducts = await reviewService.getReviewableProducts(userId, orderId);

  res.status(200).json({
    success: true,
    data: reviewableProducts,
  });
});

// Lấy tất cả đánh giá (admin)
const getAllReviews = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, sort = "-createdAt" } = req.query;

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort,
    populate: {
      path: "userId",
      select: "firstName lastName avatar",
    },
  };

  const reviews = await reviewService.getAllReviews(options);

  res.status(200).json({
    success: true,
    data: reviews,
  });
});

export default {
  createReview,
  getProductReviews,
  getUserReviews,
  getReviewableProducts,
  replyToReview,
  getAllReviews,
};
