import { Category } from '@/types/categoryType';
import { API_ENDPOINTS } from '@/lib/config';
import { http } from '@/lib/http';
import { PaginationResponse } from '../types/authType';

export const categoryService = {
  getAllCategories: async () => {
    try {
      const res = await http.get<PaginationResponse<Category>>(`${API_ENDPOINTS.CATEGORIES.LIST}`);
      return res.data;
    } catch (error) {
      console.error('Có lỗi xảy ra khi lấy danh sách danh mục:', error);
      throw error;
    }
  },
  getCategories: async () => {
    try {
      const res = await http.get<PaginationResponse<Category>>(`${API_ENDPOINTS.CATEGORIES.LIST}`);
      return res.data;
    } catch (error) {
      console.error('Có lỗi xảy ra khi lấy danh sách danh mục:', error);
      throw error;
    }
  },
  getCategoryById: async (id: string) => {
    const res = await http.get<Category>(`${API_ENDPOINTS.CATEGORIES.DETAIL(Number(id))}`);
    return res.data;
  }
};
