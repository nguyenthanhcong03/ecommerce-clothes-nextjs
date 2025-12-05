import mongoose from "mongoose";
import Category from "../models/category.js";
import Product from "../models/product.js";
import imageService from "../services/imageService.js";
import AppError from "../utils/AppError.js";
import catchAsync from "../utils/catchAsync.js";
import { responseSuccess } from "../utils/responseHandler.js";

// Get all products
const getAllProducts = catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search,
    category,
    minPrice,
    maxPrice,
    tags,
    size,
    color,
    rating,
    stockStatus,
    featured,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);
  const skip = (pageNumber - 1) * limitNumber;

  // Xây dựng query động dựa trên các tham số lọc
  const query = {};

  // Lọc theo tìm kiếm văn bản
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { tags: { $in: [new RegExp(search, "i")] } },
    ];
  }

  // Lọc theo danh mục
  if (category) {
    query.categoryId = category;
  }

  // Lọc theo khoảng giá
  if (minPrice || maxPrice) {
    const priceFilter = {};
    if (minPrice) priceFilter.$gte = parseFloat(minPrice);
    if (maxPrice) priceFilter.$lte = parseFloat(maxPrice);
    query["variants.price"] = priceFilter;
  }

  // Lọc theo tags
  if (tags) {
    query.tags = Array.isArray(tags) ? { $in: tags } : tags;
  }

  // Lọc theo size
  if (size) {
    query["variants.size"] = Array.isArray(size) ? { $in: size } : size;
  }

  // Lọc theo color
  if (color) {
    query["variants.color"] = Array.isArray(color) ? { $in: color } : color;
  }

  // Lọc theo rating
  if (rating) {
    query.averageRating = { $gte: parseFloat(rating) };
  }

  // Lọc theo featured
  if (featured !== undefined) {
    query.featured = featured === "true";
  }

  // Lọc theo trạng thái stock
  if (stockStatus) {
    if (stockStatus === "in-stock") {
      query["variants.stock"] = { $gt: 0 };
    } else if (stockStatus === "out-of-stock") {
      query["variants.stock"] = 0;
    }
  }

  // Tạo sort object
  const sort = {};
  if (sortBy === "price") {
    sort["variants.price"] = sortOrder === "asc" ? 1 : -1;
  } else if (sortBy === "popular") {
    sort.salesCount = sortOrder === "asc" ? 1 : -1;
  } else if (sortBy === "rating") {
    sort.averageRating = sortOrder === "asc" ? 1 : -1;
  } else {
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;
  }

  // Thực hiện query
  const [products, total] = await Promise.all([
    Product.find(query).populate("categoryId", "name").sort(sort).skip(skip).limit(limitNumber),
    Product.countDocuments(query),
  ]);

  const totalPages = Math.ceil(total / limitNumber);

  responseSuccess(res, 200, "Lấy danh sách sản phẩm thành công", {
    data: products,
    page: pageNumber,
    totalPages,
    total,
    limit: limitNumber,
  });
});

// Create product
const createProduct = catchAsync(async (req, res) => {
  const { name, description, categoryId, brand, variants, tags, featured = false } = req.body;

  if (!name || !categoryId || !brand || !variants) {
    throw new AppError(400, "Vui lòng điền đầy đủ thông tin bắt buộc");
  }

  // Parse variants nếu được gửi dưới dạng string (khi có file upload)
  let parsedVariants;
  try {
    parsedVariants = typeof variants === "string" ? JSON.parse(variants) : variants;
  } catch (error) {
    throw new AppError(400, "Dữ liệu variants không hợp lệ");
  }

  if (!Array.isArray(parsedVariants) || parsedVariants.length === 0) {
    throw new AppError(400, "Sản phẩm phải có ít nhất một biến thể");
  }

  // Kiểm tra danh mục tồn tại
  const categoryExists = await Category.findById(categoryId);
  if (!categoryExists) {
    throw new AppError(400, "Danh mục không tồn tại");
  }

  // Upload ảnh nếu có
  let uploadedImages = [];
  if (req.files && req.files.length > 0) {
    try {
      uploadedImages = await imageService.uploadMultipleImagesFromMulter(req.files, "products");
    } catch (error) {
      throw new AppError(400, `Lỗi upload ảnh: ${error.message}`);
    }
  }

  // Parse tags nếu được gửi dưới dạng string
  let parsedTags;
  try {
    parsedTags = typeof tags === "string" ? JSON.parse(tags) : tags || [];
  } catch (error) {
    parsedTags = [];
  }

  // Tạo sản phẩm mới
  const newProduct = await Product.create({
    name,
    description,
    categoryId,
    brand,
    variants: parsedVariants,
    images: uploadedImages,
    tags: parsedTags,
    featured: Boolean(featured),
  });

  // Populate categoryId để trả về thông tin category
  await newProduct.populate("categoryId", "name");

  responseSuccess(res, 201, "Tạo sản phẩm thành công", newProduct);
});

// Get product by ID
const getProductById = catchAsync(async (req, res) => {
  const { pid } = req.params;
  const product = await Product.findById(pid).populate("categoryId", "name");
  if (!product) {
    throw new AppError(404, "Không tìm thấy sản phẩm");
  }
  responseSuccess(res, 200, "Lấy thông tin sản phẩm thành công", product);
});

// Update product
const updateProduct = catchAsync(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findById(id);
  if (!product) {
    throw new AppError(404, "Không tìm thấy sản phẩm");
  }

  const { categoryId, variants, tags, existingImages } = req.body;

  // Kiểm tra danh mục nếu có thay đổi
  if (categoryId && categoryId !== product.categoryId.toString()) {
    const categoryExists = await Category.findById(categoryId);
    if (!categoryExists) {
      throw new AppError(400, "Danh mục không tồn tại");
    }
  }

  // Xử lý ảnh mới nếu có
  let newImages = [];
  if (req.files && req.files.length > 0) {
    try {
      newImages = await imageService.uploadMultipleImagesFromMulter(req.files, "products");
    } catch (error) {
      throw new AppError(400, `Lỗi upload ảnh: ${error.message}`);
    }
  }

  // Xử lý ảnh hiện tại (giữ lại hoặc xóa)
  let finalImages = [];

  // Thêm ảnh được giữ lại từ existingImages
  if (existingImages) {
    try {
      const parsedExistingImages = typeof existingImages === "string" ? JSON.parse(existingImages) : existingImages;
      if (Array.isArray(parsedExistingImages)) {
        finalImages = [...parsedExistingImages];
      }
    } catch (error) {
      console.warn("Lỗi parse existingImages:", error);
    }
  }

  // Thêm ảnh mới
  finalImages = [...finalImages, ...newImages];

  // Parse variants và tags nếu cần
  let updateData = { ...req.body };

  if (variants) {
    try {
      updateData.variants = typeof variants === "string" ? JSON.parse(variants) : variants;
    } catch (error) {
      throw new AppError(400, "Dữ liệu variants không hợp lệ");
    }
  }

  if (tags) {
    try {
      updateData.tags = typeof tags === "string" ? JSON.parse(tags) : tags;
    } catch (error) {
      updateData.tags = [];
    }
  }

  // Cập nhật ảnh
  updateData.images = finalImages;

  // Xóa các trường không cần thiết khỏi updateData
  delete updateData.existingImages;

  const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).populate(
    "categoryId",
    "name"
  );

  responseSuccess(res, 200, "Cập nhật sản phẩm thành công", updatedProduct);
});

// Delete product
const deleteProduct = catchAsync(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(400, "ID sản phẩm không hợp lệ");
  }

  const product = await Product.findById(id);
  if (!product) {
    throw new AppError(404, "Không tìm thấy sản phẩm");
  }

  // Xóa ảnh từ Cloudinary trước khi xóa sản phẩm
  if (product.images && product.images.length > 0) {
    try {
      const publicIds = product.images.map((image) => image.publicId).filter(Boolean);
      if (publicIds.length > 0) {
        await imageService.deleteMultipleImagesFromCloudinary(publicIds);
      }
    } catch (error) {
      console.error("Lỗi xóa ảnh từ Cloudinary:", error);
      // Không throw error ở đây để vẫn có thể xóa sản phẩm từ database
    }
  }

  await Product.findByIdAndDelete(id);

  responseSuccess(res, 200, "Xóa sản phẩm thành công");
});

// Get featured products
const getFeaturedProducts = catchAsync(async (req, res) => {
  const { limit = 8 } = req.query;

  const products = await Product.find({ featured: true })
    .populate("categoryId", "name")
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  responseSuccess(res, 200, "Lấy danh sách sản phẩm nổi bật thành công", products);
});

// Get products by category
const getProductsByCategory = catchAsync(async (req, res) => {
  const { categoryId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);
  const skip = (pageNumber - 1) * limitNumber;

  const [products, total] = await Promise.all([
    Product.find({ categoryId }).populate("categoryId", "name").skip(skip).limit(limitNumber).sort({ createdAt: -1 }),
    Product.countDocuments({ categoryId }),
  ]);

  const totalPages = Math.ceil(total / limitNumber);

  responseSuccess(res, 200, "Lấy sản phẩm theo danh mục thành công", {
    products,
    pagination: {
      currentPage: pageNumber,
      totalPages,
      totalProducts: total,
      limit: limitNumber,
    },
  });
});

const getRelatedProducts = catchAsync(async (req, res) => {
  const { pid } = req.params;
  const { limit = 4 } = req.query;

  const product = await Product.findById(pid);

  if (!product) throw new AppError(404, "Không tìm thấy sản phẩm");

  // Tìm các sản phẩm có cùng danh mục, nhưng không phải sản phẩm hiện tại
  const relatedProducts = await Product.find({
    categoryId: product.categoryId,
    _id: { $ne: pid },
  })
    .limit(Number(limit))
    .populate("categoryId", "name")
    .select("-__v");

  responseSuccess(res, 200, "Lấy sản phẩm liên quan thành công", relatedProducts);
});

export default {
  getAllProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getProductsByCategory,
  getRelatedProducts,
};
