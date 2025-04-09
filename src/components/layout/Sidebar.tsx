
import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth';
import { 
  BarChart, 
  Calendar, 
  FileSpreadsheet, 
  Home, 
  Settings, 
  Users 
} from 'lucide-react';

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  children: React.ReactNode;
}

function NavItem({ to, icon: Icon, children }: NavItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all hover:bg-accent",
        isActive ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground"
      )}
    >
      <Icon className="h-5 w-5" />
      <span>{children}</span>
    </NavLink>
  );
}

export function Sidebar() {
  const { isAdmin } = useAuth();
  
  return (
    <div className="hidden md:flex h-screen w-64 flex-col border-r bg-background">
      <div className="flex h-16 items-center border-b px-4">
        <h2 className="text-lg font-semibold">Planning de Charge</h2>
      </div>
      <nav className="flex-1 overflow-auto p-3">
        <div className="space-y-1">
          <NavItem to="/" icon={Home}>
            Tableau de bord
          </NavItem>
          <NavItem to="/planning" icon={Calendar}>
            Planning
          </NavItem>
          {isAdmin && (
            <NavItem to="/employees" icon={Users}>
              Employés
            </NavItem>
          )}
          <NavItem to="/statistics" icon={BarChart}>
            Statistiques
          </NavItem>
          <NavItem to="/export" icon={FileSpreadsheet}>
            Exports
          </NavItem>
          <NavItem to="/settings" icon={Settings}>
            Paramètres
          </NavItem>
        </div>
      </nav>
      <div className="border-t p-4">
        <p className="text-xs text-muted-foreground">
          Planning de Charge v1.0
        </p>
      </div>
    </div>
  );
}
