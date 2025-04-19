import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Layout } from '@/components/layout/Layout';
import { StatusCode, STATUS_LABELS, STATUS_COLORS } from '@/types';
import { generateId } from '@/utils';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminTabs } from '@/components/admin/AdminTabs';
import { RealtimeMonitor } from '@/components/RealtimeMonitor';
import { checkSupabaseConnection } from '@/utils/supabaseUtils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CloudOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Admin = () => {
  const [data, setData] = useState(() => {
    const savedData = localStorage.getItem('planningData');
    return savedData ? JSON.parse(savedData) : { 
      projects: [], 
      employees: [],
      statuses: [] 
    };
  });
  
  const [isOffline, setIsOffline] = useState(false);
  
  useEffect(() => {
    const checkConnection = async () => {
      const isOnline = await checkSupabaseConnection();
      setIsOffline(!isOnline);
    };
    
    checkConnection();
    
    const interval = setInterval(checkConnection, 60000); // every minute
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    if (!data.statuses || data.statuses.length === 0) {
      const defaultStatuses = Object.entries(STATUS_LABELS)
        .filter(([code]) => code !== '')
        .map(([code, label]) => ({
          id: generateId(),
          code: code as StatusCode,
          label,
          color: STATUS_COLORS[code as StatusCode]
        }));
      
      setData(prevData => ({
        ...prevData,
        statuses: defaultStatuses
      }));
    }
  }, []);
  
  useEffect(() => {
    if (data) {
      const savedData = localStorage.getItem('planningData');
      const fullData = savedData ? JSON.parse(savedData) : {};
      
      localStorage.setItem('planningData', JSON.stringify({
        ...fullData,
        projects: data.projects,
        employees: data.employees,
        statuses: data.statuses
      }));
    }
  }, [data]);
  
  const handleProjectsChange = (projects: any[]) => {
    setData(prevData => ({
      ...prevData,
      projects
    }));
  };
  
  const handleStatusesChange = (statuses: any[]) => {
    setData(prevData => ({
      ...prevData,
      statuses
    }));
  };
  
  const handleEmployeesChange = (employees: any[]) => {
    setData(prevData => ({
      ...prevData,
      employees
    }));
  };
  
  const handleTryReconnect = async () => {
    toast.info("Tentative de reconnexion à la base de données...");
    const isOnline = await checkSupabaseConnection();
    setIsOffline(!isOnline);
  };
  
  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <AdminHeader />
        
        {isOffline && (
          <Alert className="bg-amber-50 border-amber-200">
            <CloudOff className="h-4 w-4" />
            <AlertTitle>Mode Hors-ligne</AlertTitle>
            <AlertDescription className="flex justify-between items-center">
              <span>Vous travaillez actuellement en mode hors-ligne. Les modifications sont enregistrées localement.</span>
              <Button variant="outline" size="sm" onClick={handleTryReconnect} className="ml-4">
                <RefreshCw className="h-4 w-4 mr-2" />
                Réessayer la connexion
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        <RealtimeMonitor />
        
        <AdminTabs 
          projects={data.projects || []}
          employees={data.employees || []}
          statuses={data.statuses || []}
          onProjectsChange={handleProjectsChange}
          onStatusesChange={handleStatusesChange}
          onEmployeesChange={handleEmployeesChange}
        />
      </div>
    </Layout>
  );
};

export default Admin;
