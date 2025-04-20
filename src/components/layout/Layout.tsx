
import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { checkSupabaseConnection } from '@/utils/supabase';
import { Wifi, WifiOff } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Vérifier la connexion Supabase au chargement
    const checkConnection = async () => {
      const connected = await checkSupabaseConnection();
      setIsOnline(connected);
    };
    
    checkConnection();
    
    // Vérifier périodiquement la connexion
    const interval = setInterval(checkConnection, 60000); // Vérifier toutes les minutes
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      
      <main className="flex-1 p-4 md:p-6">
        <Header 
          isSidebarOpen={isSidebarOpen} 
          setIsSidebarOpen={setIsSidebarOpen} 
        />
        
        <div className="fixed bottom-4 right-4 z-50">
          {isOnline ? (
            <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center">
              <Wifi className="w-3 h-3 mr-1" />
              <span>En ligne</span>
            </div>
          ) : (
            <div className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full flex items-center">
              <WifiOff className="w-3 h-3 mr-1" />
              <span>Hors ligne</span>
            </div>
          )}
        </div>
        
        <div className="mt-6">
          {children}
        </div>
      </main>
    </div>
  );
}
