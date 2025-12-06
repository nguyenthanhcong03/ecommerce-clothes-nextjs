export function calculateDiscount(totalPrice, coupon) {
  if (!coupon) {
    return 0;
  }

  let discountAmount = 0;

  if (coupon.discountType === "percentage") {
    discountAmount = (totalPrice * coupon.discountValue) / 100;
  } else {
    discountAmount = coupon.discountValue;
  }

  // Ãp dá»¥ng giáº£m giÃ¡ tá»‘i Ä‘a náº¿u cÃ³
  if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
    discountAmount = coupon.maxDiscountAmount;
  }

  return discountAmount;
}

export function generateTrackingNumber() {
  return "TRK" + Date.now() + Math.floor(Math.random() * 1000);
}
