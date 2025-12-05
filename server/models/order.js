import mongoose from "mongoose";

const orderProductSchema = new mongoose.Schema(
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
    },
    isReviewed: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false } // KhÃ´ng cáº§n _id cho má»—i item náº¿u khÃ´ng dÃ¹ng Ä‘áº¿n
);

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    couponId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
    },
    products: {
      type: [orderProductSchema],
      validate: [(arr) => arr.length > 0, "At least one product is required"],
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["Pending", "Processing", "Shipping", "Delivered", "Cancelled"],
      default: "Pending",
    },
    shippingAddress: {
      fullName: { type: String, required: true },
      phoneNumber: { type: String, required: true },
      email: { type: String, required: true },
      street: { type: String, required: true },
      ward: {
        code: { type: String, required: true }, // MÃ£ phÆ°á»ng/xÃ£
        name: { type: String, required: true }, // TÃªn phÆ°á»ng/xÃ£
      },
      district: {
        code: { type: String, required: true }, // MÃ£ quáº­n/huyá»‡n
        name: { type: String, required: true }, // TÃªn quáº­n/huyá»‡n
      },
      province: {
        code: { type: String, required: true }, // MÃ£ tá»‰nh/thÃ nh phá»‘
        name: { type: String, required: true }, // TÃªn tá»‰nh/thÃ nh phá»‘
      },
      note: { type: String },
    },
    payment: {
      method: {
        type: String,
        required: true,
        enum: ["COD", "VNPay"],
      },
      status: {
        type: String,
        enum: ["Unpaid", "Paid", "Refunded"],
        default: "Unpaid",
      },
      paidAt: Date,
      refundedAt: Date,
      transactionNo: String, // MÃ£ giao dá»‹ch tá»« VNPay
    },
    trackingNumber: {
      type: String,
      unique: true,
      sparse: true, // Cho phÃ©p giÃ¡ trá»‹ null hoáº·c khÃ´ng cÃ³
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    shippingFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    note: {
      type: String,
      maxlength: 1000,
    },
    cancelReason: {
      type: String,
      maxlength: 1000,
    },
    // LÆ°u trá»¯ thá»i gian cáº­p nháº­t tráº¡ng thÃ¡i Ä‘Æ¡n hÃ ng
    statusUpdatedAt: {
      pending: {
        type: Date,
        default: Date.now,
      },
      processing: {
        type: Date,
      },
      shipping: {
        type: Date,
      },
      delivered: {
        type: Date,
      },
      cancelled: {
        type: Date,
      },
    },
  },
  { timestamps: true }
);

// Middleware Ä‘á»ƒ cáº­p nháº­t thá»i gian khi tráº¡ng thÃ¡i Ä‘Æ¡n hÃ ng thay Ä‘á»•i
orderSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    const status = this.status.toLowerCase();
    if (this.statusUpdatedAt && status in this.statusUpdatedAt) {
      this.statusUpdatedAt[status] = Date.now();
    }
  }
  next();
});

export default mongoose.model("Order", orderSchema);
