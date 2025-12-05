export type ApiError = {
  success: boolean;
  message: string;
  statusCode: number;
  errors: Record<string, string[]>;
  stack?: string;
};

export type ApiResponse<T> = {
  success: boolean; // Trạng thái thành công hay thất bại
  message?: string; // Thông điệp mô tả kết quả
  data?: T; // Dữ liệu trả về (nếu có)
  errors?: any; // Chi tiết lỗi (nếu có)
  statusCode?: number; // Mã HTTP status
};

export type PaginationResponse<T> = {
  total: number; // Tổng số mục
  page: number; // Trang hiện tại
  limit: number; // Số mục trên mỗi trang
  totalPages: number; // Tổng số trang
  data: T[]; // Mảng dữ liệu của trang hiện tại
};

export type User = {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'customer' | 'admin';
  avatar?: string;
  phone?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterData = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

export type AuthResponse = {
  user: User;
  accessToken: string;
  refreshToken: string;
};

export type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
};

export type ForgotPasswordData = {
  email: string;
};

export type ResetPasswordData = {
  token: string;
  password: string;
  confirmPassword: string;
};
