import { Category } from '@/features/category/categoryType';
import { http } from '@/lib/http';
import { PaginationResponse } from '../auth/authType';

export const categoryService = {
  getAllCategories: async () => {
    const res = await http.get<PaginationResponse<Category>>(`api/category`);
    return res.data;
  },
  getCategoryById: async (id: string) => {
    const res = await http.get<Category>(`api/category/${id}`);
    return res.data;
  }
};
