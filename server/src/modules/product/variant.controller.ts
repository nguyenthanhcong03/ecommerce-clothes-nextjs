import { Request, Response } from 'express'
import * as variantService from './variant.service'
import { CreateVariantInput, UpdateVariantInput, GetVariantsQuery } from './variant.schema'
import { responseHandler } from '@/utils/responseHandler'

// GET /api/products/:productId/variants - Lấy danh sách variants của product
export const getVariantsByProductId = async (req: Request, res: Response) => {
  const productId = parseInt(req.params.productId)
  const query = req.query as unknown as GetVariantsQuery
  const result = await variantService.getVariantsByProductId(productId, query)

  responseHandler(res, 200, 'Variants fetched successfully', result)
}

// GET /api/products/:productId/variants/:variantId - Lấy variant theo ID
export const getVariantById = async (req: Request, res: Response) => {
  const productId = parseInt(req.params.productId)
  const variantId = parseInt(req.params.variantId)
  const variant = await variantService.getVariantById(productId, variantId)

  responseHandler(res, 200, 'Variant fetched successfully', { data: variant })
}

// POST /api/products/:productId/variants - Tạo variant mới
export const createVariant = async (req: Request, res: Response) => {
  const productId = parseInt(req.params.productId)
  const data: CreateVariantInput = req.body
  const files = req.files as Express.Multer.File[]

  const variant = await variantService.createVariant(productId, data, files)

  responseHandler(res, 201, 'Variant created successfully', { data: variant })
}

// PUT /api/products/:productId/variants/:variantId - Cập nhật variant
export const updateVariant = async (req: Request, res: Response) => {
  const productId = parseInt(req.params.productId)
  const variantId = parseInt(req.params.variantId)
  const data: UpdateVariantInput = req.body
  const files = req.files as Express.Multer.File[]

  const variant = await variantService.updateVariant(productId, variantId, data, files)

  responseHandler(res, 200, 'Variant updated successfully', { data: variant })
}

// DELETE /api/products/:productId/variants/:variantId - Xóa mềm variant
export const deleteVariant = async (req: Request, res: Response) => {
  const productId = parseInt(req.params.productId)
  const variantId = parseInt(req.params.variantId)
  const result = await variantService.deleteVariant(productId, variantId)

  responseHandler(res, 200, result.message)
}

// DELETE /api/products/:productId/variants/:variantId/hard - Xóa vĩnh viễn variant
export const hardDeleteVariant = async (req: Request, res: Response) => {
  const productId = parseInt(req.params.productId)
  const variantId = parseInt(req.params.variantId)
  const result = await variantService.hardDeleteVariant(productId, variantId)

  responseHandler(res, 200, result.message)
}

// PATCH /api/products/:productId/variants/:variantId/stock - Cập nhật stock
export const updateVariantStock = async (req: Request, res: Response) => {
  const variantId = parseInt(req.params.variantId)
  const { quantity } = req.body

  if (!quantity || isNaN(quantity)) {
    return res.status(400).json({ message: 'Invalid quantity' })
  }

  const variant = await variantService.updateVariantStock(variantId, parseInt(quantity))

  responseHandler(res, 200, 'Stock updated successfully', { data: variant })
}
