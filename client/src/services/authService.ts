import { API_ENDPOINTS } from '@/constants/api';
import { http } from '@/lib/http';
import { LoginInput, RegisterInput, User, ForgotPasswordData, ResetPasswordData } from '@/types/authType';

export const authService = {
  // Gọi đến Route handler nextjs để đăng nhập
  login: async (data: LoginInput) => {
    const response = await http.post('/api/auth/login', data, { baseUrl: '' });
    return response.data;
  },

  register: async (data: RegisterInput) => {
    const response = await http.post<User>(`${API_ENDPOINTS.AUTH.REGISTER}`, data);
    return response.data;
  },

  // Gọi đến Route handler nextjs để đăng nhập
  logout: async () => {
    console.log('chạy vào đây');
    await http.post('/api/auth/logout', null, { baseUrl: '' });
  },

  getProfile: async () => {
    const response = await http.get<User>('api/auth/profile');
    return response.data;
  },

  updateProfile: async (userData: Partial<User>) => {
    const response = await http.put<User>('api/auth/profile', userData);
    return response.data;
  },

  forgotPassword: async (data: ForgotPasswordData): Promise<void> => {
    await http.post('api/auth/forgot-password', data);
  },

  resetPassword: async (data: ResetPasswordData): Promise<void> => {
    await http.post('api/auth/reset-password', data);
  },

  // Gọi đến Route handler nextjs để đăng nhập
  refreshToken: async () => {
    const response = await http.post('/api/auth/login', null, { baseUrl: '' });
    return response.data;
  },

  checkAuthStatus: async () => {
    const response = await http.get<User>(`${API_ENDPOINTS.AUTH.ME}`);
    return response.data;
  }
};
