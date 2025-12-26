export type ValidationError = {
  field: string;
  message: string;
};

export type ApiResponse<T> = { success: true; message: string; data: T | null };

export type ApiError = {
  success: false;
  message: string;
  statusCode: number;
  errors?: ValidationError[];
  stack?: string;
};

export type PaginationResponse<T> = {
  total: number; // Tổng số mục
  page: number; // Trang hiện tại
  limit: number; // Số mục trên mỗi trang
  totalPages: number; // Tổng số trang
  data: T[]; // Mảng dữ liệu của trang hiện tại
};

export type User = {
  id: number;
  email: string;
  fullName: string;
  role: 'CUSTOMER' | 'ADMIN';
  avatar?: string;
  avatarPublicId?: string;
  createdAt: string;
  updatedAt: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  fullName: string;
  email: string;
  password: string;
};

export type LoginResponse = {
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
