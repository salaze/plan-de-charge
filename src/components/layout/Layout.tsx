
import React from 'react';
import { Menu } from 'lucide-react';
import { SidebarMenu } from './SidebarMenu';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Sidebar, 
  SidebarProvider, 
  SidebarContent, 
  SidebarHeader, 
  SidebarFooter,
  SidebarTrigger,
  SidebarInset
} from '@/components/ui/sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const isMobile = useIsMobile();
  
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full">
        <Sidebar>
          <SidebarHeader className="p-4 border-b border-sidebar-border">
            <h1 className="text-xl font-semibold text-sidebar-foreground">Planning Manager</h1>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu />
          </SidebarContent>
          <SidebarFooter className="p-4 border-t border-sidebar-border">
            <p className="text-xs text-sidebar-foreground/70">© 2025 Planning Manager</p>
          </SidebarFooter>
        </Sidebar>
        
        <SidebarInset>
          <header className="bg-background p-4 border-b border-border sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <SidebarTrigger className="mr-3" />
                <h1 className="text-xl font-semibold">Planning Manager</h1>
              </div>
            </div>
          </header>
          
          <main className="p-2 sm:p-4">
            <div className="layout-container space-y-4 sm:space-y-6 max-w-full">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
