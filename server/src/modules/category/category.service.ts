import { deleteImage, uploadImage } from '@/utils/cloudinary'
import { AppError } from '../../utils/error'
import { CreateCategoryInput, UpdateCategoryInput, GetCategoriesQuery } from './category.schema'
import { prisma } from '@/lib/prisma'

// Lấy tất cả categories với phân trang và tìm kiếm
export const getCategories = async (query: GetCategoriesQuery) => {
  const page = parseInt(query.page || '1')
  const limit = parseInt(query.limit || '10')
  const skip = (page - 1) * limit

  const where: any = {
    isDeleted: false
  }

  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { slug: { contains: query.search, mode: 'insensitive' } }
    ]
  }

  if (query.isActive !== undefined) {
    where.isActive = query.isActive === 'true'
  }

  const [categories, total] = await Promise.all([
    prisma.category.findMany({
      where,
      skip,
      take: limit,
      include: {
        image: true,
        _count: {
          select: { productCategories: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.category.count({ where })
  ])

  return {
    data: categories,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }
}

// Lấy category theo ID
export const getCategoryById = async (id: number) => {
  const category = await prisma.category.findFirst({
    where: { id, isDeleted: false },
    include: {
      image: true,
      productCategories: {
        include: {
          product: {
            include: {
              images: { take: 1 },
              variants: {
                take: 1,
                orderBy: { price: 'asc' }
              }
            }
          }
        }
      }
    }
  })

  if (!category) {
    throw new AppError(404, 'Danh mục không tồn tại')
  }

  return category
}

// Lấy category theo slug
export const getCategoryBySlug = async (slug: string) => {
  const category = await prisma.category.findFirst({
    where: { slug, isDeleted: false, isActive: true },
    include: {
      image: true,
      _count: {
        select: { productCategories: true }
      }
    }
  })

  if (!category) {
    throw new AppError(404, 'Danh mục không tồn tại')
  }

  return category
}

// Tạo category mới
export const createCategory = async (data: CreateCategoryInput, file: Express.Multer.File) => {
  // Kiểm tra slug đã tồn tại
  const existingCategory = await prisma.category.findFirst({
    where: { slug: data.slug, isDeleted: false }
  })

  if (existingCategory) {
    throw new AppError(400, 'Slug đã được sử dụng')
  }

  // Upload ảnh lên Cloudinary
  const uploadResult = (await uploadImage(file.buffer, 'categories')) as any

  const category = await prisma.category.create({
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description,
      isActive: data.isActive ?? true,
      image: {
        create: {
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          width: uploadResult.width,
          height: uploadResult.height,
          format: uploadResult.format,
          resourceType: 'image'
        }
      }
    },
    include: {
      image: true
    }
  })

  return category
}

// Cập nhật category
export const updateCategory = async (id: number, data: UpdateCategoryInput, file?: Express.Multer.File) => {
  // Kiểm tra category tồn tại
  const category = await prisma.category.findFirst({
    where: { id, isDeleted: false },
    include: { image: true }
  })

  if (!category) {
    throw new AppError(404, 'Danh mục không tồn tại')
  }

  // Kiểm tra slug trùng (nếu có thay đổi)
  if (data.slug && data.slug !== category.slug) {
    const existingCategory = await prisma.category.findFirst({
      where: { slug: data.slug, isDeleted: false, NOT: { id } }
    })

    if (existingCategory) {
      throw new AppError(400, 'Slug đã được sử dụng')
    }
  }

  // Xử lý cập nhật image nếu có file mới
  let imageUpdate = {}
  if (file) {
    const uploadResult = (await uploadImage(file.buffer, 'categories')) as any

    // Xóa ảnh cũ trên Cloudinary nếu có
    if (category.image) {
      await deleteImage(category.image.publicId)
    }

    imageUpdate = {
      image: category.image
        ? {
            update: {
              url: uploadResult.secure_url,
              publicId: uploadResult.public_id,
              width: uploadResult.width,
              height: uploadResult.height,
              format: uploadResult.format,
              resourceType: 'image'
            }
          }
        : {
            create: {
              url: uploadResult.secure_url,
              publicId: uploadResult.public_id,
              width: uploadResult.width,
              height: uploadResult.height,
              format: uploadResult.format,
              resourceType: 'image'
            }
          }
    }
  }

  const updatedCategory = await prisma.category.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.slug && { slug: data.slug }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
      ...imageUpdate
    },
    include: {
      image: true
    }
  })

  return updatedCategory
}

// Xóa mềm category
export const deleteCategory = async (id: number) => {
  const category = await prisma.category.findFirst({
    where: { id, isDeleted: false }
  })

  if (!category) {
    throw new AppError(404, 'Danh mục không tồn tại')
  }

  // Kiểm tra xem category có sản phẩm không
  const productCount = await prisma.productCategory.count({
    where: { categoryId: id }
  })

  if (productCount > 0) {
    throw new AppError(400, 'Không thể xóa danh mục vì còn sản phẩm liên quan')
  }

  await prisma.category.update({
    where: { id },
    data: { isDeleted: true }
  })

  return { message: 'Xóa danh mục thành công' }
}

// Xóa vĩnh viễn category
export const hardDeleteCategory = async (id: number) => {
  const category = await prisma.category.findUnique({
    where: { id }
  })

  if (!category) {
    throw new AppError(404, 'Danh mục không tồn tại')
  }

  await prisma.category.delete({
    where: { id }
  })

  return { message: 'Xóa danh mục vĩnh viễn thành công' }
}
