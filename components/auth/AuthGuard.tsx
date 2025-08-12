import { useAuthContext } from "@/context/auth-context";


interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  requireActive?: boolean;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  fallback = null,
  requireAuth = false,
  requireAdmin = false,
  requireActive = true,
}) => {
  const { isAuthenticated, isAdmin, user, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return <>{fallback}</>;
  }

  if (requireAdmin && !isAdmin) {
    return <>{fallback}</>;
  }

  if (requireActive && !user?.isActive) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
