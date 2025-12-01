'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import {
  Users,
  UserCheck,
  Clock,
  DollarSign,
  LogOut,
  LayoutDashboard,
  Building,
  Calendar,
  CreditCard,
} from 'lucide-react';

const adminRoutes = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/admin',
  },
  {
    label: 'Users',
    icon: Users,
    href: '/admin/users',
  },
  {
    label: 'Employees',
    icon: UserCheck,
    href: '/admin/employees',
  },
  {
    label: 'Attendance',
    icon: Clock,
    href: '/admin/attendance',
  },
  {
    label: 'Salary Records',
    icon: DollarSign,
    href: '/admin/salary',
  },
];

const employeeRoutes = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/employee',
  },
  {
    label: 'My Profile',
    icon: UserCheck,
    href: '/employee/profile',
  },
  {
    label: 'Attendance',
    icon: Calendar,
    href: '/employee/attendance',
  },
  {
    label: 'Salary',
    icon: CreditCard,
    href: '/employee/salary',
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { userRole, logout } = useAuth();

  const routes = userRole === 'admin' ? adminRoutes : employeeRoutes;

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-gray-900 shadow-lg">
      <div className="px-3 py-2 flex-1">
        <Link href={userRole === 'admin' ? '/admin' : '/employee'} className="flex items-center pl-3 mb-14">
          <div className="relative h-8 w-8 mr-4">
            <Building className="h-6 w-6 text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">
            Employee MS
          </h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                'text-sm group flex p-3 w-full justify-start font-medium cursor-pointer rounded-lg transition-all duration-200',
                pathname === route.href 
                  ? 'text-white bg-blue-600 shadow-md' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn(
                  'h-5 w-5 mr-3 transition-colors',
                  pathname === route.href ? 'text-white' : 'text-gray-400 group-hover:text-white'
                )} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="px-3 py-2 border-t border-gray-700">
        <button
          onClick={logout}
          className="text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-red-600/20 rounded-lg transition-all duration-200 text-gray-300"
        >
          <div className="flex items-center flex-1">
            <LogOut className="h-5 w-5 mr-3 text-gray-400 group-hover:text-red-400" />
            Logout
          </div>
        </button>
      </div>
    </div>
  );
}