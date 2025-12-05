import express from "express";
import reviewController from "../controllers/reviewController.js";
import { verifyToken, checkRole  } from "../middlewares/auth.js";

const router = express.Router();

// CÃ¡c routes cÃ´ng khai (khÃ´ng cáº§n Ä‘Äƒng nháº­p)
// Láº¥y táº¥t cáº£ Ä‘Ã¡nh giÃ¡ cá»§a má»™t sáº£n pháº©m
router.get("/product/:productId", reviewController.getProductReviews);

// CÃ¡c routes yÃªu cáº§u xÃ¡c thá»±c (Ä‘Äƒng nháº­p)
// Táº¡o Ä‘Ã¡nh giÃ¡ má»›i cho sáº£n pháº©m Ä‘Ã£ mua
router.post("/", verifyToken, reviewController.createReview);
// Láº¥y táº¥t cáº£ Ä‘Ã¡nh giÃ¡ cá»§a ngÆ°á»i dÃ¹ng hiá»‡n táº¡i
router.get("/user", verifyToken, reviewController.getUserReviews);
// Láº¥y danh sÃ¡ch sáº£n pháº©m cÃ³ thá»ƒ Ä‘Ã¡nh giÃ¡ tá»« má»™t Ä‘Æ¡n hÃ ng Ä‘Ã£ giao
router.get("/order/:orderId/reviewable", verifyToken, reviewController.getReviewableProducts);

// CÃ¡c routes dÃ nh cho admin
// Láº¥y táº¥t cáº£ Ä‘Ã¡nh giÃ¡ (Admin only)
router.get("/all", verifyToken, checkRole("admin"), reviewController.getAllReviews);
// ThÃªm pháº£n há»“i cá»§a shop/admin vÃ o Ä‘Ã¡nh giÃ¡
router.patch("/:reviewId/reply", verifyToken, checkRole("admin"), reviewController.replyToReview);

export default router;


