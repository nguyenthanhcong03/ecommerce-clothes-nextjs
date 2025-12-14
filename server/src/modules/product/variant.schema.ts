import { z } from 'zod'

// Schema cho tạo variant
export const createVariantSchema = z.object({
  params: z.object({
    productId: z.string().regex(/^\d+$/, 'Invalid product ID')
  }),
  body: z.object({
    sku: z.string().min(1, 'SKU is required'),
    name: z.string().min(1, 'Variant name is required'),
    price: z.preprocess(
      (val) => (typeof val === 'string' ? parseFloat(val) : val),
      z.number().positive('Price must be positive')
    ),
    comparePrice: z.preprocess((val) => {
      if (val === undefined || val === '') return undefined
      return typeof val === 'string' ? parseFloat(val) : val
    }, z.number().positive().optional()),
    stock: z.preprocess(
      (val) => (typeof val === 'string' ? parseInt(val) : val),
      z.number().int().nonnegative('Stock must be non-negative').default(0)
    ),
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
      z
        .array(
          z.object({
            name: z.string().min(1, 'Attribute name is required'),
            value: z.string().min(1, 'Attribute value is required')
          })
        )
        .optional()
        .default([])
    ),
    isActive: z.preprocess((val) => val === 'true' || val === true, z.boolean().optional().default(true))
  })
})

// Schema cho cập nhật variant
export const updateVariantSchema = z.object({
  params: z.object({
    productId: z.string().regex(/^\d+$/, 'Invalid product ID'),
    variantId: z.string().regex(/^\d+$/, 'Invalid variant ID')
  }),
  body: z.object({
    sku: z.string().min(1, 'SKU is required').optional(),
    name: z.string().min(1, 'Variant name is required').optional(),
    price: z.preprocess((val) => {
      if (val === undefined) return undefined
      return typeof val === 'string' ? parseFloat(val) : val
    }, z.number().positive('Price must be positive').optional()),
    comparePrice: z.preprocess((val) => {
      if (val === undefined || val === '') return undefined
      return typeof val === 'string' ? parseFloat(val) : val
    }, z.number().positive().optional()),
    stock: z.preprocess((val) => {
      if (val === undefined) return undefined
      return typeof val === 'string' ? parseInt(val) : val
    }, z.number().int().nonnegative('Stock must be non-negative').optional()),
    attributes: z.preprocess(
      (val) => {
        if (val === undefined) return undefined
        if (typeof val === 'string') {
          try {
            return JSON.parse(val)
          } catch {
            return []
          }
        }
        return val
      },
      z
        .array(
          z.object({
            name: z.string().min(1, 'Attribute name is required'),
            value: z.string().min(1, 'Attribute value is required')
          })
        )
        .optional()
    ),
    isActive: z.preprocess((val) => {
      if (val === undefined) return undefined
      return val === 'true' || val === true
    }, z.boolean().optional())
  })
})

// Schema cho lấy variant theo ID
export const getVariantSchema = z.object({
  params: z.object({
    productId: z.string().regex(/^\d+$/, 'Invalid product ID'),
    variantId: z.string().regex(/^\d+$/, 'Invalid variant ID')
  })
})

// Schema cho xóa variant
export const deleteVariantSchema = z.object({
  params: z.object({
    productId: z.string().regex(/^\d+$/, 'Invalid product ID'),
    variantId: z.string().regex(/^\d+$/, 'Invalid variant ID')
  })
})

// Schema cho lấy danh sách variants của product
export const getVariantsSchema = z.object({
  params: z.object({
    productId: z.string().regex(/^\d+$/, 'Invalid product ID')
  }),
  query: z.object({
    page: z.string().regex(/^\d+$/).optional().default('1'),
    limit: z.string().regex(/^\d+$/).optional().default('20'),
    isActive: z.enum(['true', 'false']).optional()
  })
})

export type CreateVariantInput = z.infer<typeof createVariantSchema>['body']
export type UpdateVariantInput = z.infer<typeof updateVariantSchema>['body']
export type GetVariantsQuery = z.infer<typeof getVariantsSchema>['query']
