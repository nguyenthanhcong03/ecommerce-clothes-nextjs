import ProductCard from '@/components/common/ProductCard';
import { Product } from '@/types/productType';
import React from 'react';

type ProductsListProps = {
  products: Product[];
};

const ProductsList = ({ products }: ProductsListProps) => {
  return (
    <div className='mt-6 grid grid-cols-1 gap-6 md:grid-cols-4'>
      {products.map((product) => (
        <ProductCard key={product._id} item={product} />
      ))}
    </div>
  );
};

export default ProductsList;
