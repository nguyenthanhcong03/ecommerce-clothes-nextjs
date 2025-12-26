import { useMutation, useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { toast } from 'sonner';
import { productService } from '../../services/productService';
import {
  CreateProductInput,
  CreateVariantInput,
  GetProductsParams,
  UpdateProductInput,
  UpdateVariantInput
} from '../../types/productType';

// ============= PRODUCT QUERIES =============

/**
 * Hook để lấy danh sách sản phẩm với phân trang và filter
 */
export const useProducts = (params?: GetProductsParams, options?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>) => {
  return useQuery({
    queryKey: [
      'admin-products',
      params?.page,
      params?.search,
      params?.categoryId,
      params?.status,
      params?.minPrice,
      params?.maxPrice,
      params?.sortBy,
      params?.sortOrder
    ],
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
    mutationFn: ({ data, imageFiles }: { data: CreateProductInput; imageFiles: File[] }) =>
      productService.createProduct(data, imageFiles),
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
    mutationFn: ({ id, data, imageFiles }: { id: number; data: UpdateProductInput; imageFiles?: File[] }) =>
      productService.updateProduct(id, data, imageFiles),
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

// ============= VARIANT QUERIES =============
// Variants được lấy cùng với product, không cần query riêng

// ============= VARIANT MUTATIONS =============

/**
 * Hook để tạo variant mới
 */
export const useCreateVariant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, data, imageFile }: { productId: number; data: CreateVariantInput; imageFile?: File }) =>
      productService.createVariant(productId, data, imageFile),
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
      imageFile
    }: {
      productId: number;
      variantId: number;
      data: UpdateVariantInput;
      imageFile?: File;
    }) => productService.updateVariant(productId, variantId, data, imageFile),
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
