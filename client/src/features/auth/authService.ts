import { http } from '@/lib/http';
import { LoginInput, RegisterInput, User, ForgotPasswordData, ResetPasswordData } from '@/features/auth/authType';
import { API_ENDPOINTS } from '@/lib/config';

export const authService = {
  login: async (data: LoginInput) => {
    try {
      const response = await http.post<{
        user: User;
        accessToken: string;
        refreshToken: string;
      }>('/api/auth/login', data, { baseUrl: '' });
      return response.data;
    } catch (error) {
      console.error('Có lỗi xảy ra khi đăng nhập:', error);
      throw error;
    }
  },

  register: async (data: RegisterInput) => {
    try {
      const response = await http.post<User>(`${API_ENDPOINTS.AUTH.REGISTER}`, data);
      return response.data;
    } catch (error) {
      console.error('Có lỗi xảy ra khi đăng ký:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      console.log('chạy vào đây');
      await http.post('/api/auth/logout', null, { baseUrl: '' });
    } catch (error) {
      console.error('Có lỗi xảy ra khi đăng xuất:', error);
      throw error;
    }
  },

  getProfile: async () => {
    try {
      const response = await http.get<User>('api/auth/profile');
      return response.data;
    } catch (error) {
      console.error('Có lỗi xảy ra khi lấy thông tin tài khoản:', error);
      throw error;
    }
  },

  updateProfile: async (userData: Partial<User>) => {
    try {
      const response = await http.put<User>('api/auth/profile', userData);
      return response.data;
    } catch (error) {
      console.error('Có lỗi xảy ra khi cập nhật thông tin tài khoản:', error);
      throw error;
    }
  },

  forgotPassword: async (data: ForgotPasswordData): Promise<void> => {
    await http.post('api/auth/forgot-password', data);
  },

  resetPassword: async (data: ResetPasswordData): Promise<void> => {
    await http.post('api/auth/reset-password', data);
  },

  refreshToken: async () => {
    try {
      const response = await http.post('/api/auth/login', null, { baseUrl: '' });
      return response.data;
    } catch (error) {
      console.error('Có lỗi xảy ra khi làm mới token:', error);
      throw error;
    }
  },

  checkAuthStatus: async () => {
    try {
      const response = await http.get<User>(`${API_ENDPOINTS.AUTH.ME}`);
      return response.data;
    } catch (error) {
      console.error('Có lỗi xảy ra khi kiểm tra trạng thái xác thực:', error);
      throw error;
    }
  }
};
