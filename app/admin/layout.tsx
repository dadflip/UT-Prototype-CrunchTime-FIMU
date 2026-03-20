'use client';

import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Button } from '@/components/ui/button';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';
import { BarChart3, Mic, Star, Users, Film, TrendingUp, Database, Settings, Trophy } from 'lucide-react';

const adminMenuItems = [
  { label: 'Dashboard', href: '/admin', icon: <BarChart3 /> },
  { label: 'Artistes', href: '/admin/artists', icon: <Mic /> },
  { label: 'Top Artistes', href: '/admin/rankings', icon: <Star /> },
  { label: 'Configuration Tops', href: '/admin/top-size', icon: <Trophy /> },
  { label: 'Utilisateurs', href: '/admin/users', icon: <Users /> },
  { label: 'Performances', href: '/admin/performance-flow', icon: <Film /> },
  { label: 'Résultats', href: '/admin/results', icon: <TrendingUp /> },
  { label: 'Excel Sync', href: '/admin/excel-sync', icon: <Database /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, admin, logout } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Menu Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const sidebar = document.getElementById('admin-sidebar');
            if (sidebar) {
              sidebar.classList.toggle('translate-x-0');
              sidebar.classList.toggle('-translate-x-full');
            }
          }}
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      {/* Sidebar */}
      <aside 
        id="admin-sidebar"
        className="fixed lg:static inset-y-0 left-0 z-40 w-64 border-r bg-card transform -translate-x-full lg:translate-x-0 transition-transform duration-300 ease-in-out"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="h-5 w-5 sm:h-6 sm:w-6" />
              <h1 className="font-bold text-base sm:text-lg">Admin Panel</h1>
            </div>
            <p className="text-xs text-muted-foreground truncate">{admin?.email}</p>
          </div>

          {/* Menu */}
          <nav className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-1 sm:space-y-2">
            {adminMenuItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={pathname === item.href ? 'default' : 'ghost'}
                  className="w-full justify-start gap-2 sm:gap-3 text-sm sm:text-base h-10 sm:h-auto py-2 sm:py-3"
                  onClick={() => {
                    // Close mobile menu after navigation
                    const sidebar = document.getElementById('admin-sidebar');
                    if (sidebar && window.innerWidth < 1024) {
                      sidebar.classList.add('-translate-x-full');
                      sidebar.classList.remove('translate-x-0');
                    }
                  }}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </Button>
              </Link>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-2 sm:p-4 border-t">
            <Button
              variant="outline"
              className="w-full text-sm sm:text-base"
              onClick={logout}
            >
              Déconnexion
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      <div 
        className="lg:hidden fixed inset-0 bg-black/50 z-30 hidden"
        id="mobile-overlay"
        onClick={() => {
          const sidebar = document.getElementById('admin-sidebar');
          const overlay = document.getElementById('mobile-overlay');
          if (sidebar && overlay) {
            sidebar.classList.add('-translate-x-full');
            sidebar.classList.remove('translate-x-0');
            overlay.classList.add('hidden');
          }
        }}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto lg:ml-0">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
