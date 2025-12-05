import Cart from "../models/cart.js";
import Product from "../models/product.js";
import AppError from "../utils/AppError.js";
import { syncCartItemSnapshots } from "../utils/cart.utils.js";
import catchAsync from "../utils/catchAsync.js";
import { responseSuccess } from "../utils/responseHandler.js";

const getCart = catchAsync(async (req, res) => {
  const userId = req.user?._id;

  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = new Cart({ userId, items: [] });
  }

  // Cập nhật snapshot
  await syncCartItemSnapshots(cart);

  responseSuccess(res, 200, "Lấy giỏ hàng thành công", cart.items);
});

const addToCart = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const { productId, variantId, quantity } = req.body;

  // Kiểm tra dữ liệu đầu vào
  if (!productId || !variantId || !quantity || quantity <= 0) {
    throw new AppError(400, "Thông tin sản phẩm không hợp lệ");
  }

  // Kiểm tra sản phẩm tồn tại
  const product = await Product.findById(productId);
  if (!product) throw new AppError(404, "Sản phẩm không tồn tại");

  // Kiểm tra biến thể tồn tại
  const variant = product.variants.id(variantId);
  if (!variant) throw new AppError(404, "Biến thể không tồn tại");

  // Kiểm tra tồn kho
  if (variant.stock < quantity) {
    throw new AppError(400, "Số lượng sản phẩm trong kho không đủ");
  }

  // Tìm hoặc tạo giỏ hàng
  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = new Cart({ userId, items: [] });
  }

  // Kiểm tra item đã tồn tại trong giỏ hàng
  const existingItem = cart.items.find(
    (item) => item.productId.toString() === productId && item.variantId.toString() === variantId
  );

  if (existingItem) {
    // Cập nhật số lượng
    const newQuantity = existingItem.quantity + quantity;
    if (newQuantity > variant.stock) {
      existingItem.quantity = variant.stock;
    } else {
      existingItem.quantity = newQuantity;
    }
  } else {
    // Thêm item mới
    cart.items.push({
      productId,
      variantId,
      quantity,
      snapshot: {
        name: product.name,
        price: variant.price,
        originalPrice: variant.originalPrice,
        color: variant.color,
        size: variant.size,
        image: product.images?.[0],
      },
      isAvailable: variant.stock > 0,
    });
  }

  await cart.save();
  responseSuccess(res, 201, "Thêm sản phẩm vào giỏ hàng thành công", cart.items);
});

const updateCartItem = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const { itemId } = req.params;
  const { quantity } = req.body;

  // Kiểm tra dữ liệu đầu vào
  if (!itemId || typeof quantity !== "number" || quantity < 0) {
    throw new AppError(400, "Dữ liệu không hợp lệ");
  }

  // Tìm giỏ hàng
  const cart = await Cart.findOne({ userId });
  if (!cart) throw new AppError(404, "Không tìm thấy giỏ hàng");

  const itemIndex = cart.items.findIndex((item) => item._id.toString() === itemId);
  if (itemIndex === -1) throw new AppError(404, "Không tìm thấy sản phẩm trong giỏ hàng");

  // Nếu quantity = 0 → xóa item khỏi giỏ
  if (quantity === 0) {
    cart.items.splice(itemIndex, 1);
  } else {
    const cartItem = cart.items[itemIndex];
    // Kiểm tra tồn kho
    if (cartItem.snapshot.stock < quantity) throw new AppError(400, "Số lượng sản phẩm trong kho không đủ");

    // Cập nhật số lượng
    cartItem.quantity = quantity;
  }

  await cart.save();

  responseSuccess(res, 200, "Cập nhật giỏ hàng thành công", cart.items);
});

const removeCartItem = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const { itemId } = req.params;

  // Tìm giỏ hàng
  const cart = await Cart.findOne({ userId });
  if (!cart) throw new AppError(404, "Không tìm thấy giỏ hàng");

  // Tìm vị trí sản phẩm trong giỏ
  const itemIndex = cart.items.findIndex((item) => item._id.toString() === itemId);
  if (itemIndex === -1) throw new AppError(404, "Không tìm thấy sản phẩm trong giỏ hàng");

  // Xóa sản phẩm khỏi giỏ
  cart.items.splice(itemIndex, 1);
  await cart.save();

  responseSuccess(res, 200, "Xóa sản phẩm khỏi giỏ hàng thành công", cart.items);
});

const removeMultipleCartItems = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const { itemIds } = req.body;

  // Kiểm tra dữ liệu đầu vào
  if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
    throw new AppError(400, "Mảng itemId hợp lệ là bắt buộc");
  }

  // Tìm giỏ hàng
  const cart = await Cart.findOne({ userId });
  if (!cart) throw new AppError(404, "Không tìm thấy giỏ hàng");

  // Lọc ra các items cần giữ lại (không có trong danh sách xóa)
  const initialItemsCount = cart.items.length;
  cart.items = cart.items.filter((item) => !itemIds.includes(item._id.toString()));

  // Kiểm tra số lượng items đã xóa
  const removedItemsCount = initialItemsCount - cart.items.length;

  if (removedItemsCount === 0) {
    throw new AppError(404, "Không tìm thấy sản phẩm nào phù hợp trong giỏ hàng");
  }

  // Lưu giỏ hàng đã cập nhật
  await cart.save();

  responseSuccess(res, 200, `Đã xóa ${removedItemsCount} sản phẩm khỏi giỏ hàng`, cart.items);
});

const clearCart = catchAsync(async (req, res) => {
  const userId = req.user._id;

  // Tìm giỏ hàng của người dùng
  const cart = await Cart.findOne({ userId });
  if (!cart) throw new AppError(404, "Không tìm thấy giỏ hàng");

  // Xóa toàn bộ sản phẩm trong giỏ
  cart.items = [];
  await cart.save();

  responseSuccess(res, 200, "Xóa tất cả sản phẩm trong giỏ hàng thành công", cart.items);
});

export default {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
  removeMultipleCartItems,
  clearCart,
};
