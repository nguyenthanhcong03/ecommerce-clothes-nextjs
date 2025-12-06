import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      default: null,
    },
  },
  { _id: false }
);

const variantSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      required: true,
      unique: true,
    },
    size: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    originalPrice: {
      type: Number,
    },
    stock: {
      type: Number,
      required: true,
    },
  },
  { _id: true }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    variants: [variantSchema],
    images: [imageSchema],
    tags: [
      {
        type: String,
      },
    ],
    averageRating: {
      type: Number,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    salesCount: {
      type: Number,
      default: 0, // Sá»‘ lÆ°á»£ng Ä‘Ã£ bÃ¡n
    },
  },
  {
    timestamps: true, // Tá»± Ä‘á»™ng táº¡o createdAt vÃ  updatedAt
  }
);

// 1. Index cho tÃ¬m kiáº¿m vÄƒn báº£n (text search)
productSchema.index({ name: "text", description: "text" });
// Há»— trá»£ truy váº¥n $regex trong API khi search theo tÃªn hoáº·c mÃ´ táº£

// 2. Index cho field variants.price
productSchema.index({ "variants.price": 1 });
// Há»— trá»£ filter theo giÃ¡ (minPrice, maxPrice)

// 3. Index cho categoryId
productSchema.index({ categoryId: 1 });
// Há»— trá»£ filter theo danh má»¥c

// 4. Index cho brand
productSchema.index({ brand: 1 });
// Há»— trá»£ filter theo thÆ°Æ¡ng hiá»‡u

// 6. Index cho featured products
productSchema.index({ featured: 1 });
// Há»— trá»£ query sáº£n pháº©m ná»•i báº­t

export default mongoose.model("Product", productSchema);


