export interface Variant {
  _id: string;
  sku: string;
  size: string;
  color: string;
  price: number;
  originalPrice?: number;
  stock: number;
}

export interface Product {
  _id: string;
  name: string;
  description?: string;
  categoryId: {
    _id: string;
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
  _id: string;
  userId: {
    _id: string;
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
