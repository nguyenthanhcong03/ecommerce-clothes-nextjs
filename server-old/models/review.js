import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      // index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    likes: {
      type: Number,
      default: 0, // CÃ³ thá»ƒ thÃªm náº¿u muá»‘n ngÆ°á»i dÃ¹ng "thÃ­ch" review nÃ y
    },
    reply: {
      type: String,
      trim: true, // Admin/Shop cÃ³ thá»ƒ tráº£ lá»i
    },
  },
  {
    timestamps: true,
  }
);

const Review = mongoose.model("Review", reviewSchema);

export default Review;
