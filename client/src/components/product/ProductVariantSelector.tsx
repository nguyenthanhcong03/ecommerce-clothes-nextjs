'use client';

import { Badge } from '@/components/ui/badge';
import { Button, ButtonCustom } from '@/components/ui/button';
import { Product } from '@/types/productType';
import useProductVariants from '@/hooks/useVariant';
import { formatCurrency } from '@/lib/utils';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import { useState } from 'react';

interface ProductVariantSelectorProps {
  product: Product;
}

export default function ProductVariantSelector({ product }: ProductVariantSelectorProps) {
  const {
    allColors,
    allSizes,
    availableColorsForSize,
    availableSizesForColor,
    handleColorChange,
    handleSizeChange,
    selectedVariant,
    selectedSize,
    selectedColor,
    setQuantity,
    quantity
  } = useProductVariants(product.variants);

  const [isLoading, setIsLoading] = useState(false);

  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(newQuantity);
  };

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      alert('Vui lòng chọn kích thước và màu sắc');
      return;
    }

    if (selectedVariant.stock < quantity) {
      alert('Số lượng không đủ trong kho');
      return;
    }

    try {
      setIsLoading(true);

      // Mock add to cart - replace with actual implementation
      console.log('Adding to cart:', {
        productId: product._id,
        variantId: selectedVariant._id,
        quantity,
        snapshot: {
          name: product.name,
          price: selectedVariant.price,
          originalPrice: selectedVariant.originalPrice,
          color: selectedVariant.color,
          size: selectedVariant.size,
          image: product.images[0] || '',
          stock: selectedVariant.stock
        }
      });

      alert('Đã thêm sản phẩm vào giỏ hàng!');
      setQuantity(1);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Có lỗi xảy ra khi thêm vào giỏ hàng');
    } finally {
      setIsLoading(false);
    }
  };

  const canAddToCart = selectedVariant && selectedVariant.stock > 0;
  const maxQuantity = selectedVariant?.stock || 0;

  return (
    <div className='space-y-4'>
      {/* Size Selection */}
      <div>
        <label className='mb-2 block text-sm font-medium text-gray-900'>
          Kích thước: {selectedSize && <span className='text-blue-600'>({selectedSize})</span>}
        </label>
        <div className='flex flex-wrap gap-2'>
          {allSizes.map((size) => {
            const isAvailable = !selectedColor || availableSizesForColor.includes(size);

            return (
              <div className='group relative' key={size}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isAvailable) {
                      handleSizeChange(size);
                    }
                  }}
                  disabled={!isAvailable}
                  className={`relative flex h-8 w-8 items-center justify-center rounded-xs border transition ${
                    selectedSize === size
                      ? 'border-[#333] bg-[#333] font-medium text-white'
                      : isAvailable
                        ? 'border-gray-300 bg-white text-gray-700 hover:border-[#333] hover:bg-gray-50'
                        : 'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400 opacity-50'
                  }`}
                >
                  <span className='text-sm'>{size}</span>
                </button>
                {selectedSize === size && (
                  <div className='absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#333] text-xs text-white'>
                    ✓
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Color Selection */}
      <div>
        <label className='mb-2 block text-sm font-medium text-gray-900'>
          Màu sắc: {selectedColor && <span className='text-blue-600'>({selectedColor})</span>}
        </label>
        <div className='flex flex-wrap gap-2'>
          {allColors.map((color) => {
            const isAvailable = !selectedSize || availableColorsForSize.includes(color);

            return (
              <div key={color} className='group relative'>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isAvailable) {
                      handleColorChange(color);
                    }
                  }}
                  disabled={!isAvailable}
                  className={`relative flex items-center justify-center rounded-xs border px-2 py-1 text-sm transition ${
                    selectedColor === color
                      ? 'border-[#333] bg-[#333] font-medium text-white'
                      : isAvailable
                        ? 'border-gray-300 bg-white text-gray-700 hover:border-[#333] hover:bg-gray-50'
                        : 'cursor-not-allowed border-gray-200 bg-gray-50 opacity-50'
                  }`}
                >
                  <span className='text-sm'>{color}</span>
                </button>

                {selectedColor === color && (
                  <div className='absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#333] text-xs text-white'>
                    ✓
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Variant Info */}
      {selectedVariant && (
        <div className='rounded-lg bg-gray-50 p-4'>
          <div className='mb-2 flex items-center justify-between'>
            <span className='text-sm text-gray-600'>Biến thể đã chọn:</span>
            <Badge variant={selectedVariant.stock > 0 ? 'default' : 'destructive'}>
              {selectedVariant.stock > 0 ? `Còn ${selectedVariant.stock} sản phẩm` : 'Hết hàng'}
            </Badge>
          </div>
          <div className='space-y-1 text-sm'>
            <div className='flex justify-between'>
              <span>SKU:</span>
              <span className='font-medium'>{selectedVariant.sku}</span>
            </div>
            <div className='flex justify-between'>
              <span>Giá:</span>
              <span className='font-bold text-red-600'>
                {formatCurrency(selectedVariant.price)}
                {selectedVariant.originalPrice && selectedVariant.originalPrice > selectedVariant.price && (
                  <span className='ml-2 text-xs text-gray-400 line-through'>
                    {formatCurrency(selectedVariant.originalPrice)}
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Quantity Selector */}
      <div className='flex items-center gap-4'>
        <span className='text-sm font-medium text-gray-900'>Số lượng:</span>
        <div className='flex items-center rounded-lg border'>
          <Button
            variant='ghost'
            size='sm'
            className='h-8 w-8 p-0'
            onClick={() => handleQuantityChange(quantity - 1)}
            disabled={quantity <= 1}
          >
            <Minus className='h-3 w-3' />
          </Button>

          <span className='w-12 text-center text-sm font-medium'>{quantity}</span>

          <Button
            variant='ghost'
            size='sm'
            className='h-8 w-8 p-0'
            onClick={() => handleQuantityChange(quantity + 1)}
            disabled={!selectedColor || !selectedSize || quantity >= maxQuantity}
          >
            <Plus className='h-3 w-3' />
          </Button>
        </div>

        {selectedVariant && <span className='text-xs text-gray-500'>(Tối đa: {selectedVariant.stock})</span>}
      </div>

      <div className='space-y-4'>
        {/* Add to Cart Button */}
        <ButtonCustom className='w-full' size='lg' onClick={handleAddToCart} disabled={!canAddToCart || isLoading}>
          <ShoppingCart className='mr-2 h-4 w-4' />
          {isLoading
            ? 'Đang thêm...'
            : !selectedVariant
              ? 'Chọn kích thước và màu sắc'
              : selectedVariant.stock === 0
                ? 'Hết hàng'
                : 'Thêm vào giỏ hàng'}
        </ButtonCustom>

        {/* Buy Now Button */}
        <ButtonCustom variant='outline' className='w-full' size='lg' disabled={!canAddToCart}>
          Mua ngay
        </ButtonCustom>
      </div>
    </div>
  );
}
