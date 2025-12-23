import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { AuthState, User } from '@/types/authType';

interface AuthStore extends AuthState {
  // Actions
  setUser: (user: User | null) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state - luôn loading khi mới khởi tạo để AuthProvider check
        user: null,
        isAuthenticated: false,
        isLoading: true,

        // Actions
        setUser: (user) => set({ user }),
        setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
        setIsLoading: (isLoading) => set({ isLoading }),

        login: (user) =>
          set({
            user,
            isAuthenticated: true,
            isLoading: false
          }),

        logout: () =>
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false
          }),

        updateUser: (userData) => {
          const currentUser = get().user;
          if (currentUser) {
            set({
              user: { ...currentUser, ...userData }
            });
          }
        }
      }),
      {
        name: 'auth-storage',
        // Chỉ persist user data, không persist loading và auth status để force recheck
        partialize: (state) => ({
          user: state.user
          // Không persist isAuthenticated và isLoading để luôn recheck khi reload
        }),
        // Merge function để handle hydration đúng cách
        merge: (persistedState, currentState) => ({
          ...currentState,
          // Chỉ restore user từ storage, vẫn giữ isLoading = true để check lại
          user: (persistedState as Partial<AuthStore>)?.user || null
        })
      }
    ),
    {
      name: 'auth-store'
    }
  )
);
