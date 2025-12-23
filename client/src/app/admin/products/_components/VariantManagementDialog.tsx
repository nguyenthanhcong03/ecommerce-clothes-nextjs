'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useDeleteVariant, useUpdateVariantStock, useVariants } from '@/hooks/apis/useProduct';
import { ProductAdmin, ProductVariant } from '@/types/productType';
import { Edit, Package, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { toast } from 'sonner';
import { VariantFormDialog } from './VariantFormDialog';

interface VariantManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductAdmin | null;
}

export function VariantManagementDialog({ open, onOpenChange, product }: VariantManagementDialogProps) {
  const [variantFormOpen, setVariantFormOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [stockUpdate, setStockUpdate] = useState<{ [key: number]: number }>({});

  const { data, isLoading } = useVariants(product?.id || null);

  const deleteVariantMutation = useDeleteVariant();
  const updateStockMutation = useUpdateVariantStock();

  const handleDeleteVariant = (variantId: number) => {
    if (!product) return;
    if (confirm('Bạn có chắc muốn xóa biến thể này?')) {
      deleteVariantMutation.mutate({ productId: product.id, variantId });
    }
  };

  const handleEditVariant = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    setVariantFormOpen(true);
  };

  const handleCreateVariant = () => {
    setSelectedVariant(null);
    setVariantFormOpen(true);
  };

  const handleStockChange = (variantId: number, value: string) => {
    const quantity = parseInt(value);
    if (!isNaN(quantity)) {
      setStockUpdate((prev) => ({ ...prev, [variantId]: quantity }));
    }
  };

  const handleUpdateStock = () => {
    // Stock update feature is not implemented yet
    toast.info('Tính năng cập nhật kho đang được phát triển');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='max-h-[90vh] max-w-5xl overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Quản lý biến thể - {product?.name}</DialogTitle>
          </DialogHeader>

          <div className='space-y-4'>
            <div className='flex justify-end'>
              <Button onClick={handleCreateVariant}>
                <Plus className='mr-2 h-4 w-4' />
                Thêm biến thể
              </Button>
            </div>

            {isLoading ? (
              <div className='py-10 text-center'>Đang tải...</div>
            ) : (
              <div className='rounded-lg border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hình ảnh</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Tên biến thể</TableHead>
                      <TableHead>Thuộc tính</TableHead>
                      <TableHead>Giá</TableHead>
                      <TableHead>Giá so sánh</TableHead>
                      <TableHead>Tồn kho</TableHead>
                      <TableHead className='text-right'>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.data && data.data.length > 0 ? (
                      data.data.map((variant) => (
                        <TableRow key={variant.id}>
                          <TableCell>
                            {variant.images && variant.images.length > 0 ? (
                              <div className='relative h-12 w-12 overflow-hidden rounded'>
                                <Image src={variant.images[0].url} alt={variant.sku} fill className='object-cover' />
                              </div>
                            ) : (
                              <div className='flex h-12 w-12 items-center justify-center rounded bg-gray-200'>
                                <Package className='h-5 w-5 text-gray-400' />
                              </div>
                            )}
                          </TableCell>
                          <TableCell className='font-mono text-sm'>{variant.sku}</TableCell>
                          <TableCell className='font-medium'>{variant.name}</TableCell>
                          <TableCell>
                            {variant.attributes && variant.attributes.length > 0 ? (
                              <div className='flex flex-wrap gap-1'>
                                {variant.attributes.map((attr, idx) => (
                                  <Badge key={idx} variant='outline' className='text-xs'>
                                    {attr.name}: {attr.value}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <span className='text-sm text-gray-400'>Không có</span>
                            )}
                          </TableCell>
                          <TableCell className='font-semibold'>{formatPrice(variant.price)}</TableCell>
                          <TableCell className='text-gray-500'>
                            {variant.comparePrice ? formatPrice(variant.comparePrice) : '-'}
                          </TableCell>
                          <TableCell>
                            <div className='flex items-center gap-2'>
                              <Input
                                type='number'
                                defaultValue={variant.stock}
                                onChange={(e) => handleStockChange(variant.id, e.target.value)}
                                className='w-20'
                              />
                              {stockUpdate[variant.id] !== undefined && (
                                <Button size='sm' onClick={handleUpdateStock} disabled={updateStockMutation.isPending}>
                                  Lưu
                                </Button>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className='text-right'>
                            <div className='flex justify-end gap-2'>
                              <Button size='sm' variant='ghost' onClick={() => handleEditVariant(variant)}>
                                <Edit className='h-4 w-4' />
                              </Button>
                              <Button
                                size='sm'
                                variant='ghost'
                                onClick={() => handleDeleteVariant(variant.id)}
                                className='text-red-600 hover:text-red-700'
                              >
                                <Trash2 className='h-4 w-4' />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className='py-10 text-center'>
                          Chưa có biến thể nào
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {product && (
        <VariantFormDialog
          open={variantFormOpen}
          onOpenChange={setVariantFormOpen}
          product={product}
          variant={selectedVariant}
        />
      )}
    </>
  );
}
