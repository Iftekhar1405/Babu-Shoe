// components/auth/AuthGuard.tsx
'use client';

import { useAuth } from '@/lib/auth-hooks';
import { Role } from '@/types/auth.type';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredRole?: Role | Role[];
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export function AuthGuard({
  children,
  requireAuth = true,
  requiredRole,
  redirectTo,
  fallback
}: AuthGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // Check if authentication is required
    if (requireAuth && !isAuthenticated) {
      router.push(redirectTo || '/auth/login');
      return;
    }

    // Check role requirements
    if (requiredRole && user) {
      const hasRequiredRole = Array.isArray(requiredRole)
        ? requiredRole.includes(user.role)
        : user.role === requiredRole;

      if (!hasRequiredRole) {
        router.push('/403'); // Forbidden page
        return;
      }
    }
  }, [isLoading, isAuthenticated, user, requireAuth, requiredRole, router, redirectTo]);

  // Show loading state
  if (isLoading) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )
    );
  }

  // If auth is required but user is not authenticated, don't render children
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // If specific role is required but user doesn't have it, don't render children
  if (requiredRole && user) {
    const hasRequiredRole = Array.isArray(requiredRole)
      ? requiredRole.includes(user.role)
      : user.role === requiredRole;

    if (!hasRequiredRole) {
      return null;
    }
  }

  return <>{children}</>;
}

// Convenience components for specific roles
export function AdminGuard({ children, ...props }: Omit<AuthGuardProps, 'requiredRole'>) {
  return (
    <AuthGuard requiredRole={Role.ADMIN} {...props}>
      {children}
    </AuthGuard>
  );
}

export function ManagerGuard({ children, ...props }: Omit<AuthGuardProps, 'requiredRole'>) {
  return (
    <AuthGuard requiredRole={[Role.ADMIN, Role.MANAGER]} {...props}>
      {children}
    </AuthGuard>
  );
}
