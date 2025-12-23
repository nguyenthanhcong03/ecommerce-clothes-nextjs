export type ValidationError = {
  field: string;
  message: string;
};

// export type ApiResponse<T> = {
//   success: boolean; // Trạng thái thành công hay thất bại
//   message: string; // Thông điệp mô tả kết quả
//   data: T | null; // Dữ liệu trả về (nếu có)
//   statusCode: number; // Mã trạng thái HTTP
//   errors?: ValidationError[]; // Mảng lỗi xác thực (nếu có)
//   stack?: string; // Ngăn xếp lỗi (chỉ dành cho môi trường phát triển)
// };

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
  name: string;
  role: 'customer' | 'admin';
  avatar?: string;
  phone?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  name: string;
  email: string;
  phone: string;
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
