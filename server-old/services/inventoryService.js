import Product from "../models/product.js";
import InventoryHistory from "../models/inventoryHistory.js";
import AppError from "../utils/AppError.js";
import mongoose from "mongoose";

/**
 * Cáº­p nháº­t sá»‘ lÆ°á»£ng tá»“n kho cho má»™t biáº¿n thá»ƒ sáº£n pháº©m
 */
const updateVariantStock = async (productId, variantId, quantity, reason, notes, userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // TÃ¬m sáº£n pháº©m vÃ  biáº¿n thá»ƒ
    const product = await Product.findById(productId).session(session);
    if (!product) {
      throw new AppError(404, "Sáº£n pháº©m khÃ´ng tá»“n táº¡i");
    }

    const variant = product.variants.id(variantId);
    if (!variant) {
      throw new AppError(404, "Biáº¿n thá»ƒ sáº£n pháº©m khÃ´ng tá»“n táº¡i");
    }

    const previousStock = variant.stock;
    const changeAmount = quantity - previousStock;

    // XÃ¡c Ä‘á»‹nh loáº¡i thao tÃ¡c (nháº­p/xuáº¥t/Ä‘iá»u chá»‰nh)
    let operationType = "adjustment";
    if (changeAmount > 0) {
      operationType = "import";
    } else if (changeAmount < 0) {
      operationType = "export";
    }

    // Cáº­p nháº­t sá»‘ lÆ°á»£ng
    variant.stock = quantity;
    await product.save({ session });

    // LÆ°u lá»‹ch sá»­
    await InventoryHistory.create(
      [
        {
          productId,
          variantId,
          sku: variant.sku,
          type: operationType,
          quantity: Math.abs(changeAmount), // GiÃ¡ trá»‹ tuyá»‡t Ä‘á»‘i
          previousStock,
          currentStock: quantity,
          reason,
          notes,
          performedBy: userId,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    return variant;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Cáº­p nháº­t hÃ ng loáº¡t sá»‘ lÆ°á»£ng tá»“n kho cho nhiá»u biáº¿n thá»ƒ
 */
const bulkUpdateStock = async (updateDataArray, reason, userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const results = [];
    const historyRecords = [];

    for (const item of updateDataArray) {
      const { productId, variantId, quantity, notes } = item;

      // TÃ¬m sáº£n pháº©m vÃ  biáº¿n thá»ƒ
      const product = await Product.findById(productId).session(session);
      if (!product) {
        throw new AppError(404, `Sáº£n pháº©m ${productId} khÃ´ng tá»“n táº¡i`);
      }

      const variant = product.variants.id(variantId);
      if (!variant) {
        throw new AppError(404, `Biáº¿n thá»ƒ ${variantId} khÃ´ng tá»“n táº¡i`);
      }

      const previousStock = variant.stock;
      const changeAmount = quantity - previousStock;

      // XÃ¡c Ä‘á»‹nh loáº¡i thao tÃ¡c (nháº­p/xuáº¥t/Ä‘iá»u chá»‰nh)
      let operationType = "adjustment";
      if (changeAmount > 0) {
        operationType = "import";
      } else if (changeAmount < 0) {
        operationType = "export";
      }

      // Cáº­p nháº­t sá»‘ lÆ°á»£ng
      variant.stock = quantity;
      await product.save({ session });

      // Chuáº©n bá»‹ lá»‹ch sá»­
      historyRecords.push({
        productId,
        variantId,
        sku: variant.sku,
        type: operationType,
        quantity: Math.abs(changeAmount),
        previousStock,
        currentStock: quantity,
        reason,
        notes,
        performedBy: userId,
      });

      results.push({
        productId,
        variantId,
        sku: variant.sku,
        previousStock,
        currentStock: quantity,
        status: "success",
      });
    }

    // LÆ°u táº¥t cáº£ lá»‹ch sá»­ má»™t lÃºc
    if (historyRecords.length > 0) {
      await InventoryHistory.insertMany(historyRecords, { session });
    }

    await session.commitTransaction();
    return results;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Láº¥y danh sÃ¡ch sáº£n pháº©m cÃ³ tá»“n kho tháº¥p
 */
const getLowStockProducts = async (threshold = 5, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const pipeline = [
    // Unwind variants array Ä‘á»ƒ xá»­ lÃ½ tá»«ng biáº¿n thá»ƒ
    { $unwind: "$variants" },
    // Lá»c cÃ¡c biáº¿n thá»ƒ cÃ³ tá»“n kho tháº¥p hÆ¡n ngÆ°á»¡ng
    { $match: { "variants.stock": { $lte: threshold } } },
    // NhÃ³m láº¡i theo sáº£n pháº©m
    {
      $group: {
        _id: "$_id",
        name: { $first: "$name" },
        brand: { $first: "$brand" },
        categoryId: { $first: "$categoryId" },
        lowStockVariants: {
          $push: {
            _id: "$variants._id",
            sku: "$variants.sku",
            size: "$variants.size",
            color: "$variants.color",
            stock: "$variants.stock",
            price: "$variants.price",
          },
        },
      },
    },
    // Lookup Ä‘á»ƒ láº¥y thÃ´ng tin danh má»¥c
    {
      $lookup: {
        from: "categories",
        localField: "categoryId",
        foreignField: "_id",
        as: "category",
      },
    },
    // // Unwind category array
    // {
    //   $unwind: {
    //     path: "$category",
    //     preserveNullAndEmptyArrays: true,
    //   },
    // },
    // Project Ä‘á»ƒ Ä‘á»‹nh dáº¡ng káº¿t quáº£ cuá»‘i cÃ¹ng
    {
      $project: {
        _id: 1,
        name: 1,
        brand: 1,
        categoryName: "$category.name",
        lowStockVariants: 1,
      },
    },
    // Sort theo sá»‘ lÆ°á»£ng tá»“n kho (tá»« tháº¥p Ä‘áº¿n cao)
    { $sort: { "lowStockVariants.stock": 1 } },
    // Skip vÃ  limit cho pagination
    { $skip: skip },
    { $limit: parseInt(limit) },
  ];

  const countPipeline = [
    { $unwind: "$variants" },
    { $match: { "variants.stock": { $lte: threshold } } },
    { $group: { _id: "$_id" } },
    { $count: "total" },
  ];

  const [products, countResult] = await Promise.all([Product.aggregate(pipeline), Product.aggregate(countPipeline)]);

  const total = countResult.length > 0 ? countResult[0].total : 0;
  const totalPages = Math.ceil(total / limit);

  return {
    products,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages,
    },
  };
};

/**
 * Láº¥y lá»‹ch sá»­ xuáº¥t nháº­p kho
 */
const getInventoryHistory = async (filters = {}, page = 1, limit = 20, sortBy = "createdAt", sortOrder = "desc") => {
  const skip = (page - 1) * limit;
  const query = {};

  // Ãp dá»¥ng cÃ¡c bá»™ lá»c
  if (filters.productId) {
    query.productId = mongoose.Types.ObjectId.isValid(filters.productId)
      ? new mongoose.Types.ObjectId(filters.productId)
      : null;
  }

  if (filters.variantId) {
    query.variantId = mongoose.Types.ObjectId.isValid(filters.variantId)
      ? new mongoose.Types.ObjectId(filters.variantId)
      : null;
  }

  if (filters.sku) {
    query.sku = filters.sku;
  }

  if (filters.type && ["import", "export", "adjustment"].includes(filters.type)) {
    query.type = filters.type;
  }

  if (filters.startDate && filters.endDate) {
    query.createdAt = {
      $gte: new Date(filters.startDate),
      $lte: new Date(filters.endDate),
    };
  } else if (filters.startDate) {
    query.createdAt = { $gte: new Date(filters.startDate) };
  } else if (filters.endDate) {
    query.createdAt = { $lte: new Date(filters.endDate) };
  }

  const sort = {};
  sort[sortBy] = sortOrder === "asc" ? 1 : -1;

  const [history, total] = await Promise.all([
    InventoryHistory.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate("productId", "name")
      .populate("performedBy", "firstName lastName email"),
    InventoryHistory.countDocuments(query),
  ]);

  return {
    history,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

export default { updateVariantStock, bulkUpdateStock, getLowStockProducts, getInventoryHistory };
