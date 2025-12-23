import { http } from '@/lib/http';
import { PaginationResponse } from '../types/authType';
import {
  CreateProductData,
  CreateVariantData,
  GetProductsParams,
  Product,
  ProductAdmin,
  ProductVariant,
  Review,
  UpdateProductData,
  UpdateVariantData
} from '../types/productType';
import { API_ENDPOINTS } from '@/lib/config';

export const productService = {
  getAllProducts: async (query: string = '') => {
    try {
      const res = await http.get<PaginationResponse<Product>>(
        `${API_ENDPOINTS.PRODUCTS.LIST}${query && `?${query?.toString()}`}`
      );
      return res.data;
    } catch (error) {
      console.error('Có lỗi xảy ra khi tải danh sách sản phẩm:', error);
      throw error;
    }
  },

  getFeaturedProducts: async () => {
    try {
      const res = await http.get<Product[]>(`api/v1/product/featured`);
      return res.data;
    } catch (error) {
      console.error('Có lỗi xảy ra khi tải sản phẩm nổi bật:', error);
    }
  },

  getProductById: async (id: number) => {
    try {
      const res = await http.get<Product>(`api/v1/product/${id}`);
      return res.data;
    } catch (error) {
      console.error('Có lỗi xảy ra khi tải chi tiết sản phẩm:', error);
    }
  },

  getRelatedProducts: async (productId: number) => {
    try {
      const res = await http.get<Product[]>(`api/v1/product/${productId}/related`);
      return res.data;
    } catch (error) {
      console.error('Có lỗi xảy ra khi tải sản phẩm liên quan:', error);
    }
  },

  getProductReviews: async (productId: number) => {
    try {
      const res = await http.get<PaginationResponse<Review>>(`api/v1/reviews/product/${productId}`);
      return res.data;
    } catch (error) {
      console.error('Có lỗi xảy ra khi tải đánh giá sản phẩm:', error);
    }
  },
  getProducts: async (params?: GetProductsParams) => {
    try {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value));
          }
        });
      }

      const res = await http.get<PaginationResponse<ProductAdmin>>(
        `${API_ENDPOINTS.PRODUCTS.LIST}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
      );
      return res.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },
  // Create new product
  createProduct: async (data: CreateProductData, images: File[]) => {
    try {
      const formData = new FormData();

      // Append product data
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'tags' && Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      // Append images
      images.forEach((image) => {
        formData.append('images', image);
      });

      const res = await http.post<{ data: ProductAdmin }>(API_ENDPOINTS.PRODUCTS.CREATE, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return res.data;
    } catch (error) {
      console.error('Lỗi khi tạo mới sản phẩm:', error);
      throw error;
    }
  },

  // Update product
  updateProduct: async (id: number, data: UpdateProductData, images?: File[]) => {
    try {
      const formData = new FormData();

      // Append product data
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'tags' && Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      // Thêm images nếu có
      if (images && images.length > 0) {
        images.forEach((image) => {
          formData.append('images', image);
        });
      }

      const res = await http.put<{ data: ProductAdmin }>(API_ENDPOINTS.PRODUCTS.UPDATE(id), formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return res.data;
    } catch (error) {
      console.error('Lỗi khi cập nhật sản phẩm:', error);
      throw error;
    }
  },

  // Soft delete product
  deleteProduct: async (id: number) => {
    try {
      const res = await http.delete<{ message: string }>(API_ENDPOINTS.PRODUCTS.DELETE(id));
      return res.data;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  // Hard delete product
  hardDeleteProduct: async (id: number) => {
    try {
      const res = await http.delete<{ message: string }>(`${API_ENDPOINTS.PRODUCTS.DELETE(id)}/hard`);
      return res.data;
    } catch (error) {
      console.error('Error hard deleting product:', error);
      throw error;
    }
  },

  // Variant Management
  getVariantsByProductId: async (productId: number, params?: { page?: number; limit?: number }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value));
          }
        });
      }

      const res = await http.get<PaginationResponse<ProductVariant>>(
        `/api/v1/products/${productId}/variants${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
      );
      return res.data;
    } catch (error) {
      console.error('Error fetching variants:', error);
      throw error;
    }
  },

  getVariantById: async (productId: number, variantId: number) => {
    try {
      const res = await http.get<{ data: ProductVariant }>(`/api/v1/products/${productId}/variants/${variantId}`);
      return res.data;
    } catch (error) {
      console.error('Error fetching variant:', error);
      throw error;
    }
  },

  createVariant: async (productId: number, data: CreateVariantData, images?: File[]) => {
    try {
      const formData = new FormData();

      Object.entries(data).forEach(([key, value]) => {
        if (key === 'attributes' && Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      if (images && images.length > 0) {
        images.forEach((image) => {
          formData.append('images', image);
        });
      }

      const res = await http.post<{ data: ProductVariant }>(`/api/v1/products/${productId}/variants`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return res.data;
    } catch (error) {
      console.error('Error creating variant:', error);
      throw error;
    }
  },

  updateVariant: async (productId: number, variantId: number, data: UpdateVariantData, images?: File[]) => {
    try {
      const formData = new FormData();

      Object.entries(data).forEach(([key, value]) => {
        if (key === 'attributes' && Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      if (images && images.length > 0) {
        images.forEach((image) => {
          formData.append('images', image);
        });
      }

      const res = await http.put<{ data: ProductVariant }>(
        `/api/v1/products/${productId}/variants/${variantId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return res.data;
    } catch (error) {
      console.error('Error updating variant:', error);
      throw error;
    }
  },

  deleteVariant: async (productId: number, variantId: number) => {
    try {
      const res = await http.delete<{ message: string }>(`/api/v1/products/${productId}/variants/${variantId}`);
      return res.data;
    } catch (error) {
      console.error('Error deleting variant:', error);
      throw error;
    }
  },

  hardDeleteVariant: async (productId: number, variantId: number) => {
    try {
      const res = await http.delete<{ message: string }>(`/api/v1/products/${productId}/variants/${variantId}/hard`);
      return res.data;
    } catch (error) {
      console.error('Error hard deleting variant:', error);
      throw error;
    }
  },

  updateVariantStock: async (productId: number, variantId: number, quantity: number) => {
    // try {
    //   const res = await http.patch<{ data: ProductVariant }>(
    //     `/api/v1/products/${productId}/variants/${variantId}/stock`,
    //     { quantity }
    //   );
    //   return res.data.data;
    // } catch (error) {
    //   console.error('Error updating variant stock:', error);
    //   throw error;
    // }
  }
};
