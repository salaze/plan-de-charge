
import React from "react";
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { Badge } from '@/components/ui/badge';
import { SidebarMenu } from './SidebarMenu';

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

export function Sidebar({ isSidebarOpen, setIsSidebarOpen }: SidebarProps) {
  const isOnline = useOnlineStatus();
  
  return (
    <aside
      className={`fixed md:static h-screen z-30 ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-[85%]"
      } md:translate-x-[-80%] bg-primary text-primary-foreground border-r min-w-[240px] p-4 
        transition-transform duration-300 ease-in-out hover:translate-x-0 
        hover:shadow-lg group`}
      onMouseEnter={() => setIsSidebarOpen(true)}
      onMouseLeave={() => setIsSidebarOpen(false)}
    >
      <div className="flex flex-col h-full">
        <div className="mb-4">
          <Badge variant={isOnline ? "success" : "destructive"} className="w-full justify-center">
            {isOnline ? "Connecté" : "Déconnecté"}
          </Badge>
        </div>
        
        <SidebarMenu />
        
        <div className="absolute right-[-20px] top-1/2 -translate-y-1/2 
          bg-primary rounded-r-lg p-1 text-primary-foreground cursor-pointer shadow-md
          transition-opacity duration-300 md:opacity-0 group-hover:opacity-0"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <div className="h-8 w-5 flex items-center justify-center">
            {isSidebarOpen ? "◀" : "▶"}
          </div>
        </div>
      </div>
    </aside>
  );
}
