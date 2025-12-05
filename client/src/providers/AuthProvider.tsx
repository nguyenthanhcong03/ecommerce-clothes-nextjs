'use client';

import { ReactNode, useEffect } from 'react';
import { useAuthStatusQuery } from '@/features/auth/useAuth';
import { useAuthStore } from '@/features/auth/authStore';

interface AuthProviderProps {
  children: ReactNode;
  accessToken?: string;
  refreshToken?: string;
}

export function AuthProvider({ children, accessToken, refreshToken }: AuthProviderProps) {
  const setUser = useAuthStore((state) => state.setUser);
  const setIsAuthenticated = useAuthStore((state) => state.setIsAuthenticated);
  const setIsLoading = useAuthStore((state) => state.setIsLoading);
  const storeLoading = useAuthStore((state) => state.isLoading);

  // Gọi useAuthStatus để check auth từ server mỗi khi reload
  const { data: user, isLoading: queryLoading, error, isSuccess, isError, isFetched } = useAuthStatusQuery(accessToken);

  // Set loading state - chỉ loading khi query đang chạy và chưa có dữ liệu
  useEffect(() => {
    setIsLoading(queryLoading && !isFetched);
  }, [queryLoading, isFetched, setIsLoading]);

  // Set lại dữ liệu vào store mỗi khi có kết quả từ server
  useEffect(() => {
    if (isSuccess && isFetched) {
      if (user) {
        setUser(user);
        setIsAuthenticated(true);
        console.log('🔐 Auth: Đăng nhập thành công -', user.username, `(${user.role})`);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        console.log('🔓 Auth: Chưa đăng nhập hoặc token hết hạn');
      }
    }
  }, [isSuccess, isFetched, user, setUser, setIsAuthenticated]);

  // Xử lý khi có lỗi (token không hợp lệ, hết hạn, network error, etc.)
  useEffect(() => {
    if (isError && isFetched) {
      setUser(null);
      setIsAuthenticated(false);
      console.log('❌ Auth: Lỗi xác thực -', error?.message || 'Unknown error');
    }
  }, [isError, isFetched, error, setUser, setIsAuthenticated]);

  // Show loading screen khi đang check auth lần đầu
  if (storeLoading && queryLoading) {
    return (
      <div className='fixed inset-0 z-50 flex items-center justify-center bg-white'>
        <div className='text-center'>
          <div className='mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600'></div>
          <p className='text-gray-600'>Đang kiểm tra đăng nhập...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
