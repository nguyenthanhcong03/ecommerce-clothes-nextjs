import { Request, Response } from 'express'
import * as categoryService from './category.service'
import { CreateCategoryInput, UpdateCategoryInput, GetCategoriesQuery } from './category.schema'
import { responseHandler } from '@/utils/responseHandler'

// GET /api/categories - Lấy danh sách categories
export const getCategories = async (req: Request, res: Response) => {
  const query = req.query as unknown as GetCategoriesQuery
  const result = await categoryService.getCategories(query)

  responseHandler(res, 200, 'Categories fetched successfully', result)
}

// GET /api/categories/:id - Lấy category theo ID
export const getCategoryById = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id)
  const category = await categoryService.getCategoryById(id)

  responseHandler(res, 200, 'Category fetched successfully', { data: category })
}

// GET /api/categories/slug/:slug - Lấy category theo slug
export const getCategoryBySlug = async (req: Request, res: Response) => {
  const slug = req.params.slug
  const category = await categoryService.getCategoryBySlug(slug)

  responseHandler(res, 200, 'Category fetched successfully', { data: category })
}

// POST /api/categories - Tạo category mới
export const createCategory = async (req: Request, res: Response) => {
  const data: CreateCategoryInput = req.body
  const file = req.file

  if (!file) {
    return res.status(400).json({ message: 'Image is required' })
  }

  const category = await categoryService.createCategory(data, file)

  responseHandler(res, 201, 'Category created successfully', { data: category })
}

// PUT /api/categories/:id - Cập nhật category
export const updateCategory = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id)
  const data: UpdateCategoryInput = req.body
  const file = req.file

  const category = await categoryService.updateCategory(id, data, file)

  responseHandler(res, 200, 'Category updated successfully', { data: category })
}

// DELETE /api/categories/:id - Xóa category
export const deleteCategory = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id)
  const result = await categoryService.deleteCategory(id)

  responseHandler(res, 200, result.message)
}
