import statisticsService from "../services/statisticsService.js";

// Lấy thống kê tổng quan
const getOverviewStatistics = async (req, res) => {
  try {
    const stats = await statisticsService.getOverviewStatistics();
    console.log("stats", stats);
    res.json({
      success: true,
      statistics: stats,
    });
  } catch (error) {
    console.error("Error fetching overview statistics:", error);
    res.status(500).json({
      success: false,
      message: "Không thể lấy thống kê tổng quan",
      error: error.message,
    });
  }
};

// Lấy thống kê doanh thu
const getRevenueStatistics = async (req, res) => {
  try {
    const { period, startDate, endDate } = req.query;
    const revenueStats = await statisticsService.getRevenueStatistics(period, startDate, endDate);

    res.json({
      success: true,
      statistics: revenueStats,
    });
  } catch (error) {
    console.error("Error fetching revenue statistics:", error);
    res.status(500).json({
      success: false,
      message: "Không thể lấy thống kê doanh thu",
      error: error.message,
    });
  }
};

// Lấy thống kê sản phẩm bán chạy
const getTopProducts = async (req, res) => {
  try {
    const { limit = 10, period, startDate, endDate } = req.query;
    const topProducts = await statisticsService.getTopProducts(parseInt(limit), period, startDate, endDate);

    res.json({
      success: true,
      products: topProducts,
    });
  } catch (error) {
    console.error("Error fetching top products:", error);
    res.status(500).json({
      success: false,
      message: "Không thể lấy thống kê sản phẩm bán chạy",
      error: error.message,
    });
  }
};

// Lấy thống kê khách hàng
const getCustomerStatistics = async (req, res) => {
  try {
    const { period, startDate, endDate } = req.query;
    const customerStats = await statisticsService.getCustomerStatistics(period, startDate, endDate);

    res.json({
      success: true,
      statistics: customerStats,
    });
  } catch (error) {
    console.error("Error fetching customer statistics:", error);
    res.status(500).json({
      success: false,
      message: "Không thể lấy thống kê khách hàng",
      error: error.message,
    });
  }
};

// Lấy thống kê theo danh mục sản phẩm
const getCategoryStatistics = async (req, res) => {
  try {
    const { period, startDate, endDate } = req.query;
    const categoryStats = await statisticsService.getCategoryStatistics(period, startDate, endDate);

    res.json({
      success: true,
      statistics: categoryStats,
    });
  } catch (error) {
    console.error("Error fetching category statistics:", error);
    res.status(500).json({
      success: false,
      message: "Không thể lấy thống kê theo danh mục sản phẩm",
      error: error.message,
    });
  }
};

// Lấy thống kê đơn hàng
const getOrderStatistics = async (req, res) => {
  try {
    const { period, startDate, endDate } = req.query;
    const orderStats = await statisticsService.getOrderStatistics(period, startDate, endDate);

    res.json({
      success: true,
      statistics: orderStats,
    });
  } catch (error) {
    console.error("Error fetching order statistics:", error);
    res.status(500).json({
      success: false,
      message: "Không thể lấy thống kê đơn hàng",
      error: error.message,
    });
  }
};

// Lấy thống kê tồn kho
const getInventoryStatistics = async (req, res) => {
  try {
    const inventoryStats = await statisticsService.getInventoryStatistics();

    res.json({
      success: true,
      statistics: inventoryStats,
    });
  } catch (error) {
    console.error("Error fetching inventory statistics:", error);
    res.status(500).json({
      success: false,
      message: "Không thể lấy thống kê tồn kho",
      error: error.message,
    });
  }
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
