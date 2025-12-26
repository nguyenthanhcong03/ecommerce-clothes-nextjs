import { Request, Response } from 'express'
import * as productService from './product.service'
import {
  CreateProductInput,
  UpdateProductInput,
  GetProductsQuery,
  CreateVariantInput,
  UpdateVariantInput
} from './product.schema'
import { responseHandler } from '@/utils/responseHandler'

// GET /api/products - Lấy danh sách products
export const getProducts = async (req: Request, res: Response) => {
  const query = req.query as unknown as GetProductsQuery
  const result = await productService.getProducts(query)

  responseHandler(res, 200, 'Products fetched successfully', result)
}

// GET /api/products/:id - Lấy product theo ID
export const getProductById = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id)
  const product = await productService.getProductById(id)

  responseHandler(res, 200, 'Product fetched successfully', { data: product })
}

// GET /api/products/slug/:slug - Lấy product theo slug
export const getProductBySlug = async (req: Request, res: Response) => {
  const slug = req.params.slug
  const product = await productService.getProductBySlug(slug)

  responseHandler(res, 200, 'Product fetched successfully', { data: product })
}

// POST /api/products - Tạo product mới
export const createProduct = async (req: Request, res: Response) => {
  const data: CreateProductInput = req.body
  const files = req.files as Express.Multer.File[]

  if (!files || files.length === 0) {
    return res.status(400).json({ message: 'Ít nhất một ảnh là bắt buộc' })
  }

  const product = await productService.createProduct(data, files)

  responseHandler(res, 201, 'Product created successfully', { data: product })
}

// PUT /api/products/:id - Cập nhật product
export const updateProduct = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id)
  const data: UpdateProductInput = req.body
  const files = req.files as Express.Multer.File[]

  const product = await productService.updateProduct(id, data, files)

  responseHandler(res, 200, 'Product updated successfully', { data: product })
}

// DELETE /api/products/:id - Xóa product
export const deleteProduct = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id)
  const result = await productService.deleteProduct(id)

  responseHandler(res, 200, result.message)
}

// ============= VARIANT OPERATIONS =============

// POST /api/products/:productId/variants - Tạo variant mới
export const createVariant = async (req: Request, res: Response) => {
  const productId = parseInt(req.params.productId)
  const data: CreateVariantInput = req.body
  const file = req.file

  const variant = await productService.createVariant(productId, data, file)

  responseHandler(res, 201, 'Variant created successfully', { data: variant })
}

// PUT /api/products/:productId/variants/:variantId - Cập nhật variant
export const updateVariant = async (req: Request, res: Response) => {
  const productId = parseInt(req.params.productId)
  const variantId = parseInt(req.params.variantId)
  const data: UpdateVariantInput = req.body
  const file = req.file

  const variant = await productService.updateVariant(productId, variantId, data, file)

  responseHandler(res, 200, 'Variant updated successfully', { data: variant })
}

// DELETE /api/products/:productId/variants/:variantId - Xóa variant
export const deleteVariant = async (req: Request, res: Response) => {
  const productId = parseInt(req.params.productId)
  const variantId = parseInt(req.params.variantId)
  const result = await productService.deleteVariant(productId, variantId)

  responseHandler(res, 200, result.message)
}
