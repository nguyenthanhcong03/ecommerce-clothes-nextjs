import cloudinary from "../config/cloudinary.js";

/**
 * Upload một file từ buffer (Multer) lên Cloudinary
 */
const uploadImageFromBuffer = async (buffer, folder = "products") => {
  try {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "image",
          transformation: [
            { width: 1000, height: 1000, crop: "limit" },
            { quality: "auto:good" },
            { fetch_format: "auto" },
          ],
        },
        (error, result) => {
          if (error) {
            console.error("Lỗi upload ảnh lên Cloudinary:", error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      uploadStream.end(buffer);
    });
  } catch (error) {
    console.error("Lỗi trong quá trình upload ảnh:", error);
    throw error;
  }
};

/**
 * Upload nhiều ảnh từ Multer files
 */
const uploadMultipleImagesFromMulter = async (files, folder = "products") => {
  try {
    if (!files || files.length === 0) {
      return [];
    }

    const uploadPromises = files.map((file) => uploadImageFromBuffer(file.buffer, folder));
    const results = await Promise.all(uploadPromises);

    return results.map((result) => ({
      url: result.secure_url,
      publicId: result.public_id,
    }));
  } catch (error) {
    console.error("Lỗi upload nhiều ảnh:", error);
    throw error;
  }
};

/**
 * Upload ảnh đơn từ Multer file
 */
const uploadSingleImageFromMulter = async (file, folder = "products") => {
  try {
    if (!file || !file.buffer) {
      throw new Error("File không hợp lệ");
    }

    const result = await uploadImageFromBuffer(file.buffer, folder);
    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error("Lỗi upload ảnh đơn:", error);
    throw error;
  }
};

/**
 * Xóa ảnh từ Cloudinary bằng publicId
 */
const deleteImageFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Lỗi xóa ảnh từ Cloudinary:", error);
    throw error;
  }
};

/**
 * Xóa nhiều ảnh từ Cloudinary
 */
const deleteMultipleImagesFromCloudinary = async (publicIds) => {
  try {
    if (!Array.isArray(publicIds) || publicIds.length === 0) {
      return [];
    }

    const deletePromises = publicIds.map((publicId) =>
      deleteImageFromCloudinary(publicId).catch((error) => ({
        publicId,
        error: error.message,
      }))
    );

    const results = await Promise.all(deletePromises);
    return results;
  } catch (error) {
    console.error("Lỗi xóa nhiều ảnh:", error);
    throw error;
  }
};

export default {
  uploadImageFromBuffer,
  uploadMultipleImagesFromMulter,
  uploadSingleImageFromMulter,
  deleteImageFromCloudinary,
  deleteMultipleImagesFromCloudinary,
};
