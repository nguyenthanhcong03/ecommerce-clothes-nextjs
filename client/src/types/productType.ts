// Enums
export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

// Product Image
export interface ProductImage {
  id: number;
  productId: number;
  variantId?: number | null;
  url: string;
  publicId: string;
  isMain: boolean;
}

// Attribute & AttributeValue
export interface Attribute {
  id: number;
  code: string;
  name: string;
}

export interface AttributeValue {
  id: number;
  attributeId: number;
  value: string;
  attribute: Attribute;
}

export interface VariantAttributeValue {
  variantId: number;
  attributeValueId: number;
  attributeValue: AttributeValue;
}

// Product Variant
export interface ProductVariant {
  id: number;
  productId: number;
  sku: string;
  price: number;
  stock: number;
  image?: string | null;
  attributes: VariantAttributeValue[];
  images: ProductImage[];
  createdAt: string;
  updatedAt: string;
}

// Product
export interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  basePrice?: number | null;
  status: ProductStatus;
  categoryId: number;
  category: {
    id: number;
    name: string;
    slug: string;
  };
  variants: ProductVariant[];
  images: ProductImage[];
  _count?: {
    variants: number;
    images: number;
  };
  createdAt: string;
  updatedAt: string;
}

// Create/Update Product
export interface CreateProductInput {
  name: string;
  slug: string;
  description?: string;
  basePrice?: number;
  status?: ProductStatus;
  categoryId: number;
  variants: {
    sku: string;
    price: number;
    stock: number;
    image?: string;
    attributes: {
      attributeId: number;
      valueId: number;
    }[];
  }[];
}

export interface UpdateProductInput {
  name?: string;
  slug?: string;
  description?: string;
  basePrice?: number | null;
  status?: ProductStatus;
  categoryId?: number;
}

// Create/Update Variant
export interface CreateVariantInput {
  sku: string;
  price: number;
  stock: number;
  image?: string;
  attributes: {
    attributeId: number;
    valueId: number;
  }[];
}

export interface UpdateVariantInput {
  sku?: string;
  price?: number;
  stock?: number;
  image?: string;
  attributes?: {
    attributeId: number;
    valueId: number;
  }[];
}

// Query Params
export interface GetProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: number;
  status?: ProductStatus;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'createdAt' | 'name' | 'price';
  sortOrder?: 'asc' | 'desc';
}

// Cart Item (for frontend cart management)
export interface CartItem {
  id: number;
  cartId: number;
  variantId: number;
  quantity: number;
  variant: ProductVariant;
}

export type { GetProductsParams as GetProductsParamsType };
