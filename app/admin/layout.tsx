'use client';

import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Button } from '@/components/ui/button';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';
import { BarChart3, Mic, Star, Users, Film, TrendingUp, Database, Settings } from 'lucide-react';

const adminMenuItems = [
  { label: 'Dashboard', href: '/admin', icon: <BarChart3 /> },
  { label: 'Artistes', href: '/admin/artists', icon: <Mic /> },
  { label: 'Top Artistes', href: '/admin/rankings', icon: <Star /> },
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
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="h-6 w-6" />
              <h1 className="font-bold text-lg">Admin Panel</h1>
            </div>
            <p className="text-xs text-muted-foreground">{admin?.email}</p>
          </div>

          {/* Menu */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {adminMenuItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={pathname === item.href ? 'default' : 'ghost'}
                  className="w-full justify-start gap-3"
                >
                  {item.icon}
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t">
            <Button
              variant="outline"
              className="w-full"
              onClick={logout}
            >
              Déconnexion
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
