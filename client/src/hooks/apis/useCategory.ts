import { useQuery } from '@tanstack/react-query';
import { categoryService } from '../../services/categoryService';

export const CATEGORY_QUERY_KEYS = {
  tree: ['categories-with-children']
};

export const useCategoriesQuery = () => {
  return useQuery({
    queryKey: CATEGORY_QUERY_KEYS.tree,
    queryFn: categoryService.getCategories,
    staleTime: 5 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  });
};
