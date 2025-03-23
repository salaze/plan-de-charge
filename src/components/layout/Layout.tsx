
import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { SidebarMenu } from './SidebarMenu';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  return (
    <div className="min-h-screen flex">
      {/* Sidebar for desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-sidebar fixed inset-y-0 z-50">
        <div className="p-4 border-b border-sidebar-border">
          <h1 className="text-xl font-semibold text-sidebar-foreground">Planning Manager</h1>
        </div>
        <div className="flex-1 overflow-auto">
          <SidebarMenu />
        </div>
      </aside>
      
      {/* Mobile sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar transform transition-transform duration-300 ease-in-out 
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:hidden`}
      >
        <div className="p-4 flex justify-between items-center border-b border-sidebar-border">
          <h1 className="text-xl font-semibold text-sidebar-foreground">Planning Manager</h1>
          <button 
            className="text-sidebar-foreground p-1 rounded-full hover:bg-sidebar-accent/30"
            onClick={toggleSidebar}
          >
            <X size={24} />
          </button>
        </div>
        <div className="flex-1 overflow-auto">
          <SidebarMenu />
        </div>
      </aside>
      
      {/* Main content */}
      <div className="flex-1 md:ml-64">
        {/* Mobile header */}
        <header className="bg-background p-4 border-b border-border md:hidden">
          <div className="flex items-center justify-between">
            <button
              className="text-foreground p-2 rounded-md hover:bg-secondary"
              onClick={toggleSidebar}
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-semibold">Planning Manager</h1>
            <div className="w-10"></div> {/* Spacer for center alignment */}
          </div>
        </header>
        
        {/* Desktop header */}
        <header className="bg-background p-4 border-b border-border hidden md:block">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Planning Manager</h1>
          </div>
        </header>
        
        {/* Main content */}
        <main className="p-4">
          <div className="layout-container space-y-6">
            {children}
          </div>
        </main>
      </div>
      
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
}
