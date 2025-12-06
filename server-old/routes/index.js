import userRoutes from "./userRoutes.js";
import productRoutes from "./productRoutes.js";
import authRoutes from "./authRoutes.js";
import categoryRoutes from "./categoryRoutes.js";
import cartRoutes from "./cartRoutes.js";
import couponRoutes from "./couponRoutes.js";
import orderRoutes from "./orderRoutes.js";
import paymentRoutes from "./paymentRoutes.js";
import statisticsRoutes from "./statisticsRoutes.js";
import reviewRoutes from "./reviewRoutes.js";
import chatbotRoutes from "./chatbotRoutes.js";
import inventoryRoutes from "./inventoryRoutes.js";
import AppError from "../utils/AppError.js";

const initRoutes = (app) => {
  app.use("/api/auth", authRoutes);
  app.use("/api/user", userRoutes);
  app.use("/api/product", productRoutes);
  app.use("/api/category", categoryRoutes);
  app.use("/api/cart", cartRoutes);
  app.use("/api/coupons", couponRoutes);
  app.use("/api/orders", orderRoutes);
  app.use("/api/payment", paymentRoutes);
  app.use("/api/statistics", statisticsRoutes);
  app.use("/api/reviews", reviewRoutes);
  app.use("/api/chatbot", chatbotRoutes);
  app.use("/api/inventory", inventoryRoutes);
};

export default initRoutes;
