export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    REGISTER: '/api/v1/auth/register',
    LOGOUT: '/api/v1/auth/logout',
    ME: '/api/v1/auth/me',
    REFRESH_TOKEN: '/api/v1/auth/refresh-token'
  },
  CATEGORIES: {
    LIST: '/api/v1/categories',
    CREATE: '/api/v1/categories',
    DETAIL: (id: number) => `/api/v1/categories/${id}`,
    UPDATE: (id: number) => `/api/v1/categories/${id}`,
    DELETE: (id: number) => `/api/v1/categories/${id}`
  },
  PRODUCTS: {
    LIST: '/api/v1/products',
    CREATE: '/api/v1/products',
    UPDATE: (id: number) => `/api/v1/products/${id}`,
    DELETE: (id: number) => `/api/v1/products/${id}`
  }
};

export const ROUTE = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',

  ACCOUNT: {
    PROFILE: '/account/profile',
    ORDERS: '/account/orders',
    ORDER_DETAIL: (orderId: number) => `/account/orders/${orderId}`,
    CHANGE_PASSWORD: '/account/change-password',
    ADDRESSES: '/account/addresses',
    WISHLIST: '/account/wishlist',
    CART: '/account/cart'
  },

  ADMIN: {
    OVERVIEW: '/admin/overview',
    CATEGORY_MANAGEMENT: '/admin/categories',
    PRODUCT_MANAGEMENT: {
      ROOT: '/admin/products',
      DETAIL: (id: string | number) => `/admin/products/${id}`,
      CREATE: '/admin/products/create',
      EDIT: (id: string | number) => `/admin/products/${id}/edit`
    }
  }
} as const;
