import { http } from '@/lib/http';
import { PaginationResponse } from '../auth/authType';
import { Product, Review } from './productType';
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

  getProductById: async (id: string) => {
    try {
      const res = await http.get<Product>(`api/v1/product/${id}`);
      return res.data;
    } catch (error) {
      console.error('Có lỗi xảy ra khi tải chi tiết sản phẩm:', error);
    }
  },

  getRelatedProducts: async (productId: string) => {
    try {
      const res = await http.get<Product[]>(`api/v1/product/${productId}/related`);
      return res.data;
    } catch (error) {
      console.error('Có lỗi xảy ra khi tải sản phẩm liên quan:', error);
    }
  },

  getProductReviews: async (productId: string) => {
    try {
      const res = await http.get<PaginationResponse<Review>>(`api/v1/reviews/product/${productId}`);
      return res.data;
    } catch (error) {
      console.error('Có lỗi xảy ra khi tải đánh giá sản phẩm:', error);
    }
  }
};
