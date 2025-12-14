export interface Variant {
  id: number;
  sku: string;
  size: string;
  color: string;
  price: number;
  originalPrice?: number;
  stock: number;
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
