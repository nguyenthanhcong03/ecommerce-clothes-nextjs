'use client';

import { MultiSelect } from '@/components/common/MultiSelect';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { InputCustom } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TextareaCustom } from '@/components/ui/textarea';
import { useCategoriesQuery } from '@/hooks/apis/useCategory';
import { useCreateProduct, useUpdateProduct } from '@/hooks/apis/useProduct';
import { CreateProductData, ProductAdmin, UpdateProductData } from '@/types/productType';
import { Upload, X } from 'lucide-react';
import Image from 'next/image';
import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: ProductAdmin | null;
}

export function ProductFormDialog({ open, onOpenChange, product }: ProductFormDialogProps) {
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const isEditing = !!product;

  const { data: categoriesData } = useCategoriesQuery();
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm<CreateProductData>({
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      categoryIds: [],
      brand: '',
      tags: [],
      isActive: true
    }
  });

  // Transform categories for MultiSelect component
  const categoryOptions = useMemo(() => {
    return (
      categoriesData?.data?.map((category) => ({
        label: category.name,
        value: category.id.toString()
      })) || []
    );
  }, [categoriesData]);

  // Load product data when editing
  useEffect(() => {
    if (product) {
      setValue('name', product.name);
      setValue('description', product.description);
      setValue('categoryIds', product.categoryIds);
      setValue('brand', product.brand);
      setValue('tags', product.tags || []);
      setValue('isActive', product.isActive ?? true);

      // Set selected categories
      // setSelectedCategoryIds(product.categoryIds.map((id) => id.toString()));

      // Set existing images as previews
      if (product.images && product.images.length > 0) {
        setImagePreviews(product.images.map((img) => img.url));
      }
    } else {
      reset();
      setImageFiles([]);
      setImagePreviews([]);
      setSelectedCategoryIds([]);
    }
  }, [product, setValue, reset]);

  const onSubmit = (data: CreateProductData) => {
    if (!isEditing && imageFiles.length === 0) {
      toast.error('Vui lòng chọn ít nhất một hình ảnh');
      return;
    }

    if (selectedCategoryIds.length === 0) {
      toast.error('Vui lòng chọn ít nhất một danh mục');
      return;
    }

    // Convert selected category IDs to numbers
    const categoryIds = selectedCategoryIds.map((id) => parseInt(id, 10));
    const formData = { ...data, categoryIds };

    if (isEditing && product) {
      updateProductMutation.mutate(
        {
          id: product.id,
          data: formData as UpdateProductData,
          images: imageFiles.length > 0 ? imageFiles : undefined
        },
        {
          onSuccess: () => {
            onOpenChange(false);
            reset();
            setImageFiles([]);
            setImagePreviews([]);
            setSelectedCategoryIds([]);
          }
        }
      );
    } else {
      createProductMutation.mutate(
        { data: formData, images: imageFiles },
        {
          onSuccess: () => {
            onOpenChange(false);
            reset();
            setImageFiles([]);
            setImagePreviews([]);
            setSelectedCategoryIds([]);
          }
        }
      );
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Add new files
    setImageFiles((prev) => [...prev, ...files]);

    // Create previews
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

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
    setValue('tags', tags);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] max-w-2xl overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          {/* Product Name */}
          <div className='space-y-2'>
            <Label htmlFor='name'>
              Tên sản phẩm <span className='text-red-500'>*</span>
            </Label>
            <InputCustom
              id='name'
              {...register('name', { required: 'Tên sản phẩm là bắt buộc' })}
              placeholder='Nhập tên sản phẩm'
            />
            {errors.name && <p className='text-sm text-red-500'>{errors.name.message}</p>}
          </div>

          {/* Slug */}
          <div className='space-y-2'>
            <Label htmlFor='slug'>
              Đường dẫn sản phẩm <span className='text-red-500'>*</span>
            </Label>
            <InputCustom
              id='slug'
              {...register('slug', { required: 'Đường dẫn sản phẩm là bắt buộc' })}
              placeholder='Nhập đường dẫn sản phẩm'
            />
            {errors.slug && <p className='text-sm text-red-500'>{errors.slug.message}</p>}
          </div>

          {/* Description */}
          <div className='space-y-2'>
            <Label htmlFor='description'>
              Mô tả <span className='text-red-500'>*</span>
            </Label>
            <TextareaCustom
              id='description'
              {...register('description', { required: 'Mô tả là bắt buộc' })}
              placeholder='Nhập mô tả sản phẩm'
              rows={4}
            />
            {errors.description && <p className='text-sm text-red-500'>{errors.description.message}</p>}
          </div>

          {/* Category and Brand */}
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='categoryId'>
                Danh mục <span className='text-red-500'>*</span>
              </Label>
              <MultiSelect
                options={categoryOptions}
                value={selectedCategoryIds}
                onChange={setSelectedCategoryIds}
                placeholder='Chọn danh mục'
              />
              {selectedCategoryIds.length === 0 && errors.categoryIds && (
                <p className='text-sm text-red-500'>Vui lòng chọn ít nhất một danh mục</p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='brand'>
                Thương hiệu <span className='text-red-500'>*</span>
              </Label>
              <InputCustom
                id='brand'
                {...register('brand', { required: 'Thương hiệu là bắt buộc' })}
                placeholder='Nhập thương hiệu'
              />
              {errors.brand && <p className='text-sm text-red-500'>{errors.brand.message}</p>}
            </div>
          </div>

          {/* Tags */}
          <div className='space-y-2'>
            <Label htmlFor='tags'>Tags (phân tách bằng dấu phẩy)</Label>
            <InputCustom
              id='tags'
              defaultValue={product?.tags?.join(', ')}
              onChange={handleTagsChange}
              placeholder='Ví dụ: áo, thời trang, mùa hè'
            />
          </div>

          {/* Featured */}
          <div className='flex items-center gap-2'>
            <input type='checkbox' id='featured' {...register('isActive')} className='h-4 w-4' />
            <Label htmlFor='featured'>Trạng thái sản phẩm</Label>
          </div>

          {/* Images */}
          <div className='space-y-2'>
            <Label>Hình ảnh {!isEditing && <span className='text-red-500'>*</span>}</Label>
            <div className='rounded-lg border-2 border-dashed p-4'>
              <input
                type='file'
                id='images'
                multiple
                accept='image/*'
                onChange={handleImageChange}
                className='hidden'
              />
              <label htmlFor='images' className='flex cursor-pointer flex-col items-center justify-center'>
                <Upload className='mb-2 h-8 w-8 text-gray-400' />
                <span className='text-sm text-gray-500'>Click để tải ảnh lên hoặc kéo thả</span>
              </label>
            </div>

            {/* Image Previews */}
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
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={createProductMutation.isPending || updateProductMutation.isPending}
            >
              Hủy
            </Button>
            <Button type='submit' disabled={createProductMutation.isPending || updateProductMutation.isPending}>
              {createProductMutation.isPending || updateProductMutation.isPending
                ? 'Đang xử lý...'
                : isEditing
                  ? 'Cập nhật'
                  : 'Tạo mới'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
