import express from "express";
import orderController from "../controllers/orderController.js";
import { verifyToken, checkRole } from "../middlewares/auth.js";

const router = express.Router();

// User routes
router.post("/", verifyToken, orderController.createOrder);
router.get("/user", verifyToken, orderController.getUserOrders);
router.get("/:id", verifyToken, orderController.getOrderById);
router.post("/:id/cancel", verifyToken, orderController.cancelOrder);
router.get("/search", verifyToken, orderController.searchOrders);

// Admin routes
router.get("/", verifyToken, checkRole("admin"), orderController.getAllOrders);
router.patch("/:id/status", verifyToken, checkRole("admin"), orderController.updateOrderStatus);
router.patch("/:id/payment", verifyToken, checkRole("admin"), orderController.updatePaymentStatus);

export default router;
