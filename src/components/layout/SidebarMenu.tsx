
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Calendar, Users, BarChart, FileSpreadsheet, Settings, LogIn, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { SidebarMenu as UIMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';

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
      icon: FileSpreadsheet,
      label: 'Export',
      path: '/export',
      adminOnly: true
    },
    {
      icon: Settings,
      label: 'Paramètres',
      path: '/settings',
      adminOnly: true
    },
    {
      icon: Settings,
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
    navigate('/admin-login');
  };
  
  const isActive = (path: string) => {
    if (path.includes('?tab=')) {
      const [pathname, search] = path.split('?');
      return location.pathname === pathname && location.search.includes(search);
    }
    return location.pathname === path;
  };
  
  return (
    <div className="py-4">
      <UIMenu>
        {filteredMenuItems.map((item) => (
          <SidebarMenuItem key={item.path}>
            <SidebarMenuButton
              asChild
              className={cn(
                isActive(item.path)
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/30"
              )}
            >
              <Link to={item.path} className="flex items-center gap-2">
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      
        {/* Séparateur avant boutons d'authentification */}
        <div className="my-2 px-3">
          <div className="h-px bg-sidebar-border/50"></div>
        </div>
        
        {/* Bouton de connexion/déconnexion selon l'état */}
        <SidebarMenuItem>
          <SidebarMenuButton
            onClick={isAuthenticated ? handleLogout : handleLogin}
            className="text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/30"
          >
            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  <LogOut className="h-5 w-5" />
                  <span>Déconnexion</span>
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  <span>Connexion Admin</span>
                </>
              )}
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </UIMenu>
    </div>
  );
}
