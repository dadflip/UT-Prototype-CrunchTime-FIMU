'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminUser } from '@/types';

export function useAdminAuth() {
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if session exists by trying to fetch admin data
        const response = await fetch('/api/auth/check-admin', {
          method: 'GET',
        });

        if (response.ok) {
          const data = await response.json();
          setAdmin(data.admin);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          router.push('/');
        }
      } catch (error) {
        console.error('[v0] Auth check error:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setAdmin(null);
      setIsAuthenticated(false);
      router.push('/');
    } catch (error) {
      console.error('[v0] Logout error:', error);
    }
  };

  return {
    admin,
    isAuthenticated,
    isLoading,
    logout,
  };
}
