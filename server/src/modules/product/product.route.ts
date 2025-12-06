import { Router } from 'express'
import { validate } from '../../middlewares/validate.middleware'
import { asyncHandler } from '../../middlewares/error.middleware'
import upload from '../../middlewares/upload.middleware'
import {
  createProductSchema,
  updateProductSchema,
  getProductSchema,
  deleteProductSchema,
  getProductsSchema
} from './product.schema'
import {
  getProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  hardDeleteProduct
} from './product.controller'

const router = Router()

// Public routes
router.get('/', validate(getProductsSchema), asyncHandler(getProducts))

router.get('/slug/:slug', asyncHandler(getProductBySlug))

router.get('/:id', validate(getProductSchema), asyncHandler(getProductById))

// Admin routes (cần thêm auth middleware sau)
router.post('/', upload.array('images', 10), validate(createProductSchema), asyncHandler(createProduct))

router.put('/:id', upload.array('images', 10), validate(updateProductSchema), asyncHandler(updateProduct))

router.delete('/:id', validate(deleteProductSchema), asyncHandler(deleteProduct))

router.delete('/:id/hard', validate(deleteProductSchema), asyncHandler(hardDeleteProduct))

export default router
