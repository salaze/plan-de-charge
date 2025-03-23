
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calendar, Users, BarChart, FileSpreadsheet, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MenuItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

export function SidebarMenu() {
  const location = useLocation();
  
  const menuItems: MenuItem[] = [
    {
      icon: Calendar,
      label: 'Planning',
      path: '/'
    },
    {
      icon: Users,
      label: 'Employés',
      path: '/employees'
    },
    {
      icon: BarChart,
      label: 'Statistiques',
      path: '/statistics'
    },
    {
      icon: FileSpreadsheet,
      label: 'Export',
      path: '/export'
    },
    {
      icon: Settings,
      label: 'Paramètres',
      path: '/settings'
    }
  ];
  
  return (
    <div className="py-4">
      <ul className="space-y-1">
        {menuItems.map((item) => (
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
      </ul>
    </div>
  );
}
