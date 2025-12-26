'use client';

import { Button, ButtonCustom } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input, InputCustom } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateVariant, useUpdateVariant } from '@/hooks/apis/useProduct';
import {
  CreateVariantData,
  ProductAdmin,
  ProductVariant,
  UpdateVariantData,
  VariantAttribute
} from '@/types/productType';
import { Plus, Trash2, Upload, X } from 'lucide-react';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

interface VariantFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductAdmin;
  variant?: ProductVariant | null;
}

export function VariantFormDialog({ open, onOpenChange, product, variant }: VariantFormDialogProps) {
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [attributes, setAttributes] = useState<VariantAttribute[]>([]);
  const isEditing = !!variant;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm<CreateVariantData>({
    defaultValues: {
      sku: '',
      name: '',
      price: 0,
      comparePrice: 0,
      stock: 0,
      attributes: []
    }
  });

  useEffect(() => {
    if (variant) {
      setValue('sku', variant.sku);
      setValue('name', variant.name);
      setValue('price', variant.price);
      setValue('comparePrice', variant.comparePrice || 0);
      setValue('stock', variant.stock);

      if (variant.attributes && variant.attributes.length > 0) {
        setAttributes(variant.attributes);
      }

      if (variant.images && variant.images.length > 0) {
        setImagePreviews(variant.images.map((img) => img.url));
      }
    } else {
      reset();
      setImageFiles([]);
      setImagePreviews([]);
      setAttributes([]);
    }
  }, [variant, setValue, reset]);

  const createVariantMutation = useCreateVariant();
  const updateVariantMutation = useUpdateVariant();
  const addAttribute = () => {
    setAttributes([...attributes, { name: '', value: '' }]);
  };

  const removeAttribute = (index: number) => {
    setAttributes(attributes.filter((_, i) => i !== index));
  };

  const updateAttribute = (index: number, field: 'name' | 'value', value: string) => {
    const newAttributes = [...attributes];
    newAttributes[index][field] = value;
    setAttributes(newAttributes);
  };

  const onSubmit = (data: CreateVariantData) => {
    // Validate attributes
    const validAttributes = attributes.filter((attr) => attr.name.trim() && attr.value.trim());

    const submitData = {
      ...data,
      attributes: validAttributes.length > 0 ? validAttributes : undefined
    };

    if (isEditing && variant) {
      updateVariantMutation.mutate({
        productId: product.id,
        variantId: variant.id,
        data: submitData as UpdateVariantData,
        images: imageFiles.length > 0 ? imageFiles : undefined
      });
    } else {
      createVariantMutation.mutate(
        {
          productId: product.id,
          data: submitData,
          images: imageFiles.length > 0 ? imageFiles : undefined
        },
        {
          onSuccess: () => {
            onOpenChange(false);
            reset();
            setImageFiles([]);
            setImagePreviews([]);
            setAttributes([]);
          }
        }
      );
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setImageFiles((prev) => [...prev, ...files]);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Chỉnh sửa biến thể' : 'Thêm biến thể mới'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          {/* SKU and Name */}
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='sku'>
                SKU <span className='text-red-500'>*</span>
              </Label>
              <InputCustom
                id='sku'
                {...register('sku', { required: 'SKU là bắt buộc' })}
                placeholder='Ví dụ: PROD-001-RED-M'
              />
              {errors.sku && <p className='text-sm text-red-500'>{errors.sku.message}</p>}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='name'>
                Tên biến thể <span className='text-red-500'>*</span>
              </Label>
              <InputCustom
                id='name'
                {...register('name', { required: 'Tên biến thể là bắt buộc' })}
                placeholder='Ví dụ: Chất liệu, Màu sắc, Kích thước...'
              />
              {errors.name && <p className='text-sm text-red-500'>{errors.name.message}</p>}
            </div>
          </div>

          {/* Attributes */}
          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <Label>Thuộc tính biến thể</Label>
              <ButtonCustom type='button' variant='outline' size='sm' onClick={addAttribute}>
                <Plus className='mr-2 h-4 w-4' />
                Thêm thuộc tính
              </ButtonCustom>
            </div>

            {attributes.length > 0 && (
              <div className='space-y-2'>
                {attributes.map((attr, index) => (
                  <div key={index} className='flex gap-2'>
                    <InputCustom
                      placeholder='Tên (Ví dụ: Màu sắc, Kích thước, Chất liệu)'
                      value={attr.name}
                      onChange={(e) => updateAttribute(index, 'name', e.target.value)}
                      className='flex-1'
                    />
                    <InputCustom
                      placeholder='Giá trị (Ví dụ: Đỏ, M, Cotton)'
                      value={attr.value}
                      onChange={(e) => updateAttribute(index, 'value', e.target.value)}
                      className='flex-1'
                    />
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      onClick={() => removeAttribute(index)}
                      className='text-red-600 hover:text-red-700'
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {attributes.length === 0 && (
              <p className='text-sm text-gray-500'>
                Chưa có thuộc tính nào. Click &quot;Thêm thuộc tính&quot; để thêm các thuộc tính như màu sắc, kích
                thước, chất liệu, v.v.
              </p>
            )}
          </div>

          {/* Price and Compare Price */}
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='price'>
                Giá bán <span className='text-red-500'>*</span>
              </Label>
              <InputCustom
                id='price'
                type='number'
                {...register('price', {
                  required: 'Giá bán là bắt buộc',
                  min: { value: 0, message: 'Giá phải lớn hơn 0' }
                })}
                placeholder='Nhập giá bán'
              />
              {errors.price && <p className='text-sm text-red-500'>{errors.price.message}</p>}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='comparePrice'>Giá so sánh (giá gốc)</Label>
              <InputCustom
                id='comparePrice'
                type='number'
                {...register('comparePrice')}
                placeholder='Nhập giá gốc (tùy chọn)'
              />
            </div>
          </div>

          {/* Stock */}
          <div className='space-y-2'>
            <Label htmlFor='stock'>
              Số lượng tồn kho <span className='text-red-500'>*</span>
            </Label>
            <InputCustom
              id='stock'
              type='number'
              {...register('stock', {
                required: 'Số lượng tồn kho là bắt buộc',
                min: { value: 0, message: 'Số lượng không được âm' }
              })}
              placeholder='Nhập số lượng'
            />
            {errors.stock && <p className='text-sm text-red-500'>{errors.stock.message}</p>}
          </div>

          {/* Images */}
          <div className='space-y-2'>
            <Label>Hình ảnh (tùy chọn)</Label>
            <div className='rounded-lg border-2 border-dashed p-4'>
              <input
                type='file'
                id='variant-images'
                multiple
                accept='image/*'
                onChange={handleImageChange}
                className='hidden'
              />
              <label htmlFor='variant-images' className='flex cursor-pointer flex-col items-center justify-center'>
                <Upload className='mb-2 h-8 w-8 text-gray-400' />
                <span className='text-sm text-gray-500'>Click để tải ảnh lên</span>
              </label>
            </div>

            {imagePreviews.length > 0 && (
              <div className='mt-4 grid grid-cols-4 gap-4'>
                {imagePreviews.map((preview, index) => (
                  <div key={index} className='relative aspect-square'>
                    <Image src={preview} alt={`Preview ${index + 1}`} fill className='rounded object-cover' />
                    <button
                      type='button'
                      onClick={() => removeImage(index)}
                      className='absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600'
                    >
                      <X className='h-4 w-4' />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <ButtonCustom
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={createVariantMutation.isPending || updateVariantMutation.isPending}
            >
              Hủy
            </ButtonCustom>
            <ButtonCustom type='submit' disabled={createVariantMutation.isPending || updateVariantMutation.isPending}>
              {createVariantMutation.isPending || updateVariantMutation.isPending
                ? 'Đang xử lý...'
                : isEditing
                  ? 'Cập nhật'
                  : 'Tạo mới'}
            </ButtonCustom>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
