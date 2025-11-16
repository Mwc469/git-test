'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../lib/auth-context';
import { cn } from '../lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Content', href: '/content', icon: '📁' },
  { name: 'Schedule', href: '/schedule', icon: '📅' },
  { name: 'Analytics', href: '/analytics', icon: '📈' },
  { name: 'Recommendations', href: '/recommendations', icon: '💡' },
  { name: 'Settings', href: '/settings', icon: '⚙️' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">
              Social Autopilot
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {user?.name || user?.email}
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <span className="text-xl">{item.icon}</span>
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User menu */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <span className="text-xl">🚪</span>
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <div className="max-w-7xl mx-auto p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
