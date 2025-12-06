import cron from "node-cron";
import Order from "../models/order.js";
import Product from "../models/product.js";
import Coupon from "../models/coupon.js";

// Tá»± Ä‘á»™ng xÃ³a sau 30 phÃºt
cron.schedule("*/30 * * * *", async () => {
  try {
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const orders = await Order.find({
      status: "Pending",
      "payment.method": "VNPay",
      "payment.method": { $ne: "COD" }, // not equal
      createdAt: { $lt: oneDayAgo },
    });

    for (const order of orders) {
      // 1. Cáº­p nháº­t láº¡i stock cho tá»«ng biáº¿n thá»ƒ
      for (const item of order.products) {
        const { productId, variantId, quantity } = item;

        await Product.updateOne(
          { _id: productId, "variants._id": variantId },
          {
            $inc: { "variants.$.stock": quantity },
          }
        );
        // $inc: lÃ  toÃ¡n tá»­ MongoDB Ä‘á»ƒ cá»™ng thÃªm giÃ¡ trá»‹ cho má»™t field.
        // "variants.$.stock":
        // variants.$ lÃ  toÃ¡n tá»­ positional ($) dÃ¹ng Ä‘á»ƒ trá» Ä‘áº¿n pháº§n tá»­ khá»›p Ä‘áº§u tiÃªn trong máº£ng variants (á»Ÿ Ä‘iá»u kiá»‡n tÃ¬m kiáº¿m).
        // .stock: field báº¡n muá»‘n cáº­p nháº­t (á»Ÿ trong má»—i variant).
        // Váº­y nghÄ©a lÃ : Cá»™ng thÃªm quantity vÃ o stock cá»§a variant cÃ³ variantId Ä‘Æ°á»£c chá»‰ Ä‘á»‹nh.
      }

      // 2. Giáº£m lÆ°á»£t dÃ¹ng mÃ£ giáº£m giÃ¡ náº¿u cÃ³
      if (order?.couponId) {
        const coupon = await Coupon.findById(order?.couponId);
        if (coupon && coupon.usageLimit) {
          coupon.usedCount = Math.max(0, (coupon.usedCount || 0) - 1);
          await coupon.save();
        }
      }

      // 3. XoÃ¡ Ä‘Æ¡n hÃ ng
      await Order.findByIdAndDelete(order._id);
    }

    console.log(`[Cron] ÄÃ£ xoÃ¡ ${orders.length} Ä‘Æ¡n hÃ ng chÆ°a thanh toÃ¡n Ä‘Ã£ táº¡o hÆ¡n 1 giá» trÆ°á»›c`);
  } catch (err) {
    console.error("[Cron] Lá»—i khi xÃ³a Ä‘Æ¡n hÃ ng chÆ°a thanh toÃ¡n:", err);
  }
});
