import { useMutation, useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { toast } from 'sonner';
import { productService } from '../../services/productService';
import {
  CreateProductData,
  CreateVariantData,
  GetProductsParams,
  UpdateProductData,
  UpdateVariantData
} from '../../types/productType';

// ============= PRODUCT QUERIES =============

/**
 * Hook để lấy danh sách sản phẩm với phân trang và filter
 */
export const useProducts = (params?: GetProductsParams, options?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>) => {
  return useQuery({
    queryKey: ['admin-products', params?.page, params?.search, params?.categoryId, params?.brand, params?.featured],
    queryFn: () => productService.getProducts(params),
    ...options
  });
};

/**
 * Hook để lấy chi tiết sản phẩm theo ID
 */
export const useProduct = (id: number, options?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>) => {
  return useQuery({
    queryKey: ['admin-product', id],
    queryFn: () => productService.getProductById(id),
    enabled: !!id,
    ...options
  });
};

// ============= PRODUCT MUTATIONS =============

/**
 * Hook để tạo sản phẩm mới
 */
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, images }: { data: CreateProductData; images: File[] }) =>
      productService.createProduct(data, images),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Tạo sản phẩm thành công');
    },
    onError: (error: Error) => {
      toast.error(error?.message || 'Có lỗi xảy ra khi tạo sản phẩm');
    }
  });
};

/**
 * Hook để cập nhật sản phẩm
 */
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data, images }: { id: number; data: UpdateProductData; images?: File[] }) =>
      productService.updateProduct(id, data, images),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Cập nhật sản phẩm thành công');
    },
    onError: (error: Error) => {
      toast.error(error?.message || 'Có lỗi xảy ra khi cập nhật sản phẩm');
    }
  });
};

/**
 * Hook để xóa mềm sản phẩm
 */
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => productService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Xóa sản phẩm thành công');
    },
    onError: (error: Error) => {
      toast.error(error?.message || 'Có lỗi xảy ra khi xóa sản phẩm');
    }
  });
};

/**
 * Hook để xóa vĩnh viễn sản phẩm
 */
export const useHardDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => productService.hardDeleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Xóa vĩnh viễn sản phẩm thành công');
    },
    onError: (error: Error) => {
      toast.error(error?.message || 'Có lỗi xảy ra khi xóa vĩnh viễn sản phẩm');
    }
  });
};

// ============= VARIANT QUERIES =============

/**
 * Hook để lấy danh sách variants của một sản phẩm
 */
export const useVariants = (productId: number | null, params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['product-variants', productId, params?.page, params?.limit],
    queryFn: () => (productId ? productService.getVariantsByProductId(productId, params) : null),
    enabled: !!productId
  });
};

/**
 * Hook để lấy chi tiết variant theo ID
 */
export const useVariant = (productId: number, variantId: number) => {
  return useQuery({
    queryKey: ['product-variant', productId, variantId],
    queryFn: () => productService.getVariantById(productId, variantId),
    enabled: !!productId && !!variantId
  });
};

// ============= VARIANT MUTATIONS =============

/**
 * Hook để tạo variant mới
 */
export const useCreateVariant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, data, images }: { productId: number; data: CreateVariantData; images?: File[] }) =>
      productService.createVariant(productId, data, images),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-variants'] });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Tạo biến thể thành công');
    },
    onError: (error: Error) => {
      toast.error(error?.message || 'Có lỗi xảy ra khi tạo biến thể');
    }
  });
};

/**
 * Hook để cập nhật variant
 */
export const useUpdateVariant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      variantId,
      data,
      images
    }: {
      productId: number;
      variantId: number;
      data: UpdateVariantData;
      images?: File[];
    }) => productService.updateVariant(productId, variantId, data, images),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-variants'] });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Cập nhật biến thể thành công');
    },
    onError: (error: Error) => {
      toast.error(error?.message || 'Có lỗi xảy ra khi cập nhật biến thể');
    }
  });
};

/**
 * Hook để xóa variant
 */
export const useDeleteVariant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, variantId }: { productId: number; variantId: number }) =>
      productService.deleteVariant(productId, variantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-variants'] });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Xóa biến thể thành công');
    },
    onError: (error: Error) => {
      toast.error(error?.message || 'Có lỗi xảy ra khi xóa biến thể');
    }
  });
};

/**
 * Hook để xóa vĩnh viễn variant
 */
export const useHardDeleteVariant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, variantId }: { productId: number; variantId: number }) =>
      productService.hardDeleteVariant(productId, variantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-variants'] });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Xóa vĩnh viễn biến thể thành công');
    },
    onError: (error: Error) => {
      toast.error(error?.message || 'Có lỗi xảy ra khi xóa vĩnh viễn biến thể');
    }
  });
};

/**
 * Hook để cập nhật stock của variant
 */
export const useUpdateVariantStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, variantId, quantity }: { productId: number; variantId: number; quantity: number }) =>
      productService.updateVariantStock(productId, variantId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-variants'] });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Cập nhật kho thành công');
    },
    onError: (error: Error) => {
      toast.error(error?.message || 'Có lỗi xảy ra khi cập nhật kho');
    }
  });
};
