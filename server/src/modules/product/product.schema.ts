import { ProductStatus } from 'generated/prisma/enums'
import { z } from 'zod'
import { ProductStatus } from '@prisma/client'

// Schema cho variant khi tạo/cập nhật product
const variantSchema = z.object({
  sku: z.string().min(1, 'SKU là bắt buộc'),
  price: z.preprocess(
    (val) => (typeof val === 'string' ? parseInt(val) : val),
    z.number().int().positive('Giá phải lớn hơn 0')
  ),
  stock: z.preprocess(
    (val) => (typeof val === 'string' ? parseInt(val) : val),
    z.number().int().min(0, 'Số lượng không được âm')
  ),
  image: z.string().optional(),
  attributes: z.array(
    z.object({
      attributeId: z.number().int().positive(),
      valueId: z.number().int().positive()
    })
  )
})

// Schema cho variant khi tạo/cập nhật product
const variantSchema = z.object({
  sku: z.string().min(1, 'SKU là bắt buộc'),
  price: z.preprocess(
    (val) => (typeof val === 'string' ? parseInt(val) : val),
    z.number().int().positive('Giá phải lớn hơn 0')
  ),
  stock: z.preprocess(
    (val) => (typeof val === 'string' ? parseInt(val) : val),
    z.number().int().min(0, 'Số lượng không được âm')
  ),
  image: z.string().optional(),
  attributes: z.array(
    z.object({
      attributeId: z.number().int().positive(),
      valueId: z.number().int().positive()
    })
  )
})

// Schema cho tạo product
export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Tên sản phẩm là bắt buộc'),
    slug: z.string().min(1, 'Slug là bắt buộc'),
    description: z.string().optional(),
    basePrice: z.preprocess((val) => {
      if (!val || val === '') return undefined
      return typeof val === 'string' ? parseInt(val) : val
    }, z.number().int().positive().optional()),
    status: z.nativeEnum(ProductStatus).optional().default(ProductStatus.ACTIVE),
    categoryId: z.preprocess(
      (val) => (typeof val === 'string' ? parseInt(val) : val),
      z.number().int().positive('Category ID là bắt buộc')
    ),
    variants: z.preprocess((val) => {
      if (typeof val === 'string') {
        try {
          return JSON.parse(val)
        } catch {
          return []
        }
      }
      return val
    }, z.array(variantSchema).min(1, 'Sản phẩm phải có ít nhất 1 variant'))
  })
})

// Schema cho cập nhật product
export const updateProductSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID sản phẩm không hợp lệ')
  }),
  body: z.object({
    name: z.string().min(1, 'Tên sản phẩm là bắt buộc').optional(),
    slug: z.string().min(1, 'Slug là bắt buộc').optional(),
    description: z.string().optional(),
    basePrice: z.preprocess((val) => {
      if (val === undefined || val === null || val === '') return undefined
      return typeof val === 'string' ? parseInt(val) : val
    }, z.number().int().positive().optional().nullable()),
    status: z.nativeEnum(ProductStatus).optional(),
    categoryId: z
      .preprocess((val) => (typeof val === 'string' ? parseInt(val) : val), z.number().int().positive())
      .optional()
  })
})

// Schema cho lấy product theo ID
export const getProductSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID sản phẩm không hợp lệ')
  })
})

// Schema cho lấy product theo slug
export const getProductBySlugSchema = z.object({
  params: z.object({
    slug: z.string().min(1, 'Slug không hợp lệ')
  })
})

// Schema cho xóa product
export const deleteProductSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID sản phẩm không hợp lệ')
  })
})

// Schema cho query parameters
export const getProductsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional().default('1'),
    limit: z.string().regex(/^\d+$/).optional().default('10'),
    search: z.string().optional(),
    categoryId: z.string().regex(/^\d+$/).optional(),
    status: z.nativeEnum(ProductStatus).optional(),
    minPrice: z.string().regex(/^\d+$/).optional(),
    maxPrice: z.string().regex(/^\d+$/).optional(),
    sortBy: z.enum(['createdAt', 'name', 'price']).optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
  })
})

// Schema cho tạo/cập nhật variant
export const createVariantSchema = z.object({
  params: z.object({
    productId: z.string().regex(/^\d+$/, 'ID sản phẩm không hợp lệ')
  }),
  body: z.object({
    sku: z.string().min(1, 'SKU là bắt buộc'),
    price: z.preprocess(
      (val) => (typeof val === 'string' ? parseInt(val) : val),
      z.number().int().positive('Giá phải lớn hơn 0')
    ),
    stock: z.preprocess(
      (val) => (typeof val === 'string' ? parseInt(val) : val),
      z.number().int().min(0, 'Số lượng không được âm')
    ),
    image: z.string().optional(),
    attributes: z.preprocess(
      (val) => {
        if (typeof val === 'string') {
          try {
            return JSON.parse(val)
          } catch {
            return []
          }
        }
        return val
      },
      z.array(
        z.object({
          attributeId: z.number().int().positive(),
          valueId: z.number().int().positive()
        })
      )
    )
  })
})

export const updateVariantSchema = z.object({
  params: z.object({
    productId: z.string().regex(/^\d+$/, 'ID sản phẩm không hợp lệ'),
    variantId: z.string().regex(/^\d+$/, 'ID variant không hợp lệ')
  }),
  body: z.object({
    sku: z.string().min(1, 'SKU là bắt buộc').optional(),
    price: z
      .preprocess(
        (val) => (typeof val === 'string' ? parseInt(val) : val),
        z.number().int().positive('Giá phải lớn hơn 0')
      )
      .optional(),
    stock: z
      .preprocess(
        (val) => (typeof val === 'string' ? parseInt(val) : val),
        z.number().int().min(0, 'Số lượng không được âm')
      )
      .optional(),
    image: z.string().optional(),
    attributes: z.preprocess(
      (val) => {
        if (typeof val === 'string') {
          try {
            return JSON.parse(val)
          } catch {
            return undefined
          }
        }
        return val
      },
      z
        .array(
          z.object({
            attributeId: z.number().int().positive(),
            valueId: z.number().int().positive()
          })
        )
        .optional()
    )
  })
})

export const deleteVariantSchema = z.object({
  params: z.object({
    productId: z.string().regex(/^\d+$/, 'ID sản phẩm không hợp lệ'),
    variantId: z.string().regex(/^\d+$/, 'ID variant không hợp lệ')
  })
})

export type CreateProductInput = z.infer<typeof createProductSchema>['body']
export type UpdateProductInput = z.infer<typeof updateProductSchema>['body']
export type GetProductsQuery = z.infer<typeof getProductsSchema>['query']
export type CreateVariantInput = z.infer<typeof createVariantSchema>['body']
export type UpdateVariantInput = z.infer<typeof updateVariantSchema>['body']
