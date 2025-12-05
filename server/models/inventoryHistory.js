import mongoose from "mongoose";

const inventoryHistorySchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    sku: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["import", "export", "adjustment"],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    previousStock: {
      type: Number,
      required: true,
    },
    currentStock: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index Ä‘á»ƒ tÃ¬m kiáº¿m nhanh theo sáº£n pháº©m vÃ  biáº¿n thá»ƒ
inventoryHistorySchema.index({ productId: 1, variantId: 1 });
// Index Ä‘á»ƒ tÃ¬m kiáº¿m theo loáº¡i giao dá»‹ch
inventoryHistorySchema.index({ type: 1 });
// Index Ä‘á»ƒ tÃ¬m kiáº¿m theo ngÃ y táº¡o
inventoryHistorySchema.index({ createdAt: 1 });

const InventoryHistory = mongoose.model("InventoryHistory", inventoryHistorySchema);

export default InventoryHistory;
