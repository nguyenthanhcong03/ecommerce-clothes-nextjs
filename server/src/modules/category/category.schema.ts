import { z } from 'zod'

// Schema cho tạo category
export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Danh mục là bắt buộc'),
    slug: z.string().min(1, 'Slug là bắt buộc'),
    description: z.string().optional(),
    isActive: z.preprocess((val) => val === 'true' || val === true, z.boolean().optional().default(true))
  })
})

// Schema cho cập nhật category
export const updateCategorySchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID danh mục không hợp lệ')
  }),
  body: z.object({
    name: z.string().min(1, 'Tên danh mục là bắt buộc').optional(),
    slug: z.string().min(1, 'Slug là bắt buộc').optional(),
    description: z.string().optional(),
    isActive: z.preprocess((val) => {
      if (val === undefined) return undefined
      return val === 'true' || val === true
    }, z.boolean().optional())
  })
})

// Schema cho lấy category theo ID
export const getCategorySchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID danh mục không hợp lệ')
  })
})

// Schema cho xóa category
export const deleteCategorySchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID danh mục không hợp lệ')
  })
})

// Schema cho query parameters
export const getCategoriesSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional().default('1'),
    limit: z.string().regex(/^\d+$/).optional().default('10'),
    search: z.string().optional(),
    isActive: z.enum(['true', 'false']).optional()
  })
})

export type CreateCategoryInput = z.infer<typeof createCategorySchema>['body']
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>['body']
export type GetCategoriesQuery = z.infer<typeof getCategoriesSchema>['query']
