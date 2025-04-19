import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Layout } from '@/components/layout/Layout';
import { StatusCode, STATUS_LABELS, STATUS_COLORS } from '@/types';
import { generateId } from '@/utils';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminTabs } from '@/components/admin/AdminTabs';
import { RealtimeMonitor } from '@/components/RealtimeMonitor';
import { supabase } from '@/integrations/supabase/client';

const Admin = () => {
  const [data, setData] = useState({
    projects: [], 
    employees: [],
    statuses: []
  });
  
  useEffect(() => {
    const connectToSupabase = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.signInWithPassword({
          email: 'salaze91@gmail.com',
          password: 'Kh19eb87*'
        });

        if (error) {
          console.error('Erreur de connexion:', error.message);
          toast.error('Erreur de connexion à Supabase');
          return;
        }

        if (user) {
          toast.success('Connecté à Supabase avec succès');
        }
      } catch (error) {
        console.error('Erreur inattendue:', error);
        toast.error('Erreur de connexion inattendue');
      }
    };

    connectToSupabase();
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
  
  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <AdminHeader />
        
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
