import { prisma } from '@/lib/prisma'
import { AppError } from '@/utils/error'
import { uploadImage, deleteImage } from '@/utils/cloudinary'
import {
  CreateProductInput,
  UpdateProductInput,
  GetProductsQuery,
  CreateVariantInput,
  UpdateVariantInput
} from './product.schema'

// Lấy danh sách products với phân trang và filter
export const getProducts = async (query: GetProductsQuery) => {
  const page = parseInt(query.page)
  const limit = parseInt(query.limit)
  const skip = (page - 1) * limit

  const where: any = {}

  // Search
  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { slug: { contains: query.search, mode: 'insensitive' } },
      { description: { contains: query.search, mode: 'insensitive' } }
    ]
  }

  // Filter by category
  if (query.categoryId) {
    where.categoryId = parseInt(query.categoryId)
  }

  // Filter by status
  if (query.status) {
    where.status = query.status
  }

  // Filter by price range (basePrice or variant price)
  if (query.minPrice || query.maxPrice) {
    where.variants = {
      some: {
        price: {
          ...(query.minPrice && { gte: parseInt(query.minPrice) }),
          ...(query.maxPrice && { lte: parseInt(query.maxPrice) })
        }
      }
    }
  }

  // Sorting
  let orderBy: any = {}
  if (query.sortBy === 'price') {
    // Sort by lowest variant price
    orderBy = { variants: { _min: { price: query.sortOrder } } }
  } else {
    orderBy = { [query.sortBy]: query.sortOrder }
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        variants: {
          take: 1,
          orderBy: { price: 'asc' },
          include: {
            attributes: {
              include: {
                attributeValue: {
                  include: {
                    attribute: true
                  }
                }
              }
            }
          }
        },
        images: {
          where: { isMain: true },
          take: 1
        },
        _count: {
          select: {
            variants: true,
            images: true
          }
        }
      },
      orderBy
    }),
    prisma.product.count({ where })
  ])

  return {
    data: products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }
}

// Lấy product theo ID
export const getProductById = async (id: number) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      variants: {
        include: {
          attributes: {
            include: {
              attributeValue: {
                include: {
                  attribute: true
                }
              }
            }
          },
          images: true
        }
      },
      images: true
    }
  })

  if (!product) {
    throw new AppError(404, 'Sản phẩm không tồn tại')
  }

  return product
}

// Lấy product theo slug
export const getProductBySlug = async (slug: string) => {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      variants: {
        include: {
          attributes: {
            include: {
              attributeValue: {
                include: {
                  attribute: true
                }
              }
            }
          },
          images: true
        }
      },
      images: true
    }
  })

  if (!product) {
    throw new AppError(404, 'Sản phẩm không tồn tại')
  }

  return product
}

// Tạo product mới
export const createProduct = async (data: CreateProductInput, files: Express.Multer.File[]) => {
  // Kiểm tra slug đã tồn tại
  const existingProduct = await prisma.product.findUnique({
    where: { slug: data.slug }
  })

  if (existingProduct) {
    throw new AppError(400, 'Slug đã được sử dụng')
  }

  // Kiểm tra category tồn tại
  const category = await prisma.category.findUnique({
    where: { id: data.categoryId }
  })

  if (!category) {
    throw new AppError(400, 'Category không tồn tại')
  }

  // Kiểm tra SKU trùng lặp
  const skus = data.variants.map((v) => v.sku)
  if (new Set(skus).size !== skus.length) {
    throw new AppError(400, 'SKU bị trùng lặp trong các variant')
  }

  // Kiểm tra SKU đã tồn tại trong database
  const existingVariants = await prisma.productVariant.findMany({
    where: { sku: { in: skus } }
  })

  if (existingVariants.length > 0) {
    throw new AppError(400, `SKU ${existingVariants.map((v) => v.sku).join(', ')} đã tồn tại`)
  }

  // Upload images nếu có
  const uploadedImages: Array<{ url: string; publicId: string; isMain: boolean }> = []
  if (files && files.length > 0) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const uploadResult = (await uploadImage(file.buffer, 'products')) as any
      uploadedImages.push({
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        isMain: i === 0 // Ảnh đầu tiên là ảnh chính
      })
    }
  }

  // Tạo product với variants
  const product = await prisma.product.create({
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description,
      basePrice: data.basePrice,
      status: data.status,
      categoryId: data.categoryId,
      variants: {
        create: data.variants.map((variant) => ({
          sku: variant.sku,
          price: variant.price,
          stock: variant.stock,
          image: variant.image,
          attributes: {
            create: variant.attributes.map((attr) => ({
              attributeValueId: attr.valueId
            }))
          }
        }))
      },
      images: uploadedImages.length > 0 ? { create: uploadedImages } : undefined
    },
    include: {
      category: true,
      variants: {
        include: {
          attributes: {
            include: {
              attributeValue: {
                include: {
                  attribute: true
                }
              }
            }
          }
        }
      },
      images: true
    }
  })

  return product
}

// Cập nhật product
export const updateProduct = async (id: number, data: UpdateProductInput, files?: Express.Multer.File[]) => {
  // Kiểm tra product tồn tại
  const product = await prisma.product.findUnique({
    where: { id }
  })

  if (!product) {
    throw new AppError(404, 'Sản phẩm không tồn tại')
  }

  // Kiểm tra slug trùng (nếu có thay đổi)
  if (data.slug && data.slug !== product.slug) {
    const existingProduct = await prisma.product.findUnique({
      where: { slug: data.slug }
    })

    if (existingProduct && existingProduct.id !== id) {
      throw new AppError(400, 'Slug đã được sử dụng')
    }
  }

  // Kiểm tra category tồn tại (nếu có thay đổi)
  if (data.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId }
    })

    if (!category) {
      throw new AppError(400, 'Category không tồn tại')
    }
  }

  // Upload images mới nếu có
  if (files && files.length > 0) {
    // Lấy ảnh cũ để xóa
    const oldImages = await prisma.productImage.findMany({
      where: { productId: id }
    })

    // Xóa ảnh cũ trên Cloudinary
    for (const image of oldImages) {
      await deleteImage(image.publicId)
    }

    // Xóa ảnh cũ trong database
    await prisma.productImage.deleteMany({
      where: { productId: id }
    })

    // Upload ảnh mới
    const uploadedImages: Array<{ url: string; publicId: string; isMain: boolean }> = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const uploadResult = (await uploadImage(file.buffer, 'products')) as any
      uploadedImages.push({
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        isMain: i === 0
      })
    }

    // Tạo ảnh mới
    await prisma.productImage.createMany({
      data: uploadedImages.map((img) => ({
        productId: id,
        url: img.url,
        publicId: img.publicId,
        isMain: img.isMain
      }))
    })
  }

  // Cập nhật product
  const updatedProduct = await prisma.product.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.slug && { slug: data.slug }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.basePrice !== undefined && { basePrice: data.basePrice }),
      ...(data.status && { status: data.status }),
      ...(data.categoryId && { categoryId: data.categoryId })
    },
    include: {
      category: true,
      variants: {
        include: {
          attributes: {
            include: {
              attributeValue: {
                include: {
                  attribute: true
                }
              }
            }
          }
        }
      },
      images: true
    }
  })

  return updatedProduct
}

// Xóa product
export const deleteProduct = async (id: number) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: true,
      variants: {
        include: {
          images: true
        }
      }
    }
  })

  if (!product) {
    throw new AppError(404, 'Sản phẩm không tồn tại')
  }

  // Xóa tất cả ảnh trên Cloudinary
  const allImages = [...product.images, ...product.variants.flatMap((v) => v.images)]
  for (const image of allImages) {
    await deleteImage(image.publicId)
  }

  // Xóa product (cascade sẽ tự động xóa variants, images, attributes)
  await prisma.product.delete({
    where: { id }
  })

  return { message: 'Xóa sản phẩm thành công' }
}

// ============= VARIANT OPERATIONS =============

// Tạo variant mới cho product
export const createVariant = async (productId: number, data: CreateVariantInput, file?: Express.Multer.File) => {
  // Kiểm tra product tồn tại
  const product = await prisma.product.findUnique({
    where: { id: productId }
  })

  if (!product) {
    throw new AppError(404, 'Sản phẩm không tồn tại')
  }

  // Kiểm tra SKU đã tồn tại
  const existingVariant = await prisma.productVariant.findUnique({
    where: { sku: data.sku }
  })

  if (existingVariant) {
    throw new AppError(400, 'SKU đã tồn tại')
  }

  // Upload ảnh nếu có
  let imageUrl = data.image
  if (file) {
    const uploadResult = (await uploadImage(file.buffer, 'variants')) as any
    imageUrl = uploadResult.secure_url
  }

  // Tạo variant
  const variant = await prisma.productVariant.create({
    data: {
      productId,
      sku: data.sku,
      price: data.price,
      stock: data.stock,
      image: imageUrl,
      attributes: {
        create: data.attributes.map((attr) => ({
          attributeValueId: attr.valueId
        }))
      }
    },
    include: {
      attributes: {
        include: {
          attributeValue: {
            include: {
              attribute: true
            }
          }
        }
      },
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
  file?: Express.Multer.File
) => {
  // Kiểm tra variant tồn tại và thuộc về product
  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId }
  })

  if (!variant || variant.productId !== productId) {
    throw new AppError(404, 'Variant không tồn tại')
  }

  // Kiểm tra SKU trùng (nếu có thay đổi)
  if (data.sku && data.sku !== variant.sku) {
    const existingVariant = await prisma.productVariant.findUnique({
      where: { sku: data.sku }
    })

    if (existingVariant && existingVariant.id !== variantId) {
      throw new AppError(400, 'SKU đã tồn tại')
    }
  }

  // Upload ảnh mới nếu có
  let imageUrl = data.image
  if (file) {
    const uploadResult = (await uploadImage(file.buffer, 'variants')) as any
    imageUrl = uploadResult.secure_url
  }

  // Cập nhật attributes nếu có
  if (data.attributes) {
    // Xóa attributes cũ
    await prisma.variantAttributeValue.deleteMany({
      where: { variantId }
    })

    // Tạo attributes mới
    await prisma.variantAttributeValue.createMany({
      data: data.attributes.map((attr) => ({
        variantId,
        attributeValueId: attr.valueId
      }))
    })
  }

  // Cập nhật variant
  const updatedVariant = await prisma.productVariant.update({
    where: { id: variantId },
    data: {
      ...(data.sku && { sku: data.sku }),
      ...(data.price !== undefined && { price: data.price }),
      ...(data.stock !== undefined && { stock: data.stock }),
      ...(imageUrl && { image: imageUrl })
    },
    include: {
      attributes: {
        include: {
          attributeValue: {
            include: {
              attribute: true
            }
          }
        }
      },
      images: true
    }
  })

  return updatedVariant
}

// Xóa variant
export const deleteVariant = async (productId: number, variantId: number) => {
  // Kiểm tra variant tồn tại và thuộc về product
  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    include: {
      images: true
    }
  })

  if (!variant || variant.productId !== productId) {
    throw new AppError(404, 'Variant không tồn tại')
  }

  // Kiểm tra xem product còn variant nào khác không
  const variantCount = await prisma.productVariant.count({
    where: { productId }
  })

  if (variantCount <= 1) {
    throw new AppError(400, 'Không thể xóa variant cuối cùng của sản phẩm')
  }

  // Xóa ảnh của variant trên Cloudinary
  for (const image of variant.images) {
    await deleteImage(image.publicId)
  }

  // Xóa variant (cascade sẽ tự động xóa attributes và images)
  await prisma.productVariant.delete({
    where: { id: variantId }
  })

  return { message: 'Xóa variant thành công' }
}
