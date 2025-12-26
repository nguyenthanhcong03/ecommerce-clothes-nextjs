import { http } from '@/lib/http';
import { Category, CreateCategoryInput, UpdateCategoryInput } from '@/types/categoryType';
import { PaginationResponse } from '@/types/authType';

interface GetCategoriesParams {
  page?: number;
  limit?: number;
  search?: string;
  parentId?: number;
}

export const categoryService = {
  // Lấy danh sách categories
  getCategories: async (params?: GetCategoriesParams) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.parentId) queryParams.append('parentId', params.parentId.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/api/categories?${queryString}` : '/api/categories';

    const response = await http.get<PaginationResponse<Category>>(endpoint);
    return response.data;
  },

  // Lấy category theo ID
  getCategoryById: async (id: number) => {
    const response = await http.get<{ data: Category }>(`/api/categories/${id}`);
    return response.data;
  },

  // Lấy category theo slug
  getCategoryBySlug: async (slug: string) => {
    const response = await http.get<{ data: Category }>(`/api/categories/slug/${slug}`);
    return response.data;
  },

  // Tạo category mới (Admin)
  createCategory: async (data: CreateCategoryInput, imageFile: File) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('slug', data.slug);
    if (data.parentId) {
      formData.append('parentId', data.parentId.toString());
    }
    formData.append('image', imageFile);

    const response = await http.post<{ data: Category }>('/api/categories', formData);
    return response.data;
  },

  // Cập nhật category (Admin)
  updateCategory: async (id: number, data: UpdateCategoryInput, imageFile?: File) => {
    const formData = new FormData();
    if (data.name) formData.append('name', data.name);
    if (data.slug) formData.append('slug', data.slug);
    if (data.parentId !== undefined) {
      if (data.parentId === null) {
        formData.append('parentId', '');
      } else {
        formData.append('parentId', data.parentId.toString());
      }
    }
    if (imageFile) {
      formData.append('image', imageFile);
    }

    const response = await http.put<{ data: Category }>(`/api/categories/${id}`, formData);
    return response.data;
  },

  // Xóa category (Admin)
  deleteCategory: async (id: number) => {
    const response = await http.delete(`/api/categories/${id}`);
    return response.data;
  }
};
