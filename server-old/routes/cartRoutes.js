import express from "express";
import cartController from "../controllers/cartController.js";

const router = express.Router();
import { checkRole, verifyToken } from "../middlewares/auth.js";

router.get("/", verifyToken, cartController.getCart);
router.post("/", verifyToken, cartController.addToCart);
router.delete("/multiple", verifyToken, cartController.removeMultipleCartItems);
router.delete("/clear", verifyToken, cartController.clearCart);
router.patch("/:itemId", verifyToken, cartController.updateCartItem);
router.delete("/:itemId", verifyToken, cartController.removeCartItem);

export default router;
