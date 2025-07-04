import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

// Configure axios defaults
axios.defaults.withCredentials = true;

// Set the base URL based on environment
const getBaseURL = () => {
  if (process.env.NODE_ENV === 'production') {
    return 'https://api.deepcode-server.xyz';
  }
  // For local development, use production API
  return process.env.REACT_APP_API_URL || 'https://api.deepcode-server.xyz';
};

axios.defaults.baseURL = getBaseURL();

// Add request interceptor to ensure credentials are always sent
axios.interceptors.request.use(
  (config) => {
    config.withCredentials = true;
    // Add explicit headers for CORS
    config.headers = {
      ...config.headers,
      'Content-Type': 'application/json',
    };
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('🔒 Authentication failed - redirecting to login');
    }
    return Promise.reject(error);
  }
);

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
    const baseUrl = getBaseURL();
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
      
      console.log('🔍 Checking authentication with:', getBaseURL());
      
      const response = await axios.get('/auth/me', {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      setUser(response.data.user);
      console.log('✅ Authentication successful:', response.data.user);
    } catch (error: any) {
      console.error('❌ Auth check failed:', error.response?.status, error.response?.data);
      setUser(null);
      
      // Log CORS-specific errors
      if (error.message?.includes('CORS')) {
        console.error('🚫 CORS Error: Make sure the server allows your origin');
      }
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