import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true, // Trá» Ä‘áº¿n má»™t variant cá»¥ thá»ƒ trong máº£ng variants cá»§a sáº£n pháº©m
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
    snapshot: {
      name: String,
      price: Number,
      originalPrice: Number,
      color: String,
      size: String,
      image: String,
      stock: Number,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { _id: true }
);

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    items: [cartItemSchema],
  },
  {
    timestamps: true,
  }
);

// Index Ä‘á»ƒ tÃ¬m kiáº¿m nhanh cart theo user hoáº·c session
cartSchema.index({ userId: 1 }, { unique: true });
const Cart = mongoose.model("Cart", cartSchema);
export default Cart;


