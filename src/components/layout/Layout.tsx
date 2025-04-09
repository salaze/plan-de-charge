
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({
  children
}: LayoutProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen w-full">
      <main className="p-2 sm:p-4 w-full">
        <div className="layout-container space-y-4 sm:space-y-6 max-w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
