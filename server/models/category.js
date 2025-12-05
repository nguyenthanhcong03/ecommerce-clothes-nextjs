import mongoose from "mongoose";

// Äá»‹nh nghÄ©a schema cho Category
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true, // TÃªn danh má»¥c lÃ  báº¯t buá»™c
      trim: true, // Loáº¡i bá» khoáº£ng tráº¯ng thá»«a
    },
    description: {
      type: String,
      trim: true, // Loáº¡i bá» khoáº£ng tráº¯ng thá»«a
    },
    image: { type: String, default: null }, // URL cá»§a hÃ¬nh áº£nh Ä‘áº¡i diá»‡n cho danh má»¥c
    imagePublicId: { type: String, default: null }, // Public ID cá»§a hÃ¬nh áº£nh trÃªn Cloudinary
    priority: {
      type: Number,
      default: 0, // Máº·c Ä‘á»‹nh priority lÃ  0
    },
  },
  {
    timestamps: true, // Tá»± Ä‘á»™ng thÃªm createdAt vÃ  updatedAt
  }
);

categorySchema.index({ priority: -1 });

// Táº¡o model tá»« schema
const Category = mongoose.model("Category", categorySchema);
export default Category;


