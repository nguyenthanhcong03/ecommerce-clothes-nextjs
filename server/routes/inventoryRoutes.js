import express from "express";
import inventoryController from "../controllers/inventoryController.js";
import { verifyToken, checkRole } from "../middlewares/auth.js";

const router = express.Router();
// Táº¥t cáº£ cÃ¡c routes Ä‘á»u yÃªu cáº§u xÃ¡c thá»±c vÃ  pháº£i lÃ  admin
router.use(verifyToken, checkRole("admin"));

// Cáº­p nháº­t sá»‘ lÆ°á»£ng tá»“n kho cho má»™t biáº¿n thá»ƒ
router.patch("/products/:productId/variants/:variantId/stock", inventoryController.updateVariantStock);

// Cáº­p nháº­t hÃ ng loáº¡t sá»‘ lÆ°á»£ng tá»“n kho
router.post("/bulk-update", inventoryController.bulkUpdateStock);

// Láº¥y danh sÃ¡ch sáº£n pháº©m cÃ³ tá»“n kho tháº¥p
router.get("/low-stock", inventoryController.getLowStockProducts);

// Láº¥y lá»‹ch sá»­ xuáº¥t nháº­p kho
router.get("/history", inventoryController.getInventoryHistory);

export default router;
