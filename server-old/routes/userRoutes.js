import express from "express";
import userController from "../controllers/userController.js";
import { verifyToken, checkRole } from "../middlewares/auth.js";

const router = express.Router();
// Láº¥y thÃ´ng tin cá»§a ngÆ°á»i dÃ¹ng hiá»‡n táº¡i
router.get("/me", verifyToken, userController.getCurrentUser);

// Láº¥y danh sÃ¡ch táº¥t cáº£ ngÆ°á»i dÃ¹ng (chá»‰ admin)
router.get("/", verifyToken, checkRole("admin"), userController.getAllUsers);

// Táº¡o ngÆ°á»i dÃ¹ng má»›i (chá»‰ admin)
router.post("/admin/create", verifyToken, checkRole("admin"), userController.createUserByAdmin);

// Láº¥y thÃ´ng tin cá»§a má»™t ngÆ°á»i dÃ¹ng cá»¥ thá»ƒ
router.get("/:id", verifyToken, userController.getUserById);

// Cáº­p nháº­t thÃ´ng tin ngÆ°á»i dÃ¹ng
router.put("/:id", verifyToken, userController.updateUser);
// router.put("/:id", verifyToken, validator(updateSchema), userController.updateUser);

// Cáº­p nháº­t thÃ´ng tin ngÆ°á»i dÃ¹ng bá»Ÿi Admin (cÃ³ nhiá»u quyá»n háº¡n hÆ¡n)
router.put("/admin/:id", verifyToken, checkRole("admin"), userController.updateUserByAdmin);

// Thay Ä‘á»•i máº­t kháº©u
router.put("/password/change", verifyToken, userController.changePassword);

// Cháº·n ngÆ°á»i dÃ¹ng (chá»‰ admin)
router.put("/:id/ban", verifyToken, checkRole("admin"), userController.banUser);

// Bá» cháº·n ngÆ°á»i dÃ¹ng (chá»‰ admin)
router.put("/:id/unban", verifyToken, checkRole("admin"), userController.unbanUser);

// XÃ³a ngÆ°á»i dÃ¹ng (chá»‰ admin)
router.delete("/:id", verifyToken, checkRole("admin"), userController.deleteUser);

export default router;
