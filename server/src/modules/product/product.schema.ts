import { z } from 'zod'

// Schema cho tạo product
export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Tên sản phẩm là bắt buộc'),
    slug: z.string().min(1, 'Slug là bắt buộc'),
    description: z.string().optional(),
    brand: z.string().optional(),
    categoryIds: z.preprocess((val) => {
      if (typeof val === 'string') {
        try {
          return JSON.parse(val)
        } catch {
          return []
        }
      }
      return val
    }, z.array(z.number()).min(1, 'Phải có ít nhất một danh mục')),
    isActive: z.preprocess((val) => val === 'true' || val === true, z.boolean().optional().default(true))
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
    material: z.string().optional(),
    brand: z.string().optional(),
    categoryIds: z.preprocess((val) => {
      if (val === undefined) return undefined
      if (typeof val === 'string') {
        try {
          return JSON.parse(val)
        } catch {
          return []
        }
      }
      return val
    }, z.array(z.number()).optional()),
    isActive: z.preprocess((val) => {
      if (val === undefined) return undefined
      return val === 'true' || val === true
    }, z.boolean().optional())
  })
})

// Schema cho lấy product theo ID
export const getProductSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID sản phẩm không hợp lệ')
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
    minPrice: z
      .string()
      .regex(/^\d+(\.\d+)?$/)
      .optional(),
    maxPrice: z
      .string()
      .regex(/^\d+(\.\d+)?$/)
      .optional(),
    isActive: z.enum(['true', 'false']).optional()
  })
})

export type CreateProductInput = z.infer<typeof createProductSchema>['body']
export type UpdateProductInput = z.infer<typeof updateProductSchema>['body']
export type GetProductsQuery = z.infer<typeof getProductsSchema>['query']
