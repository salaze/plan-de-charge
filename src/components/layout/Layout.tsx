
import React, { useState, useEffect, useRef } from 'react';
import { Menu, X } from 'lucide-react';
import { SidebarMenu } from './SidebarMenu';
import { useIsMobile } from '@/hooks/use-mobile';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  // Initialize sidebarOpen state before using the hook
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  // Function to handle mouse enter in the detection zone on the left
  const handleMouseEnter = () => {
    if (isMobile) return; // Don't activate on mobile
    
    // Clear previous timeout if it exists
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    
    // Set a small delay to avoid fluctuations
    hoverTimeoutRef.current = setTimeout(() => {
      setSidebarOpen(true);
    }, 200);
  };
  
  // Function to handle mouse leaving the sidebar
  const handleMouseLeave = () => {
    if (isMobile) return; // Don't activate on mobile
    
    // Clear previous timeout if it exists
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    
    // Set a delay before closing to avoid fluctuations
    hoverTimeoutRef.current = setTimeout(() => {
      setSidebarOpen(false);
    }, 300);
  };
  
  // Clean up timeouts when unmounting component
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);
  
  return (
    <div className="min-h-screen flex">
      {/* Detection zone for sidebar hover appearance */}
      <div 
        className="hidden md:block fixed top-0 left-0 w-4 h-full z-40"
        onMouseEnter={handleMouseEnter}
      />
      
      {/* Sidebar for desktop - appears on hover */}
      <aside 
        ref={sidebarRef}
        className={`hidden md:flex flex-col w-64 bg-sidebar fixed inset-y-0 z-50 transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        onMouseLeave={handleMouseLeave}
      >
        <div className="p-4 border-b border-sidebar-border">
          <h1 className="text-xl font-semibold text-sidebar-foreground">Planning Manager</h1>
        </div>
        <div className="flex-1 overflow-auto">
          <SidebarMenu />
        </div>
      </aside>
      
      {/* Mobile sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-80 bg-sidebar transform transition-transform duration-300 ease-in-out 
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:hidden`}
      >
        <div className="p-4 flex justify-between items-center border-b border-sidebar-border">
          <h1 className="text-xl font-semibold text-sidebar-foreground">Planning Manager</h1>
          <button 
            className="text-sidebar-foreground p-1 rounded-full hover:bg-sidebar-accent/30"
            onClick={toggleSidebar}
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>
        <div className="flex-1 overflow-auto">
          <SidebarMenu />
        </div>
      </aside>
      
      {/* Main content */}
      <div className="flex-1 md:ml-0 w-full">
        {/* Mobile header */}
        <header className="bg-background p-4 border-b border-border md:hidden sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <button
              className="text-foreground p-2 rounded-md hover:bg-secondary"
              onClick={toggleSidebar}
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-semibold">Planning Manager</h1>
            <div className="w-10"></div> {/* Spacer for center alignment */}
          </div>
        </header>
        
        {/* Desktop header */}
        <header className="bg-background p-4 border-b border-border hidden md:block sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                className="text-foreground p-2 mr-2 rounded-md hover:bg-secondary md:flex"
                onClick={toggleSidebar}
                aria-label="Open/Close menu"
              >
                <Menu size={24} />
              </button>
              <h1 className="text-xl font-semibold">Planning Manager</h1>
            </div>
          </div>
        </header>
        
        {/* Main content */}
        <main className="p-2 sm:p-4">
          <div className="layout-container space-y-4 sm:space-y-6 max-w-full">
            {children}
          </div>
        </main>
      </div>
      
      {/* Mobile overlay */}
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
}
