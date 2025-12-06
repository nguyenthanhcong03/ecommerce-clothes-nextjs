import Category from "../models/category.js";
import Product from "../models/product.js";
import imageService from "../services/imageService.js";
import AppError from "../utils/AppError.js";
import catchAsync from "../utils/catchAsync.js";
import { responseSuccess } from "../utils/responseHandler.js";

const getAllCategories = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, sortBy = "createdAt", order = "desc", search } = req.query;

  // Build query
  let query = {};

  // Search by name or description
  if (search) {
    query.$or = [{ name: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }];
  }

  // Count total documents
  const total = await Category.countDocuments(query);

  // Get categories with pagination and sorting
  const categories = await Category.find(query)
    .sort({ [sortBy]: order === "desc" ? -1 : 1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .select("-__v");

  const response = {
    data: categories,
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / limit),
  };

  responseSuccess(res, 200, "Lấy danh sách danh mục thành công", response);
});

const createCategory = catchAsync(async (req, res) => {
  const { name, description, priority } = req.body;

  if (!name) {
    throw new AppError(400, "Tên danh mục là bắt buộc");
  }

  // Upload ảnh nếu có
  let imageData = {};
  if (req.file) {
    try {
      const uploadResult = await imageService.uploadSingleImageFromMulter(req.file, "categories");
      imageData = {
        image: uploadResult.url,
        imagePublicId: uploadResult.publicId,
      };
    } catch (error) {
      throw new AppError(400, `Lỗi upload ảnh: ${error.message}`);
    }
  }

  // Create new category
  const newCategory = await Category.create({
    name,
    description,
    priority: priority || 0,
    ...imageData,
  });

  responseSuccess(res, 201, "Tạo danh mục thành công", newCategory);
});

const updateCategoryById = catchAsync(async (req, res) => {
  const categoryId = req.params.id;
  const { name, description, priority, removeImage } = req.body;

  const category = await Category.findById(categoryId);
  if (!category) throw new AppError(404, "Danh mục không tồn tại");

  const dataToUpdate = {};

  if (name !== undefined) dataToUpdate.name = name;
  if (description !== undefined) dataToUpdate.description = description;
  if (priority !== undefined) dataToUpdate.priority = priority;

  // Xử lý ảnh
  if (req.file) {
    // Xóa ảnh cũ nếu có
    if (category.imagePublicId) {
      try {
        await imageService.deleteImageFromCloudinary(category.imagePublicId);
      } catch (error) {
        console.error("Lỗi xóa ảnh cũ:", error);
      }
    }

    // Upload ảnh mới
    try {
      const uploadResult = await imageService.uploadSingleImageFromMulter(req.file, "categories");
      dataToUpdate.image = uploadResult.url;
      dataToUpdate.imagePublicId = uploadResult.publicId;
    } catch (error) {
      throw new AppError(400, `Lỗi upload ảnh: ${error.message}`);
    }
  } else if (removeImage === "true" && category.imagePublicId) {
    // Xóa ảnh hiện tại nếu được yêu cầu
    try {
      await imageService.deleteImageFromCloudinary(category.imagePublicId);
      dataToUpdate.image = null;
      dataToUpdate.imagePublicId = null;
    } catch (error) {
      console.error("Lỗi xóa ảnh:", error);
      throw new AppError(500, "Lỗi xóa ảnh từ Cloudinary");
    }
  }

  const updatedCategory = await Category.findByIdAndUpdate(categoryId, dataToUpdate, { new: true });

  responseSuccess(res, 200, "Cập nhật danh mục thành công", updatedCategory);
});

const getCategoryById = catchAsync(async (req, res) => {
  const categoryId = req.params.id;
  const category = await Category.findById(categoryId);
  if (!category) throw new AppError(404, "Danh mục không tồn tại");
  responseSuccess(res, 200, "Lấy danh mục thành công", category);
});

const deleteCategory = catchAsync(async (req, res) => {
  const categoryId = req.params.id;

  const category = await Category.findById(categoryId);
  if (!category) throw new AppError(404, "Danh mục không tồn tại");

  const count = await Product.countDocuments({ categoryId });
  if (count > 0) throw new AppError(400, "Không thể xóa danh mục vì vẫn còn sản phẩm liên quan");

  // Xóa ảnh từ Cloudinary nếu có
  if (category.imagePublicId) {
    try {
      await imageService.deleteImageFromCloudinary(category.imagePublicId);
    } catch (error) {
      console.error("Lỗi xóa ảnh từ Cloudinary:", error);
      // Không throw error để vẫn có thể xóa category
    }
  }

  const deletedCategory = await Category.findByIdAndDelete(categoryId);

  responseSuccess(res, 200, "Xóa danh mục thành công", deletedCategory);
});

// Delete category image
const deleteCategoryImage = catchAsync(async (req, res) => {
  const categoryId = req.params.id;

  const category = await Category.findById(categoryId);
  if (!category) throw new AppError(404, "Danh mục không tồn tại");

  if (!category.imagePublicId) {
    throw new AppError(404, "Danh mục không có ảnh");
  }

  // Xóa ảnh từ Cloudinary
  try {
    await imageService.deleteImageFromCloudinary(category.imagePublicId);
  } catch (error) {
    console.error("Lỗi xóa ảnh từ Cloudinary:", error);
    throw new AppError(500, "Lỗi xóa ảnh từ Cloudinary");
  }

  // Cập nhật category để xóa thông tin ảnh
  const updatedCategory = await Category.findByIdAndUpdate(
    categoryId,
    {
      image: null,
      imagePublicId: null,
    },
    { new: true }
  );

  responseSuccess(res, 200, "Xóa ảnh danh mục thành công", updatedCategory);
});

export default {
  getAllCategories,
  createCategory,
  updateCategoryById,
  getCategoryById,
  deleteCategory,
  deleteCategoryImage,
};
