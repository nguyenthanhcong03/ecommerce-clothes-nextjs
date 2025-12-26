import { Router } from 'express'
import { validate } from '@/middlewares/validate.middleware'
import { asyncHandler } from '@/middlewares/error.middleware'
import upload from '@/middlewares/upload.middleware'
import {
  createProductSchema,
  updateProductSchema,
  getProductSchema,
  getProductBySlugSchema,
  deleteProductSchema,
  getProductsSchema,
  createVariantSchema,
  updateVariantSchema,
  deleteVariantSchema
} from './product.schema'
import {
  getProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  createVariant,
  updateVariant,
  deleteVariant
} from './product.controller'

const router = Router()

// ============= PRODUCT ROUTES =============

// Public routes
router.get('/', validate(getProductsSchema), asyncHandler(getProducts))

router.get('/slug/:slug', validate(getProductBySlugSchema), asyncHandler(getProductBySlug))

router.get('/:id', validate(getProductSchema), asyncHandler(getProductById))

// Admin routes (cần thêm auth middleware sau)
router.post('/', upload.array('images', 10), validate(createProductSchema), asyncHandler(createProduct))

router.put('/:id', upload.array('images', 10), validate(updateProductSchema), asyncHandler(updateProduct))

router.delete('/:id', validate(deleteProductSchema), asyncHandler(deleteProduct))

// ============= VARIANT ROUTES =============

// Admin routes
router.post('/:productId/variants', upload.single('image'), validate(createVariantSchema), asyncHandler(createVariant))

router.put(
  '/:productId/variants/:variantId',
  upload.single('image'),
  validate(updateVariantSchema),
  asyncHandler(updateVariant)
)

router.delete('/:productId/variants/:variantId', validate(deleteVariantSchema), asyncHandler(deleteVariant))

export default router
