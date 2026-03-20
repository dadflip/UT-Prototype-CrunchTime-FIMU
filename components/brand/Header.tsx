'use client';

import { FIMULogo } from './FIMULogo';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
}

export function Header({ title, subtitle, showLogo = true }: HeaderProps) {
  return (
    <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {showLogo && <FIMULogo size="md" />}
            {(title || subtitle) && (
              <div className="flex flex-col">
                {title && (
                  <h1 className="text-2xl font-bold text-foreground">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-sm text-muted-foreground">
                    {subtitle}
                  </p>
                )}
              </div>
            )}
          </div>
          
          {/* Bandeau décoratif rouge et jaune */}
          <div className="hidden md:flex items-center gap-1">
            <div className="w-8 h-8 rounded-full bg-[#A21825]" />
            <div className="w-8 h-8 rounded-full bg-[#FEEB85]" />
            <div className="w-8 h-8 rounded-full bg-[#A21825]" />
            <div className="w-8 h-8 rounded-full bg-[#FEEB85]" />
          </div>
        </div>
      </div>
    </div>
  );
}
