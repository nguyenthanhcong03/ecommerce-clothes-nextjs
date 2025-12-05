"use client";

import { useAuthStore } from "../store";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
  requiredRole?: "admin" | "customer";
  requireAuth?: boolean;
}

export default function ProtectedRoute({
  children,
  fallback = null,
  requiredRole,
  requireAuth = true,
}: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      // If auth is not required and user is authenticated, can access
      if (!requireAuth) {
        return;
      }

      // If auth is required but user is not authenticated
      if (requireAuth && !isAuthenticated) {
        router.push("/login");
        return;
      }

      // Check role authorization
      if (requiredRole && user && user.role !== requiredRole && user.role !== "admin") {
        router.push("/unauthorized");
        return;
      }
    }
  }, [isLoading, isAuthenticated, user, requireAuth, requiredRole, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // If auth not required, show content
  if (!requireAuth) {
    return <>{children}</>;
  }

  // Check authentication
  if (!isAuthenticated || !user) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Bạn cần đăng nhập để truy cập trang này</h2>
            <a href="/login" className="text-blue-600 hover:text-blue-500">
              Đăng nhập ngay
            </a>
          </div>
        </div>
      )
    );
  }

  // Check role authorization
  if (requiredRole && user.role !== requiredRole && user.role !== "admin") {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Bạn không có quyền truy cập trang này</h2>
            <Link href="/" className="text-blue-600 hover:text-blue-500">
              Về trang chủ
            </Link>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}

// Higher-order component version
export function withAuth<P extends object>(Component: React.ComponentType<P>, requiredRole?: "admin" | "customer") {
  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute requiredRole={requiredRole}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}
