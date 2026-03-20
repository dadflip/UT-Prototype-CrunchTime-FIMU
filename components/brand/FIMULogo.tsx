'use client';

import { cn } from '@/lib/utils';

interface FIMULogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'full' | 'icon' | 'text';
}

export function FIMULogo({ className, size = 'md', variant = 'full' }: FIMULogoProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  if (variant === 'icon') {
    return (
      <div className={cn('relative', sizeClasses[size], className)}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Cercle rouge */}
          <circle cx="50" cy="50" r="45" fill="#A21825" />
          
          {/* Étoile jaune stylisée */}
          <path
            d="M50 20 L58 36 L75 36 L61 46 L68 62 L50 52 L32 62 L39 46 L25 36 L42 36 Z"
            fill="#FEEB85"
          />
          
          {/* Lettre F stylisée */}
          <text
            x="50"
            y="55"
            fontFamily="Arial, sans-serif"
            fontSize="24"
            fontWeight="bold"
            fill="#A21825"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            F
          </text>
        </svg>
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <span className={cn('font-bold text-primary', textSizes[size])}>
          FIMU
        </span>
        <span className={cn('text-muted-foreground text-sm', textSizes[size])}>
          Festival International de Musique Universitaire
        </span>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className={cn('relative', sizeClasses[size])}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Cercle rouge */}
          <circle cx="50" cy="50" r="45" fill="#A21825" />
          
          {/* Étoile jaune stylisée */}
          <path
            d="M50 20 L58 36 L75 36 L61 46 L68 62 L50 52 L32 62 L39 46 L25 36 L42 36 Z"
            fill="#FEEB85"
          />
          
          {/* Lettre F stylisée */}
          <text
            x="50"
            y="55"
            fontFamily="Arial, sans-serif"
            fontSize="24"
            fontWeight="bold"
            fill="#A21825"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            F
          </text>
        </svg>
      </div>
      <div className="flex flex-col">
        <span className={cn('font-bold text-primary', textSizes[size])}>
          FIMU
        </span>
        <span className="text-xs text-muted-foreground">
          Festival International de Musique Universitaire
        </span>
      </div>
    </div>
  );
}
