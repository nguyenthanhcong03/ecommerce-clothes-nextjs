import { Request, Response } from 'express'
import * as productService from './product.service'
import { CreateProductInput, UpdateProductInput, GetProductsQuery } from './product.schema'
import { responseHandler } from '@/utils/responseHandler'
import { AppError } from '@/utils/error'

// GET /api/products - Lấy danh sách products
export const getProducts = async (req: Request, res: Response) => {
  const query = req.query as unknown as GetProductsQuery
  const result = await productService.getProducts(query)

  responseHandler(res, 200, 'Lấy danh sách sản phẩm thành công', result)
}

// GET /api/products/:id - Lấy product theo ID
export const getProductById = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id)
  const product = await productService.getProductById(id)

  responseHandler(res, 200, 'Lấy sản phẩm thành công', { data: product })
}

// GET /api/products/slug/:slug - Lấy product theo slug
export const getProductBySlug = async (req: Request, res: Response) => {
  const slug = req.params.slug
  const product = await productService.getProductBySlug(slug)

  responseHandler(res, 200, 'Lấy sản phẩm thành công', { data: product })
}

// POST /api/products - Tạo product mới
export const createProduct = async (req: Request, res: Response) => {
  console.log('req.body :>> ', req.body)
  const data: CreateProductInput = req.body
  const files = req.files as Express.Multer.File[]

  if (!files || files.length === 0) {
    throw new AppError(400, 'Ít nhất một hình ảnh là bắt buộc')
  }

  const product = await productService.createProduct(data, files)

  responseHandler(res, 201, 'Tạo sản phảm thành công', { data: product })
}

// PUT /api/products/:id - Cập nhật product
export const updateProduct = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id)
  const data: UpdateProductInput = req.body
  const files = req.files as Express.Multer.File[]

  const product = await productService.updateProduct(id, data, files)

  responseHandler(res, 200, 'Cập nhật sản phẩm thành công', { data: product })
}

// DELETE /api/products/:id - Xóa mềm product
export const deleteProduct = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id)
  const result = await productService.deleteProduct(id)

  responseHandler(res, 200, result.message)
}

// DELETE /api/products/:id/hard - Xóa vĩnh viễn product
export const hardDeleteProduct = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id)
  const result = await productService.hardDeleteProduct(id)

  responseHandler(res, 200, result.message)
}
