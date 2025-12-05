import { authService } from '@/features/auth/authService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { categoryService } from './categoryService';

export const CATEGORY_QUERY_KEYS = {
  tree: ['categories-with-children']
};

export const useCategoriesWithChildrenQuery = () => {
  return useQuery({
    queryKey: CATEGORY_QUERY_KEYS.tree,
    queryFn: categoryService.getCategoriesWithChildren,
    staleTime: 5 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  });
};
