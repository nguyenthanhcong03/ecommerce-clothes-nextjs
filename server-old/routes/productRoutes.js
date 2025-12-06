import express from "express";
import productController from "../controllers/productController.js";
import { verifyToken, checkRole } from "../middlewares/auth.js";
import { uploadProductImages, handleMulterError } from "../middlewares/multer.js";

const router = express.Router();
// Routes cho public
router.get("/", productController.getAllProducts);
router.get("/featured", productController.getFeaturedProducts);
router.get("/category/:categoryId", productController.getProductsByCategory);
router.get("/:pid", productController.getProductById);
router.get("/:pid/related", productController.getRelatedProducts);

// Routes cho Admin
router.post(
  "/",
  verifyToken,
  checkRole("admin"),
  uploadProductImages,
  handleMulterError,
  productController.createProduct
);
router.put(
  "/:pid",
  verifyToken,
  checkRole("admin"),
  uploadProductImages,
  handleMulterError,
  productController.updateProduct
);
router.delete("/:pid", verifyToken, checkRole("admin"), productController.deleteProduct);

export default router;
