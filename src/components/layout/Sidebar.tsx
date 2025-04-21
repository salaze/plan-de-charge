
import React from "react";
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { Badge } from '@/components/ui/badge';

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

export function Sidebar({ isSidebarOpen }: SidebarProps) {
  const isOnline = useOnlineStatus();
  
  return (
    <aside
      className={`${
        isSidebarOpen ? "block" : "hidden"
      } md:block bg-white border-r min-w-[200px] p-4 h-full`}
    >
      <div className="mb-4">
        <Badge variant={isOnline ? "success" : "destructive"} className="w-full justify-center">
          {isOnline ? "Connecté" : "Déconnecté"}
        </Badge>
      </div>
      
      <nav>
        <ul className="space-y-2">
          <li>
            <a href="/admin" className="font-semibold text-gray-700">
              Administration
            </a>
          </li>
          <li>
            <a href="/employees" className="text-gray-700">
              Employés
            </a>
          </li>
          <li>
            <a href="/" className="text-gray-700">
              Planning
            </a>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
