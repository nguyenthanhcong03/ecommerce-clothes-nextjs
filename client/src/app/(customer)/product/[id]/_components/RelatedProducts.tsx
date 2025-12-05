'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Star, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/types/product';
import ProductCard from '../../../../../components/common/ProductCard';

interface RelatedProductsProps {
  products: Product[];
}

export default function RelatedProducts({ products }: RelatedProductsProps) {
  if (!products || products.length === 0) {
    return null;
  }

  const getProductPrice = (product: Product) => {
    if (!product.variants || product.variants.length === 0) return { min: 0, max: 0 };

    const prices = product.variants.map((v) => v.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
  };

  return (
    <div className='grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4'>
      {products.slice(0, 8).map((product) => {
        return (
          <div key={product._id} className='group'>
            <ProductCard item={product} />
          </div>
        );
      })}
    </div>
  );
}
