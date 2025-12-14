import { authService } from '@/features/auth/authService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from './authStore';

// Query keys
export const AUTH_QUERY_KEYS = {
  user: ['auth', 'user'] as const,
  profile: ['auth', 'profile'] as const
} as const;

// Custom hooks
export const useLoginMutation = () => {
  const queryClient = useQueryClient();
  const { login: setUserLogin } = useAuthStore();

  return useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      if (!data) return;
      setUserLogin(data.user);
      queryClient.setQueryData(AUTH_QUERY_KEYS.user, data.user);
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.user });
    },
    onError: (error) => {
      throw error;
    }
  });
};

export const useRegisterMutation = () => {
  // const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.register
    // onSuccess: (data) => {
    //   queryClient.setQueryData(AUTH_QUERY_KEYS.user, data.user);
    //   queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.user });
    // }
  });
};

export const useLogoutMutation = () => {
  const queryClient = useQueryClient();
  const { logout } = useAuthStore();

  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      logout();
      queryClient.clear();
    },
    onError: () => {
      logout();
      queryClient.clear();
    }
  });
};

export const useProfileQuery = () => {
  const { user, isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: AUTH_QUERY_KEYS.profile,
    queryFn: authService.getProfile,
    enabled: isAuthenticated && !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  });
};

export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient();
  const { updateUser } = useAuthStore();

  return useMutation({
    mutationFn: authService.updateProfile,
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      queryClient.setQueryData(AUTH_QUERY_KEYS.profile, updatedUser);
      queryClient.setQueryData(AUTH_QUERY_KEYS.user, updatedUser);
    }
  });
};

export const useForgotPasswordMutation = () => {
  return useMutation({
    mutationFn: authService.forgotPassword
  });
};

export const useResetPasswordMutation = () => {
  return useMutation({
    mutationFn: authService.resetPassword
  });
};

export const useAuthStatusQuery = (accessToken?: string) => {
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.user,
    queryFn: authService.checkAuthStatus,
    enabled: !!accessToken,
    retry: false,
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: false,
    refetchOnMount: true, // Luôn fetch khi component mount
    refetchOnReconnect: true // Fetch lại khi reconnect
  });
};
