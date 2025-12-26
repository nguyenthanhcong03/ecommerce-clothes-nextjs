'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, ButtonCustom } from '@/components/ui/button';
import { Input, InputCustom } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { MoreHorizontal, Plus, Search, Edit, Trash2, Eye, Package } from 'lucide-react';
import Image from 'next/image';
import { ProductAdmin, ProductVariant } from '@/types/productType';
import { productService } from '@/services/productService';
import { useDeleteProduct, useHardDeleteProduct, useProducts } from '@/hooks/apis/useProduct';
import { formatCurrency } from '@/lib/utils';

interface ProductTableProps {
  onEdit: (product: ProductAdmin) => void;
  onViewVariants: (product: ProductAdmin) => void;
  onCreateProduct: () => void;
}

export function ProductTable({ onEdit, onViewVariants, onCreateProduct }: ProductTableProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading, error } = useProducts();
  const deleteMutation = useDeleteProduct();

  const handleDelete = (id: number) => {
    if (confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      deleteMutation.mutate(id);
    }
  };

  const getPriceRange = (variants: ProductVariant[]) => {
    if (!variants || variants.length === 0) return 'N/A';
    const prices = variants.map((v) => v.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    if (min === max) return formatCurrency(min);
    return `${formatCurrency(min)} - ${formatCurrency(max)}`;
  };

  if (error) {
    return (
      <div className='py-10 text-center'>
        <p className='text-red-500'>Có lỗi xảy ra khi tải dữ liệu</p>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex max-w-md flex-1 items-center gap-2'>
          <div className='relative flex-1'>
            <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
            <InputCustom
              placeholder='Tìm kiếm sản phẩm...'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className='pl-10'
            />
          </div>
        </div>
        <ButtonCustom onClick={onCreateProduct}>
          <Plus className='mr-2 h-4 w-4' />
          Thêm sản phẩm
        </ButtonCustom>
      </div>

      {/* Table */}
      <div className='rounded-xs border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-[100px]'>Hình ảnh</TableHead>
              <TableHead>Tên sản phẩm</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead>Thương hiệu</TableHead>
              <TableHead>Giá</TableHead>
              <TableHead>Biến thể</TableHead>
              <TableHead>Đánh giá</TableHead>
              <TableHead className='text-right'>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className='py-10 text-center'>
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : data?.data && data.data.length > 0 ? (
              data.data.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    {product.images && product.images.length > 0 ? (
                      <div className='relative h-16 w-16 overflow-hidden rounded'>
                        <Image src={product.images[0].url} alt={product.name} fill className='object-cover' />
                      </div>
                    ) : (
                      <div className='flex h-16 w-16 items-center justify-center rounded bg-gray-200'>
                        <Package className='h-6 w-6 text-gray-400' />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className='flex flex-col'>
                      <span className='font-medium'>{product.name}</span>
                      <span className='text-sm text-gray-500'>SKU: {product.variants?.[0]?.sku || 'N/A'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant='outline'>{product.category?.name || 'N/A'}</Badge>
                  </TableCell>
                  <TableCell>{product.brand}</TableCell>
                  <TableCell>{getPriceRange(product.variants)}</TableCell>
                  <TableCell>
                    <Badge variant='secondary'>{product.variants?.length || 0} biến thể</Badge>
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center gap-1'>
                      <span className='text-yellow-500'>★</span>
                      <span>{product.averageRating?.toFixed(1) || 0}</span>
                      <span className='text-sm text-gray-500'>({product.totalReviews || 0})</span>
                    </div>
                  </TableCell>
                  <TableCell className='text-right'>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' size='icon'>
                          <MoreHorizontal className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onViewVariants(product)}>
                          <Eye className='mr-2 h-4 w-4' />
                          Xem biến thể
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(product)}>
                          <Edit className='mr-2 h-4 w-4' />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(product.id)} className='text-orange-600'>
                          <Trash2 className='mr-2 h-4 w-4' />
                          Xóa
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleHardDelete(product.id)} className='text-red-600'>
                          <Trash2 className='mr-2 h-4 w-4' />
                          Xóa vĩnh viễn
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className='py-10 text-center'>
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {/* {data && data.totalPages > 1 && (
        <div className='flex items-center justify-between'>
          <div className='text-sm text-gray-500'>
            Trang {data.page} / {data.totalPages} (Tổng {data.total} sản phẩm)
          </div>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Trước
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              disabled={page === data.totalPages}
            >
              Sau
            </Button>
          </div>
        </div>
      )} */}
    </div>
  );
}
