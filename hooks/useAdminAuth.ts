'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminUser } from '@/types';
import { getAdminSession, clearAdminSession } from '@/lib/local-auth';

export function useAdminAuth() {
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const adminData = getAdminSession();
        
        if (adminData) {
          setAdmin(adminData);
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

  const logout = () => {
    try {
      clearAdminSession();
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
