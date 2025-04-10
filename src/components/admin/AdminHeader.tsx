
import React from 'react';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export function AdminHeader() {
  const { logout } = useAuth();
  
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-bold">Administration</h1>
      <Button variant="outline" onClick={logout}>
        <LogOut className="mr-2 h-4 w-4" />
        Déconnexion
      </Button>
    </div>
  );
}
