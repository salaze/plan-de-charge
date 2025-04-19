
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Layout } from '@/components/layout/Layout';
import { StatusCode, STATUS_LABELS, STATUS_COLORS } from '@/types';
import { generateId } from '@/utils';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminTabs } from '@/components/admin/AdminTabs';
import { RealtimeMonitor } from '@/components/RealtimeMonitor';
import { checkSupabaseConnection } from '@/utils/supabaseUtils';

const Admin = () => {
  const [data, setData] = useState(() => {
    const savedData = localStorage.getItem('planningData');
    return savedData ? JSON.parse(savedData) : { 
      projects: [], 
      employees: [],
      statuses: [] 
    };
  });
  
  useEffect(() => {
    const checkConnection = async () => {
      await checkSupabaseConnection();
    };
    
    checkConnection();
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
