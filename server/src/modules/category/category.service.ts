import { deleteImage, uploadImage } from '@/utils/cloudinary'
import { AppError } from '../../utils/error'
import { CreateCategoryInput, UpdateCategoryInput, GetCategoriesQuery } from './category.schema'
import { prisma } from '@/lib/prisma'

// Lấy tất cả categories với phân trang và tìm kiếm
export const getCategories = async (query: GetCategoriesQuery) => {
  const page = parseInt(query.page || '1')
  const limit = parseInt(query.limit || '10')
  const skip = (page - 1) * limit

  const where: any = {}

  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { slug: { contains: query.search, mode: 'insensitive' } }
    ]
  }

  if (query.parentId !== undefined) {
    where.parentId = parseInt(query.parentId)
  }

  const [categories, total] = await Promise.all([
    prisma.category.findMany({
      where,
      skip,
      take: limit,
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        children: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        _count: {
          select: { products: true }
        }
      },
      orderBy: { id: 'desc' }
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
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      parent: {
        select: {
          id: true,
          name: true,
          slug: true
        }
      },
      children: {
        select: {
          id: true,
          name: true,
          slug: true
        }
      },
      products: {
        take: 10,
        include: {
          images: { take: 1 },
          variants: {
            take: 1,
            orderBy: { price: 'asc' }
          }
        }
      },
      _count: {
        select: { products: true }
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
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      parent: {
        select: {
          id: true,
          name: true,
          slug: true
        }
      },
      children: {
        select: {
          id: true,
          name: true,
          slug: true
        }
      },
      _count: {
        select: { products: true }
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
  const existingCategory = await prisma.category.findUnique({
    where: { slug: data.slug }
  })

  if (existingCategory) {
    throw new AppError(400, 'Slug đã được sử dụng')
  }

  // Kiểm tra parentId nếu có
  if (data.parentId) {
    const parentCategory = await prisma.category.findUnique({
      where: { id: data.parentId }
    })

    if (!parentCategory) {
      throw new AppError(400, 'Danh mục cha không tồn tại')
    }
  }

  // Upload ảnh lên Cloudinary
  const uploadResult = (await uploadImage(file.buffer, 'categories')) as any

  const category = await prisma.category.create({
    data: {
      name: data.name,
      slug: data.slug,
      image: uploadResult.secure_url,
      imagePublicId: uploadResult.public_id,
      parentId: data.parentId
    },
    include: {
      parent: {
        select: {
          id: true,
          name: true,
          slug: true
        }
      },
      children: true
    }
  })

  return category
}

// Cập nhật category
export const updateCategory = async (id: number, data: UpdateCategoryInput, file?: Express.Multer.File) => {
  // Kiểm tra category tồn tại
  const category = await prisma.category.findUnique({
    where: { id }
  })

  if (!category) {
    throw new AppError(404, 'Danh mục không tồn tại')
  }

  // Kiểm tra slug trùng (nếu có thay đổi)
  if (data.slug && data.slug !== category.slug) {
    const existingCategory = await prisma.category.findUnique({
      where: { slug: data.slug }
    })

    if (existingCategory && existingCategory.id !== id) {
      throw new AppError(400, 'Slug đã được sử dụng')
    }
  }

  // Kiểm tra parentId nếu có thay đổi
  if (data.parentId !== undefined) {
    if (data.parentId === id) {
      throw new AppError(400, 'Danh mục không thể là cha của chính nó')
    }

    if (data.parentId) {
      const parentCategory = await prisma.category.findUnique({
        where: { id: data.parentId }
      })

      if (!parentCategory) {
        throw new AppError(400, 'Danh mục cha không tồn tại')
      }
    }
  }

  // Xử lý cập nhật image nếu có file mới
  let imageUpdate: any = {}
  if (file) {
    const uploadResult = (await uploadImage(file.buffer, 'categories')) as any

    // Xóa ảnh cũ trên Cloudinary nếu có
    if (category.imagePublicId) {
      await deleteImage(category.imagePublicId)
    }

    imageUpdate = {
      image: uploadResult.secure_url,
      imagePublicId: uploadResult.public_id
    }
  }

  const updatedCategory = await prisma.category.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.slug && { slug: data.slug }),
      ...(data.parentId !== undefined && { parentId: data.parentId }),
      ...imageUpdate
    },
    include: {
      parent: {
        select: {
          id: true,
          name: true,
          slug: true
        }
      },
      children: {
        select: {
          id: true,
          name: true,
          slug: true
        }
      }
    }
  })

  return updatedCategory
}

// Xóa category
export const deleteCategory = async (id: number) => {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      children: true,
      products: true
    }
  })

  if (!category) {
    throw new AppError(404, 'Danh mục không tồn tại')
  }

  // Kiểm tra category có con không
  if (category.children.length > 0) {
    throw new AppError(400, 'Không thể xóa danh mục có danh mục con')
  }

  // Kiểm tra category có sản phẩm không
  if (category.products.length > 0) {
    throw new AppError(400, 'Không thể xóa danh mục có sản phẩm')
  }

  // Xóa ảnh trên Cloudinary nếu có
  if (category.imagePublicId) {
    await deleteImage(category.imagePublicId)
  }

  await prisma.category.delete({
    where: { id }
  })

  return { message: 'Xóa danh mục thành công' }
}
