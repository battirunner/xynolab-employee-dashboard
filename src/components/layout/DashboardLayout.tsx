'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Loader2 } from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'employee';
}

export function DashboardLayout({ children, requiredRole }: DashboardLayoutProps) {
  const { isAuthenticated, userRole, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }

      if (requiredRole && userRole !== requiredRole) {
        // Redirect to appropriate dashboard if user doesn't have required role
        if (userRole === 'admin') {
          router.push('/admin');
        } else {
          router.push('/employee');
        }
        return;
      }
    }
  }, [isAuthenticated, userRole, loading, router, requiredRole]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || (requiredRole && userRole !== requiredRole)) {
    return null; // Will redirect
  }

  return (
    <div className="h-screen bg-gray-100">
      <div className="flex h-full">
        <div className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-64">
            <Sidebar />
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <Header />
          <main className="flex-1 relative overflow-y-auto focus:outline-none">
            <div className="p-6">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}