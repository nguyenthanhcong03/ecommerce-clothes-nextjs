import express from "express";
const router = express.Router();
import couponController from "../controllers/couponController.js";
import { verifyToken, checkRole } from "../middlewares/auth.js";

// Route cÃ´ng khai
// GET /api/coupons/active - Láº¥y danh sÃ¡ch coupon Ä‘ang cÃ³ hiá»‡u lá»±c (cho khÃ¡ch hÃ ng)
router.get("/active", couponController.getActiveCoupons);

// GET /api/coupons/validate/:code - Kiá»ƒm tra mÃ£ coupon cÃ³ há»£p lá»‡ khÃ´ng
router.get("/validate/:code", couponController.validateCoupon);

// Routes chá»‰ dÃ nh cho admin
// GET /api/coupons - Láº¥y danh sÃ¡ch coupon cÃ³ phÃ¢n trang vÃ  lá»c
router.get("/", verifyToken, checkRole("admin"), couponController.getCoupons);

// POST /api/coupons - Táº¡o má»›i coupon
router.post("/", verifyToken, checkRole("admin"), couponController.createCoupon);

// GET /api/coupons/:id - Láº¥y thÃ´ng tin chi tiáº¿t cá»§a má»™t coupon
router.get("/:id", verifyToken, checkRole("admin"), couponController.getCouponById);

// PUT /api/coupons/:id - Cáº­p nháº­t thÃ´ng tin coupon
router.put("/:id", verifyToken, checkRole("admin"), couponController.updateCoupon);

// DELETE /api/coupons/:id - XÃ³a coupon
router.delete("/:id", verifyToken, checkRole("admin"), couponController.deleteCoupon);

// PATCH /api/coupons/:id/toggle-status - Cáº­p nháº­t tráº¡ng thÃ¡i kÃ­ch hoáº¡t cá»§a coupon
router.patch("/:id/toggle-status", verifyToken, checkRole("admin"), couponController.toggleCouponStatus);

export default router;
