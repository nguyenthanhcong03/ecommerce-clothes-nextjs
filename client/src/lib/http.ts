import { ApiError, ApiResponse } from '@/types/authType';
import { API_ENDPOINTS } from './config';
import { normalizePath } from './utils';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
  retryCount?: number;
  baseUrl?: string;
}

class Http {
  private async refreshToken(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH_TOKEN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include' // Gửi kèm cookie
      });

      if (!response.ok) {
        throw new Error('Không thể refresh token');
      }

      // Nếu refresh thành công, cookie mới đã được set tự động
      return true;
    } catch (error) {
      // Nếu refresh thất bại, redirect to login hoặc logout user
      console.error('Refresh token thất bại:', error);
      // Có thể gọi logout API để clear cookies
      // try {
      //   await fetch(`/api/auth/logout`, {
      //     method: 'POST',
      //     credentials: 'include'
      //   });
      // } catch (logoutError) {
      //   console.error('Logout after refresh failed:', logoutError);
      // }
      return false;
    }
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type');

    if (!contentType || !contentType?.includes('application/json')) {
      throw new Error('Server trả về response không phải JSON');
    }

    const data = await response.json();

    if (!response.ok) {
      const error: ApiError = {
        success: data.success,
        message: data.message || 'Đã xảy ra lỗi',
        statusCode: data.statusCode,
        errors: data.errors || [],
        stack: data.stack
      };
      throw error;
    }

    return data;
  }

  // Headers không cần Authorization vì backend check cookie httpOnly
  private getBaseHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json'
    };
  }

  async request<T = unknown>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const { skipAuth = false, retryCount = 0, ...fetchOptions } = options;

    // Xử lý URL
    let fullUrl: string;

    if (endpoint.startsWith('http')) {
      // Nếu endpoint là URL đầy đủ, sử dụng trực tiếp
      fullUrl = endpoint;
    } else {
      // Nếu endpoint là relative path
      const baseUrl = options?.baseUrl === undefined ? API_BASE_URL : options.baseUrl;
      const normalizedEndpoint = normalizePath(endpoint);
      fullUrl = baseUrl ? `${baseUrl}/${normalizedEndpoint}` : `/${normalizedEndpoint}`;
    }
    console.log('fullUrl:', fullUrl);

    let body: FormData | string | undefined = undefined;
    if (options?.body instanceof FormData) {
      body = options.body;
    } else if (options?.body) {
      body = JSON.stringify(options.body);
    }

    const headers: Record<string, string> = {
      ...this.getBaseHeaders(),
      ...((fetchOptions.headers as Record<string, string>) || {})
    };

    // Nếu body là FormData thì không set Content-Type
    if (options?.body instanceof FormData) {
      delete headers['Content-Type'];
    }

    try {
      const response = await fetch(fullUrl, {
        ...fetchOptions,
        headers,
        body,
        credentials: 'include' // Luôn gửi cookie
      });

      // Nếu unauthorized và không skip auth, thử refresh token
      if (response.status === 401 && !skipAuth && retryCount === 0) {
        const refreshSuccess = await this.refreshToken();

        if (refreshSuccess) {
          // Thử lại request gốc sau khi refresh thành công
          return this.request<T>(endpoint, {
            ...options,
            retryCount: retryCount + 1
          });
        } else {
          // // Nếu refresh thất bại, có thể redirect tới login page
          // if (typeof window !== 'undefined') {
          //   window.location.href = '/login';
          // }
        }
      }

      return this.handleResponse<T>(response);
    } catch (error) {
      throw error;
    }
  }

  // Convenience methods
  async get<T = unknown>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T = unknown>(endpoint: string, data?: any, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data
    });
  }

  async put<T = unknown>(endpoint: string, data?: any, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data
    });
  }

  async delete<T = unknown>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  // PATCH method
  async patch<T = unknown>(endpoint: string, data?: any, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data
    });
  }
}

// Export singleton instance
export const http = new Http();
