'use client';

import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, setAuthTokenGetter } from '@/lib/api';
import { AuthResponse } from '@/types';

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: 'admin' | 'employee' | null;
  accessToken: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  getAccessToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'employee' | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const getAccessToken = () => accessToken;

  useEffect(() => {
    // Register token getter with API layer
    setAuthTokenGetter(getAccessToken);
    
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      const role = localStorage.getItem('user_role') as 'admin' | 'employee' | null;
      
      if (token && role) {
        setAccessToken(token);
        setIsAuthenticated(true);
        setUserRole(role);
      }
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response: AuthResponse = await authApi.login(username, password);
      
      // For now, we'll determine role based on username (since API doesn't provide role in token)
      // In a real app, you'd want to make another API call to get user info
      // This is a simplified implementation
      let role: 'admin' | 'employee' = 'employee';
      if (username === 'admin' || username.includes('admin')) {
        role = 'admin';
      }
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', response.access_token);
        localStorage.setItem('user_role', role);
      }
      
      setAccessToken(response.access_token);
      setIsAuthenticated(true);
      setUserRole(role);
      
      // Redirect based on role
      if (role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/employee');
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_role');
    }
    setAccessToken(null);
    setIsAuthenticated(false);
    setUserRole(null);
    router.push('/login');
  };

  const contextValue: AuthContextType = {
    isAuthenticated,
    userRole,
    accessToken,
    login,
    logout,
    loading,
    getAccessToken,
  };

  return React.createElement(
    AuthContext.Provider,
    { value: contextValue },
    children
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}