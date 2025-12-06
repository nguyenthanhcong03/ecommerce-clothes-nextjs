import Product from "../models/product.js";

const syncCartItemSnapshots = async (cart) => {
  for (const item of cart.items) {
    const product = await Product.findById(item.productId);
    if (!product) {
      item.isAvailable = false;
      continue;
    }

    const variant = product.variants.id(item.variantId);
    if (!variant) {
      item.isAvailable = false;
      continue;
    }

    if (variant.stock < item.quantity && variant.stock > 0) {
      item.quantity = variant.stock;
    }

    // Cáº­p nháº­t snapshot
    item.snapshot.name = product.name;
    item.snapshot.price = variant.price;
    item.snapshot.originalPrice = variant.originalPrice || null;
    item.snapshot.image = product.images?.[0];
    item.snapshot.color = variant.color;
    item.snapshot.size = variant.size;
    item.snapshot.stock = variant.stock;
    item.isAvailable = variant.stock >= item.quantity;
  }

  await cart.save();
};

export { syncCartItemSnapshots };
