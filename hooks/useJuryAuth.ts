'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { JuryMember } from '@/types';
import { getJurySession, clearJurySession } from '@/lib/local-auth';

export function useJuryAuth() {
  const router = useRouter();
  const [juryMember, setJuryMember] = useState<JuryMember | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const juryData = getJurySession();
        
        if (juryData) {
          setJuryMember(juryData);
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
      clearJurySession();
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
