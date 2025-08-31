
import { useAuthContext } from '@/context/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
  redirectTo = '/login',
}) => {
  const { isAuthenticated, isLoading, user } = useAuthContext();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        const returnUrl = encodeURIComponent(pathname);
        router.push(`${redirectTo}?returnUrl=${returnUrl}`);
      } else if (requireAdmin) {
        router.push('/unauthorized');
      } else if (!user?.isActive) {
        router.push('/account-inactive');
      }
    }
  }, [isAuthenticated, isLoading, requireAdmin, router, pathname, redirectTo, user?.isActive]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  if (requireAdmin) {
    return null; // Will redirect
  }

  if (!user?.isActive) {
    return null; // Will redirect
  }

  return <>{children}</>;
};