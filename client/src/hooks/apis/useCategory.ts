import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { categoryService } from '../../services/categoryService';
import { CreateCategoryInput, UpdateCategoryInput } from '../../types/categoryType';

interface GetCategoriesParams {
  page?: number;
  limit?: number;
  search?: string;
  parentId?: number;
}

// Query keys
export const CATEGORY_QUERY_KEYS = {
  all: ['categories'] as const,
  list: (params?: GetCategoriesParams) => [...CATEGORY_QUERY_KEYS.all, 'list', params] as const,
  detail: (id: number) => [...CATEGORY_QUERY_KEYS.all, 'detail', id] as const,
  bySlug: (slug: string) => [...CATEGORY_QUERY_KEYS.all, 'bySlug', slug] as const
};

// ============= CATEGORY QUERIES =============

/**
 * Hook để lấy danh sách categories với phân trang
 */
export const useCategoriesQuery = (params?: GetCategoriesParams) => {
  return useQuery({
    queryKey: CATEGORY_QUERY_KEYS.list(params),
    queryFn: () => categoryService.getCategories(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false
  });
};

/**
 * Hook để lấy chi tiết category theo ID
 */
export const useCategoryQuery = (id: number) => {
  return useQuery({
    queryKey: CATEGORY_QUERY_KEYS.detail(id),
    queryFn: () => categoryService.getCategoryById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000
  });
};

/**
 * Hook để lấy category theo slug
 */
export const useCategoryBySlugQuery = (slug: string) => {
  return useQuery({
    queryKey: CATEGORY_QUERY_KEYS.bySlug(slug),
    queryFn: () => categoryService.getCategoryBySlug(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000
  });
};

// ============= CATEGORY MUTATIONS =============

/**
 * Hook để tạo category mới (Admin)
 */
export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, imageFile }: { data: CreateCategoryInput; imageFile: File }) =>
      categoryService.createCategory(data, imageFile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEYS.all });
      toast.success('Tạo danh mục thành công');
    },
    onError: (error: Error) => {
      toast.error(error?.message || 'Có lỗi xảy ra khi tạo danh mục');
    }
  });
};

/**
 * Hook để cập nhật category (Admin)
 */
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data, imageFile }: { id: number; data: UpdateCategoryInput; imageFile?: File }) =>
      categoryService.updateCategory(id, data, imageFile),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEYS.detail(variables.id) });
      toast.success('Cập nhật danh mục thành công');
    },
    onError: (error: Error) => {
      toast.error(error?.message || 'Có lỗi xảy ra khi cập nhật danh mục');
    }
  });
};

/**
 * Hook để xóa category (Admin)
 */
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => categoryService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEYS.all });
      toast.success('Xóa danh mục thành công');
    },
    onError: (error: Error) => {
      toast.error(error?.message || 'Có lỗi xảy ra khi xóa danh mục');
    }
  });
};
