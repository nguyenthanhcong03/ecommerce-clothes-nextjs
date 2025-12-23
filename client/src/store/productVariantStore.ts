import { Variant } from '@/types/productType';
import { create } from 'zustand';

interface ProductVariantState {
  selectedSize: string;
  selectedColor: string;
  quantity: number;
  selectedVariant: Variant | null;
  isProductOutOfStock: boolean;

  // Actions
  setSelectedSize: (size: string) => void;
  setSelectedColor: (color: string) => void;
  setQuantity: (quantity: number) => void;
  setSelectedVariant: (variant: Variant | null) => void;
  setIsProductOutOfStock: (outOfStock: boolean) => void;

  reset: () => void;
}

const initialState = {
  selectedSize: '',
  selectedColor: '',
  quantity: 1,
  selectedVariant: null,
  isProductOutOfStock: false
};

export const useProductVariantStore = create<ProductVariantState>((set) => ({
  ...initialState,

  setSelectedSize: (size: string) => set({ selectedSize: size }),
  setSelectedColor: (color: string) => set({ selectedColor: color }),
  setQuantity: (quantity: number) => set({ quantity }),
  setSelectedVariant: (variant: Variant | null) => set({ selectedVariant: variant }),
  setIsProductOutOfStock: (outOfStock: boolean) => set({ isProductOutOfStock: outOfStock }),
  reset: () => set(initialState)
}));
