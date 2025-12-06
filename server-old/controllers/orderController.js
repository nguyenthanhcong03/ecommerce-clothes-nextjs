import mongoose from "mongoose";
import Cart from "../models/cart.js";
import Coupon from "../models/coupon.js";
import Order from "../models/order.js";
import Product from "../models/product.js";
import paymentService from "../services/paymentService.js";
import AppError from "../utils/AppError.js";
import catchAsync from "../utils/catchAsync.js";
import { calculateDiscount, generateTrackingNumber } from "../utils/orderUtils.js";
import { responseSuccess } from "../utils/responseHandler.js";

const getAllOrders = catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status,
    paymentStatus,
    paymentMethod,
    startDate,
    endDate,
    search,
    minAmount,
    maxAmount,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);

  const query = {};

  if (status) {
    if (Array.isArray(status)) {
      query.status = { $in: status };
    } else {
      query.status = status;
    }
  }

  if (paymentStatus) {
    if (Array.isArray(paymentStatus)) {
      query["payment.status"] = { $in: paymentStatus };
    } else {
      query["payment.status"] = paymentStatus;
    }
  }

  if (paymentMethod) {
    if (Array.isArray(paymentMethod)) {
      query["payment.method"] = { $in: paymentMethod };
    } else {
      query["payment.method"] = paymentMethod;
    }
  }

  if (startDate || endDate) {
    query.createdAt = {};

    if (startDate) {
      query.createdAt.$gte = new Date(startDate);
    }

    if (endDate) {
      // Đặt thời gian kết thúc của endDate là cuối ngày để bao gồm toàn bộ ngày đó
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      query.createdAt.$lte = endOfDay;
    }
  }

  if (minAmount || maxAmount) {
    query.totalPrice = {};

    if (minAmount) {
      query.totalPrice.$gte = parseFloat(minAmount);
    }

    if (maxAmount) {
      query.totalPrice.$lte = parseFloat(maxAmount);
    }
  }

  if (search) {
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(search);

    const searchQuery = [
      { "shippingAddress.fullName": { $regex: search, $options: "i" } },
      { "shippingAddress.phoneNumber": { $regex: search, $options: "i" } },
      { "shippingAddress.email": { $regex: search, $options: "i" } },
      { trackingNumber: { $regex: search, $options: "i" } },
    ];

    if (isValidObjectId) {
      searchQuery.push({ _id: search });
    }

    query.$or = searchQuery;
  }

  const skip = (pageNumber - 1) * limitNumber;

  const sortObj = {};
  sortObj[sortBy] = sortOrder === "asc" ? 1 : -1;

  const orders = await Order.find(query)
    .populate("userId couponId", "username email firstName lastName code")
    .sort(sortObj)
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  const totalOrders = await Order.countDocuments(query);

  const totalPages = Math.ceil(totalOrders / limitNumber);

  const response = {
    data: orders,
    page: pageNumber,
    limit: limitNumber,
    total: totalOrders,
    totalPages: totalPages,
  };

  responseSuccess(res, 200, "Lấy danh sách đơn hàng thành công", response);
});

const createOrder = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const session = await mongoose.startSession();
  session.startTransaction();

  const { products, shippingAddress, paymentMethod, couponCode, note } = req.body;

  if (!products || !products.length || !shippingAddress || !paymentMethod) {
    await session.abortTransaction();
    session.endSession();
    throw new AppError(400, "Thiếu thông tin");
  }

  // Kiá»ƒm tra giÃ¡ sáº£n pháº©m hiá»‡n táº¡i
  const updatedProducts = []; // Cáº­p nháº­t cÃ¡c sáº£n pháº©m cÃ³ thay Ä‘á»•i giÃ¡
  const changedProducts = [];

  for (const product of products) {
    const currentProduct = await Product.findById(product.productId).session(session);

    if (!currentProduct) {
      await session.abortTransaction();
      session.endSession();
      throw new AppError(400, `Sáº£n pháº©m vá»›i ID ${product.productId} khÃ´ng tá»“n táº¡i hoáº·c Ä‘Ã£ bá»‹ xÃ³a`);
    }

    let currentVariant = null;
    if (product.variantId && currentProduct.variants && currentProduct.variants.length > 0) {
      currentVariant = currentProduct.variants.find((v) => v._id.toString() === product.variantId);
      if (!currentVariant) {
        await session.abortTransaction();
        session.endSession();
        throw new AppError(
          400,
          `Biáº¿n thá»ƒ vá»›i ID ${product.variantId} khÃ´ng tá»“n táº¡i cho sáº£n pháº©m ${currentProduct.name}`
        );
      }
    }

    const currentPrice = currentVariant ? currentVariant.price : currentProduct.price;
    const snapshotPrice = product.snapshot.price || product.snapshot.originalPrice;

    // So sÃ¡nh giÃ¡
    if (currentPrice !== snapshotPrice) {
      changedProducts.push({
        productId: product.productId,
        variantId: product.variantId,
        oldPrice: snapshotPrice,
        newPrice: currentPrice,
        productName: currentProduct.name,
        variantName: currentVariant ? currentVariant.name : null,
      });

      const updatedSnapshot = {
        ...product.snapshot,
        price: currentPrice,
        originalPrice: currentPrice,
      };

      updatedProducts.push({
        ...product,
        snapshot: updatedSnapshot,
      });
    } else {
      updatedProducts.push(product);
    }
  }

  // Náº¿u cÃ³ sáº£n pháº©m thay Ä‘á»•i giÃ¡, tráº£ vá» thÃ´ng bÃ¡o
  if (changedProducts.length > 0) {
    await session.abortTransaction();
    session.endSession();
    return res.status(409).json({
      success: false,
      message: "GiÃ¡ má»™t sá»‘ sáº£n pháº©m Ä‘Ã£ thay Ä‘á»•i. Vui lÃ²ng xÃ¡c nháº­n giÃ¡ má»›i.",
      changedProducts,
      updatedProducts,
    });
  }

  // Tính tổng tiền
  const subtotal = products.reduce(
    (sum, item) => sum + (item.snapshot.price || item.snapshot.originalPrice) * item.quantity,
    0
  );

  let discountAmount = 0;
  let couponApplied = null;

  if (couponCode) {
    const coupon = await Coupon.findOne({
      code: couponCode,
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
    }).session(session);

    if (!coupon) {
      await session.abortTransaction();
      session.endSession();
      throw new AppError(400, "Mã giảm giá không tồn tại hoặc đã hết hạn");
    }

    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
      await session.abortTransaction();
      session.endSession();
      throw new AppError(400, "Mã giảm giá hết lượt sử dụng");
    }

    discountAmount = calculateDiscount(subtotal, coupon);
    couponApplied = coupon;
  }

  const totalPrice = Math.max(0, subtotal - discountAmount);

  if (paymentMethod === "COD") {
    const trackingNumber = generateTrackingNumber();

    const newOrder = new Order({
      userId: userId || null,
      products,
      totalPrice: totalPrice,
      shippingAddress,
      payment: {
        method: paymentMethod,
        status: "Unpaid",
        paidAt: null,
      },
      trackingNumber,
      couponId: couponApplied ? couponApplied._id : null,
      discountAmount,
      note: note || "",
    });

    const savedOrder = await newOrder.save({ session });

    // Cập nhật số lượng trong kho
    for (const item of products) {
      const product = await Product.findById(item.productId).session(session);
      if (product) {
        const variantIndex = product.variants.findIndex((v) => v._id.toString() === item.variantId);
        if (variantIndex !== -1) {
          product.variants[variantIndex].stock = Math.max(0, product.variants[variantIndex].stock - item.quantity);
        }

        await product.save({ session });
      }
    }

    // Xóa sản phẩm khỏi giỏ hàng
    const cart = await Cart.findOne({ userId: userId }).session(session);
    cart.items = cart.items.filter(
      (item) =>
        !products.some(
          (product) =>
            product.productId === item.productId.toString() && product.variantId === item.variantId.toString()
        )
    );
    await cart.save({ session });

    // Cập nhật số lượng sử dụng của coupon
    if (couponApplied && couponApplied.usageLimit) {
      couponApplied.usedCount = (couponApplied.usedCount || 0) + 1;
      await couponApplied.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    responseSuccess(res, 201, "Tạo đơn hàng thành công", savedOrder);
  }
  // Nếu thanh toán bằng VNPay
  else if (paymentMethod === "VNPay") {
    const trackingNumber = generateTrackingNumber();

    const orderData = new Order({
      userId: userId || null,
      products,
      totalPrice: totalPrice,
      shippingAddress,
      status: "Pending",
      payment: {
        method: paymentMethod,
        status: "Unpaid",
        paidAt: null,
      },
      trackingNumber,
      couponId: couponApplied ? couponApplied._id : null,
      discountAmount,
      note: note || "",
    });

    const tempOrder = await orderData.save({ session });

    // Cập nhật số lượng trong kho
    for (const item of products) {
      const product = await Product.findById(item.productId).session(session);
      if (product) {
        if (item.variantId) {
          const variantIndex = product.variants.findIndex((v) => v._id.toString() === item.variantId);
          if (variantIndex !== -1) {
            product.variants[variantIndex].stock = Math.max(0, product.variants[variantIndex].stock - item.quantity);
          }
        } else {
          product.stock = Math.max(0, product.stock - item.quantity);
        }
        await product.save({ session });
      }
    }

    // Xóa sản phẩm khỏi giỏ hàng
    const cart = await Cart.findOne({ userId: userId }).session(session);
    if (cart) {
      cart.items = cart.items.filter(
        (item) =>
          !products.some(
            (product) =>
              product.productId === item.productId.toString() && product.variantId === item.variantId.toString()
          )
      );
      await cart.save({ session });
    }

    // Cập nhật số lượng sử dụng của coupon
    if (couponApplied && couponApplied.usageLimit) {
      couponApplied.usedCount = (couponApplied.usedCount || 0) + 1;
      await couponApplied.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    // Tạo liên kết thanh toán
    let paymentUrl;
    const orderId = tempOrder._id.toString();
    const paymentData = {
      amount: totalPrice,
      orderId: orderId,
      orderInfo: `Thanh toán đơn hàng: ${orderId}`,
    };

    if (paymentMethod === "VNPay") {
      paymentUrl = paymentService.createVnpayPaymentUrl(paymentData);
    }

    responseSuccess(res, 201, "Tạo đơn hàng thành công", {
      order: tempOrder,
      paymentUrl,
    });
  } else {
    await session.abortTransaction();
    session.endSession();
    throw new AppError(400, "Phương thức thanh toán không hợp lệ");
  }
});

const getUserOrders = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const { page = 1, limit = 10, status, paymentStatus } = req.query;

  const query = { userId };

  if (status) {
    query.status = status;
  }

  if (paymentStatus !== undefined) {
    query["payment.status"] = paymentStatus === "Paid";
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const orders = await Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean();

  const totalOrders = await Order.countDocuments(query);

  const totalPages = Math.ceil(totalOrders / parseInt(limit));

  const response = {
    data: orders,
    page: parseInt(page),
    totalPages,
    total: totalOrders,
  };

  responseSuccess(res, 200, "Lấy danh sách đơn hàng của người dùng thành công", response);
});

const getOrderById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  const userRole = req.user.role;

  // Build query based on user role
  let query = { _id: id };

  if (userRole !== "admin") {
    query.userId = userId;
  }

  const order = await Order.findOne(query).populate("userId", "fullName email").lean();

  if (!order) {
    throw new AppError(404, "Đơn hàng không tồn tại hoặc bạn không có quyền truy cập");
  }

  responseSuccess(res, 200, "Lấy thông tin đơn hàng thành công", order);
});

const updateOrderStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status, reason } = req.body;

  // Validate status
  const validStatuses = ["Pending", "Processing", "Shipping", "Delivered", "Cancelled"];
  if (!validStatuses.includes(status)) {
    throw new AppError(400, "Trạng thái đơn hàng không hợp lệ");
  }

  const order = await Order.findById(id);

  if (!order) {
    throw new AppError(404, "Đơn hàng không tồn tại");
  }

  // Không cho phép cập nhật trạng thái nếu đơn hàng đã hủy hoặc đã giao
  if (order.status === "Cancelled" || order.status === "Delivered") {
    throw new AppError(400, "Không thể cập nhật trạng thái của đơn hàng đã hủy hoặc đã giao");
  }

  // Xử lý khi admin set status = "Cancelled"
  if (status === "Cancelled") {
    // Cập nhật lại số lượng trong kho
    for (const item of order.products) {
      const product = await Product.findById(item.productId);

      if (product) {
        const variantIndex = product.variants.findIndex((v) => v._id.toString() === item.variantId);
        if (variantIndex !== -1) {
          product.variants[variantIndex].stock += item.quantity;
        }
        await product.save();
      }
    }
    // Cập nhật lại số lượng sử dụng của coupon nếu có
    if (order.couponId) {
      const coupon = await Coupon.findById(order.couponId);
      if (coupon && coupon.usageLimit) {
        coupon.usedCount = Math.max(0, (coupon.usedCount || 0) - 1);
        await coupon.save();
      }
    }

    // Set lý do hủy
    order.cancelReason = reason || "Admin hủy đơn hàng";
  }

  // Xử lý khi admin set status = "Delivered"
  if (status === "Delivered") {
    // Nếu đơn hàng chưa thanh toán, cập nhật trạng thái thanh toán
    if (order.payment.status === "Unpaid") {
      order.payment.status = "Paid";
      order.payment.paidAt = new Date();
    }
    // Cập nhật số lượng bán của sản phẩm
    for (const item of order.products) {
      const product = await Product.findById(item.productId);
      if (product) {
        product.salesCount = (product.salesCount || 0) + item.quantity;
        await product.save();
      }
    }
  }

  // Cập nhật trạng thái đơn hàng
  order.status = status;
  const updatedOrder = await order.save();

  let message = "Cập nhật trạng thái đơn hàng thành công";

  // Thêm thông báo nếu đơn hàng bị hủy và đã thanh toán
  if (status === "Cancelled" && order.payment.status === "Paid") {
    message += ". Đơn hàng đã thanh toán - vui lòng liên hệ để hoàn tiền";
  }

  responseSuccess(res, 200, message, {
    order: updatedOrder,
    needRefund: status === "Cancelled" && order.payment.status === "Paid",
  });
});

const updatePaymentStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const order = await Order.findById(id);

  if (!order) {
    throw new AppError(404, "Order not found");
  }

  order.payment.status = status;
  // Nếu đã thanh toán, cập nhật thời gian thanh toán
  if (status === "Paid") {
    order.status = "Pending";
    order.payment.paidAt = new Date();
  } else {
    order.status = "Unpaid";
    order.payment.paidAt = null;
  }

  const updatedOrder = await order.save();

  responseSuccess(res, 200, "Cập nhật trạng thái thanh toán thành công", updatedOrder);
});

const cancelOrder = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const userId = req.user._id;

  const order = await Order.findOne({ _id: id, userId: userId });
  if (!order) throw new AppError(404, "Đơn hàng không tồn tại hoặc bạn không có quyền hủy đơn hàng này");

  // Nếu đơn hàng đã giao hoặc đã hủy thì không thể hủy
  if (order.status === "Delivered" || order.status === "Cancelled") {
    throw new AppError(400, "Không thể hủy đơn hàng đã giao hoặc đã hủy");
  }

  // Cập nhật trạng thái đơn hàng thành "Cancelled"
  order.status = "Cancelled";
  order.cancelReason = reason || "Khách hàng yêu cầu hủy đơn hàng";

  const updatedOrder = await order.save();

  // Khôi phục lại số lượng trong kho
  for (const item of order.products) {
    const product = await Product.findById(item.productId);

    if (product) {
      const variantIndex = product.variants.findIndex((v) => v._id.toString() === item.variantId);
      if (variantIndex !== -1) {
        product.variants[variantIndex].stock += item.quantity;
      }

      await product.save();
    }
  }

  // Cập nhật lại số lượng sử dụng của coupon nếu có
  if (order.couponId) {
    const coupon = await Coupon.findById(order.couponId);
    if (coupon && coupon.usageLimit) {
      coupon.usedCount = Math.max(0, (coupon.usedCount || 0) - 1);
      await coupon.save();
    }
  }

  let message = "Hủy đơn hàng thành công";

  // Thêm thông báo nếu đơn hàng đã thanh toán
  if (order.payment.status === "Paid") {
    message += ". Đơn hàng đã thanh toán - vui lòng liên hệ để hoàn tiền";
  }

  responseSuccess(res, 200, message, updatedOrder);
});

const searchOrders = catchAsync(async (req, res) => {
  const { query: searchQuery, page = 1, limit = 10 } = req.query;
  const userId = req.user._id;

  if (!searchQuery) {
    throw new AppError(400, "Search query is required");
  }

  // Create search conditions
  const searchConditions = {
    userId: userId,
    $or: [
      { "shippingAddress.fullName": { $regex: searchQuery, $options: "i" } },
      { "shippingAddress.phoneNumber": { $regex: searchQuery, $options: "i" } },
      { trackingNumber: { $regex: searchQuery, $options: "i" } },
    ],
  };

  // Check if searchQuery is a valid ObjectId for searching by order ID
  if (/^[0-9a-fA-F]{24}$/.test(searchQuery)) {
    searchConditions.$or.push({ _id: searchQuery });
  }

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Search orders
  const orders = await Order.find(searchConditions).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean();

  // Count total matching orders
  const totalOrders = await Order.countDocuments(searchConditions);

  // Calculate pagination metadata
  const totalPages = Math.ceil(totalOrders / parseInt(limit));

  const result = {
    data: orders,
    page: parseInt(page),
    totalPages,
    total: totalOrders,
    limit: parseInt(limit),
  };

  responseSuccess(res, 200, "Tìm kiếm đơn hàng thành công", result);
});

export default {
  createOrder,
  getAllOrders,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  cancelOrder,
  searchOrders,
};
