import Order from "../models/order.js";
import Product from "../models/product.js";
import User from "../models/user.js";
import Category from "../models/category.js";
import mongoose from "mongoose";

/**
 * Hàm helper để lấy điều kiện tìm kiếm theo thời gian
 */
const getDateCondition = (period, startDate, endDate) => {
  const now = new Date();
  let dateCondition = {};

  switch (period) {
    case "today":
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      dateCondition = { createdAt: { $gte: startOfDay } };
      break;
    case "week":
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      dateCondition = { createdAt: { $gte: startOfWeek } };
      break;
    case "month":
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      dateCondition = { createdAt: { $gte: startOfMonth } };
      break;
    case "year":
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      dateCondition = { createdAt: { $gte: startOfYear } };
      break;
    case "custom":
      if (startDate && endDate) {
        const parsedStartDate = new Date(startDate);
        const parsedEndDate = new Date(endDate);
        parsedEndDate.setHours(23, 59, 59, 999); // Đến cuối ngày
        dateCondition = {
          createdAt: {
            $gte: parsedStartDate,
            $lte: parsedEndDate,
          },
        };
      }
      break;
    default:
      // Mặc định lấy tất cả
      dateCondition = {};
  }

  return dateCondition;
};

/**
 * Lấy thống kê tổng quan
 */
const getOverviewStatistics = async () => {
  // Tổng số đơn hàng
  const totalOrders = await Order.countDocuments();

  // Tổng doanh thu
  const revenueResult = await Order.aggregate([
    { $match: { status: "Delivered" } }, // Chỉ tính doanh thu từ đơn hàng đã giao
    { $group: { _id: null, total: { $sum: "$totalPrice" } } },
  ]);
  const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

  // Tổng số khách hàng
  const totalCustomers = await User.countDocuments({ role: "customer" });

  // Tổng số sản phẩm
  const totalProducts = await Product.countDocuments();

  // Đơn hàng đang xử lý
  const pendingOrders = await Order.countDocuments({ status: { $in: ["Pending", "Processing"] } });

  // Đơn hàng đã giao
  const deliveredOrders = await Order.countDocuments({ status: "Delivered" });

  // Đơn hàng đã hủy
  const cancelledOrders = await Order.countDocuments({ status: "Cancelled" });

  // Đơn hàng hôm nay
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const ordersToday = await Order.countDocuments({
    createdAt: { $gte: today },
  });

  // Doanh thu hôm nay
  const revenueTodayResult = await Order.aggregate([
    {
      $match: {
        "statusUpdatedAt.delivered": { $gte: today },
        status: "Delivered",
        // "payment.isPaid": true,
      },
    },
    { $group: { _id: null, total: { $sum: "$totalPrice" } } },
  ]);
  const revenueToday = revenueTodayResult.length > 0 ? revenueTodayResult[0].total : 0;

  return {
    totalOrders,
    totalRevenue,
    totalCustomers,
    totalProducts,
    pendingOrders,
    deliveredOrders,
    cancelledOrders,
    ordersToday,
    revenueToday,
  };
};

/**
 * Lấy thống kê doanh thu
 */
const getRevenueStatistics = async (period, startDate, endDate) => {
  let dateCondition = getDateCondition(period, startDate, endDate);
  let groupBy = {};
  let sortBy = {};

  // Định dạng group by dựa trên period
  switch (period) {
    case "today":
      groupBy = {
        $hour: "$createdAt",
      };
      sortBy = { _id: 1 };
      break;
    case "week":
      groupBy = {
        $dayOfWeek: "$createdAt",
      };
      sortBy = { _id: 1 };
      break;
    case "month":
      groupBy = {
        $dayOfMonth: "$createdAt",
      };
      sortBy = { _id: 1 };
      break;
    case "year":
      groupBy = {
        $month: "$createdAt",
      };
      sortBy = { _id: 1 };
      break;
    case "custom":
      // Nếu khoảng thời gian dưới 30 ngày thì group theo ngày
      if (startDate && endDate) {
        const parsedStartDate = new Date(startDate);
        const parsedEndDate = new Date(endDate);
        const dayDiff = Math.floor((parsedEndDate - parsedStartDate) / (1000 * 60 * 60 * 24));

        if (dayDiff <= 30) {
          groupBy = {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          };
        } else {
          groupBy = {
            $dateToString: { format: "%Y-%m", date: "$createdAt" },
          };
        }
        sortBy = { _id: 1 };
      }
      break;
    default:
      groupBy = {
        $month: "$createdAt",
      };
      sortBy = { _id: 1 };
  }

  // Thống kê doanh thu
  const revenueData = await Order.aggregate([
    {
      $match: {
        ...dateCondition,
        status: "Delivered", // Chỉ tính doanh thu từ đơn hàng đã giao
      },
    },
    {
      $group: {
        _id: groupBy,
        revenue: { $sum: "$totalPrice" },
        count: { $sum: 1 },
      },
    },
    { $sort: sortBy },
  ]);

  // Thống kê doanh thu theo phương thức thanh toán
  const paymentMethodData = await Order.aggregate([
    {
      $match: {
        ...dateCondition,
        "payment.status": "Paid",
      },
    },
    {
      $group: {
        _id: "$payment.method",
        revenue: { $sum: "$totalPrice" },
        count: { $sum: 1 },
      },
    },
  ]);

  return {
    revenueByTime: revenueData,
    revenueByPaymentMethod: paymentMethodData,
  };
};

/**
 * Lấy thống kê sản phẩm bán chạy
 */
const getTopProducts = async (limit = 10, period, startDate, endDate) => {
  let dateCondition = getDateCondition(period, startDate, endDate);

  const topProducts = await Order.aggregate([
    {
      $match: {
        ...dateCondition,
        status: { $nin: ["Cancelled"] }, // Loại bỏ đơn đã hủy
      },
    },
    { $unwind: "$products" },
    {
      $group: {
        _id: "$products.productId",
        totalSold: { $sum: "$products.quantity" },
        totalRevenue: {
          $sum: {
            $multiply: ["$products.snapshot.price", "$products.quantity"],
          },
        },
        productName: { $first: "$products.snapshot.name" },
        productImage: { $first: "$products.snapshot.image" },
      },
    },
    { $sort: { totalSold: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "productDetails",
      },
    },
    {
      $addFields: {
        productDetails: { $arrayElemAt: ["$productDetails", 0] },
      },
    },
    {
      $project: {
        _id: 1,
        productId: "$_id",
        name: { $ifNull: ["$productName", "$productDetails.name"] },
        image: { $ifNull: ["$productImage", "$productDetails.images.0"] },
        totalSold: 1,
        totalRevenue: 1,
        category: "$productDetails.categoryId",
      },
    },
  ]);

  // Thêm thông tin danh mục
  for (let product of topProducts) {
    if (product.category) {
      const category = await Category.findById(product.category).select("name");
      product.categoryName = category ? category.name : "Unknown";
    } else {
      product.categoryName = "Unknown";
    }
  }

  return topProducts;
};

/**
 * Lấy thống kê khách hàng
 */
const getCustomerStatistics = async (period, startDate, endDate) => {
  let dateCondition = getDateCondition(period, startDate, endDate);

  // Khách hàng mới trong khoảng thời gian
  const newCustomers = await User.countDocuments({
    ...dateCondition,
    role: "customer",
  });

  // Top khách hàng có đơn hàng nhiều nhất
  const topCustomersByOrders = await Order.aggregate([
    { $match: dateCondition },
    {
      $group: {
        _id: "$userId",
        orderCount: { $sum: 1 },
        totalSpent: { $sum: "$totalPrice" },
      },
    },
    { $sort: { orderCount: -1 } },
    { $limit: 10 },
    {
      // Join
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "userDetails",
      },
    },
    {
      // thêm trường mới hoặc ghi đè trường hiện tại bằng giá trị tính toán.
      $addFields: {
        userDetails: { $arrayElemAt: ["$userDetails", 0] },
      },
    },
    {
      // Hiển thị các trường cần thiết
      $project: {
        _id: 1,
        userId: "$_id",
        firstName: "$userDetails.firstName",
        lastName: "$userDetails.lastName",
        email: "$userDetails.email",
        phone: "$userDetails.phone",
        orderCount: 1,
        totalSpent: 1,
      },
    },
  ]);

  // Top khách hàng chi tiêu nhiều nhất
  const topCustomersBySpending = await Order.aggregate([
    {
      $match: {
        ...dateCondition,
        "payment.status": "Paid",
      },
    },
    {
      $group: {
        _id: "$userId",
        orderCount: { $sum: 1 },
        totalSpent: { $sum: "$totalPrice" },
      },
    },
    { $sort: { totalSpent: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "userDetails",
      },
    },
    {
      $addFields: {
        userDetails: { $arrayElemAt: ["$userDetails", 0] },
      },
    },
    {
      $project: {
        _id: 1,
        userId: "$_id",
        firstName: "$userDetails.firstName",
        lastName: "$userDetails.lastName",
        email: "$userDetails.email",
        phone: "$userDetails.phone",
        orderCount: 1,
        totalSpent: 1,
      },
    },
  ]);

  return {
    newCustomers,
    topCustomersByOrders,
    topCustomersBySpending,
  };
};

/**
 * Lấy thống kê theo danh mục sản phẩm
 */
const getCategoryStatistics = async (period, startDate, endDate) => {
  let dateCondition = getDateCondition(period, startDate, endDate);

  const categoryStats = await Order.aggregate([
    {
      $match: {
        ...dateCondition,
        status: { $nin: ["Cancelled"] },
      },
    },
    { $unwind: "$products" },
    {
      $lookup: {
        from: "products",
        localField: "products.productId",
        foreignField: "_id",
        as: "productDetails",
      },
    },
    {
      $addFields: {
        productDetails: { $arrayElemAt: ["$productDetails", 0] },
      },
    },
    {
      $group: {
        _id: "$productDetails.categoryId",
        totalSold: { $sum: "$products.quantity" },
        totalRevenue: {
          $sum: {
            $multiply: ["$products.snapshot.price", "$products.quantity"],
          },
        },
        orderCount: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: "categories",
        localField: "_id",
        foreignField: "_id",
        as: "categoryDetails",
      },
    },
    {
      $addFields: {
        categoryDetails: { $arrayElemAt: ["$categoryDetails", 0] },
      },
    },
    {
      $project: {
        _id: 1,
        categoryId: "$_id",
        name: "$categoryDetails.name",
        totalSold: 1,
        totalRevenue: 1,
        orderCount: 1,
      },
    },
    { $sort: { totalRevenue: -1 } },
  ]);

  return categoryStats;
};

/**
 * Lấy thống kê đơn hàng
 */
const getOrderStatistics = async (period, startDate, endDate) => {
  let dateCondition = getDateCondition(period, startDate, endDate);
  let groupBy = {};
  let sortBy = {};

  // Định dạng group by dựa trên period
  switch (period) {
    case "today":
      groupBy = {
        $hour: "$createdAt",
      };
      sortBy = { _id: 1 };
      break;
    case "week":
      groupBy = {
        $dayOfWeek: "$createdAt",
      };
      sortBy = { _id: 1 };
      break;
    case "month":
      groupBy = {
        $dayOfMonth: "$createdAt",
      };
      sortBy = { _id: 1 };
      break;
    case "year":
      groupBy = {
        $month: "$createdAt",
      };
      sortBy = { _id: 1 };
      break;
    case "custom":
      // Nếu khoảng thời gian dưới 30 ngày thì group theo ngày
      if (startDate && endDate) {
        const parsedStartDate = new Date(startDate);
        const parsedEndDate = new Date(endDate);
        const dayDiff = Math.floor((parsedEndDate - parsedStartDate) / (1000 * 60 * 60 * 24));

        if (dayDiff <= 30) {
          groupBy = {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          };
        } else {
          groupBy = {
            $dateToString: { format: "%Y-%m", date: "$createdAt" },
          };
        }
        sortBy = { _id: 1 };
      }
      break;
    default:
      groupBy = {
        $month: "$createdAt",
      };
      sortBy = { _id: 1 };
  }

  // Thống kê số lượng đơn hàng theo thời gian
  const ordersByTime = await Order.aggregate([
    { $match: dateCondition },
    {
      $group: {
        _id: groupBy,
        count: { $sum: 1 },
        revenue: { $sum: "$totalPrice" },
      },
    },
    { $sort: sortBy },
  ]);

  // Thống kê theo trạng thái đơn hàng
  const ordersByStatus = await Order.aggregate([
    { $match: dateCondition },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        revenue: { $sum: "$totalPrice" },
      },
    },
  ]);

  // Tỷ lệ đơn hàng hủy
  const totalOrders = await Order.countDocuments(dateCondition);
  const cancelledOrders = await Order.countDocuments({
    ...dateCondition,
    status: "Cancelled",
  });

  const cancellationRate = totalOrders > 0 ? (cancelledOrders / totalOrders) * 100 : 0;

  // Top lý do hủy đơn
  const topCancellationReasons = await Order.aggregate([
    {
      $match: {
        ...dateCondition,
        status: "Cancelled",
        cancelReason: { $exists: true, $ne: null },
      },
    },
    {
      $group: {
        _id: "$cancelReason",
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 5 },
  ]);

  return {
    ordersByTime,
    ordersByStatus,
    cancellationRate,
    topCancellationReasons,
  };
};

/**
 * Lấy thống kê tồn kho
 */
const getInventoryStatistics = async () => {
  // Tổng sản phẩm hiện có
  const totalProducts = await Product.countDocuments();

  // Tổng số lượng tồn kho
  const inventoryResult = await Product.aggregate([
    { $unwind: "$variants" },
    { $group: { _id: null, totalStock: { $sum: "$variants.stock" } } },
  ]);
  const totalInventory = inventoryResult.length > 0 ? inventoryResult[0].totalStock : 0;

  // Sản phẩm gần hết hàng (stock < 10)
  const lowStockProducts = await Product.aggregate([
    { $unwind: "$variants" },
    { $match: { "variants.stock": { $lt: 10, $gt: 0 } } },
    {
      $group: {
        _id: "$_id",
        name: { $first: "$name" },
        totalLowStock: { $sum: 1 },
        variants: {
          $push: {
            id: "$variants._id",
            sku: "$variants.sku",
            size: "$variants.size",
            color: "$variants.color",
            stock: "$variants.stock",
          },
        },
      },
    },
    { $sort: { totalLowStock: -1 } },
  ]);

  // Sản phẩm đã hết hàng (stock = 0)
  const outOfStockProducts = await Product.aggregate([
    { $unwind: "$variants" },
    { $match: { "variants.stock": 0 } },
    {
      $group: {
        _id: "$_id",
        name: { $first: "$name" },
        totalOutOfStock: { $sum: 1 },
        variants: {
          $push: {
            id: "$variants._id",
            sku: "$variants.sku",
            size: "$variants.size",
            color: "$variants.color",
          },
        },
      },
    },
    { $sort: { totalOutOfStock: -1 } },
  ]);

  // Sản phẩm theo số lượng tồn kho (phân nhóm)
  const stockDistribution = await Product.aggregate([
    { $unwind: "$variants" },
    {
      $group: {
        _id: {
          $switch: {
            branches: [
              { case: { $eq: ["$variants.stock", 0] }, then: "Out of stock" },
              { case: { $lte: ["$variants.stock", 10] }, then: "Low stock (1-10)" },
              { case: { $lte: ["$variants.stock", 50] }, then: "Medium stock (11-50)" },
              { case: { $lte: ["$variants.stock", 100] }, then: "Good stock (51-100)" },
            ],
            default: "High stock (>100)",
          },
        },
        count: { $sum: 1 },
        products: { $addToSet: "$_id" },
      },
    },
    {
      $project: {
        stockLevel: "$_id", // Tạo trường mới tên là stockLevel, gán giá trị từ trường _id.
        count: 1,
        uniqueProductCount: { $size: "$products" }, // để đếm số lượng phần tử trong mảng products.
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return {
    totalProducts,
    totalInventory,
    lowStockProducts,
    outOfStockProducts,
    stockDistribution,
  };
};

export default {
  getOverviewStatistics,
  getRevenueStatistics,
  getTopProducts,
  getCustomerStatistics,
  getCategoryStatistics,
  getOrderStatistics,
  getInventoryStatistics,
};
