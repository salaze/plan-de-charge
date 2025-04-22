
import React from 'react';
import { SidebarMenu } from './SidebarMenu';
import { SidebarProvider, Sidebar, SidebarContent, SidebarTrigger } from '@/components/ui/sidebar';
import { Header } from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex min-h-screen bg-gray-50 w-full">
        <Sidebar>
          <SidebarContent>
            <SidebarMenu />
          </SidebarContent>
        </Sidebar>
        
        <main className="flex-1">
          <Header />
          <div className="p-6">
            <SidebarTrigger />
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

