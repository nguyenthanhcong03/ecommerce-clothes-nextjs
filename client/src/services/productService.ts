import { http } from '@/lib/http';
import {
  Product,
  CreateProductInput,
  UpdateProductInput,
  CreateVariantInput,
  UpdateVariantInput,
  GetProductsParams,
  ProductVariant
} from '@/types/productType';
import { PaginationResponse } from '@/types/authType';

export const productService = {
  // ============= PRODUCT OPERATIONS =============

  // Lấy danh sách products
  getProducts: async (params?: GetProductsParams) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.categoryId) queryParams.append('categoryId', params.categoryId.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.minPrice) queryParams.append('minPrice', params.minPrice.toString());
    if (params?.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/api/products?${queryString}` : '/api/products';

    const response = await http.get<PaginationResponse<Product>>(endpoint);
    return response.data;
  },

  // Lấy product theo ID
  getProductById: async (id: number) => {
    const response = await http.get<{ data: Product }>(`/api/products/${id}`);
    return response.data;
  },

  // Lấy product theo slug
  getProductBySlug: async (slug: string) => {
    const response = await http.get<{ data: Product }>(`/api/products/slug/${slug}`);
    return response.data;
  },

  // Tạo product mới (Admin)
  createProduct: async (data: CreateProductInput, imageFiles: File[]) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('slug', data.slug);
    if (data.description) formData.append('description', data.description);
    if (data.basePrice) formData.append('basePrice', data.basePrice.toString());
    if (data.status) formData.append('status', data.status);
    formData.append('categoryId', data.categoryId.toString());
    formData.append('variants', JSON.stringify(data.variants));

    // Thêm các ảnh
    imageFiles.forEach((file) => {
      formData.append('images', file);
    });

    const response = await http.post<{ data: Product }>('/api/products', formData);
    return response.data;
  },

  // Cập nhật product (Admin)
  updateProduct: async (id: number, data: UpdateProductInput, imageFiles?: File[]) => {
    const formData = new FormData();
    if (data.name) formData.append('name', data.name);
    if (data.slug) formData.append('slug', data.slug);
    if (data.description !== undefined) formData.append('description', data.description || '');
    if (data.basePrice !== undefined) {
      formData.append('basePrice', data.basePrice === null ? '' : data.basePrice.toString());
    }
    if (data.status) formData.append('status', data.status);
    if (data.categoryId) formData.append('categoryId', data.categoryId.toString());

    // Thêm các ảnh mới nếu có
    if (imageFiles && imageFiles.length > 0) {
      imageFiles.forEach((file) => {
        formData.append('images', file);
      });
    }

    const response = await http.put<{ data: Product }>(`/api/products/${id}`, formData);
    return response.data;
  },

  // Xóa product (Admin)
  deleteProduct: async (id: number) => {
    const response = await http.delete(`/api/products/${id}`);
    return response.data;
  },

  // ============= VARIANT OPERATIONS =============

  // Tạo variant mới cho product (Admin)
  createVariant: async (productId: number, data: CreateVariantInput, imageFile?: File) => {
    const formData = new FormData();
    formData.append('sku', data.sku);
    formData.append('price', data.price.toString());
    formData.append('stock', data.stock.toString());
    if (data.image) formData.append('image', data.image);
    formData.append('attributes', JSON.stringify(data.attributes));

    if (imageFile) {
      formData.append('image', imageFile);
    }

    const response = await http.post<{ data: ProductVariant }>(`/api/products/${productId}/variants`, formData, {
      baseUrl: ''
    });
    return response.data;
  },

  // Cập nhật variant (Admin)
  updateVariant: async (productId: number, variantId: number, data: UpdateVariantInput, imageFile?: File) => {
    const formData = new FormData();
    if (data.sku) formData.append('sku', data.sku);
    if (data.price !== undefined) formData.append('price', data.price.toString());
    if (data.stock !== undefined) formData.append('stock', data.stock.toString());
    if (data.image) formData.append('image', data.image);
    if (data.attributes) formData.append('attributes', JSON.stringify(data.attributes));

    if (imageFile) {
      formData.append('image', imageFile);
    }

    const response = await http.put<{ data: ProductVariant }>(
      `/api/products/${productId}/variants/${variantId}`,
      formData,
      {
        baseUrl: ''
      }
    );
    return response.data;
  },

  // Xóa variant (Admin)
  deleteVariant: async (productId: number, variantId: number) => {
    const response = await http.delete(`/api/products/${productId}/variants/${variantId}`);
    return response.data;
  }
};
