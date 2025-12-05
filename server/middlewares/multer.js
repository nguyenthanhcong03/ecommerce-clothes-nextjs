import multer from "multer";
import path from "path";
import AppError from "../utils/AppError.js";

// Cấu hình storage để lưu file vào memory
const storage = multer.memoryStorage();

// File filter để chỉ chấp nhận file ảnh
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new AppError(400, "Chỉ chấp nhận file ảnh (jpeg, jpg, png, gif, webp)"), false);
  }
};

// Cấu hình multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Giới hạn 5MB mỗi file
  },
  fileFilter: fileFilter,
});

// Middleware để upload nhiều ảnh sản phẩm (tối đa 10 ảnh)
export const uploadProductImages = upload.array("images", 10);

// Middleware để upload ảnh đơn
export const uploadSingleImage = upload.single("image");

// Middleware xử lý lỗi multer
export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return next(new AppError(400, "Kích thước file vượt quá 5MB"));
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return next(new AppError(400, "Số lượng file vượt quá giới hạn cho phép"));
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return next(new AppError(400, "Trường file không được hỗ trợ"));
    }
    return next(new AppError(400, `Lỗi upload file: ${err.message}`));
  }
  next(err);
};

export default { uploadProductImages, uploadSingleImage, handleMulterError };
