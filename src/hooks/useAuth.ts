'use client';

import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { authApi } from '@/lib/api';
import { AuthResponse } from '@/types';

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: 'admin' | 'employee' | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'employee' | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get('access_token');
    const role = Cookies.get('user_role') as 'admin' | 'employee' | undefined;
    
    if (token && role) {
      setIsAuthenticated(true);
      setUserRole(role);
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
      
      Cookies.set('access_token', response.access_token);
      Cookies.set('user_role', role);
      
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
    Cookies.remove('access_token');
    Cookies.remove('user_role');
    setIsAuthenticated(false);
    setUserRole(null);
    router.push('/login');
  };

  const contextValue: AuthContextType = {
    isAuthenticated,
    userRole,
    login,
    logout,
    loading,
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