import { AppError } from '@/utils/error'
import { CreateVariantInput, UpdateVariantInput, GetVariantsQuery } from './variant.schema'
import { prisma } from '@/lib/prisma'
import { deleteMultiple, uploadMultiple } from '@/utils/cloudinary'

// Lấy tất cả variants của product
export const getVariantsByProductId = async (productId: number, query: GetVariantsQuery) => {
  // Kiểm tra product tồn tại
  const product = await prisma.product.findFirst({
    where: { id: productId, isDeleted: false }
  })

  if (!product) {
    throw new AppError(404, 'Sản phẩm không tồn tại')
  }

  const page = parseInt(query.page || '1')
  const limit = parseInt(query.limit || '20')
  const skip = (page - 1) * limit

  const where: any = {
    productId,
    isDeleted: false
  }

  if (query.isActive !== undefined) {
    where.isActive = query.isActive === 'true'
  }

  const [variants, total] = await Promise.all([
    prisma.productVariant.findMany({
      where,
      skip,
      take: limit,
      include: {
        attributes: true,
        images: true,
        _count: {
          select: {
            cartItems: true,
            orderItems: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.productVariant.count({ where })
  ])

  return {
    data: variants,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }
}

// Lấy variant theo ID
export const getVariantById = async (productId: number, variantId: number) => {
  const variant = await prisma.productVariant.findFirst({
    where: {
      id: variantId,
      productId,
      isDeleted: false
    },
    include: {
      attributes: true,
      images: true,
      product: {
        select: {
          id: true,
          name: true,
          slug: true
        }
      }
    }
  })

  if (!variant) {
    throw new AppError(404, 'Biến thể không tồn tại')
  }

  return variant
}

// Tạo variant mới
export const createVariant = async (productId: number, data: CreateVariantInput, files?: Express.Multer.File[]) => {
  console.log('data :>> ', data)
  // Kiểm tra product tồn tại
  const product = await prisma.product.findFirst({
    where: { id: productId, isDeleted: false }
  })

  if (!product) {
    throw new AppError(404, 'Sản phẩm không tồn tại')
  }

  // Kiểm tra SKU đã tồn tại
  const existingVariant = await prisma.productVariant.findFirst({
    where: { sku: data.sku, isDeleted: false }
  })

  if (existingVariant) {
    throw new AppError(400, 'SKU đã tồn tại')
  }

  // Upload ảnh nếu có
  let imageData: any[] = []
  if (files && files.length > 0) {
    const uploadResults = (await uploadMultiple(files, 'variants')) as any[]
    imageData = uploadResults.map((result) => ({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      resourceType: 'image'
    }))
  }

  // Tạo variant với attributes và images
  const variant = await prisma.productVariant.create({
    data: {
      productId,
      sku: data.sku,
      name: data.name,
      price: data.price,
      comparePrice: data.comparePrice,
      stock: data.stock ?? 0,
      isActive: data.isActive ?? true,
      attributes: {
        create: data.attributes?.map((attr) => ({
          name: attr.name,
          value: attr.value
        }))
      },
      images: imageData.length > 0 ? { create: imageData } : undefined
    },
    include: {
      attributes: true,
      images: true
    }
  })

  return variant
}

// Cập nhật variant
export const updateVariant = async (
  productId: number,
  variantId: number,
  data: UpdateVariantInput,
  files?: Express.Multer.File[]
) => {
  // Kiểm tra variant tồn tại
  const variant = await prisma.productVariant.findFirst({
    where: {
      id: variantId,
      productId,
      isDeleted: false
    },
    include: { images: true, attributes: true }
  })

  if (!variant) {
    throw new AppError(404, 'Biến thể không tồn tại')
  }

  // Kiểm tra SKU trùng (nếu có thay đổi)
  if (data.sku && data.sku !== variant.sku) {
    const existingVariant = await prisma.productVariant.findFirst({
      where: { sku: data.sku, isDeleted: false, NOT: { id: variantId } }
    })

    if (existingVariant) {
      throw new AppError(400, 'SKU đã tồn tại')
    }
  }

  // Xử lý upload ảnh mới nếu có
  let imageUpdate = {}
  if (files && files.length > 0) {
    const uploadResults = (await uploadMultiple(files, 'variants')) as any[]

    // Xóa ảnh cũ trên Cloudinary
    if (variant.images.length > 0) {
      await deleteMultiple(variant.images.map((img) => img.publicId))
    }

    imageUpdate = {
      images: {
        deleteMany: {},
        create: uploadResults.map((result) => ({
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          resourceType: 'image'
        }))
      }
    }
  }

  // Xử lý cập nhật attributes nếu có
  let attributeUpdate = {}
  if (data.attributes) {
    attributeUpdate = {
      attributes: {
        deleteMany: {},
        create: data.attributes.map((attr) => ({
          name: attr.name,
          value: attr.value
        }))
      }
    }
  }

  const updatedVariant = await prisma.productVariant.update({
    where: { id: variantId },
    data: {
      ...(data.sku && { sku: data.sku }),
      ...(data.name && { name: data.name }),
      ...(data.price !== undefined && { price: data.price }),
      ...(data.comparePrice !== undefined && { comparePrice: data.comparePrice }),
      ...(data.stock !== undefined && { stock: data.stock }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
      ...imageUpdate,
      ...attributeUpdate
    },
    include: {
      attributes: true,
      images: true
    }
  })

  return updatedVariant
}

// Xóa mềm variant
export const deleteVariant = async (productId: number, variantId: number) => {
  const variant = await prisma.productVariant.findFirst({
    where: {
      id: variantId,
      productId,
      isDeleted: false
    }
  })

  if (!variant) {
    throw new AppError(404, 'Biến thể không tồn tại')
  }

  // Kiểm tra xem variant có trong giỏ hàng hoặc đơn hàng không
  const [cartItemsCount, orderItemsCount] = await Promise.all([
    prisma.cartItem.count({ where: { variantId } }),
    prisma.orderItem.count({ where: { variantId } })
  ])

  if (cartItemsCount > 0 || orderItemsCount > 0) {
    // Chỉ inactive thay vì xóa
    await prisma.productVariant.update({
      where: { id: variantId },
      data: { isActive: false, isDeleted: true }
    })
    return { message: 'Đã vô hiệu hóa biến thể thành công' }
  }

  await prisma.productVariant.update({
    where: { id: variantId },
    data: { isDeleted: true }
  })

  return { message: 'Xóa biến thể thành công' }
}

// Xóa vĩnh viễn variant
export const hardDeleteVariant = async (productId: number, variantId: number) => {
  const variant = await prisma.productVariant.findFirst({
    where: {
      id: variantId,
      productId
    },
    include: { images: true }
  })

  if (!variant) {
    throw new AppError(404, 'Biến thể không tồn tại')
  }

  // Xóa ảnh trên Cloudinary
  if (variant.images.length > 0) {
    await deleteMultiple(variant.images.map((img) => img.publicId))
  }

  await prisma.productVariant.delete({
    where: { id: variantId }
  })

  return { message: 'Xóa biến thể vĩnh viễn thành công' }
}

// Cập nhật stock của variant
export const updateVariantStock = async (variantId: number, quantity: number) => {
  const variant = await prisma.productVariant.findFirst({
    where: { id: variantId, isDeleted: false }
  })

  if (!variant) {
    throw new AppError(404, 'Biến thể không tồn tại')
  }

  const newStock = variant.stock + quantity

  if (newStock < 0) {
    throw new AppError(400, 'Stock không đủ')
  }

  const updatedVariant = await prisma.productVariant.update({
    where: { id: variantId },
    data: { stock: newStock }
  })

  return updatedVariant
}
