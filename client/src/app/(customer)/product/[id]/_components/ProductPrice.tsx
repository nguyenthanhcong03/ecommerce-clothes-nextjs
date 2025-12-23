'use client';
import { Product } from '@/types/productType';
import { getSelectedPrice } from '@/features/product/utils';
import { formatCurrency } from '@/lib/utils';
import { useProductVariantStore } from '@/store/productVariantStore';
import { useMemo } from 'react';

function ProductPrice({ product }: { product: Product }) {
  const selectedVariant = useProductVariantStore((state) => state.selectedVariant);
  const isProductOutOfStock = useProductVariantStore((state) => state.isProductOutOfStock);

  const displayPrice = useMemo(
    () => getSelectedPrice(product.variants, selectedVariant),
    [product.variants, selectedVariant]
  );

  return (
    <div className='my-2 flex items-center gap-2 bg-[#F9F9F9] p-2 sm:my-3 sm:gap-4 sm:p-4'>
      <span className='text-xl font-medium sm:text-3xl'>{formatCurrency(displayPrice?.price) || 0}</span>
      {displayPrice && displayPrice.originalPrice && (
        <span className='ml-1 text-sm text-gray-400 line-through sm:ml-2 sm:text-lg'>
          {formatCurrency(displayPrice.originalPrice)}
        </span>
      )}
      {isProductOutOfStock && (
        <span className='ml-2 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-600 sm:text-sm'>
          Hết hàng
        </span>
      )}
    </div>
  );
}

export default ProductPrice;
