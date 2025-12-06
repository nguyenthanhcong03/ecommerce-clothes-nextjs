import { Router } from 'express'
import { validate } from '../../middlewares/validate.middleware'
import { asyncHandler } from '../../middlewares/error.middleware'
import upload from '../../middlewares/upload.middleware'
import {
  createCategorySchema,
  updateCategorySchema,
  getCategorySchema,
  deleteCategorySchema,
  getCategoriesSchema
} from './category.schema'
import {
  getCategories,
  getCategoryById,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  hardDeleteCategory
} from './category.controller'

const router = Router()

// Public routes
router.get('/', validate(getCategoriesSchema), asyncHandler(getCategories))

router.get('/slug/:slug', asyncHandler(getCategoryBySlug))

router.get('/:id', validate(getCategorySchema), asyncHandler(getCategoryById))

// Admin routes (cần thêm auth middleware sau)
router.post('/', upload.single('image'), validate(createCategorySchema), asyncHandler(createCategory))

router.put('/:id', upload.single('image'), validate(updateCategorySchema), asyncHandler(updateCategory))

router.delete('/:id', validate(deleteCategorySchema), asyncHandler(deleteCategory))

router.delete('/:id/hard', validate(deleteCategorySchema), asyncHandler(hardDeleteCategory))

export default router
