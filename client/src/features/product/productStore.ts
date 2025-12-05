import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  subcategory?: string;
  brand?: string;
  sizes: string[];
  colors: string[];
  stock: number;
  rating: number;
  reviewCount: number;
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilters {
  category?: string;
  subcategory?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  sizes?: string[];
  colors?: string[];
  rating?: number;
  inStock?: boolean;
  search?: string;
}

export interface ProductState {
  products: Product[];
  currentProduct: Product | null;
  filters: ProductFilters;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ProductStore extends ProductState {
  // Actions
  setProducts: (products: Product[]) => void;
  setCurrentProduct: (product: Product | null) => void;
  setFilters: (filters: Partial<ProductFilters>) => void;
  clearFilters: () => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setPagination: (pagination: Partial<ProductState["pagination"]>) => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  removeProduct: (id: string) => void;
}

export const useProductStore = create<ProductStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      products: [],
      currentProduct: null,
      filters: {},
      isLoading: false,
      error: null,
      pagination: {
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 0,
      },

      // Actions
      setProducts: (products) => set({ products }),

      setCurrentProduct: (product) => set({ currentProduct: product }),

      setFilters: (filters) =>
        set((state) => ({
          filters: { ...state.filters, ...filters },
          pagination: { ...state.pagination, page: 1 }, // Reset to first page when filtering
        })),

      clearFilters: () =>
        set({
          filters: {},
          pagination: { ...get().pagination, page: 1 },
        }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      setPagination: (pagination) =>
        set((state) => ({
          pagination: { ...state.pagination, ...pagination },
        })),

      addProduct: (product) =>
        set((state) => ({
          products: [...state.products, product],
        })),

      updateProduct: (id, updates) =>
        set((state) => ({
          products: state.products.map((product) => (product.id === id ? { ...product, ...updates } : product)),
          currentProduct:
            state.currentProduct?.id === id ? { ...state.currentProduct, ...updates } : state.currentProduct,
        })),

      removeProduct: (id) =>
        set((state) => ({
          products: state.products.filter((product) => product.id !== id),
          currentProduct: state.currentProduct?.id === id ? null : state.currentProduct,
        })),
    }),
    {
      name: "product-store",
    }
  )
);
