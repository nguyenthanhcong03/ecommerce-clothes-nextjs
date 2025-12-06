import { deleteMultiple, uploadMultiple } from '@/utils/cloudinary'
import { AppError } from '../../utils/error'
import { CreateProductInput, UpdateProductInput, GetProductsQuery } from './product.schema'
import { prisma } from '@/lib/prisma'

// Lấy tất cả products với phân trang, tìm kiếm và filter
export const getProducts = async (query: GetProductsQuery) => {
  const page = parseInt(query.page || '1')
  const limit = parseInt(query.limit || '10')
  const skip = (page - 1) * limit

  const where: any = {
    isDeleted: false
  }

  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { slug: { contains: query.search, mode: 'insensitive' } },
      { brand: { contains: query.search, mode: 'insensitive' } }
    ]
  }

  if (query.isActive !== undefined) {
    where.isActive = query.isActive === 'true'
  }

  if (query.categoryId) {
    where.productCategories = {
      some: {
        categoryId: parseInt(query.categoryId)
      }
    }
  }

  // Filter theo giá (dựa trên giá thấp nhất của variants)
  if (query.minPrice || query.maxPrice) {
    where.variants = {
      some: {
        ...(query.minPrice && { price: { gte: parseFloat(query.minPrice) } }),
        ...(query.maxPrice && { price: { lte: parseFloat(query.maxPrice) } })
      }
    }
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      include: {
        images: {
          take: 1,
          orderBy: { createdAt: 'asc' }
        },
        variants: {
          take: 1,
          orderBy: { price: 'asc' },
          include: {
            attributes: true
          }
        },
        productCategories: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        },
        _count: {
          select: {
            variants: true,
            reviews: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
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
  const product = await prisma.product.findFirst({
    where: { id, isDeleted: false },
    include: {
      images: true,
      variants: {
        include: {
          attributes: true,
          images: true
        }
      },
      productCategories: {
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        }
      },
      reviews: {
        where: { isActive: true },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          },
          images: true
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  if (!product) {
    throw new AppError(404, 'Sản phẩm không tồn tại')
  }

  return product
}

// Lấy product theo slug
export const getProductBySlug = async (slug: string) => {
  const product = await prisma.product.findFirst({
    where: { slug, isDeleted: false, isActive: true },
    include: {
      images: true,
      variants: {
        where: { isActive: true, isDeleted: false },
        include: {
          attributes: true,
          images: true
        }
      },
      productCategories: {
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        }
      },
      reviews: {
        where: { isActive: true },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          },
          images: true
        },
        orderBy: { createdAt: 'desc' }
      }
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
  const existingProduct = await prisma.product.findFirst({
    where: { slug: data.slug, isDeleted: false }
  })

  if (existingProduct) {
    throw new AppError(400, 'Slug đã được sử dụng cho sản phẩm khác')
  }

  // Kiểm tra categories tồn tại
  const categories = await prisma.category.findMany({
    where: {
      id: { in: data.categoryIds },
      isDeleted: false
    }
  })

  if (categories.length !== data.categoryIds.length) {
    throw new AppError(400, 'Danh mục không hợp lệ')
  }

  // Upload ảnh lên Cloudinary
  const uploadResults = (await uploadMultiple(files, 'products')) as any[]

  // Tạo product với images và categories
  const product = await prisma.product.create({
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description,
      material: data.material,
      brand: data.brand,
      isActive: data.isActive ?? true,
      images: {
        create: uploadResults.map((result) => ({
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          resourceType: 'image'
        }))
      },
      productCategories: {
        create: data.categoryIds.map((categoryId) => ({
          categoryId
        }))
      }
    },
    include: {
      images: true,
      productCategories: {
        include: {
          category: true
        }
      }
    }
  })

  return product
}

// Cập nhật product
export const updateProduct = async (id: number, data: UpdateProductInput, files?: Express.Multer.File[]) => {
  // Kiểm tra product tồn tại
  const product = await prisma.product.findFirst({
    where: { id, isDeleted: false },
    include: { images: true }
  })

  if (!product) {
    throw new AppError(404, 'Sản phẩm không tồn tại')
  }

  // Kiểm tra slug trùng (nếu có thay đổi)
  if (data.slug && data.slug !== product.slug) {
    const existingProduct = await prisma.product.findFirst({
      where: { slug: data.slug, isDeleted: false, NOT: { id } }
    })

    if (existingProduct) {
      throw new AppError(400, 'Slug đã được sử dụng cho sản phẩm khác')
    }
  }

  // Kiểm tra categories tồn tại (nếu có update)
  if (data.categoryIds) {
    const categories = await prisma.category.findMany({
      where: {
        id: { in: data.categoryIds },
        isDeleted: false
      }
    })

    if (categories.length !== data.categoryIds.length) {
      throw new AppError(400, 'Danh mục không hợp lệ')
    }
  }

  // Xử lý upload ảnh mới nếu có
  let imageUpdate = {}
  if (files && files.length > 0) {
    const uploadResults = (await uploadMultiple(files, 'products')) as any[]

    // Xóa ảnh cũ trên Cloudinary
    if (product.images.length > 0) {
      await deleteMultiple(product.images.map((img) => img.publicId))
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

  // Xử lý cập nhật categories nếu có
  let categoryUpdate = {}
  if (data.categoryIds) {
    categoryUpdate = {
      productCategories: {
        deleteMany: {},
        create: data.categoryIds.map((categoryId) => ({
          categoryId
        }))
      }
    }
  }

  const updatedProduct = await prisma.product.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.slug && { slug: data.slug }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.material !== undefined && { material: data.material }),
      ...(data.brand !== undefined && { brand: data.brand }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
      ...imageUpdate,
      ...categoryUpdate
    },
    include: {
      images: true,
      productCategories: {
        include: {
          category: true
        }
      },
      variants: {
        include: {
          attributes: true,
          images: true
        }
      }
    }
  })

  return updatedProduct
}

// Xóa mềm product
export const deleteProduct = async (id: number) => {
  const product = await prisma.product.findFirst({
    where: { id, isDeleted: false }
  })

  if (!product) {
    throw new AppError(404, 'Sản phẩm không tồn tại')
  }

  await prisma.product.update({
    where: { id },
    data: { isDeleted: true }
  })

  return { message: 'Xóa sản phẩm thành công' }
}

// Xóa vĩnh viễn product
export const hardDeleteProduct = async (id: number) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: true }
  })

  if (!product) {
    throw new AppError(404, 'Sản phẩm không tồn tại')
  }

  // Xóa ảnh trên Cloudinary
  if (product.images.length > 0) {
    await deleteMultiple(product.images.map((img) => img.publicId))
  }

  await prisma.product.delete({
    where: { id }
  })

  return { message: 'Xóa sản phầm vĩnh viễn thành công' }
}
