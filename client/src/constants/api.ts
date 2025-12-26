export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me',
    REFRESH_TOKEN: '/api/auth/refresh-token'
  },
  CATEGORIES: {
    LIST: '/api/categories',
    CREATE: '/api/categories',
    DETAIL: (id: number) => `/api/categories/${id}`,
    BY_SLUG: (slug: string) => `/api/categories/slug/${slug}`,
    UPDATE: (id: number) => `/api/categories/${id}`,
    DELETE: (id: number) => `/api/categories/${id}`
  },
  PRODUCTS: {
    LIST: '/api/products',
    CREATE: '/api/products',
    DETAIL: (id: number) => `/api/products/${id}`,
    BY_SLUG: (slug: string) => `/api/products/slug/${slug}`,
    UPDATE: (id: number) => `/api/products/${id}`,
    DELETE: (id: number) => `/api/products/${id}`,
    // Variant endpoints
    VARIANTS: {
      CREATE: (productId: number) => `/api/products/${productId}/variants`,
      UPDATE: (productId: number, variantId: number) => `/api/products/${productId}/variants/${variantId}`,
      DELETE: (productId: number, variantId: number) => `/api/products/${productId}/variants/${variantId}`
    }
  }
};
