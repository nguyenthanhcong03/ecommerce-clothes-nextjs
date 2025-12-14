import { Router } from 'express'
import { validate } from '../../middlewares/validate.middleware'
import { asyncHandler } from '../../middlewares/error.middleware'
import upload from '../../middlewares/upload.middleware'
import {
  createVariantSchema,
  updateVariantSchema,
  getVariantSchema,
  deleteVariantSchema,
  getVariantsSchema
} from './variant.schema'
import {
  getVariantsByProductId,
  getVariantById,
  createVariant,
  updateVariant,
  deleteVariant,
  hardDeleteVariant,
  updateVariantStock
} from './variant.controller'

const router = Router({ mergeParams: true })

// GET /api/products/:productId/variants
router.get('/', validate(getVariantsSchema), asyncHandler(getVariantsByProductId))

// GET /api/products/:productId/variants/:variantId
router.get('/:variantId', validate(getVariantSchema), asyncHandler(getVariantById))

// POST /api/products/:productId/variants
router.post('/', upload.array('images', 5), validate(createVariantSchema), asyncHandler(createVariant))

// PUT /api/products/:productId/variants/:variantId
router.put('/:variantId', upload.array('images', 5), validate(updateVariantSchema), asyncHandler(updateVariant))

// PATCH /api/products/:productId/variants/:variantId/stock
router.patch('/:variantId/stock', asyncHandler(updateVariantStock))

// DELETE /api/products/:productId/variants/:variantId
router.delete('/:variantId', validate(deleteVariantSchema), asyncHandler(deleteVariant))

// DELETE /api/products/:productId/variants/:variantId/hard
router.delete('/:variantId/hard', validate(deleteVariantSchema), asyncHandler(hardDeleteVariant))

export default router
