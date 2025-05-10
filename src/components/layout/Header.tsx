import React from 'react';
import { Menu, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
interface HeaderProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}
export function Header({
  isSidebarOpen,
  setIsSidebarOpen
}: HeaderProps) {
  const {
    user
  } = useAuth();
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
  return <header className="bg-white dark:bg-gray-800 border-b px-4 py-3 flex items-center justify-between">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" className="mr-2 md:hidden" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
        <h1 className="text-lg font-semibold">Planning Activités</h1>
      </div>

      <div className="flex items-center gap-4">
        {user && <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{getInitials(user.username || "User")}</AvatarFallback>
            </Avatar>
            <span className="hidden sm:inline-block font-medium text-sm">
              {user.username || "User"}
            </span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </div>}
      </div>
    </header>;
}