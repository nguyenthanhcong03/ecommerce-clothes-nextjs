import { z } from 'zod'

// Schema cho tạo category
export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Tên danh mục là bắt buộc'),
    slug: z.string().min(1, 'Slug là bắt buộc'),
    parentId: z.preprocess((val) => (val ? parseInt(val as string) : undefined), z.number().int().positive().optional())
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
    parentId: z.preprocess((val) => {
      if (val === undefined || val === null || val === '') return undefined
      return parseInt(val as string)
    }, z.number().int().positive().optional().nullable())
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
    parentId: z.string().regex(/^\d+$/).optional()
  })
})

export type CreateCategoryInput = z.infer<typeof createCategorySchema>['body']
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>['body']
export type GetCategoriesQuery = z.infer<typeof getCategoriesSchema>['query']
