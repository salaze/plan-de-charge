
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Calendar, Users, BarChart, Settings, LogIn, LogOut, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface MenuItem {
  icon: React.ElementType;
  label: string;
  path: string;
  adminOnly?: boolean;
}

export function SidebarMenu() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin, isAuthenticated, logout } = useAuth();
  
  const menuItems: MenuItem[] = [
    {
      icon: Calendar,
      label: 'Planning',
      path: '/',
    },
    {
      icon: Users,
      label: 'Employés',
      path: '/employees',
      adminOnly: true
    },
    {
      icon: BarChart,
      label: 'Statistiques',
      path: '/statistics',
      adminOnly: true
    },
    {
      icon: Settings,
      label: 'Paramètres',
      path: '/settings',
      adminOnly: true
    },
    {
      icon: Shield,
      label: 'Administration',
      path: '/admin',
      adminOnly: true
    }
  ];
  
  const filteredMenuItems = menuItems.filter(item => !item.adminOnly || isAdmin);
  
  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Vous avez été déconnecté');
  };
  
  const handleLogin = () => {
    navigate('/login');
  };
  
  return (
    <div className="py-4">
      <ul className="space-y-1">
        {filteredMenuItems.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              className={cn(
                "flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-300",
                location.pathname === item.path
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/30"
              )}
            >
              <item.icon className="mr-2 h-5 w-5" />
              {item.label}
            </Link>
          </li>
        ))}
        
        {/* Séparateur avant boutons d'authentification */}
        <li className="mt-6 mb-2 px-3">
          <div className="h-px bg-sidebar-border/50"></div>
        </li>
        
        {/* Bouton de connexion/déconnexion selon l'état */}
        <li>
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="flex w-full items-center px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-300 text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/30"
            >
              <LogOut className="mr-2 h-5 w-5" />
              Déconnexion
            </button>
          ) : (
            <button
              onClick={handleLogin}
              className="flex w-full items-center px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-300 text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/30"
            >
              <LogIn className="mr-2 h-5 w-5" />
              Connexion Admin
            </button>
          )}
        </li>
      </ul>
    </div>
  );
}
