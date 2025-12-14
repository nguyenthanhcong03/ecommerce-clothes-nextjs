import { Category } from '@/features/category/categoryType';
import { API_ENDPOINTS } from '@/lib/config';
import { http } from '@/lib/http';
import { PaginationResponse } from '../auth/authType';

export const categoryService = {
  getAllCategories: async () => {
    const res = await http.get<PaginationResponse<Category>>(`${API_ENDPOINTS.CATEGORIES.LIST}`);
    return res.data;
  },
  getCategoryById: async (id: string) => {
    const res = await http.get<Category>(`${API_ENDPOINTS.CATEGORIES.DETAIL(Number(id))}`);
    return res.data;
  }
};
