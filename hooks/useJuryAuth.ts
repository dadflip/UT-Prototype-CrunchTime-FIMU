'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { JuryMember } from '@/types';

export function useJuryAuth() {
  const router = useRouter();
  const [juryMember, setJuryMember] = useState<JuryMember | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if session exists by trying to fetch jury data
        const response = await fetch('/api/auth/check-jury', {
          method: 'GET',
        });

        if (response.ok) {
          const data = await response.json();
          setJuryMember(data.juryMember);
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
      setJuryMember(null);
      setIsAuthenticated(false);
      router.push('/');
    } catch (error) {
      console.error('[v0] Logout error:', error);
    }
  };

  return {
    juryMember,
    isAuthenticated,
    isLoading,
    logout,
  };
}
