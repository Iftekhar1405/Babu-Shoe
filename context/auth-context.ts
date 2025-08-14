import { useAuth } from '@/hooks/use-auth';
import { User } from '@/types/auth.type';
import React, { createContext, useContext } from 'react';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isError: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext(undefined);
console.log("🪵 ~ AuthContext:", AuthContext)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: user, isLoading, isError } = useAuth({
    retry: false,
    refetchOnWindowFocus: false,
  });

  const value: AuthContextValue = {
    user: user || null,
    isLoading,
    isError,
    isAuthenticated: !!user && !isError,
    isAdmin: user?.role === 'ADMIN',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
