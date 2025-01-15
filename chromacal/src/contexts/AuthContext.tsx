import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await window.api.auth.validateToken();
      if (response.success && response.isValid) {
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.error('Error checking auth status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async () => {
    try {
      setError(null);
      const response = await window.api.auth.startAuth();
      if (response.success) {
        setIsAuthenticated(true);
      } else {
        setError(response.error || 'Authentication failed');
      }
    } catch (err) {
      setError('Failed to complete authentication');
      console.error('Auth error:', err);
    }
  };

  const value = {
    isAuthenticated,
    isLoading,
    login,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}