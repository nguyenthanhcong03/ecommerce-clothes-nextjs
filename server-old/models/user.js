import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
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
});

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email lÃ  báº¯t buá»™c"],
      trim: true,
      unique: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Email khÃ´ng há»£p lá»‡"],
    },
    password: {
      type: String,
      required: [true, "Máº­t kháº©u lÃ  báº¯t buá»™c"],
      trim: true,
      minlength: [6, "Máº­t kháº©u pháº£i cÃ³ Ã­t nháº¥t 6 kÃ½ tá»±"],
    },
    firstName: { type: String, required: [true, "TÃªn lÃ  báº¯t buá»™c"], trim: true },
    lastName: { type: String, required: [true, "Há» lÃ  báº¯t buá»™c"], trim: true },
    phone: {
      type: String,
      match: [/^(\+\d{1,3}[- ]?)?\d{10}$/, "Sá»‘ Ä‘iá»‡n thoáº¡i khÃ´ng há»£p lá»‡"],
      required: [true, "Sá»‘ Ä‘iá»‡n thoáº¡i lÃ  báº¯t buá»™c"],
      trim: true,
    },
    avatar: { type: String, default: null, required: false },
    avatarPublicId: { type: String, default: null, required: false },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: null,
      required: false,
    },
    dateOfBirth: {
      type: String,
      required: false,
      default: null,
    },
    address: addressSchema,
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    isBlocked: { type: Boolean, default: false },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);

