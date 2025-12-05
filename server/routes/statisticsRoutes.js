import express from "express";
import statisticsController from "../controllers/statisticsController.js";
import { verifyToken, checkRole } from "../middlewares/auth.js";

const router = express.Router();

// Middleware xÃ¡c thá»±c quyá»n admin cho táº¥t cáº£ cÃ¡c route
// router.use(verifyAccessToken, isAdmin);

// Láº¥y thá»‘ng kÃª tá»•ng quan
router.get("/overview", statisticsController.getOverviewStatistics);

// Láº¥y thá»‘ng kÃª doanh thu
router.get("/revenue", statisticsController.getRevenueStatistics);

// Láº¥y thá»‘ng kÃª sáº£n pháº©m bÃ¡n cháº¡y
router.get("/top-products", statisticsController.getTopProducts);

// Láº¥y thá»‘ng kÃª khÃ¡ch hÃ ng
router.get("/customers", statisticsController.getCustomerStatistics);

// Láº¥y thá»‘ng kÃª theo danh má»¥c sáº£n pháº©m
router.get("/categories", statisticsController.getCategoryStatistics);

// Láº¥y thá»‘ng kÃª Ä‘Æ¡n hÃ ng
router.get("/orders", statisticsController.getOrderStatistics);

// Láº¥y thá»‘ng kÃª tá»“n kho
router.get("/inventory", statisticsController.getInventoryStatistics);

export default router;
