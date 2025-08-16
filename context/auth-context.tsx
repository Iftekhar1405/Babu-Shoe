'use client';

import { createContext, useContext, useEffect } from 'react';
import { useAuth } from '@/lib/auth-hooks';
import { User } from '@/types/auth.type';
import { useQueryClient } from '@tanstack/react-query';
import { authQueryKeys } from '@/lib/auth-hooks';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isError: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isLoading, isError } = useAuth();

  const logout = () => {
    queryClient.clear();
    // Remove any stored tokens if you have them in localStorage
    // localStorage.removeItem('token');
  };


  useEffect(() => {
    const handleUnauthorized = () => {
      if (!isLoading && isError) {
        queryClient.removeQueries({ queryKey: authQueryKeys.profile() });
      }
    };

    handleUnauthorized();
  }, [isError, isLoading, queryClient]);

  const value = {
    user: user || null,
    isAuthenticated,
    isLoading,
    isError,
    logout,
  };

  return <AuthContext.Provider value={value}>
    {children}
  </AuthContext.Provider>
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}