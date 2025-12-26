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
