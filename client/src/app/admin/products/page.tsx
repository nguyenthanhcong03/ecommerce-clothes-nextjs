'use client';

import { useState } from 'react';
import { ProductTable } from '@/app/admin/products/_components/ProductTable';
import { ProductFormDialog } from '@/app/admin/products/_components/ProductFormDialog';
import { VariantManagementDialog } from '@/app/admin/products/_components/VariantManagementDialog';
import { Product } from '@/types/productType';

export default function ProductPage() {
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [variantDialogOpen, setVariantDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setProductFormOpen(true);
  };

  const handleViewVariants = (product: Product) => {
    setSelectedProduct(product);
    setVariantDialogOpen(true);
  };

  const handleCreateProduct = () => {
    setSelectedProduct(null);
    setProductFormOpen(true);
  };

  return (
    <div className='container mx-auto space-y-6 py-8'>
      <div className='space-y-2'>
        <h1 className='text-3xl font-bold tracking-tight'>Quản lý sản phẩm</h1>
        <p className='text-gray-500'>Quản lý danh sách sản phẩm và các biến thể của chúng</p>
      </div>

      <ProductTable
        onEdit={handleEditProduct}
        onViewVariants={handleViewVariants}
        onCreateProduct={handleCreateProduct}
      />

      <ProductFormDialog open={productFormOpen} onOpenChange={setProductFormOpen} product={selectedProduct} />

      <VariantManagementDialog open={variantDialogOpen} onOpenChange={setVariantDialogOpen} product={selectedProduct} />
    </div>
  );
}
