import express from "express";
import categoryController from "../controllers/categoryController.js";
import { verifyToken, checkRole } from "../middlewares/auth.js";
import { uploadSingleImage, handleMulterError } from "../middlewares/multer.js";

const router = express.Router();

// Public routes
router.get("/", categoryController.getAllCategories);
router.get("/:id", categoryController.getCategoryById);

// Admin routes
router.post(
  "/",
  verifyToken,
  checkRole("admin"),
  uploadSingleImage,
  handleMulterError,
  categoryController.createCategory
);
router.put(
  "/:id",
  verifyToken,
  checkRole("admin"),
  uploadSingleImage,
  handleMulterError,
  categoryController.updateCategoryById
);
router.delete("/:id", verifyToken, checkRole("admin"), categoryController.deleteCategory);
router.delete("/:id/image", verifyToken, checkRole("admin"), categoryController.deleteCategoryImage);

export default router;
