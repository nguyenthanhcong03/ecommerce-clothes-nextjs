import mongoose from "mongoose";
import inventoryService from "../services/inventoryService.js";
import AppError from "../utils/AppError.js";
import catchAsync from "../utils/catchAsync.js";

/**
 * Cập nhật số lượng tồn kho cho một biến thể sản phẩm
 */
const updateVariantStock = catchAsync(async (req, res) => {
  const { productId, variantId } = req.params;
  const { quantity, reason, notes } = req.body;
  const userId = req.user.id;

  // Kiểm tra tham số đầu vào
  if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
    throw new AppError(400, "ID sản phẩm không hợp lệ");
  }

  if (!variantId || !mongoose.Types.ObjectId.isValid(variantId)) {
    throw new AppError(400, "ID biến thể không hợp lệ");
  }

  if (quantity === undefined || !Number.isInteger(Number(quantity)) || Number(quantity) < 0) {
    throw new AppError(400, "Số lượng tồn kho phải là số nguyên không âm");
  }

  if (!reason) {
    throw new AppError(400, "Lý do cập nhật là bắt buộc");
  }

  const updatedVariant = await inventoryService.updateVariantStock(
    productId,
    variantId,
    Number(quantity),
    reason,
    notes,
    userId
  );

  res.status(200).json({
    success: true,
    message: "Cập nhật số lượng tồn kho thành công",
    data: updatedVariant,
  });
});

/**
 * Cập nhật hàng loạt số lượng tồn kho
 */
const bulkUpdateStock = catchAsync(async (req, res) => {
  const { items, reason } = req.body;
  const userId = req.user.id;

  if (!Array.isArray(items) || items.length === 0) {
    throw new AppError(400, "Danh sách cập nhật không hợp lệ");
  }

  if (!reason) {
    throw new AppError(400, "Lý do cập nhật là bắt buộc");
  }

  // Kiểm tra cấu trúc mỗi item
  items.forEach((item, index) => {
    if (!item.productId || !mongoose.Types.ObjectId.isValid(item.productId)) {
      throw new AppError(400, `ID sản phẩm không hợp lệ tại vị trí ${index}`);
    }

    if (!item.variantId || !mongoose.Types.ObjectId.isValid(item.variantId)) {
      throw new AppError(400, `ID biến thể không hợp lệ tại vị trí ${index}`);
    }

    if (item.quantity === undefined || !Number.isInteger(Number(item.quantity)) || Number(item.quantity) < 0) {
      throw new AppError(400, `Số lượng tồn kho phải là số nguyên không âm tại vị trí ${index}`);
    }
  });

  const results = await inventoryService.bulkUpdateStock(items, reason, userId);

  res.status(200).json({
    success: true,
    message: "Cập nhật hàng loạt số lượng tồn kho thành công",
    data: results,
  });
});

/**
 * Lấy danh sách sản phẩm có tồn kho thấp
 */
const getLowStockProducts = catchAsync(async (req, res) => {
  const { threshold = 5, page = 1, limit = 20 } = req.query;

  const result = await inventoryService.getLowStockProducts(Number(threshold), Number(page), Number(limit));

  res.status(200).json({
    success: true,
    data: result.products,
    pagination: result.pagination,
  });
});

/**
 * Lấy lịch sử xuất nhập kho
 */
const getInventoryHistory = catchAsync(async (req, res) => {
  const {
    productId,
    variantId,
    sku,
    type,
    startDate,
    endDate,
    page = 1,
    limit = 20,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const filters = {
    productId,
    variantId,
    sku,
    type,
    startDate,
    endDate,
  };

  const result = await inventoryService.getInventoryHistory(filters, Number(page), Number(limit), sortBy, sortOrder);

  res.status(200).json({
    success: true,
    data: result.history,
    pagination: result.pagination,
  });
});

export default {
  updateVariantStock,
  bulkUpdateStock,
  getLowStockProducts,
  getInventoryHistory,
};
