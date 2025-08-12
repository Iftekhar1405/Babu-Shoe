import { useAuthContext } from '@/context/auth-context';
import { useRouter, useSearchParams } from 'next/navigation';

import { useEffect } from 'react';

export const useAuthRedirect = (redirectTo: string = '/dashboard') => {
  const { isAuthenticated, isLoading } = useAuthContext();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const returnUrl = searchParams.get('returnUrl') || redirectTo;
      router.replace(returnUrl);
    }
  }, [isAuthenticated, isLoading, router, redirectTo, searchParams]);
};