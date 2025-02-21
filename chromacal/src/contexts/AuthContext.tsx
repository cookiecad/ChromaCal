import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  error: string | null;
  credentialsStatus: {
    exists: boolean;
    path: string;
  } | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [credentialsStatus, setCredentialsStatus] = useState<{ exists: boolean; path: string; } | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        // Get credentials status first
        const credResponse = await window.api.auth.getCredentialsStatus();
        if (credResponse.success && credResponse.status) {
          setCredentialsStatus(credResponse.status);
          
          // Only check auth status if credentials exist
          if (credResponse.status.exists) {
            const response = await window.api.auth.validateToken();
            if (response.success && response.isValid) {
              setIsAuthenticated(true);
            } else {
              setIsAuthenticated(false);
              setError(null);
            }
          } else {
            setIsAuthenticated(false);
            setError('Google Calendar credentials not found');
          }
        } else {
          setError('Failed to check credentials status');
        }
      } catch (err) {
        console.error('Error during initialization:', err);
        setIsAuthenticated(false);
        setError('Failed to initialize application');
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  const login = async () => {
    if (!credentialsStatus?.exists) {
      setError('Google Calendar credentials not found');
      return;
    }

    setIsAuthenticated(false);
    setError(null);
    try {
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
    credentialsStatus,
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