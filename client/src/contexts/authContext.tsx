import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

// Configure axios defaults
axios.defaults.withCredentials = true;
axios.defaults.baseURL = process.env.NODE_ENV === 'production' 
  ? 'https://api.deepcode-server.xyz' 
  : 'http://localhost:8000';

export interface User {
  googleId: string;
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  /**
   * Initiates Google OAuth login by redirecting to backend
   */
  const login = () => {
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://api.deepcode-server.xyz' 
      : 'http://localhost:8000';
    window.location.href = `${baseUrl}/auth/google`;
  };

  /**
   * Logs out user and clears authentication state
   */
  const logout = async () => {
    try {
      await axios.get('/auth/logout');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Clear user state even if logout request fails
      setUser(null);
    }
  };

  /**
   * Checks if user is authenticated by calling the /auth/me endpoint
   */
  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/auth/me');
      setUser(response.data.user);
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Check authentication status on component mount
   */
  useEffect(() => {
    checkAuth();
  }, []);

  /**
   * Handle authentication success redirect
   */
  useEffect(() => {
    const handleAuthSuccess = () => {
      if (window.location.pathname === '/auth/success') {
        checkAuth().then(() => {
          // Redirect to dashboard or intended page after successful auth
          window.history.replaceState({}, '', '/code-arena');
        });
      }
    };

    handleAuthSuccess();
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to use authentication context
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};