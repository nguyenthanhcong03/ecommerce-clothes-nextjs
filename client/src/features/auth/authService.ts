import { http } from '@/lib/http';
import {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  User,
  ForgotPasswordData,
  ResetPasswordData
} from '@/features/auth/authType';

export const authService = {
  login: async (credentials: LoginCredentials) => {
    try {
      const response = await http.post<AuthResponse>('/api/auth/login', credentials, { baseUrl: '' });
      return response.data;
    } catch (error) {
      console.error('Có lỗi xảy ra khi đăng nhập:', error);
    }
  },

  register: async (data: RegisterData) => {
    try {
      const response = await http.post<AuthResponse>('api/auth/register', data);
      return response.data;
    } catch (error) {
      console.error('Có lỗi xảy ra khi đăng ký:', error);
    }
  },

  logout: async (): Promise<void> => {
    try {
      await http.post('/api/auth/logout', { baseUrl: '' });
    } catch (error) {
      console.error('Có lỗi xảy ra khi đăng xuất:', error);
    }
  },

  getProfile: async () => {
    try {
      const response = await http.get<User>('api/auth/profile');
      return response.data;
    } catch (error) {
      console.error('Có lỗi xảy ra khi lấy thông tin tài khoản:', error);
    }
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

  refreshToken: async (refreshToken: string) => {
    const response = await http.post(
      'api/auth/refresh-token',
      {},
      {
        headers: {
          Cookie: `refreshToken=${refreshToken}`
        },
        credentials: 'include'
      }
    );
    return response.data;
  },

  checkAuthStatus: async () => {
    try {
      const response = await http.get<User>('api/auth/current', { skipAuth: false });
      return response.data;
    } catch {
      return null;
    }
  }
};
