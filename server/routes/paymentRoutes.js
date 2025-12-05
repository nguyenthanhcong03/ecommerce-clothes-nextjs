import express from "express";
import { verifyToken } from "../middlewares/auth.js";
import paymentController from "../controllers/paymentController.js";

const router = express.Router();

// Route thanh toán VNPay
router.post("/vnpay/create", verifyToken, paymentController.createVnpayPayment);
router.get("/vnpay/return", paymentController.vnpayReturn); // Xử lý kết quả thanh toán trả về từ VNPay

// Route hoàn tiền VNPay
router.post("/vnpay/refund", verifyToken, paymentController.vnpayRefund);

export default router;
