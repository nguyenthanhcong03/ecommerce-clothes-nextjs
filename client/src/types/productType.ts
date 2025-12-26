export interface Variant {
  id: number;
  sku: string;
  name: string;
  price: number;
  comparePrice?: number;
  stock: number;
  attributes?: VariantAttribute[];
  // Backward compatibility
  size?: string;
  color?: string;
  originalPrice?: number;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  categoryId: {
    id: number;
    name: string;
  };
  brand: string;
  variants: Variant[];
  images: {
    url: string;
    publicId: string;
  }[];
  tags: string[];
  averageRating: number;
  totalReviews: number;
  featured: boolean;
  salesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: number;
  userId: {
    id: number;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  productId: string;
  rating: number;
  comment: string;
  likes: number;
  reply?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  productId: string;
  variantId: string;
  quantity: number;
  snapshot: {
    name: string;
    price: number;
    originalPrice?: number;
    color: string;
    size: string;
    image: string;
    stock: number;
  };
}

export interface ProductImage {
  url: string;
  publicId: string;
}

export interface VariantAttribute {
  name: string;
  value: string;
}

export interface ProductVariant {
  id: number;
  sku: string;
  name: string;
  price: number;
  comparePrice?: number;
  stock: number;
  attributes?: VariantAttribute[];
  images?: ProductImage[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductAdmin {
  id: number;
  name: string;
  slug: string;
  description: string;
  categoryIds: number[];
  category?: {
    id: number;
    name: string;
  };
  brand: string;
  variants: ProductVariant[];
  images: ProductImage[];
  tags: string[];
  averageRating: number;
  totalReviews: number;
  isActive: boolean;
  salesCount: number;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductData {
  name: string;
  slug: string;
  description: string;
  categoryIds: number[];
  brand: string;
  tags?: string[];
  isActive?: boolean;
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  categoryId?: number;
  brand?: string;
  tags?: string[];
  featured?: boolean;
}

export interface CreateVariantData {
  sku: string;
  name: string;
  price: number;
  comparePrice?: number;
  stock: number;
  attributes?: VariantAttribute[];
}

export interface UpdateVariantData {
  sku?: string;
  name?: string;
  price?: number;
  comparePrice?: number;
  stock?: number;
  attributes?: VariantAttribute[];
}

export interface GetProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: number;
  brand?: string;
  featured?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export type { GetProductsParams as GetProductsParamsType };
